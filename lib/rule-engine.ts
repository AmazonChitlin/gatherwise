import { prisma } from "@/lib/prisma";
import {
  eventFactsToRuleEngineFacts,
  getFactMetadata,
  intakeToEventFacts,
  type EventFact,
  type EventFactFieldKey,
  type EventFactsDocument,
  type RuleTriggerFacts
} from "@/lib/event-facts";
import type { IntakeInput } from "@/lib/schemas";
import type {
  Confidence,
  JurisdictionType,
  RequirementLevel,
  RuleTriggerFields
} from "@/lib/types";
import { findOfficialSourceIdByJurisdictionAndUrl } from "@/lib/source-records";

export type EngineRuleRecord = {
  id: string;
  slug: string;
  title: string;
  plainEnglishSummary: string;
  requirementLevel: string;
  confidence: string;
  leadTimeDays: number | null;
  sourceUrl: string;
  sourceName: string;
  lastVerified: Date | null;
  isSample: boolean;
  verificationStatus: string;
  notes: string | null;
  jurisdictionName: string;
  jurisdictionCode?: string | null;
  jurisdictionType: string;
  city: string | null;
  county: string | null;
  state: string;
  agencyName: string;
  agencyPhone: string | null;
  agencyEmail: string | null;
  agencyUrl: string | null;
  triggerFields: string;
  updatedAt?: Date | null;
};

export type ChecklistItem = {
  ruleId: string;
  slug: string;
  title: string;
  plainEnglishSummary: string;
  requirementLevel: RequirementLevel;
  sourceUrl: string;
  sourceName: string;
  lastVerified?: string;
  isSample: boolean;
  verificationStatus: VerificationStatus;
  verificationNote?: string;
  jurisdiction: string;
  jurisdictionType: JurisdictionType;
  leadTimeDays: number;
  confidence: Confidence;
  agencyName: string;
  agencyPhone?: string;
  agencyEmail?: string;
  agencyUrl?: string;
};

export type VerificationStatus =
  | "verified"
  | "needs_review"
  | "sample_placeholder";

export type EvidenceConditionStatus = "matched" | "unknown";

export type EvidenceCondition = {
  label: string;
  triggerKey: string;
  expected: string;
  actual: string;
  status: EvidenceConditionStatus;
  factKeys: EventFactFieldKey[];
};

type EvaluatedEvidenceCondition = {
  label: string;
  triggerKey: string;
  expected: string;
  actual: string;
  status: EvidenceConditionStatus | "failed";
  factKeys: EventFactFieldKey[];
};

export type EvidenceChecklistItem = ChecklistItem & {
  sourceId: string | null;
  ruleVersion: string;
  jurisdictionCode: string | null;
  relevantFactKeys: EventFactFieldKey[];
  matchedConditions: EvidenceCondition[];
  unknownConditions: EvidenceCondition[];
  evaluationTimestamp: string;
};

const requirementRank: Record<RequirementLevel, number> = {
  "likely required": 0,
  "may be required": 1,
  "confirm with the agency": 2
};

const jurisdictionRank: Record<JurisdictionType, number> = {
  city: 0,
  county: 1,
  state: 2,
  venue: 3,
  organizer: 4
};

const confidenceRank: Record<Confidence, number> = {
  high: 0,
  medium: 1,
  low: 2
};

const knownTriggerKeys = new Set<keyof RuleTriggerFields>([
  "jurisdiction_code",
  "jurisdiction_codes",
  "city",
  "cities",
  "county",
  "counties",
  "state",
  "states",
  "event_type",
  "event_types",
  "use_case",
  "use_cases",
  "food_service",
  "food_truck",
  "food_is_prepackaged",
  "food_is_open_or_prepared_on_site",
  "food_requires_temperature_control",
  "food_sampling",
  "drinks_with_ice_or_garnish",
  "food_truck_or_mobile_food_unit",
  "commissary_or_base_of_operations",
  "believes_food_exemption_may_apply",
  "retail_sales",
  "alcohol",
  "alcohol_present",
  "alcohol_sold",
  "alcohol_served_free",
  "alcohol_byob",
  "alcohol_on_public_property",
  "amplified_sound",
  "public_property",
  "private_property",
  "city_park_or_facility",
  "venue_or_property_owner_permission",
  "indoor_or_outdoor",
  "indoor_or_outdoor_values",
  "sidewalk_or_street_closure",
  "street_closure",
  "sidewalk_use_or_closure",
  "parking_lot_use",
  "parking_spaces_blocked",
  "traffic_control_needed",
  "right_of_way_use",
  "temporary_structure",
  "tent_or_canopy",
  "tent_size_range",
  "tent_size_ranges",
  "temporary_stage_or_platform",
  "generator_use",
  "open_flame",
  "cooking_heat_source",
  "propane_or_fuel_use",
  "signage",
  "temporary_signage",
  "banners",
  "ticketed_event",
  "admission_fee",
  "public_advertising",
  "multi_vendor_event",
  "recurring_event",
  "min_expected_attendance",
  "expected_attendance_min",
  "max_expected_attendance",
  "expected_attendance_max",
  "min_vendor_count",
  "vendor_count_min",
  "max_vendor_count",
  "vendor_count_max"
]);

