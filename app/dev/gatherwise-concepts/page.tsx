import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  FileText,
  MapPinned,
  Menu,
  Route,
  Search,
  Ticket
} from "lucide-react";

export const metadata: Metadata = {
  title: "Gatherwise Concepts | Dev",
  description: "Development-only visual concept directions for Gatherwise.",
  robots: {
    index: false,
    follow: false
  }
};

const sampleFacts = [
  "Phoenix",
  "Parking lot venue",
  "250 attendees",
  "3 food vendors",
  "Amplified sound planned"
];

const sampleSteps = [
  { label: "Event facts", state: "complete" },
  { label: "Local review", state: "active" },
  { label: "Source check", state: "pending" }
] as const;

const conceptDirections = [
  {
    slug: "route-ledger",
    name: "Route Ledger",
    eyebrow: "Transit and call-sheet logic",
    summary:
      "A structured route board that connects facts, forks, and evidence like a production ledger pinned to a wayfinding map.",
    rationale:
      "Best for explaining why a requirement appeared and where the next evidence stop lives."
  },
  {
    slug: "local-signal",
    name: "Local Signal",
    eyebrow: "Wayfinding and venue credentials",
    summary:
      "A bold signage-driven system with strong markers, fast hierarchy, and route states that read clearly at a glance.",
    rationale:
      "Best for quick first-impression comprehension and strong mobile scannability."
  },
  {
    slug: "field-guide",
    name: "Field Guide",
    eyebrow: "Stamped notes and source records",
    summary:
      "A layered planning notebook that feels practical and human, with clipped evidence tabs and marked-up route notes.",
    rationale:
      "Best for trust-building around provenance, caveats, and manual fallback."
  }
] as const;

export default function GatherwiseConceptsPage() {
  return (
    <main className="gw-concepts-shell min-h-screen">
      <section className="gw-concepts-intro">
        <div className="gw-concepts-wrap">
          <div className="gw-concepts-kicker">Development-only concept route</div>
          <h1 className="gw-concepts-title">
            Gatherwise visual directions: civic wayfinding meets independent
            event production.
          </h1>
          <p className="gw-concepts-copy">
            These three bounded concepts use the same sample content so we can
            review visual identity, explanation clarity, and evidence trust
            without changing the production interface.
          </p>
          <div className="gw-concepts-actions">
            <Link className="gw-review-button gw-review-button-primary focus-ring" href="#concepts">
              Jump to concepts
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              className="gw-review-button gw-review-button-secondary focus-ring"
              href="#route-ledger"
            >
              Start with Route Ledger
            </Link>
          </div>
          <div className="gw-review-note">
            Excluded from production navigation. Use this route for review only:
            <code> /dev/gatherwise-concepts</code>
          </div>
        </div>
      </section>

      <section className="gw-concepts-wrap gw-concepts-summary" id="concepts">
        {conceptDirections.map((direction) => (
          <article className="gw-concepts-summary-card" key={direction.slug}>
            <p className="gw-concepts-summary-label">{direction.eyebrow}</p>
            <h2>{direction.name}</h2>
            <p>{direction.summary}</p>
            <p className="gw-concepts-summary-rationale">{direction.rationale}</p>
          </article>
        ))}
      </section>

      <section className="gw-concepts-wrap gw-concepts-stack">
        {conceptDirections.map((direction) => (
          <ConceptSection
            conceptClass={direction.slug}
            key={direction.slug}
            name={direction.name}
            summary={direction.summary}
          />
        ))}
      </section>
    </main>
  );
}

function ConceptSection({
  conceptClass,
  name,
  summary
}: {
  conceptClass: string;
  name: string;
  summary: string;
}) {
  return (
    <section className={`gw-concept ${conceptClass}`} id={conceptClass}>
      <div className="gw-concept-frame">
        <div className="gw-concept-browser">
          <span />
          <span />
          <span />
        </div>
        <div className="gw-concept-canvas">
          <PrototypeShell name={name} summary={summary} />
        </div>
      </div>
    </section>
  );
}

