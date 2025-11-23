-- CreateTable
CREATE TABLE "distributors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "arn" TEXT NOT NULL,
    "euin" TEXT,
    "mobile" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "distributors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "pan" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "email" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "kycStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "importedFrom" TEXT,
    "distributorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schemes" (
    "id" TEXT NOT NULL,
    "amcCode" TEXT NOT NULL,
    "schemeCode" TEXT NOT NULL,
    "schemeName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "nav" DOUBLE PRECISION NOT NULL,
    "navDate" TIMESTAMP(3) NOT NULL,
    "aum" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schemes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolios" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "schemeId" TEXT NOT NULL,
    "folio" TEXT NOT NULL,
    "units" DOUBLE PRECISION NOT NULL,
    "avgNav" DOUBLE PRECISION NOT NULL,
    "investedValue" DOUBLE PRECISION NOT NULL,
    "currentValue" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "schemeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "units" DOUBLE PRECISION NOT NULL,
    "nav" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commissions" (
    "id" TEXT NOT NULL,
    "distributorId" TEXT NOT NULL,
    "transactionId" TEXT,
    "type" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'EXPECTED',
    "payoutDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commissions_pkey" PRIMARY KEY ("id")
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

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "distributors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_schemeId_fkey" FOREIGN KEY ("schemeId") REFERENCES "schemes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_schemeId_fkey" FOREIGN KEY ("schemeId") REFERENCES "schemes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "distributors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