export async function loadActiveRuleRecords() {
  return prisma.ruleRecord.findMany({
    where: {
      verificationStatus: {
        not: "inactive"
      }
    }
  });
}

export async function buildChecklistForIntake(intake: IntakeInput) {
  const rules = await loadActiveRuleRecords();
  return matchRulesToIntake(intake, rules);
}

export async function buildEvidenceChecklistForEventFacts(
  document: EventFactsDocument
) {
  const rules = await loadActiveRuleRecords();
  return matchRulesToEventFacts(document, rules);
}

export function matchRulesToIntake(
  intake: IntakeInput,
  rules: EngineRuleRecord[]
) {
  const facts = intakeToFacts(intake);

  return rules
    .filter((rule) => {
      const triggerFields = parseTriggerFields(rule);
      return triggerFields ? triggerFieldsMatch(triggerFields, facts) : false;
    })
    .map(toChecklistItem)
    .sort(sortChecklistItems);
}

export function matchRulesToEventFacts(
  document: EventFactsDocument,
  rules: EngineRuleRecord[]
) {
  const facts = eventFactsToRuleEngineFacts(document);
  const evaluationTimestamp = new Date().toISOString();

  return rules
    .map((rule) => evaluateRuleWithEvidence(rule, facts, document, evaluationTimestamp))
    .filter((item): item is EvidenceChecklistItem => item !== null)
    .sort(sortEvidenceChecklistItems);
}

