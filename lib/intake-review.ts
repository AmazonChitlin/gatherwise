import {
  countyOptions,
  eventTypeOptions,
  recurrenceOptions,
  supportedJurisdictions,
  useCaseOptions,
  venueTypeOptions
} from "@/lib/config";
import { type EventExtractionResult } from "@/lib/ai/extraction";
import { defaultIntakeValues } from "@/lib/intake-defaults";
import {
  eventFactFieldKeys,
  eventFactGroups,
  getFactMetadata,
  type EventFactFieldKey,
  type EventFactGroup,
  type EventFactValue
} from "@/lib/event-facts";
import { ruleSeedData } from "@/prisma/seed-data/rules";
import type { IntakeInput } from "@/lib/schemas";

export type ReviewStatus = "confirmed" | "needs_review" | "unknown";

export type ReviewFact = {
  key: EventFactFieldKey;
  label: string;
  group: EventFactGroup;
  valueType: ReturnType<typeof getFactMetadata>["valueType"];
  value: EventFactValue;
  reviewStatus: ReviewStatus;
  extracted: boolean;
  evidenceText?: string;
};

export type MissingQuestion = {
  key: EventFactFieldKey;
  label: string;
  reason: string;
};

export function buildReviewFacts(result: EventExtractionResult) {
  const extracted = new Map(
    result.facts.map((fact) => [fact.key, fact])
  );

  return eventFactFieldKeys.map((key) => {
    const metadata = getFactMetadata(key);
    const found = extracted.get(key);

    if (!found || found.status === "unknown") {
      return {
        key,
        label: metadata.label,
        group: metadata.group,
        valueType: metadata.valueType,
        value: null,
        reviewStatus: "unknown",
        extracted: false
      } satisfies ReviewFact;
    }

    return {
      key,
      label: metadata.label,
      group: metadata.group,
      valueType: metadata.valueType,
      value: found.value,
      reviewStatus: "needs_review",
      extracted: true,
      evidenceText: found.evidenceText
    } satisfies ReviewFact;
  });
}

export function countReviewStatuses(facts: ReviewFact[]) {
  return facts.reduce(
    (counts, fact) => {
      counts[fact.reviewStatus] += 1;
      return counts;
    },
    { confirmed: 0, needs_review: 0, unknown: 0 } as Record<ReviewStatus, number>
  );
}

export function groupReviewFacts(facts: ReviewFact[]) {
  const groups = new Map<EventFactGroup, ReviewFact[]>();

  for (const group of eventFactGroups) {
    groups.set(group, facts.filter((fact) => fact.group === group));
  }

  return groups;
}

export function reviewFactsToIntakeValues(facts: ReviewFact[]) {
  const values = { ...defaultIntakeValues };

  for (const fact of facts) {
    if (fact.reviewStatus === "unknown" || fact.value === null) {
      continue;
    }

    values[fact.key] = fact.value as never;
  }

  return values;
}

export function reviewFactsToPartialValues(facts: ReviewFact[]) {
  const values: Partial<IntakeInput> = {};

  for (const fact of facts) {
    if (fact.reviewStatus === "unknown" || fact.value === null) {
      continue;
    }

    values[fact.key] = fact.value as never;
  }

  return values;
}

export function buildMissingQuestions(facts: ReviewFact[]) {
  const values = reviewFactsToPartialValues(facts);
  const unknownKeys = new Set(
    facts.filter((fact) => fact.reviewStatus === "unknown").map((fact) => fact.key)
  );
  const jurisdictionCode = supportedJurisdictions.find(
    (item) => item.code === values.city
  )?.jurisdictionCode;
  const candidateReasons = new Map<EventFactFieldKey, string[]>();

  for (const rule of ruleSeedData.filter((item) => item.verificationStatus === "verified")) {
    if (
      jurisdictionCode &&
      ![rule.jurisdiction.code, "az", "az-maricopa"].includes(rule.jurisdiction.code)
    ) {
      continue;
    }

    if (values.useCase && rule.useCase !== values.useCase) {
      const useCases = Array.isArray(rule.triggers.use_cases)
        ? rule.triggers.use_cases
        : rule.triggers.use_case
          ? [rule.triggers.use_case]
          : [];
      if (!useCases.includes(values.useCase)) {
        continue;
      }
    }

    for (const triggerKey of Object.keys(rule.triggers)) {
      const factKey = triggerFieldToFactKey(triggerKey);
      if (!factKey || !unknownKeys.has(factKey)) {
        continue;
      }

      const reasons = candidateReasons.get(factKey) ?? [];
      reasons.push(rule.title);
      candidateReasons.set(factKey, reasons);
    }
  }

  return [...candidateReasons.entries()]
    .sort((left, right) => right[1].length - left[1].length)
    .slice(0, 3)
    .map(([key, titles]) => ({
      key,
      label: getFactMetadata(key).label,
      reason: `This detail may change whether these reviewed items appear: ${titles
        .slice(0, 2)
        .join(" and ")}.`
    }));
}

export function fieldOptions(key: EventFactFieldKey) {
  switch (key) {
    case "city":
      return supportedJurisdictions.map(({ code, label }) => ({ value: code, label }));
    case "county":
      return [...countyOptions];
    case "useCase":
      return [...useCaseOptions];
    case "eventType":
      return [...eventTypeOptions];
    case "propertyUse":
      return [...venueTypeOptions];
    case "recurrence":
      return [...recurrenceOptions];
    case "tentSizeRange":
      return [
        { value: "none", label: "No tent or canopy" },
        { value: "small-under-400-sq-ft", label: "Small, under 400 square feet" },
        {
          value: "large-400-sq-ft-or-more",
          label: "Large, 400 square feet or more"
        },
        { value: "not-sure", label: "Not sure yet" }
      ];
    case "indoorOrOutdoor":
      return [
        { value: "indoor", label: "Indoor" },
        { value: "outdoor", label: "Outdoor" },
        { value: "both", label: "Both indoor and outdoor" },
        { value: "not-sure", label: "Not sure yet" }
      ];
    default:
      return null;
  }
}

function triggerFieldToFactKey(triggerKey: string): EventFactFieldKey | null {
  const map: Partial<Record<string, EventFactFieldKey>> = {
    use_case: "useCase",
    event_type: "eventType",
    food_service: "hasFood",
    food_truck: "hasFoodTruck",
    retail_sales: "hasRetailSales",
    alcohol: "hasAlcohol",
    alcohol_sold: "alcoholSold",
    amplified_sound: "hasAmplifiedSound",
    public_property: "publicProperty",
    private_property: "privateProperty",
    city_park_or_facility: "cityParkOrFacility",
    sidewalk_or_street_closure: "hasStreetSidewalkOrParkingImpact",
    street_closure: "streetClosure",
    parking_spaces_blocked: "parkingSpacesBlocked",
    traffic_control_needed: "trafficControlNeeded",
    right_of_way_use: "rightOfWayUse",
    temporary_structure: "hasTemporaryStructure",
    tent_or_canopy: "tentOrCanopy",
    tent_size_range: "tentSizeRange",
    generator_use: "hasGenerator",
    open_flame: "hasOpenFlame",
    temporary_signage: "temporarySignage",
    banners: "banners",
    ticketed_event: "ticketedEvent",
    public_advertising: "publicAdvertising"
  };

  return map[triggerKey] ?? null;
}
