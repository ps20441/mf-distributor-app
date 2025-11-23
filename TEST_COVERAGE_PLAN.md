# Comprehensive Test Coverage Plan
## MF Distributor Mobile App

---

## Testing Philosophy

> **"Test the behavior, not the implementation"**

### Key Principles
1. **High Coverage, High Confidence**: Target >80% overall coverage
2. **Test Pyramid**: More unit tests, fewer E2E tests
3. **Fast Feedback**: Tests should run quickly in CI/CD
4. **Realistic Scenarios**: Test with production-like data
5. **Security First**: Dedicated security and penetration tests

---

## Test Pyramid Structure

```
                    ┌─────────────┐
                    │   E2E Tests │  (~5%)
                    │   ~50 tests │
                ┌───┴─────────────┴───┐
                │ Integration Tests   │  (~15%)
                │    ~200 tests       │
            ┌───┴─────────────────────┴───┐
            │      Unit Tests             │  (~80%)
            │      ~1000 tests            │
            └─────────────────────────────┘
```

---

## 1. Unit Tests (Target: 85%+ Coverage)

### 1.1 Business Logic & Utilities

#### XIRR Calculation
```typescript
// tests/utils/xirr.test.ts
describe('XIRR Calculation', () => {
  test('should calculate correct XIRR for SIP', () => {
    const cashflows = [
      { date: new Date('2023-01-01'), amount: -10000 },
      { date: new Date('2023-02-01'), amount: -10000 },
      { date: new Date('2023-03-01'), amount: -10000 },
      { date: new Date('2023-12-01'), amount: 135000 }
    ];

    const xirr = calculateXIRR(cashflows);
    expect(xirr).toBeCloseTo(0.425, 2); // ~42.5% return
  });

  test('should handle negative returns', () => {
    const cashflows = [
      { date: new Date('2023-01-01'), amount: -100000 },
      { date: new Date('2023-12-01'), amount: 80000 }
    ];

    const xirr = calculateXIRR(cashflows);
    expect(xirr).toBeLessThan(0);
  });

  test('should throw error for invalid cashflows', () => {
    expect(() => calculateXIRR([])).toThrow('Insufficient cashflows');
  });
});
```

#### Commission Calculation
```typescript
// tests/services/commission.test.ts
describe('Commission Calculation Service', () => {
  test('should calculate upfront commission correctly', () => {
    const transaction = {
      type: 'LUMPSUM',
      amount: 100000,
      scheme: { category: 'EQUITY' }
    };

    const commission = calculateCommission(transaction, {
      upfrontRate: 1.0 // 1%
    });

    expect(commission.amount).toBe(1000);
    expect(commission.type).toBe('UPFRONT');
  });

  test('should calculate trail commission for SIP', () => {
    const sip = {
      monthlyAmount: 10000,
      tenure: 12,
      scheme: { category: 'EQUITY' }
    };

    const trailCommission = calculateTrailCommission(sip, {
      trailRate: 0.5 // 0.5% annual
    });

    expect(trailCommission.annualAmount).toBe(600);
  });

  test('should apply different rates for debt funds', () => {
    const transaction = {
      type: 'LUMPSUM',
      amount: 100000,
      scheme: { category: 'DEBT' }
    };

    const commission = calculateCommission(transaction, {
      equityRate: 1.0,
      debtRate: 0.5
    });

    expect(commission.amount).toBe(500);
  });
});
```

#### Portfolio Valuation
```typescript
// tests/services/portfolio.test.ts
describe('Portfolio Valuation Service', () => {
  test('should calculate total portfolio value', () => {
    const holdings = [
      { scheme: 'Fund A', units: 100, currentNav: 50 },
      { scheme: 'Fund B', units: 200, currentNav: 75 }
    ];

    const totalValue = calculatePortfolioValue(holdings);
    expect(totalValue).toBe(20000); // 5000 + 15000
  });

  test('should calculate gains/losses', () => {
    const holding = {
      units: 100,
      avgNav: 40,
      currentNav: 50
    };

    const { gain, gainPercent } = calculateGainLoss(holding);
    expect(gain).toBe(1000); // (50-40) * 100
    expect(gainPercent).toBe(25); // 25% gain
  });

  test('should handle zero units edge case', () => {
    const holding = { units: 0, avgNav: 40, currentNav: 50 };
    const { gain, gainPercent } = calculateGainLoss(holding);
    expect(gain).toBe(0);
    expect(gainPercent).toBe(0);
  });
});
```

### 1.2 Data Validation & Sanitization