export function triggerFieldsMatch(
  triggerFields: RuleTriggerFields,
  facts: RuleTriggerFacts
) {
  const hasMatchableTriggers = Object.entries(triggerFields).some(
    ([key, value]) =>
      key !== "global" &&
      knownTriggerKeys.has(key as keyof RuleTriggerFields) &&
      value !== undefined &&
      (!Array.isArray(value) || value.length > 0)
  );

  if (!hasMatchableTriggers) {
    return triggerFields.global === true;
  }

  const checks = [
    includesIfPresent(
      toList(triggerFields.jurisdiction_code, triggerFields.jurisdiction_codes),
      facts.jurisdictionCode
    ),
    includesIfPresent(toList(triggerFields.city, triggerFields.cities), facts.city),
    includesIfPresent(
      toList(triggerFields.county, triggerFields.counties),
      facts.county
    ),
    includesIfPresent(toList(triggerFields.state, triggerFields.states), facts.state),
    includesIfPresent(
      toList(triggerFields.event_type, triggerFields.event_types),
      facts.eventType
    ),
    includesIfPresent(
      toList(triggerFields.use_case, triggerFields.use_cases),
      facts.useCase
    ),
    booleanIfPresent(triggerFields.food_service, facts.foodService),
    booleanIfPresent(triggerFields.food_truck, facts.foodTruck),
    booleanIfPresent(
      triggerFields.food_is_prepackaged,
      facts.foodIsPrepackaged
    ),
    booleanIfPresent(
      triggerFields.food_is_open_or_prepared_on_site,
      facts.foodIsOpenOrPreparedOnSite
    ),
    booleanIfPresent(
      triggerFields.food_requires_temperature_control,
      facts.foodRequiresTemperatureControl
    ),
    booleanIfPresent(triggerFields.food_sampling, facts.foodSampling),
    booleanIfPresent(
      triggerFields.drinks_with_ice_or_garnish,
      facts.drinksWithIceOrGarnish
    ),
    booleanIfPresent(
      triggerFields.food_truck_or_mobile_food_unit,
      facts.foodTruckOrMobileFoodUnit
    ),
    booleanIfPresent(
      triggerFields.commissary_or_base_of_operations,
      facts.commissaryOrBaseOfOperations
    ),
    booleanIfPresent(
      triggerFields.believes_food_exemption_may_apply,
      facts.believesFoodExemptionMayApply
    ),
    booleanIfPresent(triggerFields.retail_sales, facts.retailSales),
    booleanIfPresent(triggerFields.alcohol, facts.alcohol),
    booleanIfPresent(triggerFields.alcohol_present, facts.alcoholPresent),
    booleanIfPresent(triggerFields.alcohol_sold, facts.alcoholSold),
    booleanIfPresent(triggerFields.alcohol_served_free, facts.alcoholServedFree),
    booleanIfPresent(triggerFields.alcohol_byob, facts.alcoholByob),
    booleanIfPresent(
      triggerFields.alcohol_on_public_property,
      facts.alcoholOnPublicProperty
    ),
    booleanIfPresent(triggerFields.amplified_sound, facts.amplifiedSound),
    booleanIfPresent(triggerFields.public_property, facts.publicProperty),
    booleanIfPresent(triggerFields.private_property, facts.privateProperty),
    booleanIfPresent(triggerFields.city_park_or_facility, facts.cityParkOrFacility),
    booleanIfPresent(
      triggerFields.venue_or_property_owner_permission,
      facts.venueOrPropertyOwnerPermission
    ),
    includesIfPresent(
      toList(triggerFields.indoor_or_outdoor, triggerFields.indoor_or_outdoor_values),
      facts.indoorOrOutdoor
    ),
    booleanIfPresent(
      triggerFields.sidewalk_or_street_closure,
      facts.sidewalkOrStreetClosure
    ),
    booleanIfPresent(triggerFields.street_closure, facts.streetClosure),
    booleanIfPresent(
      triggerFields.sidewalk_use_or_closure,
      facts.sidewalkUseOrClosure
    ),
    booleanIfPresent(triggerFields.parking_lot_use, facts.parkingLotUse),
    booleanIfPresent(
      triggerFields.parking_spaces_blocked,
      facts.parkingSpacesBlocked
    ),
    booleanIfPresent(triggerFields.traffic_control_needed, facts.trafficControlNeeded),
    booleanIfPresent(triggerFields.right_of_way_use, facts.rightOfWayUse),
    booleanIfPresent(triggerFields.temporary_structure, facts.temporaryStructure),
    booleanIfPresent(triggerFields.tent_or_canopy, facts.tentOrCanopy),
    includesIfPresent(
      toList(triggerFields.tent_size_range, triggerFields.tent_size_ranges),
      facts.tentSizeRange
    ),
    booleanIfPresent(
      triggerFields.temporary_stage_or_platform,
      facts.temporaryStageOrPlatform
    ),
    booleanIfPresent(triggerFields.generator_use, facts.generatorUse),
    booleanIfPresent(triggerFields.open_flame, facts.openFlame),
    booleanIfPresent(triggerFields.cooking_heat_source, facts.cookingHeatSource),
    booleanIfPresent(triggerFields.propane_or_fuel_use, facts.propaneOrFuelUse),
    booleanIfPresent(triggerFields.signage, facts.signage),
    booleanIfPresent(triggerFields.temporary_signage, facts.temporarySignage),
    booleanIfPresent(triggerFields.banners, facts.banners),
    booleanIfPresent(triggerFields.ticketed_event, facts.ticketedEvent),
    booleanIfPresent(triggerFields.admission_fee, facts.admissionFee),
    booleanIfPresent(triggerFields.public_advertising, facts.publicAdvertising),
    booleanIfPresent(triggerFields.multi_vendor_event, facts.multiVendorEvent),
    booleanIfPresent(triggerFields.recurring_event, facts.recurringEvent),
    minIfPresent(
      triggerFields.min_expected_attendance ??
        triggerFields.expected_attendance_min,
      facts.expectedAttendance
    ),
    maxIfPresent(
      triggerFields.max_expected_attendance ??
        triggerFields.expected_attendance_max,
      facts.expectedAttendance
    ),
    minIfPresent(
      triggerFields.min_vendor_count ?? triggerFields.vendor_count_min,
      facts.vendorCount
    ),
    maxIfPresent(
      triggerFields.max_vendor_count ?? triggerFields.vendor_count_max,
      facts.vendorCount
    )
  ];

  return checks.every(Boolean);
}

