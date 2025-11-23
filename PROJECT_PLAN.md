# MF Distributor Mobile App - Complete Project Plan

## Overview
A comprehensive mutual fund distributor app for both new and existing MFDs, handling historical data migration and new transaction processing.

---

## Tech Stack

### Mobile App
- **Framework**: React Native (iOS + Android)
- **Language**: TypeScript
- **State Management**: Redux Toolkit + RTK Query
- **Navigation**: React Navigation v6
- **UI Library**: React Native Paper / NativeBase
- **Forms**: React Hook Form + Yup validation
- **Charts**: Victory Native (for portfolio analytics)
- **Storage**: AsyncStorage + SQLite (offline data)
- **Authentication**: JWT + Biometric

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js + TypeScript
- **Database**: PostgreSQL (main), Redis (cache/sessions)
- **ORM**: Prisma
- **Authentication**: JWT + Passport.js
- **File Upload**: Multer (for CAS upload)
- **Job Queue**: Bull (for background sync)
- **API Documentation**: Swagger/OpenAPI

### Testing Infrastructure
- **Unit Tests**: Jest
- **Component Tests**: React Native Testing Library
- **API Tests**: Supertest
- **E2E Tests**: Detox
- **Code Coverage**: Istanbul/NYC (target: >80%)
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript strict mode

### Third-Party Integrations
- **RTAs**: CAMS API, KFintech API
- **Trading**: BSE Star MF API
- **KYC**: CKYC, eKYC providers
- **Payment Gateway**: Razorpay/PayU (for collection)
- **SMS/Email**: Twilio, SendGrid
- **Document Storage**: AWS S3 / Cloudinary
- **Analytics**: Firebase Analytics

---

## Core Modules

### 1. Authentication & User Management
**Features:**
- Distributor registration with EUIN/ARN verification
- Multi-factor authentication (OTP + Biometric)
- Role-based access (Admin, Sub-broker, Employee)
- Profile management
- Password reset/recovery

**Tests Required:**
- ✅ Unit tests for auth services
- ✅ API endpoint tests
- ✅ Component tests for login/register screens
- ✅ Security tests (token validation, session management)

---

### 2. Old Data Migration Module ⭐ Critical

#### 2.1 ARN-Based Data Sync
**Workflow:**
```
Step 1: MFD Onboarding
├── Collect ARN number + RTA credentials
├── Verify with AMFI database
└── Store securely (encrypted)

Step 2: Initial Data Sync
├── Call CAMS API: Get all transactions by ARN
├── Call KFintech API: Get all transactions by ARN
├── Merge and deduplicate data
├── Extract unique investors (PAN-based)
├── Import portfolios with current holdings
└── Calculate historical commissions

Step 3: Incremental Sync (Daily/Weekly)
├── Fetch new transactions since last sync
├── Update portfolio holdings
├── Sync commission data
└── Handle corporate actions (dividends, bonus)
```

**API Endpoints:**
- `POST /api/sync/initiate` - Start initial sync
- `GET /api/sync/status/:jobId` - Check sync progress
- `POST /api/sync/incremental` - Daily sync
- `GET /api/sync/history` - View sync logs

**Tests Required:**
- ✅ RTA API integration tests (mocked)
- ✅ Data transformation tests
- ✅ Deduplication logic tests
- ✅ Error handling (API failures, timeouts)
- ✅ Data integrity tests

#### 2.2 CAS Upload (Fallback)
**Features:**
- Upload password-protected PDF
- Parse CAMS/KFintech CAS format
- Extract transactions, holdings, folios
- Map to existing clients or create new

**Tests Required:**
- ✅ PDF parsing tests
- ✅ Data extraction accuracy tests
- ✅ Edge case handling (corrupted files)

---

### 3. Client/Investor Management

**Features:**
- Add new clients with KYC details
- Import clients from synced data
- PAN verification via NSDL
- KYC status tracking (CKYC integration)
- Client categorization (Active, Dormant, etc.)
- Family linking
- Nominee management

**Database Schema:**
```typescript
Client {
  id: UUID
  pan: String (unique)
  name: String
  email: String
  mobile: String
  kycStatus: Enum (Pending, Verified, Rejected)
  ckyc: String
  distributor: Relation
  folios: Relation[]
  createdAt: DateTime
  importedFrom: Enum (Manual, CAMS, KFintech, CAS)
}
```

