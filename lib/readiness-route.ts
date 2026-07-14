import { z } from "zod";
import { supportedJurisdictions, venueTypeOptions } from "@/lib/config";
import {
  buildRequirementResultTrace,
  eventFactsToIntakePatch,
  getFactMetadata,
  intakeToEventFacts,
  parseEventFactsDocument,
  type EventFact,
  type EventFactFieldKey,
  type EventFactsDocument,
  type RequirementResult
} from "@/lib/event-facts";
import { defaultIntakeValues } from "@/lib/intake-defaults";
import type { EvidenceChecklistItem } from "@/lib/rule-engine";
import { intakeSchema } from "@/lib/schemas";

export const simulatorFieldKeys = [
  "city",
  "propertyUse",
  "expectedAttendance",
  "vendorCount",
  "hasFood",
  "hasAlcohol",
  "hasAmplifiedSound",
  "hasStreetSidewalkOrParkingImpact",
  "streetClosure"
] as const;

export type SimulatorFieldKey = (typeof simulatorFieldKeys)[number];

export type SimulatorChangeSet = Partial<
  Record<SimulatorFieldKey, string | number | boolean>
>;

export type ReadinessRouteNode = {
  id: string;
  kind:
    | "start"
    | "fact"
    | "decision"
    | "requirement"
    | "missing"
    | "source"
    | "end";
  title: string;
  summary: string;
  token: "verified" | "unknown" | "official";
  detailLines: string[];
  sourceId?: string;
  sourceUrl?: string;
};

export type RequirementComparisonItem = {
  ruleId: string;
  title: string;
  explanation: string;
  sourceIds: string[];
};

export type RequirementComparison = {
  changedFactLines: string[];
  addedRequirements: RequirementComparisonItem[];
  removedRequirements: RequirementComparisonItem[];
  changedWarnings: RequirementComparisonItem[];
  unchangedRequirements: RequirementComparisonItem[];
  newlyUnresolvedRequirements: RequirementComparisonItem[];
};

export const simulatorChangeSchema = z.object({
  city: z.enum(
    supportedJurisdictions.map((item) => item.code) as [string, ...string[]]
  ).optional(),
  propertyUse: z.enum(
    venueTypeOptions.map((item) => item.value) as [string, ...string[]]
  ).optional(),
  expectedAttendance: z.number().int().min(1).max(50_000).optional(),
  vendorCount: z.number().int().min(1).max(1_000).optional(),
  hasFood: z.boolean().optional(),
  hasAlcohol: z.boolean().optional(),
  hasAmplifiedSound: z.boolean().optional(),
  hasStreetSidewalkOrParkingImpact: z.boolean().optional(),
  streetClosure: z.boolean().optional()
});

