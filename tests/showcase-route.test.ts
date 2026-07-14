import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const showcase = read("app", "showcase", "page.tsx");
const styles = read("styles", "civic-signal.css");

test("showcase presents the recruiter case study in a factual sequence", () => {
  for (const label of [
    "The problem",
    "Who it helps",
    "Product approach",
    "Hybrid architecture",
    "Evaluation methodology",
    "Technical stack",
    "Builder contribution",
    "Public demos",
    "Limitations",
  ]) {
    assert.match(showcase, new RegExp(label));
  }
});

test("showcase contains required entry points and intended public links", () => {
  assert.match(showcase, /Try the readiness demo/);
  assert.match(showcase, /See the architecture/);
  assert.match(showcase, /href="\/intake\?path=describe"/);
  assert.match(showcase, /https:\/\/github\.com\/AmazonChitlin\/gatherwise/);
  assert.match(showcase, /getDemoResultsHref/);
});

test("showcase states the implemented AI and deterministic boundary accurately", () => {
  assert.match(showcase, /server-only AI provider/);
  assert.match(showcase, /Human confirmation/);
  assert.match(showcase, /Deterministic evaluation/);
  assert.match(showcase, /AI never selects requirements/);
  assert.match(showcase, /deterministic\s+fallbacks/);
  assert.doesNotMatch(
    showcase,
    /still planned|Planned boundary|not live behavior/,
  );
});

test("showcase uses verified evaluation methodology without invented metrics", () => {
  assert.match(showcase, /36 synthetic scenarios/);
  assert.match(showcase, /Usability findings\s+remain separate/);
  assert.doesNotMatch(
    showcase,
    /customers|adoption|approved events|success rate/i,
  );
  assert.doesNotMatch(showcase, /261 tests/);
});

test("showcase has Civic Signal visual and responsive contracts", () => {
  assert.match(showcase, /civic-case-interface/);
  assert.match(showcase, /civic-architecture-diagram/);
  assert.match(styles, /\.civic-case-hero/);
  assert.match(
    styles,
    /@media \(max-width: 480px\)[\s\S]*civic-case-interface/,
  );
  assert.match(styles, /prefers-reduced-motion: reduce[\s\S]*civic-case-route/);
});

function read(...parts: string[]) {
  return readFileSync(join(process.cwd(), ...parts), "utf8");
}
