import type { Metadata } from "next";
import { DisclaimerNotice } from "@/components/disclaimer-notice";
import { Badge, ButtonLink, Card, PageContainer } from "@/components/ui";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn what Gatherwise does, what it does not do, and how the Arizona pilot uses source-backed readiness guidance."
};

const doesItems = [
  "Turns event details into plain-language readiness guidance.",
  "Shows what may apply, what still needs review, and why a route appeared.",
  "Points back to official sources and agency contacts where available.",
  "Helps organizers, vendors, and venues sort next steps before event day."
];

const doesNotItems = [
  "Does not approve an event.",
  "Does not submit permits, taxes, licenses, or forms.",
  "Does not replace the city, county, state, venue, or agency instructions.",
  "Does not guarantee that nothing else applies."
];

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <PageContainer className="max-w-5xl py-10">
        <section className="command-pattern rounded-[28px] bg-[var(--navy)] p-6 text-white shadow-[var(--shadow)] lg:p-8">
          <Badge tone="highlight">About</Badge>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-[-0.04em] sm:text-5xl">
            Gatherwise helps you sort what to check before event day.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
            Gatherwise is an Arizona pilot for organizers, vendors, and venues
            who need a clearer starting point before they rely on agency
            jargon, scattered web pages, or old checklists.
          </p>
        </section>

        <div className="mt-6">
          <DisclaimerNotice />
        </div>

        <section className="mt-6 grid gap-5 lg:grid-cols-2">
          <Card className="p-5">
            <Badge tone="success">What Gatherwise does</Badge>
            <h2 className="mt-4 text-2xl font-black tracking-[-0.02em]">
              Helps you plan next steps
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
              {doesItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <Badge tone="warning">What Gatherwise does not do</Badge>
            <h2 className="mt-4 text-2xl font-black tracking-[-0.02em]">
              Keeps limitations visible
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
              {doesNotItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
          <Card className="p-5">
            <h2 className="text-2xl font-black tracking-[-0.02em]">
              How Gatherwise builds guidance
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Gatherwise uses structured rule records connected to city, county,
              and state sources where available. The rule engine compares those
              records with the event details you provide, then shows source-
              backed planning guidance in plain language.
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Some items may apply based on your details. Some items need
              review. Missing facts can change the result. That is why the
              product keeps the source trail visible.
            </p>
          </Card>

          <Card className="border-[var(--primary)] p-5">
            <h2 className="text-2xl font-black tracking-[-0.02em]">
              Arizona pilot
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              The current pilot covers pages, guided intake, Prisma storage,
              source-linked results, and Arizona-first launch guidance.
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              More coverage, richer source handling, and AI-assisted intake are
              still being shaped.
            </p>
            <ButtonLink className="mt-5" href="/intake">
              Plan an event
            </ButtonLink>
          </Card>
        </section>
      </PageContainer>
    </main>
  );
}