#### PAN Validation
```typescript
// tests/validators/pan.test.ts
describe('PAN Validation', () => {
  test('should validate correct PAN format', () => {
    expect(isValidPAN('ABCDE1234F')).toBe(true);
    expect(isValidPAN('ZYXWV9876A')).toBe(true);
  });

  test('should reject invalid PAN', () => {
    expect(isValidPAN('ABC123')).toBe(false);
    expect(isValidPAN('abcde1234f')).toBe(false); // lowercase
    expect(isValidPAN('12345ABCDE')).toBe(false); // wrong format
  });

  test('should sanitize PAN input', () => {
    expect(sanitizePAN('  abcde1234f  ')).toBe('ABCDE1234F');
  });
});
```

#### Mobile Number Validation
```typescript
// tests/validators/mobile.test.ts
describe('Mobile Validation', () => {
  test('should validate Indian mobile numbers', () => {
    expect(isValidMobile('9876543210')).toBe(true);
    expect(isValidMobile('+919876543210')).toBe(true);
  });

  test('should reject invalid numbers', () => {
    expect(isValidMobile('123456')).toBe(false);
    expect(isValidMobile('1234567890')).toBe(false); // doesn't start with 6-9
  });

  test('should format mobile number', () => {
    expect(formatMobile('9876543210')).toBe('+91-9876543210');
  });
});
```

### 1.3 Data Transformation

#### RTA Data Parser
```typescript
// tests/parsers/rtaData.test.ts
describe('RTA Data Parser', () => {
  test('should parse CAMS transaction data', () => {
    const rawData = {
      FOLIO: '12345678',
      PAN: 'ABCDE1234F',
      NAME: 'RAJESH KUMAR',
      SCHEME: 'HDFC Equity Fund - Growth',
      TRXN_TYPE: 'Purchase',
      UNITS: '150.234',
      NAV: '665.50',
      AMOUNT: '100000.00',
      TRXN_DATE: '15-Jan-2023'
    };

    const parsed = parseCAMSTransaction(rawData);

    expect(parsed).toEqual({
      folio: '12345678',
      pan: 'ABCDE1234F',
      investorName: 'Rajesh Kumar',
      scheme: 'HDFC Equity Fund - Growth',
      transactionType: 'PURCHASE',
      units: 150.234,
      nav: 665.50,
      amount: 100000,
      date: new Date('2023-01-15')
    });
  });

  test('should handle redemption transactions', () => {
    const rawData = {
      TRXN_TYPE: 'Redemption',
      UNITS: '-100.500',
      AMOUNT: '75000.00'
    };

    const parsed = parseCAMSTransaction(rawData);
    expect(parsed.transactionType).toBe('REDEMPTION');
    expect(parsed.units).toBe(-100.500);
  });

  test('should handle dividend transactions', () => {
    const rawData = {
      TRXN_TYPE: 'Dividend Payout',
      AMOUNT: '5000.00'
    };

    const parsed = parseCAMSTransaction(rawData);
    expect(parsed.transactionType).toBe('DIVIDEND');
  });
});
```

#### Deduplication Logic
```typescript
// tests/services/deduplication.test.ts
describe('Transaction Deduplication', () => {
  test('should identify duplicate transactions', () => {
    const transactions = [
      {
        pan: 'ABCDE1234F',
        folio: '12345',
        date: '2023-01-15',
        amount: 10000,
        source: 'CAMS'
      },
      {
        pan: 'ABCDE1234F',
        folio: '12345',
        date: '2023-01-15',
        amount: 10000,
        source: 'KFINTECH'
      }
    ];

    const deduplicated = deduplicateTransactions(transactions);
    expect(deduplicated).toHaveLength(1);
    expect(deduplicated[0].source).toBe('CAMS'); // CAMS takes priority
  });

  test('should keep unique transactions', () => {
    const transactions = [
      { pan: 'ABCDE1234F', date: '2023-01-15', amount: 10000 },
      { pan: 'ABCDE1234F', date: '2023-02-15', amount: 10000 } // different date
    ];

    const deduplicated = deduplicateTransactions(transactions);
    expect(deduplicated).toHaveLength(2);
  });
});
```

---

## 2. Integration Tests (Target: 80%+ Coverage)

### 2.1 API Endpoint Tests

