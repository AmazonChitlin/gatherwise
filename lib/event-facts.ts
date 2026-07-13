import { z } from "zod";
import { supportedJurisdictions } from "@/lib/config";
import { intakeSchema, type IntakeInput } from "@/lib/schemas";
import type { ChecklistItem } from "@/lib/rule-engine";
import type { Confidence, JurisdictionType } from "@/lib/types";

export const EVENT_FACTS_SCHEMA_VERSION = "2026-07-13";

export const eventFactGroups = [
  "event-basics",
  "place-and-access",
  "attendance-and-operations",
  "food-and-sales",
  "structures-and-equipment",
  "sound-and-alcohol"
] as const;

export type EventFactGroup = (typeof eventFactGroups)[number];
export type EventFactFieldKey = keyof IntakeInput;
export type EventFactStatus = "provided" | "extracted" | "confirmed" | "unknown";
export type UserFacingFactState = "confirmed" | "needs_review" | "unknown";
export type EventFactValueType = "string" | "number" | "boolean" | "enum" | "date";

export type EventFactValue = string | number | boolean | null;

export type RuleTriggerFacts = {
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

const fieldMetadata = {
  eventName: {
    label: "Event or business name",
    group: "event-basics",
    valueType: "string"
  },
  city: {
    label: "City or rule area",
    group: "place-and-access",
    valueType: "enum"
  },
  county: {
    label: "County",
    group: "place-and-access",
    valueType: "enum"
  },
  useCase: {
    label: "Use case",
    group: "event-basics",
    valueType: "enum"
  },
  eventType: {
    label: "Event type",
    group: "event-basics",
    valueType: "enum"
  },
  propertyUse: {
    label: "Property or venue type",
    group: "place-and-access",
    valueType: "enum"
  },
  expectedAttendance: {
    label: "Expected attendance",
    group: "attendance-and-operations",
    valueType: "number"
  },
  vendorCount: {
    label: "Vendor or host count",
    group: "attendance-and-operations",
    valueType: "number"
  },
  eventDate: {
    label: "Event date",
    group: "event-basics",
    valueType: "date"
  },
  recurrence: {
    label: "Recurrence",
    group: "event-basics",
    valueType: "enum"
  },
  hasFood: {
    label: "Any food service",
    group: "food-and-sales",
    valueType: "boolean"
  },
  hasFoodTruck: {
    label: "Any food truck",
    group: "food-and-sales",
    valueType: "boolean"
  },
  hasRetailSales: {
    label: "Retail sales",
    group: "food-and-sales",
    valueType: "boolean"
  },
  hasAlcohol: {
    label: "Alcohol involved",
    group: "sound-and-alcohol",
    valueType: "boolean"
  },
  hasAmplifiedSound: {
    label: "Amplified sound",
    group: "sound-and-alcohol",
    valueType: "boolean"
  },
  hasTemporaryStructure: {
    label: "Temporary structure",
    group: "structures-and-equipment",
    valueType: "boolean"
  },
  hasGenerator: {
    label: "Generator use",
    group: "structures-and-equipment",
    valueType: "boolean"
  },
  hasOpenFlame: {
    label: "Open flame",
    group: "structures-and-equipment",
    valueType: "boolean"
  },
  hasStreetSidewalkOrParkingImpact: {
    label: "Street, sidewalk, or parking impact",
    group: "place-and-access",
    valueType: "boolean"
  },
  foodIsPrepackaged: {
    label: "Food is prepackaged",
    group: "food-and-sales",
    valueType: "boolean"
  },
  foodIsOpenOrPreparedOnSite: {
    label: "Food is prepared on site",
    group: "food-and-sales",
    valueType: "boolean"
  },
  foodRequiresTemperatureControl: {
    label: "Food needs temperature control",
    group: "food-and-sales",
    valueType: "boolean"
  },
  foodSampling: {
    label: "Food sampling",
    group: "food-and-sales",
    valueType: "boolean"
  },
  drinksWithIceOrGarnish: {
    label: "Drinks with ice or garnish",
    group: "food-and-sales",
    valueType: "boolean"
  },
  foodTruckOrMobileFoodUnit: {
    label: "Mobile food unit",
    group: "food-and-sales",
    valueType: "boolean"
  },
  commissaryOrBaseOfOperations: {
    label: "Commissary or base of operations",
    group: "food-and-sales",
    valueType: "boolean"
  },
  believesFoodExemptionMayApply: {
    label: "Possible food exemption",
    group: "food-and-sales",
    valueType: "boolean"
  },
  tentOrCanopy: {
    label: "Tent or canopy",
    group: "structures-and-equipment",
    valueType: "boolean"
  },
  tentSizeRange: {
    label: "Tent size range",
    group: "structures-and-equipment",
    valueType: "enum"
  },
  temporaryStageOrPlatform: {
    label: "Temporary stage or platform",
    group: "structures-and-equipment",
    valueType: "boolean"
  },
  cookingHeatSource: {
    label: "Cooking heat source",
    group: "structures-and-equipment",
    valueType: "boolean"
  },
  propaneOrFuelUse: {
    label: "Propane or fuel use",
    group: "structures-and-equipment",
    valueType: "boolean"
  },
  streetClosure: {
    label: "Street closure",
    group: "place-and-access",
    valueType: "boolean"
  },
  sidewalkUseOrClosure: {
    label: "Sidewalk use or closure",
    group: "place-and-access",
    valueType: "boolean"
  },
  parkingLotUse: {
    label: "Parking lot use",
    group: "place-and-access",
    valueType: "boolean"
  },
  parkingSpacesBlocked: {
    label: "Parking spaces blocked",
    group: "place-and-access",
    valueType: "boolean"
  },
  trafficControlNeeded: {
    label: "Traffic control needed",
    group: "place-and-access",
    valueType: "boolean"
  },
  rightOfWayUse: {
    label: "Right of way use",
    group: "place-and-access",
    valueType: "boolean"
  },
  alcoholPresent: {
    label: "Alcohol present",
    group: "sound-and-alcohol",
    valueType: "boolean"
  },
  alcoholSold: {
    label: "Alcohol sold",
    group: "sound-and-alcohol",
    valueType: "boolean"
  },
  alcoholServedFree: {
    label: "Alcohol served free",
    group: "sound-and-alcohol",
    valueType: "boolean"
  },
  alcoholByob: {
    label: "Bring your own alcohol",
    group: "sound-and-alcohol",
    valueType: "boolean"
  },
  alcoholOnPublicProperty: {
    label: "Alcohol on public property",
    group: "sound-and-alcohol",
    valueType: "boolean"
  },
  temporarySignage: {
    label: "Temporary signage",
    group: "attendance-and-operations",
    valueType: "boolean"
  },
  banners: {
    label: "Banners",
    group: "attendance-and-operations",
    valueType: "boolean"
  },
  ticketedEvent: {
    label: "Ticketed event",
    group: "attendance-and-operations",
    valueType: "boolean"
  },
  admissionFee: {
    label: "Admission fee",
    group: "attendance-and-operations",
    valueType: "boolean"
  },
  publicAdvertising: {
    label: "Public advertising",
    group: "attendance-and-operations",
    valueType: "boolean"
  },
  cityParkOrFacility: {
    label: "City park or facility",
    group: "place-and-access",
    valueType: "boolean"
  },
  privateProperty: {
    label: "Private property",
    group: "place-and-access",
    valueType: "boolean"
  },
  publicProperty: {
    label: "Public property",
    group: "place-and-access",
    valueType: "boolean"
  },
  venueOrPropertyOwnerPermission: {
    label: "Venue or property owner permission",
    group: "place-and-access",
    valueType: "boolean"
  },
  indoorOrOutdoor: {
    label: "Indoor or outdoor",
    group: "place-and-access",
    valueType: "enum"
  },
  recurringEvent: {
    label: "Recurring event detail",
    group: "attendance-and-operations",
    valueType: "boolean"
  }
} as const satisfies Record<
  EventFactFieldKey,
  {
    label: string;
    group: EventFactGroup;
    valueType: EventFactValueType;
  }
>;

const eventFactStatusSchema = z.enum([
  "provided",
  "extracted",
  "confirmed",
  "unknown"
]);

const confidenceSchema = z.enum(["high", "medium", "low"]);

const eventFactSchema = z.object({
  key: z.string(),
  label: z.string(),
  group: z.enum(eventFactGroups),
  valueType: z.enum(["string", "number", "boolean", "enum", "date"]),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
  status: eventFactStatusSchema,
  evidenceTextSpan: z
    .object({
      text: z.string().min(1),
      start: z.number().int().min(0).optional(),
      end: z.number().int().min(0).optional(),
      sourceId: z.string().min(1).optional()
    })
    .optional(),
  internalConfidence: confidenceSchema.optional(),
  confirmedAt: z.string().datetime().optional()
});

const jurisdictionSnapshotSchema = z.object({
  code: z.string().min(1),
  jurisdictionCode: z.string().nullable(),
  city: z.string().nullable(),
  county: z.string(),
  state: z.string(),
  label: z.string(),
  supported: z.boolean()
});

const eventFactsDocumentSchema = z.object({
  schemaVersion: z.string().min(1),
  jurisdiction: jurisdictionSnapshotSchema,
  dateScope: z.object({
    eventDate: z.string().nullable(),
    recurrence: z.string().nullable()
  }),
  locationScope: z.object({
    cityCode: z.string().nullable(),
    cityName: z.string().nullable(),
    county: z.string(),
    propertyUse: z.string().nullable()
  }),
  facts: z.array(eventFactSchema)
});

const officialSourceSchema = z.object({
  sourceId: z.string().min(1),
  sourceName: z.string().min(1),
  sourceUrl: z.string().url(),
  reviewDate: z.string().nullable(),
  jurisdiction: z.object({
    name: z.string().min(1),
    type: z.enum(["city", "county", "state", "venue", "organizer"])
  })
});

const ruleEvaluationSchema = z.object({
  ruleId: z.string().min(1),
  ruleVersion: z.string().min(1),
  relevantFactKeys: z.array(z.string()).min(1),
  jurisdictionCode: z.string().nullable(),
  knownUncertainty: z.array(z.string())
});

const requirementResultSchema = z.object({
  resultId: z.string().min(1),
  title: z.string().min(1),
  requirementLevel: z.string().min(1),
  ruleEvaluation: ruleEvaluationSchema,
  officialSource: officialSourceSchema
});

const storedIntakeEnvelopeSchema = z.object({
  schemaVersion: z.string().optional(),
  intake: z.record(z.any()).optional(),
  eventFacts: eventFactsDocumentSchema.optional()
});

export type EventFact<T extends EventFactValue = EventFactValue> = Omit<
  z.infer<typeof eventFactSchema>,
  "value" | "key"
> & {
  key: EventFactFieldKey;
  value: T;
};

export type EventFactsDocument = Omit<
  z.infer<typeof eventFactsDocumentSchema>,
  "facts"
> & {
  facts: EventFact[];
};

export type OfficialSource = z.infer<typeof officialSourceSchema>;
export type RuleEvaluation = z.infer<typeof ruleEvaluationSchema>;
export type RequirementResult = z.infer<typeof requirementResultSchema>;

export type StoredIntakePayload = {
  schemaVersion?: string;
  intake: Partial<IntakeInput>;
  eventFacts?: EventFactsDocument;
};

type EventFactOverrides = Partial<
  Record<
    EventFactFieldKey,
    Partial<
      Pick<
        EventFact,
        "value" | "status" | "evidenceTextSpan" | "internalConfidence" | "confirmedAt"
      >
    >
  >
>;

function buildJurisdictionSnapshot(intake: IntakeInput) {
  const jurisdiction = supportedJurisdictions.find((item) => item.code === intake.city);

  return {
    code: intake.city,
    jurisdictionCode: jurisdiction?.jurisdictionCode ?? null,
    city: jurisdiction?.city ?? null,
    county: intake.county,
    state: jurisdiction?.state ?? "AZ",
    label: jurisdiction?.label ?? jurisdiction?.city ?? intake.city,
    supported: Boolean(jurisdiction)
  };
}

function normalizeFactValue(
  value: unknown,
  valueType: EventFactValueType
): EventFactValue {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (valueType === "number") {
    return typeof value === "number" ? value : Number(value);
  }

  if (valueType === "boolean") {
    return value === true;
  }

  return String(value);
}

function toFactRecord(document: EventFactsDocument) {
  return Object.fromEntries(document.facts.map((fact) => [fact.key, fact])) as Record<
    EventFactFieldKey,
    EventFact | undefined
  >;
}

export function intakeToEventFacts(
  intake: IntakeInput,
  options?: {
    defaultStatus?: Exclude<EventFactStatus, "unknown">;
    overrides?: EventFactOverrides;
  }
): EventFactsDocument {
  const defaultStatus = options?.defaultStatus ?? "provided";

  const facts = (Object.keys(fieldMetadata) as EventFactFieldKey[]).map((key) => {
    const metadata = fieldMetadata[key];
    const override = options?.overrides?.[key];
    const baseValue = normalizeFactValue(intake[key], metadata.valueType);
    const overriddenValue =
      override && "value" in override
        ? normalizeFactValue(override.value, metadata.valueType)
        : baseValue;
    const status =
      override?.status ??
      (overriddenValue === null ? "unknown" : defaultStatus);

    return {
      key,
      label: metadata.label,
      group: metadata.group,
      valueType: metadata.valueType,
      value: status === "unknown" ? null : overriddenValue,
      status,
      evidenceTextSpan: override?.evidenceTextSpan,
      internalConfidence: override?.internalConfidence,
      confirmedAt: override?.confirmedAt
    } satisfies EventFact;
  });

  const document: EventFactsDocument = {
    schemaVersion: EVENT_FACTS_SCHEMA_VERSION,
    jurisdiction: buildJurisdictionSnapshot(intake),
    dateScope: {
      eventDate: intake.eventDate,
      recurrence: intake.recurrence
    },
    locationScope: {
      cityCode: intake.city,
      cityName: buildJurisdictionSnapshot(intake).city,
      county: intake.county,
      propertyUse: intake.propertyUse
    },
    facts
  };

  return parseEventFactsDocument(document);
}

export function parseEventFactsDocument(value: unknown) {
  const result = eventFactsDocumentSchema.safeParse(value);

  if (!result.success) {
    throw new Error("Invalid EventFacts document.");
  }

  return result.data as EventFactsDocument;
}

export function serializeEventFactsDocument(document: EventFactsDocument) {
  return JSON.stringify(parseEventFactsDocument(document));
}

export function parseStoredIntakePayload(rawAnswers: string | null): StoredIntakePayload {
  if (!rawAnswers) {
    return { intake: {} };
  }

  try {
    const parsed = JSON.parse(rawAnswers) as unknown;

    if (!parsed || typeof parsed !== "object") {
      return { intake: {} };
    }

    const envelope = storedIntakeEnvelopeSchema.safeParse(parsed);
    if (envelope.success && (envelope.data.intake || envelope.data.eventFacts)) {
      const intake = sanitizePartialIntake(
        envelope.data.intake ??
          (envelope.data.eventFacts
            ? eventFactsToIntakePatch(envelope.data.eventFacts as EventFactsDocument)
            : {})
      );

      return {
        schemaVersion: envelope.data.schemaVersion,
        intake,
        eventFacts: envelope.data.eventFacts as EventFactsDocument | undefined
      };
    }

    return {
      intake: sanitizePartialIntake(parsed)
    };
  } catch {
    return { intake: {} };
  }
}

export function serializeStoredIntakePayload(
  intake: IntakeInput,
  eventFacts = intakeToEventFacts(intake)
) {
  return JSON.stringify({
    schemaVersion: EVENT_FACTS_SCHEMA_VERSION,
    intake,
    eventFacts
  });
}

export function eventFactsToIntakePatch(document: EventFactsDocument) {
  const patch: Partial<IntakeInput> = {};

  for (const fact of document.facts) {
    if (fact.status === "unknown" || fact.value === null) {
      continue;
    }

    patch[fact.key] = coerceFactValue(fact) as never;
  }

  return patch;
}

export function mergeEventFactsIntoIntake(
  document: EventFactsDocument,
  fallback: IntakeInput
) {
  return intakeSchema.parse({
    ...fallback,
    ...eventFactsToIntakePatch(document)
  });
}

export function eventFactsToRuleEngineFacts(
  document: EventFactsDocument
): RuleTriggerFacts {
  const facts = toFactRecord(document);
  const cityCode = stringValue(facts.city) ?? document.locationScope.cityCode ?? "phoenix";
  const county = stringValue(facts.county) ?? document.locationScope.county;
  const jurisdiction = supportedJurisdictions.find((item) => item.code === cityCode);
  const propertyUse = stringValue(facts.propertyUse);
  const hasStreetImpact = booleanValue(facts.hasStreetSidewalkOrParkingImpact);
  const hasTemporaryStructure = booleanValue(facts.hasTemporaryStructure);
  const hasFoodTruck = booleanValue(facts.hasFoodTruck);
  const hasAlcohol = booleanValue(facts.hasAlcohol);
  const publicProperty =
    booleanValue(facts.publicProperty) ||
    booleanValue(facts.cityParkOrFacility) ||
    propertyUse === "public-property" ||
    propertyUse === "park-or-plaza";
  const privateProperty =
    booleanValue(facts.privateProperty) ||
    propertyUse === "private-property" ||
    propertyUse === "parking-lot" ||
    propertyUse === "licensed-venue";
  const streetOrParkingImpact =
    hasStreetImpact ||
    booleanValue(facts.streetClosure) ||
    booleanValue(facts.sidewalkUseOrClosure) ||
    booleanValue(facts.parkingSpacesBlocked) ||
    booleanValue(facts.trafficControlNeeded) ||
    booleanValue(facts.rightOfWayUse);
  const foodTruckOrMobileFoodUnit =
    hasFoodTruck || booleanValue(facts.foodTruckOrMobileFoodUnit);
  const alcoholPresent =
    hasAlcohol ||
    booleanValue(facts.alcoholPresent) ||
    booleanValue(facts.alcoholSold) ||
    booleanValue(facts.alcoholServedFree) ||
    booleanValue(facts.alcoholByob) ||
    booleanValue(facts.alcoholOnPublicProperty);
  const signage =
    booleanValue(facts.temporarySignage) || booleanValue(facts.banners);

  return {
    jurisdictionCode: jurisdiction?.jurisdictionCode ?? document.jurisdiction.jurisdictionCode,
    city: jurisdiction?.city ?? document.jurisdiction.city,
    county,
    state: jurisdiction?.state ?? document.jurisdiction.state ?? "AZ",
    useCase: stringValue(facts.useCase) ?? "multi-vendor-market",
    eventType: stringValue(facts.eventType) ?? "other",
    foodService:
      booleanValue(facts.hasFood) ||
      booleanValue(facts.foodIsPrepackaged) ||
      booleanValue(facts.foodIsOpenOrPreparedOnSite) ||
      booleanValue(facts.foodRequiresTemperatureControl) ||
      booleanValue(facts.foodSampling) ||
      booleanValue(facts.drinksWithIceOrGarnish),
    foodTruck: foodTruckOrMobileFoodUnit,
    foodIsPrepackaged: booleanValue(facts.foodIsPrepackaged),
    foodIsOpenOrPreparedOnSite: booleanValue(facts.foodIsOpenOrPreparedOnSite),
    foodRequiresTemperatureControl: booleanValue(
      facts.foodRequiresTemperatureControl
    ),
    foodSampling: booleanValue(facts.foodSampling),
    drinksWithIceOrGarnish: booleanValue(facts.drinksWithIceOrGarnish),
    foodTruckOrMobileFoodUnit,
    commissaryOrBaseOfOperations: booleanValue(facts.commissaryOrBaseOfOperations),
    believesFoodExemptionMayApply: booleanValue(
      facts.believesFoodExemptionMayApply
    ),
    retailSales: booleanValue(facts.hasRetailSales),
    alcohol: alcoholPresent,
    alcoholPresent,
    alcoholSold: booleanValue(facts.alcoholSold),
    alcoholServedFree: booleanValue(facts.alcoholServedFree),
    alcoholByob: booleanValue(facts.alcoholByob),
    alcoholOnPublicProperty:
      booleanValue(facts.alcoholOnPublicProperty) ||
      (alcoholPresent && publicProperty),
    amplifiedSound: booleanValue(facts.hasAmplifiedSound),
    publicProperty,
    privateProperty,
    cityParkOrFacility:
      booleanValue(facts.cityParkOrFacility) || propertyUse === "park-or-plaza",
    venueOrPropertyOwnerPermission: booleanValue(
      facts.venueOrPropertyOwnerPermission
    ),
    indoorOrOutdoor: stringValue(facts.indoorOrOutdoor),
    sidewalkOrStreetClosure: streetOrParkingImpact,
    streetClosure: booleanValue(facts.streetClosure) || hasStreetImpact,
    sidewalkUseOrClosure:
      booleanValue(facts.sidewalkUseOrClosure) || hasStreetImpact,
    parkingLotUse:
      booleanValue(facts.parkingLotUse) ||
      propertyUse === "parking-lot" ||
      hasStreetImpact,
    parkingSpacesBlocked:
      booleanValue(facts.parkingSpacesBlocked) || hasStreetImpact,
    trafficControlNeeded:
      booleanValue(facts.trafficControlNeeded) || hasStreetImpact,
    rightOfWayUse:
      booleanValue(facts.rightOfWayUse) ||
      booleanValue(facts.streetClosure) ||
      booleanValue(facts.sidewalkUseOrClosure) ||
      hasStreetImpact,
    expectedAttendance: numberValue(facts.expectedAttendance),
    vendorCount: numberValue(facts.vendorCount),
    temporaryStructure:
      hasTemporaryStructure ||
      booleanValue(facts.tentOrCanopy) ||
      booleanValue(facts.temporaryStageOrPlatform),
    tentOrCanopy:
      booleanValue(facts.tentOrCanopy) || hasTemporaryStructure,
    tentSizeRange: stringValue(facts.tentSizeRange),
    temporaryStageOrPlatform:
      booleanValue(facts.temporaryStageOrPlatform) || hasTemporaryStructure,
    generatorUse: booleanValue(facts.hasGenerator),
    openFlame:
      booleanValue(facts.hasOpenFlame) ||
      booleanValue(facts.cookingHeatSource) ||
      booleanValue(facts.propaneOrFuelUse),
    cookingHeatSource: booleanValue(facts.cookingHeatSource),
    propaneOrFuelUse: booleanValue(facts.propaneOrFuelUse),
    signage,
    temporarySignage: booleanValue(facts.temporarySignage),
    banners: booleanValue(facts.banners),
    ticketedEvent: booleanValue(facts.ticketedEvent),
    admissionFee: booleanValue(facts.admissionFee),
    publicAdvertising: booleanValue(facts.publicAdvertising),
    multiVendorEvent: numberValue(facts.vendorCount) > 1,
    recurringEvent:
      stringValue(facts.recurrence) === "recurring" ||
      booleanValue(facts.recurringEvent)
  };
}

export function factStatusToUserFacingState(status: EventFactStatus): UserFacingFactState {
  if (status === "unknown") {
    return "unknown";
  }

  if (status === "confirmed") {
    return "confirmed";
  }

  return "needs_review";
}

export function buildRequirementResultTrace(
  item: ChecklistItem,
  options?: {
    factKeys?: EventFactFieldKey[];
    ruleVersion?: string;
    sourceId?: string;
    knownUncertainty?: string[];
  }
): RequirementResult {
  return requirementResultSchema.parse({
    resultId: item.slug,
    title: item.title,
    requirementLevel: item.requirementLevel,
    ruleEvaluation: {
      ruleId: item.ruleId,
      ruleVersion: options?.ruleVersion ?? "legacy-intake-engine",
      relevantFactKeys: options?.factKeys ?? ["eventType", "city"],
      jurisdictionCode: null,
      knownUncertainty: options?.knownUncertainty ?? []
    },
    officialSource: {
      sourceId: options?.sourceId ?? `${item.slug}:source`,
      sourceName: item.sourceName,
      sourceUrl: item.sourceUrl,
      reviewDate: item.lastVerified ?? null,
      jurisdiction: {
        name: item.jurisdiction,
        type: item.jurisdictionType
      }
    }
  });
}

export function buildRequirementResultsFromChecklist(
  items: ChecklistItem[],
  options?: {
    factKeysByRuleId?: Partial<Record<string, EventFactFieldKey[]>>;
    ruleVersion?: string;
    jurisdictionCode?: string | null;
  }
) {
  return items.map((item) =>
    requirementResultSchema.parse({
      ...buildRequirementResultTrace(item, {
        factKeys: options?.factKeysByRuleId?.[item.ruleId],
        ruleVersion: options?.ruleVersion
      }),
      ruleEvaluation: {
        ...buildRequirementResultTrace(item, {
          factKeys: options?.factKeysByRuleId?.[item.ruleId],
          ruleVersion: options?.ruleVersion
        }).ruleEvaluation,
        jurisdictionCode: options?.jurisdictionCode ?? null
      }
    })
  );
}

function sanitizePartialIntake(value: unknown) {
  const result = intakeSchema.partial().safeParse(value);
  return result.success ? result.data : {};
}

function coerceFactValue(fact: EventFact) {
  if (fact.valueType === "boolean") {
    return fact.value === true;
  }

  if (fact.valueType === "number") {
    return typeof fact.value === "number" ? fact.value : Number(fact.value);
  }

  return fact.value;
}

function booleanValue(fact?: EventFact) {
  return fact?.status !== "unknown" && fact?.value === true;
}

function stringValue(fact?: EventFact) {
  return fact?.status === "unknown" || typeof fact?.value !== "string"
    ? null
    : fact.value;
}

function numberValue(fact?: EventFact) {
  return fact?.status === "unknown" || typeof fact?.value !== "number"
    ? 0
    : fact.value;
}

export function groupEventFacts(document: EventFactsDocument) {
  const groups = new Map<EventFactGroup, EventFact[]>();

  for (const group of eventFactGroups) {
    groups.set(group, []);
  }

  for (const fact of document.facts) {
    groups.get(fact.group)?.push(fact);
  }

  return groups;
}

export function isSupportedJurisdiction(document: EventFactsDocument) {
  return document.jurisdiction.supported;
}

export function getFactMetadata(key: EventFactFieldKey) {
  return fieldMetadata[key];
}

export function buildOfficialSource(
  source: Pick<OfficialSource, "sourceId" | "sourceName" | "sourceUrl" | "reviewDate">,
  jurisdiction: {
    name: string;
    type: JurisdictionType;
  }
) {
  return officialSourceSchema.parse({
    ...source,
    jurisdiction
  });
}
