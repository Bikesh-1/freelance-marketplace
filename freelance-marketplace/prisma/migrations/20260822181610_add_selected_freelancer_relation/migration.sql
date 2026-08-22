-- CreateIndex
CREATE INDEX "Job_selectedFreelancerId_idx" ON "Job"("selectedFreelancerId");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_selectedFreelancerId_fkey" FOREIGN KEY ("selectedFreelancerId") REFERENCES "FreelancerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
