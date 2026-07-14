import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { DisclaimerNotice } from "@/components/disclaimer-notice";
import {
  EventLocalIcon,
  type EventLocalIconName
} from "@/components/eventlocal-icons";
import {
  Badge,
  ButtonLink,
  Card,
  PageContainer,
  SectionHeading
} from "@/components/ui";
import { supportedJurisdictions } from "@/lib/config";
import {
  getDemoGuidedHref,
  getDemoResultsHref,
  listDemoScenarios
} from "@/lib/demo-scenarios";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Gatherwise helps Arizona pilot users sort event details, understand what may apply, and check official sources."
};

const taskAreas = [
  {
    icon: "city",
    title: "Start with event details",
    text: "Describe the setup in plain language or work through the guided form."
  },
  {
    icon: "timeline",
    title: "See what may apply",
    text: "Get a source-backed summary, planning lead times, and details that still need review."
  },
  {
    icon: "contact",
    title: "Check the official source",
    text: "Use agency contacts and source links before you commit time, money, or materials."
  }
] satisfies {
  icon: EventLocalIconName;
  title: string;
  text: string;
}[];

const launchAreas = supportedJurisdictions.map((area) => area.label);
const demoScenarios = listDemoScenarios();

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="eventlocal-command-hero">
        <PageContainer className="relative z-10 grid gap-10 py-16 lg:grid-cols-[1fr_440px] lg:items-center">
          <section>
            <Badge tone="highlight">Arizona pilot</Badge>
            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-[-0.04em] text-white sm:text-6xl">
              Ready local event guidance for{" "}
              <span className="text-[var(--primary)]">organizers, vendors, and venues</span>.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Gatherwise is AI-powered event readiness for the Arizona pilot.
              Start with the details you know, see what may apply, and check
              the official source before event day.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/intake">
                Plan an event
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink
                className="border-white/20 bg-white/10 text-white hover:bg-white/15"
                href="/how-it-works"
                tone="secondary"
              >
                How it works
              </ButtonLink>
            </div>
            <p className="mt-5 max-w-xl text-sm leading-6 text-slate-400">
              Informational guidance only. Check the official source before you
              rely on a result.
            </p>
          </section>

          <Card className="border-white/15 bg-white p-5 shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
            <Badge tone="primary">Choose a starting path</Badge>
            <div className="mt-4 grid gap-4">
              <PathCard
                cta="Describe my event"
                href="/intake?path=describe"
                note="Preview path"
                text="Start with a plain-language description. The describe path is being shaped for the Arizona pilot."
                title="Describe my event"
              />
              <PathCard
                cta="Use the guided form"
                href="/intake?path=guided"
                note="Available now"
                text="Use the step-by-step form today for source-backed pilot results."
                title="Use the guided form"
              />
            </div>
          </Card>
        </PageContainer>
      </section>

      <PageContainer className="pt-14 pb-12">
        <SectionHeading
          description="Gatherwise is built around the next planning step, the details that matter, and the source trail behind the result."
          title="What you can do now"
        />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {taskAreas.map((item) => (
            <Card className="p-5" key={item.title}>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
                <EventLocalIcon className="h-5 w-5" name={item.icon} />
              </div>
              <h2 className="mt-4 text-lg font-extrabold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {item.text}
              </p>
            </Card>
          ))}
        </div>
      </PageContainer>

      <PageContainer className="py-0 pb-12">
        <Card className="p-6">
          <SectionHeading
            description="You do not need to know permit names first. The product starts with event-planning details."
            title="What information is needed"
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <QuickFact title="Where it happens" text="City, county, and venue type." />
            <QuickFact title="What kind of event" text="Use case, event type, and audience size." />
            <QuickFact title="What changes the route" text="Food, alcohol, sound, structures, traffic, and promotion." />
            <QuickFact title="What still needs review" text="Missing venue, timing, or public-space details that may change results." />
          </div>
        </Card>
      </PageContainer>

      <PageContainer className="grid gap-6 py-0 pb-12 lg:grid-cols-[1fr_420px]">
        <section>
          <SectionHeading
            description="Results are organized around what may apply, why it may apply, and where to check the official source."
            title="What the result means"
          />
          <Card className="mt-5 overflow-hidden p-0">
            <div className="border-b border-[var(--line)] bg-[var(--navy)] p-5 text-white">
              <Badge tone="highlight">Example only</Badge>
              <h3 className="mt-4 text-2xl font-black">
                Phoenix parking lot food vendor event
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                A sample result that stacks city, county, and state guidance
                based on the details provided.
              </p>
            </div>
            <div className="grid gap-5 p-5 lg:grid-cols-[1fr_260px]">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                  What may apply
                </h4>
                <div className="mt-4 grid gap-3">
                  <HeroChecklistRow label="Phoenix outdoor event review" meta="May apply" />
                  <HeroChecklistRow label="Maricopa County food guidance" meta="Needs review" />
                  <HeroChecklistRow label="Arizona TPT / sales tax check" meta="Check source" />
                </div>
              </div>
              <div className="grid gap-3">
                <div className="rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface-muted)] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--primary)]">
                    Why it applies
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Based on the details you provided: parking lot use, public
                    attendance, food vendors, and event setup details.
                  </p>
                </div>
                <div className="rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface-muted)] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--verified-strong)]">
                    Official evidence
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Each result should lead you back to a city, county, or
                    state source to check current instructions.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        <aside className="space-y-4">
          <DisclaimerNotice />
          <Card className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="verified">Source-backed</Badge>
              <Badge tone="neutral">Plain language</Badge>
            </div>
            <h3 className="mt-4 text-lg font-semibold">
              Results are planning guidance, not approval
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Gatherwise helps you see what to check next. It does not verify
              that an event is approved or complete.
            </p>
          </Card>
        </aside>
      </PageContainer>

      <PageContainer className="py-0 pb-12">
        <Card className="p-6">
          <SectionHeading
            description="Every sample below is fictional, starts in one click, uses no login, and relies on trusted live source links."
            title="Public demo scenarios"
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {demoScenarios.map((scenario) => (
              <Card className="p-5" key={scenario.slug}>
                <Badge tone="highlight">Fictional demo</Badge>
                <h3 className="mt-4 text-lg font-extrabold">{scenario.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {scenario.summary}
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  {scenario.whyItMatters}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    className="focus-ring inline-flex min-h-[44px] items-center rounded-[var(--radius-control)] bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-white no-underline"
                    href={getDemoResultsHref(scenario)}
                  >
                    One-click demo
                  </a>
                  <a
                    className="focus-ring inline-flex min-h-[44px] items-center rounded-[var(--radius-control)] border border-[var(--line)] px-3 py-2 text-sm font-semibold no-underline"
                    href={getDemoGuidedHref(scenario)}
                  >
                    Guided sample
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </PageContainer>

      <PageContainer className="py-0 pb-12">
        <section className="command-pattern rounded-[28px] bg-[var(--navy)] p-6 text-white shadow-[var(--shadow)] lg:p-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <TrustColumn
              title="Why it applies"
              items={[
                "Based on the details you provided",
                "What may change your results",
                "What still needs review",
                "What to check first"
              ]}
            />
            <TrustColumn
              title="Official evidence"
              items={[
                "Source-linked rule records",
                "Agency contact paths",
                "Plain-language summaries",
                "Check the official source"
              ]}
            />
            <div>
              <h2 className="text-xl font-black">Arizona pilot scope</h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {launchAreas.map((area) => (
                  <span
                    className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-bold text-slate-200"
                    key={area}
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </PageContainer>
    </main>
  );
}

function PathCard({
  cta,
  href,
  note,
  text,
  title
}: {
  cta: string;
  href: string;
  note: string;
  text: string;
  title: string;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface-muted)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-extrabold">{title}</h2>
        <Badge tone="neutral">{note}</Badge>
      </div>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{text}</p>
      <ButtonLink className="mt-4" href={href} tone="secondary">
        {cta}
      </ButtonLink>
    </div>
  );
}

function QuickFact({ text, title }: { text: string; title: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--sand-light)] p-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{text}</p>
    </div>
  );
}

function HeroChecklistRow({ label, meta }: { label: string; meta: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface-muted)] p-3">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-white">
          <EventLocalIcon className="h-4 w-4" name="check" />
        </span>
        <p className="text-sm font-semibold text-[var(--foreground)]">{label}</p>
      </div>
      <Badge tone={statusTone(meta)}>{meta}</Badge>
    </div>
  );
}

function statusTone(meta: string) {
  if (meta === "May apply") {
    return "highlight";
  }

  if (meta === "Check source") {
    return "verified";
  }

  return "warning";
}

function TrustColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="text-xl font-black">{title}</h2>
      <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
        {items.map((item) => (
          <li className="flex gap-3" key={item}>
            <EventLocalIcon
              className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]"
              name="check"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
