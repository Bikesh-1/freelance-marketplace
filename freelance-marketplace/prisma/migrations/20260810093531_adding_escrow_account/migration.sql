/*
  Warnings:

  - You are about to drop the column `isCompleted` on the `Milestone` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[escrowId]` on the table `Milestone` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `order` to the `Milestone` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('PENDING', 'FUNDED', 'SUBMITTED', 'APPROVED', 'RELEASED', 'REFUNDED');

-- DropIndex
DROP INDEX "Escrow_jobId_key";

-- AlterTable
ALTER TABLE "Milestone" DROP COLUMN "isCompleted",
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "escrowId" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL,
ADD COLUMN     "status" "MilestoneStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "description" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Milestone_escrowId_key" ON "Milestone"("escrowId");

-- CreateIndex
CREATE INDEX "Milestone_status_idx" ON "Milestone"("status");

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_escrowId_fkey" FOREIGN KEY ("escrowId") REFERENCES "Escrow"("id") ON DELETE SET NULL ON UPDATE CASCADE;