function evaluateRuleWithEvidence(
  rule: EngineRuleRecord,
  facts: RuleTriggerFacts,
  document: EventFactsDocument,
  evaluationTimestamp: string
) {
  const triggerFields = parseTriggerFields(rule);

  if (!triggerFields) {
    return null;
  }

  const conditions = buildEvidenceConditions(triggerFields, facts, document);
  const hasMatchableTriggers = conditions.length > 0;

  if (!hasMatchableTriggers && triggerFields.global !== true) {
    return null;
  }

  if (conditions.some((condition) => condition.status === "failed")) {
    return null;
  }

  const matchedConditions = conditions
    .filter((condition) => condition.status === "matched")
    .map(toEvidenceCondition);
  const unknownConditions = conditions
    .filter((condition) => condition.status === "unknown")
    .map(toEvidenceCondition);
  const relevantFactKeys = Array.from(
    new Set(conditions.flatMap((condition) => condition.factKeys))
  );

  return {
    ...toChecklistItem(rule),
    sourceId: sourceIdForRuleRecord(rule),
    ruleVersion: `rule-record:${(rule.updatedAt ?? new Date(0)).toISOString()}`,
    jurisdictionCode: rule.jurisdictionCode ?? null,
    relevantFactKeys:
      relevantFactKeys.length > 0 ? relevantFactKeys : (["city"] satisfies EventFactFieldKey[]),
    matchedConditions,
    unknownConditions,
    evaluationTimestamp
  } satisfies EvidenceChecklistItem;
}

