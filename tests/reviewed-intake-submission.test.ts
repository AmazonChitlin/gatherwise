import assert from "node:assert/strict";
import test from "node:test";
import { POST } from "@/app/api/intake/route";
import { defaultIntakeValues } from "@/lib/intake-defaults";
import {
  eventFactsToRuleEngineFacts,
  type EventFactFieldKey
} from "@/lib/event-facts";
import { parseResultsSnapshot } from "@/lib/intake-storage";
import { matchRulesToEventFacts } from "@/lib/rule-engine";
import {
  REVIEWED_INTAKE_SCHEMA_VERSION,
  buildReviewedEventFacts,
  reviewedIntakeSubmissionSchema,
  type ReviewedIntakeSubmission
} from "@/lib/reviewed-intake";

const unknownKeys = [
  "city",
  "expectedAttendance",
  "eventType",
  "useCase",
  "propertyUse",
  "hasRetailSales",
  "indoorOrOutdoor"
] satisfies EventFactFieldKey[];

test("reviewed submissions preserve unknown defaults and refuse unknown geography", () => {
  const document = buildReviewedEventFacts(baseReviewedSubmission(), {
    confirmedAt: "2026-07-13T18:00:00.000Z"
  });

  for (const key of unknownKeys) {
    const fact = document.facts.find((item) => item.key === key);
    assert.equal(fact?.status, "unknown", `${key} status`);
    assert.equal(fact?.value, null, `${key} value`);
  }

  assert.equal(document.jurisdiction.supported, false);
  assert.equal(document.jurisdiction.code, "unknown");

  const ruleFacts = eventFactsToRuleEngineFacts(document);
  assert.equal(ruleFacts.city, null);
  assert.equal(ruleFacts.jurisdictionCode, null);
  assert.equal(ruleFacts.expectedAttendance, null);
  assert.equal(ruleFacts.eventType, null);
  assert.equal(ruleFacts.useCase, null);
  assert.deepEqual(matchRulesToEventFacts(document, []), []);
});

test("confirmed true and false remain confirmed without losing evidence", () => {
  const submission = baseReviewedSubmission();
  submission.review.facts.push(
    {
      key: "hasAlcohol",
      status: "confirmed",
      value: false,
      evidenceText: "and no alcohol"
    },
    {
      key: "hasAmplifiedSound",
      status: "confirmed",
      value: true,
      evidenceText: "amplified music"
    }
  );

  const document = buildReviewedEventFacts(submission, {
    confirmedAt: "2026-07-13T18:00:00.000Z"
  });
  const alcohol = document.facts.find((fact) => fact.key === "hasAlcohol");
  const sound = document.facts.find((fact) => fact.key === "hasAmplifiedSound");

  assert.equal(alcohol?.status, "confirmed");
  assert.equal(alcohol?.value, false);
  assert.equal(alcohol?.evidenceTextSpan?.text, "and no alcohol");
  assert.equal(alcohol?.confirmedAt, "2026-07-13T18:00:00.000Z");
  assert.equal(sound?.status, "confirmed");
  assert.equal(sound?.value, true);
  assert.equal(sound?.evidenceTextSpan?.text, "amplified music");
});

test("extracted facts remain awaiting review and retain evidence", () => {
  const submission = baseReviewedSubmission();
  submission.intake.eventName = "Saturday punk show";
  submission.intake.city = "phoenix";
  submission.review.facts.push({
    key: "eventName",
    status: "extracted",
    value: "Saturday punk show",
    evidenceText: "Saturday punk show"
  }, {
    key: "city",
    status: "extracted",
    value: "phoenix",
    evidenceText: "in Phoenix"
  });

  const document = buildReviewedEventFacts(submission);
  const eventName = document.facts.find((fact) => fact.key === "eventName");
  const ruleFacts = eventFactsToRuleEngineFacts(document);

  assert.equal(eventName?.status, "extracted");
  assert.equal(eventName?.value, "Saturday punk show");
  assert.equal(eventName?.evidenceTextSpan?.text, "Saturday punk show");
  assert.equal(eventName?.confirmedAt, undefined);
  assert.equal(ruleFacts.city, null);
  assert.equal(ruleFacts.jurisdictionCode, null);
});

