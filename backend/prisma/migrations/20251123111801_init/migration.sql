-- CreateTable
CREATE TABLE "distributors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "arn" TEXT NOT NULL,
    "euin" TEXT,
    "mobile" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pan" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "email" TEXT,
    "dateOfBirth" DATETIME,
    "kycStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "importedFrom" TEXT,
    "distributorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "clients_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "distributors" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "schemes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amcCode" TEXT NOT NULL,
    "schemeCode" TEXT NOT NULL,
    "schemeName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "nav" REAL NOT NULL,
    "navDate" DATETIME NOT NULL,
    "aum" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "portfolios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "schemeId" TEXT NOT NULL,
    "folio" TEXT NOT NULL,
    "units" REAL NOT NULL,
    "avgNav" REAL NOT NULL,
    "investedValue" REAL NOT NULL,
    "currentValue" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "portfolios_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "portfolios_schemeId_fkey" FOREIGN KEY ("schemeId") REFERENCES "schemes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "schemeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "units" REAL NOT NULL,
    "nav" REAL NOT NULL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "transactions_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transactions_schemeId_fkey" FOREIGN KEY ("schemeId") REFERENCES "schemes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "commissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "distributorId" TEXT NOT NULL,
    "transactionId" TEXT,
    "type" TEXT NOT NULL,
    "rate" REAL NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'EXPECTED',
    "payoutDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "commissions_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "distributors" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "distributors_arn_key" ON "distributors"("arn");

-- CreateIndex
CREATE UNIQUE INDEX "distributors_mobile_key" ON "distributors"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "clients_pan_key" ON "clients"("pan");

-- CreateIndex
CREATE UNIQUE INDEX "schemes_schemeCode_key" ON "schemes"("schemeCode");

-- CreateIndex
CREATE UNIQUE INDEX "portfolios_clientId_schemeId_folio_key" ON "portfolios"("clientId", "schemeId", "folio");
