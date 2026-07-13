import { IntakeForm } from "@/components/intake-form";
import { DisclaimerNotice } from "@/components/disclaimer-notice";
import { Badge, Card, PageContainer } from "@/components/ui";

export default function IntakePage() {
  return (
    <main className="min-h-screen">
      <PageContainer>
        <section className="command-pattern rounded-[28px] bg-[var(--navy)] p-6 text-white shadow-[var(--shadow)] lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <Badge tone="highlight">Event readiness intake</Badge>
              <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-[-0.04em] sm:text-5xl">
                Tell us what you’re planning.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Answer what you know, choose the closest option when you’re
                unsure, and EventLocal will build a plain-English checklist of
                items to confirm with the relevant agency.
              </p>
            </div>
            <div className="rounded-[var(--radius-card)] border border-white/10 bg-white/8 p-4 text-sm leading-6 text-slate-300">
              Start with the basics. Optional details help future rules match
              more precisely, but the form is designed so you can keep moving.
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="p-5">
            <IntakeForm />
          </Card>
          <aside className="space-y-4">
            <DisclaimerNotice />
            <Card className="p-4">
              <h2 className="text-base font-bold">What happens next</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Submitted answers are saved and routed to source-linked results.
                This MVP gives planning guidance only and does not submit
                permits, provide legal advice, or guarantee compliance.
              </p>
            </Card>
            <Card className="border-[var(--primary)] p-4">
              <h2 className="text-base font-bold">Plain-English first</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                You do not need to know permit names. Describe the setup, and
                EventLocal will show items to confirm.
              </p>
            </Card>
          </aside>
        </section>
      </PageContainer>
    </main>
  );
}
