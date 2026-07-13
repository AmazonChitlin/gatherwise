import type { Metadata } from "next";
import { Badge, ButtonLink, Card, PageContainer } from "@/components/ui";

export const metadata: Metadata = {
  title: "Showcase",
  description:
    "A public overview of the Gatherwise Arizona pilot and the kinds of readiness guidance it is designed to surface."
};

const highlights = [
  "Two starting paths for future event planning flows",
  "Plain-language readiness summaries",
  "Why this may apply explanations",
  "Official source and agency emphasis",
  "Arizona pilot scope with cautious trust language"
];

export default function ShowcasePage() {
  return (
    <main className="min-h-screen">
      <PageContainer className="max-w-5xl py-10">
        <section className="command-pattern rounded-[28px] bg-[var(--navy)] p-6 text-white shadow-[var(--shadow)] lg:p-8">
          <Badge tone="highlight">Showcase</Badge>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-[-0.04em] sm:text-5xl">
            A clearer way to review event readiness.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
            The Gatherwise Arizona pilot is being reshaped around user tasks:
            what you can do now, what details matter, what the result means,
            and where to check the official source.
          </p>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {highlights.map((highlight) => (
            <Card className="p-5" key={highlight}>
              <h2 className="text-lg font-black tracking-[-0.02em]">
                {highlight}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Built to make planning steps and source review easier to
                understand before event day.
              </p>
            </Card>
          ))}
        </section>

        <Card className="mt-6 p-5">
          <h2 className="text-2xl font-black tracking-[-0.02em]">
            See the pilot in action
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            The public app is organized around planning tasks. Development-only
            concept routes remain internal and are not part of public
            navigation.
          </p>
          <ButtonLink className="mt-5" href="/intake">
            Plan an event
          </ButtonLink>
        </Card>
      </PageContainer>
    </main>
  );
}