function buildEvidenceConditions(
  triggerFields: RuleTriggerFields,
  facts: RuleTriggerFacts,
  document: EventFactsDocument
) {
  const checks: EvaluatedEvidenceCondition[] = [];

  pushStringCondition(
    checks,
    "jurisdiction_code",
    toList(triggerFields.jurisdiction_code, triggerFields.jurisdiction_codes),
    facts.jurisdictionCode,
    ["city"]
  );
  pushStringCondition(
    checks,
    "city",
    toList(triggerFields.city, triggerFields.cities),
    facts.city,
    ["city"]
  );
  pushStringCondition(
    checks,
    "county",
    toList(triggerFields.county, triggerFields.counties),
    facts.county,
    ["county"]
  );
  pushStringCondition(
    checks,
    "state",
    toList(triggerFields.state, triggerFields.states),
    facts.state,
    ["city"]
  );
  pushStringCondition(
    checks,
    "event_type",
    toList(triggerFields.event_type, triggerFields.event_types),
    facts.eventType,
    ["eventType"]
  );
  pushStringCondition(
    checks,
    "use_case",
    toList(triggerFields.use_case, triggerFields.use_cases),
    facts.useCase,
    ["useCase"]
  );
  pushBooleanCondition(checks, "food_service", triggerFields.food_service, facts.foodService, [
    "hasFood",
    "foodIsPrepackaged",
    "foodIsOpenOrPreparedOnSite",
    "foodRequiresTemperatureControl",
    "foodSampling",
    "drinksWithIceOrGarnish"
  ]);
  pushBooleanCondition(checks, "food_truck", triggerFields.food_truck, facts.foodTruck, [
    "hasFoodTruck",
    "foodTruckOrMobileFoodUnit"
  ]);
  pushBooleanCondition(
    checks,
    "food_is_prepackaged",
    triggerFields.food_is_prepackaged,
    facts.foodIsPrepackaged,
    ["foodIsPrepackaged"]
  );
  pushBooleanCondition(
    checks,
    "food_is_open_or_prepared_on_site",
    triggerFields.food_is_open_or_prepared_on_site,
    facts.foodIsOpenOrPreparedOnSite,
    ["foodIsOpenOrPreparedOnSite"]
  );
  pushBooleanCondition(
    checks,
    "food_requires_temperature_control",
    triggerFields.food_requires_temperature_control,
    facts.foodRequiresTemperatureControl,
    ["foodRequiresTemperatureControl"]
  );
  pushBooleanCondition(checks, "food_sampling", triggerFields.food_sampling, facts.foodSampling, [
    "foodSampling"
  ]);
  pushBooleanCondition(
    checks,
    "drinks_with_ice_or_garnish",
    triggerFields.drinks_with_ice_or_garnish,
    facts.drinksWithIceOrGarnish,
    ["drinksWithIceOrGarnish"]
  );
  pushBooleanCondition(
    checks,
    "food_truck_or_mobile_food_unit",
    triggerFields.food_truck_or_mobile_food_unit,
    facts.foodTruckOrMobileFoodUnit,
    ["foodTruckOrMobileFoodUnit", "hasFoodTruck"]
  );
  pushBooleanCondition(
    checks,
    "commissary_or_base_of_operations",
    triggerFields.commissary_or_base_of_operations,
    facts.commissaryOrBaseOfOperations,
    ["commissaryOrBaseOfOperations"]
  );
  pushBooleanCondition(
    checks,
    "believes_food_exemption_may_apply",
    triggerFields.believes_food_exemption_may_apply,
    facts.believesFoodExemptionMayApply,
    ["believesFoodExemptionMayApply"]
  );
  pushBooleanCondition(checks, "retail_sales", triggerFields.retail_sales, facts.retailSales, [
    "hasRetailSales"
  ]);
  pushBooleanCondition(checks, "alcohol", triggerFields.alcohol, facts.alcohol, [
    "hasAlcohol",
    "alcoholPresent",
    "alcoholSold",
    "alcoholServedFree",
    "alcoholByob",
    "alcoholOnPublicProperty"
  ]);
  pushBooleanCondition(
    checks,
    "alcohol_present",
    triggerFields.alcohol_present,
    facts.alcoholPresent,
    ["alcoholPresent", "hasAlcohol"]
  );
  pushBooleanCondition(checks, "alcohol_sold", triggerFields.alcohol_sold, facts.alcoholSold, [
    "alcoholSold"
  ]);
  pushBooleanCondition(
    checks,
    "alcohol_served_free",
    triggerFields.alcohol_served_free,
    facts.alcoholServedFree,
    ["alcoholServedFree"]
  );
  pushBooleanCondition(checks, "alcohol_byob", triggerFields.alcohol_byob, facts.alcoholByob, [
    "alcoholByob"
  ]);
  pushBooleanCondition(
    checks,
    "alcohol_on_public_property",
    triggerFields.alcohol_on_public_property,
    facts.alcoholOnPublicProperty,
    ["alcoholOnPublicProperty", "publicProperty", "cityParkOrFacility", "propertyUse"]
  );
  pushBooleanCondition(
    checks,
    "amplified_sound",
    triggerFields.amplified_sound,
    facts.amplifiedSound,
    ["hasAmplifiedSound"]
  );
  pushBooleanCondition(
    checks,
    "public_property",
    triggerFields.public_property,
    facts.publicProperty,
    ["publicProperty", "cityParkOrFacility", "propertyUse"]
  );
  pushBooleanCondition(
    checks,
    "private_property",
    triggerFields.private_property,
    facts.privateProperty,
    ["privateProperty", "propertyUse"]
  );
  pushBooleanCondition(
    checks,
    "city_park_or_facility",
    triggerFields.city_park_or_facility,
    facts.cityParkOrFacility,
    ["cityParkOrFacility", "propertyUse"]
  );
  pushBooleanCondition(
    checks,
    "venue_or_property_owner_permission",
    triggerFields.venue_or_property_owner_permission,
    facts.venueOrPropertyOwnerPermission,
    ["venueOrPropertyOwnerPermission"]
  );
  pushStringCondition(
    checks,
    "indoor_or_outdoor",
    toList(triggerFields.indoor_or_outdoor, triggerFields.indoor_or_outdoor_values),
    facts.indoorOrOutdoor,
    ["indoorOrOutdoor"]
  );
  pushBooleanCondition(
    checks,
    "sidewalk_or_street_closure",
    triggerFields.sidewalk_or_street_closure,
    facts.sidewalkOrStreetClosure,
    [
      "hasStreetSidewalkOrParkingImpact",
      "streetClosure",
      "sidewalkUseOrClosure",
      "parkingSpacesBlocked",
      "trafficControlNeeded",
      "rightOfWayUse"
    ]
  );
  pushBooleanCondition(checks, "street_closure", triggerFields.street_closure, facts.streetClosure, [
    "streetClosure",
    "hasStreetSidewalkOrParkingImpact"
  ]);
  pushBooleanCondition(
    checks,
    "sidewalk_use_or_closure",
    triggerFields.sidewalk_use_or_closure,
    facts.sidewalkUseOrClosure,
    ["sidewalkUseOrClosure", "hasStreetSidewalkOrParkingImpact"]
  );
  pushBooleanCondition(checks, "parking_lot_use", triggerFields.parking_lot_use, facts.parkingLotUse, [
    "parkingLotUse",
    "propertyUse",
    "hasStreetSidewalkOrParkingImpact"
  ]);
  pushBooleanCondition(
    checks,
    "parking_spaces_blocked",
    triggerFields.parking_spaces_blocked,
    facts.parkingSpacesBlocked,
    ["parkingSpacesBlocked", "hasStreetSidewalkOrParkingImpact"]
  );
  pushBooleanCondition(
    checks,
    "traffic_control_needed",
    triggerFields.traffic_control_needed,
    facts.trafficControlNeeded,
    ["trafficControlNeeded", "hasStreetSidewalkOrParkingImpact"]
  );
  pushBooleanCondition(checks, "right_of_way_use", triggerFields.right_of_way_use, facts.rightOfWayUse, [
    "rightOfWayUse",
    "streetClosure",
    "sidewalkUseOrClosure",
    "hasStreetSidewalkOrParkingImpact"
  ]);
  pushBooleanCondition(
    checks,
    "temporary_structure",
    triggerFields.temporary_structure,
    facts.temporaryStructure,
    ["hasTemporaryStructure", "tentOrCanopy", "temporaryStageOrPlatform"]
  );
  pushBooleanCondition(checks, "tent_or_canopy", triggerFields.tent_or_canopy, facts.tentOrCanopy, [
    "tentOrCanopy",
    "hasTemporaryStructure"
  ]);
  pushStringCondition(
    checks,
    "tent_size_range",
    toList(triggerFields.tent_size_range, triggerFields.tent_size_ranges),
    facts.tentSizeRange,
    ["tentSizeRange"]
  );
  pushBooleanCondition(
    checks,
    "temporary_stage_or_platform",
    triggerFields.temporary_stage_or_platform,
    facts.temporaryStageOrPlatform,
    ["temporaryStageOrPlatform", "hasTemporaryStructure"]
  );
  pushBooleanCondition(checks, "generator_use", triggerFields.generator_use, facts.generatorUse, [
    "hasGenerator"
  ]);
  pushBooleanCondition(checks, "open_flame", triggerFields.open_flame, facts.openFlame, [
    "hasOpenFlame",
    "cookingHeatSource",
    "propaneOrFuelUse"
  ]);
  pushBooleanCondition(
    checks,
    "cooking_heat_source",
    triggerFields.cooking_heat_source,
    facts.cookingHeatSource,
    ["cookingHeatSource"]
  );
  pushBooleanCondition(
    checks,
    "propane_or_fuel_use",
    triggerFields.propane_or_fuel_use,
    facts.propaneOrFuelUse,
    ["propaneOrFuelUse"]
  );
  pushBooleanCondition(checks, "signage", triggerFields.signage, facts.signage, [
    "temporarySignage",
    "banners"
  ]);
  pushBooleanCondition(
    checks,
    "temporary_signage",
    triggerFields.temporary_signage,
    facts.temporarySignage,
    ["temporarySignage"]
  );
  pushBooleanCondition(checks, "banners", triggerFields.banners, facts.banners, ["banners"]);
  pushBooleanCondition(
    checks,
    "ticketed_event",
    triggerFields.ticketed_event,
    facts.ticketedEvent,
    ["ticketedEvent"]
  );
  pushBooleanCondition(checks, "admission_fee", triggerFields.admission_fee, facts.admissionFee, [
    "admissionFee"
  ]);
  pushBooleanCondition(
    checks,
    "public_advertising",
    triggerFields.public_advertising,
    facts.publicAdvertising,
    ["publicAdvertising"]
  );
  pushBooleanCondition(
    checks,
    "multi_vendor_event",
    triggerFields.multi_vendor_event,
    facts.multiVendorEvent,
    ["vendorCount"]
  );
  pushBooleanCondition(
    checks,
    "recurring_event",
    triggerFields.recurring_event,
    facts.recurringEvent,
    ["recurrence", "recurringEvent"]
  );
  pushMinCondition(
    checks,
    "expected_attendance_min",
    triggerFields.min_expected_attendance ?? triggerFields.expected_attendance_min,
    facts.expectedAttendance,
    ["expectedAttendance"]
  );
  pushMaxCondition(
    checks,
    "expected_attendance_max",
    triggerFields.max_expected_attendance ?? triggerFields.expected_attendance_max,
    facts.expectedAttendance,
    ["expectedAttendance"]
  );
  pushMinCondition(
    checks,
    "vendor_count_min",
    triggerFields.min_vendor_count ?? triggerFields.vendor_count_min,
    facts.vendorCount,
    ["vendorCount"]
  );
  pushMaxCondition(
    checks,
    "vendor_count_max",
    triggerFields.max_vendor_count ?? triggerFields.vendor_count_max,
    facts.vendorCount,
    ["vendorCount"]
  );

  return checks.map((condition): EvaluatedEvidenceCondition => {
    if (allFactsUnknown(document, condition.factKeys)) {
      return {
        ...condition,
        actual: "Unknown",
        status: "unknown"
      };
    }

    return condition;
  });
}

