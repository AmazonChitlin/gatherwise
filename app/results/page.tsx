import type { Metadata } from "next";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { DisclaimerNotice } from "@/components/disclaimer-notice";
import { Badge, ButtonLink, Card, PageContainer } from "@/components/ui";
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
  type RequirementResult
} from "@/lib/event-facts";
import { parseResultsSnapshot } from "@/lib/intake-storage";
import { prisma } from "@/lib/prisma";
import {
  buildEvidenceChecklistForEventFacts,
  type EvidenceChecklistItem
} from "@/lib/rule-engine";
import { formatTimeline, topItemsToCheckFirst } from "@/lib/results-helpers";
import type { IntakeInput } from "@/lib/schemas";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
type IntakeWithUseCase = NonNullable<
  Awaited<ReturnType<typeof getIntakeWithUseCase>>
>;

export const metadata: Metadata = {
  title: "Results",
  description:
    "Review what may apply, why it may apply, and which official sources to check in the Gatherwise Arizona pilot."
};

export default async function ResultsPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const intakeId = getParam(params.intakeId);
  const snapshot = getParam(params.snapshot);
  const intake = intakeId ? await getIntakeWithUseCase(intakeId) : null;
  const snapshotPayload = snapshot ? parseResultsSnapshot(snapshot) : null;
  const storedPayload = intake
    ? parseStoredIntakePayload(intake.rawAnswers)
    : snapshotPayload;
  const intakeInput = intake
    ? toIntakeInput(intake)
    : snapshotPayload?.intake
      ? normalizeSnapshotIntake(snapshotPayload.intake)
      : null;

  if (!intakeInput) {
    return (
      <main className="min-h-screen">
        <PageContainer className="max-w-4xl py-10">
          <ButtonLink href="/intake" tone="secondary">
            <ArrowLeft className="h-4 w-4" />
            Back to planning
          </ButtonLink>
          <Card className="command-card-dark command-pattern mt-5 p-6">
            <Badge tone="warning">No active intake</Badge>
            <h1 className="mt-4 text-3xl font-black tracking-[-0.03em]">
              No planning details found yet.
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Start with the guided form so Gatherwise can show what may apply.
            </p>
          </Card>
          <div className="mt-5">
            <DisclaimerNotice />
          </div>
        </PageContainer>
      </main>
    );
  }

  const eventFacts = normalizeResultsEventFacts(
    storedPayload?.eventFacts,
    intakeInput
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
      knownUncertainty: item.unknownConditions.map((condition) => condition.label)
    })
  );
  const topItems = topItemsToCheckFirst(checklistItems);
  const timelineItems = formatTimeline(checklistItems);
  const sources = uniqueSources(requirementResults);
  const missingFacts = buildMissingFactRows(eventFacts, checklistItems);
  const nextAction = topItems[0] ?? null;

  return (
    <main className="min-h-screen">
      <PageContainer className="py-8">
        <ButtonLink href="/intake" tone="secondary">
          <ArrowLeft className="h-4 w-4" />
          Back to planning
        </ButtonLink>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="command-card-dark command-pattern p-6">
            <Badge tone="highlight">Readiness summary</Badge>
            <h1 className="mt-4 text-4xl font-black leading-tight tracking-[-0.04em]">
              {intakeInput.eventName} readiness summary
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Based on the details you provided, Gatherwise shows what may
              apply, what still needs review, and where the official source
              starts.
            </p>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <SummaryItem
                label="Possible requirements"
                tone="dark"
                value={String(checklistItems.length)}
              />
              <SummaryItem
                label="Missing details"
                tone="dark"
                value={String(missingFacts.length)}
              />
              <SummaryItem
                label="Official sources"
                tone="dark"
                value={String(sources.length)}
              />
              <SummaryItem
                label="Jurisdiction"
                tone="dark"
                value={eventFacts.jurisdiction.label}
              />
            </dl>
          </Card>

          <aside className="space-y-5">
            <DisclaimerNotice />
            <Card className="p-5">
              <Badge
                tone={eventFacts.jurisdiction.supported ? "verified" : "warning"}
              >
                {eventFacts.jurisdiction.supported ? "Arizona pilot" : "Not supported"}
              </Badge>
              <h2 className="mt-3 text-lg font-black">Result boundary</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                The deterministic rule engine is the authority for possible
                requirements, agencies, lead times, and official sources.
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Unsupported jurisdictions are refused instead of guessed.
              </p>
            </Card>
          </aside>
        </div>

        <div className="mt-6 space-y-5">
          <section aria-labelledby="next-action">
            <Card className="p-5">
              <Badge tone="primary">Most important next action</Badge>
              <h2
                className="mt-4 text-2xl font-black tracking-[-0.02em]"
                id="next-action"
              >
                {eventFacts.jurisdiction.supported
                  ? nextAction?.title ?? "Confirm your jurisdiction and core event details"
                  : "Choose a supported Arizona pilot jurisdiction before relying on this result"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                {!eventFacts.jurisdiction.supported
                  ? "Gatherwise currently supports a limited Arizona pilot. This result stops at the boundary instead of presenting unsupported guidance."
                  : nextAction
                    ? `${nextAction.jurisdiction} may need attention first, especially if your planning window is ${
                        nextAction.leadTimeDays > 0
                          ? `${nextAction.leadTimeDays} days or less`
                          : "still unconfirmed"
                      }.`
                    : "No verified pilot rules matched these details yet. Confirm the official source for your city, county, venue, or state agency before moving ahead."}
              </p>
            </Card>
          </section>

          <section aria-labelledby="possible-requirements">
            <Card className="p-5">
              <Badge tone="secondary">Possible requirements</Badge>
              <h2
                className="mt-4 text-2xl font-black tracking-[-0.02em]"
                id="possible-requirements"
              >
                What may apply
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                These are deterministic rule results, not legal determinations.
              </p>
              {checklistItems.length === 0 ? (
                <div className="mt-4 rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface-muted)] p-4 text-sm leading-6 text-[var(--muted)]">
                  No pilot rule records matched these details yet. Check the
                  official source directly before you set up.
                </div>
              ) : (
                <div className="mt-4 grid gap-3">
                  {checklistItems.map((item) => (
                    <RequirementCard item={item} key={item.ruleId} />
                  ))}
                </div>
              )}
            </Card>
          </section>

          <section aria-labelledby="missing-information">
            <Card className="p-5">
              <Badge tone="warning">Missing information</Badge>
              <h2
                className="mt-4 text-2xl font-black tracking-[-0.02em]"
                id="missing-information"
              >
                Details that may change your results
              </h2>
              {missingFacts.length === 0 ? (
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  No high-value missing details were found in the current
                  requirement set.
                </p>
              ) : (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {missingFacts.map((fact) => (
                    <article
                      className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface-muted)] p-4"
                      key={fact.key}
                    >
                      <p className="text-sm font-semibold">{fact.label}</p>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        {fact.reason}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </Card>
          </section>

          <section aria-labelledby="planning-order">
            <Card className="p-5">
              <Badge tone="verified">Planning order</Badge>
              <h2
                className="mt-4 text-2xl font-black tracking-[-0.02em]"
                id="planning-order"
              >
                Planning order
              </h2>
              <div className="mt-4 grid gap-3">
                {timelineItems.map((item) => (
                  <div
                    className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface-muted)] p-4 text-sm leading-6"
                    key={item}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </Card>
          </section>

          <section aria-labelledby="evidence-trail">
            <Card className="p-5">
              <Badge tone="highlight">Evidence Trail</Badge>
              <h2
                className="mt-4 text-2xl font-black tracking-[-0.02em]"
                id="evidence-trail"
              >
                Your fact. Verified rule. Official source.
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Expand any result to see the Gatherwise Evidence Trail.
              </p>
              <div className="mt-4 space-y-3">
                {requirementResults.map((result) => {
                  const item = checklistItems.find(
                    (entry) => entry.ruleId === result.ruleEvaluation.ruleId
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
            </Card>
          </section>

          <section aria-labelledby="official-sources">
            <Card className="p-5">
              <Badge tone="secondary">Full official sources</Badge>
              <h2
                className="mt-4 text-2xl font-black tracking-[-0.02em]"
                id="official-sources"
              >
                Official sources
              </h2>
              <div className="mt-4 grid gap-3">
                {sources.map((source) => (
                  <article
                    className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface-muted)] p-4"
                    key={`${source.sourceId}:${source.sourceUrl}`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold">{source.sourceName}</h3>
                      {source.sourceId ? (
                        <Badge tone="neutral">Source ID: {source.sourceId}</Badge>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      {source.jurisdiction.name} · Review date:{" "}
                      {source.reviewDate ?? "Needs review"}
                    </p>
                    <a
                      className="focus-ring mt-3 inline-flex items-center gap-2 rounded-[var(--radius-control)] border border-[var(--verified)] bg-[var(--verified-soft)] px-3 py-2 text-sm font-semibold text-[var(--verified-strong)]"
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
            </Card>
          </section>

          <section aria-labelledby="limitations">
            <Card className="p-5">
              <Badge tone="warning">Limitations</Badge>
              <h2
                className="mt-4 text-2xl font-black tracking-[-0.02em]"
                id="limitations"
              >
                Limitations
              </h2>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--muted)]">
                <li>Arizona pilot only.</li>
                <li>Gatherwise is informational and does not make legal determinations.</li>
                <li>Official source pages can change, so human verification is still recommended.</li>
                <li>Unknown details stay unknown and may change whether a requirement appears.</li>
              </ul>
            </Card>
          </section>
        </div>
      </PageContainer>
    </main>
  );
}

function RequirementCard({ item }: { item: EvidenceChecklistItem }) {
  const primaryTone =
    item.requirementLevel === "likely required" ? "primary" : "highlight";

  return (
    <article className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface-muted)] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={primaryTone}>
          {item.requirementLevel === "likely required"
            ? "May apply"
            : "Needs review"}
        </Badge>
        <Badge tone={item.unknownConditions.length > 0 ? "warning" : "verified"}>
          {item.unknownConditions.length > 0
            ? "Information missing"
            : "Confirmed from your details"}
        </Badge>
        {item.verificationStatus !== "verified" ? (
          <Badge tone="warning">Source needs review</Badge>
        ) : null}
      </div>
      <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        {item.plainEnglishSummary}
      </p>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        {item.jurisdiction} ·{" "}
        {item.leadTimeDays > 0
          ? `${item.leadTimeDays} day lead time`
          : "Lead time not verified yet"}
      </p>
    </article>
  );
}

function EvidenceTrailCard({
  eventFacts,
  item,
  result
}: {
  eventFacts: EventFactsDocument;
  item: EvidenceChecklistItem;
  result: RequirementResult;
}) {
  return (
    <details className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface-muted)] p-4">
      <summary className="cursor-pointer list-none">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="highlight">Evidence Trail</Badge>
          <Badge tone={item.unknownConditions.length > 0 ? "warning" : "verified"}>
            {item.unknownConditions.length > 0 ? "Needs review" : "Confirmed from your details"}
          </Badge>
        </div>
        <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          {item.plainEnglishSummary}
        </p>
      </summary>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <TrailPanel title="Your fact">
          {result.ruleEvaluation.relevantFactKeys.map((key) => (
            <FactRow eventFacts={eventFacts} factKey={key as EventFactFieldKey} key={key} />
          ))}
        </TrailPanel>

        <TrailPanel title="Verified rule">
          <p className="text-sm leading-6 text-[var(--muted)]">
            Rule ID: {result.ruleEvaluation.ruleId}
          </p>
          <p className="text-sm leading-6 text-[var(--muted)]">
            Version: {result.ruleEvaluation.ruleVersion}
          </p>
          {result.ruleEvaluation.matchedConditions.length > 0 ? (
            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                Matched conditions
              </p>
              <ul className="mt-2 space-y-2 text-sm leading-6">
                {result.ruleEvaluation.matchedConditions.map((condition) => (
                  <li key={condition}>{condition}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {result.ruleEvaluation.unknownConditions.length > 0 ? (
            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                Unknown conditions
              </p>
              <ul className="mt-2 space-y-2 text-sm leading-6">
                {result.ruleEvaluation.unknownConditions.map((condition) => (
                  <li key={condition}>{condition}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </TrailPanel>

        <TrailPanel title="Official source">
          <p className="text-sm leading-6 text-[var(--muted)]">
            {result.officialSource.sourceName}
          </p>
          <p className="text-sm leading-6 text-[var(--muted)]">
            Source ID: {result.officialSource.sourceId}
          </p>
          <p className="text-sm leading-6 text-[var(--muted)]">
            Review date: {result.officialSource.reviewDate ?? "Needs review"}
          </p>
          <a
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-strong)] underline"
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
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--line)] bg-white/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
        {title}
      </p>
      <div className="mt-3 space-y-2">{children}</div>
    </section>
  );
}

function FactRow({
  eventFacts,
  factKey
}: {
  eventFacts: EventFactsDocument;
  factKey: EventFactFieldKey;
}) {
  const fact = eventFacts.facts.find((entry) => entry.key === factKey);
  const metadata = getFactMetadata(factKey);
  const state = fact ? factStatusToUserFacingState(fact.status) : "unknown";

  return (
    <div className="rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface-muted)] p-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold">{metadata.label}</p>
        <Badge tone={state === "confirmed" ? "verified" : "warning"}>
          {state === "confirmed" ? "Confirmed" : state === "unknown" ? "Unknown" : "Needs review"}
        </Badge>
      </div>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        {fact ? formatFactValue(fact) : "Unknown"}
      </p>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  tone = "light"
}: {
  label: string;
  value: string;
  tone?: "light" | "dark";
}) {
  return (
    <div
      className={`rounded-[var(--radius-control)] border p-3 ${
        tone === "dark"
          ? "border-white/10 bg-white/8"
          : "border-[var(--line)] bg-[var(--surface-muted)]"
      }`}
    >
      <dt
        className={
          tone === "dark" ? "font-semibold text-slate-100" : "font-semibold"
        }
      >
        {label}
      </dt>
      <dd className={tone === "dark" ? "text-slate-300" : "opacity-75"}>
        {value}
      </dd>
    </div>
  );
}

function normalizeResultsEventFacts(
  document: EventFactsDocument | undefined,
  intake: IntakeInput
) {
  if (!document) {
    return intakeToEventFacts(intake, { defaultStatus: "confirmed" });
  }

  return parseEventFactsDocument({
    ...document,
    facts: document.facts.map((fact) => ({
      ...fact,
      status: fact.status === "provided" ? "confirmed" : fact.status
    }))
  });
}

function buildMissingFactRows(
  eventFacts: EventFactsDocument,
  checklistItems: EvidenceChecklistItem[]
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
              }.`
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

function formatConditionSummary(condition: EvidenceChecklistItem["matchedConditions"][number]) {
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
    include: { useCase: true }
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
      intake.hasStreetClosure || intake.hasParkingImpact
  };
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeSnapshotIntake(input: Partial<IntakeInput>): IntakeInput {
  return {
    ...input,
    eventName: input.eventName ?? "Event",
    city: input.city ?? "phoenix",
    county: input.county ?? "Maricopa County",
    useCase: input.useCase ?? "multi-vendor-market",
    eventType: input.eventType ?? "outdoor-market",
    propertyUse: input.propertyUse ?? "private-property",
    expectedAttendance: input.expectedAttendance ?? 0,
    vendorCount: input.vendorCount ?? 0,
    eventDate: input.eventDate ?? new Date().toISOString().slice(0, 10),
    recurrence: input.recurrence ?? "one-time",
    hasFood: input.hasFood ?? false,
    hasFoodTruck: input.hasFoodTruck ?? false,
    hasRetailSales: input.hasRetailSales ?? false,
    hasAlcohol: input.hasAlcohol ?? false,
    hasAmplifiedSound: input.hasAmplifiedSound ?? false,
    hasTemporaryStructure: input.hasTemporaryStructure ?? false,
    hasGenerator: input.hasGenerator ?? false,
    hasOpenFlame: input.hasOpenFlame ?? false,
    hasStreetSidewalkOrParkingImpact:
      input.hasStreetSidewalkOrParkingImpact ?? false
  };
}
