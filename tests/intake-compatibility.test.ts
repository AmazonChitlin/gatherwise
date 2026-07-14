import assert from "node:assert/strict";
import test from "node:test";
import { POST } from "@/app/api/intake/route";
import { defaultIntakeValues } from "@/lib/intake-defaults";
import {
  eventFactsToRuleEngineFacts,
  intakeToEventFacts,
  type EventFactFieldKey
} from "@/lib/event-facts";
import { deriveCompatibilityFacts } from "@/lib/intake-compatibility";
import { parseResultsSnapshot } from "@/lib/intake-storage";
import type { IntakeInput, PartialIntakeInput } from "@/lib/schemas";

type CompatibilityKey = keyof ReturnType<typeof deriveCompatibilityFacts>;

const foodCases = [
  ["parent false, all children false", { hasFood: false }, false],
  ["parent true, all children false", { hasFood: true }, true],
  ["sampling true", { hasFood: false, foodSampling: true }, true],
  ["sampling false", { hasFood: false, foodSampling: false }, false],
  ["food truck true", { hasFoodTruck: false, foodTruckOrMobileFoodUnit: true }, true],
  ["food truck false", { hasFoodTruck: false, foodTruckOrMobileFoodUnit: false }, false]
] satisfies Array<[string, PartialIntakeInput, boolean]>;

const alcoholCases = [
  ["all false", {}, false],
  ["present true", { alcoholPresent: true }, true],
  ["present false", { alcoholPresent: false }, false],
  ["sold true", { alcoholSold: true }, true],
  ["sold false", { alcoholSold: false }, false],
  ["served free true", { alcoholServedFree: true }, true],
  ["served free false", { alcoholServedFree: false }, false],
  ["BYOB true", { alcoholByob: true }, true],
  ["BYOB false", { alcoholByob: false }, false],
  ["public-property alcohol true", { alcoholOnPublicProperty: true }, true],
  ["public-property alcohol false", { alcoholOnPublicProperty: false }, false],
  ["explicit parent true", { hasAlcohol: true }, true]
] satisfies Array<[string, PartialIntakeInput, boolean]>;

const structureCases = [
  ["tent true", { tentOrCanopy: true }, "hasTemporaryStructure", true],
  ["tent false", { tentOrCanopy: false }, "hasTemporaryStructure", false],
  ["stage true", { temporaryStageOrPlatform: true }, "hasTemporaryStructure", true],
  ["stage false", { temporaryStageOrPlatform: false }, "hasTemporaryStructure", false],
  ["cooking heat true", { cookingHeatSource: true }, "hasOpenFlame", true],
  ["cooking heat false", { cookingHeatSource: false }, "hasOpenFlame", false],
  ["explicit structure parent true", { hasTemporaryStructure: true }, "hasTemporaryStructure", true],
  ["explicit flame parent true", { hasOpenFlame: true }, "hasOpenFlame", true]
] satisfies Array<[string, PartialIntakeInput, CompatibilityKey, boolean]>;

const impactCases = [
  ["all false", {}, false],
  ["street closure true", { streetClosure: true }, true],
  ["street closure false", { streetClosure: false }, false],
  ["sidewalk use true", { sidewalkUseOrClosure: true }, true],
  ["sidewalk use false", { sidewalkUseOrClosure: false }, false],
  ["parking lot use true", { parkingLotUse: true }, true],
  ["parking lot use false", { parkingLotUse: false }, false],
  ["parking spaces true", { parkingSpacesBlocked: true }, true],
  ["parking spaces false", { parkingSpacesBlocked: false }, false],
  ["traffic control true", { trafficControlNeeded: true }, true],
  ["traffic control false", { trafficControlNeeded: false }, false],
  ["right-of-way true", { rightOfWayUse: true }, true],
  ["right-of-way false", { rightOfWayUse: false }, false],
  ["explicit parent true", { hasStreetSidewalkOrParkingImpact: true }, true]
] satisfies Array<[string, PartialIntakeInput, boolean]>;

test("derives food compatibility without mutating parent answers", () => {
  for (const [label, values, expected] of foodCases) {
    const facts = deriveCompatibilityFacts(values);
    const key = "foodTruckOrMobileFoodUnit" in values ? "hasFoodTruck" : "hasFood";
    assert.equal(facts[key], expected, label);
  }
});

test("derives alcohol compatibility from current values", () => {
  for (const [label, values, expected] of alcoholCases) {
    assert.equal(deriveCompatibilityFacts(values).hasAlcohol, expected, label);
  }
});

test("derives structure and heat compatibility from current values", () => {
  for (const [label, values, key, expected] of structureCases) {
    assert.equal(deriveCompatibilityFacts(values)[key], expected, label);
  }
});

test("derives public-space impact compatibility from current values", () => {
  for (const [label, values, expected] of impactCases) {
    assert.equal(
      deriveCompatibilityFacts(values).hasStreetOrParkingImpact,
      expected,
      label
    );
  }
});

