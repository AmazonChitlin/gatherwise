import assert from "node:assert/strict";
import test from "node:test";
import {
  EVENT_FACTS_SCHEMA_VERSION,
  buildRequirementResultTrace,
  eventFactsToIntakePatch,
  eventFactsToRuleEngineFacts,
  factStatusToUserFacingState,
  intakeToEventFacts,
  mergeEventFactsIntoIntake,
  parseEventFactsDocument,
  parseStoredIntakePayload,
  serializeEventFactsDocument,
  serializeStoredIntakePayload,
} from "@/lib/event-facts";
import type { IntakeInput } from "@/lib/schemas";

const validIntake: IntakeInput = {
  eventName: "Evening Maker Market",
  city: "phoenix",
  county: "Maricopa County",
  useCase: "multi-vendor-market",
  eventType: "outdoor-market",
  propertyUse: "private-property",
  expectedAttendance: 150,
  vendorCount: 8,
  eventDate: "2026-08-12",
  recurrence: "one-time",
  hasFood: true,
  hasFoodTruck: false,
  hasRetailSales: true,
  hasAlcohol: false,
  hasAmplifiedSound: true,
  hasTemporaryStructure: true,
  hasGenerator: false,
  hasOpenFlame: false,
  hasStreetSidewalkOrParkingImpact: false
};

test("builds a canonical event-facts document from intake", () => {
  const document = intakeToEventFacts(validIntake);

  assert.equal(document.schemaVersion, EVENT_FACTS_SCHEMA_VERSION);
  assert.equal(document.jurisdiction.code, "phoenix");
  assert.equal(document.dateScope.eventDate, "2026-08-12");
  assert.equal(document.locationScope.propertyUse, "private-property");

  const eventName = document.facts.find((fact) => fact.key === "eventName");
  const attendance = document.facts.find(
    (fact) => fact.key === "expectedAttendance"
  );

  assert.equal(eventName?.status, "provided");
  assert.equal(eventName?.value, "Evening Maker Market");
  assert.equal(attendance?.value, 150);
});

test("supports extracted and confirmed facts with evidence metadata", () => {
  const document = intakeToEventFacts(validIntake, {
    overrides: {
      eventName: {
        status: "confirmed",
        confirmedAt: "2026-07-13T16:45:00.000Z"
      },
      expectedAttendance: {
        status: "extracted",
        value: 175,
        evidenceTextSpan: {
          text: "Expecting around 175 people",
          start: 10,
          end: 36,
          sourceId: "upload:brief"
        },
        internalConfidence: "medium"
      }
    }
  });

  const eventName = document.facts.find((fact) => fact.key === "eventName");
  const attendance = document.facts.find(
    (fact) => fact.key === "expectedAttendance"
  );

  assert.equal(eventName?.status, "confirmed");
  assert.equal(eventName?.confirmedAt, "2026-07-13T16:45:00.000Z");
  assert.equal(attendance?.status, "extracted");
  assert.equal(attendance?.value, 175);
  assert.equal(attendance?.internalConfidence, "medium");
  assert.equal(attendance?.evidenceTextSpan?.sourceId, "upload:brief");
});

test("round-trips event-facts serialization", () => {
  const document = intakeToEventFacts(validIntake);
  const serialized = serializeEventFactsDocument(document);
  const parsed = parseEventFactsDocument(JSON.parse(serialized));

  assert.deepEqual(JSON.parse(serialized), JSON.parse(JSON.stringify(parsed)));
});

test("does not silently coerce unknown facts to false in intake patches", () => {
  const document = intakeToEventFacts(validIntake, {
    overrides: {
      hasAlcohol: {
        status: "unknown",
        value: null
      }
    }
  });

  const patch = eventFactsToIntakePatch(document);

  assert.ok(!("hasAlcohol" in patch));
});

test("merges event facts into a fallback intake for rule-engine compatibility", () => {
  const document = intakeToEventFacts(validIntake, {
    overrides: {
      vendorCount: {
        status: "confirmed",
        value: 12
      },
      hasAlcohol: {
        status: "unknown",
        value: null
      }
    }
  });

  const merged = mergeEventFactsIntoIntake(document, validIntake);

  assert.equal(merged.vendorCount, 12);
  assert.equal(merged.hasAlcohol, false);
});

test("produces the normalized rule trigger facts from canonical event facts", () => {
  const document = intakeToEventFacts({
    ...validIntake,
    cityParkOrFacility: true,
    hasStreetSidewalkOrParkingImpact: true,
    alcoholSold: true,
    foodSampling: true
  });

  const facts = eventFactsToRuleEngineFacts(document);

  assert.equal(facts.publicProperty, true);
  assert.equal(facts.alcohol, true);
  assert.equal(facts.foodService, true);
  assert.equal(facts.sidewalkOrStreetClosure, true);
});

test("parses both legacy and envelope-style stored intake payloads", () => {
  const envelope = parseStoredIntakePayload(
    serializeStoredIntakePayload(validIntake)
  );
  const legacy = parseStoredIntakePayload(JSON.stringify(validIntake));

  assert.equal(envelope.intake.city, "phoenix");
  assert.ok(envelope.eventFacts);
  assert.equal(legacy.intake.city, "phoenix");
  assert.equal(legacy.eventFacts, undefined);
});

test("builds a typed requirement result trace", () => {
  const result = buildRequirementResultTrace(
    {
      ruleId: "rule-123",
      slug: "phoenix-special-event-review",
      title: "Special event review",
      plainEnglishSummary: "Review",
      requirementLevel: "may be required",
      sourceUrl: "https://example.gov/review",
      sourceName: "Phoenix Special Events",
      lastVerified: "2026-07-10",
      isSample: false,
      verificationStatus: "verified",
      jurisdiction: "Phoenix",
      jurisdictionType: "city",
      leadTimeDays: 30,
      confidence: "high",
      agencyName: "Phoenix Special Events"
    },
    {
      factKeys: ["eventType", "vendorCount", "city"],
      ruleVersion: "2026.07"
    }
  );

  assert.equal(result.ruleEvaluation.ruleId, "rule-123");
  assert.equal(result.ruleEvaluation.ruleVersion, "2026.07");
  assert.deepEqual(result.ruleEvaluation.relevantFactKeys, [
    "eventType",
    "vendorCount",
    "city"
  ]);
  assert.equal(result.officialSource.sourceName, "Phoenix Special Events");
});

test("maps internal fact statuses to user-facing states", () => {
  assert.equal(factStatusToUserFacingState("confirmed"), "confirmed");
  assert.equal(factStatusToUserFacingState("provided"), "needs_review");
  assert.equal(factStatusToUserFacingState("extracted"), "needs_review");
  assert.equal(factStatusToUserFacingState("unknown"), "unknown");
});

test("rejects malformed event-facts documents at the boundary", () => {
  assert.throws(() =>
    parseEventFactsDocument({
      schemaVersion: EVENT_FACTS_SCHEMA_VERSION,
      jurisdiction: {},
      dateScope: {},
      locationScope: {},
      facts: []
    })
  );
});

test("keeps explicit false values rather than dropping them as unknown", () => {
  const document = intakeToEventFacts({
    ...validIntake,
    hasAlcohol: false
  });
  const alcoholFact = document.facts.find((fact) => fact.key === "hasAlcohol");

  assert.equal(alcoholFact?.status, "provided");
  assert.equal(alcoholFact?.value, false);
});