test("touched canonical enum values become confirmed", () => {
  const submission = baseReviewedSubmission();
  submission.intake.city = "mesa";
  submission.intake.useCase = "private-property-parking-lot-event";
  submission.review.touchedFields.push("city", "useCase");

  const parsed = reviewedIntakeSubmissionSchema.parse(submission);
  const document = buildReviewedEventFacts(parsed, {
    confirmedAt: "2026-07-13T18:00:00.000Z"
  });

  assert.equal(findFact(document, "city").status, "confirmed");
  assert.equal(findFact(document, "city").value, "mesa");
  assert.equal(findFact(document, "useCase").status, "confirmed");
  assert.equal(
    findFact(document, "useCase").value,
    "private-property-parking-lot-event"
  );
  assert.equal(document.jurisdiction.code, "mesa");
  assert.equal(document.jurisdiction.supported, true);
});

test("server validation rejects arbitrary statuses and noncanonical enums", () => {
  const arbitraryStatus = baseReviewedSubmission() as unknown as {
    review: { facts: Array<Record<string, unknown>> };
  };
  arbitraryStatus.review.facts[0]!.status = "provided";
  assert.equal(reviewedIntakeSubmissionSchema.safeParse(arbitraryStatus).success, false);

  const invalidEnum = baseReviewedSubmission();
  invalidEnum.intake.city = "Phoenix" as "phoenix";
  invalidEnum.review.touchedFields.push("city");
  assert.equal(reviewedIntakeSubmissionSchema.safeParse(invalidEnum).success, false);
});

test("reviewed API snapshots preserve unknowns through submission and results parsing", async () => {
  const originalPersistence = process.env.PERSIST_INTAKE_SUBMISSIONS;
  process.env.PERSIST_INTAKE_SUBMISSIONS = "false";

  try {
    const response = await POST(jsonRequest(baseReviewedSubmission(), "reviewed-unknown"));
    const payload = (await response.json()) as { snapshot?: string };

    assert.equal(response.status, 200);
    assert.ok(payload.snapshot);

    const parsed = parseResultsSnapshot(payload.snapshot!);
    assert.ok(parsed?.eventFacts);
    assert.equal(findFact(parsed!.eventFacts!, "city").status, "unknown");
    assert.equal(findFact(parsed!.eventFacts!, "city").value, null);
    assert.equal(findFact(parsed!.eventFacts!, "expectedAttendance").value, null);
    assert.equal(findFact(parsed!.eventFacts!, "hasRetailSales").value, null);
    assert.equal(parsed?.eventFacts?.jurisdiction.supported, false);
  } finally {
    restoreEnvironment("PERSIST_INTAKE_SUBMISSIONS", originalPersistence);
  }
});

test("plain guided-form API payloads remain backward compatible", async () => {
  const originalPersistence = process.env.PERSIST_INTAKE_SUBMISSIONS;
  process.env.PERSIST_INTAKE_SUBMISSIONS = "false";

  try {
    const plainIntake = {
      ...defaultIntakeValues,
      eventName: "Backward compatible guided event",
      eventDate: "2026-10-17"
    };
    const response = await POST(jsonRequest(plainIntake, "plain-guided"));
    const payload = (await response.json()) as { snapshot?: string };
    const parsed = parseResultsSnapshot(payload.snapshot!);

    assert.equal(response.status, 200);
    assert.equal(parsed?.intake.city, "phoenix");
    assert.equal(findFact(parsed!.eventFacts!, "city").status, "provided");
    assert.equal(findFact(parsed!.eventFacts!, "hasRetailSales").value, true);
  } finally {
    restoreEnvironment("PERSIST_INTAKE_SUBMISSIONS", originalPersistence);
  }
});

function baseReviewedSubmission(): ReviewedIntakeSubmission {
  return reviewedIntakeSubmissionSchema.parse({
    intake: {},
    review: {
      schemaVersion: REVIEWED_INTAKE_SCHEMA_VERSION,
      facts: unknownKeys.map((key) => ({
        key,
        status: "unknown",
        value: null
      })),
      touchedFields: []
    }
  });
}

function findFact(
  document: ReturnType<typeof buildReviewedEventFacts>,
  key: EventFactFieldKey
) {
  const fact = document.facts.find((item) => item.key === key);
  assert.ok(fact, `missing fact: ${key}`);
  return fact;
}

function jsonRequest(body: unknown, clientId: string) {
  return new Request("http://localhost/api/intake", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": clientId
    },
    body: JSON.stringify(body)
  });
}

function restoreEnvironment(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}
