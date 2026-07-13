import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, FileCheck2, GitBranch, MapPinned, Route, SearchCheck, ShieldCheck, TriangleAlert } from "lucide-react";
import { Badge, ButtonLink, Card, PageContainer } from "@/components/ui";
import { DisclaimerNotice } from "@/components/disclaimer-notice";

export const metadata: Metadata = {
  title: "Showcase",
  description:
    "Recruiter-focused showcase for Gatherwise: the problem, the hybrid architecture, the Arizona pilot, and how to try the readiness demo.",
  openGraph: {
    title: "Gatherwise Showcase",
    description:
      "See the recruiter story for Gatherwise: what it does, what AI does and does not do, and why the architecture is trustworthy."
  }
};

const problemPoints = [
  "Event answers are scattered across city, county, and state pages.",
  "Thresholds and lead times change depending on venue, food, sound, traffic, and public-space use.",
  "Users often do not know which agency vocabulary matters until they are already deep in research.",
  "Old checklists and copied advice break when the jurisdiction or event setup changes."
];

const architectureStages = [
  {
    icon: Bot,
    label: "AI stage",
    title: "AI extracts event facts",
    text: "Planned boundary: turn a messy event description into structured facts a user can review and correct."
  },
  {
    icon: ShieldCheck,
    label: "Live today",
    title: "Verified rules evaluate those facts",
    text: "Active in the repository: deterministic rule matching compares structured facts with city, county, and state rule records."
  },
  {
    icon: FileCheck2,
    label: "AI stage",
    title: "AI explains the verified result",
    text: "Planned boundary: explain the matched result in plain language without inventing the rule or replacing the source."
  }
] as const;

const syntheticFacts = [
  "Phoenix",
  "DIY punk matinee",
  "Parking-lot venue",
  "180 attendees",
  "Amplified sound",
  "Food vendors"
];

const transparencyItems = [
  {
    title: "Fact",
    body: "Parking lot venue, Phoenix, 180 attendees, amplified sound, food vendors."
  },
  {
    title: "Rule",
    body: "A city event-review route may apply based on venue type, public attendance, and setup details."
  },
  {
    title: "Source",
    body: "Every matched route should point back to an official city, county, or state source."
  },
  {
    title: "Review date",
    body: "Verified sources carry a last-checked date so users know when the supporting record was reviewed."
  },
  {
    title: "Unknown information",
    body: "Missing property-owner approval or public-space details should stay visible because they may change the result."
  },
  {
    title: "Unsupported geography",
    body: "Unsupported jurisdictions should be refused rather than styled like verified coverage."
  }
];

const technicalFacts = [
  "Next.js 16.2.9 App Router with React 19 and TypeScript strict mode.",
  "Prisma 6 with a SQLite datasource for local development.",
  "Zod intake validation on the client and server.",
  "Deterministic rule matching in lib/rule-engine.ts with structured trigger fields.",
  "Repository-defined checks include npm test, npm run typecheck, and npm run build.",
  "Current tests cover rule matching, intake validation, source inventory validation, cross-jurisdiction behavior, and design/IA regression."
];

const evaluationRows = [
  {
    label: "Automated verification",
    status: "Passing",
    detail: "Repository-defined tests and production build pass on this branch."
  },
  {
    label: "User comprehension metrics",
    status: "Not collected yet",
    detail: "Lean UX experiments are documented, but recruiter and user-study metrics are not claimed before they are run."
  },
  {
    label: "Trust methodology",
    status: "Documented",
    detail: "The repo now separates fact, rule, source, unsupported, and AI-boundary concerns in docs and UI direction."
  }
];

const contributionAreas = [
  "Problem discovery framed around event-planning friction, scattered agency research, and source trust.",
  "Official-source research structure using source inventory records and rule-record validation.",
  "Product design work across IA, Lean UX framing, visual concept exploration, and the Gatherwise design system.",
  "Rule architecture that keeps deterministic matching separate from page copy and UI conditionals.",
  "AI boundary design that limits future AI work to fact extraction and explanation instead of rule invention.",
  "Testing and evaluation through rule, intake, source, design-system, and branding/IA regression coverage.",
  "AI-assisted development used as a build partner while keeping repository facts, boundaries, and verification explicit."
];

