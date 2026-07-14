import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Check,
  ExternalLink,
  GitBranch,
  Landmark,
  Route,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import { CivicButtonLink, CivicStatus } from "@/components/civic";
import { getDemoResultsHref, getDemoScenario } from "@/lib/demo-scenarios";

export const metadata: Metadata = {
  title: "Showcase",
  description:
    "Gatherwise product case study: source-grounded event readiness, deterministic rules, human review, and an Arizona pilot.",
  openGraph: {
    title: "Gatherwise: Source-Grounded AI Event Readiness",
    description:
      "See the product approach, authority boundary, technical architecture, evaluation method, and public Gatherwise demos.",
  },
};

const problemPoints = [
  "A single event can cross city, county, state, venue, food, tax, fire, and public-space guidance.",
  "The answer changes with details organizers may not know are important yet.",
  "Copied checklists lose their source trail and become hard to trust when instructions change.",
];

const approach = [
  [
    "01",
    "Plain-language extraction",
    "A server-only AI provider maps an event description to known fact fields. Unclear facts remain unknown.",
  ],
  [
    "02",
    "Human confirmation",
    "The organizer reviews extracted facts before any requirement evaluation. Confirmed false stays distinct from unknown.",
  ],
  [
    "03",
    "Deterministic evaluation",
    "Versioned rule records remain the authority for possible requirements, agencies, lead times, and source selection.",
  ],
  [
    "04",
    "Official evidence trail",
    "Each result connects relevant facts to a rule ID and reviewed source record. Grounded explanation is secondary.",
  ],
  [
    "05",
    "Refusal at the boundary",
    "Unsupported geography stops the route rather than receiving inferred or adjacent-jurisdiction guidance.",
  ],
] as const;

const stack = [
  "Next.js 16 App Router and React 19",
  "TypeScript strict mode and Zod boundaries",
  "Prisma 6 with the approved SQLite architecture",
  "Server-only OpenAI Responses API providers",
  "Versioned deterministic rule and source records",
  "Node test runner and a 36-scenario offline evaluation harness",
];

const contributions = [
  "Identified the event-readiness problem and researched official Arizona sources.",
  "Designed the product, Civic Signal visual system, intake review, Readiness Route, Evidence Trail, and simulator.",
  "Developed the rule architecture and explicit boundary between AI assistance and deterministic authority.",
  "Built and tested the application with AI-assisted development while retaining product and evidence ownership.",
  "Created the evaluation dataset, grounding checks, reliability fallbacks, and public recruiter story.",
];

const demos = [
  "private-property-punk-show",
  "food-truck-local-art-market",
  "unsupported-jurisdiction",
]
  .map((slug) => getDemoScenario(slug))
  .filter((demo): demo is NonNullable<typeof demo> => Boolean(demo));

