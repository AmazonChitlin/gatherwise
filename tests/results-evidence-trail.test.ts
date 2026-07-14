import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const results = read("app", "results", "page.tsx");

test("results route uses the Gatherwise evidence hierarchy in order", () => {
  const expectedSections = [
    "Most important next action",
    "Possible requirements",
    "Missing information",
    "Planning order",
    "Evidence Trail",
    "Full official sources",
    "Limitations"
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
  assert.match(results, /Not supported/);
});

function read(...parts: string[]) {
  return readFileSync(join(process.cwd(), ...parts), "utf8");
}