**Tests Required:**
- ✅ CRUD operation tests
- ✅ PAN validation tests
- ✅ Duplicate detection tests
- ✅ KYC verification workflow tests
- ✅ Search and filter tests

---

### 4. Portfolio Management

**Features:**
- Real-time holdings view
- Fund-wise breakup
- Asset allocation (Equity, Debt, Hybrid)
- Current value vs Invested value
- XIRR calculation
- Gain/Loss tracking
- Portfolio rebalancing suggestions

**Database Schema:**
```typescript
Portfolio {
  id: UUID
  client: Relation
  scheme: Relation
  folio: String
  units: Decimal
  avgNav: Decimal
  currentNav: Decimal
  investedValue: Decimal
  currentValue: Decimal
  lastUpdated: DateTime
}

Transaction {
  id: UUID
  client: Relation
  scheme: Relation
  type: Enum (Purchase, Redemption, Switch, Dividend)
  units: Decimal
  nav: Decimal
  amount: Decimal
  date: DateTime
  source: Enum (BSE, CAMS, KFintech, Manual)
}
```

**Tests Required:**
- ✅ XIRR calculation accuracy tests
- ✅ Portfolio aggregation tests
- ✅ NAV update tests
- ✅ Performance analytics tests

---

### 5. Transaction Processing (New Transactions)

**BSE Star MF Integration:**
```
Order Flow:
1. Client selects scheme →
2. Choose SIP/Lumpsum →
3. Payment mandate setup →
4. Submit to BSE →
5. Track order status →
6. Confirmation + Allotment
```

**Features:**
- SIP creation with mandate
- Lumpsum purchase
- Redemption (partial/full)
- Switch between schemes
- STP (Systematic Transfer Plan)
- SWP (Systematic Withdrawal Plan)
- Order tracking dashboard

**API Endpoints:**
- `POST /api/orders/sip` - Create SIP
- `POST /api/orders/lumpsum` - Place lumpsum order
- `POST /api/orders/redeem` - Redemption request
- `GET /api/orders/:id/status` - Track order
- `POST /api/orders/:id/cancel` - Cancel pending order

**Tests Required:**
- ✅ Order creation validation tests
- ✅ BSE API integration tests (mocked)
- ✅ Order status tracking tests
- ✅ Payment mandate tests
- ✅ Error handling and retry logic tests

---

### 6. Commission Tracking

**Features:**
- Commission slab configuration
- Auto-calculate commissions on transactions
- Monthly commission reports
- Payout status tracking
- Trail commission tracking
- Commission forecasting

**Database Schema:**
```typescript
Commission {
  id: UUID
  distributor: Relation
  transaction: Relation
  type: Enum (Upfront, Trail)
  rate: Decimal
  amount: Decimal
  status: Enum (Expected, Received, Pending)
  payoutDate: DateTime
}
```

**Tests Required:**
- ✅ Commission calculation tests
- ✅ Trail commission logic tests
- ✅ Report generation tests
- ✅ Payout tracking tests

---

### 7. Reports & Analytics

**Features:**
- AUM dashboard
- Client-wise AUM
- Scheme-wise analysis
- Transaction reports (date range)
- Commission reports
- Business growth analytics
- Tax reports (capital gains)

**Tests Required:**
- ✅ Report data accuracy tests
- ✅ Date range filter tests
- ✅ Export functionality tests (PDF/Excel)
- ✅ Performance tests (large datasets)

---

### 8. Fund Research & Discovery

**Features:**
- Browse 2000+ MF schemes
- Category-wise filters
- NAV history and charts
- Fund factsheet
- Compare schemes
- Star ratings integration
- Recommendations engine

**Tests Required:**
- ✅ Search and filter tests
- ✅ Comparison logic tests
- ✅ Data refresh tests

---

## Database Schema Overview