test("removes a child's contribution when the last active child turns off", () => {
  const transitions = [
    ["foodSampling", "hasFood"],
    ["foodTruckOrMobileFoodUnit", "hasFoodTruck"],
    ["alcoholSold", "hasAlcohol"],
    ["alcoholServedFree", "hasAlcohol"],
    ["alcoholByob", "hasAlcohol"],
    ["alcoholOnPublicProperty", "hasAlcohol"],
    ["tentOrCanopy", "hasTemporaryStructure"],
    ["temporaryStageOrPlatform", "hasTemporaryStructure"],
    ["cookingHeatSource", "hasOpenFlame"],
    ["streetClosure", "hasStreetOrParkingImpact"],
    ["sidewalkUseOrClosure", "hasStreetOrParkingImpact"],
    ["parkingSpacesBlocked", "hasStreetOrParkingImpact"],
    ["trafficControlNeeded", "hasStreetOrParkingImpact"],
    ["rightOfWayUse", "hasStreetOrParkingImpact"]
  ] as const satisfies ReadonlyArray<
    readonly [keyof PartialIntakeInput, CompatibilityKey]
  >;

  for (const [childKey, aggregateKey] of transitions) {
    const active = deriveCompatibilityFacts({ [childKey]: true });
    const inactive = deriveCompatibilityFacts({ [childKey]: false });
    assert.equal(active[aggregateKey], true, `${childKey} active`);
    assert.equal(inactive[aggregateKey], false, `${childKey} inactive`);
  }
});

test("keeps explicit raw parent facts separate from derived rule facts", () => {
  const intake = completeIntake({
    hasFood: false,
    foodSampling: true,
    hasAlcohol: false,
    alcoholByob: true,
    hasTemporaryStructure: false,
    tentOrCanopy: true,
    hasOpenFlame: false,
    cookingHeatSource: true,
    hasStreetSidewalkOrParkingImpact: false,
    parkingSpacesBlocked: true
  });
  const document = intakeToEventFacts(intake, { defaultStatus: "confirmed" });
  const ruleFacts = eventFactsToRuleEngineFacts(document);

  assertRawFact(document, "hasFood", false);
  assertRawFact(document, "hasAlcohol", false);
  assertRawFact(document, "hasTemporaryStructure", false);
  assertRawFact(document, "hasOpenFlame", false);
  assertRawFact(document, "hasStreetSidewalkOrParkingImpact", false);
  assert.equal(ruleFacts.foodService, true);
  assert.equal(ruleFacts.alcoholPresent, true);
  assert.equal(ruleFacts.temporaryStructure, true);
  assert.equal(ruleFacts.openFlame, true);
  assert.equal(ruleFacts.sidewalkOrStreetClosure, true);
});

test("API snapshot, EventFacts, compatibility, and rule facts stay consistent", async () => {
  const originalPersistence = process.env.PERSIST_INTAKE_SUBMISSIONS;
  process.env.PERSIST_INTAKE_SUBMISSIONS = "false";
  const intake = completeIntake({
    hasFood: false,
    foodSampling: true,
    hasAlcohol: false,
    alcoholSold: false,
    hasTemporaryStructure: false,
    tentOrCanopy: false,
    hasStreetSidewalkOrParkingImpact: false,
    trafficControlNeeded: false
  });

  try {
    const response = await POST(
      new Request("http://localhost/api/intake", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "compatibility-matrix"
        },
        body: JSON.stringify(intake)
      })
    );
    const payload = (await response.json()) as { snapshot?: string };

    assert.equal(response.status, 200);
    assert.ok(payload.snapshot);
    const snapshot = parseResultsSnapshot(payload.snapshot);
    assert.ok(snapshot?.eventFacts);
    assert.deepEqual(snapshot.intake, intake);
    assertRawFact(snapshot.eventFacts, "hasFood", false, "provided");
    assertRawFact(snapshot.eventFacts, "foodSampling", true, "provided");

    const compatibility = deriveCompatibilityFacts(snapshot.intake);
    const ruleFacts = eventFactsToRuleEngineFacts(snapshot.eventFacts);
    assert.equal(compatibility.hasFood, true);
    assert.equal(ruleFacts.foodService, compatibility.hasFood);
    assert.equal(ruleFacts.alcoholPresent, compatibility.hasAlcohol);
    assert.equal(ruleFacts.temporaryStructure, compatibility.hasTemporaryStructure);
    assert.equal(
      ruleFacts.sidewalkOrStreetClosure,
      compatibility.hasStreetOrParkingImpact
    );
  } finally {
    if (originalPersistence === undefined) {
      delete process.env.PERSIST_INTAKE_SUBMISSIONS;
    } else {
      process.env.PERSIST_INTAKE_SUBMISSIONS = originalPersistence;
    }
  }
});

function completeIntake(overrides: PartialIntakeInput): IntakeInput {
  return {
    ...defaultIntakeValues,
    eventName: "Compatibility test event",
    eventDate: "2026-10-17",
    ...overrides
  };
}

function assertRawFact(
  document: ReturnType<typeof intakeToEventFacts>,
  key: EventFactFieldKey,
  value: boolean,
  status: "confirmed" | "provided" = "confirmed"
) {
  const fact = document.facts.find((item) => item.key === key);
  assert.ok(fact, `missing fact ${key}`);
  assert.equal(fact.value, value, key);
  assert.equal(fact.status, status, key);
}
