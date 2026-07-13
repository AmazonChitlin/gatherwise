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

const checks = [
  {
    icon: "city",
    title: "City event permits",
    text: "Spot city event, vendor, park, and property review items that may apply."
  },
  {
    icon: "truck",
    title: "Food truck & food events",
    text: "Surface county food guidance for food trucks, temporary food, samples, and food handling."
  },
  {
    icon: "tax",
    title: "Arizona TPT / sales tax",
    text: "Flag Arizona sales-tax readiness items when retail sales are part of the setup."
  },
  {
    icon: "tent",
    title: "Tents, sound, traffic & more",
    text: "Catch common red flags such as tents, amplified sound, parking, traffic, and public space."
  },
  {
    icon: "contact",
    title: "Agency contacts & sources",
    text: "Show official source links and agency contact paths where verified records include them."
  },
  {
    icon: "timeline",
    title: "Planning lead times",
    text: "Turn matched records into a practical timeline so you know what to check first."
  }
] satisfies {
  icon: EventLocalIconName;
  title: string;
  text: string;
}[];

const audiences = [
  {
    icon: "truck",
    title: "Food trucks"
  },
  {
    icon: "booth",
    title: "Retail pop-up vendors"
  },
  {
    icon: "artist",
    title: "Artists & record sellers"
  },
  {
    icon: "market",
    title: "Market hosts"
  },
  {
    icon: "venue",
    title: "Venue/property hosts"
  },
  {
    icon: "sound",
    title: "Outdoor event planners"
  }
] satisfies {
  icon: EventLocalIconName;
  title: string;
}[];

const steps = [
  {
    title: "Tell us what you’re planning",
    text: "Choose the city, property type, food, sales, sound, structure, and traffic details you know."
  },
  {
    title: "EventLocal checks verified records",
    text: "The rule engine compares your answers to source-linked city, county, and state rule records."
  },
  {
    title: "Review your plain-English checklist",
    text: "See matched guidance, timelines, red flags, source links, and agency contacts in one place."
  },
  {
    title: "Confirm next steps with the agency",
    text: "Use official source links and contacts to verify deadlines, forms, fees, and final instructions."
  }
];

const previewItems = [
  {
    label: "Phoenix outdoor event review",
    meta: "May apply"
  },
  {
    label: "Maricopa County food guidance",
    meta: "May apply"
  },
  {
    label: "Arizona TPT / sales tax check",
    meta: "Check source"
  },
  {
    label: "Planning lead times",
    meta: "Check timelines"
  },
  {
    label: "Agency contacts",
    meta: "Confirm"
  }
];

