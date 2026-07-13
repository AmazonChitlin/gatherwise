import assert from "node:assert/strict";
import test from "node:test";
import {
  buildRedFlags,
  formatConfidence,
  formatRequirementLevel,
  formatTimeline,
  formatVerificationMessage,
  formatVerificationStatus,
  groupByJurisdiction,
  sortByLeadTime,
  topItemsToCheckFirst
} from "@/lib/results-helpers";
import type { ChecklistItem } from "@/lib/rule-engine";

test("sorts checklist items by longest lead time first", () => {
  const sorted = sortByLeadTime([
    item({ slug: "short", title: "Short", leadTimeDays: 7 }),
    item({ slug: "long", title: "Long", leadTimeDays: 30 })
  ]);

  assert.deepEqual(
    sorted.map((result) => result.slug),
    ["long", "short"]
  );
});

test("selects top items by requirement urgency and lead time", () => {
  const topItems = topItemsToCheckFirst([
    item({
      slug: "confirm-long",
      requirementLevel: "confirm with the agency",
      leadTimeDays: 60
    }),
    item({
      slug: "may-short",
      requirementLevel: "may be required",
      leadTimeDays: 7
    }),
    item({
      slug: "likely-short",
      requirementLevel: "likely required",
      leadTimeDays: 3
    }),
    item({
      slug: "may-long",
      requirementLevel: "may be required",
      leadTimeDays: 30
    })
  ]);

  assert.deepEqual(
    topItems.map((result) => result.slug),
    ["likely-short", "may-long", "may-short", "confirm-long"]
  );
});

test("formats timeline items from unique lead times", () => {
  const timeline = formatTimeline([
    item({ slug: "a", leadTimeDays: 30 }),
    item({ slug: "b", leadTimeDays: 14 }),
    item({ slug: "c", leadTimeDays: 30 })
  ]);

  assert.deepEqual(timeline, [
    "Start checking 30 days before the event for 2 matched items.",
    "Start checking 14 days before the event for 1 matched item."
  ]);
});

test("formats honest no-match timeline copy", () => {
  assert.deepEqual(formatTimeline([]), [
    "No timeline items matched yet. Confirm timing with the agency."
  ]);
});

test("groups checklist items by jurisdiction", () => {
  const groups = groupByJurisdiction([
    item({ slug: "phoenix", jurisdiction: "Phoenix" }),
    item({ slug: "state", jurisdiction: "Arizona" })
  ]);

  assert.deepEqual(
    groups.map((group) => group.jurisdiction),
    ["Phoenix", "Arizona"]
  );
});

test("formats confidence and requirement labels", () => {
  assert.equal(formatConfidence("medium"), "Medium confidence");
  assert.equal(formatRequirementLevel("likely required"), "Likely required");
  assert.equal(formatRequirementLevel("confirm with the agency"), "Confirm with agency");
});

test("formats verification labels and messages", () => {
  assert.equal(formatVerificationStatus("verified"), "Verified source");
  assert.equal(formatVerificationStatus("needs_review"), "Needs source review");
  assert.equal(formatVerificationStatus("sample_placeholder"), "Sample placeholder");

  assert.equal(
    formatVerificationMessage(
      item({
        isSample: false,
        verificationStatus: "verified",
        lastVerified: "2026-06-23"
      })
    ),
    "Official source last checked on 2026-06-23. Confirm details with the listed agency before relying on it."
  );
  assert.equal(
    formatVerificationMessage(item({ verificationStatus: "needs_review" })),
    "This item needs source review. Confirm this with the listed agency before relying on it."
  );
  assert.equal(
    formatVerificationMessage(item()),
    "This item is based on sample data and needs official verification. Confirm this with the listed agency before relying on it."
  );
});

test("adds red flags for long lead time and low confidence", () => {
  const flags = buildRedFlags([
    item({ leadTimeDays: 30, confidence: "low" })
  ]);

  assert.ok(flags.includes("At least one matched item has a 30-day planning lead time."));
  assert.ok(flags.includes("One or more matched items are marked low confidence."));
});

function item(overrides: Partial<ChecklistItem> = {}): ChecklistItem {
  return {
    ruleId: overrides.ruleId ?? overrides.slug ?? "sample-rule",
    slug: overrides.slug ?? "sample-rule",
    title: overrides.title ?? "Sample rule",
    plainEnglishSummary:
      overrides.plainEnglishSummary ??
      "Sample only. Confirm details with the relevant agency.",
    requirementLevel: overrides.requirementLevel ?? "may be required",
    sourceUrl: overrides.sourceUrl ?? "https://example.gov",
    sourceName: overrides.sourceName ?? "Official sample source",
    lastVerified: overrides.lastVerified,
    isSample: overrides.isSample ?? true,
    verificationStatus: overrides.verificationStatus ?? "sample_placeholder",
    verificationNote: overrides.verificationNote,
    jurisdiction: overrides.jurisdiction ?? "Arizona",
    jurisdictionType: overrides.jurisdictionType ?? "state",
    leadTimeDays: overrides.leadTimeDays ?? 14,
    confidence: overrides.confidence ?? "low",
    agencyName: overrides.agencyName ?? "Sample Agency",
    agencyPhone: overrides.agencyPhone,
    agencyEmail: overrides.agencyEmail,
    agencyUrl: overrides.agencyUrl
  };
}