function pushStringCondition(
  checks: EvaluatedEvidenceCondition[],
  triggerKey: keyof RuleTriggerFields,
  allowed: string[] | undefined,
  actual: string | null,
  factKeys: EventFactFieldKey[]
) {
  if (!allowed || allowed.length === 0 || !knownTriggerKeys.has(triggerKey)) {
    return;
  }

  const condition: EvaluatedEvidenceCondition = {
    label: conditionLabel(triggerKey, factKeys),
    triggerKey,
    expected: allowed.join(" or "),
    actual: actual ?? "Unknown",
    status: includesIfPresent(allowed, actual) ? "matched" : "failed",
    factKeys
  };

  checks.push(condition);
}

function pushBooleanCondition(
  checks: EvaluatedEvidenceCondition[],
  triggerKey: keyof RuleTriggerFields,
  expected: boolean | undefined,
  actual: boolean,
  factKeys: EventFactFieldKey[]
) {
  if (expected === undefined || !knownTriggerKeys.has(triggerKey)) {
    return;
  }

  const condition: EvaluatedEvidenceCondition = {
    label: conditionLabel(triggerKey, factKeys),
    triggerKey,
    expected: expected ? "Yes" : "No",
    actual: actual ? "Yes" : "No",
    status: booleanIfPresent(expected, actual) ? "matched" : "failed",
    factKeys
  };

  checks.push(condition);
}

