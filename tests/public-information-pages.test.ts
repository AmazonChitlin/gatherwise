import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { officialSourceInventory } from "../prisma/seed-data/source-inventory";

const howItWorks = read("app", "how-it-works", "page.tsx");
const sources = read("app", "sources", "page.tsx");
const about = read("app", "about", "page.tsx");
const styles = read("styles", "civic-signal.css");

test("how it works follows the numbered Describe Review Evaluate Verify route", () => {
  const positions = ["Describe", "Review", "Evaluate", "Verify"].map((label) =>
    howItWorks.indexOf(`"${label}"`),
  );
  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual(
    positions,
    [...positions].sort((left, right) => left - right),
  );
  assert.match(howItWorks, /01/);
  assert.match(howItWorks, /04/);
});

test("how it works keeps one explicit architecture and legal boundary", () => {
  assert.match(howItWorks, /civic-process-diagram/);
  assert.match(howItWorks, /AI may not/);
  assert.match(howItWorks, /Deterministic rules/);
  assert.match(howItWorks, /Informational guidance/);
  assert.match(howItWorks, /Unsupported\s+jurisdictions are refused/);
});

test("sources render the authoritative inventory by jurisdiction and agency", () => {
  assert.match(sources, /groupSources\(officialSourceInventory\)/);
  assert.match(sources, /civic-source-jurisdiction/);
  assert.match(sources, /civic-source-agencies/);
  assert.match(sources, /source\.agencyName/);
  assert.match(sources, /source\.lastChecked/);
  assert.match(sources, /source\.verificationStatus/);
  assert.equal(officialSourceInventory.length, 46);
  assert.equal(
    officialSourceInventory.filter(
      (source) => source.verificationStatus === "official_reviewed",
    ).length,
    43,
  );
});

test("source links retain titles urls and safe external-link behavior", () => {
  assert.match(sources, /source\.sourceName/);
  assert.match(sources, /href=\{source\.sourceUrl\}/);
  assert.match(sources, /rel="noreferrer"/);
  assert.match(sources, /target="_blank"/);
  assert.match(sources, /displayUrl\(source\.sourceUrl\)/);
  for (const source of officialSourceInventory.filter(
    (item) => item.sourceUrl,
  )) {
    assert.match(source.sourceUrl ?? "", /^https:\/\//);
  }
});

test("about covers purpose method refusal pilot and current limitations", () => {
  for (const phrase of [
    "Why it exists",
    "Arizona pilot",
    "Product principles",
    "Source-grounded method",
    "Human-confirmed facts",
    "Refuse unsupported certainty",
    "Current limitations",
  ]) {
    assert.match(about, new RegExp(phrase, "i"));
  }
});

test("public information pages preserve mobile reflow focus and touch geometry", () => {
  assert.match(styles, /\.civic-source-index-link[\s\S]*min-height: 48px/);
  assert.match(styles, /\.civic-text-link[\s\S]*min-height: 44px/);
  assert.match(styles, /@media \(max-width: 480px\)[\s\S]*civic-source-row/);
  assert.match(styles, /@media \(max-width: 480px\)[\s\S]*civic-process-route/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
});

function read(...parts: string[]) {
  return readFileSync(join(process.cwd(), ...parts), "utf8");
}
