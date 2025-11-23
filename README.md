# 💼 MF Distributor App

Modern web application for Mutual Fund Distributors (MFDs) to manage clients, portfolios, and commissions.

## 🚀 Live Demo

- **Frontend**: Deploy on Vercel (see DEPLOYMENT.md)
- **Backend API**: Deploy on Render (see DEPLOYMENT.md)
- **Database**: PostgreSQL on Render

## 🏗️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (Build tool)
- Tailwind CSS
- React Router v6
- Axios

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcrypt

## 📦 Project Structure

```
mf-distributor-app/
├── frontend/           # React frontend
│   ├── src/
│   │   ├── pages/     # Login, Dashboard, etc.
│   │   ├── services/  # API services
│   │   └── App.tsx
│   └── package.json
├── backend/            # Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
└── DEPLOYMENT.md      # Deployment guide
```

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- npm/yarn

### Setup

1. **Clone repository**
   ```bash
   git clone <repo-url>
   cd mf-distributor-app
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env file with your settings
   npx prisma migrate dev
   npm run dev
   ```
   Backend runs on: http://localhost:3000

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   # Create .env file
   echo "VITE_API_URL=http://localhost:3000/api" > .env
   npm run dev
   ```
   Frontend runs on: http://localhost:5173

4. **Create Test User**
   ```bash
   cd backend
   # Use Prisma Studio
   npx prisma studio
   # Or run a seed script
   ```

## 📚 Features

### Current Features (v1.0)
- ✅ User Authentication (JWT)
- ✅ Login/Logout
- ✅ Dashboard
- ✅ Protected Routes

### Planned Features
- 📋 Client Management (CRUD)
- 📊 Portfolio Tracking
- 💰 Commission Tracking
- 📈 Transaction History
- 🔄 RTA Data Sync (CAMS/KFintech)
- 📱 BSE Star MF Integration
- 📄 CAS Upload
- 📊 Reports & Analytics

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy:**
- Frontend: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
- Backend: [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com)

## 🔐 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/mf_distributor"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"
```

## 📖 API Documentation

### Authentication
- `POST /api/auth/register` - Register new distributor
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile (protected)

### Clients
- `GET /api/clients` - Get all clients (protected)
- `GET /api/clients/:id` - Get client by ID (protected)
- `POST /api/clients` - Create client (protected)
- `PUT /api/clients/:id` - Update client (protected)
- `DELETE /api/clients/:id` - Delete client (protected)

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📄 License

MIT

## 👥 Contributors

- Your Name

## 🙏 Acknowledgments

Built for Indian Mutual Fund Distributors (MFDs) to digitize their business.
