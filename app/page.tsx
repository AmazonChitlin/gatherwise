import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  CircleHelp,
  FileCheck2,
  Route,
  ShieldCheck,
  SlidersHorizontal
} from "lucide-react";
import {
  getDemoGuidedHref,
  getDemoResultsHref,
  listDemoScenarios
} from "@/lib/demo-scenarios";

export const metadata: Metadata = {
  title: "Event readiness with an evidence trail",
  description:
    "Describe an Arizona event, review the facts that matter, and follow a source-backed route to the next planning step."
};

const routeSteps = [
  {
    number: "01",
    title: "Describe the event",
    text: "Start with the idea as you would explain it to a venue: place, crowd, food, sound, structures, and sales.",
    detail: "Plain language in. No permit vocabulary required."
  },
  {
    number: "02",
    title: "Review the facts",
    text: "Gatherwise separates what you said, what was extracted, and what is still unknown before any rule is evaluated.",
    detail: "You confirm the record. AI does not confirm it for you."
  },
  {
    number: "03",
    title: "Follow the readiness route",
    text: "Verified rule records connect your confirmed details to possible requirements and the next useful action.",
    detail: "Unknown details stay visible as forks in the route."
  },
  {
    number: "04",
    title: "Verify the official source",
    text: "Every result leads back to a reviewed source record so you can check current agency instructions directly.",
    detail: "Sources change. Human verification remains part of the route."
  }
];

const proofItems = [
  "Reviewed rule records",
  "Official source trail",
  "36 evaluation scenarios",
  "Deterministic fallback",
  "No-login demos"
];

const systemStages = [
  {
    number: "01",
    label: "AI extraction",
    text: "Turns event language into a draft set of known and unknown facts."
  },
  {
    number: "02",
    label: "Human confirmation",
    text: "Keeps the organizer in control before evaluation begins."
  },
  {
    number: "03",
    label: "Deterministic evaluation",
    text: "Matches confirmed facts against versioned, source-linked rules."
  },
  {
    number: "04",
    label: "Official evidence",
    text: "Returns trusted source records and refuses unsupported geography."
  }
];

const featuredScenarios = listDemoScenarios().slice(0, 3);

