import { NextResponse } from "next/server";
import {
  buildRequirementResultTrace,
  parseEventFactsDocument
} from "@/lib/event-facts";
import {
  buildEvidenceChecklistForEventFacts
} from "@/lib/rule-engine";
import {
  buildReadinessRoute,
  buildSimulatedEventFacts,
  compareRequirementRoutes,
  simulatorChangeSchema
} from "@/lib/readiness-route";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      eventFacts?: unknown;
      changes?: unknown;
    };
    const eventFacts = parseEventFactsDocument(body.eventFacts);
    const changes = simulatorChangeSchema.parse(body.changes ?? {});
    const baseItems = await buildEvidenceChecklistForEventFacts(eventFacts);
    const changedEventFacts = buildSimulatedEventFacts(eventFacts, changes);
    const changedItems = await buildEvidenceChecklistForEventFacts(changedEventFacts);
    const changedRequirementResults = changedItems.map((item) =>
      buildRequirementResultTrace(item, {
        factKeys: item.relevantFactKeys,
        ruleVersion: item.ruleVersion,
        sourceId: item.sourceId ?? undefined,
        matchedConditions: item.matchedConditions.map(
          (condition) =>
            `${condition.label}: expected ${condition.expected}; actual ${condition.actual}.`
        ),
        unknownConditions: item.unknownConditions.map(
          (condition) =>
            `${condition.label}: expected ${condition.expected}; actual ${condition.actual}.`
        ),
        evaluationTimestamp: item.evaluationTimestamp,
        knownUncertainty: item.unknownConditions.map((condition) => condition.label)
      })
    );
    const comparison = compareRequirementRoutes({
      baseEventFacts: eventFacts,
      changedEventFacts,
      baseItems,
      changedItems
    });
    const route = buildReadinessRoute({
      eventFacts: changedEventFacts,
      checklistItems: changedItems,
      requirementResults: changedRequirementResults,
      nextActionTitle: changedItems[0]?.title ?? null
    });

    return NextResponse.json({
      route,
      comparison
    });
  } catch {
    return NextResponse.json(
      { message: "We could not compare that route change yet." },
      { status: 400 }
    );
  }
}
