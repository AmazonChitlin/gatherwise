import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  getDemoScenario,
  getDemoResultsHref,
  listDemoScenarios
} from "@/lib/demo-scenarios";
import { parseResultsSnapshot } from "@/lib/intake-storage";

const home = read("app", "page.tsx");
const intake = read("app", "intake", "page.tsx");
const intakeExperience = read("components", "intake-experience.tsx");
const results = read("app", "results", "page.tsx");

test("defines the six fictional public demo scenarios", () => {
  const scenarios = listDemoScenarios();

  assert.equal(scenarios.length, 6);
  assert.ok(scenarios.every((scenario) => scenario.title.startsWith("Fictional demo:")));
  assert.ok(getDemoScenario("unsupported-jurisdiction"));
});

test("demo results hrefs are stateless snapshots with real intake payloads", () => {
  const scenario = getDemoScenario("private-property-punk-show");
  assert.ok(scenario);

  const href = getDemoResultsHref(scenario!);
  const snapshot = new URL(`https://example.com/${href}`).searchParams.get("snapshot");
  assert.ok(snapshot);

  const parsed = parseResultsSnapshot(snapshot!);
  assert.equal(parsed?.intake.eventName, scenario!.intake.eventName);
  assert.ok(parsed?.eventFacts);
});

test("home and intake pages expose one-click fictional demos without login copy", () => {
  assert.match(home, /Public demo scenarios/);
  assert.match(home, /One-click demo/);
  assert.match(home, /Fictional demo/);
  assert.match(intake, /Public demo scenarios/);
  assert.match(intake, /Open guided sample/);
});

test("intake and results pages label demos as fictional and resettable", () => {
  assert.match(intakeExperience, /Fictional demo scenario/);
  assert.match(intakeExperience, /does not create a permanent record/i);
  assert.match(results, /Fictional demo scenario/);
  assert.match(results, /Reset this sample/);
});

test("unsupported-jurisdiction demo keeps an unsupported boundary", () => {
  const scenario = getDemoScenario("unsupported-jurisdiction");
  assert.equal(scenario?.eventFacts?.jurisdiction.supported, false);
  assert.equal(scenario?.eventFacts?.jurisdiction.state, "NV");
});

function read(...parts: string[]) {
  return readFileSync(join(process.cwd(), ...parts), "utf8");
}
