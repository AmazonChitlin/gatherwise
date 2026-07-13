import type { Metadata } from "next";
import { Badge, Card, PageContainer } from "@/components/ui";
import { DisclaimerNotice } from "@/components/disclaimer-notice";
import { supportedJurisdictions } from "@/lib/config";

export const metadata: Metadata = {
  title: "Sources",
  description:
    "Understand how Gatherwise uses official sources and where Arizona pilot coverage currently exists."
};

export default function SourcesPage() {
  return (
    <main className="min-h-screen">
      <PageContainer className="max-w-5xl py-10">
        <section className="command-pattern rounded-[28px] bg-[var(--navy)] p-6 text-white shadow-[var(--shadow)] lg:p-8">
          <Badge tone="verified">Sources</Badge>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-[-0.04em] sm:text-5xl">
            Follow the source trail.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
            Gatherwise points to official city, county, and state sources where
            the current Arizona pilot has structured coverage.
          </p>
        </section>

        <div className="mt-6">
          <DisclaimerNotice />
        </div>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
          <Card className="p-5">
            <h2 className="text-2xl font-black tracking-[-0.02em]">
              How source-backed guidance works
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted)]">
              <li>Gatherwise matches event details to structured rule records.</li>
              <li>Each matched item should lead you back to an official source or agency path.</li>
              <li>If we could not verify something, the product should say so clearly.</li>
              <li>Unsupported or missing evidence should never be presented as verified guidance.</li>
            </ul>
          </Card>

          <Card className="p-5">
            <h2 className="text-2xl font-black tracking-[-0.02em]">
              Arizona pilot scope
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {supportedJurisdictions.map((area) => (
                <span
                  className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-bold text-[var(--muted)]"
                  key={area.code}
                >
                  {area.label}
                </span>
              ))}
            </div>
          </Card>
        </section>
      </PageContainer>
    </main>
  );
}