export default function ShowcasePage() {
  return (
    <main className="civic-case-study">
      <section className="civic-case-hero" aria-labelledby="showcase-title">
        <div className="civic-public-wrap civic-case-hero__inner">
          <div className="civic-case-hero__copy">
            <p className="civic-data-label-shared">
              Product case study · Arizona pilot
            </p>
            <h1 id="showcase-title">
              Gatherwise turns event uncertainty into a source trail.
            </h1>
            <p>
              A source-grounded readiness tool for organizers, vendors, and
              venues. AI structures the event. People confirm the facts.
              Deterministic rules select possible requirements and evidence.
            </p>
            <div className="civic-case-hero__actions">
              <CivicButtonLink href="/intake?path=describe">
                Try the readiness demo <ArrowRight aria-hidden="true" />
              </CivicButtonLink>
              <Link
                className="civic-text-link civic-text-link--light focus-ring"
                href="#architecture"
              >
                See the architecture
              </Link>
            </div>
          </div>

          <CaseInterface />
        </div>
      </section>

      <section className="civic-case-problem" aria-labelledby="problem-title">
        <div className="civic-public-wrap civic-case-problem__inner">
          <header>
            <p className="civic-data-label-shared">The problem</p>
            <h2 id="problem-title">
              Readiness information is fragmented before planning even starts.
            </h2>
          </header>
          <ol>
            {problemPoints.map((point, index) => (
              <li key={point}>
                <span>0{index + 1}</span>
                <p>{point}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="civic-case-users" aria-labelledby="users-title">
        <div className="civic-public-wrap civic-case-users__inner">
          <div>
            <p className="civic-data-label-shared">Who it helps</p>
            <h2 id="users-title">
              People planning across an unfamiliar local system.
            </h2>
          </div>
          <dl>
            <div>
              <dt>Organizer</dt>
              <dd>Needs a useful first route without municipal terminology.</dd>
            </div>
            <div>
              <dt>Vendor</dt>
              <dd>
                Needs to understand which event details affect their own next
                steps.
              </dd>
            </div>
            <div>
              <dt>Venue</dt>
              <dd>
                Needs facts, rule rationale, and official evidence kept visibly
                separate.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="civic-case-approach" aria-labelledby="approach-title">
        <div className="civic-public-wrap">
          <header className="civic-public-heading">
            <p className="civic-data-label-shared">Product approach</p>
            <h2 id="approach-title">
              One authority chain, five deliberate stages.
            </h2>
          </header>
          <ol className="civic-case-route">
            {approach.map(([number, title, body]) => (
              <li key={number}>
                <span aria-hidden="true">{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        className="civic-case-architecture"
        id="architecture"
        aria-labelledby="architecture-title"
      >
        <div className="civic-public-wrap">
          <header className="civic-public-heading civic-public-heading--light">
            <p className="civic-data-label-shared">Hybrid architecture</p>
            <h2 id="architecture-title">AI assists. Verified logic decides.</h2>
            <p>
              AI never selects requirements, agencies, fees, thresholds,
              deadlines, forms, or URLs.
            </p>
          </header>
          <div
            className="civic-architecture-diagram"
            role="img"
            aria-label="Event text moves through AI extraction, human confirmation, deterministic rules, and official evidence"
          >
            <ArchitectureNode
              icon={Bot}
              label="AI extraction"
              meta="Draft facts"
              tone="ai"
            />
            <ArchitectureNode
              icon={UserRoundCheck}
              label="Human review"
              meta="Confirmed facts"
              tone="human"
            />
            <ArchitectureNode
              icon={ShieldCheck}
              label="Rule engine"
              meta="Deterministic authority"
              tone="rule"
            />
            <ArchitectureNode
              icon={Landmark}
              label="Official evidence"
              meta="Trusted records"
              tone="source"
            />
          </div>
          <aside className="civic-case-refusal">
            <CivicStatus tone="critical">Unsupported geography</CivicStatus>
            <p>
              The route stops before evaluation. Gatherwise does not borrow
              rules from the nearest supported city.
            </p>
          </aside>
        </div>
      </section>

      <section
        className="civic-case-evaluation"
        aria-labelledby="evaluation-title"
      >
        <div className="civic-public-wrap civic-case-evaluation__grid">
          <header>
            <p className="civic-data-label-shared">Evaluation methodology</p>
            <h2 id="evaluation-title">Evidence before performance claims.</h2>
            <p>
              The offline harness runs 36 synthetic scenarios across supported
              jurisdictions, boundaries, missing facts, contradictions, prompt
              injection, grounding, and failure fallbacks. Usability findings
              remain separate until participant sessions occur.
            </p>
          </header>
          <dl>
            <div>
              <dt>36</dt>
              <dd>Synthetic evaluation scenarios</dd>
            </div>
            <div>
              <dt>Offline</dt>
              <dd>Default evaluation incurs no API cost</dd>
            </div>
            <div>
              <dt>Explicit</dt>
              <dd>Failures and limitations remain in the report</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="civic-case-proof" aria-labelledby="technical-title">
        <div className="civic-public-wrap civic-case-proof__grid">
          <div>
            <p className="civic-data-label-shared">Technical stack</p>
            <h2 id="technical-title">
              Built as a traceable system, not a generated answer box.
            </h2>
            <ul>
              {stack.map((item) => (
                <li key={item}>
                  <GitBranch aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="civic-case-contribution">
            <p className="civic-data-label-shared">Builder contribution</p>
            <h2>What Paul personally implemented</h2>
            <ul>
              {contributions.map((item) => (
                <li key={item}>
                  <Check aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <a
              className="civic-source-link focus-ring"
              href="https://github.com/AmazonChitlin/gatherwise"
              rel="noreferrer"
              target="_blank"
            >
              View the public repository <ExternalLink aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="civic-case-demos" aria-labelledby="demos-title">
        <div className="civic-public-wrap">
          <header className="civic-public-heading">
            <p className="civic-data-label-shared">
              Public demos · Fictional data
            </p>
            <h2 id="demos-title">Try three different readiness boundaries.</h2>
          </header>
          <div className="civic-case-demo-list">
            {demos.map((demo, index) => (
              <article key={demo.slug}>
                <span aria-hidden="true">0{index + 1}</span>
                <div>
                  <h3>{demo.title}</h3>
                  <p>{demo.summary}</p>
                </div>
                <Link
                  className="civic-results-action focus-ring"
                  href={getDemoResultsHref(demo)}
                >
                  Open fictional demo <ArrowRight aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="civic-case-limit" aria-labelledby="limitations-title">
        <div className="civic-public-wrap civic-case-limit__inner">
          <div>
            <p className="civic-data-label-shared">Limitations</p>
            <h2 id="limitations-title">A useful route is not an approval.</h2>
          </div>
          <ul>
            <li>Arizona pilot coverage only.</li>
            <li>Informational guidance, not a legal determination.</li>
            <li>Official sources can change after review.</li>
            <li>Human verification remains recommended.</li>
            <li>
              AI-disabled and failed-provider states use deterministic
              fallbacks.
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}

function CaseInterface() {
  return (
    <div
      className="civic-case-interface"
      aria-label="Gatherwise result example"
    >
      <div className="civic-case-interface__bar">
        <span>PHX / ROUTE 04</span>
        <span>FICTIONAL EVENT</span>
      </div>
      <div className="civic-case-interface__idea">
        <p>Event idea</p>
        <strong>Saturday punk show in a private Phoenix parking lot...</strong>
      </div>
      <div className="civic-case-interface__facts">
        <span>01</span>
        <div>
          <p>Reviewed facts</p>
          <strong>Phoenix · 300 people · amplified sound</strong>
        </div>
      </div>
      <div className="civic-case-interface__rule">
        <span>02</span>
        <div>
          <p>Deterministic result</p>
          <strong>Outdoor event review may apply</strong>
        </div>
      </div>
      <div className="civic-case-interface__source">
        <Route aria-hidden="true" />
        <div>
          <p>Official evidence</p>
          <strong>City of Phoenix source record</strong>
        </div>
      </div>
    </div>
  );
}

function ArchitectureNode({
  icon: Icon,
  label,
  meta,
  tone,
}: {
  icon: typeof Bot;
  label: string;
  meta: string;
  tone: string;
}) {
  return (
    <div className={`civic-architecture-node civic-architecture-node--${tone}`}>
      <Icon aria-hidden="true" />
      <div>
        <strong>{label}</strong>
        <span>{meta}</span>
      </div>
    </div>
  );
}
