/*
  Warnings:

  - The values [CLIENT_WON,FREELANCER_WON] on the enum `DisputeStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DisputeStatus_new" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED');
ALTER TABLE "public"."Dispute" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Dispute" ALTER COLUMN "status" TYPE "DisputeStatus_new" USING ("status"::text::"DisputeStatus_new");
ALTER TYPE "DisputeStatus" RENAME TO "DisputeStatus_old";
ALTER TYPE "DisputeStatus_new" RENAME TO "DisputeStatus";
DROP TYPE "public"."DisputeStatus_old";
ALTER TABLE "Dispute" ALTER COLUMN "status" SET DEFAULT 'OPEN';
COMMIT;
