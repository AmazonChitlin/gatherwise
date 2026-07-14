import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const intakePage = read("app", "intake", "page.tsx");
const experience = read("components", "intake-experience.tsx");
const intakeForm = read("components", "intake-form.tsx");
const civicCss = read("styles", "civic-signal.css");

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
  assert.match(experience, /aria-describedby=\{`event-description-example/);
  assert.match(
    experience,
    /aria-current=\{stepNumber === activeStep \? "step"/,
  );
  assert.match(civicCss, /\.civic-intake-action\s*\{[\s\S]*min-height:\s*44px/);
  assert.match(civicCss, /\.civic-intake-toggle\s*\{[\s\S]*min-height:\s*54px/);
});

test("uses the Civic Signal workspace and route progress", () => {
  assert.match(intakePage, /civic-intake-intro/);
  assert.match(intakePage, /civic-intake-layout/);
  assert.match(experience, /Event planning progress/);
  assert.match(
    experience,
    /Describe[\s\S]*Review[\s\S]*Complete details[\s\S]*Results/,
  );
  assert.match(experience, /civic-describe-workspace/);
  assert.match(experience, /civic-review-workspace/);
  assert.match(experience, /civic-guided-workspace/);
  assert.doesNotMatch(intakePage, /<Card|PageContainer|command-pattern/);
});

test("connects intake helpers and errors to their controls", () => {
  assert.match(intakeForm, /useId/);
  assert.match(intakeForm, /aria-describedby/);
  assert.match(intakeForm, /aria-invalid/);
  assert.match(intakeForm, /role="alert"/);
  assert.match(intakeForm, /<fieldset className="civic-intake-form-section">/);
  assert.match(intakeForm, /<legend>/);
});

test("keeps intake responsive and reduced-motion safe", () => {
  assert.match(
    civicCss,
    /@media \(max-width: 1024px\)[\s\S]*\.civic-intake-layout/,
  );
  assert.match(
    civicCss,
    /@media \(max-width: 768px\)[\s\S]*\.civic-intake-paths__choices/,
  );
  assert.match(
    civicCss,
    /@media \(max-width: 480px\)[\s\S]*\.civic-intake-form \.grid/,
  );
  assert.match(
    civicCss,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.civic-intake-route__marker/,
  );
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
    /hasStreetSidewalkOrParkingImpact:\s*current\./,
  ]) {
    assert.doesNotMatch(intakeForm, pattern);
  }
});

test("all guided-path transitions invalidate active extraction", () => {
  assert.match(
    experience,
    /function openGuidedForm\(\)[\s\S]*requestGuardRef\.current\.invalidate\(\)/,
  );
  assert.equal(
    (experience.match(/onClick=\{openGuidedForm\}/g) ?? []).length,
    3,
  );
});

test("explicit cancel keeps its user-facing canceled status", () => {
  assert.match(
    experience,
    /function cancelExtraction\(\)[\s\S]*Description review was canceled\./,
  );
  assert.match(experience, /role="status"/);
});

test("retry invalidates the prior request before returning to describe", () => {
  assert.match(
    experience,
    /function retryDescription\(\)[\s\S]*requestGuardRef\.current\.invalidate\(\)[\s\S]*setPhase\("describe"\)/,
  );
  assert.match(experience, /onClick=\{retryDescription\}/);
});

test("renders one retail-sales question in Selling and vendors", () => {
  assert.equal(
    (intakeForm.match(/checked=\{values\.hasRetailSales === true\}/g) ?? [])
      .length,
    1,
  );
  assert.match(intakeForm, /title="Selling and vendors"/);
});

test("uses factual BYOB copy without permission language", () => {
  assert.match(intakeForm, /Guests may bring their own alcohol \(BYOB\)/);
  assert.doesNotMatch(intakeForm, /BYOB may be allowed/);
});

test("path-choice buttons expose selected state", () => {
  assert.match(experience, /aria-pressed=\{active\}/);
  assert.match(experience, /active \? "civic-intake-path--active"/);
  assert.match(experience, /role="group"/);
});

function read(...parts: string[]) {
  return readFileSync(join(process.cwd(), ...parts), "utf8");
}