const launchAreas = supportedJurisdictions.map((area) => area.label);

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="eventlocal-command-hero">
        <PageContainer className="relative z-10 grid gap-10 py-16 lg:grid-cols-[1fr_460px] lg:items-center">
          <section>
            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-[-0.04em] text-white sm:text-6xl">
              Get your local{" "}
              <span className="text-[var(--primary)]">event ready</span>{" "}
              before you set up.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              EventLocal checks verified rules and official sources so you know
              what may apply to your event before you commit time, money, and
              materials.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/intake">
                Check my event
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink
                className="border-white/20 bg-white/10 text-white hover:bg-white/15"
                href="#checks"
                tone="secondary"
              >
                See what EventLocal checks
              </ButtonLink>
            </div>
            <p className="mt-5 max-w-xl text-sm leading-6 text-slate-400">
              Informational guidance only. EventLocal does not submit permits or
              provide legal advice.
            </p>
          </section>

          <Card className="border-white/15 bg-white p-5 shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] pb-4">
              <div>
                <Badge tone="highlight">Example only</Badge>
                <h2 className="mt-2 text-xl font-extrabold">
                  Phoenix parking lot food vendor event
                </h2>
              </div>
              <div className="rounded-2xl bg-[var(--primary-soft)] p-3 text-[var(--primary)]">
                <EventLocalIcon className="h-6 w-6" name="city" />
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {previewItems.map((item) => (
                <HeroChecklistRow
                  key={item.label}
                  label={item.label}
                  meta={item.meta}
                />
              ))}
            </div>
            <p className="mt-5 rounded-[var(--radius-control)] bg-[var(--primary-soft)] p-3 text-sm leading-6 text-[var(--primary-strong)]">
              This is an example of how results look. Your results will be
              based on your event details.
            </p>
          </Card>
        </PageContainer>
      </section>

      <PageContainer className="pt-14 pb-12">
        <section id="checks">
          <SectionHeading
            description="The MVP checks common event-readiness areas without claiming a final legal answer."
            title="What EventLocal checks"
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {checks.map((item) => (
              <Card className="p-5" key={item.title}>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
                  <EventLocalIcon className="h-5 w-5" name={item.icon} />
                </div>
                <h3 className="mt-4 text-lg font-extrabold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {item.text}
                </p>
              </Card>
            ))}
          </div>
        </section>
      </PageContainer>

      <PageContainer className="py-0 pb-12">
        <SectionHeading
          description="Designed for people who need practical next steps before event day, not a government portal."
          title="Who it helps"
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {audiences.map((audience) => (
            <Card className="p-4 text-center" key={audience.title}>
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--secondary-soft)] text-[var(--secondary)]">
                <EventLocalIcon className="h-5 w-5" name={audience.icon} />
              </div>
              <h3 className="mt-3 text-sm font-extrabold">{audience.title}</h3>
            </Card>
          ))}
        </div>
      </PageContainer>

      <PageContainer className="py-0 pb-12">
        <Card className="p-6">
          <SectionHeading
            description="A short flow built around plain-English facts, source-linked rule matching, and cautious guidance."
            title="How it works"
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div
                className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--sand-light)] p-4"
                key={step.title}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-black text-white">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </PageContainer>

      <PageContainer className="grid gap-6 py-0 pb-12 lg:grid-cols-[1fr_420px]">
        <section>
          <SectionHeading
            description="A typical result stacks city, county, and state guidance when the intake details support it."
            title="See an example result"
          />
          <Card className="mt-5 overflow-hidden p-0">
            <div className="border-b border-[var(--line)] bg-[var(--navy)] p-5 text-white">
              <Badge tone="highlight">Example only</Badge>
              <h3 className="mt-4 text-2xl font-black">
                Phoenix parking lot food vendor event
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                A static preview of how matched results can stack across city,
                county, and state records.
              </p>
            </div>
            <div className="grid gap-5 p-5 lg:grid-cols-[1fr_260px]">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                  Matched guidance
                </h4>
                <div className="mt-4 grid gap-3">
                  {previewItems.slice(0, 3).map((item) => (
                    <HeroChecklistRow
                      key={item.label}
                      label={item.label}
                      meta={item.meta}
                    />
                  ))}
                </div>
              </div>
              <div className="grid gap-3">
                <div className="rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface-muted)] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--primary)]">
                    Lead time preview
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Start checking agency items as early as matched lead times
                    suggest.
                  </p>
                </div>
                <div className="rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface-muted)] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--verified-strong)]">
                    Next step / contact
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Use source links and agency contacts to confirm forms,
                    fees, and deadlines.
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
              <Badge tone="verified">Source-linked</Badge>
              <Badge tone="neutral">Plain English</Badge>
            </div>
            <h3 className="mt-4 text-lg font-semibold">
              Results are guidance, not a final approval
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              EventLocal helps you see what to check first. Always confirm
              requirements, timelines, fees, and forms with the official agency.
            </p>
          </Card>
        </aside>
      </PageContainer>

      <PageContainer className="py-0 pb-12">
        <section className="command-pattern rounded-[28px] bg-[var(--navy)] p-6 text-white shadow-[var(--shadow)] lg:p-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <TrustColumn
              title="Trust & transparency"
              items={[
                "Source-linked rule records",
                "Direct links to official agencies",
                "Plain-English explanations",
                "Built for clarity and confidence"
              ]}
            />
            <TrustColumn
              title="Important limits"
              items={[
                "Informational guidance only",
                "Not legal advice",
                "No permit submission",
                "Confirm with official agencies"
              ]}
            />
            <div>
              <h2 className="text-xl font-black">Supported launch areas</h2>
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

      <section className="bg-[var(--navy)]">
        <PageContainer className="py-14 text-center">
          <h2 className="text-3xl font-black tracking-[-0.03em] text-white sm:text-5xl">
            Know before you vend.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300">
            EventLocal helps you plan with confidence.
          </p>
          <ButtonLink className="mt-7" href="/intake">
            Check my event
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </PageContainer>
      </section>
    </main>
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

  if (meta === "Check source" || meta === "Confirm") {
    return "verified";
  }

  return "neutral";
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
