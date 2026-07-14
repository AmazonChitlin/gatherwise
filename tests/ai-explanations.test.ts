import assert from "node:assert/strict";
import test from "node:test";
import {
  buildDeterministicFallback,
  buildExplanationPacket,
  createExplanationService,
  ExplanationGroundingError,
  MockExplanationProvider,
  validateGroundedExplanation
} from "@/lib/ai/explanations";
import { buildRequirementResultTrace, intakeToEventFacts } from "@/lib/event-facts";
import type { EvidenceChecklistItem } from "@/lib/rule-engine";

const eventFacts = intakeToEventFacts(
  {
    eventName: "Warehouse Punk Show",
    city: "phoenix",
    county: "Maricopa County",
    useCase: "multi-vendor-market",
    eventType: "outdoor-market",
    propertyUse: "private-property",
    expectedAttendance: 220,
    vendorCount: 4,
    eventDate: "2026-09-18",
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
  },
  { defaultStatus: "confirmed" }
);

const checklistItem: EvidenceChecklistItem = {
  ruleId: "rule-1",
  slug: "phoenix-outdoor-events-private-property",
  title: "Outdoor events on private property review",
  plainEnglishSummary: "Phoenix may review events on private property.",
  requirementLevel: "may be required",
  sourceUrl:
    "https://www.phoenix.gov/administration/departments/pdd/tools-resources/temporary-assembly-permits/outdoor-events.html",
  sourceName: "Outdoor Events on Private Property",
  lastVerified: "2026-07-13",
  isSample: false,
  verificationStatus: "verified",
  jurisdiction: "Phoenix",
  jurisdictionType: "city",
  leadTimeDays: 30,
  confidence: "high",
  agencyName: "City of Phoenix Planning and Development",
  sourceId: "phoenix-outdoor-events-private-property",
  ruleVersion: "rule-record:2026-07-13T00:00:00.000Z",
  jurisdictionCode: "az-phoenix",
  relevantFactKeys: ["city", "propertyUse"],
  matchedConditions: [
    {
      label: "City or rule area",
      triggerKey: "city",
      expected: "Phoenix",
      actual: "Phoenix",
      status: "matched",
      factKeys: ["city"]
    }
  ],
  unknownConditions: [
    {
      label: "Street closure",
      triggerKey: "street_closure",
      expected: "Yes",
      actual: "Unknown",
      status: "unknown",
      factKeys: ["streetClosure"]
    }
  ],
  evaluationTimestamp: "2026-07-13T00:00:00.000Z"
};

const requirementResult = buildRequirementResultTrace(checklistItem, {
  factKeys: checklistItem.relevantFactKeys,
  ruleVersion: checklistItem.ruleVersion,
  sourceId: checklistItem.sourceId ?? undefined,
  matchedConditions: checklistItem.matchedConditions.map(
    (condition) => `${condition.label}: expected ${condition.expected}; actual ${condition.actual}.`
  ),
  unknownConditions: checklistItem.unknownConditions.map(
    (condition) => `${condition.label}: expected ${condition.expected}; actual ${condition.actual}.`
  ),
  evaluationTimestamp: checklistItem.evaluationTimestamp,
  knownUncertainty: checklistItem.unknownConditions.map((condition) => condition.label)
});

const packet = buildExplanationPacket({
  eventFacts,
  checklistItems: [checklistItem],
  requirementResults: [requirementResult]
});

test("builds a narrow explanation packet from confirmed facts and trusted sources", () => {
  assert.equal(packet.results.length, 1);
  assert.equal(packet.sources.length, 1);
  assert.equal(packet.sources[0].sourceId, "phoenix-outdoor-events-private-property");
  assert.ok(packet.facts.every((fact) => fact.value.length > 0));
});

test("falls back cleanly when AI explanations are disabled", async () => {
  const service = createExplanationService({
    provider: new MockExplanationProvider({
      type: "success",
      title: "Ignore",
      summary: "Ignore",
      whatWeKnow: [],
      needsReview: [],
      nextSteps: [],
      citations: [],
      requirementRefs: []
    }),
    config: { enabled: false }
  });

  const result = await service.explain(packet);

  assert.equal(result.mode, "fallback");
  assert.match(result.summary, /AI is disabled/i);
});

test("rejects unknown citation ids from AI output", () => {
  assert.throws(
    () =>
      validateGroundedExplanation(packet, {
        type: "success",
        title: "Grounded explanation",
        summary: "This result may apply.",
        whatWeKnow: ["The event is in Phoenix."],
        needsReview: ["Street closure is still unknown."],
        nextSteps: ["Check the official source."],
        citations: ["made-up-source"],
        requirementRefs: [checklistItem.slug]
      }),
    ExplanationGroundingError
  );
});

test("rejects AI output with untrusted urls", () => {
  assert.throws(
    () =>
      validateGroundedExplanation(packet, {
        type: "success",
        title: "Grounded explanation",
        summary: "Check https://example.com for details.",
        whatWeKnow: [],
        needsReview: [],
        nextSteps: [],
        citations: [checklistItem.sourceId!],
        requirementRefs: [checklistItem.slug]
      }),
    ExplanationGroundingError
  );
});

test("uses the deterministic fallback to separate known facts from review items", () => {
  const result = buildDeterministicFallback(packet, "AI explanation failed.");

  assert.equal(result.mode, "fallback");
  assert.ok(result.whatWeKnow.length > 0);
  assert.ok(result.needsReview.length > 0);
  assert.ok(result.citations.includes("phoenix-outdoor-events-private-property"));
});
