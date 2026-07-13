-- CreateTable
CREATE TABLE "Jurisdiction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "jurisdictionType" TEXT NOT NULL,
    "city" TEXT,
    "county" TEXT,
    "state" TEXT NOT NULL DEFAULT 'AZ',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Agency" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "url" TEXT,
    "jurisdictionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Agency_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "Jurisdiction" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UseCase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RuleRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "plainEnglishSummary" TEXT NOT NULL,
    "requirementLevel" TEXT NOT NULL,
    "confidence" TEXT NOT NULL,
    "leadTimeDays" INTEGER,
    "sourceUrl" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "lastVerified" DATETIME,
    "isSample" BOOLEAN NOT NULL DEFAULT true,
    "verificationStatus" TEXT NOT NULL DEFAULT 'sample_unverified',
    "jurisdictionName" TEXT NOT NULL,
    "jurisdictionType" TEXT NOT NULL,
    "city" TEXT,
    "county" TEXT,
    "state" TEXT NOT NULL DEFAULT 'AZ',
    "agencyName" TEXT NOT NULL,
    "agencyPhone" TEXT,
    "agencyEmail" TEXT,
    "agencyUrl" TEXT,
    "triggerFields" TEXT NOT NULL,
    "notes" TEXT,
    "jurisdictionId" TEXT NOT NULL,
    "agencyId" TEXT,
    "useCaseId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RuleRecord_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "Jurisdiction" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RuleRecord_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RuleRecord_useCaseId_fkey" FOREIGN KEY ("useCaseId") REFERENCES "UseCase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IntakeSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventName" TEXT NOT NULL,
    "contactEmail" TEXT,
    "city" TEXT,
    "county" TEXT,
    "state" TEXT NOT NULL DEFAULT 'AZ',
    "eventType" TEXT NOT NULL,
    "venueType" TEXT NOT NULL,
    "expectedAttendance" INTEGER NOT NULL,
    "vendorCount" INTEGER NOT NULL,
    "hasFood" BOOLEAN NOT NULL DEFAULT false,
    "hasFoodTruck" BOOLEAN NOT NULL DEFAULT false,
    "hasRetailSales" BOOLEAN NOT NULL DEFAULT false,
    "hasAlcohol" BOOLEAN NOT NULL DEFAULT false,
    "hasAmplifiedSound" BOOLEAN NOT NULL DEFAULT false,
    "usesPublicProperty" BOOLEAN NOT NULL DEFAULT false,
    "usesPrivateProperty" BOOLEAN NOT NULL DEFAULT false,
    "hasStreetClosure" BOOLEAN NOT NULL DEFAULT false,
    "hasTemporaryStructure" BOOLEAN NOT NULL DEFAULT false,
    "hasGenerator" BOOLEAN NOT NULL DEFAULT false,
    "hasOpenFlame" BOOLEAN NOT NULL DEFAULT false,
    "hasSignage" BOOLEAN NOT NULL DEFAULT false,
    "isTicketed" BOOLEAN NOT NULL DEFAULT false,
    "isMultiVendor" BOOLEAN NOT NULL DEFAULT false,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "rawAnswers" TEXT,
    "jurisdictionId" TEXT,
    "useCaseId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "IntakeSubmission_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "Jurisdiction" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "IntakeSubmission_useCaseId_fkey" FOREIGN KEY ("useCaseId") REFERENCES "UseCase" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GeneratedChecklistItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "intakeSubmissionId" TEXT NOT NULL,
    "ruleRecordId" TEXT,
    "title" TEXT NOT NULL,
    "plainEnglishSummary" TEXT NOT NULL,
    "requirementLevel" TEXT NOT NULL,
    "jurisdictionName" TEXT,
    "agencyName" TEXT,
    "sourceUrl" TEXT,
    "sourceName" TEXT,
    "confidence" TEXT,
    "leadTimeDays" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GeneratedChecklistItem_intakeSubmissionId_fkey" FOREIGN KEY ("intakeSubmissionId") REFERENCES "IntakeSubmission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GeneratedChecklistItem_ruleRecordId_fkey" FOREIGN KEY ("ruleRecordId") REFERENCES "RuleRecord" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FutureProductOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "intakeSubmissionId" TEXT,
    "productType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "amountCents" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "externalReference" TEXT,
    "customerEmail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FutureProductOrder_intakeSubmissionId_fkey" FOREIGN KEY ("intakeSubmissionId") REFERENCES "IntakeSubmission" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Jurisdiction_code_key" ON "Jurisdiction"("code");