function pushMinCondition(
  checks: EvaluatedEvidenceCondition[],
  triggerKey: keyof RuleTriggerFields,
  expected: number | undefined,
  actual: number,
  factKeys: EventFactFieldKey[]
) {
  if (expected === undefined || !knownTriggerKeys.has(triggerKey)) {
    return;
  }

  const condition: EvaluatedEvidenceCondition = {
    label: conditionLabel(triggerKey, factKeys),
    triggerKey,
    expected: `${expected}+`,
    actual: String(actual),
    status: minIfPresent(expected, actual) ? "matched" : "failed",
    factKeys
  };

  checks.push(condition);
}

function pushMaxCondition(
  checks: EvaluatedEvidenceCondition[],
  triggerKey: keyof RuleTriggerFields,
  expected: number | undefined,
  actual: number,
  factKeys: EventFactFieldKey[]
) {
  if (expected === undefined || !knownTriggerKeys.has(triggerKey)) {
    return;
  }

  const condition: EvaluatedEvidenceCondition = {
    label: conditionLabel(triggerKey, factKeys),
    triggerKey,
    expected: `${expected} or fewer`,
    actual: String(actual),
    status: maxIfPresent(expected, actual) ? "matched" : "failed",
    factKeys
  };

  checks.push(condition);
}

function allFactsUnknown(document: EventFactsDocument, factKeys: EventFactFieldKey[]) {
  if (factKeys.length === 0) {
    return false;
  }

  return factKeys.every((key) => {
    const fact = factForKey(document, key);
    return !fact || fact.status === "unknown" || fact.value === null;
  });
}

function factForKey(document: EventFactsDocument, key: EventFactFieldKey) {
  return document.facts.find((fact) => fact.key === key);
}

function conditionLabel(triggerKey: keyof RuleTriggerFields, factKeys: EventFactFieldKey[]) {
  const firstFact = factKeys[0];

  if (firstFact) {
    return getFactMetadata(firstFact).label;
  }

  return String(triggerKey).replaceAll("_", " ");
}

