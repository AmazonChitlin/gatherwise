import assert from "node:assert/strict";
import test from "node:test";
import {
  buildReviewFacts,
  buildMissingQuestions,
  reviewFactsToIntakeValues,
  reviewFactsToPartialValues
} from "@/lib/intake-review";
import type { EventExtractionResult } from "@/lib/ai/extraction";

const extraction: EventExtractionResult = {
  provider: "mock",
  model: "mock-model",
  facts: [
    {
      key: "city",
      value: "phoenix",
      status: "extracted",
      evidenceText: "in Phoenix"
    },
    {
      key: "eventType",
      value: "outdoor-market",
      status: "extracted",
      evidenceText: "outdoor market"
    },
    {
      key: "hasAlcohol",
      value: null,
      status: "unknown"
    }
  ],
  ambiguities: []
};

test("builds review facts with extracted and unknown states", () => {
  const facts = buildReviewFacts(extraction);

  assert.equal(facts.find((fact) => fact.key === "city")?.reviewStatus, "needs_review");
  assert.equal(facts.find((fact) => fact.key === "city")?.evidenceText, "in Phoenix");
  assert.equal(facts.find((fact) => fact.key === "hasAlcohol")?.reviewStatus, "unknown");
});

test("preserves unknown facts when creating partial values", () => {
  const facts = buildReviewFacts(extraction);
  const values = reviewFactsToPartialValues(facts);

  assert.equal(values.city, "phoenix");
  assert.equal("hasAlcohol" in values, false);
});

test("does not inflate unknown review facts with guided-form defaults", () => {
  const facts = buildReviewFacts({
    ...extraction,
    facts: []
  });
  const values = reviewFactsToIntakeValues(facts);

  for (const key of [
    "city",
    "expectedAttendance",
    "eventType",
    "useCase",
    "propertyUse",
    "hasRetailSales",
    "indoorOrOutdoor"
  ] as const) {
    assert.equal(key in values, false, `${key} should remain absent`);
  }
});

test("ranks at most three deterministic missing questions", () => {
  const facts = buildReviewFacts(extraction);
  const questions = buildMissingQuestions(facts);

  assert.ok(questions.length <= 3);
  assert.ok(
    questions.every((question) =>
      /This detail may change whether these reviewed items appear/.test(
        question.reason
      )
    )
  );
});