-- CreateIndex
CREATE INDEX "Jurisdiction_jurisdictionType_idx" ON "Jurisdiction"("jurisdictionType");

-- CreateIndex
CREATE INDEX "Jurisdiction_city_idx" ON "Jurisdiction"("city");

-- CreateIndex
CREATE INDEX "Jurisdiction_county_idx" ON "Jurisdiction"("county");

-- CreateIndex
CREATE INDEX "Jurisdiction_state_idx" ON "Jurisdiction"("state");

-- CreateIndex
CREATE UNIQUE INDEX "Agency_slug_key" ON "Agency"("slug");

-- CreateIndex
CREATE INDEX "Agency_name_idx" ON "Agency"("name");

-- CreateIndex
CREATE INDEX "Agency_jurisdictionId_idx" ON "Agency"("jurisdictionId");

-- CreateIndex
CREATE UNIQUE INDEX "UseCase_slug_key" ON "UseCase"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "RuleRecord_slug_key" ON "RuleRecord"("slug");

-- CreateIndex
CREATE INDEX "RuleRecord_jurisdictionType_idx" ON "RuleRecord"("jurisdictionType");

-- CreateIndex
CREATE INDEX "RuleRecord_city_idx" ON "RuleRecord"("city");

-- CreateIndex
CREATE INDEX "RuleRecord_county_idx" ON "RuleRecord"("county");

-- CreateIndex
CREATE INDEX "RuleRecord_state_idx" ON "RuleRecord"("state");

-- CreateIndex
CREATE INDEX "RuleRecord_requirementLevel_idx" ON "RuleRecord"("requirementLevel");

-- CreateIndex
CREATE INDEX "RuleRecord_confidence_idx" ON "RuleRecord"("confidence");

-- CreateIndex
CREATE INDEX "RuleRecord_verificationStatus_idx" ON "RuleRecord"("verificationStatus");

-- CreateIndex
CREATE INDEX "RuleRecord_useCaseId_idx" ON "RuleRecord"("useCaseId");

-- CreateIndex
CREATE INDEX "RuleRecord_agencyId_idx" ON "RuleRecord"("agencyId");

-- CreateIndex
CREATE INDEX "IntakeSubmission_city_idx" ON "IntakeSubmission"("city");

-- CreateIndex
CREATE INDEX "IntakeSubmission_county_idx" ON "IntakeSubmission"("county");

-- CreateIndex
CREATE INDEX "IntakeSubmission_state_idx" ON "IntakeSubmission"("state");

-- CreateIndex
CREATE INDEX "IntakeSubmission_eventType_idx" ON "IntakeSubmission"("eventType");

-- CreateIndex
CREATE INDEX "IntakeSubmission_useCaseId_idx" ON "IntakeSubmission"("useCaseId");

-- CreateIndex
CREATE INDEX "IntakeSubmission_jurisdictionId_idx" ON "IntakeSubmission"("jurisdictionId");

-- CreateIndex
CREATE INDEX "GeneratedChecklistItem_intakeSubmissionId_idx" ON "GeneratedChecklistItem"("intakeSubmissionId");

-- CreateIndex
CREATE INDEX "GeneratedChecklistItem_ruleRecordId_idx" ON "GeneratedChecklistItem"("ruleRecordId");

-- CreateIndex
CREATE INDEX "GeneratedChecklistItem_requirementLevel_idx" ON "GeneratedChecklistItem"("requirementLevel");

-- CreateIndex
CREATE INDEX "FutureProductOrder_productType_idx" ON "FutureProductOrder"("productType");

-- CreateIndex
CREATE INDEX "FutureProductOrder_status_idx" ON "FutureProductOrder"("status");

-- CreateIndex
CREATE INDEX "FutureProductOrder_intakeSubmissionId_idx" ON "FutureProductOrder"("intakeSubmissionId");

