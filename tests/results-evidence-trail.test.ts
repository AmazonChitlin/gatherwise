import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const results = read("app", "results", "page.tsx");
const styles = read("styles", "civic-signal.css");

test("results route uses the Gatherwise evidence hierarchy in order", () => {
  const expectedSections = [
    "Most important next action",
    "Possible requirements",
    "Missing information",
    "Planning order",
    "Grounded AI explanation",
    "Evidence Trail",
    "Full official sources",
    "Limitations",
  ];

  for (const label of expectedSections) {
    assert.match(results, new RegExp(label));
  }
});

test("results route makes the evidence trail pattern explicit", () => {
  assert.match(results, /Your fact\. Verified rule\. Official source\./);
  assert.match(results, /title=\"Your fact\"/);
  assert.match(results, /title=\"Verified rule\"/);
  assert.match(results, /title=\"Official source\"/);
});

test("results route uses the prompt-approved status language", () => {
  assert.match(results, /May apply/);
  assert.match(results, /Needs review/);
  assert.match(results, /Confirmed from your details/);
  assert.match(results, /Information missing/);
  assert.match(results, /Source needs review/);
  assert.match(results, />Unsupported</);
  assert.match(results, /Official source/);
});

test("results route keeps the explanation accessible and source-grounded", () => {
  assert.match(results, /id="grounded-explanation"/);
  assert.match(results, /What we know/);
  assert.match(results, /What needs review/);
  assert.match(results, /Next steps/);
  assert.match(results, /Source ID:/);
});

test("results use a Civic Signal mast, route spine, and distinct section surfaces", () => {
  assert.match(results, /civic-results-mast/);
  assert.match(results, /civic-results-workspace/);
  assert.match(results, /civic-results-waypoint/);
  assert.match(results, /civic-results-order/);
  assert.match(styles, /\.civic-results-workspace::before/);
  assert.match(
    styles,
    /\.civic-results-order[\s\S]*background: var\(--civic-ink\)/,
  );
});

test("official evidence stays adjacent to requirements and remains a real link", () => {
  assert.match(results, /item\.sourceUrl/);
  assert.match(results, /item\.sourceName/);
  assert.match(results, /href=\{item\.sourceUrl\}/);
  assert.match(results, /rel="noreferrer"/);
  assert.match(results, /target="_blank"/);
});

test("unsupported jurisdictions branch to a visible stop before successful results", () => {
  assert.match(results, /if \(!eventFacts\.jurisdiction\.supported\)/);
  assert.match(results, /UnsupportedResults/);
  assert.match(results, /civic-unsupported-stop/);
  assert.match(results, /will not present guessed requirements/);
  assert.match(results, /Possible requirements[\s\S]*Not evaluated/);
});

test("results preserve native disclosure and semantic lists across responsive layouts", () => {
  assert.match(results, /<details className="civic-evidence-trail">/);
  assert.match(results, /<summary className="focus-ring">/);
  assert.match(results, /<dl className="civic-results-metrics">/);
  assert.match(
    styles,
    /@media \(max-width: 768px\)[\s\S]*civic-evidence-trail__panels/,
  );
  assert.match(styles, /@media \(max-width: 480px\)[\s\S]*civic-results-wrap/);
});

function read(...parts: string[]) {
  return readFileSync(join(process.cwd(), ...parts), "utf8");
}
