/*
  Warnings:

  - A unique constraint covering the columns `[walletAddress]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "aiScore" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "ClientProfile" ADD COLUMN     "totalJobsPosted" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Escrow" ADD COLUMN     "network" TEXT NOT NULL DEFAULT 'sepolia',
ADD COLUMN     "transactionHash" TEXT;

-- AlterTable
ALTER TABLE "FreelancerProfile" ADD COLUMN     "aiEmbedding" TEXT,
ADD COLUMN     "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalProjects" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "yearsOfExperience" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "aiEmbedding" TEXT,
ADD COLUMN     "selectedFreelancerId" TEXT;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "blockNumber" INTEGER,
ADD COLUMN     "gasUsed" TEXT,
ADD COLUMN     "network" TEXT NOT NULL DEFAULT 'sepolia';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "walletAddress" TEXT;

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE INDEX "Application_aiScore_idx" ON "Application"("aiScore");

-- CreateIndex
CREATE INDEX "Escrow_status_idx" ON "Escrow"("status");

-- CreateIndex
CREATE INDEX "Escrow_network_idx" ON "Escrow"("network");

-- CreateIndex
CREATE INDEX "FreelancerProfile_hourlyRate_idx" ON "FreelancerProfile"("hourlyRate");

-- CreateIndex
CREATE INDEX "FreelancerProfile_experienceLevel_idx" ON "FreelancerProfile"("experienceLevel");

-- CreateIndex
CREATE INDEX "FreelancerProfile_averageRating_idx" ON "FreelancerProfile"("averageRating");

-- CreateIndex
CREATE INDEX "FreelancerProfile_isAvailable_idx" ON "FreelancerProfile"("isAvailable");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- CreateIndex
CREATE INDEX "Job_budget_idx" ON "Job"("budget");

-- CreateIndex
CREATE INDEX "Job_deadline_idx" ON "Job"("deadline");

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "Review"("rating");

-- CreateIndex
CREATE INDEX "Transaction_txHash_idx" ON "Transaction"("txHash");

-- CreateIndex
CREATE INDEX "Transaction_network_idx" ON "Transaction"("network");

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_walletAddress_idx" ON "User"("walletAddress");
