-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_IntakeSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventName" TEXT NOT NULL,
    "contactEmail" TEXT,
    "city" TEXT,
    "county" TEXT,
    "state" TEXT NOT NULL DEFAULT 'AZ',
    "eventDate" DATETIME,
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
    "hasParkingImpact" BOOLEAN NOT NULL DEFAULT false,
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
INSERT INTO "new_IntakeSubmission" ("city", "contactEmail", "county", "createdAt", "eventName", "eventType", "expectedAttendance", "hasAlcohol", "hasAmplifiedSound", "hasFood", "hasFoodTruck", "hasGenerator", "hasOpenFlame", "hasRetailSales", "hasSignage", "hasStreetClosure", "hasTemporaryStructure", "id", "isMultiVendor", "isRecurring", "isTicketed", "jurisdictionId", "rawAnswers", "state", "updatedAt", "useCaseId", "usesPrivateProperty", "usesPublicProperty", "vendorCount", "venueType") SELECT "city", "contactEmail", "county", "createdAt", "eventName", "eventType", "expectedAttendance", "hasAlcohol", "hasAmplifiedSound", "hasFood", "hasFoodTruck", "hasGenerator", "hasOpenFlame", "hasRetailSales", "hasSignage", "hasStreetClosure", "hasTemporaryStructure", "id", "isMultiVendor", "isRecurring", "isTicketed", "jurisdictionId", "rawAnswers", "state", "updatedAt", "useCaseId", "usesPrivateProperty", "usesPublicProperty", "vendorCount", "venueType" FROM "IntakeSubmission";
DROP TABLE "IntakeSubmission";
ALTER TABLE "new_IntakeSubmission" RENAME TO "IntakeSubmission";
CREATE INDEX "IntakeSubmission_city_idx" ON "IntakeSubmission"("city");
CREATE INDEX "IntakeSubmission_county_idx" ON "IntakeSubmission"("county");
CREATE INDEX "IntakeSubmission_state_idx" ON "IntakeSubmission"("state");
CREATE INDEX "IntakeSubmission_eventType_idx" ON "IntakeSubmission"("eventType");
CREATE INDEX "IntakeSubmission_useCaseId_idx" ON "IntakeSubmission"("useCaseId");
CREATE INDEX "IntakeSubmission_jurisdictionId_idx" ON "IntakeSubmission"("jurisdictionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
