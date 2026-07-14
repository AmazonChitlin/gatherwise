"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Pencil,
  RotateCcw,
  ScanText,
} from "lucide-react";
import { CivicStatus } from "@/components/civic";
import { IntakeForm } from "@/components/intake-form";
import type { EventExtractionResult } from "@/lib/ai/extraction";
import {
  buildMissingQuestions,
  buildReviewFacts,
  countReviewStatuses,
  fieldOptions,
  groupReviewFacts,
  reviewFactsToIntakeValues,
  type MissingQuestion,
  type ReviewFact,
} from "@/lib/intake-review";
import type { EventFactFieldKey } from "@/lib/event-facts";
import { ExtractionRequestGuard } from "@/lib/extraction-request-guard";
import type { IntakeInput } from "@/lib/schemas";

type IntakeExperienceProps = {
  initialPath: "describe" | "guided";
  prefilledValues?: IntakeInput;
  demoTitle?: string;
};

type DescribePhase = "describe" | "review" | "guided";

type ExtractionResponse = EventExtractionResult & {
  message?: string;
};

export function IntakeExperience({
  initialPath,
  prefilledValues,
  demoTitle,
}: IntakeExperienceProps) {
  const [selectedPath, setSelectedPath] = useState<"describe" | "guided">(
    initialPath,
  );
  const [phase, setPhase] = useState<DescribePhase>(
    initialPath === "guided" ? "guided" : "describe",
  );
  const [description, setDescription] = useState("");
  const [describeError, setDescribeError] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [reviewFacts, setReviewFacts] = useState<ReviewFact[]>([]);
  const [ambiguities, setAmbiguities] = useState<
    EventExtractionResult["ambiguities"]
  >([]);
  const [editingKey, setEditingKey] = useState<EventFactFieldKey | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [guidedValuesVersion, setGuidedValuesVersion] = useState(0);
  const requestGuardRef = useRef(new ExtractionRequestGuard());

  useEffect(
    () => () => {
      requestGuardRef.current.invalidate();
    },
    [],
  );

  const counts = useMemo(() => countReviewStatuses(reviewFacts), [reviewFacts]);
  const groupedFacts = useMemo(
    () => groupReviewFacts(reviewFacts),
    [reviewFacts],
  );
  const missingQuestions = useMemo(
    () => buildMissingQuestions(reviewFacts),
    [reviewFacts],
  );
  const highlightedUnknownKeys = useMemo(
    () => new Set(missingQuestions.map((question) => question.key)),
    [missingQuestions],
  );
  const guidedValues = useMemo(
    () =>
      reviewFacts.length > 0
        ? reviewFactsToIntakeValues(reviewFacts)
        : (prefilledValues ?? undefined),
    [prefilledValues, reviewFacts, guidedValuesVersion],
  );

  async function runExtraction() {
    if (description.trim().length < 20) {
      setDescribeError(
        "Add a few sentences so Gatherwise has enough event detail to review.",
      );
      return;
    }

    const request = requestGuardRef.current.start();
    setIsExtracting(true);
    setDescribeError("");

    try {
      const response = await fetch("/api/intake/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
        signal: request.controller.signal,
      });
      const payload = (await response.json()) as Partial<ExtractionResponse>;

      if (!requestGuardRef.current.isCurrent(request)) {
        return;
      }

      if (!response.ok || !payload.facts || !payload.ambiguities) {
        setDescribeError(
          payload.message ??
            "We could not review that description right now. Use the guided form instead.",
        );
        return;
      }

      const nextReviewFacts = buildReviewFacts(
        payload as EventExtractionResult,
      );
      setReviewFacts(nextReviewFacts);
      setAmbiguities(payload.ambiguities);
      setPhase("review");
    } catch (error) {
      if (!requestGuardRef.current.isCurrent(request)) {
        return;
      }

      setDescribeError(
        "We could not reach the description review service. Use the guided form instead.",
      );
    } finally {
      if (requestGuardRef.current.finish(request)) {
        setIsExtracting(false);
      }
    }
  }

  function cancelExtraction() {
    requestGuardRef.current.invalidate();
    setIsExtracting(false);
    setDescribeError(
      "Description review was canceled. You can retry or use the guided form.",
    );
  }

  function retryDescription() {
    requestGuardRef.current.invalidate();
    setIsExtracting(false);
    setDescribeError("");
    setPhase("describe");
  }

  function openGuidedForm() {
    requestGuardRef.current.invalidate();
    setIsExtracting(false);
    setDescribeError("");
    setGuidedValuesVersion((current) => current + 1);
    setSelectedPath("guided");
    setPhase("guided");
  }

  function updateFact(
    key: EventFactFieldKey,
    value: string | number | boolean | null,
    reviewStatus: ReviewFact["reviewStatus"],
  ) {
    setReviewFacts((current) =>
      current.map((fact) =>
        fact.key === key
          ? {
              ...fact,
              value: normalizeEditorValue(fact.valueType, value),
              reviewStatus,
            }
          : fact,
      ),
    );
    setEditingKey(null);
  }

  const extractedCount = reviewFacts.filter((fact) => fact.extracted).length;

  return (
    <div className="civic-intake-experience">
      <IntakeRoute phase={phase} />

      <section
        aria-labelledby="intake-path-title"
        className="civic-intake-paths"
      >
        <div className="civic-intake-section-heading">
          <p className="civic-data-label-shared">Choose your starting mode</p>
          <h2 id="intake-path-title">How would you like to begin?</h2>
        </div>
        <div
          aria-label="Intake path"
          className="civic-intake-paths__choices"
          role="group"
        >
          <PathChoice
            active={selectedPath === "describe"}
            badge="Recommended"
            body="Paste a short event description, review what Gatherwise extracted, and then continue with structured details."
            cta="Describe my event"
            onClick={() => {
              requestGuardRef.current.invalidate();
              setIsExtracting(false);
              setSelectedPath("describe");
              setPhase(
                phase === "guided" && reviewFacts.length > 0
                  ? "review"
                  : "describe",
              );
            }}
            primary
            title="Describe my event"
          />
          <PathChoice
            active={selectedPath === "guided"}
            body="Answer step-by-step questions yourself when you want full manual control from the start."
            cta="Use the guided form"
            onClick={openGuidedForm}
            title="Use the guided form"
          />
        </div>
      </section>

      {demoTitle ? (
        <aside className="civic-intake-demo-notice">
          <span>Fictional demo scenario</span>
          <p>
            You are exploring <strong>{demoTitle}</strong>. This fictional
            sample starts without login and does not create a permanent record
            unless you deliberately submit the form.
          </p>
        </aside>
      ) : null}

      {selectedPath === "describe" && phase === "describe" ? (
        <section
          aria-labelledby="describe-workspace-title"
          className="civic-describe-workspace"
        >
          <header className="civic-describe-workspace__header">
            <div>
              <p className="civic-data-label-shared">Describe · Step 01</p>
              <h2 id="describe-workspace-title">
                Describe your event in plain language.
              </h2>
            </div>
            <CivicStatus tone="ai">Fact extraction only</CivicStatus>
          </header>
          <div className="civic-describe-workspace__field">
            <label htmlFor="event-description">Event description</label>
            <p id="event-description-example">
              Example: &quot;We are planning a one-day punk show in Phoenix with
              10 bands, food vendors, a beer garden, and a temporary stage in a
              parking lot.&quot;
            </p>
            <textarea
              aria-describedby={`event-description-example event-description-privacy event-description-count${describeError ? " event-description-error" : ""}`}
              className="civic-intake-textarea focus-ring"
              id="event-description"
              maxLength={4000}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the event setup, where it happens, what people will do there, and any food, alcohol, sound, traffic, or structure details you already know."
              value={description}
            />
          </div>
          <div className="civic-describe-workspace__meta">
            <p id="event-description-privacy">
              Privacy note: do not include names, phone numbers, or personal
              contact details.
            </p>
            <span id="event-description-count">
              {description.length} / 4000
            </span>
          </div>
          {describeError ? (
            <div
              className="civic-intake-inline-error"
              id="event-description-error"
              role="alert"
            >
              {describeError}
            </div>
          ) : null}
          <div className="civic-describe-workspace__actions">
            <button
              className="civic-button civic-button--signal focus-ring"
              disabled={isExtracting}
              onClick={runExtraction}
              type="button"
            >
              {isExtracting ? (
                <span
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/45 border-t-white"
                />
              ) : (
                <ScanText aria-hidden="true" />
              )}
              {isExtracting
                ? "Reviewing your description..."
                : "Review my description"}
            </button>
            <button
              className="civic-intake-action civic-intake-action--quiet focus-ring"
              disabled={!isExtracting}
              onClick={cancelExtraction}
              type="button"
            >
              Cancel
            </button>
            <button
              className="civic-intake-action civic-intake-action--quiet focus-ring"
              disabled={isExtracting || !describeError}
              onClick={runExtraction}
              type="button"
            >
              Retry
            </button>
            <button
              className="civic-intake-action civic-intake-action--manual focus-ring"
              onClick={openGuidedForm}
              type="button"
            >
              Use the guided form
            </button>
          </div>
          <p
            aria-live="polite"
            className="civic-intake-live-status"
            role="status"
          >
            {isExtracting
              ? "Gatherwise is extracting structured event facts. You can cancel and switch to the guided form at any time."
              : "The description path only extracts facts. It does not decide permits or legal requirements."}
          </p>
        </section>
      ) : null}

      {selectedPath === "describe" && phase === "review" ? (
        <div className="civic-review-workspace">
          <section
            aria-labelledby="review-workspace-title"
            className="civic-review-summary"
          >
            <p className="civic-data-label-shared">Review · Step 02</p>
            <h2 id="review-workspace-title">
              Review extracted event facts before evaluation.
            </h2>
            <p className="civic-review-summary__intro">
              Confirm what looks right, edit anything unclear, and leave unknown
              items unknown. Gatherwise will only use reviewed details when you
              continue.
            </p>
            <div className="civic-review-counts">
              <StatusMetric
                label="Extracted facts"
                tone="ai"
                value={extractedCount}
              />
              <StatusMetric
                label="Needs review"
                tone="caution"
                value={counts.needs_review}
              />
              <StatusMetric
                label="Confirmed facts"
                tone="verified"
                value={counts.confirmed}
              />
              <StatusMetric
                label="Unknown facts"
                tone="unknown"
                value={counts.unknown}
              />
            </div>
            {ambiguities.length > 0 ? (
              <aside className="civic-review-ambiguities">
                <h3>A few details look ambiguous.</h3>
                <ul>
                  {ambiguities.map((ambiguity, index) => (
                    <li key={`${ambiguity.fieldKey ?? "general"}-${index}`}>
                      {ambiguity.reason}
                    </li>
                  ))}
                </ul>
              </aside>
            ) : null}
          </section>

          {missingQuestions.length > 0 ? (
            <section
              aria-labelledby="missing-details-title"
              className="civic-route-forks"
            >
              <div className="civic-intake-section-heading">
                <p className="civic-data-label-shared">
                  Highest-value missing details
                </p>
                <h3 id="missing-details-title">
                  Answer up to three questions that may change the route.
                </h3>
              </div>
              <div className="civic-route-forks__list">
                {missingQuestions.map((question, index) => (
                  <QuestionFork
                    key={question.key}
                    marker={String(index + 1).padStart(2, "0")}
                    fact={reviewFacts.find(
                      (fact) => fact.key === question.key,
                    )!}
                    question={question}
                    onAnswer={(value, reviewStatus) =>
                      updateFact(question.key, value, reviewStatus)
                    }
                  />
                ))}
              </div>
            </section>
          ) : null}

          <div className="civic-review-groups">
            {[...groupedFacts.entries()].map(([group, facts]) => (
              <details
                className="civic-fact-group"
                key={group}
                open={group === "event-basics"}
              >
                <summary>
                  <div>
                    <h3>{groupLabel(group)}</h3>
                    <p>
                      {facts.filter((fact) => fact.extracted).length} extracted
                      facts,{" "}
                      {
                        facts.filter((fact) => fact.reviewStatus === "unknown")
                          .length
                      }{" "}
                      unknown
                    </p>
                  </div>
                  <ChevronDown aria-hidden="true" />
                </summary>
                <div className="civic-fact-group__facts">
                  {facts
                    .filter(
                      (fact) =>
                        fact.extracted || highlightedUnknownKeys.has(fact.key),
                    )
                    .map((fact) => (
                      <FactRow
                        editValue={editValue}
                        editing={editingKey === fact.key}
                        fact={fact}
                        key={fact.key}
                        onBeginEdit={() => {
                          setEditingKey(fact.key);
                          setEditValue(
                            fact.value === null ? "" : String(fact.value),
                          );
                        }}
                        onCancelEdit={() => setEditingKey(null)}
                        onChangeEditValue={setEditValue}
                        onConfirm={() =>
                          updateFact(fact.key, fact.value, "confirmed")
                        }
                        onMarkUnknown={() =>
                          updateFact(fact.key, null, "unknown")
                        }
                        onSaveEdit={() =>
                          updateFact(
                            fact.key,
                            editValue === "" ? null : editValue,
                            "confirmed",
                          )
                        }
                      />
                    ))}
                </div>
              </details>
            ))}
          </div>

          <div className="civic-review-actions">
            <button
              className="civic-button civic-button--signal focus-ring"
              onClick={openGuidedForm}
              type="button"
            >
              Continue with reviewed details
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              className="civic-intake-action civic-intake-action--quiet focus-ring"
              onClick={retryDescription}
              type="button"
            >
              Retry description
            </button>
          </div>
          <p className="civic-intake-live-status">
            You can keep this partially reviewed and move into the guided form
            without losing your work.
          </p>
        </div>
      ) : null}

      {selectedPath === "guided" || phase === "guided" ? (
        <section
          aria-labelledby="guided-workspace-title"
          className="civic-guided-workspace"
        >
          <header className="civic-guided-workspace__header">
            <p className="civic-data-label-shared">
              Complete details · Step 03
            </p>
            <h2 id="guided-workspace-title">
              Build the event record in a clear planning sequence.
            </h2>
          </header>
          {reviewFacts.length > 0 ? (
            <div className="civic-guided-workspace__carryover">
              Gatherwise carried your reviewed description details into the
              guided form. Change anything you need before building the
              readiness summary.
            </div>
          ) : null}
          <IntakeForm
            initialValues={guidedValues}
            reviewFacts={reviewFacts.length > 0 ? reviewFacts : undefined}
            introText={
              reviewFacts.length > 0
                ? "Start with the reviewed details Gatherwise found, then fill any gaps you still know. Unknown details can stay unanswered until they matter."
                : prefilledValues
                  ? "This fictional sample is prefilled so you can test the guided path without AI. Change anything you want, or reset by choosing another demo."
                  : undefined
            }
          />
        </section>
      ) : null}
    </div>
  );
}

