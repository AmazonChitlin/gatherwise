import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { supportedJurisdictions } from "@/lib/config";
import {
  EVENT_FACTS_SCHEMA_VERSION,
  serializeStoredIntakePayload
} from "@/lib/event-facts";
import {
  createResultsSnapshot,
  parseResultsSnapshot,
  shouldPersistIntakeSubmissions
} from "@/lib/intake-storage";
import { ruleSeedData, useCaseSeedData } from "@/prisma/seed-data/rules";
import { officialSourceInventory } from "@/prisma/seed-data/source-inventory";
import {
  findOfficialSourceForRule,
  sourceIdForRule,
  validateSeedIntegrity
} from "@/prisma/seed-integrity";
import { validateOfficialSourceInventory } from "@/prisma/source-inventory-validation";
import type { IntakeInput } from "@/lib/schemas";

const prismaSchema = readFileSync(
  join(process.cwd(), "prisma", "schema.prisma"),
  "utf8"
);

const intake: IntakeInput = {
  eventName: "Gatherwise Demo Event",
  city: "phoenix",
  county: "Maricopa County",
  useCase: "multi-vendor-market",
  eventType: "outdoor-market",
  propertyUse: "private-property",
  expectedAttendance: 120,
  vendorCount: 6,
  eventDate: "2026-08-12",
  recurrence: "one-time",
  hasFood: true,
  hasFoodTruck: false,
  hasRetailSales: true,
  hasAlcohol: false,
  hasAmplifiedSound: false,
  hasTemporaryStructure: false,
  hasGenerator: false,
  hasOpenFlame: false,
  hasStreetSidewalkOrParkingImpact: false
};

test("validated seed integrity links verified rules to reviewed official sources", () => {
  const result = validateSeedIntegrity(ruleSeedData, useCaseSeedData);

  assert.equal(result.rules.length, ruleSeedData.length);

  for (const rule of ruleSeedData.filter((item) => item.verificationStatus === "verified")) {
    const source = findOfficialSourceForRule(rule);
    assert.ok(source, `${rule.slug} should map to one source inventory item`);
    assert.equal(source?.verificationStatus, "official_reviewed");
  }
});

test("every verified rule resolves a stable source id", () => {
  for (const rule of ruleSeedData.filter((item) => item.verificationStatus === "verified")) {
    assert.ok(sourceIdForRule(rule), `${rule.slug} should resolve a source id`);
  }
});

test("sources marked rulesCreated are referenced by at least one rule", () => {
  const reviewed = validateOfficialSourceInventory(officialSourceInventory);

  for (const source of reviewed.filter((item) => item.rulesCreated)) {
    assert.ok(
      ruleSeedData.some(
        (rule) =>
          rule.jurisdiction.code === source.jurisdictionCode &&
          rule.source.url === source.sourceUrl
      ),
      `${source.id} should be referenced by a seeded rule`
    );
  }
});

test("reviewed source references stay unique per jurisdiction and url", () => {
  const reviewedKeys = new Set<string>();

  for (const source of officialSourceInventory.filter(
    (item) => item.verificationStatus === "official_reviewed" && item.sourceUrl
  )) {
    const key = `${source.jurisdictionCode}::${source.sourceUrl}`;
    assert.equal(
      reviewedKeys.has(key),
      false,
      `duplicate reviewed source reference: ${key}`
    );
    reviewedKeys.add(key);
  }
});

test("launch jurisdictions keep reviewed source coverage and verified rule coverage", () => {
  const uniqueJurisdictions = new Set(
    supportedJurisdictions.map((item) => item.jurisdictionCode)
  );

  for (const jurisdictionCode of uniqueJurisdictions) {
    assert.ok(
      officialSourceInventory.some(
        (source) =>
          source.jurisdictionCode === jurisdictionCode &&
          source.verificationStatus === "official_reviewed"
      ),
      `${jurisdictionCode} should have at least one reviewed source`
    );
  }

  for (const jurisdictionCode of [...uniqueJurisdictions].filter((code) => code !== "az-maricopa" && code !== "az")) {
    assert.ok(
      ruleSeedData.some(
        (rule) =>
          rule.jurisdiction.code === jurisdictionCode &&
          rule.verificationStatus === "verified"
      ),
      `${jurisdictionCode} should have at least one verified rule`
    );
  }
});

test("seed rules only reference declared use cases and preserve jurisdiction integrity", () => {
  const useCases = new Set(useCaseSeedData.map((useCase) => useCase.slug));

  for (const rule of ruleSeedData) {
    assert.ok(useCases.has(rule.useCase), `${rule.slug} should use a known use case`);

    if (rule.jurisdiction.type === "city") {
      assert.ok(
        supportedJurisdictions.some(
          (item) => item.jurisdictionCode === rule.jurisdiction.code
        ),
        `${rule.slug} should target a supported city jurisdiction`
      );
    }
  }
});

test("stored intake payloads include the current schema version", () => {
  const payload = JSON.parse(serializeStoredIntakePayload(intake));

  assert.equal(payload.schemaVersion, EVENT_FACTS_SCHEMA_VERSION);
  assert.equal(payload.eventFacts.schemaVersion, EVENT_FACTS_SCHEMA_VERSION);
});

test("results snapshots round-trip canonical intake payloads", () => {
  const snapshot = createResultsSnapshot(intake);
  const parsed = parseResultsSnapshot(snapshot);

  assert.equal(parsed?.schemaVersion, EVENT_FACTS_SCHEMA_VERSION);
  assert.equal(parsed?.intake.eventName, intake.eventName);
  assert.equal(parsed?.eventFacts?.schemaVersion, EVENT_FACTS_SCHEMA_VERSION);
});

test("production defaults to stateless intake sessions unless explicitly enabled", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalPersistence = process.env.PERSIST_INTAKE_SUBMISSIONS;
  const env = process.env as Record<string, string | undefined>;

  env.NODE_ENV = "production";
  delete env.PERSIST_INTAKE_SUBMISSIONS;
  assert.equal(shouldPersistIntakeSubmissions(), false);

  env.PERSIST_INTAKE_SUBMISSIONS = "true";
  assert.equal(shouldPersistIntakeSubmissions(), true);

  env.NODE_ENV = originalNodeEnv;

  if (originalPersistence === undefined) {
    delete env.PERSIST_INTAKE_SUBMISSIONS;
  } else {
    env.PERSIST_INTAKE_SUBMISSIONS = originalPersistence;
  }
});

test("prisma relations keep deletion safeguards for transient demo data", () => {
  const expected = [
    'jurisdiction        Jurisdiction             @relation(fields: [jurisdictionId], references: [id], onDelete: Cascade)',
    'agency              Agency?                  @relation(fields: [agencyId], references: [id], onDelete: SetNull)',
    'jurisdiction          Jurisdiction?            @relation(fields: [jurisdictionId], references: [id], onDelete: SetNull)',
    'intakeSubmission    IntakeSubmission @relation(fields: [intakeSubmissionId], references: [id], onDelete: Cascade)',
    'intakeSubmission   IntakeSubmission? @relation(fields: [intakeSubmissionId], references: [id], onDelete: SetNull)'
  ];

  for (const line of expected) {
    assert.match(prismaSchema, new RegExp(escapeRegExp(line)));
  }
});

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
