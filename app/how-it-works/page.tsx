import type { Metadata } from "next";
import { Badge, ButtonLink, Card, PageContainer } from "@/components/ui";
import { DisclaimerNotice } from "@/components/disclaimer-notice";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "See how Gatherwise turns event details into source-backed readiness guidance for the Arizona pilot."
};

const steps = [
  {
    title: "Tell us what you know",
    text: "Start with a description path or the guided form. The current Arizona pilot uses the guided form to keep results source-backed."
  },
  {
    title: "Gatherwise matches your details",
    text: "The app compares your event facts with structured city, county, and state rule records."
  },
  {
    title: "Review what may apply",
    text: "Results highlight what may apply, what still needs review, and which details may change the outcome."
  },
  {
    title: "Check the official source",
    text: "Use the linked source and agency information to confirm forms, deadlines, fees, and current instructions."
  }
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen">
      <PageContainer className="max-w-5xl py-10">
        <section className="command-pattern rounded-[28px] bg-[var(--navy)] p-6 text-white shadow-[var(--shadow)] lg:p-8">
          <Badge tone="highlight">How it works</Badge>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-[-0.04em] sm:text-5xl">
            Plan first. Check sources before you commit.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
            Gatherwise is built to help organizers, vendors, and venues move
            from event facts to source-backed next steps without needing agency
            jargon first.
          </p>
        </section>

        <div className="mt-6">
          <DisclaimerNotice />
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {steps.map((step, index) => (
            <Card className="p-5" key={step.title}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-black text-white">
                {index + 1}
              </div>
              <h2 className="mt-4 text-xl font-black tracking-[-0.02em]">
                {step.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {step.text}
              </p>
            </Card>
          ))}
        </section>

        <Card className="mt-6 p-5">
          <h2 className="text-2xl font-black tracking-[-0.02em]">
            What the result means
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Results are based on the details you provided and the current pilot
            rule records. They show what may apply, why it may apply, and where
            to check the official source. They do not approve an event or make
            a legal determination.
          </p>
          <ButtonLink className="mt-5" href="/intake">
            Plan an event
          </ButtonLink>
        </Card>
      </PageContainer>
    </main>
  );
}
