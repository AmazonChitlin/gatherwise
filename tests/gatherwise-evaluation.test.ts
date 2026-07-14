import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  GATHERWISE_EVALUATION_DATASET_VERSION,
  listGatherwiseEvaluationScenarios,
  type GatherwiseScenarioTag
} from "@/lib/evaluation/gatherwise-dataset";
import {
  renderDocsSummary,
  renderMarkdownReport,
  type GatherwiseEvaluationReport
} from "@/lib/evaluation/gatherwise-harness";
import { supportedJurisdictions } from "@/lib/config";

test("evaluation dataset covers every supported jurisdiction with at least 36 scenarios", () => {
  const scenarios = listGatherwiseEvaluationScenarios();
  const covered = new Set(scenarios.map((scenario) => scenario.jurisdictionCode));

  assert.ok(scenarios.length >= 36);
  assert.equal(GATHERWISE_EVALUATION_DATASET_VERSION, "2026-07-13.1");
  assert.ok(
    supportedJurisdictions.every((jurisdiction) => covered.has(jurisdiction.code))
  );
});

test("evaluation dataset includes required edge-case tags", () => {
  const scenarios = listGatherwiseEvaluationScenarios();
  const tags = new Set(scenarios.flatMap((scenario) => scenario.tags));

  for (const tag of [
    "unsupported-geography",
    "prompt-injection",
    "contradiction",
    "ambiguous-quantity",
    "ambiguous-date",
    "traffic-control",
    "right-of-way-use",
    "food-truck"
  ] satisfies GatherwiseScenarioTag[]) {
    assert.ok(tags.has(tag), `missing required evaluation tag: ${tag}`);
  }
});

test("package scripts expose offline and opt-in live evaluation commands", () => {
  const packageJson = JSON.parse(read("package.json")) as {
    scripts?: Record<string, string>;
  };

  assert.equal(packageJson.scripts?.["eval:gatherwise"], "tsx scripts/eval-gatherwise.ts");
  assert.equal(
    packageJson.scripts?.["eval:gatherwise:live"],
    "tsx scripts/eval-gatherwise.ts --live"
  );
});

test("evaluation report renderers include required metadata fields", () => {
  const report: GatherwiseEvaluationReport = {
    generatedAt: "2026-07-13T00:00:00.000Z",
    commitSha: "abc1234",
    workingTreeClean: true,
    mode: "offline",
    datasetVersion: "2026-07-13.1",
    scenarioCount: 36,
    modelConfiguration: {
      extractionProvider: "mock-fixture",
      extractionModel: "fixture-normalization",
      explanationProvider: "mock-audit",
      explanationModel: "validator-and-red-team",
      liveMode: false
    },
    coverage: {
      supportedJurisdictionsCovered: ["phoenix"],
      tags: {
        "public-property": 1,
        "private-property": 1,
        "attendance-boundary": 1,
        "food-truck": 1,
        "on-site-food-prep": 1,
        "prepackaged-food": 1,
        alcohol: 1,
        "amplified-sound": 1,
        tent: 1,
        canopy: 1,
        stage: 1,
        "right-of-way-use": 1,
        "traffic-control": 1,
        "missing-details": 1,
        contradiction: 1,
        "unsupported-geography": 1,
        "prompt-injection": 1,
        "ambiguous-quantity": 1,
        "ambiguous-date": 1
      }
    },
    extraction: {
      assertedFields: 100,
      exactMatches: 98,
      accuracy: 0.98,
      expectedUnknowns: 10,
      unknownMatches: 9,
      unsupportedInferenceCount: 1,
      falseVsUnknownErrors: 1,
      contradictionScenarios: 2,
      contradictionHandled: 2,
      failures: []
    },
    ruleConsistency: {
      scenariosChecked: 35,
      ruleIdAgreement: 0.9,
      sourceIdAgreement: 0.9,
      boundaryAgreement: 1,
      failures: []
    },
    grounding: {
      cases: 5,
      validatedCases: 1,
      citationFailureRejected: true,
      unsupportedSourceIdsDetected: 1,
      addedAgencyClaimsDetected: 1,
      addedDeadlineClaimsDetected: 1,
      addedThresholdClaimsDetected: 1,
      unsupportedRequirementClaimsDetected: 1,
      failures: []
    },
    reliability: {
      checks: [],
      passedCount: 0,
      failedCount: 0
    },
    usability: {
      automatedMetricsIncluded: false,
      note: "Separate research.",
      referenceDocs: ["docs/gatherwise/usability-test-plan.md"]
    },
    failures: [],
    limitations: ["Offline metrics are fixture-driven."]
  };

  const markdown = renderMarkdownReport(report);
  const docs = renderDocsSummary(report);

  assert.match(markdown, /Commit SHA: abc1234/);
  assert.match(markdown, /Dataset version: 2026-07-13.1/);
  assert.match(docs, /reports\/gatherwise\/latest\.json/);
  assert.match(docs, /does not claim live-model extraction quality/i);
});

function read(...parts: string[]) {
  return readFileSync(join(process.cwd(), ...parts), "utf8");
}
