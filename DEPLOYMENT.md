# 🚀 Deployment Guide - MF Distributor App

Is guide mein hum apne app ko **Vercel + Render + PostgreSQL** par deploy karenge (completely FREE!)

---

## 📋 Pre-requisites

1. GitHub account (already done ✅)
2. Vercel account - https://vercel.com/signup
3. Render account - https://render.com/register

---

## 🗄️ Step 1: Database Deploy (Render PostgreSQL)

### 1.1 Create PostgreSQL Database

1. **Render Dashboard** par jao: https://dashboard.render.com
2. Click on **"New +"** → Select **"PostgreSQL"**
3. Fill details:
   - **Name**: `mf-distributor-db`
   - **Database**: `mf_distributor`
   - **User**: `mf_user`
   - **Region**: **Singapore** (India ke sabse paas)
   - **Plan**: **Free** (0GB storage, enough for starting)
4. Click **"Create Database"**
5. **Database URL** copy karo (Internal Database URL) - ye `DATABASE_URL` environment variable mein use karenge

**Important**: Database URL is tarah ka hoga:
```
postgresql://mf_user:password@dpg-xxxxx-singapore-postgres.render.com/mf_distributor
```

---

## 🔧 Step 2: Backend Deploy (Render Web Service)

### 2.1 Create Web Service

1. Render Dashboard → **"New +"** → **"Web Service"**
2. **Connect Repository**:
   - Click **"Connect account"** → Select **GitHub**
   - Select repository: `ps20441/mf-distributor-app`
   - Click **"Connect"**
3. Fill details:
   - **Name**: `mf-distributor-api`
   - **Region**: **Singapore**
   - **Branch**: `claude/testing-mibb6qdq3zloo9od-01ReBnxrmK24ccEm2TuvZ4Fc`
   - **Root Directory**: `backend`
   - **Runtime**: **Node**
   - **Build Command**:
     ```bash
     npm install && npm run build && npx prisma generate && npx prisma migrate deploy
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Plan**: **Free**

### 2.2 Add Environment Variables

**Environment** section mein ye variables add karo:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | *(Step 1.1 se copy kiya hua PostgreSQL URL)* |
| `JWT_SECRET` | *(Random strong password - example: `mf-jwt-secret-2024-xyz-abc-123`)* |
| `JWT_EXPIRES_IN` | `7d` |
| `CORS_ORIGIN` | *(Blank rahne do abhi - baad mein update karenge)* |
| `PORT` | `10000` *(Auto-filled by Render)* |

4. Click **"Create Web Service"**
5. Deployment start hoga - **5-10 minutes** lagenge
6. Deployment complete hone par, **backend URL** milega:
   ```
   https://mf-distributor-api.onrender.com
   ```
7. Test karo browser mein:
   ```
   https://mf-distributor-api.onrender.com/api/health
   ```
   Response milna chahiye:
   ```json
   {
     "status": "OK",
     "message": "MF Distributor API is running!"
   }
   ```

---

## 🎨 Step 3: Frontend Deploy (Vercel)

### 3.1 Deploy to Vercel

1. **Vercel Dashboard** par jao: https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. **Import Git Repository**:
   - Click **"Import"** on `ps20441/mf-distributor-app`
   - Agar repository nahi dikha, to **"Adjust GitHub App Permissions"** click karo
4. **Configure Project**:
   - **Framework Preset**: **Vite** (Auto-detected hoga)
   - **Root Directory**: `frontend` *(Edit karo)*
   - **Build Command**: `npm run build` *(Auto-filled)*
   - **Output Directory**: `dist` *(Auto-filled)*
   - **Install Command**: `npm install` *(Auto-filled)*

### 3.2 Add Environment Variable

**Environment Variables** section mein:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://mf-distributor-api.onrender.com/api` |

*(Step 2.2 se backend URL copy karo aur end mein `/api` add karo)*

5. Click **"Deploy"**
6. Deployment **2-3 minutes** mein complete hoga
7. **Frontend URL** milega:
   ```
   https://mf-distributor-app-xyz.vercel.app
   ```

---

