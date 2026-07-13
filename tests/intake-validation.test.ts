import assert from "node:assert/strict";
import test from "node:test";
import { buildIntakeCompatibilityFacts } from "@/lib/intake-persistence";
import { intakeSchema, type IntakeInput } from "@/lib/schemas";

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

test("accepts a complete practical intake", () => {
  const result = intakeSchema.safeParse(validIntake);

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.city, "phoenix");
    assert.equal(result.data.vendorCount, 8);
  }
});

test("returns readable errors for missing required intake fields", () => {
  const result = intakeSchema.safeParse({
    ...validIntake,
    eventName: "",
    eventDate: "",
    expectedAttendance: ""
  });

  assert.equal(result.success, false);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    assert.equal(
      errors.eventName?.[0],
      "Add a short event, booth, or business name."
    );
    assert.equal(errors.eventDate?.[0], "Choose the event date.");
    assert.equal(
      errors.expectedAttendance?.[0],
      "Add the expected number of people."
    );
  }
});

test("coerces boolean strings from form-style submissions", () => {
  const result = intakeSchema.safeParse({
    ...validIntake,
    hasFood: "true",
    hasAlcohol: "false"
  });

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.hasFood, true);
    assert.equal(result.data.hasAlcohol, false);
  }
});

test("accepts refined food fire alcohol traffic signage and property fields", () => {
  const result = intakeSchema.safeParse({
    ...validIntake,
    foodIsOpenOrPreparedOnSite: true,
    foodRequiresTemperatureControl: true,
    foodSampling: true,
    drinksWithIceOrGarnish: true,
    foodTruckOrMobileFoodUnit: true,
    commissaryOrBaseOfOperations: true,
    believesFoodExemptionMayApply: true,
    tentOrCanopy: true,
    tentSizeRange: "large-400-sq-ft-or-more",
    temporaryStageOrPlatform: true,
    cookingHeatSource: true,
    propaneOrFuelUse: true,
    streetClosure: true,
    sidewalkUseOrClosure: true,
    parkingLotUse: true,
    parkingSpacesBlocked: true,
    trafficControlNeeded: true,
    rightOfWayUse: true,
    alcoholPresent: true,
    alcoholSold: true,
    alcoholOnPublicProperty: true,
    temporarySignage: true,
    banners: true,
    ticketedEvent: true,
    admissionFee: true,
    publicAdvertising: true,
    cityParkOrFacility: true,
    publicProperty: true,
    venueOrPropertyOwnerPermission: true,
    indoorOrOutdoor: "outdoor",
    recurringEvent: true
  });

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.tentSizeRange, "large-400-sq-ft-or-more");
    assert.equal(result.data.foodSampling, true);
    assert.equal(result.data.rightOfWayUse, true);
    assert.equal(result.data.ticketedEvent, true);
  }
});

test("builds API persistence summary fields from refined intake answers", () => {
  const result = intakeSchema.safeParse({
    ...validIntake,
    hasFood: false,
    hasFoodTruck: false,
    hasAlcohol: false,
    hasTemporaryStructure: false,
    hasOpenFlame: false,
    hasStreetSidewalkOrParkingImpact: false,
    foodSampling: true,
    foodTruckOrMobileFoodUnit: true,
    alcoholSold: true,
    tentOrCanopy: true,
    cookingHeatSource: true,
    parkingSpacesBlocked: true,
    temporarySignage: true,
    ticketedEvent: true,
    recurringEvent: true
  });

  assert.equal(result.success, true);
  if (result.success) {
    const facts = buildIntakeCompatibilityFacts(result.data);
    assert.equal(facts.hasFood, true);
    assert.equal(facts.hasFoodTruck, true);
    assert.equal(facts.hasAlcohol, true);
    assert.equal(facts.hasTemporaryStructure, true);
    assert.equal(facts.hasOpenFlame, true);
    assert.equal(facts.hasStreetOrParkingImpact, true);
    assert.equal(facts.hasSignage, true);
    assert.equal(facts.isTicketed, true);
    assert.equal(facts.isRecurring, true);
  }
});