#### Authentication Endpoints
```typescript
// tests/api/auth.test.ts
import request from 'supertest';
import app from '../src/app';

describe('POST /api/auth/register', () => {
  test('should register new distributor', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Rajesh Kumar',
        arn: 'ARN-12345',
        mobile: '9876543210',
        email: 'rajesh@example.com',
        password: 'SecurePass123!'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toMatchObject({
      name: 'Rajesh Kumar',
      arn: 'ARN-12345'
    });
  });

  test('should reject duplicate ARN', async () => {
    await createTestDistributor({ arn: 'ARN-12345' });

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Another User',
        arn: 'ARN-12345', // duplicate
        mobile: '9999999999',
        password: 'Pass123!'
      });

    expect(response.status).toBe(409);
    expect(response.body.error).toContain('ARN already registered');
  });

  test('should validate ARN format', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        arn: 'INVALID',
        mobile: '9876543210',
        password: 'Pass123!'
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toContainEqual(
      expect.objectContaining({ field: 'arn' })
    );
  });
});

describe('POST /api/auth/login', () => {
  test('should login with valid credentials', async () => {
    const user = await createTestDistributor({
      mobile: '9876543210',
      password: 'Pass123!'
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        mobile: '9876543210',
        password: 'Pass123!'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  test('should reject invalid password', async () => {
    await createTestDistributor({
      mobile: '9876543210',
      password: 'Pass123!'
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        mobile: '9876543210',
        password: 'WrongPassword'
      });

    expect(response.status).toBe(401);
  });

  test('should implement rate limiting', async () => {
    const requests = Array(6).fill(null).map(() =>
      request(app).post('/api/auth/login').send({
        mobile: '9999999999',
        password: 'anything'
      })
    );

    const responses = await Promise.all(requests);
    const lastResponse = responses[responses.length - 1];

    expect(lastResponse.status).toBe(429); // Too many requests
  });
});
```

#### Client Management Endpoints
```typescript
// tests/api/clients.test.ts
describe('Client API', () => {
  let authToken: string;

  beforeEach(async () => {
    const distributor = await createTestDistributor();
    authToken = generateToken(distributor);
  });

  describe('POST /api/clients', () => {
    test('should create new client', async () => {
      const response = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          pan: 'ABCDE1234F',
          name: 'Priya Sharma',
          mobile: '9876543210',
          email: 'priya@example.com'
        });

      expect(response.status).toBe(201);
      expect(response.body.client).toMatchObject({
        pan: 'ABCDE1234F',
        name: 'Priya Sharma'
      });
    });

    test('should reject duplicate PAN', async () => {
      await createTestClient({ pan: 'ABCDE1234F' });

      const response = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          pan: 'ABCDE1234F',
          name: 'Another Person',
          mobile: '9999999999'
        });

      expect(response.status).toBe(409);
    });

    test('should sanitize input data', async () => {
      const response = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          pan: '  abcde1234f  ', // lowercase, spaces
          name: 'Priya Sharma',
          mobile: '  9876543210  '
        });

      expect(response.status).toBe(201);
      expect(response.body.client.pan).toBe('ABCDE1234F');
    });
  });

  describe('GET /api/clients', () => {
    test('should list all clients for distributor', async () => {
      await createTestClient({ name: 'Client 1' });
      await createTestClient({ name: 'Client 2' });

      const response = await request(app)
        .get('/api/clients')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.clients).toHaveLength(2);
    });

    test('should support pagination', async () => {
      // Create 25 clients
      for (let i = 0; i < 25; i++) {
        await createTestClient({ pan: `ABCDE${i.toString().padStart(4, '0')}F` });
      }

      const response = await request(app)
        .get('/api/clients?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.clients).toHaveLength(10);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 10,
        total: 25,
        pages: 3
      });
    });

    test('should support search by name', async () => {
      await createTestClient({ name: 'Rajesh Kumar' });
      await createTestClient({ name: 'Priya Sharma' });

      const response = await request(app)
        .get('/api/clients?search=Rajesh')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.clients).toHaveLength(1);
      expect(response.body.clients[0].name).toBe('Rajesh Kumar');
    });
  });

  describe('GET /api/clients/:id', () => {
    test('should get client details', async () => {
      const client = await createTestClient();

      const response = await request(app)
        .get(`/api/clients/${client.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.client.id).toBe(client.id);
    });

    test('should not allow access to other distributor\'s clients', async () => {
      const otherDistributor = await createTestDistributor({ arn: 'ARN-99999' });
      const otherClient = await createTestClient({ distributorId: otherDistributor.id });

      const response = await request(app)
        .get(`/api/clients/${otherClient.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });
  });
});
```

#### Data Sync Endpoints
```typescript
// tests/api/sync.test.ts
describe('Data Sync API', () => {
  describe('POST /api/sync/initiate', () => {
    test('should start initial sync', async () => {
      mockCAMSAPI.mockResolvedValue(mockCAMSData);
      mockKFinTechAPI.mockResolvedValue(mockKFinTechData);

      const response = await request(app)
        .post('/api/sync/initiate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          arn: 'ARN-12345'
        });

      expect(response.status).toBe(202); // Accepted
      expect(response.body).toHaveProperty('jobId');
      expect(response.body.status).toBe('QUEUED');
    });

    test('should validate ARN before syncing', async () => {
      mockAMFIValidation.mockResolvedValue({ valid: false });

      const response = await request(app)
        .post('/api/sync/initiate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          arn: 'ARN-INVALID'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid ARN');
    });
  });

  describe('GET /api/sync/status/:jobId', () => {
    test('should return sync job status', async () => {
      const job = await createTestSyncJob({ status: 'IN_PROGRESS' });

      const response = await request(app)
        .get(`/api/sync/status/${job.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        jobId: job.id,
        status: 'IN_PROGRESS',
        processedRecords: expect.any(Number),
        totalRecords: expect.any(Number)
      });
    });
  });
});
```

### 2.2 Database Tests

```typescript
// tests/database/client.test.ts
describe('Client Database Operations', () => {
  test('should create client with relationships', async () => {
    const distributor = await createTestDistributor();

    const client = await db.client.create({
      data: {
        pan: 'ABCDE1234F',
        name: 'Test Client',
        distributorId: distributor.id
      }
    });

    expect(client).toHaveProperty('id');
    expect(client.distributorId).toBe(distributor.id);
  });

  test('should enforce unique PAN constraint', async () => {
    await db.client.create({
      data: { pan: 'ABCDE1234F', name: 'Client 1' }
    });

    await expect(
      db.client.create({
        data: { pan: 'ABCDE1234F', name: 'Client 2' }
      })
    ).rejects.toThrow();
  });

  test('should cascade delete portfolios when client deleted', async () => {
    const client = await createTestClient();
    await createTestPortfolio({ clientId: client.id });

    await db.client.delete({ where: { id: client.id } });

    const portfolios = await db.portfolio.findMany({
      where: { clientId: client.id }
    });

    expect(portfolios).toHaveLength(0);
  });
});
```

---

## 3. Component Tests (Mobile UI)

### 3.1 Screen Tests

```typescript
// mobile/__tests__/screens/ClientList.test.tsx
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import ClientListScreen from '../../src/screens/ClientListScreen';