function toEvidenceCondition(
  condition: EvaluatedEvidenceCondition
): EvidenceCondition {
  const { status, ...rest } = condition;
  return {
    ...rest,
    status: status === "unknown" ? "unknown" : "matched"
  };
}

function intakeToFacts(intake: IntakeInput): RuleTriggerFacts {
  return eventFactsToRuleEngineFacts(intakeToEventFacts(intake));
}

function parseTriggerFields(rule: EngineRuleRecord) {
  try {
    return JSON.parse(rule.triggerFields) as RuleTriggerFields;
  } catch {
    return null;
  }
}

function sourceIdForRuleRecord(rule: Pick<EngineRuleRecord, "jurisdictionCode" | "sourceUrl">) {
  return findOfficialSourceIdByJurisdictionAndUrl(rule);
}

function toChecklistItem(rule: EngineRuleRecord): ChecklistItem {
  return {
    ruleId: rule.id,
    slug: rule.slug,
    title: rule.title,
    plainEnglishSummary: rule.plainEnglishSummary,
    requirementLevel: normalizeRequirementLevel(rule.requirementLevel),
    sourceUrl: rule.sourceUrl,
    sourceName: rule.sourceName,
    lastVerified: rule.lastVerified?.toISOString().slice(0, 10),
    isSample: rule.isSample,
    verificationStatus: normalizeVerificationStatus(rule),
    verificationNote: rule.notes ?? undefined,
    jurisdiction: rule.jurisdictionName,
    jurisdictionType: normalizeJurisdictionType(rule.jurisdictionType),
    leadTimeDays: rule.leadTimeDays ?? 0,
    confidence: normalizeConfidence(rule.confidence),
    agencyName: rule.agencyName,
    agencyPhone: rule.agencyPhone ?? undefined,
    agencyEmail: rule.agencyEmail ?? undefined,
    agencyUrl: rule.agencyUrl ?? undefined
  };
}

function normalizeVerificationStatus(rule: EngineRuleRecord): VerificationStatus {
  if (rule.isSample || rule.verificationStatus === "sample_unverified") {
    return "sample_placeholder";
  }

  if (!rule.lastVerified || rule.verificationStatus === "needs_review") {
    return "needs_review";
  }

  return "verified";
}

function sortChecklistItems(left: ChecklistItem, right: ChecklistItem) {
  return (
    requirementRank[left.requirementLevel] -
      requirementRank[right.requirementLevel] ||
    right.leadTimeDays - left.leadTimeDays ||
    jurisdictionRank[left.jurisdictionType] -
      jurisdictionRank[right.jurisdictionType] ||
    confidenceRank[left.confidence] - confidenceRank[right.confidence] ||
    left.title.localeCompare(right.title)
  );
}

function sortEvidenceChecklistItems(
  left: EvidenceChecklistItem,
  right: EvidenceChecklistItem
) {
  return (
    sortChecklistItems(left, right) ||
    right.unknownConditions.length - left.unknownConditions.length ||
    left.title.localeCompare(right.title)
  );
}

function toList(value?: string, values?: string[]) {
  if (values) {
    return values;
  }

  return value ? [value] : undefined;
}

function includesIfPresent(allowed: string[] | undefined, value: string | null) {
  if (!allowed) {
    return true;
  }

  if (!value || allowed.length === 0) {
    return false;
  }

  const normalizedValue = normalizeKey(value);
  return allowed.some((item) => normalizeKey(item) === normalizedValue);
}

export function normalizeKey(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function booleanIfPresent(expected: boolean | undefined, value: boolean) {
  return expected === undefined || expected === value;
}

function minIfPresent(minimum: number | undefined, value: number) {
  return minimum === undefined || value >= minimum;
}

function maxIfPresent(maximum: number | undefined, value: number) {
  return maximum === undefined || value <= maximum;
}

function normalizeRequirementLevel(value: string): RequirementLevel {
  if (value === "likely required" || value === "may be required") {
    return value;
  }

  return "confirm with the agency";
}

function normalizeConfidence(value: string): Confidence {
  if (value === "high" || value === "medium") {
    return value;
  }

  return "low";
}

function normalizeJurisdictionType(value: string): JurisdictionType {
  if (
    value === "city" ||
    value === "county" ||
    value === "state" ||
    value === "venue"
  ) {
    return value;
  }

  return "organizer";
}
