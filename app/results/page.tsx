import { ArrowLeft, ExternalLink } from "lucide-react";
import { CopyContactButton } from "@/components/copy-contact-button";
import { DisclaimerNotice } from "@/components/disclaimer-notice";
import { EventLocalIcon } from "@/components/eventlocal-icons";
import { Badge, ButtonLink, Card, PageContainer } from "@/components/ui";
import {
  findSupportedJurisdictionByNormalizedCode,
  supportedJurisdictions
} from "@/lib/config";
import { prisma } from "@/lib/prisma";
import { futurePaidProducts } from "@/lib/future-products";
import { buildChecklistForIntake, type ChecklistItem } from "@/lib/rule-engine";
import {
  buildRedFlags,
  formatConfidence,
  formatRequirementLevel,
  formatTimeline,
  formatVerificationMessage,
  formatVerificationStatus,
  groupByJurisdiction,
  sortByLeadTime,
  topItemsToCheckFirst
} from "@/lib/results-helpers";
import type { IntakeInput } from "@/lib/schemas";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
type IntakeWithUseCase = NonNullable<
  Awaited<ReturnType<typeof getIntakeWithUseCase>>
>;

export default async function ResultsPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const intakeId = getParam(params.intakeId);
  const intake = intakeId ? await getIntakeWithUseCase(intakeId) : null;

  if (!intake) {
    return (
      <main className="min-h-screen">
        <PageContainer className="max-w-4xl py-10">
          <ButtonLink href="/intake" tone="secondary">
            <ArrowLeft className="h-4 w-4" />
            Back to intake
          </ButtonLink>
          <Card className="command-card-dark command-pattern mt-5 p-6">
            <Badge tone="warning">No active intake</Badge>
            <h1 className="mt-4 text-3xl font-black tracking-[-0.03em]">
              No intake found yet.
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Start with the intake form so EventLocal can show matched
              checklist items.
            </p>
          </Card>
          <div className="mt-5">
            <DisclaimerNotice />
          </div>
        </PageContainer>
      </main>
    );
  }

  const intakeInput = toIntakeInput(intake);
  const checklistItems = await buildChecklistForIntake(intakeInput);
  const timelineItems = formatTimeline(checklistItems);
  const redFlags = buildRedFlags(checklistItems);
  const jurisdictionGroups = groupByJurisdiction(checklistItems);
  const agencyContacts = uniqueAgencyContacts(checklistItems);
  const topItems = topItemsToCheckFirst(checklistItems);

  return (
    <main className="min-h-screen">
      <PageContainer>
        <ButtonLink href="/intake" tone="secondary">
          <ArrowLeft className="h-4 w-4" />
          Back to intake
        </ButtonLink>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
          <Card className="command-card-dark command-pattern p-6">
            <Badge tone="highlight">Readiness dashboard</Badge>
            <h1 className="mt-4 text-4xl font-black leading-tight tracking-[-0.04em]">
              {intake.eventName} readiness snapshot
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Informational guidance only, not legal advice. Use the source
              links and agency contacts to confirm what applies before event
              day.
            </p>

            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <SummaryItem
                label="City"
                tone="dark"
                value={intake.city ?? "Not provided"}
              />
              <SummaryItem
                label="County"
                tone="dark"
                value={intake.county ?? "Not provided"}
              />
              <SummaryItem
                label="Event type"
                tone="dark"
                value={intake.eventType}
              />
              <SummaryItem
                label="Property"
                tone="dark"
                value={intake.venueType}
              />
              <SummaryItem
                label="Attendance"
                tone="dark"
                value={String(intake.expectedAttendance)}
              />
              <SummaryItem
                label="Vendors"
                tone="dark"
                value={String(intake.vendorCount)}
              />
            </dl>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <DashboardMetric
                label="Matched items"
                tone="dark"
                value={String(checklistItems.length)}
              />
              <DashboardMetric
                label="Agencies"
                tone="dark"
                value={String(agencyContacts.length)}
              />
              <DashboardMetric
                label="Jurisdictions"
                tone="dark"
                value={String(jurisdictionGroups.length)}
              />
            </div>
          </Card>

          <aside className="space-y-5">
            <DisclaimerNotice />
            <Card className="border-[var(--primary)] p-5">
              <h2 className="text-lg font-semibold">Downloadable Event Roadmap</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Future paid feature, not active in this MVP. EventLocal does
                not process payments or generate downloads yet.
              </p>
              <div className="mt-4 space-y-4">
                {futurePaidProducts.map((product) => (
                  <article
                    className="rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface-muted)] p-3"
                    key={product.name}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold">{product.name}</h3>
                      <Badge tone="neutral">{product.status}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      {product.description}
                    </p>
                  </article>
                ))}
              </div>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--muted)]">
                <li>Permit checklist</li>
                <li>Timeline</li>
                <li>Agency contact sheet</li>
                <li>Document prep list</li>
                <li>Red flag summary</li>
                <li>Vendor or organizer next steps</li>
              </ul>
              <button
                className="mt-4 w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface-muted)] px-4 py-2 text-sm font-semibold text-[var(--muted)]"
                disabled
                type="button"
              >
                Coming later: roadmap and vendor packet
              </button>
            </Card>
          </aside>
        </div>

        <section className="mt-6 grid gap-5 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-5">
            <Card className="p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
                  <EventLocalIcon className="h-5 w-5" name="timeline" />
                </span>
                <h2 className="text-lg font-black">Timeline and lead times</h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Planning windows are based on matched rule records. Confirm
                final timing with the agency.
              </p>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-[var(--muted)]">
                {timelineItems.map((item, index) => (
                  <li
                    className={`rounded-[var(--radius-control)] p-3 ${
                      index === 0 && checklistItems.length > 0
                        ? "border border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary-strong)]"
                        : "bg-[var(--sand-light)]"
                    }`}
                    key={item}
                  >
                    {index === 0 && checklistItems.length > 0 ? (
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em]">
                        Check first
                      </span>
                    ) : null}
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--warning-soft)] text-[var(--warning-strong)]">
                  <EventLocalIcon className="h-5 w-5" name="warning" />
                </span>
                <h2 className="text-lg font-black">Red flags to confirm</h2>
              </div>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-[var(--muted)]">
                {redFlags.map((flag) => (
                  <li className="rounded-[var(--radius-control)] bg-[var(--warning-soft)] p-3 text-[var(--warning-strong)]" key={flag}>
                    {flag}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--verified-soft)] text-[var(--verified-strong)]">
                  <EventLocalIcon className="h-5 w-5" name="contact" />
                </span>
                <h2 className="text-lg font-black">Agency contacts</h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Use these contacts and source links to confirm details directly.
              </p>
              <div className="mt-3 space-y-3">
                {agencyContacts.length === 0 ? (
                  <p className="text-sm leading-6 text-[var(--muted)]">
                    No agency contacts matched yet. If you are unsure, contact
                    the city, county, or state agency for your event location.
                  </p>
                ) : null}
                {agencyContacts.map((agency) => (
                  <div className="rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--sand-light)] p-3 text-sm leading-6" key={agency.name}>
                    <p className="font-semibold">{agency.name}</p>
                    {agency.phone ? (
                      <p className="mt-2 flex flex-wrap items-center gap-2 text-[var(--muted)]">
                        <span>Phone: {agency.phone}</span>
                        <CopyContactButton label="phone" value={agency.phone} />
                      </p>
                    ) : null}
                    {agency.email ? (
                      <p className="mt-2 flex flex-wrap items-center gap-2 text-[var(--muted)]">
                        <span>Email: {agency.email}</span>
                        <CopyContactButton label="email" value={agency.email} />
                      </p>
                    ) : null}
                    {agency.url ? (
                      <a
                        className="mt-2 inline-flex items-center gap-1 text-[var(--brand-strong)] underline"
                        href={agency.url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Agency website
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            </Card>
          </aside>

          <section className="space-y-5">
            <Card className="p-5">
              <Badge tone="primary">Start here</Badge>
              <h2 className="mt-4 text-2xl font-black tracking-[-0.02em]">
                Top items to check first
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Start here, then review the full checklist grouped by
                jurisdiction below.
              </p>
              {topItems.length > 0 ? (
                <div className="mt-4 grid gap-3">
                  {topItems.map((item) => (
                    <TopItemCard item={item} key={item.ruleId} />
                  ))}
                </div>
              ) : null}
            </Card>

            {checklistItems.length === 0 ? (
              <Card className="border-[var(--warning)] bg-[var(--warning-soft)] p-5">
                <Badge tone="warning">No matched checklist items yet</Badge>
                <h3 className="mt-3 text-lg font-semibold">
                  No EventLocal rule records matched this intake.
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  This does not mean nothing applies. It only means the current
                  EventLocal rule records did not match this intake. Confirm
                  your plan with the city, county, state, venue, or other
                  relevant agency before you set up.
                </p>
              </Card>
            ) : null}

            {jurisdictionGroups.map((group) => (
              <Card className="overflow-hidden p-0" key={group.jurisdiction}>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--surface-muted)] p-5">
                  <h3 className="text-xl font-black tracking-[-0.02em]">
                    {group.jurisdiction}
                  </h3>
                  <Badge tone="secondary">
                    {group.items.length} item{group.items.length === 1 ? "" : "s"}
                  </Badge>
                </div>
                <div className="divide-y divide-[var(--line)] px-5">
                  {sortByLeadTime(group.items).map((item) => (
                    <article className="py-5 first:pt-0 last:pb-0" key={item.ruleId}>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="mr-2 text-base font-semibold">
                          {item.title}
                        </h4>
                        <Badge tone={requirementTone(item.requirementLevel)}>
                          {formatRequirementLevel(item.requirementLevel)}
                        </Badge>
                        <Badge tone={confidenceTone(item.confidence)}>
                          {formatConfidence(item.confidence)}
                        </Badge>
                        <Badge tone={verificationTone(item.verificationStatus)}>
                          {formatVerificationStatus(item.verificationStatus)}
                        </Badge>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                        {item.plainEnglishSummary}
                      </p>
                      <div className="mt-3 rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface-muted)] p-3 text-sm leading-6 text-[var(--muted)]">
                        {formatVerificationMessage(item)}
                      </div>
                      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                        <SummaryItem
                          label="Lead time"
                          value={
                            item.leadTimeDays > 0
                              ? `${item.leadTimeDays} days`
                              : "Confirm timing"
                          }
                        />
                        <SummaryItem label="Agency" value={item.agencyName} />
                        <SummaryItem
                          label="Last verified"
                          value={item.lastVerified ?? "Needs review"}
                        />
                      </dl>
                      <a
                        className="focus-ring mt-4 inline-flex items-center gap-2 rounded-[var(--radius-control)] border border-[var(--verified)] bg-[var(--verified-soft)] px-3 py-2 text-sm font-semibold text-[var(--verified-strong)]"
                        href={item.sourceUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Official source: {item.sourceName}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </article>
                  ))}
                </div>
              </Card>
            ))}
          </section>
        </section>
      </PageContainer>
    </main>
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

function DashboardMetric({
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
          : "border-[var(--line)] bg-[var(--sand-light)]"
      }`}
    >
      <p
        className={`text-xs font-semibold uppercase tracking-[0.12em] ${
          tone === "dark" ? "text-slate-300" : "opacity-70"
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-1 text-2xl font-black ${
          tone === "dark" ? "text-white" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function TopItemCard({ item }: { item: ChecklistItem }) {
  return (
    <article className="rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface-muted)] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={requirementTone(item.requirementLevel)}>
          {formatRequirementLevel(item.requirementLevel)}
        </Badge>
        <Badge tone={verificationTone(item.verificationStatus)}>
          {formatVerificationStatus(item.verificationStatus)}
        </Badge>
      </div>
      <h3 className="mt-3 text-base font-semibold">{item.title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        {item.jurisdiction} ·{" "}
        {item.leadTimeDays > 0
          ? `${item.leadTimeDays} day planning lead time`
          : "Confirm timing"}
      </p>
    </article>
  );
}

function uniqueAgencyContacts(
  items: Awaited<ReturnType<typeof buildChecklistForIntake>>
) {
  const agencies = new Map<
    string,
    { name: string; phone?: string; email?: string; url?: string }
  >();

  for (const item of items) {
    agencies.set(item.agencyName, {
      name: item.agencyName,
      phone: item.agencyPhone,
      email: item.agencyEmail,
      url: item.agencyUrl
    });
  }

  return Array.from(agencies.values());
}

function requirementTone(level: ChecklistItem["requirementLevel"]) {
  if (level === "likely required") {
    return "primary";
  }

  if (level === "may be required") {
    return "highlight";
  }

  return "warning";
}

function confidenceTone(confidence: ChecklistItem["confidence"]) {
  if (confidence === "high") {
    return "success";
  }

  if (confidence === "medium") {
    return "warning";
  }

  return "alert";
}

function verificationTone(status: ChecklistItem["verificationStatus"]) {
  if (status === "verified") {
    return "verified";
  }

  if (status === "needs_review") {
    return "warning";
  }

  return "neutral";
}

function getIntakeWithUseCase(intakeId: string) {
  return prisma.intakeSubmission.findUnique({
    where: { id: intakeId },
    include: { useCase: true }
  });
}

function toIntakeInput(intake: IntakeWithUseCase): IntakeInput {
  const rawAnswers = parseRawAnswers(intake.rawAnswers);

  return {
    ...rawAnswers,
    eventName: intake.eventName,
    city: cityCodeFromIntake(intake),
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

function parseRawAnswers(rawAnswers: string | null): Partial<IntakeInput> {
  if (!rawAnswers) {
    return {};
  }

  try {
    const result = JSON.parse(rawAnswers) as unknown;
    if (!result || typeof result !== "object") {
      return {};
    }

    return result as Partial<IntakeInput>;
  } catch {
    return {};
  }
}

function cityCodeFromIntake(intake: IntakeWithUseCase) {
  const normalized = findSupportedJurisdictionByNormalizedCode(
    intake.jurisdictionCode
  );

  if (normalized) {
    return normalized.code;
  }

  return (
    supportedJurisdictions.find((item) => item.city === intake.city)?.code ??
    (intake.city ?? "phoenix").toLowerCase().replaceAll(" ", "-")
  );
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
