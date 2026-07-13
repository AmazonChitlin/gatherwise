import { DisclaimerNotice } from "@/components/disclaimer-notice";
import {
  Badge,
  ButtonLink,
  Card,
  PageContainer
} from "@/components/ui";

const doesItems = [
  "Turns event intake answers into plain-English checklist items.",
  "Shows likely required, may be required, or confirm-with-agency guidance.",
  "Displays source links, agency contacts, confidence, and verification status where available.",
  "Highlights planning lead times and red flags to confirm before event day."
];

const doesNotItems = [
  "Does not provide legal advice or make final legal conclusions.",
  "Does not submit permits, applications, taxes, licenses, or forms.",
  "Does not guarantee that an event is approved, complete, or compliant.",
  "Does not replace the city, county, state, venue, or agency instructions."
];

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <PageContainer className="max-w-5xl py-10">
        <section className="command-pattern rounded-[28px] bg-[var(--navy)] p-6 text-white shadow-[var(--shadow)] lg:p-8">
          <Badge tone="highlight">About / Disclaimer</Badge>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-[-0.04em] sm:text-5xl">
            Ready guidance, honest limits.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
            EventLocal helps vendors, food trucks, artists, pop-up businesses,
            organizers, venues, and market hosts prepare for local events with
            plain-English readiness guidance. It is a planning tool, not a
            government portal or legal service.
          </p>
        </section>

        <div className="mt-6">
          <DisclaimerNotice />
        </div>

        <section className="mt-6 grid gap-5 lg:grid-cols-2">
          <Card className="p-5">
            <Badge tone="success">What EventLocal does</Badge>
            <h2 className="mt-4 text-2xl font-black tracking-[-0.02em]">
              Helps you spot what to confirm
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
              {doesItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <Badge tone="warning">What EventLocal does not do</Badge>
            <h2 className="mt-4 text-2xl font-black tracking-[-0.02em]">
              Does not replace official review
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
              How EventLocal builds guidance
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              EventLocal uses structured rule records connected to official
              source pages where available. The rule engine compares those
              records with the intake answers you provide, then shows checklist
              items with source links, agency contacts, lead times, confidence,
              and verification status.
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Some items may be cautious planning guidance. That means the item
              is worth confirming early because the details can depend on the
              exact event setup, location, date, venue, agency process, or
              current rule language.
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Requirements can change. Always check the official source and
              confirm requirements, deadlines, fees, forms, and final
              instructions with the listed agency before relying on a result.
            </p>
          </Card>

          <Card className="border-[var(--primary)] p-5">
            <h2 className="text-2xl font-black tracking-[-0.02em]">
              Current MVP scope
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              This first version includes pages, intake validation, Prisma
              storage, source inventory, verified starter rule records, and
              source-linked results for the Arizona launch area.
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Payments, downloads, permit submission, document uploads,
              dashboards, venue listings, subscriptions, and admin tools are
              not active in this MVP.
            </p>
            <ButtonLink className="mt-5" href="/intake">
              Start intake
            </ButtonLink>
          </Card>
        </section>
      </PageContainer>
    </main>
  );
}