const limitations = [
  "Arizona pilot only.",
  "Informational tool, not approval or permit submission.",
  "Source pages and agency instructions can change.",
  "Human verification is still recommended before event day.",
  "Unsupported jurisdictions should be refused instead of guessed."
];

export default function ShowcasePage() {
  return (
    <main className="min-h-screen">
      <section className="eventlocal-command-hero">
        <PageContainer className="relative z-10 grid gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <section className="gw-showcase-stack">
            <Badge tone="highlight">Arizona pilot</Badge>
            <div>
              <p className="gw-showcase-kicker">Gatherwise</p>
              <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-[-0.04em] text-white sm:text-6xl">
                Ready. Set. Local.
              </h1>
            </div>
            <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              A recruiter-friendly showcase of a trustworthy event-readiness
              system that helps organizers, vendors, and venues move from messy
              event facts to source-backed next steps.
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink aria-label="Try the readiness demo" href="/intake?path=guided">
                Try the readiness demo
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <Link
                aria-label="See the architecture section"
                className="focus-ring inline-flex min-h-[44px] items-center rounded-[var(--radius-control)] border border-white/18 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                href="#architecture"
              >
                See the architecture
              </Link>
            </div>
          </section>

          <Card className="border-white/15 bg-white p-5 shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
            <div className="gw-showcase-route-shell">
              <div className="gw-showcase-route-line" aria-hidden="true" />
              <div className="gw-showcase-route-stop">
                <Badge tone="primary">Route motif</Badge>
                <h2 className="mt-3 text-xl font-extrabold">
                  One event, one route, one source trail.
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Gatherwise is designed to show what may apply, why it may
                  apply, and where the official evidence lives, without hiding
                  uncertainty.
                </p>
              </div>
              <div className="gw-showcase-route-mini-grid">
                <div className="gw-showcase-mini-card">
                  <span className="gw-text-label text-[var(--primary-strong)]">User</span>
                  <p>Organizer, vendor, or venue</p>
                </div>
                <div className="gw-showcase-mini-card">
                  <span className="gw-text-label text-[var(--verified-strong)]">Trust</span>
                  <p>Fact to rule to source</p>
                </div>
                <div className="gw-showcase-mini-card">
                  <span className="gw-text-label text-[var(--secondary-strong)]">Boundary</span>
                  <p>AI helps interpret, not invent rules</p>
                </div>
              </div>
            </div>
          </Card>
        </PageContainer>
      </section>

      <PageContainer className="py-0 pb-12">
        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="p-6">
            <Badge tone="warning">The tangled problem</Badge>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.03em]">
              Event readiness breaks across agencies, thresholds, and source pages.
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-[var(--muted)]">
              {problemPoints.map((item) => (
                <li className="flex gap-3" key={item}>
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          <section id="architecture">
            <Card className="p-6">
              <Badge tone="verified">The hybrid system</Badge>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.03em]">
                AI has a narrow job. Verified rules stay in charge.
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
                The intended system boundary is explicit: AI can help structure
                facts and explain results, but the rule decision should still come
                from verified deterministic logic tied to official sources.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {architectureStages.map((stage) => {
                  const Icon = stage.icon;

                  return (
                    <div
                      className={`rounded-[var(--radius-card)] border p-4 ${
                        stage.label === "Live today"
                          ? "border-[var(--secondary)] bg-[var(--secondary-soft)]"
                          : "border-[var(--line)] bg-[var(--surface-muted)]"
                      }`}
                      key={stage.title}
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--surface)] text-[var(--primary)]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="mt-4">
                        <Badge
                          tone={stage.label === "Live today" ? "success" : "secondary"}
                        >
                          {stage.label}
                        </Badge>
                      </div>
                      <h3 className="mt-3 text-lg font-extrabold">{stage.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        {stage.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </section>
        </section>
      </PageContainer>

      <PageContainer className="py-0 pb-12">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="p-6">
            <Badge tone="primary">Signature experience</Badge>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.03em]">
              Readiness Route: DIY punk matinee in Phoenix
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Synthetic event, real interaction model. The route is designed to
              show what happened, why it happened, and what still needs review.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {syntheticFacts.map((fact) => (
                <span
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-muted)] px-3 py-2 text-xs font-bold text-[var(--foreground)]"
                  key={fact}
                >
                  <MapPinned className="h-3.5 w-3.5 text-[var(--primary)]" />
                  {fact}
                </span>
              ))}
            </div>

            <div className="mt-6 gw-showcase-stack">
              <RouteCard
                badge="Route stop 01"
                body="Parking-lot use plus public attendance suggests a city event-review path may apply."
                title="City route may apply"
              />
              <RouteCard
                badge="Route stop 02"
                body="Food vendors add county food guidance and can change what needs review."
                title="County food route joins the stack"
              />
              <RouteCard
                badge="Route stop 03"
                body="Amplified sound and missing property-owner approval keep one branch unresolved."
                title="This detail may change your results"
              />
            </div>
          </Card>

          <aside className="gw-showcase-stack">
            <DisclaimerNotice />
            <Card className="p-5">
              <Badge tone="verified">How to try it</Badge>
              <h3 className="mt-3 text-xl font-extrabold">
                Use the guided form today
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                The Arizona pilot currently supports the guided form. The
                describe-my-event path and AI extraction layer are still planned
                boundaries, not live behavior.
              </p>
              <ButtonLink className="mt-4" href="/intake?path=guided">
                Try the readiness demo
              </ButtonLink>
            </Card>
          </aside>
        </section>
      </PageContainer>

      <PageContainer className="py-0 pb-12">
        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card className="p-6">
            <Badge tone="verified">Evidence and transparency</Badge>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.03em]">
              Trust comes from boundaries, not polish.
            </h2>
            <div className="mt-5 grid gap-3">
              {transparencyItems.map((item) => (
                <div
                  className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface-muted)] p-4"
                  key={item.title}
                >
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--primary)]">
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <Badge tone="secondary">Technical proof</Badge>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.03em]">
              Verified repository facts only
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-[var(--muted)]">
              {technicalFacts.map((fact) => (
                <li className="flex gap-3" key={fact}>
                  <GitBranch className="mt-0.5 h-4 w-4 shrink-0 text-[var(--secondary)]" />
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      </PageContainer>

      <PageContainer className="py-0 pb-12">
        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="p-6">
            <Badge tone="success">Evaluation</Badge>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.03em]">
              Reproducible status over vanity metrics.
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Until user-study numbers exist, the page shows reproducible status
              and evaluation methodology instead of filler metrics.
            </p>
            <div className="mt-5 grid gap-3">
              {evaluationRows.map((row) => (
                <div
                  className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface-muted)] p-4"
                  key={row.label}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-bold">{row.label}</h3>
                    <Badge tone={row.status === "Passing" ? "success" : row.status === "Documented" ? "verified" : "neutral"}>
                      {row.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {row.detail}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <Badge tone="highlight">Builder contribution</Badge>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.03em]">
              What Paul personally built
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-[var(--muted)]">
              {contributionAreas.map((item) => (
                <li className="flex gap-3" key={item}>
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      </PageContainer>

      <PageContainer className="py-0 pb-12">
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <Card className="p-6">
            <Badge tone="warning">Limitations</Badge>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.03em]">
              Direct limits keep the architecture trustworthy.
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-[var(--muted)]">
              {limitations.map((item) => (
                <li className="flex gap-3" key={item}>
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <Badge tone="primary">Next action</Badge>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.03em]">
              Try the public demo path.
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Use the guided Arizona pilot flow to see how Gatherwise turns
              event details into a source-backed readiness summary.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <ButtonLink href="/intake?path=guided">
                Try the readiness demo
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <Link
                className="focus-ring inline-flex min-h-[44px] items-center rounded-[var(--radius-control)] px-3 py-2 text-sm font-semibold text-[var(--primary-strong)] underline"
                href="#architecture"
              >
                Jump back to architecture
              </Link>
            </div>
          </Card>
        </section>
      </PageContainer>
    </main>
  );
}

function RouteCard({
  badge,
  body,
  title
}: {
  badge: string;
  body: string;
  title: string;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface-muted)] p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold text-[var(--primary-strong)]">
          <Route className="h-3.5 w-3.5" />
          {badge}
        </span>
      </div>
      <h3 className="mt-3 text-lg font-extrabold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{body}</p>
    </div>
  );
}
