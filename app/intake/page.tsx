import type { Metadata } from "next";
import { IntakeExperience } from "@/components/intake-experience";
import { DisclaimerNotice } from "@/components/disclaimer-notice";
import { Badge, Card, PageContainer } from "@/components/ui";

export const metadata: Metadata = {
  title: "Plan an Event",
  description:
    "Choose a starting path for the Gatherwise Arizona pilot and use the guided form to build a source-backed readiness summary."
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function IntakePage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const selectedPath = getParam(params.path) === "describe" ? "describe" : "guided";

  return (
    <main className="min-h-screen">
      <PageContainer>
        <section className="command-pattern rounded-[28px] bg-[var(--navy)] p-6 text-white shadow-[var(--shadow)] lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <Badge tone="highlight">Plan an event</Badge>
              <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-[-0.04em] sm:text-5xl">
                Choose a starting path.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Start with a description review or use the guided form. Both
                paths lead to a source-backed readiness summary, and the manual
                path stays available the whole way through.
              </p>
            </div>
            <div className="rounded-[var(--radius-card)] border border-white/10 bg-white/8 p-4 text-sm leading-6 text-slate-300">
              What you can do now: pick a path, enter the details you know, and
              build a readiness summary that points back to official sources.
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <IntakeExperience initialPath={selectedPath} />
          </div>

          <aside className="space-y-4">
            <DisclaimerNotice />
            <Card className="p-4">
              <h2 className="text-base font-bold">What information is needed</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Start with location, event type, venue, attendance, and vendor
                count. Add food, alcohol, sound, structures, traffic, and
                signage details if they apply.
              </p>
            </Card>
            <Card className="border-[var(--primary)] p-4">
              <h2 className="text-base font-bold">What the result means</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Results show what may apply, what needs review, and where to
                check the official source. Missing details may change your
                results.
              </p>
            </Card>
          </aside>
        </section>
      </PageContainer>
    </main>
  );
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
