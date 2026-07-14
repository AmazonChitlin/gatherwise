import { z } from "zod";
import {
  eventFactFieldKeys,
  partialIntakeToEventFacts,
  type EventFactFieldKey,
  type EventFactOverrides,
  type EventFactsDocument
} from "@/lib/event-facts";
import {
  intakeSchema,
  partialIntakeSchema,
  type PartialIntakeInput
} from "@/lib/schemas";

export const REVIEWED_INTAKE_SCHEMA_VERSION = "2026-07-13.1";

const fieldKeyValues = eventFactFieldKeys as [
  EventFactFieldKey,
  ...EventFactFieldKey[]
];
const fieldKeySchema = z.enum(fieldKeyValues);
const reviewFactStatusSchema = z.enum(["confirmed", "extracted", "unknown"]);
const reviewFactValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null()
]);

export const reviewedFactSubmissionSchema = z
  .object({
    key: fieldKeySchema,
    status: reviewFactStatusSchema,
    value: reviewFactValueSchema,
    evidenceText: z.string().trim().min(1).max(500).optional()
  })
  .strict()
  .superRefine((fact, context) => {
    if (fact.status === "unknown") {
      if (fact.value !== null) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["value"],
          message: "Unknown review facts must have a null value."
        });
      }
      return;
    }

    if (fact.value === null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["value"],
        message: "Reviewed facts need a value unless they are unknown."
      });
      return;
    }

    const fieldSchema = intakeSchema.shape[fact.key] as z.ZodTypeAny;
    if (!fieldSchema.safeParse(fact.value).success) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["value"],
        message: "Reviewed fact value does not match its canonical field type."
      });
    }
  });

export const reviewedIntakeSubmissionSchema = z
  .object({
    intake: partialIntakeSchema.strict(),
    review: z
      .object({
        schemaVersion: z.literal(REVIEWED_INTAKE_SCHEMA_VERSION),
        facts: z.array(reviewedFactSubmissionSchema).max(eventFactFieldKeys.length),
        touchedFields: z.array(fieldKeySchema).max(eventFactFieldKeys.length)
      })
      .strict()
  })
  .strict()
  .superRefine((submission, context) => {
    addDuplicateIssues(
      submission.review.facts.map((fact) => fact.key),
      ["review", "facts"],
      context
    );
    addDuplicateIssues(
      submission.review.touchedFields,
      ["review", "touchedFields"],
      context
    );

    for (const key of submission.review.touchedFields) {
      if (!hasOwn(submission.intake, key)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["intake", key],
          message: "Touched fields must include a validated intake value."
        });
      }
    }
  });

export type ReviewedFactSubmission = z.infer<typeof reviewedFactSubmissionSchema>;
export type ReviewedIntakeSubmission = z.infer<
  typeof reviewedIntakeSubmissionSchema
>;

export function buildReviewedEventFacts(
  submission: ReviewedIntakeSubmission,
  options?: { confirmedAt?: string }
): EventFactsDocument {
  const confirmedAt = options?.confirmedAt ?? new Date().toISOString();
  const touchedFields = new Set(submission.review.touchedFields);
  const overrides: EventFactOverrides = {};

  for (const fact of submission.review.facts) {
    overrides[fact.key] = {
      value: fact.status === "unknown" ? null : fact.value,
      status: fact.status,
      evidenceTextSpan: fact.evidenceText
        ? { text: fact.evidenceText }
        : undefined,
      confirmedAt: fact.status === "confirmed" ? confirmedAt : undefined
    };
  }

  for (const key of touchedFields) {
    overrides[key] = {
      ...overrides[key],
      value: submission.intake[key] as never,
      status: "confirmed",
      confirmedAt
    };
  }

  return partialIntakeToEventFacts(submission.intake as PartialIntakeInput, {
    defaultStatus: "unknown",
    overrides
  });
}

function addDuplicateIssues(
  keys: EventFactFieldKey[],
  path: (string | number)[],
  context: z.RefinementCtx
) {
  const seen = new Set<EventFactFieldKey>();

  for (const [index, key] of keys.entries()) {
    if (seen.has(key)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: [...path, index],
        message: `Duplicate reviewed field: ${key}.`
      });
    }
    seen.add(key);
  }
}

function hasOwn(value: object, key: PropertyKey) {
  return Object.prototype.hasOwnProperty.call(value, key);
}
