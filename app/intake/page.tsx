import type { Metadata } from "next";
import { IntakeForm } from "@/components/intake-form";
import { DisclaimerNotice } from "@/components/disclaimer-notice";
import { Badge, ButtonLink, Card, PageContainer } from "@/components/ui";

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
                Start with a description path or use the guided form. The
                Arizona pilot uses the guided form today so results stay
                source-backed and easy to review.
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
            <div className="grid gap-4 md:grid-cols-2">
              <PathChoice
                active={selectedPath === "describe"}
                body="A plain-language describe path is being shaped for the Arizona pilot. It is not active yet, so use the guided form today."
                cta="Preview this path"
                href="/intake?path=describe"
                title="Describe my event"
              />
              <PathChoice
                active={selectedPath === "guided"}
                body="Use the guided form for source-backed pilot results based on the details you provide."
                cta="Use the guided form"
                href="/intake?path=guided"
                title="Use the guided form"
              />
            </div>

            {selectedPath === "describe" ? (
              <Card className="border-[var(--warning)] bg-[var(--warning-soft)] p-5">
                <Badge tone="warning">Preview path</Badge>
                <h2 className="mt-3 text-xl font-black tracking-[-0.02em]">
                  Describe my event is not active yet.
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  We have not added AI-assisted description handling yet. Use
                  the guided form below so your result stays based on the
                  details you provide and the current source-backed pilot
                  records.
                </p>
                <ButtonLink className="mt-4" href="/intake?path=guided">
                  Switch to guided form
                </ButtonLink>
              </Card>
            ) : null}

            <Card className="p-5">
              <IntakeForm />
            </Card>
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

function PathChoice({
  active,
  body,
  cta,
  href,
  title
}: {
  active: boolean;
  body: string;
  cta: string;
  href: string;
  title: string;
}) {
  return (
    <Card className={`p-5 ${active ? "border-[var(--primary)]" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-black tracking-[-0.02em]">{title}</h2>
        <Badge tone={active ? "primary" : "neutral"}>
          {active ? "Selected" : "Available"}
        </Badge>
      </div>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{body}</p>
      <ButtonLink className="mt-4" href={href} tone={active ? "primary" : "secondary"}>
        {cta}
      </ButtonLink>
    </Card>
  );
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
