import assert from "node:assert/strict";
import test from "node:test";
import { buildRequirementResultTrace, intakeToEventFacts } from "@/lib/event-facts";
import {
  buildReadinessRoute,
  buildSimulatedEventFacts,
  compareRequirementRoutes
} from "@/lib/readiness-route";
import type { EvidenceChecklistItem } from "@/lib/rule-engine";

const baseEventFacts = intakeToEventFacts(
  {
    eventName: "Warehouse Punk Show",
    city: "phoenix",
    county: "Maricopa County",
    useCase: "multi-vendor-market",
    eventType: "outdoor-market",
    propertyUse: "private-property",
    expectedAttendance: 180,
    vendorCount: 5,
    eventDate: "2026-09-20",
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
  {
    defaultStatus: "confirmed",
    overrides: {
      streetClosure: { status: "unknown", value: null }
    }
  }
);

const baseItem: EvidenceChecklistItem = {
  ruleId: "phoenix-private-event",
  slug: "phoenix-private-event",
  title: "Outdoor events on private property review",
  plainEnglishSummary: "Phoenix may review private-property outdoor events.",
  requirementLevel: "may be required",
  sourceUrl: "https://example.gov/private-event",
  sourceName: "Outdoor events source",
  lastVerified: "2026-07-13",
  isSample: false,
  verificationStatus: "verified",
  jurisdiction: "Phoenix",
  jurisdictionType: "city",
  leadTimeDays: 30,
  confidence: "high",
  agencyName: "City of Phoenix",
  sourceId: "phoenix-private-event-source",
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
  unknownConditions: [],
  evaluationTimestamp: "2026-07-13T00:00:00.000Z"
};

const changedItem: EvidenceChecklistItem = {
  ...baseItem,
  ruleId: "phoenix-right-of-way",
  slug: "phoenix-right-of-way",
  title: "Right-of-way event review",
  plainEnglishSummary: "Phoenix may review events that affect the right of way.",
  sourceId: "phoenix-right-of-way-source",
  relevantFactKeys: ["propertyUse", "hasStreetSidewalkOrParkingImpact"],
  matchedConditions: [
    {
      label: "Property or venue type",
      triggerKey: "public_property",
      expected: "Yes",
      actual: "Yes",
      status: "matched",
      factKeys: ["propertyUse"]
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
  ]
};

test("builds a route with start, fact markers, stops, sources, and end state", () => {
  const requirementResult = buildRequirementResultTrace(baseItem, {
    factKeys: baseItem.relevantFactKeys,
    ruleVersion: baseItem.ruleVersion,
    sourceId: baseItem.sourceId ?? undefined,
    evaluationTimestamp: baseItem.evaluationTimestamp
  });

  const route = buildReadinessRoute({
    eventFacts: baseEventFacts,
    checklistItems: [baseItem],
    requirementResults: [requirementResult],
    nextActionTitle: baseItem.title
  });

  assert.equal(route[0].kind, "start");
  assert.ok(route.some((node) => node.kind === "fact"));
  assert.ok(route.some((node) => node.kind === "decision"));
  assert.ok(route.some((node) => node.kind === "requirement"));
  assert.ok(route.some((node) => node.kind === "source"));
  assert.equal(route.at(-1)?.kind, "end");
});

test("duplicates confirmed facts and applies simulator changes deterministically", () => {
  const changed = buildSimulatedEventFacts(baseEventFacts, {
    propertyUse: "public-property",
    hasStreetSidewalkOrParkingImpact: true
  });

  const propertyFact = changed.facts.find((fact) => fact.key === "propertyUse");
  const impactFact = changed.facts.find(
    (fact) => fact.key === "hasStreetSidewalkOrParkingImpact"
  );

  assert.equal(propertyFact?.status, "confirmed");
  assert.equal(propertyFact?.value, "public-property");
  assert.equal(impactFact?.value, true);
});

test("computes added removed unresolved and unchanged route differences", () => {
  const changedFacts = buildSimulatedEventFacts(baseEventFacts, {
    propertyUse: "public-property",
    hasStreetSidewalkOrParkingImpact: true
  });

  const comparison = compareRequirementRoutes({
    baseEventFacts: baseEventFacts,
    changedEventFacts: changedFacts,
    baseItems: [baseItem],
    changedItems: [baseItem, changedItem]
  });

  assert.ok(
    comparison.changedFactLines.some((line) =>
      line.includes("Property or venue type changed")
    )
  );
  assert.equal(comparison.unchangedRequirements.length, 1);
  assert.equal(comparison.newlyUnresolvedRequirements.length, 1);
  assert.equal(comparison.removedRequirements.length, 0);
});