function PrototypeShell({
  name,
  summary
}: {
  name: string;
  summary: string;
}) {
  return (
    <div className="gw-prototype">
      <header className="gw-prototype-header">
        <div className="gw-prototype-brand">
          <div className="gw-prototype-badge">
            <Route className="h-4 w-4" />
          </div>
          <div>
            <p className="gw-prototype-eyebrow">Gatherwise concept study</p>
            <h2>{name}</h2>
          </div>
        </div>
        <div className="gw-prototype-navwrap">
          <nav aria-label="Concept navigation" className="gw-prototype-nav">
            <Link className="focus-ring" href="#route-ledger">
              Home
            </Link>
            <Link className="focus-ring" href="#route-ledger">
              Event intake
            </Link>
            <Link className="focus-ring" href="#route-ledger">
              Readiness route
            </Link>
          </nav>
          <button className="gw-menu-button focus-ring" type="button">
            <Menu className="h-4 w-4" />
            Menu
          </button>
        </div>
      </header>

      <div className="gw-breadcrumbs" aria-label="Breadcrumb">
        <span>Home</span>
        <span>/</span>
        <span>Prototype</span>
        <span>/</span>
        <span>{name}</span>
      </div>

      <div className="gw-tabs" aria-label="Review tabs">
        <button className="gw-tab gw-tab-active focus-ring" type="button">
          Route
        </button>
        <button className="gw-tab focus-ring" type="button">
          Sources
        </button>
        <button className="gw-tab focus-ring" type="button">
          Compare
        </button>
      </div>

      <section className="gw-hero">
        <div className="gw-hero-copy">
          <p className="gw-kicker">Civic wayfinding x independent production</p>
          <h3>Know what to confirm before your event setup locks in.</h3>
          <p className="gw-hero-summary">{summary}</p>
          <div className="gw-hero-actions">
            <button className="gw-primary-button focus-ring" type="button">
              Build readiness route
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link className="gw-secondary-link focus-ring" href="#evidence">
              View source trail
            </Link>
          </div>
        </div>

        <div className="gw-hero-panel">
          <div className="gw-hero-panel-top">
            <div>
              <p className="gw-panel-label">Live sample</p>
              <h4>Roosevelt Row Night Market</h4>
            </div>
            <div className="gw-status-pill">
              <CheckCircle2 className="h-4 w-4" />
              Review in progress
            </div>
          </div>

          <div className="gw-fact-chip-row">
            {sampleFacts.map((fact) => (
              <div className="gw-fact-chip" key={fact}>
                <MapPinned className="h-3.5 w-3.5" />
                {fact}
              </div>
            ))}
          </div>

          <div className="gw-progress-strip" aria-label="Progress">
            {sampleSteps.map((step) => (
              <div className={`gw-progress-stop gw-progress-${step.state}`} key={step.label}>
                <span className="gw-progress-dot" />
                <span>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="gw-content-grid">
        <section className="gw-main-column">
          <div className="gw-intake-preview">
            <div className="gw-section-head">
              <h4>Fact intake</h4>
              <p>Standard form patterns, visualized with concept styling only.</p>
            </div>
            <div className="gw-form-grid">
              <label className="gw-field">
                <span>Event type</span>
                <select className="focus-ring" defaultValue="Outdoor market">
                  <option>Outdoor market</option>
                  <option>Food service setup</option>
                  <option>Community gathering</option>
                </select>
              </label>
              <label className="gw-field">
                <span>Venue type</span>
                <select className="focus-ring" defaultValue="Parking lot">
                  <option>Parking lot</option>
                  <option>Public plaza</option>
                  <option>Licensed venue</option>
                </select>
              </label>
              <label className="gw-field gw-field-wide">
                <span>Natural-language note</span>
                <textarea
                  className="focus-ring"
                  defaultValue="Outdoor market with food vendors, live sound, and temporary tents on a private parking lot."
                  rows={3}
                />
              </label>
            </div>
          </div>

          <article className="gw-requirement-card">
            <div className="gw-requirement-head">
              <div className="gw-status-marker">
                <span className="gw-status-shape" />
                <span>Check with source</span>
              </div>
              <div className="gw-route-pill">
                <Route className="h-4 w-4" />
                Route stop 02
              </div>
            </div>
            <h4>Phoenix outdoor event review may apply to this setup.</h4>
            <p>
              This route stop appears because the event uses a parking lot,
              expects public attendance, and includes temporary event activity.
            </p>
            <div className="gw-requirement-meta">
              <div className="gw-mini-chip">Driven by venue type</div>
              <div className="gw-mini-chip">Driven by public attendance</div>
              <div className="gw-mini-chip">City-specific</div>
            </div>
          </article>

          <article className="gw-error-card" aria-live="polite">
            <div className="gw-error-head">
              <CircleAlert className="h-5 w-5" />
              <strong>Missing fact may change this route</strong>
            </div>
            <p>
              Property owner approval is still unknown. That answer may change
              which local review path applies.
            </p>
          </article>
        </section>

        <aside className="gw-side-column" id="evidence">
          <article className="gw-evidence-card">
            <div className="gw-evidence-tab">
              <FileText className="h-4 w-4" />
              Evidence tab
            </div>
            <h4>Official source</h4>
            <p>
              Phoenix event review guidance with planning notes, source anchor,
              and last-check context.
            </p>
            <div className="gw-evidence-meta">
              <span>Official source</span>
              <span>Last checked 2026-06-23</span>
            </div>
            <Link className="gw-source-link focus-ring" href="#route-ledger">
              Open source record
            </Link>
          </article>

          <article className="gw-mobile-frame" aria-label="Mobile preview">
            <div className="gw-mobile-topbar">
              <Ticket className="h-4 w-4" />
              <span>Mobile view</span>
            </div>
            <div className="gw-mobile-card">
              <div className="gw-mobile-status">
                <span className="gw-status-shape" />
                Route stop 02 active
              </div>
              <h5>Phoenix review may apply</h5>
              <p>Parking lot + public event details triggered this stop.</p>
              <div className="gw-mobile-facts">
                <span>Phoenix</span>
                <span>250 people</span>
                <span>3 food vendors</span>
              </div>
              <button className="gw-primary-button focus-ring" type="button">
                Review source
              </button>
            </div>
          </article>

          <article className="gw-dialog-note">
            <div className="gw-section-head">
              <h4>Dialog behavior anchor</h4>
              <p>
                Future dialogs should use standard modal behavior and trap
                focus, even when visual styling changes.
              </p>
            </div>
            <button className="gw-ghost-button focus-ring" type="button">
              Preview modal pattern
              <Search className="h-4 w-4" />
            </button>
          </article>
        </aside>
      </div>
    </div>
  );
}
