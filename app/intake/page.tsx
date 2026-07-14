import type { Metadata } from "next";
import { ArrowUpRight, Landmark, Route } from "lucide-react";
import { CivicStatus } from "@/components/civic";
import { IntakeExperience } from "@/components/intake-experience";
import {
  getDemoScenario,
  getDemoDescribeHref,
  getDemoGuidedHref,
  listDemoScenarios,
} from "@/lib/demo-scenarios";

export const metadata: Metadata = {
  title: "Plan an Event",
  description:
    "Choose a starting path for the Gatherwise Arizona pilot and use the guided form to build a source-backed readiness summary.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function IntakePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const selectedPath =
    getParam(params.path) === "describe" ? "describe" : "guided";
  const demo = getDemoScenario(getParam(params.demo));
  const guidedDemos = listDemoScenarios()
    .filter((scenario) => scenario.featuredPath === "guided")
    .slice(0, 3);

  return (
    <main className="civic-intake-page">
      <section aria-labelledby="intake-title" className="civic-intake-intro">
        <div className="civic-intake-intro__inner">
          <div>
            <p className="civic-section-label">Plan an event</p>
            <h1 id="intake-title">
              Turn the details you know into a readiness route.
            </h1>
          </div>
          <p>
            Describe the event or answer step-by-step questions. Both paths
            preserve unknown details and lead to the same source-backed result.
            The manual path stays available throughout.
          </p>
          <CivicStatus tone="source">Arizona pilot</CivicStatus>
        </div>
      </section>

      <div className="civic-intake-layout">
        <div className="civic-intake-layout__workspace">
          <IntakeExperience
            demoTitle={demo?.title}
            initialPath={selectedPath}
            prefilledValues={
              demo?.featuredPath === "guided" ? demo.intake : undefined
            }
          />
        </div>

        <aside aria-label="Planning notes" className="civic-intake-rail">
          <section className="civic-intake-rail__section">
            <Landmark aria-hidden="true" />
            <p className="civic-data-label-shared">Pilot boundary</p>
            <h2>Arizona guidance, with limits shown.</h2>
            <p>
              Gatherwise provides general information, not legal advice, and
              does not submit permits. Check official sources and confirm
              deadlines, fees, and forms with the relevant agency.
            </p>
          </section>

          <section className="civic-intake-rail__section">
            <Route aria-hidden="true" />
            <p className="civic-data-label-shared">What helps</p>
            <h2>Start with the route-changing facts.</h2>
            <p>
              Location, event type, property, attendance, vendors, food,
              alcohol, sound, structures, and public-space impacts.
            </p>
          </section>

          <details className="civic-intake-demos">
            <summary>Public demo scenarios</summary>
            <p>
              No login, live AI, or permanent storage is needed to explore these
              sample routes.
            </p>
            <div className="civic-intake-demos__list">
              {guidedDemos.map((scenario) => (
                <article key={scenario.slug}>
                  <h3>{scenario.title}</h3>
                  <p>{scenario.summary}</p>
                  <div>
                    <a href={getDemoGuidedHref(scenario)}>
                      Open guided sample
                      <ArrowUpRight aria-hidden="true" />
                    </a>
                    <a href={getDemoDescribeHref(scenario)}>Describe path</a>
                  </div>
                </article>
              ))}
            </div>
          </details>
        </aside>
      </div>
    </main>
  );
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
