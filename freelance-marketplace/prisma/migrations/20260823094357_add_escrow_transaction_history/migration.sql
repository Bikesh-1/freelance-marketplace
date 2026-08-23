-- CreateEnum
CREATE TYPE "EscrowTransactionType" AS ENUM ('CREATED', 'FUNDED', 'RELEASED', 'REFUNDED');

-- CreateTable
CREATE TABLE "EscrowTransaction" (
    "id" TEXT NOT NULL,
    "escrowId" TEXT NOT NULL,
    "type" "EscrowTransactionType" NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "amount" DOUBLE PRECISION,
    "fromAddress" TEXT,
    "toAddress" TEXT,
    "network" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EscrowTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EscrowTransaction_transactionHash_key" ON "EscrowTransaction"("transactionHash");

-- CreateIndex
CREATE INDEX "EscrowTransaction_escrowId_idx" ON "EscrowTransaction"("escrowId");

-- CreateIndex
CREATE INDEX "EscrowTransaction_type_idx" ON "EscrowTransaction"("type");

-- AddForeignKey
ALTER TABLE "EscrowTransaction" ADD CONSTRAINT "EscrowTransaction_escrowId_fkey" FOREIGN KEY ("escrowId") REFERENCES "Escrow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
