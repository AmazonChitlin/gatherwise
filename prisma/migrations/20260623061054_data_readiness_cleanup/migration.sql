-- AlterTable
ALTER TABLE "IntakeSubmission" ADD COLUMN "jurisdictionCode" TEXT;

-- AlterTable
ALTER TABLE "RuleRecord" ADD COLUMN "jurisdictionCode" TEXT;

-- CreateIndex
CREATE INDEX "IntakeSubmission_jurisdictionCode_idx" ON "IntakeSubmission"("jurisdictionCode");

-- CreateIndex
CREATE INDEX "RuleRecord_jurisdictionCode_idx" ON "RuleRecord"("jurisdictionCode");
