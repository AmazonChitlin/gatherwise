import type { Metadata } from "next";
import { Check, Minus, Route } from "lucide-react";
import { CivicButtonLink, CivicStatus } from "@/components/civic";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why Gatherwise exists, how its source-grounded Arizona pilot works, and where its current boundaries remain.",
  alternates: { canonical: "/about" },
};

const principles = [
  [
    "Start with event language",
    "Organizers should not need agency vocabulary before they can ask a useful question.",
  ],
  [
    "Keep people in review",
    "AI-extracted facts remain drafts until a person confirms, edits, or supplies the detail.",
  ],
  [
    "Make evidence inspectable",
    "A possible requirement should lead from fact to rule to official source.",
  ],
  [
    "Refuse unsupported certainty",
    "Unknown details remain unknown and unsupported geography stops before evaluation.",
  ],
] as const;

export default function AboutPage() {
  return (
    <main className="civic-about-page">
      <section className="civic-about-hero" aria-labelledby="about-title">
        <div className="civic-public-wrap civic-about-hero__inner">
          <div>
            <p className="civic-data-label-shared">About Gatherwise</p>
            <h1 id="about-title">
              Local event planning should start with a route, not a maze.
            </h1>
          </div>
          <div>
            <p>
              Gatherwise exists because event-readiness information is spread
              across agencies, source pages, thresholds, and unfamiliar terms.
            </p>
            <CivicStatus tone="active">Arizona pilot</CivicStatus>
          </div>
        </div>
      </section>

      <section className="civic-about-origin" aria-labelledby="why-title">
        <div className="civic-public-wrap civic-about-origin__inner">
          <Route aria-hidden="true" />
          <div>
            <p className="civic-data-label-shared">Why it exists</p>
            <h2 id="why-title">
              The product organizes uncertainty instead of smoothing it away.
            </h2>
            <p>
              An organizer can describe an event, review the resulting facts,
              and see possible planning routes tied to reviewed official
              records. Missing information stays visible because it may change
              the answer.
            </p>
          </div>
        </div>
      </section>

      <section
        className="civic-about-principles"
        aria-labelledby="principles-title"
      >
        <div className="civic-public-wrap">
          <header className="civic-public-heading">
            <p className="civic-data-label-shared">Product principles</p>
            <h2 id="principles-title">Trust is a visible method.</h2>
          </header>
          <ol>
            {principles.map(([title, body], index) => (
              <li key={title}>
                <span>0{index + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="civic-about-method" aria-labelledby="method-title">
        <div className="civic-public-wrap civic-about-method__inner">
          <div>
            <p className="civic-data-label-shared">
              What Gatherwise does · Source-grounded method
            </p>
            <h2 id="method-title">
              Human-confirmed facts. Deterministic rules. Official evidence.
            </h2>
          </div>
          <ol>
            <li>
              <Check aria-hidden="true" />
              <span>
                AI may structure known event facts and identify ambiguity.
              </span>
            </li>
            <li>
              <Check aria-hidden="true" />
              <span>
                The user confirms facts before they become authoritative input.
              </span>
            </li>
            <li>
              <Check aria-hidden="true" />
              <span>
                The rule engine selects possible requirements and source
                records.
              </span>
            </li>
            <li>
              <Check aria-hidden="true" />
              <span>
                Grounded or deterministic explanations remain secondary to the
                trace.
              </span>
            </li>
          </ol>
        </div>
      </section>

      <section
        className="civic-about-limits"
        aria-labelledby="about-limits-title"
      >
        <div className="civic-public-wrap civic-about-limits__inner">
          <div>
            <p className="civic-data-label-shared">Current limitations</p>
            <h2 id="about-limits-title">
              Clear boundaries are part of the product.
            </h2>
          </div>
          <ul>
            <li>
              <Minus aria-hidden="true" />
              The current rule and source model covers an Arizona pilot, not
              every jurisdiction.
            </li>
            <li>
              <Minus aria-hidden="true" />
              Gatherwise provides informational guidance, not approval or legal
              advice.
            </li>
            <li>
              <Minus aria-hidden="true" />
              Official pages and agency instructions can change after review.
            </li>
            <li>
              <Minus aria-hidden="true" />
              Human verification remains recommended before event day.
            </li>
            <li>
              <Minus aria-hidden="true" />
              When AI is unavailable, deterministic intake and explanation
              fallbacks remain usable.
            </li>
          </ul>
          <CivicButtonLink href="/intake">Plan an event</CivicButtonLink>
        </div>
      </section>
    </main>
  );
}