export function buildReadinessRoute(options: {
  eventFacts: EventFactsDocument;
  checklistItems: EvidenceChecklistItem[];
  requirementResults: RequirementResult[];
  nextActionTitle: string | null;
}) {
  const relevantFactKeys = Array.from(
    new Set(options.checklistItems.flatMap((item) => item.relevantFactKeys))
  );
  const factNodes = relevantFactKeys
    .map((key) => options.eventFacts.facts.find((fact) => fact.key === key))
    .filter((fact): fact is EventFact => Boolean(fact))
    .filter((fact) => fact.status === "confirmed" && fact.value !== null)
    .slice(0, 6)
    .map((fact) => ({
      id: `fact:${fact.key}`,
      kind: "fact" as const,
      title: fact.label,
      summary: formatFactValue(fact),
      token: "verified" as const,
      detailLines: [`Confirmed from your details: ${formatFactValue(fact)}.`]
    }));

  const decisionNodes = options.checklistItems.map((item) => ({
    id: `decision:${item.ruleId}`,
    kind: "decision" as const,
    title: `Decision point: ${item.title}`,
    summary:
      item.matchedConditions[0]?.label ??
      "Gatherwise matched a verified rule for this event setup.",
    token: item.unknownConditions.length > 0 ? ("unknown" as const) : ("verified" as const),
    detailLines: [
      ...item.matchedConditions.map(
        (condition) =>
          `${condition.label}: expected ${condition.expected}; actual ${condition.actual}.`
      ),
      ...item.unknownConditions.map(
        (condition) =>
          `${condition.label} is still unknown and may change this route.`
      )
    ]
  }));

  const requirementNodes = options.checklistItems.map((item) => ({
    id: `requirement:${item.ruleId}`,
    kind: "requirement" as const,
    title: item.title,
    summary: item.plainEnglishSummary,
    token: item.unknownConditions.length > 0 ? ("unknown" as const) : ("verified" as const),
    detailLines: [
      `${item.jurisdiction} may need review.`,
      item.leadTimeDays > 0
        ? `Lead time: ${item.leadTimeDays} days.`
        : "Lead time still needs review."
    ]
  }));

  const missingNodes = uniqueUnknownConditions(options.checklistItems).map(
    (condition) => ({
      id: `missing:${condition.key}`,
      kind: "missing" as const,
      title: `Missing-information fork: ${condition.label}`,
      summary: "This detail may change which verified rules appear.",
      token: "unknown" as const,
      detailLines: [condition.reason]
    })
  );

  const sourceNodes = options.requirementResults.map((result) => ({
    id: `source:${result.officialSource.sourceId}`,
    kind: "source" as const,
    title: result.officialSource.sourceName,
    summary: `Source anchor for ${result.title}.`,
    token: "official" as const,
    detailLines: [
      `Source ID: ${result.officialSource.sourceId}.`,
      `Review date: ${result.officialSource.reviewDate ?? "Needs review"}.`
    ],
    sourceId: result.officialSource.sourceId,
    sourceUrl: result.officialSource.sourceUrl
  }));

  return [
    {
      id: "start",
      kind: "start" as const,
      title: "Start: confirmed event",
      summary: `${options.eventFacts.jurisdiction.label} · ${options.eventFacts.dateScope.eventDate ?? "Date needs review"}`,
      token: "verified" as const,
      detailLines: [
        `${options.eventFacts.facts.filter((fact) => fact.status === "confirmed").length} confirmed facts are driving this route.`,
        "The route drawing is decorative. The list itself is the source of meaning."
      ]
    },
    ...factNodes,
    ...decisionNodes,
    ...requirementNodes,
    ...missingNodes,
    ...uniqueById(sourceNodes),
    {
      id: "end",
      kind: "end" as const,
      title: "End state: next best action",
      summary:
        options.nextActionTitle ??
        "Confirm your jurisdiction and the most important requirement first.",
      token: "verified" as const,
      detailLines: [
        options.nextActionTitle
          ? `Start here: ${options.nextActionTitle}.`
          : "Start by confirming the most important next step."
      ]
    }
  ] satisfies ReadinessRouteNode[];
}

export function buildSimulatedEventFacts(
  document: EventFactsDocument,
  changes: SimulatorChangeSet
) {
  const basePatch = eventFactsToIntakePatch(document);
  const parsedChanges = simulatorChangeSchema.parse(changes);
  const intake = intakeSchema.parse({
    ...defaultIntakeValues,
    ...basePatch,
    ...parsedChanges
  });
  const overrides = Object.fromEntries(
    document.facts.map((fact) => [
      fact.key,
      {
        status:
          simulatorFieldKeys.includes(fact.key as SimulatorFieldKey) &&
          fact.key in changes
            ? "confirmed"
            : fact.status,
        value:
          simulatorFieldKeys.includes(fact.key as SimulatorFieldKey) &&
          fact.key in changes
            ? (changes[fact.key as SimulatorFieldKey] ?? null)
            : fact.value
      }
    ])
  );

  return parseEventFactsDocument(
    intakeToEventFacts(intake, {
      defaultStatus: "confirmed",
      overrides
    })
  );
}

export function compareRequirementRoutes(options: {
  baseEventFacts: EventFactsDocument;
  changedEventFacts: EventFactsDocument;
  baseItems: EvidenceChecklistItem[];
  changedItems: EvidenceChecklistItem[];
}) {
  const changedFactLines = buildChangedFactLines(
    options.baseEventFacts,
    options.changedEventFacts
  );
  const baseByRuleId = new Map(options.baseItems.map((item) => [item.ruleId, item]));
  const changedByRuleId = new Map(
    options.changedItems.map((item) => [item.ruleId, item])
  );
  const comparison: RequirementComparison = {
    changedFactLines,
    addedRequirements: [],
    removedRequirements: [],
    changedWarnings: [],
    unchangedRequirements: [],
    newlyUnresolvedRequirements: []
  };

  for (const [ruleId, changed] of changedByRuleId) {
    const base = baseByRuleId.get(ruleId);

    if (!base) {
      const target =
        changed.unknownConditions.length > 0
          ? comparison.newlyUnresolvedRequirements
          : comparison.addedRequirements;
      target.push(toComparisonItem("added", changedFactLines, undefined, changed));
      continue;
    }

    const baseUnknown = signature(base.unknownConditions.map((item) => item.triggerKey));
    const changedUnknown = signature(
      changed.unknownConditions.map((item) => item.triggerKey)
    );

    if (changedUnknown !== baseUnknown) {
      const target =
        base.unknownConditions.length === 0 && changed.unknownConditions.length > 0
          ? comparison.newlyUnresolvedRequirements
          : comparison.changedWarnings;
      target.push(toComparisonItem("changed", changedFactLines, base, changed));
      continue;
    }

    comparison.unchangedRequirements.push(
      toComparisonItem("unchanged", changedFactLines, base, changed)
    );
  }

  for (const [ruleId, base] of baseByRuleId) {
    if (changedByRuleId.has(ruleId)) {
      continue;
    }

    comparison.removedRequirements.push(
      toComparisonItem("removed", changedFactLines, base, undefined)
    );
  }

  return comparison;
}

