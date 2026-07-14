import assert from "node:assert/strict";
import test from "node:test";
import {
  buildRequirementResultTrace,
  intakeToEventFacts
} from "@/lib/event-facts";
import { matchRulesToEventFacts, type EngineRuleRecord } from "@/lib/rule-engine";
import type { IntakeInput } from "@/lib/schemas";
import { officialSourceInventory } from "@/prisma/seed-data/source-inventory";

const source = officialSourceInventory.find(
  (item) => item.sourceUrl && item.verificationStatus === "official_reviewed"
);

if (!source?.sourceUrl) {
  throw new Error("Expected an official reviewed source with a URL for tests.");
}

const testedSource = source!;
const testedSourceUrl = testedSource.sourceUrl!;

const baseIntake: IntakeInput = {
  eventName: "Downtown Punk Night",
  city: "phoenix",
  county: "Maricopa County",
  useCase: "multi-vendor-market",
  eventType: "outdoor-market",
  propertyUse: "private-property",
  expectedAttendance: 150,
  vendorCount: 6,
  eventDate: "2026-09-12",
  recurrence: "one-time",
  hasFood: false,
  hasFoodTruck: false,
  hasRetailSales: true,
  hasAlcohol: false,
  hasAmplifiedSound: true,
  hasTemporaryStructure: false,
  hasGenerator: false,
  hasOpenFlame: false,
  hasStreetSidewalkOrParkingImpact: false
};

test("captures matched and unknown conditions for deterministic evidence results", () => {
  const document = intakeToEventFacts(baseIntake, {
    defaultStatus: "confirmed",
    overrides: {
      streetClosure: { status: "unknown", value: null },
      hasStreetSidewalkOrParkingImpact: { status: "unknown", value: null }
    }
  });
  const results = matchRulesToEventFacts(document, [
    rule({
      jurisdictionCode: testedSource.jurisdictionCode,
      sourceUrl: testedSourceUrl,
      sourceName: testedSource.sourceName,
      triggerFields: {
        city: "Phoenix",
        street_closure: true
      }
    })
  ]);

  assert.equal(results.length, 1);
  assert.equal(results[0].matchedConditions[0]?.triggerKey, "city");
  assert.equal(results[0].unknownConditions[0]?.triggerKey, "street_closure");
  assert.equal(results[0].sourceId, testedSource.id);
  assert.match(results[0].ruleVersion, /^rule-record:/);
});

test("serializes evidence checklist traces into requirement results", () => {
  const document = intakeToEventFacts(baseIntake, {
    defaultStatus: "confirmed"
  });
  const [item] = matchRulesToEventFacts(document, [
    rule({
      jurisdictionCode: testedSource.jurisdictionCode,
      sourceUrl: testedSourceUrl,
      sourceName: testedSource.sourceName,
      triggerFields: {
        city: "Phoenix",
        amplified_sound: true
      }
    })
  ]);

  const result = buildRequirementResultTrace(item, {
    factKeys: item.relevantFactKeys,
    ruleVersion: item.ruleVersion,
    sourceId: item.sourceId ?? undefined,
    matchedConditions: item.matchedConditions.map(
      (condition) => `${condition.label}: expected ${condition.expected}; actual ${condition.actual}.`
    ),
    unknownConditions: item.unknownConditions.map(
      (condition) => `${condition.label}: expected ${condition.expected}; actual ${condition.actual}.`
    ),
    evaluationTimestamp: item.evaluationTimestamp,
    knownUncertainty: item.unknownConditions.map((condition) => condition.label)
  });

  assert.equal(result.ruleEvaluation.sourceIds[0], testedSource.id);
  assert.equal(result.ruleEvaluation.matchedConditions.length, 2);
  assert.equal(result.ruleEvaluation.unknownConditions.length, 0);
  assert.match(result.ruleEvaluation.evaluatedAt, /T/);
});

function rule(
  overrides: Omit<Partial<EngineRuleRecord>, "triggerFields"> & {
    triggerFields: Record<string, unknown>;
  }
): EngineRuleRecord {
  return {
    id: "rule-evidence",
    slug: "rule-evidence",
    title: "Evidence rule",
    plainEnglishSummary: "Evidence trail test rule",
    requirementLevel: "may be required",
    confidence: "high",
    leadTimeDays: 21,
    sourceUrl: testedSourceUrl,
    sourceName: testedSource.sourceName,
    lastVerified: new Date("2026-07-13T00:00:00.000Z"),
    isSample: false,
    verificationStatus: "verified",
    notes: null,
    jurisdictionName: "Phoenix",
    jurisdictionCode: testedSource.jurisdictionCode,
    jurisdictionType: "city",
    city: "Phoenix",
    county: "Maricopa County",
    state: "AZ",
    agencyName: "Phoenix test agency",
    agencyPhone: null,
    agencyEmail: null,
    agencyUrl: null,
    updatedAt: new Date("2026-07-13T00:00:00.000Z"),
    ...overrides,
    triggerFields: JSON.stringify(overrides.triggerFields)
  };
}
