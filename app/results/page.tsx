import type { Metadata } from "next";
import { ArrowLeft, ExternalLink } from "lucide-react";
import {
  CivicButtonLink,
  CivicEmptyState,
  CivicStatus,
} from "@/components/civic";
import { ReadinessRouteExperience } from "@/components/readiness-route";
import {
  buildExplanationPacket,
  buildDeterministicFallback,
  createExplanationService,
  createOpenAIExplanationProvider,
  type ExplanationPacket,
} from "@/lib/ai/explanations";
import {
  buildRequirementResultTrace,
  factStatusToUserFacingState,
  getFactMetadata,
  intakeToEventFacts,
  parseEventFactsDocument,
  parseStoredIntakePayload,
  type EventFact,
  type EventFactFieldKey,
  type EventFactsDocument,
  type RequirementResult,
} from "@/lib/event-facts";
import { parseResultsSnapshot } from "@/lib/intake-storage";
import { prisma } from "@/lib/prisma";
import { getDemoGuidedHref, getDemoScenario } from "@/lib/demo-scenarios";
import { buildReadinessRoute } from "@/lib/readiness-route";
import {
  buildEvidenceChecklistForEventFacts,
  type EvidenceChecklistItem,
} from "@/lib/rule-engine";
import { formatTimeline, topItemsToCheckFirst } from "@/lib/results-helpers";
import {
  intakeSchema,
  type IntakeInput,
  type PartialIntakeInput,
} from "@/lib/schemas";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
type IntakeWithUseCase = NonNullable<
  Awaited<ReturnType<typeof getIntakeWithUseCase>>
>;

