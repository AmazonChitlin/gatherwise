import { prisma } from "@/lib/prisma";
import { supportedJurisdictions } from "@/lib/config";
import type { IntakeInput } from "@/lib/schemas";
import type {
  Confidence,
  JurisdictionType,
  RequirementLevel,
  RuleTriggerFields
} from "@/lib/types";

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

type IntakeFacts = {
  jurisdictionCode: string | null;
  city: string | null;
  county: string;
  state: string;
  useCase: string;
  eventType: string;
  foodService: boolean;
  foodTruck: boolean;
  foodIsPrepackaged: boolean;
  foodIsOpenOrPreparedOnSite: boolean;
  foodRequiresTemperatureControl: boolean;
  foodSampling: boolean;
  drinksWithIceOrGarnish: boolean;
  foodTruckOrMobileFoodUnit: boolean;
  commissaryOrBaseOfOperations: boolean;
  believesFoodExemptionMayApply: boolean;
  retailSales: boolean;
  alcohol: boolean;
  alcoholPresent: boolean;
  alcoholSold: boolean;
  alcoholServedFree: boolean;
  alcoholByob: boolean;
  alcoholOnPublicProperty: boolean;
  amplifiedSound: boolean;
  publicProperty: boolean;
  privateProperty: boolean;
  cityParkOrFacility: boolean;
  venueOrPropertyOwnerPermission: boolean;
  indoorOrOutdoor: string | null;
  sidewalkOrStreetClosure: boolean;
  streetClosure: boolean;
  sidewalkUseOrClosure: boolean;
  parkingLotUse: boolean;
  parkingSpacesBlocked: boolean;
  trafficControlNeeded: boolean;
  rightOfWayUse: boolean;
  expectedAttendance: number;
  vendorCount: number;
  temporaryStructure: boolean;
  tentOrCanopy: boolean;
  tentSizeRange: string | null;
  temporaryStageOrPlatform: boolean;
  generatorUse: boolean;
  openFlame: boolean;
  cookingHeatSource: boolean;
  propaneOrFuelUse: boolean;
  signage: boolean;
  temporarySignage: boolean;
  banners: boolean;
  ticketedEvent: boolean;
  admissionFee: boolean;
  publicAdvertising: boolean;
  multiVendorEvent: boolean;
  recurringEvent: boolean;
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

export function triggerFieldsMatch(
  triggerFields: RuleTriggerFields,
  facts: IntakeFacts
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

function intakeToFacts(intake: IntakeInput): IntakeFacts {
  const jurisdiction = supportedJurisdictions.find(
    (item) => item.code === intake.city
  );
  const publicProperty =
    intake.publicProperty === true ||
    intake.cityParkOrFacility === true ||
    intake.propertyUse === "public-property" ||
    intake.propertyUse === "park-or-plaza";
  const privateProperty =
    intake.privateProperty === true ||
    intake.propertyUse === "private-property" ||
    intake.propertyUse === "parking-lot" ||
    intake.propertyUse === "licensed-venue";
  const streetOrParkingImpact =
    intake.hasStreetSidewalkOrParkingImpact ||
    intake.streetClosure === true ||
    intake.sidewalkUseOrClosure === true ||
    intake.parkingSpacesBlocked === true ||
    intake.trafficControlNeeded === true ||
    intake.rightOfWayUse === true;
  const temporaryStructure =
    intake.hasTemporaryStructure ||
    intake.tentOrCanopy === true ||
    intake.temporaryStageOrPlatform === true;
  const foodTruckOrMobileFoodUnit =
    intake.hasFoodTruck || intake.foodTruckOrMobileFoodUnit === true;
  const alcoholPresent =
    intake.hasAlcohol ||
    intake.alcoholPresent === true ||
    intake.alcoholSold === true ||
    intake.alcoholServedFree === true ||
    intake.alcoholByob === true ||
    intake.alcoholOnPublicProperty === true;
  const signage = intake.temporarySignage === true || intake.banners === true;

  return {
    jurisdictionCode: jurisdiction?.jurisdictionCode ?? null,
    city: jurisdiction?.city ?? null,
    county: intake.county,
    state: jurisdiction?.state ?? "AZ",
    useCase: intake.useCase,
    eventType: intake.eventType,
    foodService:
      intake.hasFood ||
      intake.foodIsPrepackaged === true ||
      intake.foodIsOpenOrPreparedOnSite === true ||
      intake.foodRequiresTemperatureControl === true ||
      intake.foodSampling === true ||
      intake.drinksWithIceOrGarnish === true,
    foodTruck: foodTruckOrMobileFoodUnit,
    foodIsPrepackaged: intake.foodIsPrepackaged === true,
    foodIsOpenOrPreparedOnSite: intake.foodIsOpenOrPreparedOnSite === true,
    foodRequiresTemperatureControl:
      intake.foodRequiresTemperatureControl === true,
    foodSampling: intake.foodSampling === true,
    drinksWithIceOrGarnish: intake.drinksWithIceOrGarnish === true,
    foodTruckOrMobileFoodUnit,
    commissaryOrBaseOfOperations: intake.commissaryOrBaseOfOperations === true,
    believesFoodExemptionMayApply:
      intake.believesFoodExemptionMayApply === true,
    retailSales: intake.hasRetailSales,
    alcohol: alcoholPresent,
    alcoholPresent,
    alcoholSold: intake.alcoholSold === true,
    alcoholServedFree: intake.alcoholServedFree === true,
    alcoholByob: intake.alcoholByob === true,
    alcoholOnPublicProperty:
      intake.alcoholOnPublicProperty === true ||
      (alcoholPresent && publicProperty),
    amplifiedSound: intake.hasAmplifiedSound,
    publicProperty,
    privateProperty,
    cityParkOrFacility:
      intake.cityParkOrFacility === true || intake.propertyUse === "park-or-plaza",
    venueOrPropertyOwnerPermission:
      intake.venueOrPropertyOwnerPermission === true,
    indoorOrOutdoor: intake.indoorOrOutdoor ?? null,
    sidewalkOrStreetClosure: streetOrParkingImpact,
    streetClosure:
      intake.streetClosure === true ||
      intake.hasStreetSidewalkOrParkingImpact === true,
    sidewalkUseOrClosure:
      intake.sidewalkUseOrClosure === true ||
      intake.hasStreetSidewalkOrParkingImpact === true,
    parkingLotUse:
      intake.parkingLotUse === true ||
      intake.propertyUse === "parking-lot" ||
      intake.hasStreetSidewalkOrParkingImpact === true,
    parkingSpacesBlocked:
      intake.parkingSpacesBlocked === true ||
      intake.hasStreetSidewalkOrParkingImpact === true,
    trafficControlNeeded:
      intake.trafficControlNeeded === true ||
      intake.hasStreetSidewalkOrParkingImpact === true,
    rightOfWayUse:
      intake.rightOfWayUse === true ||
      intake.streetClosure === true ||
      intake.sidewalkUseOrClosure === true ||
      intake.hasStreetSidewalkOrParkingImpact === true,
    expectedAttendance: intake.expectedAttendance,
    vendorCount: intake.vendorCount,
    temporaryStructure,
    tentOrCanopy:
      intake.tentOrCanopy === true || intake.hasTemporaryStructure === true,
    tentSizeRange: intake.tentSizeRange ?? null,
    temporaryStageOrPlatform:
      intake.temporaryStageOrPlatform === true ||
      intake.hasTemporaryStructure === true,
    generatorUse: intake.hasGenerator,
    openFlame:
      intake.hasOpenFlame ||
      intake.cookingHeatSource === true ||
      intake.propaneOrFuelUse === true,
    cookingHeatSource: intake.cookingHeatSource === true,
    propaneOrFuelUse: intake.propaneOrFuelUse === true,
    signage,
    temporarySignage: intake.temporarySignage === true,
    banners: intake.banners === true,
    ticketedEvent: intake.ticketedEvent === true,
    admissionFee: intake.admissionFee === true,
    publicAdvertising: intake.publicAdvertising === true,
    multiVendorEvent: intake.vendorCount > 1,
    recurringEvent: intake.recurrence === "recurring" || intake.recurringEvent === true
  };
}

function parseTriggerFields(rule: EngineRuleRecord) {
  try {
    return JSON.parse(rule.triggerFields) as RuleTriggerFields;
  } catch {
    return null;
  }
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