function IntakeRoute({ phase }: { phase: DescribePhase }) {
  const activeStep = phase === "describe" ? 1 : phase === "review" ? 2 : 3;
  const steps = ["Describe", "Review", "Complete details", "Results"];

  return (
    <nav aria-label="Event planning progress" className="civic-intake-route">
      <ol>
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const state =
            stepNumber < activeStep
              ? "complete"
              : stepNumber === activeStep
                ? "active"
                : "upcoming";

          return (
            <li
              className={`civic-intake-route__step civic-intake-route__step--${state}`}
              key={step}
            >
              <span aria-hidden="true" className="civic-intake-route__marker">
                {stepNumber < activeStep ? (
                  <Check />
                ) : (
                  String(stepNumber).padStart(2, "0")
                )}
              </span>
              <span
                aria-current={stepNumber === activeStep ? "step" : undefined}
              >
                {step}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function PathChoice({
  active,
  badge,
  body,
  cta,
  onClick,
  primary = false,
  title,
}: {
  active: boolean;
  badge?: string;
  body: string;
  cta: string;
  onClick: () => void;
  primary?: boolean;
  title: string;
}) {
  return (
    <button
      aria-pressed={active}
      className={`civic-intake-path focus-ring ${active ? "civic-intake-path--active" : ""}`}
      onClick={onClick}
      type="button"
    >
      <span className="civic-intake-path__number" aria-hidden="true">
        {primary ? "01" : "02"}
      </span>
      <span className="civic-intake-path__copy">
        <span className="civic-intake-path__title">{title}</span>
        <span className="civic-intake-path__body">{body}</span>
      </span>
      <span className="civic-intake-path__state">
        {active ? "Selected" : (badge ?? "Choose mode")}
      </span>
      <span className="civic-intake-path__cta">{cta}</span>
    </button>
  );
}

function StatusMetric({
  label,
  tone,
  value,
}: {
  label: string;
  tone: "verified" | "caution" | "unknown" | "ai";
  value: number;
}) {
  return (
    <div className="civic-review-metric">
      <CivicStatus tone={tone}>{label}</CivicStatus>
      <strong>{value}</strong>
    </div>
  );
}

function QuestionFork({
  fact,
  marker,
  question,
  onAnswer,
}: {
  fact: ReviewFact;
  marker: string;
  question: MissingQuestion;
  onAnswer: (
    value: string | boolean | null,
    reviewStatus: ReviewFact["reviewStatus"],
  ) => void;
}) {
  const options = fieldOptions(question.key);
  const booleanField = fact.valueType === "boolean";

  return (
    <article className="civic-question-fork">
      <span className="civic-question-fork__marker" aria-hidden="true">
        {marker}
      </span>
      <div className="civic-question-fork__content">
        <h4>{question.label}</h4>
        <p>{question.reason}</p>
        {booleanField ? (
          <div className="civic-question-fork__answers">
            <AnswerButton
              label="Yes"
              onClick={() => onAnswer(true, "confirmed")}
            />
            <AnswerButton
              label="No"
              onClick={() => onAnswer(false, "confirmed")}
            />
            <AnswerButton
              label="I don't know"
              onClick={() => onAnswer(null, "unknown")}
            />
          </div>
        ) : options ? (
          <div className="civic-question-fork__answers">
            <select
              className="civic-intake-control focus-ring"
              defaultValue=""
              onChange={(event) =>
                onAnswer(
                  event.target.value || null,
                  event.target.value ? "confirmed" : "unknown",
                )
              }
            >
              <option value="">I don't know yet</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="civic-question-fork__answers">
            <input
              className="civic-intake-control focus-ring"
              onBlur={(event) =>
                onAnswer(
                  event.target.value.trim() || null,
                  event.target.value.trim() ? "confirmed" : "unknown",
                )
              }
              placeholder={`Add ${question.label.toLowerCase()}`}
            />
          </div>
        )}
      </div>
    </article>
  );
}

function FactRow({
  editValue,
  editing,
  fact,
  onBeginEdit,
  onCancelEdit,
  onChangeEditValue,
  onConfirm,
  onMarkUnknown,
  onSaveEdit,
}: {
  editValue: string;
  editing: boolean;
  fact: ReviewFact;
  onBeginEdit: () => void;
  onCancelEdit: () => void;
  onChangeEditValue: (value: string) => void;
  onConfirm: () => void;
  onMarkUnknown: () => void;
  onSaveEdit: () => void;
}) {
  const options = fieldOptions(fact.key);
  const statusTone =
    fact.reviewStatus === "confirmed"
      ? "verified"
      : fact.reviewStatus === "needs_review"
        ? "caution"
        : "unknown";
  const statusLabel =
    fact.reviewStatus === "confirmed"
      ? "Confirmed"
      : fact.reviewStatus === "needs_review"
        ? fact.extracted
          ? "Extracted · needs review"
          : "Needs review"
        : "Unknown";

  return (
    <article className="civic-fact-row">
      <div className="civic-fact-row__main">
        <div className="civic-fact-row__copy">
          <div className="civic-fact-row__heading">
            <h4>{fact.label}</h4>
            <CivicStatus tone={statusTone}>{statusLabel}</CivicStatus>
          </div>
          <p className="civic-fact-row__value">
            {fact.value === null
              ? "No confirmed value yet."
              : formatFactValue(fact)}
          </p>
          {fact.evidenceText ? (
            <blockquote className="civic-fact-row__evidence">
              <span>Source text</span>“{fact.evidenceText}”
            </blockquote>
          ) : null}
        </div>
        {!editing ? (
          <div className="civic-fact-row__actions">
            {fact.reviewStatus === "needs_review" ? (
              <button
                className="civic-intake-action civic-intake-action--confirm focus-ring"
                onClick={onConfirm}
                type="button"
              >
                <Check aria-hidden="true" />
                Confirm
              </button>
            ) : null}
            <button
              className="civic-intake-action civic-intake-action--quiet focus-ring"
              onClick={onBeginEdit}
              type="button"
            >
              <Pencil aria-hidden="true" />
              Edit
            </button>
            <button
              className="civic-intake-action civic-intake-action--quiet focus-ring"
              onClick={onMarkUnknown}
              type="button"
            >
              <RotateCcw aria-hidden="true" />I don't know
            </button>
          </div>
        ) : null}
      </div>
      {editing ? (
        <div className="civic-fact-row__editor">
          {fact.valueType === "boolean" ? (
            <div className="civic-question-fork__answers">
              <AnswerButton
                label="Yes"
                onClick={() => onChangeEditValue("true")}
              />
              <AnswerButton
                label="No"
                onClick={() => onChangeEditValue("false")}
              />
            </div>
          ) : options ? (
            <select
              className="civic-intake-control focus-ring"
              onChange={(event) => onChangeEditValue(event.target.value)}
              value={editValue}
            >
              <option value="">Choose one</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="civic-intake-control focus-ring"
              onChange={(event) => onChangeEditValue(event.target.value)}
              type={
                fact.valueType === "number"
                  ? "number"
                  : fact.valueType === "date"
                    ? "date"
                    : "text"
              }
              value={editValue}
            />
          )}
          <div className="civic-fact-row__editor-actions">
            <button
              className="civic-intake-action civic-intake-action--primary focus-ring"
              onClick={onSaveEdit}
              type="button"
            >
              Save change
            </button>
            <button
              className="civic-intake-action civic-intake-action--quiet focus-ring"
              onClick={onCancelEdit}
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function AnswerButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="civic-intake-action civic-intake-action--answer focus-ring"
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function groupLabel(group: string) {
  const labels: Record<string, string> = {
    "event-basics": "Event basics",
    "place-and-access": "Place and access",
    "attendance-and-operations": "Attendance and operations",
    "food-and-sales": "Food and sales",
    "structures-and-equipment": "Structures and equipment",
    "sound-and-alcohol": "Sound and alcohol",
  };

  return labels[group] ?? group;
}

function formatFactValue(fact: ReviewFact) {
  if (typeof fact.value === "boolean") {
    return fact.value ? "Yes" : "No";
  }

  return String(fact.value);
}

function normalizeEditorValue(
  valueType: ReviewFact["valueType"],
  value: string | number | boolean | null,
) {
  if (value === null) {
    return null;
  }

  if (valueType === "boolean") {
    return value === true || value === "true";
  }

  if (valueType === "number") {
    return Number(value);
  }

  return value;
}