export default function HomePage() {
  return (
    <main className="civic-home">
      <div className="civic-signal-strip" role="note">
        <div className="civic-wrap civic-signal-strip__inner">
          <span className="civic-signal-dot" aria-hidden="true" />
          <strong>Arizona pilot</strong>
          <span>Maricopa County launch coverage</span>
          <span className="civic-coordinates" aria-hidden="true">
            33.4484 N / 112.0740 W
          </span>
        </div>
      </div>

      <section className="civic-hero" aria-labelledby="civic-hero-title">
        <div className="civic-contour civic-contour--hero" aria-hidden="true" />
        <div className="civic-wrap civic-hero__grid">
          <div className="civic-hero__copy">
            <p className="civic-kicker civic-kicker--light">Civic signal / event readiness</p>
            <h1 id="civic-hero-title">
              Your event has a route. <em>Gatherwise shows the next turn.</em>
            </h1>
            <p className="civic-hero__lede">
              Turn an event idea into reviewed facts, possible requirements,
              and an official source trail without learning municipal language first.
            </p>
            <div className="civic-actions">
              <Link
                aria-label="Describe my event in plain language"
                className="civic-button civic-button--signal focus-ring"
                href="/intake?path=describe"
              >
                Describe an event
                <ArrowRight aria-hidden="true" size={18} />
              </Link>
              <Link className="civic-button civic-button--outline-light focus-ring" href={getDemoResultsHref(featuredScenarios[0])}>
                Try a live demo
              </Link>
            </div>
            <Link className="civic-quiet-link focus-ring" href="/how-it-works">
              How it works <ChevronRight aria-hidden="true" size={16} />
            </Link>
            <p className="civic-fine-print">
              Informational guidance only. Check the official source before relying on a result.
            </p>
          </div>

          <HeroProductRoute />
        </div>
      </section>

      <section className="civic-proof" aria-label="Factual product proof">
        <div className="civic-wrap civic-proof__grid">
          {proofItems.map((item, index) => (
            <div className="civic-proof__item" key={item}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <strong>{item}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="civic-section civic-route-story" aria-labelledby="route-story-title">
        <div className="civic-wrap">
          <header className="civic-section-heading civic-section-heading--split">
            <div>
              <p className="civic-kicker">What you can do now / 01-04</p>
              <h2 id="route-story-title">One event idea. Four legible turns.</h2>
            </div>
            <p>
              What information is needed becomes clearer as the route progresses.
              Each step answers a different question without hiding uncertainty.
            </p>
          </header>

          <ol className="civic-route-list">
            {routeSteps.map((step) => (
              <li className="civic-route-step" key={step.number}>
                <span className="civic-route-step__marker" aria-hidden="true">{step.number}</span>
                <div className="civic-route-step__content">
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
                <p className="civic-route-step__detail">{step.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="civic-section civic-inside" aria-labelledby="inside-title">
        <div className="civic-wrap">
          <header className="civic-section-heading civic-section-heading--wide">
            <p className="civic-kicker">What the result means / Live interface anatomy</p>
            <h2 id="inside-title">Inside a Gatherwise result</h2>
            <p>
              The summary leads. The evidence stays close. The route makes the next
              action visible without giving every result the same weight.
            </p>
          </header>
          <ResultComposition />
        </div>
      </section>

      <section className="civic-system" aria-labelledby="system-title">
        <div className="civic-contour civic-contour--system" aria-hidden="true" />
        <div className="civic-wrap civic-system__layout">
          <header className="civic-system__intro">
            <p className="civic-kicker civic-kicker--light">Authority boundary / Arizona pilot</p>
            <h2 id="system-title">Built to refuse guesswork.</h2>
            <p>
              AI can organize event facts. It cannot choose requirements, agencies,
              thresholds, deadlines, or source links. Those decisions stay in reviewed,
              deterministic records.
            </p>
            <div className="civic-refusal">
              <CircleHelp aria-hidden="true" size={21} />
              <div>
                <strong>Outside supported geography?</strong>
                <p>Gatherwise says the route is not supported instead of presenting unverified guidance.</p>
              </div>
            </div>
          </header>

          <ol className="civic-system-map" aria-label="Gatherwise system stages">
            {systemStages.map((stage) => (
              <li key={stage.number}>
                <span>{stage.number}</span>
                <div>
                  <h3>{stage.label}</h3>
                  <p>{stage.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="civic-section civic-demos" aria-labelledby="demos-title">
        <div className="civic-wrap">
          <header className="civic-section-heading civic-section-heading--split">
            <div>
              <p className="civic-kicker">Public demo scenarios / Fictional demo data</p>
              <h2 id="demos-title">Three events. Three different routes.</h2>
            </div>
            <p>
              Each One-click demo is fictional, requires no login, and uses trusted
              source links. The guided sample remains available without AI.
            </p>
          </header>

          <div className="civic-scenario-list">
            {featuredScenarios.map((scenario, index) => (
              <article className="civic-scenario" key={scenario.slug}>
                <div className="civic-scenario__number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="civic-scenario__copy">
                  <p className="civic-data-label">Fictional / Arizona pilot</p>
                  <h3>{scenario.title.replace("Fictional demo: ", "")}</h3>
                  <p>{scenario.summary}</p>
                  <small>{scenario.whyItMatters}</small>
                </div>
                <div className="civic-scenario__actions">
                  <Link className="civic-button civic-button--ink focus-ring" href={getDemoResultsHref(scenario)}>
                    One-click demo <ArrowRight aria-hidden="true" size={17} />
                  </Link>
                  <Link className="civic-text-link focus-ring" href={getDemoGuidedHref(scenario)}>
                    Guided sample
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="civic-final" aria-labelledby="final-title">
        <div className="civic-wrap civic-final__inner">
          <div>
            <p className="civic-kicker">Ready when the idea is</p>
            <h2 id="final-title">
              Planning starts with an idea. <em>Readiness starts with the right route.</em>
            </h2>
          </div>
          <div className="civic-final__actions">
            <Link className="civic-button civic-button--signal focus-ring" href="/intake?path=describe">
              Describe an event <ArrowRight aria-hidden="true" size={18} />
            </Link>
            <Link className="civic-button civic-button--outline-dark focus-ring" href="/intake?path=guided">
              Use the guided form
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function HeroProductRoute() {
  return (
    <div className="civic-product-map" aria-label="Example Gatherwise route from event description to official source">
      <div className="civic-map-coordinate civic-map-coordinate--top" aria-hidden="true">PHX / ROUTE 04</div>
      <div className="civic-product-panel civic-product-panel--description">
        <p className="civic-data-label">Event idea / User-provided</p>
        <p>Saturday punk show in a private Phoenix parking lot for about 300 people...</p>
        <span>1,284 / 2,500 characters</span>
      </div>

      <div className="civic-product-route" aria-hidden="true">
        <span className="civic-product-route__line" />
        <span className="civic-product-route__stop civic-product-route__stop--one">01</span>
        <span className="civic-product-route__stop civic-product-route__stop--two">02</span>
        <span className="civic-product-route__stop civic-product-route__stop--three">03</span>
        <span className="civic-product-route__stop civic-product-route__stop--four">04</span>
      </div>

      <div className="civic-product-panel civic-product-panel--facts">
        <div className="civic-panel-heading">
          <span>Extracted facts</span>
          <strong>7 to review</strong>
        </div>
        <FactRow label="Phoenix" status="Confirmed" />
        <FactRow label="300 people" status="Confirmed" />
        <FactRow label="Amplified sound" status="Confirmed" />
        <FactRow label="Property access" status="Unknown" unknown />
      </div>

      <div className="civic-product-panel civic-product-panel--route">
        <p className="civic-data-label">Readiness route / Possible requirement</p>
        <div className="civic-route-callout">
          <span aria-hidden="true">03</span>
          <div>
            <strong>Phoenix outdoor event review</strong>
            <p>May apply based on parking lot use and public attendance.</p>
          </div>
        </div>
      </div>

      <div className="civic-source-node">
        <FileCheck2 aria-hidden="true" size={20} />
        <div>
          <span>Official source / Reviewed record</span>
          <strong>City of Phoenix</strong>
        </div>
      </div>
      <div className="civic-map-coordinate civic-map-coordinate--bottom" aria-hidden="true">EVIDENCE / 04.17</div>
    </div>
  );
}

function FactRow({ label, status, unknown = false }: { label: string; status: string; unknown?: boolean }) {
  return (
    <div className="civic-fact-row">
      <span className={unknown ? "civic-status-shape civic-status-shape--unknown" : "civic-status-shape"} aria-hidden="true" />
      <strong>{label}</strong>
      <small>{status}</small>
    </div>
  );
}

function ResultComposition() {
  return (
    <div className="civic-result-composition">
      <div className="civic-result__mast">
        <div>
          <p className="civic-data-label">Readiness summary / Phoenix, AZ</p>
          <h3>Several planning steps may apply before event day.</h3>
        </div>
        <div className="civic-result__status">
          <span aria-hidden="true" />
          Needs review
        </div>
      </div>

      <div className="civic-result__primary">
        <div className="civic-result__route-index" aria-hidden="true">01</div>
        <div>
          <p className="civic-data-label">What may apply</p>
          <h4>Phoenix outdoor event review</h4>
          <p>Start with the city event review path before confirming venue operations.</p>
        </div>
        <span className="civic-result__tag">May apply</span>
      </div>

      <div className="civic-result__evidence">
        <div className="civic-evidence-step">
          <span>01</span>
          <div><small>Your fact</small><strong>Private parking lot</strong></div>
        </div>
        <div className="civic-evidence-step">
          <span>02</span>
          <div><small>Verified rule</small><strong>Outdoor public attendance</strong></div>
        </div>
        <div className="civic-evidence-step civic-evidence-step--source">
          <span>03</span>
          <div><small>Official source</small><strong>City of Phoenix special events</strong></div>
        </div>
      </div>

      <div className="civic-result__rail">
        <section>
          <ShieldCheck aria-hidden="true" size={21} />
          <div><p className="civic-data-label">Why it may apply</p><p>Parking lot use, public attendance, and amplified sound activate reviewed rule checks.</p></div>
        </section>
        <section>
          <CircleHelp aria-hidden="true" size={21} />
          <div><p className="civic-data-label">What could change the result</p><p>Property access and temporary structure dimensions still need review.</p></div>
        </section>
      </div>

      <div className="civic-result__tools">
        <div><Route aria-hidden="true" size={20} /><span><strong>Readiness Route</strong><small>4 stops / 1 open fork</small></span></div>
        <div><SlidersHorizontal aria-hidden="true" size={20} /><span><strong>Event Change Simulator</strong><small>Compare one fact at a time</small></span></div>
        <div><FileCheck2 aria-hidden="true" size={20} /><span><strong>Evidence Trail</strong><small>Fact to rule to source</small></span></div>
      </div>
    </div>
  );
}