## 🔗 Step 4: Connect Frontend & Backend (CORS Fix)

### 4.1 Update Backend CORS

1. Render Dashboard → **mf-distributor-api** service open karo
2. **Environment** tab mein jao
3. `CORS_ORIGIN` variable edit karo:
   ```
   https://mf-distributor-app-xyz.vercel.app
   ```
   *(Apna actual Vercel URL paste karo)*

4. **Save Changes** → Auto-redeploy hoga (2-3 minutes)

---

## ✅ Step 5: Test Your Deployed App

### 5.1 Create Test User

Backend deployed hone ke baad, ek test user create karna padega. 2 options hain:

**Option A: Render Shell se**
1. Render Dashboard → **mf-distributor-api** service
2. **Shell** tab par jao
3. Run command:
   ```bash
   npx ts-node -e "
   import { PrismaClient } from '@prisma/client';
   import bcrypt from 'bcryptjs';
   const prisma = new PrismaClient();
   const password = await bcrypt.hash('password123', 10);
   await prisma.distributor.create({
     data: {
       name: 'Rajesh Kumar',
       arn: 'ARN-12345',
       mobile: '9876543210',
       email: 'rajesh@example.com',
       password: password
     }
   });
   console.log('User created!');
   "
   ```

**Option B: API Call se (Agar register endpoint enable ho)**
```bash
curl -X POST https://mf-distributor-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rajesh Kumar",
    "arn": "ARN-12345",
    "mobile": "9876543210",
    "email": "rajesh@example.com",
    "password": "password123"
  }'
```

### 5.2 Login Test

1. Apne deployed app ko browser mein kholo:
   ```
   https://mf-distributor-app-xyz.vercel.app
   ```

2. Login karo:
   - **Mobile**: `9876543210`
   - **Password**: `password123`

3. Dashboard dikhai dena chahiye: **"Good Morning, Rajesh Kumar 👋"**

---

## 🎉 Deployment Complete!

Aapka app ab live hai:

- **Frontend**: https://mf-distributor-app-xyz.vercel.app
- **Backend API**: https://mf-distributor-api.onrender.com
- **Database**: PostgreSQL on Render (Singapore)

---

## 📝 Important Notes

### Free Tier Limitations:
- **Render Free Plan**:
  - Backend sleeps after 15 minutes of inactivity
  - First request ke baad 30-60 seconds mein wake up hota hai (slow response)
  - 750 hours/month free (31 days = 744 hours, enough!)
  - Database: 90 days data retention, 1GB storage

- **Vercel Free Plan**:
  - Unlimited bandwidth
  - 100GB bandwidth/month
  - No sleep time (always active)

### Performance Tips:
- Backend ko active rakhne ke liye **Cron Job** setup kar sakte ho (UptimeRobot.com - free)
- Har 10 minute mein health check endpoint hit karo
- Production use ke liye paid plan upgrade karo ($7/month Render)

### Custom Domain:
- Vercel mein free custom domain add kar sakte ho
- Render mein bhi custom domain free hai
- DNS configuration karna padega

---

## 🔧 Troubleshooting

### Problem 1: Backend 503 Error
- **Reason**: Backend so raha hai (15 min inactivity)
- **Solution**: 30 seconds wait karo, phir refresh karo

### Problem 2: CORS Error
- **Check**: `CORS_ORIGIN` environment variable correct hai?
- **Fix**: Render dashboard se exact frontend URL add karo

### Problem 3: Database Connection Error
- **Check**: `DATABASE_URL` environment variable correct hai?
- **Fix**: Render database se **Internal Database URL** copy karo

### Problem 4: Login Not Working
- **Check**: Test user create kiya hai?
- **Fix**: Render Shell se user create karo (Step 5.1)

---

## 🚀 Next Steps

Ab aap ye kar sakte ho:
1. ✅ Apne friends/clients ko link share karo
2. ✅ Mobile se test karo (responsive hai)
3. ✅ More features add karo (Clients, Portfolio, etc.)
4. ✅ Custom domain add karo (optional)
5. ✅ Analytics add karo (Google Analytics - free)

Enjoy your deployed app! 🎊