function buildChangedFactLines(
  baseEventFacts: EventFactsDocument,
  changedEventFacts: EventFactsDocument
) {
  return simulatorFieldKeys.flatMap((key) => {
    const before = baseEventFacts.facts.find((fact) => fact.key === key);
    const after = changedEventFacts.facts.find((fact) => fact.key === key);

    if (!before || !after) {
      return [];
    }

    const beforeValue = formatFactValue(before);
    const afterValue = formatFactValue(after);

    if (beforeValue === afterValue) {
      return [];
    }

    return [
      `${getFactMetadata(key).label} changed from ${beforeValue} to ${afterValue}.`
    ];
  });
}

function toComparisonItem(
  kind: "added" | "removed" | "changed" | "unchanged",
  changedFactLines: string[],
  base: EvidenceChecklistItem | undefined,
  changed: EvidenceChecklistItem | undefined
): RequirementComparisonItem {
  const item = changed ?? base;

  if (!item) {
    throw new Error("Comparison item requires a base or changed item.");
  }

  const changePrefix =
    changedFactLines[0] ?? "The simulated event details changed.";
  const matchedLine = changed?.matchedConditions[0]
    ? `${changed.matchedConditions[0].label} stayed relevant to this route.`
    : base?.matchedConditions[0]
      ? `${base.matchedConditions[0].label} was part of the original route.`
      : "This route came from the deterministic rule trace.";
  const unknownLine = changed?.unknownConditions[0]
    ? `${changed.unknownConditions[0].label} still needs review.`
    : "";

  if (kind === "added") {
    return {
      ruleId: item.ruleId,
      title: item.title,
      explanation: `${changePrefix} This activated ${item.title}. ${matchedLine} ${unknownLine}`.trim(),
      sourceIds: item.sourceId ? [item.sourceId] : []
    };
  }

  if (kind === "removed") {
    return {
      ruleId: item.ruleId,
      title: item.title,
      explanation: `${changePrefix} ${item.title} no longer matched the verified rule trace.`,
      sourceIds: item.sourceId ? [item.sourceId] : []
    };
  }

  if (kind === "changed") {
    return {
      ruleId: item.ruleId,
      title: item.title,
      explanation: `${changePrefix} ${item.title} is now less certain. ${unknownLine || matchedLine}`.trim(),
      sourceIds: item.sourceId ? [item.sourceId] : []
    };
  }

  return {
    ruleId: item.ruleId,
    title: item.title,
    explanation: `${item.title} stayed in the route after the simulated change.`,
    sourceIds: item.sourceId ? [item.sourceId] : []
  };
}

function uniqueUnknownConditions(items: EvidenceChecklistItem[]) {
  const map = new Map<
    string,
    { key: string; label: string; reason: string }
  >();

  for (const item of items) {
    for (const condition of item.unknownConditions) {
      map.set(condition.triggerKey, {
        key: condition.triggerKey,
        label: condition.label,
        reason: `${condition.label} may change whether ${item.title} appears.`
      });
    }
  }

  return [...map.values()];
}

function uniqueById<T extends { id: string }>(items: T[]) {
  const map = new Map(items.map((item) => [item.id, item]));
  return [...map.values()];
}

function formatFactValue(fact: EventFact | string | number | boolean | null) {
  const value =
    typeof fact === "object" && fact !== null && "value" in fact ? fact.value : fact;

  if (value === null) {
    return "Unknown";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

function signature(values: string[]) {
  return [...values].sort().join("|");
}
