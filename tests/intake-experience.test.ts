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

test("child controls do not mutate aggregate parent answers", () => {
  for (const pattern of [
    /hasFood:\s*current\./,
    /hasAlcohol:\s*current\./,
    /alcoholPresent:\s*current\./,
    /hasTemporaryStructure:\s*current\./,
    /hasOpenFlame:\s*current\./,
    /hasStreetSidewalkOrParkingImpact:\s*current\./
  ]) {
    assert.doesNotMatch(intakeForm, pattern);
  }
});

test("all guided-path transitions invalidate active extraction", () => {
  assert.match(experience, /function openGuidedForm\(\)[\s\S]*requestGuardRef\.current\.invalidate\(\)/);
  assert.equal(
    (experience.match(/onClick=\{openGuidedForm\}/g) ?? []).length,
    3
  );
});

test("explicit cancel keeps its user-facing canceled status", () => {
  assert.match(
    experience,
    /function cancelExtraction\(\)[\s\S]*Description review was canceled\./
  );
  assert.match(experience, /role="status"/);
});

test("retry invalidates the prior request before returning to describe", () => {
  assert.match(
    experience,
    /function retryDescription\(\)[\s\S]*requestGuardRef\.current\.invalidate\(\)[\s\S]*setPhase\("describe"\)/
  );
  assert.match(experience, /onClick=\{retryDescription\}/);
});

test("renders one retail-sales question in Selling and vendors", () => {
  assert.equal(
    (intakeForm.match(/checked=\{values\.hasRetailSales === true\}/g) ?? []).length,
    1
  );
  assert.match(intakeForm, /title="Selling and vendors"/);
});

test("uses factual BYOB copy without permission language", () => {
  assert.match(intakeForm, /Guests may bring their own alcohol \(BYOB\)/);
  assert.doesNotMatch(intakeForm, /BYOB may be allowed/);
});

test("path-choice buttons expose selected state", () => {
  assert.match(experience, /aria-pressed=\{active\}/);
  assert.match(experience, /active \? "ring-2 ring-\[var\(--primary\)\]/);
});

function read(...parts: string[]) {
  return readFileSync(join(process.cwd(), ...parts), "utf8");
}