describe('ClientListScreen', () => {
  test('should render client list', async () => {
    const mockClients = [
      { id: '1', name: 'Rajesh Kumar', pan: 'ABCDE1234F' },
      { id: '2', name: 'Priya Sharma', pan: 'ZYXWV9876A' }
    ];

    mockAPIResponse('/api/clients', mockClients);

    const { getByText } = render(<ClientListScreen />);

    await waitFor(() => {
      expect(getByText('Rajesh Kumar')).toBeTruthy();
      expect(getByText('Priya Sharma')).toBeTruthy();
    });
  });

  test('should show loading state', () => {
    const { getByTestId } = render(<ClientListScreen />);
    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  test('should handle empty state', async () => {
    mockAPIResponse('/api/clients', []);

    const { getByText } = render(<ClientListScreen />);

    await waitFor(() => {
      expect(getByText('No clients found')).toBeTruthy();
    });
  });

  test('should navigate to client detail on tap', async () => {
    const mockNavigate = jest.fn();
    const mockClients = [{ id: '1', name: 'Rajesh Kumar' }];

    mockAPIResponse('/api/clients', mockClients);

    const { getByText } = render(
      <ClientListScreen navigation={{ navigate: mockNavigate }} />
    );

    await waitFor(() => {
      fireEvent.press(getByText('Rajesh Kumar'));
    });

    expect(mockNavigate).toHaveBeenCalledWith('ClientDetail', { clientId: '1' });
  });

  test('should support pull-to-refresh', async () => {
    const { getByTestId } = render(<ClientListScreen />);

    const flatList = getByTestId('client-list');
    fireEvent(flatList, 'refresh');

    // Verify API called again
    expect(mockAPICall).toHaveBeenCalledTimes(2);
  });
});
```

### 3.2 Component Tests

```typescript
// mobile/__tests__/components/PortfolioCard.test.tsx
describe('PortfolioCard', () => {
  test('should display portfolio details', () => {
    const portfolio = {
      schemeName: 'HDFC Equity Fund',
      units: 100.5,
      currentValue: 75000,
      investedValue: 50000,
      gain: 25000,
      gainPercent: 50
    };

    const { getByText } = render(<PortfolioCard portfolio={portfolio} />);

    expect(getByText('HDFC Equity Fund')).toBeTruthy();
    expect(getByText('₹75,000')).toBeTruthy();
    expect(getByText('+₹25,000 (+50.00%)')).toBeTruthy();
  });

  test('should show negative returns in red', () => {
    const portfolio = {
      gain: -10000,
      gainPercent: -20
    };

    const { getByText } = render(<PortfolioCard portfolio={portfolio} />);

    const gainText = getByText('-₹10,000 (-20.00%)');
    expect(gainText.props.style).toContainEqual({ color: 'red' });
  });
});
```

---

## 4. E2E Tests (Critical User Journeys)

```typescript
// mobile/e2e/orderPlacement.e2e.ts
describe('Complete Order Placement Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  test('should place SIP order successfully', async () => {
    // Login
    await element(by.id('mobile-input')).typeText('9876543210');
    await element(by.id('password-input')).typeText('Pass123!');
    await element(by.id('login-button')).tap();

    // Navigate to client
    await waitFor(element(by.text('Rajesh Kumar')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.text('Rajesh Kumar')).tap();

    // Start new SIP
    await element(by.id('new-sip-button')).tap();

    // Select scheme
    await element(by.id('scheme-search')).typeText('HDFC Equity');
    await element(by.text('HDFC Equity Fund - Growth')).tap();

    // Enter SIP details
    await element(by.id('sip-amount-input')).typeText('5000');
    await element(by.id('sip-date-picker')).tap();
    await element(by.text('5')).tap(); // 5th of every month

    // Submit order
    await element(by.id('submit-order-button')).tap();

    // Verify success
    await waitFor(element(by.text('Order Placed Successfully')))
      .toBeVisible()
      .withTimeout(10000);
  });
});
```

---

## 5. Security Tests

### 5.1 Authentication & Authorization

```typescript
// tests/security/auth.test.ts
describe('Security - Authentication', () => {
  test('should reject request without token', async () => {
    const response = await request(app).get('/api/clients');

    expect(response.status).toBe(401);
  });

  test('should reject expired token', async () => {
    const expiredToken = generateToken({ id: '123' }, { expiresIn: '0s' });

    const response = await request(app)
      .get('/api/clients')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
    expect(response.body.error).toContain('expired');
  });

  test('should reject tampered token', async () => {
    const token = generateToken({ id: '123' });
    const tamperedToken = token.slice(0, -5) + 'XXXXX';

    const response = await request(app)
      .get('/api/clients')
      .set('Authorization', `Bearer ${tamperedToken}`);

    expect(response.status).toBe(401);
  });
});
```

### 5.2 Input Validation & Injection Prevention

```typescript
// tests/security/injection.test.ts
describe('Security - SQL Injection Prevention', () => {
  test('should prevent SQL injection in search', async () => {
    const maliciousInput = "'; DROP TABLE clients; --";

    const response = await request(app)
      .get(`/api/clients?search=${maliciousInput}`)
      .set('Authorization', `Bearer ${authToken}`);

    // Should not crash, should sanitize input
    expect(response.status).not.toBe(500);

    // Verify table still exists
    const clients = await db.client.findMany();
    expect(clients).toBeDefined();
  });

  test('should prevent XSS in client name', async () => {
    const maliciousName = '<script>alert("XSS")</script>';

    const response = await request(app)
      .post('/api/clients')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        pan: 'ABCDE1234F',
        name: maliciousName,
        mobile: '9876543210'
      });

    expect(response.status).toBe(201);
    expect(response.body.client.name).not.toContain('<script>');
  });
});
```

### 5.3 Data Privacy

```typescript
// tests/security/privacy.test.ts
describe('Security - Data Privacy', () => {
  test('should mask PAN in API responses', async () => {
    const client = await createTestClient({ pan: 'ABCDE1234F' });

    const response = await request(app)
      .get('/api/clients')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.body.clients[0].pan).toBe('ABCDE****F');
  });

  test('should not expose sensitive data in logs', async () => {
    const logSpy = jest.spyOn(console, 'log');

    await request(app)
      .post('/api/auth/login')
      .send({
        mobile: '9876543210',
        password: 'SecretPassword123'
      });

    expect(logSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('SecretPassword123')
    );
  });
});
```

---

## 6. Performance Tests

```typescript
// tests/performance/load.test.ts
describe('Performance - Load Testing', () => {
  test('should handle 100 concurrent requests', async () => {
    const requests = Array(100).fill(null).map(() =>
      request(app)
        .get('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
    );

    const start = Date.now();
    const responses = await Promise.all(requests);
    const duration = Date.now() - start;

    // All should succeed
    responses.forEach(res => {
      expect(res.status).toBe(200);
    });

    // Should complete within 5 seconds
    expect(duration).toBeLessThan(5000);
  });

  test('should efficiently handle large portfolio data', async () => {
    // Create 1000 transactions for a client
    const client = await createTestClient();
    for (let i = 0; i < 1000; i++) {
      await createTestTransaction({ clientId: client.id });
    }

    const start = Date.now();
    const response = await request(app)
      .get(`/api/clients/${client.id}/portfolio`)
      .set('Authorization', `Bearer ${authToken}`);
    const duration = Date.now() - start;

    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(2000); // < 2 seconds
  });
});
```

---

## Test Coverage Summary

### Module-wise Coverage Targets

| Module | Unit Tests | Integration Tests | E2E Tests | Target Coverage |
|--------|------------|-------------------|-----------|-----------------|
| **Authentication** | 25 tests | 15 tests | 3 tests | **90%+** |
| **Client Management** | 30 tests | 20 tests | 5 tests | **85%+** |
| **Data Sync (RTA)** | 40 tests | 25 tests | 2 tests | **85%+** |
| **Portfolio Management** | 35 tests | 15 tests | 3 tests | **80%+** |
| **Transaction Processing** | 45 tests | 30 tests | 5 tests | **90%+** |
| **Commission Tracking** | 20 tests | 10 tests | 1 test | **80%+** |
| **Reports & Analytics** | 25 tests | 10 tests | 2 tests | **75%+** |
| **Security** | 30 tests | 20 tests | - | **95%+** |
| **Performance** | - | 10 tests | 3 tests | **N/A** |
| **Overall** | **~250** | **~155** | **~24** | **>80%** |

---

## CI/CD Pipeline Integration

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run typecheck

      - name: Unit tests
        run: npm run test:unit

      - name: Integration tests
        run: npm run test:integration

      - name: E2E tests
        run: npm run test:e2e

      - name: Generate coverage report
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v2

      - name: Check coverage threshold
        run: npm run test:coverage:check
```

---

## Test Data Management

### Fixtures & Mocks

```typescript
// tests/fixtures/clients.ts
export const mockClients = {
  rajesh: {
    pan: 'ABCDE1234F',
    name: 'Rajesh Kumar',
    mobile: '9876543210',
    email: 'rajesh@example.com'
  },
  priya: {
    pan: 'ZYXWV9876A',
    name: 'Priya Sharma',
    mobile: '9999999999',
    email: 'priya@example.com'
  }
};

// tests/fixtures/transactions.ts
export const mockCAMSData = {
  arn: 'ARN-12345',
  transactions: [
    // ... realistic mock data
  ]
};
```

---

## Areas Requiring Immediate Test Improvement

Based on typical MF distributor app scenarios:

### 🔴 Critical (Must Test Thoroughly)

1. **Transaction Integrity**
   - Portfolio value calculations
   - XIRR accuracy
   - Commission calculations
   - Data sync deduplication

2. **Security**
   - Authentication flows
   - Data access controls
   - Sensitive data encryption
   - API rate limiting

3. **Data Migration**
   - RTA integration
   - CAS parsing
   - Conflict resolution
   - Data validation

### 🟡 Important (High Priority)

4. **Order Processing**
   - BSE API integration
   - Order validation
   - Status tracking
   - Error handling

5. **Client Management**
   - KYC workflows
   - PAN validation
   - Duplicate detection

### 🟢 Nice to Have

6. **Reports & Analytics**
   - Data accuracy
   - Export formats
   - Performance with large datasets

---

## Continuous Improvement

### Test Metrics to Track

- **Code Coverage**: >80% overall
- **Test Execution Time**: <5 minutes for full suite
- **Flaky Tests**: 0 tolerance
- **Bug Escape Rate**: Track bugs found in production
- **Test-to-Code Ratio**: ~1:1 (for critical modules)

### Monthly Test Review

- Review test coverage reports
- Identify untested edge cases
- Add tests for recent bug fixes
- Update mocks with production data
- Performance benchmark comparisons