```prisma
// Key Models

model Distributor {
  id String @id @default(uuid())
  name String
  arn String @unique
  euin String?
  mobile String
  email String
  clients Client[]
  commissions Commission[]
  syncJobs SyncJob[]
}

model Client {
  id String @id @default(uuid())
  pan String @unique
  name String
  email String
  mobile String
  kycStatus KYCStatus
  distributor Distributor @relation(fields: [distributorId])
  portfolios Portfolio[]
  transactions Transaction[]
}

model Scheme {
  id String @id @default(uuid())
  amcCode String
  schemeCode String @unique
  schemeName String
  category String
  nav Decimal
  navDate DateTime
  aum Decimal
}

model Portfolio {
  id String @id @default(uuid())
  client Client @relation(fields: [clientId])
  scheme Scheme @relation(fields: [schemeId])
  folio String
  units Decimal
  investedValue Decimal
  currentValue Decimal
}

model Transaction {
  id String @id @default(uuid())
  client Client @relation(fields: [clientId])
  scheme Scheme @relation(fields: [schemeId])
  type TransactionType
  units Decimal
  nav Decimal
  amount Decimal
  date DateTime
  source TransactionSource
}

model SyncJob {
  id String @id @default(uuid())
  distributor Distributor @relation(fields: [distributorId])
  status JobStatus
  type SyncType
  startedAt DateTime
  completedAt DateTime?
  recordsProcessed Int
  errors Json?
}
```

---

## API Architecture

### Base URL Structure
```
/api/v1
├── /auth (Authentication)
├── /distributors (Distributor management)
├── /clients (Client CRUD)
├── /portfolios (Portfolio views)
├── /transactions (Transaction history)
├── /orders (New order placement)
├── /schemes (MF scheme master)
├── /sync (Data synchronization)
├── /commissions (Commission tracking)
├── /reports (Analytics & reports)
└── /kyc (KYC verification)
```

---

## Testing Strategy

### 1. Unit Tests (Target: 85%+ coverage)
**Scope:**
- All utility functions
- Data transformation logic
- Calculation functions (XIRR, commissions)
- Validation schemas
- Business logic services

**Example:**
```typescript
// tests/utils/xirr.test.ts
describe('XIRR Calculation', () => {
  test('should calculate correct XIRR for SIP', () => {
    const transactions = [
      { date: '2023-01-01', amount: -10000 },
      { date: '2023-02-01', amount: -10000 },
      { date: '2023-12-01', amount: 25000 } // redemption
    ];
    const xirr = calculateXIRR(transactions);
    expect(xirr).toBeCloseTo(12.5, 1);
  });
});
```

### 2. Integration Tests (API Layer)
**Scope:**
- All API endpoints
- Database operations
- Third-party API integrations (mocked)
- Authentication flows
- Error handling

**Example:**
```typescript
// tests/api/clients.test.ts
describe('POST /api/clients', () => {
  test('should create new client with valid data', async () => {
    const response = await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${token}`)
      .send({
        pan: 'ABCDE1234F',
        name: 'John Doe',
        mobile: '9876543210'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  test('should reject duplicate PAN', async () => {
    // ... test duplicate PAN
  });
});
```

### 3. Component Tests (Mobile UI)
**Scope:**
- All React Native screens
- Reusable components
- User interactions
- Navigation flows
- Form validations

**Example:**
```typescript
// tests/screens/ClientList.test.tsx
describe('ClientList Screen', () => {
  test('should render client list', async () => {
    const { getByText } = render(<ClientList />);

    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
    });
  });

  test('should navigate to client detail on tap', () => {
    // ... test navigation
  });
});
```

### 4. E2E Tests (Critical Flows)
**Scope:**
- Complete user journeys
- Login → Create client → Place order → View portfolio
- Data sync flows
- Payment flows

**Example:**
```typescript
// e2e/orderPlacement.e2e.ts
describe('Order Placement Flow', () => {
  test('should complete SIP order placement', async () => {
    await element(by.id('login-button')).tap();
    // ... complete flow
    await expect(element(by.text('Order Placed Successfully'))).toBeVisible();
  });
});
```

### 5. Performance Tests
- Load testing (concurrent users)
- Database query optimization
- API response times
- Mobile app startup time
- Large dataset handling (10k+ transactions)

---

## Security Considerations

### Tests Required:
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ CSRF token validation
- ✅ JWT token expiry and refresh
- ✅ Rate limiting tests
- ✅ Sensitive data encryption tests
- ✅ PAN/Aadhaar masking tests
- ✅ Secure file upload tests

---

## Project Structure

```
mf-distributor-app/
├── mobile/                      # React Native app
│   ├── android/
│   ├── ios/
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── screens/            # App screens
│   │   ├── navigation/         # Navigation config
│   │   ├── services/           # API clients
│   │   ├── store/              # Redux store
│   │   ├── utils/              # Helper functions
│   │   └── types/              # TypeScript types
│   ├── __tests__/              # Component tests
│   ├── e2e/                    # E2E tests
│   └── package.json
│
├── backend/                     # Node.js API
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── services/           # Business logic
│   │   ├── models/             # Database models
│   │   ├── middleware/         # Express middleware
│   │   ├── integrations/       # Third-party APIs
│   │   │   ├── cams/
│   │   │   ├── kfintech/
│   │   │   └── bse/
│   │   ├── utils/              # Helpers
│   │   └── app.ts
│   ├── tests/                  # API tests
│   ├── prisma/                 # Database schema
│   └── package.json
│
├── shared/                      # Shared types/utils
│   └── types/
│
└── docs/                        # Documentation
    ├── API.md
    ├── DEPLOYMENT.md
    └── RTA_INTEGRATION.md
