"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowRight, Check, ChevronDown, Pencil, RotateCcw, Sparkles } from "lucide-react";
import { Badge, Card } from "@/components/ui";
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
  type ReviewFact
} from "@/lib/intake-review";
import type { EventFactFieldKey } from "@/lib/event-facts";

type IntakeExperienceProps = {
  initialPath: "describe" | "guided";
};

type DescribePhase = "describe" | "review" | "guided";

type ExtractionResponse = EventExtractionResult & {
  message?: string;
};

export function IntakeExperience({ initialPath }: IntakeExperienceProps) {
  const [selectedPath, setSelectedPath] = useState<"describe" | "guided">(initialPath);
  const [phase, setPhase] = useState<DescribePhase>(
    initialPath === "guided" ? "guided" : "describe"
  );
  const [description, setDescription] = useState("");
  const [describeError, setDescribeError] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [reviewFacts, setReviewFacts] = useState<ReviewFact[]>([]);
  const [ambiguities, setAmbiguities] = useState<EventExtractionResult["ambiguities"]>([]);
  const [editingKey, setEditingKey] = useState<EventFactFieldKey | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [guidedValuesVersion, setGuidedValuesVersion] = useState(0);
  const controllerRef = useRef<AbortController | null>(null);

  const counts = useMemo(() => countReviewStatuses(reviewFacts), [reviewFacts]);
  const groupedFacts = useMemo(() => groupReviewFacts(reviewFacts), [reviewFacts]);
  const missingQuestions = useMemo(
    () => buildMissingQuestions(reviewFacts),
    [reviewFacts]
  );
  const highlightedUnknownKeys = useMemo(
    () => new Set(missingQuestions.map((question) => question.key)),
    [missingQuestions]
  );
  const guidedValues = useMemo(
    () => reviewFactsToIntakeValues(reviewFacts),
    [reviewFacts, guidedValuesVersion]
  );

  async function runExtraction() {
    if (description.trim().length < 20) {
      setDescribeError("Add a few sentences so Gatherwise has enough event detail to review.");
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    setIsExtracting(true);
    setDescribeError("");

    try {
      const response = await fetch("/api/intake/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
        signal: controller.signal
      });
      const payload = (await response.json()) as Partial<ExtractionResponse>;

      if (!response.ok || !payload.facts || !payload.ambiguities) {
        setDescribeError(
          payload.message ??
            "We could not review that description right now. Use the guided form instead."
        );
        return;
      }

      const nextReviewFacts = buildReviewFacts(payload as EventExtractionResult);
      setReviewFacts(nextReviewFacts);
      setAmbiguities(payload.ambiguities);
      setPhase("review");
    } catch (error) {
      if (controller.signal.aborted) {
        setDescribeError("Description review was canceled. You can retry or use the guided form.");
        return;
      }

      setDescribeError("We could not reach the description review service. Use the guided form instead.");
    } finally {
      setIsExtracting(false);
      controllerRef.current = null;
    }
  }

  function cancelExtraction() {
    controllerRef.current?.abort();
  }

  function openGuidedForm() {
    setGuidedValuesVersion((current) => current + 1);
    setSelectedPath("guided");
    setPhase("guided");
  }

  function updateFact(
    key: EventFactFieldKey,
    value: string | number | boolean | null,
    reviewStatus: ReviewFact["reviewStatus"]
  ) {
    setReviewFacts((current) =>
      current.map((fact) =>
        fact.key === key
          ? {
              ...fact,
              value: normalizeEditorValue(fact.valueType, value),
              reviewStatus
            }
          : fact
      )
    );
    setEditingKey(null);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <PathChoice
          active={selectedPath === "describe"}
          badge="Recommended"
          body="Paste a short event description, review what Gatherwise extracted, and then continue with structured details."
          cta="Describe my event"
          onClick={() => {
            setSelectedPath("describe");
            setPhase(phase === "guided" && reviewFacts.length > 0 ? "review" : "describe");
          }}
          primary
          title="Describe my event"
        />
        <PathChoice
          active={selectedPath === "guided"}
          body="Answer step-by-step questions yourself when you want full manual control from the start."
          cta="Use the guided form"
          onClick={() => {
            setSelectedPath("guided");
            setPhase("guided");
          }}
          title="Use the guided form"
        />
      </div>

      {selectedPath === "describe" && phase === "describe" ? (
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Badge tone="highlight">Step 1 of 3</Badge>
              <h2 className="mt-3 text-2xl font-black tracking-[-0.03em]">
                Describe your event in plain language.
              </h2>
            </div>
            <div className="rounded-full bg-[var(--gw-ai-extracted-soft)] px-3 py-1 text-sm font-semibold text-[var(--gw-ai-extracted)]">
              Manual fallback stays available
            </div>
          </div>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-semibold">
              Event description
            </span>
            <span className="mb-2 block text-xs leading-5 text-[var(--muted)]">
              Example: &quot;We are planning a one-day punk show in Phoenix with 10 bands, food vendors, a beer garden, and a temporary stage in a parking lot.&quot;
            </span>
            <textarea
              className="focus-ring min-h-44 w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)] px-3 py-3 text-sm leading-6"
              maxLength={4000}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the event setup, where it happens, what people will do there, and any food, alcohol, sound, traffic, or structure details you already know."
              value={description}
            />
          </label>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-[var(--muted)]">
              Privacy note: do not include names, phone numbers, or personal contact details.
            </p>
            <span className="rounded-full bg-[var(--sand)] px-2.5 py-1 text-xs font-semibold text-[var(--muted)]">
              {description.length} / 4000
            </span>
          </div>
          {describeError ? (
            <div className="mt-4 rounded-[var(--radius-control)] border border-[var(--accent)] bg-[var(--alert-soft)] p-3 text-sm leading-6 text-[var(--alert-strong)]">
              {describeError}
            </div>
          ) : null}
          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
            <button
              className="local-button focus-ring min-h-[48px] bg-[var(--primary)] text-white disabled:cursor-not-allowed disabled:opacity-60"
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
                <Sparkles className="h-4 w-4" />
              )}
              {isExtracting ? "Reviewing your description..." : "Review my description"}
            </button>
            <button
              className="focus-ring min-h-[48px] rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold"
              disabled={!isExtracting}
              onClick={cancelExtraction}
              type="button"
            >
              Cancel
            </button>
            <button
              className="focus-ring min-h-[48px] rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold"
              disabled={isExtracting || !describeError}
              onClick={runExtraction}
              type="button"
            >
              Retry
            </button>
            <button
              className="focus-ring min-h-[48px] rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold"
              onClick={openGuidedForm}
              type="button"
            >
              Use the guided form
            </button>
          </div>
          <p aria-live="polite" className="mt-4 text-sm leading-6 text-[var(--muted)]" role="status">
            {isExtracting
              ? "Gatherwise is extracting structured event facts. You can cancel and switch to the guided form at any time."
              : "The description path only extracts facts. It does not decide permits or legal requirements."}
          </p>
        </Card>
      ) : null}

      {selectedPath === "describe" && phase === "review" ? (
        <div className="space-y-5">
          <Card className="p-5">
            <Badge tone="secondary">Step 2 of 3</Badge>
            <h2 className="mt-3 text-2xl font-black tracking-[-0.03em]">
              Review extracted event facts before evaluation.
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              Confirm what looks right, edit anything unclear, and leave unknown items unknown. Gatherwise will only use reviewed details when you continue.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <StatusCard label="Confirmed facts" tone="verified" value={counts.confirmed} />
              <StatusCard label="Needs review" tone="warning" value={counts.needs_review} />
              <StatusCard label="Unknown facts" tone="neutral" value={counts.unknown} />
            </div>
            {ambiguities.length > 0 ? (
              <div className="mt-5 rounded-[var(--radius-control)] border border-[var(--warning)] bg-[var(--warning-soft)] p-4">
                <h3 className="text-sm font-bold text-[var(--warning-strong)]">
                  A few details look ambiguous.
                </h3>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-[var(--muted)]">
                  {ambiguities.map((ambiguity, index) => (
                    <li key={`${ambiguity.fieldKey ?? "general"}-${index}`}>
                      {ambiguity.reason}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Card>

          {missingQuestions.length > 0 ? (
            <Card className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Badge tone="highlight">Highest-value missing details</Badge>
                  <h3 className="mt-3 text-xl font-black tracking-[-0.02em]">
                    Answer up to three questions that may change the result.
                  </h3>
                </div>
                <span className="rounded-full bg-[var(--sand)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                  No loops, no trick questions
                </span>
              </div>
              <div className="mt-4 space-y-4">
                {missingQuestions.map((question) => (
                  <QuestionCard
                    key={question.key}
                    fact={reviewFacts.find((fact) => fact.key === question.key)!}
                    question={question}
                    onAnswer={(value, reviewStatus) =>
                      updateFact(question.key, value, reviewStatus)
                    }
                  />
                ))}
              </div>
            </Card>
          ) : null}

          <div className="space-y-4">
            {[...groupedFacts.entries()].map(([group, facts]) => (
              <details className="local-card p-4" key={group} open={group === "event-basics"}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black tracking-[-0.02em]">
                      {groupLabel(group)}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                      {facts.filter((fact) => fact.extracted).length} extracted facts,{" "}
                      {facts.filter((fact) => fact.reviewStatus === "unknown").length} unknown
                    </p>
                  </div>
                  <ChevronDown className="h-5 w-5 text-[var(--muted)]" />
                </summary>
                <div className="mt-4 space-y-3">
                  {facts
                    .filter(
                      (fact) =>
                        fact.extracted || highlightedUnknownKeys.has(fact.key)
                    )
                    .map((fact) => (
                      <FactRow
                        editValue={editValue}
                        editing={editingKey === fact.key}
                        fact={fact}
                        key={fact.key}
                        onBeginEdit={() => {
                          setEditingKey(fact.key);
                          setEditValue(fact.value === null ? "" : String(fact.value));
                        }}
                        onCancelEdit={() => setEditingKey(null)}
                        onChangeEditValue={setEditValue}
                        onConfirm={() => updateFact(fact.key, fact.value, "confirmed")}
                        onMarkUnknown={() => updateFact(fact.key, null, "unknown")}
                        onSaveEdit={() =>
                          updateFact(
                            fact.key,
                            editValue === "" ? null : editValue,
                            "confirmed"
                          )
                        }
                      />
                    ))}
                </div>
              </details>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <button
              className="local-button focus-ring min-h-[48px] bg-[var(--primary)] text-white"
              onClick={openGuidedForm}
              type="button"
            >
              Continue with reviewed details
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              className="focus-ring min-h-[48px] rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold"
              onClick={() => setPhase("describe")}
              type="button"
            >
              Retry description
            </button>
          </div>
          <p className="text-sm leading-6 text-[var(--muted)]">
            You can keep this partially reviewed and move into the guided form without losing your work.
          </p>
        </div>
      ) : null}

      {selectedPath === "guided" || phase === "guided" ? (
        <Card className="p-5">
          {reviewFacts.length > 0 ? (
            <div className="mb-5 rounded-[var(--radius-control)] border border-[var(--primary)] bg-[var(--primary-soft)] p-4 text-sm leading-6 text-[var(--muted)]">
              Gatherwise carried your reviewed description details into the guided form. Change anything you need before building the readiness summary.
            </div>
          ) : null}
          <IntakeForm
            initialValues={guidedValues}
            introText={
              reviewFacts.length > 0
                ? "Start with the reviewed details Gatherwise found, then fill any gaps you still know. Unknown details can stay unanswered until they matter."
                : undefined
            }
          />
        </Card>
      ) : null}
    </div>
  );
}

function PathChoice({
  active,
  badge,
  body,
  cta,
  onClick,
  primary = false,
  title
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
    <Card className={`p-5 ${active ? "border-[var(--primary)]" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-black tracking-[-0.02em]">{title}</h2>
        <Badge tone={primary ? "highlight" : active ? "primary" : "neutral"}>
          {badge ?? (active ? "Selected" : "Available")}
        </Badge>
      </div>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{body}</p>
      <button
        className={`focus-ring mt-4 min-h-[48px] w-full rounded-[var(--radius-control)] px-4 py-2 text-sm font-semibold ${
          primary
            ? "bg-[var(--primary)] text-white"
            : "border border-[var(--line-strong)] bg-[var(--surface)] text-[var(--foreground)]"
        }`}
        onClick={onClick}
        type="button"
      >
        {cta}
      </button>
    </Card>
  );
}

function StatusCard({
  label,
  tone,
  value
}: {
  label: string;
  tone: "verified" | "warning" | "neutral";
  value: number;
}) {
  const toneClass =
    tone === "verified"
      ? "border-[var(--verified)] bg-[var(--verified-soft)] text-[var(--verified-strong)]"
      : tone === "warning"
        ? "border-[var(--warning)] bg-[var(--warning-soft)] text-[var(--warning-strong)]"
        : "border-[var(--line)] bg-[var(--surface-muted)] text-[var(--muted)]";

  return (
    <div className={`rounded-[var(--radius-control)] border p-4 ${toneClass}`}>
      <div className="text-sm font-semibold">{label}</div>
      <div className="mt-2 text-3xl font-black">{value}</div>
    </div>
  );
}

function QuestionCard({
  fact,
  question,
  onAnswer
}: {
  fact: ReviewFact;
  question: MissingQuestion;
  onAnswer: (value: string | boolean | null, reviewStatus: ReviewFact["reviewStatus"]) => void;
}) {
  const options = fieldOptions(question.key);
  const booleanField = fact.valueType === "boolean";

  return (
    <div className="rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)] p-4">
      <h4 className="text-sm font-bold">{question.label}</h4>
      <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{question.reason}</p>
      {booleanField ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <AnswerButton label="Yes" onClick={() => onAnswer(true, "confirmed")} />
          <AnswerButton label="No" onClick={() => onAnswer(false, "confirmed")} />
          <AnswerButton label="I don't know" onClick={() => onAnswer(null, "unknown")} />
        </div>
      ) : options ? (
        <div className="mt-3 flex flex-wrap gap-3">
          <select
            className="focus-ring min-h-[44px] rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm"
            defaultValue=""
            onChange={(event) => onAnswer(event.target.value || null, event.target.value ? "confirmed" : "unknown")}
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
        <div className="mt-3 flex flex-wrap gap-3">
          <input
            className="focus-ring min-h-[44px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm"
            onBlur={(event) =>
              onAnswer(
                event.target.value.trim() || null,
                event.target.value.trim() ? "confirmed" : "unknown"
              )
            }
            placeholder={`Add ${question.label.toLowerCase()}`}
          />
        </div>
      )}
    </div>
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
  onSaveEdit
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

  return (
    <div className="rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-bold">{fact.label}</h4>
            <Badge
              tone={
                fact.reviewStatus === "confirmed"
                  ? "verified"
                  : fact.reviewStatus === "needs_review"
                    ? "warning"
                    : "neutral"
              }
            >
              {fact.reviewStatus === "confirmed"
                ? "Confirmed"
                : fact.reviewStatus === "needs_review"
                  ? "Needs review"
                  : "Unknown"}
            </Badge>
          </div>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            {fact.value === null ? "No confirmed value yet." : formatFactValue(fact)}
          </p>
          {fact.evidenceText ? (
            <p className="mt-2 rounded-[var(--radius-control)] bg-[var(--surface-muted)] px-3 py-2 text-xs leading-5 text-[var(--muted)]">
              From description: “{fact.evidenceText}”
            </p>
          ) : null}
        </div>
        {!editing ? (
          <div className="flex flex-wrap gap-2">
            {fact.reviewStatus === "needs_review" ? (
              <button
                className="focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-[var(--radius-control)] border border-[var(--verified)] bg-[var(--verified-soft)] px-3 py-2 text-sm font-semibold text-[var(--verified-strong)]"
                onClick={onConfirm}
                type="button"
              >
                <Check className="h-4 w-4" />
                Confirm
              </button>
            ) : null}
            <button
              className="focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold"
              onClick={onBeginEdit}
              type="button"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
            <button
              className="focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold"
              onClick={onMarkUnknown}
              type="button"
            >
              <RotateCcw className="h-4 w-4" />
              I don't know
            </button>
          </div>
        ) : null}
      </div>
      {editing ? (
        <div className="mt-4 space-y-3">
          {fact.valueType === "boolean" ? (
            <div className="flex flex-wrap gap-2">
              <AnswerButton label="Yes" onClick={() => onChangeEditValue("true")} />
              <AnswerButton label="No" onClick={() => onChangeEditValue("false")} />
            </div>
          ) : options ? (
            <select
              className="focus-ring min-h-[44px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm"
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
              className="focus-ring min-h-[44px] w-full rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm"
              onChange={(event) => onChangeEditValue(event.target.value)}
              type={fact.valueType === "number" ? "number" : fact.valueType === "date" ? "date" : "text"}
              value={editValue}
            />
          )}
          <div className="flex flex-wrap gap-2">
            <button
              className="focus-ring min-h-[44px] rounded-[var(--radius-control)] bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-white"
              onClick={onSaveEdit}
              type="button"
            >
              Save change
            </button>
            <button
              className="focus-ring min-h-[44px] rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold"
              onClick={onCancelEdit}
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AnswerButton({
  label,
  onClick
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="focus-ring min-h-[44px] rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold"
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
    "sound-and-alcohol": "Sound and alcohol"
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
  value: string | number | boolean | null
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
