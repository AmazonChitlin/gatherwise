import type { Metadata } from "next";
import { Bot, Landmark, ShieldCheck, UserRoundCheck } from "lucide-react";
import { CivicButtonLink, CivicStatus } from "@/components/civic";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Follow the Gatherwise route from event description and human review to deterministic evaluation and official evidence.",
  alternates: { canonical: "/how-it-works" },
};

const steps = [
  [
    "01",
    "Describe",
    "Use plain language or the guided form. The server-only extraction provider can map a description to known event fields without choosing requirements.",
  ],
  [
    "02",
    "Review",
    "Confirm, edit, or leave each fact unknown. Extracted facts cannot drive evaluation until the review state allows it.",
  ],
  [
    "03",
    "Evaluate",
    "The deterministic rule engine compares confirmed facts with versioned Arizona rule records and captures the evaluation trace.",
  ],
  [
    "04",
    "Verify",
    "Read why a result appeared, open its official source, and check current agency instructions before relying on it.",
  ],
] as const;

export default function HowItWorksPage() {
  return (
    <main className="civic-process-page">
      <section className="civic-process-hero" aria-labelledby="process-title">
        <div className="civic-public-wrap civic-process-hero__inner">
          <div>
            <p className="civic-data-label-shared">
              How it works · Arizona pilot
            </p>
            <h1 id="process-title">
              Four turns from event idea to official evidence.
            </h1>
          </div>
          <p>
            Gatherwise reduces research ambiguity without hiding uncertainty or
            replacing the official source.
          </p>
        </div>
      </section>

      <section
        className="civic-process-route"
        aria-label="Gatherwise readiness process"
      >
        <div className="civic-public-wrap">
          <ol>
            {steps.map(([number, title, text]) => (
              <li key={number}>
                <span aria-hidden="true">{number}</span>
                <div>
                  <h2>{title}</h2>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        className="civic-process-boundary"
        aria-labelledby="boundary-title"
      >
        <div className="civic-public-wrap">
          <header className="civic-public-heading civic-public-heading--light">
            <p className="civic-data-label-shared">Authority boundary</p>
            <h2 id="boundary-title">
              The model drafts language. The rule engine owns the result.
            </h2>
          </header>
          <div className="civic-process-diagram">
            <ProcessNode
              icon={Bot}
              label="AI extraction"
              detail="Known fields only"
            />
            <ProcessNode
              icon={UserRoundCheck}
              label="Human confirmation"
              detail="Confirmed or unknown"
            />
            <ProcessNode
              icon={ShieldCheck}
              label="Deterministic rules"
              detail="Requirements and sources"
              emphasis
            />
            <ProcessNode
              icon={Landmark}
              label="Official evidence"
              detail="Reviewed source records"
            />
          </div>
          <div className="civic-process-rules">
            <div>
              <strong>AI may</strong>
              <p>
                Extract facts, identify ambiguity, organize evidence, and
                explain a verified result.
              </p>
            </div>
            <div>
              <strong>AI may not</strong>
              <p>
                Add requirements, agencies, thresholds, deadlines, fees, forms,
                URLs, or approval claims.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="civic-process-outcome"
        aria-labelledby="outcome-title"
      >
        <div className="civic-public-wrap civic-process-outcome__inner">
          <div>
            <CivicStatus tone="caution">Informational guidance</CivicStatus>
            <h2 id="outcome-title">
              The result is a planning route, not permission to proceed.
            </h2>
            <p>
              Sources change. Unknown details can change the result. Unsupported
              jurisdictions are refused, and human verification is recommended.
            </p>
          </div>
          <CivicButtonLink href="/intake?path=describe">
            Describe an event
          </CivicButtonLink>
        </div>
      </section>
    </main>
  );
}

function ProcessNode({
  icon: Icon,
  label,
  detail,
  emphasis = false,
}: {
  icon: typeof Bot;
  label: string;
  detail: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`civic-process-node${emphasis ? " civic-process-node--authority" : ""}`}
    >
      <Icon aria-hidden="true" />
      <div>
        <strong>{label}</strong>
        <span>{detail}</span>
      </div>
    </div>
  );
}