```

---

## Development Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Project setup (React Native + Backend)
- [ ] Database schema design
- [ ] Authentication module
- [ ] Basic UI components
- [ ] Test infrastructure setup

### Phase 2: Data Migration (Week 3-4) ⭐
- [ ] RTA API integration (CAMS/KFintech)
- [ ] ARN-based data sync
- [ ] CAS upload and parsing
- [ ] Data deduplication logic
- [ ] Comprehensive sync tests

### Phase 3: Client & Portfolio (Week 5-6)
- [ ] Client management module
- [ ] Portfolio display
- [ ] KYC integration
- [ ] Analytics dashboard

### Phase 4: Transaction Processing (Week 7-8)
- [ ] BSE Star MF integration
- [ ] Order placement (SIP/Lumpsum/Redemption)
- [ ] Payment mandate setup
- [ ] Order tracking

### Phase 5: Commission & Reports (Week 9-10)
- [ ] Commission calculation engine
- [ ] Report generation
- [ ] Export functionality

### Phase 6: Testing & Refinement (Week 11-12)
- [ ] Comprehensive test suite completion
- [ ] Performance optimization
- [ ] Security audit
- [ ] UAT with actual MFDs

---

## Test Coverage Goals

| Module | Unit Tests | Integration Tests | E2E Tests | Target Coverage |
|--------|------------|-------------------|-----------|-----------------|
| Authentication | ✅ | ✅ | ✅ | 90%+ |
| Data Sync | ✅ | ✅ | ✅ | 85%+ |
| Client Management | ✅ | ✅ | ✅ | 85%+ |
| Portfolio | ✅ | ✅ | ⚠️ | 80%+ |
| Transactions | ✅ | ✅ | ✅ | 90%+ |
| Commission | ✅ | ✅ | ⚠️ | 80%+ |
| Reports | ✅ | ⚠️ | ⚠️ | 75%+ |
| Overall | - | - | - | **>80%** |

✅ = Critical
⚠️ = Important

---

## API Access Requirements

To build this app, you'll need:

1. **CAMS API Access**
   - Contact: CAMS RTU
   - Cost: Setup + Monthly charges
   - Provides: Transaction history, holdings by ARN

2. **KFintech API Access**
   - Similar to CAMS
   - Alternative RTA

3. **BSE Star MF Membership**
   - Cost: ~₹1-2 lakhs setup + annual fees
   - Required for: Order execution
   - Process: 2-3 months approval

4. **NSDL/CDSL (for KYC)**
   - CKYC verification
   - PAN verification

5. **Payment Gateway**
   - Razorpay/PayU
   - For payment collection

---

## Next Steps

**Immediate Actions:**
1. ✅ Confirm tech stack (React Native approved)
2. ❓ Do you have ARN number? (required for RTA integration)
3. ❓ Do you have BSE Star MF access? (or planning to get)
4. ❓ Budget for third-party API costs?
5. ❓ Timeline expectations?

**Shall I proceed with building the app starting with:**
- React Native project setup
- Backend API setup
- Database schema implementation
- Mock RTA integrations (we'll replace with real APIs later)
- Comprehensive test coverage from day 1

