import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const intakePage = read("app", "intake", "page.tsx");
const experience = read("components", "intake-experience.tsx");
const intakeForm = read("components", "intake-form.tsx");

test("offers only the two starting intake paths", () => {
  assert.match(intakePage, /IntakeExperience/);
  assert.match(experience, /Describe my event/);
  assert.match(experience, /Use the guided form/);
  assert.doesNotMatch(experience, /Preview path/);
});

test("natural-language intake includes label example privacy guidance and fallback", () => {
  assert.match(experience, /Event description/);
  assert.match(experience, /Privacy note/);
  assert.match(experience, /4000/);
  assert.match(experience, /Cancel/);
  assert.match(experience, /Use the guided form/);
  assert.match(experience, /The description path only extracts facts/);
});

test("review flow shows summary states grouped details and missing questions", () => {
  assert.match(experience, /Review extracted event facts before evaluation/);
  assert.match(experience, /Confirmed facts/);
  assert.match(experience, /Needs review/);
  assert.match(experience, /Unknown facts/);
  assert.match(experience, /Highest-value missing details/);
  assert.match(experience, /I don't know/);
  assert.match(experience, /Continue with reviewed details/);
});

test("review flow keeps accessibility and large-target interaction cues", () => {
  assert.match(experience, /aria-live="polite"/);
  assert.match(experience, /min-h-\[48px\]/);
  assert.match(experience, /min-h-\[44px\]/);
});

test("AI-derived guided sessions submit partial reviewed facts instead of defaults", () => {
  assert.match(experience, /reviewFacts=\{reviewFacts\.length > 0/);
  assert.match(intakeForm, /reviewedIntakeSubmissionSchema\.parse/);
  assert.match(intakeForm, /touchedFieldsRef/);
  assert.match(intakeForm, /partialIntakeSchema\.safeParse/);
  assert.match(intakeForm, /value=\{values\.city \?\? ""\}/);
  assert.match(intakeForm, /value=\{values\.indoorOrOutdoor \?\? ""\}/);
});

function read(...parts: string[]) {
  return readFileSync(join(process.cwd(), ...parts), "utf8");
}
