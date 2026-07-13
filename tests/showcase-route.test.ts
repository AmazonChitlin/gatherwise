import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const showcase = read("app", "showcase", "page.tsx");
const globalsCss = read("app", "globals.css");

test("showcase route includes recruiter story sections in the expected order", () => {
  const expectedSections = [
    "The tangled problem",
    "The hybrid system",
    "Signature experience",
    "Evidence and transparency",
    "Technical proof",
    "Evaluation",
    "Builder contribution",
    "Limitations"
  ];

  for (const label of expectedSections) {
    assert.match(showcase, new RegExp(label));
  }
});

test("showcase hero contains the required recruiter entry points", () => {
  assert.match(showcase, /Gatherwise/);
  assert.match(showcase, /Ready\. Set\. Local\./);
  assert.match(showcase, /Arizona pilot/);
  assert.match(showcase, /Try the readiness demo/);
  assert.match(showcase, /See the architecture/);
});

test("showcase makes the AI boundary explicit without claiming live AI behavior", () => {
  assert.match(showcase, /AI extracts event facts/);
  assert.match(showcase, /Verified rules evaluate those facts/);
  assert.match(showcase, /AI explains the verified result/);
  assert.match(showcase, /Planned boundary/);
  assert.match(showcase, /Live today/);
});

test("showcase route uses local-signal route helpers and remains accessible", () => {
  assert.match(showcase, /id="architecture"/);
  assert.match(showcase, /aria-label="Try the readiness demo"/);
  assert.match(showcase, /aria-label="See the architecture section"/);
  assert.match(globalsCss, /\.gw-showcase-route-line/);
  assert.match(globalsCss, /\.gw-showcase-route-stop/);
});

function read(...parts: string[]) {
  return readFileSync(join(process.cwd(), ...parts), "utf8");
}