export const metadata: Metadata = {
  title: "Results",
  description:
    "Review what may apply, why it may apply, and which official sources to check in the Gatherwise Arizona pilot.",
};

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const intakeId = getParam(params.intakeId);
  const snapshot = getParam(params.snapshot);
  const demoSlug = getParam(params.demo);
  const demo = getDemoScenario(demoSlug);
  const intake = intakeId ? await getIntakeWithUseCase(intakeId) : null;
  const snapshotPayload = snapshot ? parseResultsSnapshot(snapshot) : null;
  const storedPayload = intake
    ? parseStoredIntakePayload(intake.rawAnswers)
    : snapshotPayload;
  const intakeInput = intake
    ? toIntakeInput(intake)
    : snapshotPayload?.intake
      ? snapshotPayload.intake
      : null;

  if (!intakeInput) {
    return (
      <main className="civic-results-page civic-results-page--empty">
        <div className="civic-results-wrap">
          <CivicButtonLink href="/intake" variant="outline-light">
            <ArrowLeft className="h-4 w-4" />
            Back to planning
          </CivicButtonLink>
          <CivicEmptyState
            actions={
              <CivicButtonLink href="/intake">Plan an event</CivicButtonLink>
            }
            className="civic-results-empty-state"
            label="No active intake"
            title="No planning details found yet."
          >
            <p>
              Start with the guided form so Gatherwise can show what may apply.
            </p>
          </CivicEmptyState>
        </div>
      </main>
    );
  }

  const eventFacts = normalizeResultsEventFacts(
    storedPayload?.eventFacts,
    intakeInput,
  );
  const checklistItems = await buildEvidenceChecklistForEventFacts(eventFacts);
  const requirementResults = checklistItems.map((item) =>
    buildRequirementResultTrace(item, {
      factKeys: item.relevantFactKeys,
      ruleVersion: item.ruleVersion,
      sourceId: item.sourceId ?? undefined,
      matchedConditions: item.matchedConditions.map(formatConditionSummary),
      unknownConditions: item.unknownConditions.map(formatConditionSummary),
      evaluationTimestamp: item.evaluationTimestamp,
      knownUncertainty: item.unknownConditions.map(
        (condition) => condition.label,
      ),
    }),
  );
  const topItems = topItemsToCheckFirst(checklistItems);
  const timelineItems = formatTimeline(checklistItems);
  const sources = uniqueSources(requirementResults);
  const missingFacts = buildMissingFactRows(eventFacts, checklistItems);
  const nextAction = topItems[0] ?? null;
  const readinessRoute = buildReadinessRoute({
    eventFacts,
    checklistItems,
    requirementResults,
    nextActionTitle: nextAction?.title ?? null,
  });
  const explanationPacket = buildExplanationPacket({
    eventFacts,
    checklistItems,
    requirementResults,
  });
  const explanation = await generateExplanation(explanationPacket);

  if (!eventFacts.jurisdiction.supported) {
    return (
      <UnsupportedResults
        demo={demo}
        eventName={intakeInput.eventName ?? "Event"}
        jurisdiction={eventFacts.jurisdiction.label}
      />
    );
  }

  return (
    <main className="civic-results-page">
      <div className="civic-results-wrap">
        <CivicButtonLink
          className="civic-results-back"
          href="/intake"
          variant="outline-dark"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to planning
        </CivicButtonLink>

        {demo ? (
          <aside className="civic-results-demo" aria-label="Demo scenario">
            <div>
              <CivicStatus tone="active">Fictional demo scenario</CivicStatus>
              <strong>{demo.title}</strong>
              <p>{demo.summary} No login or permanent storage is used.</p>
            </div>
            <a
              className="civic-results-action focus-ring"
              href={getDemoGuidedHref(demo)}
            >
              Reset this sample
            </a>
          </aside>
        ) : null}

        <header className="civic-results-mast">
          <div className="civic-results-mast__intro">
            <p className="civic-data-label-shared">
              Readiness summary · Arizona pilot
            </p>
            <h1>{intakeInput.eventName ?? "Event"} readiness summary</h1>
            <p>
              Based on the details you provided, Gatherwise shows what may
              apply, what still needs review, and where the official source
              starts.
            </p>
          </div>
          <dl className="civic-results-metrics">
            <SummaryItem
              label="Possible requirements"
              value={String(checklistItems.length)}
            />
            <SummaryItem
              label="Missing details"
              value={String(missingFacts.length)}
            />
            <SummaryItem
              label="Official sources"
              value={String(sources.length)}
            />
            <SummaryItem
              label="Jurisdiction"
              value={eventFacts.jurisdiction.label}
            />
          </dl>
          <aside className="civic-results-boundary">
            <CivicStatus tone="verified">Supported pilot result</CivicStatus>
            <p>
              Informational guidance only. Deterministic rules select possible
              requirements and official sources. Human verification is
              recommended.
            </p>
          </aside>
        </header>

        <div className="civic-results-workspace">
          <section className="civic-results-next" aria-labelledby="next-action">
            <span className="civic-results-waypoint" aria-hidden="true">
              01
            </span>
            <div>
              <p className="civic-data-label-shared">
                Most important next action
              </p>
              <h2 id="next-action">
                {nextAction?.title ??
                  "Confirm your jurisdiction and core event details"}
              </h2>
              <p>
                {nextAction
                  ? `${nextAction.jurisdiction} may need attention first, especially if your planning window is ${
                      nextAction.leadTimeDays > 0
                        ? `${nextAction.leadTimeDays} days or less`
                        : "still unconfirmed"
                    }.`
                  : "No verified pilot rules matched these details yet. Check the official source for your city, county, venue, or state agency before moving ahead."}
              </p>
            </div>
          </section>

          <ReadinessRouteExperience
            initialEventFacts={eventFacts}
            initialRoute={readinessRoute}
          />

          <section
            className="civic-results-section civic-results-requirements"
            aria-labelledby="possible-requirements"
          >
            <SectionHeading
              label="Possible requirements"
              title="What may apply"
              id="possible-requirements"
            >
              <p>
                These are deterministic rule results, not legal determinations.
              </p>
            </SectionHeading>
            {checklistItems.length === 0 ? (
              <p className="civic-results-empty-copy">
                No pilot rule records matched these details yet. Check the
                official source directly before you set up.
              </p>
            ) : (
              <div className="civic-requirement-list">
                {checklistItems.map((item, index) => (
                  <RequirementCard
                    index={index}
                    item={item}
                    key={item.ruleId}
                  />
                ))}
              </div>
            )}
          </section>

          <section
            className="civic-results-section civic-results-missing"
            aria-labelledby="missing-information"
          >
            <SectionHeading
              label="Missing information"
              title="What could change the result"
              id="missing-information"
            />
            {missingFacts.length === 0 ? (
              <p className="civic-results-empty-copy">
                No high-value missing details were found in the current
                requirement set.
              </p>
            ) : (
              <ol className="civic-missing-route">
                {missingFacts.map((fact, index) => (
                  <li key={fact.key}>
                    <span aria-hidden="true">F{index + 1}</span>
                    <div>
                      <strong>{fact.label}</strong>
                      <p>{fact.reason}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section
            className="civic-results-section civic-results-order"
            aria-labelledby="planning-order"
          >
            <SectionHeading
              label="Sequence"
              title="Planning order"
              id="planning-order"
            />
            <ol>
              {timelineItems.map((item, index) => (
                <li key={item}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {item}
                </li>
              ))}
            </ol>
          </section>

          <section
            className="civic-results-section civic-results-explanation"
            aria-labelledby="grounded-explanation"
          >
            <SectionHeading
              label={
                explanation.mode === "ai"
                  ? "Grounded AI explanation"
                  : "Deterministic fallback"
              }
              title={explanation.title}
              id="grounded-explanation"
            >
              <p>{explanation.summary}</p>
            </SectionHeading>
            <div className="civic-explanation-grid">
              <TrailPanel title="What we know">
                <ul>
                  {explanation.whatWeKnow.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </TrailPanel>
              <TrailPanel title="What needs review">
                <ul>
                  {explanation.needsReview.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </TrailPanel>
              <TrailPanel title="Next steps">
                <ul>
                  {explanation.nextSteps.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </TrailPanel>
            </div>
            <div className="civic-explanation-citations">
              {explanation.citations.map((citation) => (
                <span key={citation}>Source ID: {citation}</span>
              ))}
            </div>
          </section>

          <section
            className="civic-results-section civic-evidence-section"
            aria-labelledby="evidence-trail"
          >
            <SectionHeading
              label="Evidence Trail"
              title="Your fact. Verified rule. Official source."
              id="evidence-trail"
            >
              <p>Expand any result to see the Gatherwise Evidence Trail.</p>
            </SectionHeading>
            <div className="civic-evidence-list">
              {requirementResults.map((result) => {
                const item = checklistItems.find(
                  (entry) => entry.ruleId === result.ruleEvaluation.ruleId,
                );

                if (!item) {
                  return null;
                }

                return (
                  <EvidenceTrailCard
                    eventFacts={eventFacts}
                    item={item}
                    key={result.resultId}
                    result={result}
                  />
                );
              })}
            </div>
          </section>

          <section
            className="civic-results-section civic-sources-section"
            aria-labelledby="official-sources"
          >
            <SectionHeading
              label="Full official sources"
              title="Official sources"
              id="official-sources"
            />
            <div className="civic-source-list">
              {sources.map((source) => (
                <article key={`${source.sourceId}:${source.sourceUrl}`}>
                  <div>
                    <h3>{source.sourceName}</h3>
                    {source.sourceId ? (
                      <span>Source ID: {source.sourceId}</span>
                    ) : null}
                  </div>
                  <p>
                    {source.jurisdiction.name} · Review date:{" "}
                    {source.reviewDate ?? "Needs review"}
                  </p>
                  <a
                    className="civic-source-link focus-ring"
                    href={source.sourceUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Check the official source
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </article>
              ))}
            </div>
          </section>

          <section
            className="civic-results-section civic-results-limitations"
            aria-labelledby="limitations"
          >
            <SectionHeading
              label="Limitations"
              title="Know the boundary"
              id="limitations"
            />
            <ul>
              <li>Arizona pilot only.</li>
              <li>
                Gatherwise is informational and does not make legal
                determinations.
              </li>
              <li>
                Official source pages can change, so human verification is still
                recommended.
              </li>
              <li>
                Unknown details stay unknown and may change whether a
                requirement appears.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}

function RequirementCard({
  item,
  index,
}: {
  item: EvidenceChecklistItem;
  index: number;
}) {
  return (
    <article className="civic-requirement">
      <span className="civic-requirement__number" aria-hidden="true">
        R{String(index + 1).padStart(2, "0")}
      </span>
      <div className="civic-requirement__content">
        <div className="civic-requirement__statuses">
          <CivicStatus
            tone={
              item.requirementLevel === "likely required" ? "active" : "caution"
            }
          >
            {item.requirementLevel === "likely required"
              ? "May apply"
              : "Needs review"}
          </CivicStatus>
          <CivicStatus
            tone={item.unknownConditions.length > 0 ? "unknown" : "verified"}
          >
            {item.unknownConditions.length > 0
              ? "Information missing"
              : "Confirmed from your details"}
          </CivicStatus>
          {item.verificationStatus !== "verified" ? (
            <CivicStatus tone="caution">Source needs review</CivicStatus>
          ) : null}
        </div>
        <h3>{item.title}</h3>
        <p>{item.plainEnglishSummary}</p>
        <p className="civic-requirement__meta">
          {item.jurisdiction} ·{" "}
          {item.leadTimeDays > 0
            ? `${item.leadTimeDays} day lead time`
            : "Lead time not verified yet"}
        </p>
        {item.sourceUrl ? (
          <a
            className="civic-source-link focus-ring"
            href={item.sourceUrl}
            rel="noreferrer"
            target="_blank"
          >
            <CivicStatus tone="source">Official source</CivicStatus>
            <span>{item.sourceName}</span>
            <ExternalLink aria-hidden="true" className="h-4 w-4" />
          </a>
        ) : null}
      </div>
    </article>
  );
}

function EvidenceTrailCard({
  eventFacts,
  item,
  result,
}: {
  eventFacts: EventFactsDocument;
  item: EvidenceChecklistItem;
  result: RequirementResult;
}) {
  return (
    <details className="civic-evidence-trail">
      <summary className="focus-ring">
        <div className="civic-evidence-trail__statuses">
          <CivicStatus tone="active">Evidence Trail</CivicStatus>
          <CivicStatus
            tone={item.unknownConditions.length > 0 ? "unknown" : "verified"}
          >
            {item.unknownConditions.length > 0
              ? "Needs review"
              : "Confirmed from your details"}
          </CivicStatus>
        </div>
        <h3>{item.title}</h3>
        <p>{item.plainEnglishSummary}</p>
        <span className="civic-evidence-trail__action">Open trail</span>
      </summary>

      <div className="civic-evidence-trail__panels">
        <TrailPanel title="Your fact">
          {result.ruleEvaluation.relevantFactKeys.map((key) => (
            <FactRow
              eventFacts={eventFacts}
              factKey={key as EventFactFieldKey}
              key={key}
            />
          ))}
        </TrailPanel>

        <TrailPanel title="Verified rule">
          <p>Rule ID: {result.ruleEvaluation.ruleId}</p>
          <p>Version: {result.ruleEvaluation.ruleVersion}</p>
          {result.ruleEvaluation.matchedConditions.length > 0 ? (
            <div className="civic-trail-panel__conditions">
              <strong>Matched conditions</strong>
              <ul>
                {result.ruleEvaluation.matchedConditions.map((condition) => (
                  <li key={condition}>{condition}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {result.ruleEvaluation.unknownConditions.length > 0 ? (
            <div className="civic-trail-panel__conditions">
              <strong>Unknown conditions</strong>
              <ul>
                {result.ruleEvaluation.unknownConditions.map((condition) => (
                  <li key={condition}>{condition}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </TrailPanel>

        <TrailPanel title="Official source">
          <p>{result.officialSource.sourceName}</p>
          <p>Source ID: {result.officialSource.sourceId}</p>
          <p>
            Review date: {result.officialSource.reviewDate ?? "Needs review"}
          </p>
          <a
            className="civic-source-link focus-ring"
            href={result.officialSource.sourceUrl}
            rel="noreferrer"
            target="_blank"
          >
            Check the official source
            <ExternalLink className="h-4 w-4" />
          </a>
        </TrailPanel>
      </div>
    </details>
  );
}

function TrailPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="civic-trail-panel">
      <p className="civic-data-label-shared">{title}</p>
      <div>{children}</div>
    </section>
  );
}

function FactRow({
  eventFacts,
  factKey,
}: {
  eventFacts: EventFactsDocument;
  factKey: EventFactFieldKey;
}) {
  const fact = eventFacts.facts.find((entry) => entry.key === factKey);
  const metadata = getFactMetadata(factKey);
  const state = fact ? factStatusToUserFacingState(fact.status) : "unknown";

  return (
    <div className="civic-fact-evidence">
      <div>
        <strong>{metadata.label}</strong>
        <CivicStatus
          tone={
            state === "confirmed"
              ? "verified"
              : state === "unknown"
                ? "unknown"
                : "caution"
          }
        >
          {state === "confirmed"
            ? "Confirmed"
            : state === "unknown"
              ? "Unknown"
              : "Needs review"}
        </CivicStatus>
      </div>
      <p>{fact ? formatFactValue(fact) : "Unknown"}</p>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="civic-results-metric">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function SectionHeading({
  children,
  id,
  label,
  title,
}: {
  children?: React.ReactNode;
  id: string;
  label: string;
  title: string;
}) {
  return (
    <header className="civic-results-section-heading">
      <p className="civic-data-label-shared">{label}</p>
      <h2 id={id}>{title}</h2>
      {children}
    </header>
  );
}

function UnsupportedResults({
  demo,
  eventName,
  jurisdiction,
}: {
  demo: ReturnType<typeof getDemoScenario>;
  eventName: string;
  jurisdiction: string;
}) {
  return (
    <main className="civic-results-page civic-results-page--unsupported">
      <div className="civic-results-wrap">
        <CivicButtonLink href="/intake" variant="outline-light">
          <ArrowLeft className="h-4 w-4" />
          Back to planning
        </CivicButtonLink>
        <section
          className="civic-unsupported-stop"
          aria-labelledby="unsupported-title"
        >
          <div className="civic-unsupported-stop__marker" aria-hidden="true">
            STOP
          </div>
          <div className="civic-unsupported-stop__content">
            <CivicStatus tone="critical">Unsupported</CivicStatus>
            <p className="civic-data-label-shared">
              Result boundary · Arizona pilot
            </p>
            <h1 id="unsupported-title">
              This readiness route stops at {jurisdiction}.
            </h1>
            <p>
              Gatherwise does not have verified rule and source coverage for
              this jurisdiction, so it will not present guessed requirements for{" "}
              {eventName}.
            </p>
            <div className="civic-unsupported-stop__facts">
              <div>
                <span>Possible requirements</span>
                <strong>Not evaluated</strong>
              </div>
              <div>
                <span>Official sources</span>
                <strong>Not selected</strong>
              </div>
            </div>
            <p className="civic-unsupported-stop__guidance">
              Choose a supported Arizona pilot jurisdiction or check the
              relevant city, county, and state sources directly. This is
              informational guidance.
            </p>
            <div className="civic-unsupported-stop__actions">
              <CivicButtonLink href="/intake">
                Change event details
              </CivicButtonLink>
              {demo ? (
                <a
                  className="civic-results-action civic-results-action--light focus-ring"
                  href={getDemoGuidedHref(demo)}
                >
                  Reset this sample
                </a>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function normalizeResultsEventFacts(
  document: EventFactsDocument | undefined,
  intake: PartialIntakeInput,
) {
  if (!document) {
    const parsed = intakeSchema.parse(intake);
    return intakeToEventFacts(parsed, { defaultStatus: "confirmed" });
  }

  return parseEventFactsDocument({
    ...document,
    facts: document.facts.map((fact) => ({
      ...fact,
      status: fact.status === "provided" ? "confirmed" : fact.status,
    })),
  });
}

async function generateExplanation(packet: ExplanationPacket) {
  if (process.env.GATHERWISE_AI_EXPLANATION_ENABLED !== "true") {
    return buildDeterministicFallback(
      packet,
      "AI explanation is disabled for this demo.",
    );
  }

  try {
    const service = createExplanationService({
      provider: createOpenAIExplanationProvider(),
    });

    return await service.explain(packet);
  } catch (error) {
    return buildDeterministicFallback(
      packet,
      error instanceof Error ? error.message : "AI explanation is unavailable.",
    );
  }
}

function buildMissingFactRows(
  eventFacts: EventFactsDocument,
  checklistItems: EvidenceChecklistItem[],
) {
  const rankedKeys = new Map<EventFactFieldKey, number>();

  for (const item of checklistItems) {
    for (const condition of item.unknownConditions) {
      for (const key of condition.factKeys) {
        rankedKeys.set(key, (rankedKeys.get(key) ?? 0) + 1);
      }
    }
  }

  return [...rankedKeys.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6)
    .map(([key, score]) => {
      const fact = eventFacts.facts.find((entry) => entry.key === key);
      return {
        key,
        label: getFactMetadata(key).label,
        reason:
          fact?.status === "unknown"
            ? `This detail is still unknown and may change ${score} possible requirement${
                score === 1 ? "" : "s"
              }.`
            : `This detail still needs review and may change ${score} possible requirement${
                score === 1 ? "" : "s"
              }.`,
      };
    });
}

function uniqueSources(results: RequirementResult[]) {
  const sources = new Map<string, RequirementResult["officialSource"]>();

  for (const result of results) {
    const key = `${result.officialSource.sourceId}:${result.officialSource.sourceUrl}`;
    sources.set(key, result.officialSource);
  }

  return [...sources.values()];
}

function formatConditionSummary(
  condition: EvidenceChecklistItem["matchedConditions"][number],
) {
  return `${condition.label}: expected ${condition.expected}; actual ${condition.actual}.`;
}

function formatFactValue(fact: EventFact) {
  if (fact.status === "unknown" || fact.value === null) {
    return "Unknown";
  }

  if (typeof fact.value === "boolean") {
    return fact.value ? "Yes" : "No";
  }

  return String(fact.value);
}

function getIntakeWithUseCase(intakeId: string) {
  return prisma.intakeSubmission.findUnique({
    where: { id: intakeId },
    include: { useCase: true },
  });
}

function toIntakeInput(intake: IntakeWithUseCase): IntakeInput {
  const rawAnswers = parseStoredIntakePayload(intake.rawAnswers).intake;

  return {
    ...rawAnswers,
    eventName: intake.eventName,
    city: intake.city ?? "phoenix",
    county: intake.county ?? "Maricopa County",
    useCase: intake.useCase?.slug ?? "multi-vendor-market",
    eventType: intake.eventType,
    propertyUse: intake.venueType,
    expectedAttendance: intake.expectedAttendance,
    vendorCount: intake.vendorCount,
    eventDate: intake.eventDate
      ? intake.eventDate.toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    recurrence: intake.isRecurring ? "recurring" : "one-time",
    hasFood: intake.hasFood,
    hasFoodTruck: intake.hasFoodTruck,
    hasRetailSales: intake.hasRetailSales,
    hasAlcohol: intake.hasAlcohol,
    hasAmplifiedSound: intake.hasAmplifiedSound,
    hasTemporaryStructure: intake.hasTemporaryStructure,
    hasGenerator: intake.hasGenerator,
    hasOpenFlame: intake.hasOpenFlame,
    hasStreetSidewalkOrParkingImpact:
      intake.hasStreetClosure || intake.hasParkingImpact,
  };
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
