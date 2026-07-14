import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const header = read("components", "site-header.tsx");
const footer = read("components", "site-footer.tsx");
const layout = read("app", "layout.tsx");
const home = read("app", "page.tsx");
const intake = read("app", "intake", "page.tsx");
const intakeExperience = read("components", "intake-experience.tsx");
const about = read("app", "about", "page.tsx");
const results = read("app", "results", "page.tsx");
const readme = read("README.md");

test("uses the Gatherwise brand and updated top-level navigation", () => {
  assert.match(header, /Gatherwise/);
  assert.doesNotMatch(header, /Plan an event/);
  assert.match(header, /Start a route/);
  assert.match(header, /How it works/);
  assert.match(header, /Sources/);
  assert.match(header, /About/);
  assert.match(header, /Showcase/);
  assert.doesNotMatch(header, /Check my event/);
});

test("sets Gatherwise metadata and Arizona pilot messaging", () => {
  assert.match(layout, /Gatherwise \| Ready\. Set\. Local\./);
  assert.match(layout, /Arizona pilot/);
  assert.match(layout, /openGraph/);
});

test("implements the two-path intake start model", () => {
  assert.match(home, /Describe my event/);
  assert.match(home, /Use the guided form/);
  assert.match(intake, /IntakeExperience/);
  assert.match(intakeExperience, /Describe my event/);
  assert.match(intakeExperience, /Use the guided form/);
  assert.match(intake, /manual\s+path stays available/i);
});

test("updates core public pages to Gatherwise task language", () => {
  assert.match(home, /What you can do now/);
  assert.match(home, /What information is needed/);
  assert.match(home, /What the result means/);
  assert.match(about, /What Gatherwise does/);
  assert.match(results, /Based on the details you provided/);
  assert.doesNotMatch(home, /EventLocal helps|What EventLocal|See what EventLocal|EventLocal does/);
  assert.doesNotMatch(about, /What EventLocal|How EventLocal|EventLocal helps/);
  assert.doesNotMatch(intake, /EventLocal will|EventLocal does/);
});

test("rebrands the README headline and description", () => {
  assert.match(readme, /^# Gatherwise$/m);
  assert.match(
    readme,
    /Gatherwise is a source-grounded event-readiness application/
  );
  assert.doesNotMatch(readme, /^# EventLocal MVP/m);
});

function read(...parts: string[]) {
  return readFileSync(join(process.cwd(), ...parts), "utf8");
}
