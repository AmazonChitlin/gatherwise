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
import {
  createRateLimitHeaders,
  enforceRateLimit,
  getClientIdentifier,
  readJsonBody,
  RequestValidationError
} from "@/lib/request-guard";

const simulateRateLimit = {
  limit: 30,
  windowMs: 60_000
} as const;

export async function POST(request: Request) {
  const rateLimit = enforceRateLimit({
    key: `simulate:${getClientIdentifier(request)}`,
    rule: simulateRateLimit
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Too many route comparisons in a short time. Please wait and try again." },
      {
        status: 429,
        headers: createRateLimitHeaders(rateLimit)
      }
    );
  }

  try {
    const body = (await readJsonBody(request)) as {
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
    }, {
      headers: createRateLimitHeaders(rateLimit)
    });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json(
        { message: error.message },
        {
          status: 415,
          headers: createRateLimitHeaders(rateLimit)
        }
      );
    }

    return NextResponse.json(
      { message: "We could not compare that route change yet." },
      {
        status: 400,
        headers: createRateLimitHeaders(rateLimit)
      }
    );
  }
}
