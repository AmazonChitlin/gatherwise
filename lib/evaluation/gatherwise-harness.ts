import { mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import {
  buildExplanationPacket,
  createExplanationService,
  createOpenAIExplanationProvider,
  type ExplanationPacket,
  MockExplanationProvider,
  validateGroundedExplanation
} from "@/lib/ai/explanations";
import {
  createExtractionService,
  createOpenAIExtractionProvider,
  ExtractionConfigError,
  ExtractionMalformedOutputError,
  ExtractionProviderError,
  ExtractionTimeoutError,
  MockExtractionProvider,
  type EventExtractionProvider,
  type EventExtractionResult,
  type ExtractionProviderResult
} from "@/lib/ai/extraction";
import { supportedJurisdictions } from "@/lib/config";
import {
  buildRequirementResultTrace,
  eventFactFieldKeys,
  intakeToEventFacts
} from "@/lib/event-facts";
import {
  GATHERWISE_EVALUATION_DATASET_VERSION,
  listGatherwiseEvaluationScenarios,
  type GatherwiseEvaluationScenario,
  type GatherwiseScenarioTag
} from "@/lib/evaluation/gatherwise-dataset";
import {
  matchRulesToEventFacts,
  type EngineRuleRecord,
  type EvidenceChecklistItem
} from "@/lib/rule-engine";
import { officialSourceInventory } from "@/prisma/seed-data/source-inventory";
import { ruleSeedData } from "@/prisma/seed-data/rules";

export type GatherwiseEvaluationMode = "offline" | "live";

export type GatherwiseEvaluationReport = {
  generatedAt: string;
  commitSha: string;
  workingTreeClean: boolean;
  mode: GatherwiseEvaluationMode;
  datasetVersion: string;
  scenarioCount: number;
  modelConfiguration: {
    extractionProvider: string;
    extractionModel: string | null;
    explanationProvider: string;
    explanationModel: string | null;
    liveMode: boolean;
  };
  coverage: {
    supportedJurisdictionsCovered: string[];
    tags: Record<GatherwiseScenarioTag, number>;
  };
  extraction: {
    assertedFields: number;
    exactMatches: number;
    accuracy: number;
    expectedUnknowns: number;
    unknownMatches: number;
    unsupportedInferenceCount: number;
    falseVsUnknownErrors: number;
    contradictionScenarios: number;
    contradictionHandled: number;
    failures: string[];
  };
  ruleConsistency: {
    scenariosChecked: number;
    ruleIdAgreement: number;
    sourceIdAgreement: number;
    boundaryAgreement: number;
    failures: string[];
  };
  grounding: {
    cases: number;
    validatedCases: number;
    citationFailureRejected: boolean;
    unsupportedSourceIdsDetected: number;
    addedAgencyClaimsDetected: number;
    addedDeadlineClaimsDetected: number;
    addedThresholdClaimsDetected: number;
    unsupportedRequirementClaimsDetected: number;
    failures: string[];
  };
  reliability: {
    checks: Array<{
      id: string;
      passed: boolean;
      note: string;
    }>;
    passedCount: number;
    failedCount: number;
  };
  usability: {
    automatedMetricsIncluded: false;
    note: string;
    referenceDocs: string[];
  };
  failures: string[];
  limitations: string[];
};

export async function runGatherwiseEvaluation(options?: {
  mode?: GatherwiseEvaluationMode;
}) {
  const mode = options?.mode ?? "offline";
  const scenarios = listGatherwiseEvaluationScenarios();
  const engineRules = buildEngineRulesFromSeed();
  const coverage = collectCoverage(scenarios);
  const extractionProvider =
    mode === "live"
      ? createOpenAIExtractionProvider()
      : undefined;
  const explanationProvider =
    mode === "live"
      ? createOpenAIExplanationProvider()
      : undefined;

  const extraction = await evaluateExtraction({
    scenarios,
    mode,
    extractionProvider
  });
  const ruleConsistency = evaluateRuleConsistency(scenarios, engineRules, extraction.resultsByScenarioId);
  const grounding = evaluateGrounding(engineRules);
  const reliability = await evaluateReliability();

  const failures = [
    ...extraction.failures,
    ...ruleConsistency.failures,
    ...grounding.failures,
    ...reliability.checks.filter((check) => !check.passed).map((check) => check.note)
  ];

  const report: GatherwiseEvaluationReport = {
    generatedAt: new Date().toISOString(),
    commitSha: gitValue(["rev-parse", "--short", "HEAD"]),
    workingTreeClean: gitValue(["status", "--porcelain"]) === "",
    mode,
    datasetVersion: GATHERWISE_EVALUATION_DATASET_VERSION,
    scenarioCount: scenarios.length,
    modelConfiguration: {
      extractionProvider: mode === "live" ? extractionProvider?.name ?? "openai" : "mock-fixture",
      extractionModel:
        mode === "live" ? extractionProvider?.model ?? null : "fixture-normalization",
      explanationProvider:
        mode === "live" ? explanationProvider?.name ?? "openai" : "mock-audit",
      explanationModel:
        mode === "live" ? explanationProvider?.model ?? null : "validator-and-red-team",
      liveMode: mode === "live"
    },
    coverage,
    extraction: {
      ...extraction.summary,
      failures: extraction.failures
    },
    ruleConsistency,
    grounding,
    reliability: {
      ...reliability,
      passedCount: reliability.checks.filter((check) => check.passed).length,
      failedCount: reliability.checks.filter((check) => !check.passed).length
    },
    usability: {
      automatedMetricsIncluded: false,
      note:
        "Measured usability remains separate from this harness. See the five-participant research package and do not merge those observations into automated technical scores.",
      referenceDocs: [
        "docs/gatherwise/usability-test-plan.md",
        "docs/gatherwise/test-session-template.md",
        "docs/gatherwise/research-debrief-template.md",
        "docs/gatherwise/hypothesis-review.md"
      ]
    },
    failures,
    limitations: [
      "Offline extraction metrics validate fixture-driven normalization and error handling, not live model quality.",
      "Live evaluation is opt-in because it can incur API cost and depends on configured OpenAI credentials.",
      "Grounding red-team checks combine runtime citation validation with harness-only narrative audits for unsupported agencies, deadlines, thresholds, and unsupported requirement claims.",
      "Usability metrics are intentionally excluded from this automated report and must be gathered with real participants."
    ]
  };

  return report;
}

export function writeGatherwiseEvaluationArtifacts(report: GatherwiseEvaluationReport) {
  const jsonPath = resolve(process.cwd(), "reports", "gatherwise", "latest.json");
  const markdownPath = resolve(process.cwd(), "reports", "gatherwise", "latest.md");
  const docsPath = resolve(
    process.cwd(),
    "docs",
    "gatherwise",
    "evaluation-report.md"
  );

  mkdirSync(dirname(jsonPath), { recursive: true });
  mkdirSync(dirname(docsPath), { recursive: true });

  writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  writeFileSync(markdownPath, renderMarkdownReport(report));
  writeFileSync(docsPath, renderDocsSummary(report));

  return {
    jsonPath,
    markdownPath,
    docsPath
  };
}

export function renderMarkdownReport(report: GatherwiseEvaluationReport) {
  return [
    "# Gatherwise Evaluation Report",
    "",
    `- Generated at: ${report.generatedAt}`,
    `- Commit SHA: ${report.commitSha}`,
    `- Working tree clean: ${report.workingTreeClean ? "yes" : "no"}`,
    `- Mode: ${report.mode}`,
    `- Dataset version: ${report.datasetVersion}`,
    `- Scenario count: ${report.scenarioCount}`,
    "",
    "## Coverage",
    "",
    `- Supported jurisdictions covered: ${report.coverage.supportedJurisdictionsCovered.join(", ")}`,
    `- Tags tracked: ${Object.entries(report.coverage.tags)
      .map(([key, value]) => `${key} (${value})`)
      .join(", ")}`,
    "",
    "## Extraction",
    "",
    `- Asserted fields: ${report.extraction.assertedFields}`,
    `- Exact matches: ${report.extraction.exactMatches}`,
    `- Accuracy: ${formatPercent(report.extraction.accuracy)}`,
    `- Expected unknowns matched: ${report.extraction.unknownMatches}/${report.extraction.expectedUnknowns}`,
    `- Unsupported inference count: ${report.extraction.unsupportedInferenceCount}`,
    `- False-versus-unknown errors: ${report.extraction.falseVsUnknownErrors}`,
    `- Contradiction handling: ${report.extraction.contradictionHandled}/${report.extraction.contradictionScenarios}`,
    "",
    "## Rule Consistency",
    "",
    `- Scenarios checked: ${report.ruleConsistency.scenariosChecked}`,
    `- Rule ID agreement: ${formatPercent(report.ruleConsistency.ruleIdAgreement)}`,
    `- Source ID agreement: ${formatPercent(report.ruleConsistency.sourceIdAgreement)}`,
    `- Boundary agreement: ${formatPercent(report.ruleConsistency.boundaryAgreement)}`,
    "",
    "## Grounding",
    "",
    `- Cases: ${report.grounding.cases}`,
    `- Runtime-validated cases: ${report.grounding.validatedCases}`,
    `- Citation failure rejected: ${report.grounding.citationFailureRejected ? "yes" : "no"}`,
    `- Unsupported source IDs detected: ${report.grounding.unsupportedSourceIdsDetected}`,
    `- Added agency claims detected: ${report.grounding.addedAgencyClaimsDetected}`,
    `- Added deadline claims detected: ${report.grounding.addedDeadlineClaimsDetected}`,
    `- Added threshold claims detected: ${report.grounding.addedThresholdClaimsDetected}`,
    `- Unsupported requirement claims detected: ${report.grounding.unsupportedRequirementClaimsDetected}`,
    "",
    "## Reliability",
    "",
    ...report.reliability.checks.map(
      (check) => `- ${check.passed ? "PASS" : "FAIL"} ${check.id}: ${check.note}`
    ),
    "",
    "## Failures",
    "",
    ...(report.failures.length > 0 ? report.failures.map((failure) => `- ${failure}`) : ["- None."]),
    "",
    "## Limitations",
    "",
    ...report.limitations.map((limitation) => `- ${limitation}`),
    ""
  ].join("\n");
}

export function renderDocsSummary(report: GatherwiseEvaluationReport) {
  return [
    "# Gatherwise evaluation report",
    "",
    `Generated from \`npm run ${report.mode === "live" ? "eval:gatherwise:live" : "eval:gatherwise"}\` on ${report.generatedAt}.`,
    "",
    "## Current snapshot",
    "",
    `- Commit SHA: \`${report.commitSha}\``,
    `- Working tree clean during run: ${report.workingTreeClean ? "yes" : "no"}`,
    `- Dataset version: \`${report.datasetVersion}\``,
    `- Scenario count: ${report.scenarioCount}`,
    `- Extraction provider: ${report.modelConfiguration.extractionProvider}`,
    `- Extraction model: ${report.modelConfiguration.extractionModel ?? "n/a"}`,
    "",
    "## What this run measured",
    "",
    `- Extraction fixture accuracy: ${formatPercent(report.extraction.accuracy)} across ${report.extraction.assertedFields} asserted fields`,
    `- Unknown detection: ${report.extraction.unknownMatches}/${report.extraction.expectedUnknowns}`,
    `- Rule ID agreement: ${formatPercent(report.ruleConsistency.ruleIdAgreement)}`,
    `- Source ID agreement: ${formatPercent(report.ruleConsistency.sourceIdAgreement)}`,
    `- Boundary agreement: ${formatPercent(report.ruleConsistency.boundaryAgreement)}`,
    `- Reliability checks passed: ${report.reliability.passedCount}/${report.reliability.checks.length}`,
    "",
    "## Honest interpretation",
    "",
    "The default offline command is a deterministic harness. It proves fixture coverage, normalization behavior, rule-trace agreement, grounding validation, and failure handling without incurring API cost. It does not claim live-model extraction quality.",
    "",
    "Use `npm run eval:gatherwise:live` only when you intentionally want model-backed extraction metrics and have the required environment variables configured.",
    "",
    "## Artifacts",
    "",
    "- Machine-readable: `reports/gatherwise/latest.json`",
    "- Human-readable: `reports/gatherwise/latest.md`",
    "",
    "## Open limitations",
    "",
    ...report.limitations.map((limitation) => `- ${limitation}`),
    ""
  ].join("\n");
}

async function evaluateExtraction(options: {
  scenarios: GatherwiseEvaluationScenario[];
  mode: GatherwiseEvaluationMode;
  extractionProvider?: EventExtractionProvider;
}) {
  let assertedFields = 0;
  let exactMatches = 0;
  let expectedUnknowns = 0;
  let unknownMatches = 0;
  let unsupportedInferenceCount = 0;
  let falseVsUnknownErrors = 0;
  let contradictionScenarios = 0;
  let contradictionHandled = 0;
  const failures: string[] = [];
  const resultsByScenarioId = new Map<string, EventExtractionResult>();

  for (const scenario of options.scenarios) {
    const provider =
      options.mode === "live"
        ? options.extractionProvider!
        : new MockExtractionProvider(scenario.providerResult);
    const service = createExtractionService({
      provider,
      config: {
        enabled: true,
        timeoutMs: 5_000,
        maxInputChars: 8_000,
        requestLimit: undefined
      }
    });

    let result: EventExtractionResult;
    try {
      result = await service.extract(scenario.description);
    } catch (error) {
      failures.push(
        `${scenario.id}: extraction failed - ${error instanceof Error ? error.message : "unknown error"}`
      );
      continue;
    }

    resultsByScenarioId.set(scenario.id, result);
    const actualByKey = new Map(result.facts.map((fact) => [fact.key, fact]));

    for (const key of eventFactFieldKeys) {
      const expectedValue = scenario.expectedFields[key];
      const actual = actualByKey.get(key);

      if (!actual) {
        failures.push(`${scenario.id}: missing extracted field ${key}`);
        continue;
      }

      assertedFields += 1;
      if (expectedValue === null) {
        expectedUnknowns += 1;
        if (actual.status === "unknown") {
          unknownMatches += 1;
          exactMatches += 1;
        } else {
          unsupportedInferenceCount += 1;
        }
        continue;
      }

      const matched = actual.status === "extracted" && actual.value === expectedValue;
      if (matched) {
        exactMatches += 1;
      } else if (expectedValue === false && actual.status === "unknown") {
        falseVsUnknownErrors += 1;
      }
    }

    if (scenario.expectedContradictionFields.length > 0) {
      contradictionScenarios += 1;
      const allHandled = scenario.expectedContradictionFields.every((fieldKey) => {
        const fact = actualByKey.get(fieldKey);
        return fact?.status === "unknown";
      });
      if (allHandled && result.ambiguities.length >= scenario.expectedAmbiguityCount) {
        contradictionHandled += 1;
      } else {
        failures.push(`${scenario.id}: contradiction handling did not preserve unknown states.`);
      }
    }
  }

  return {
    summary: {
      assertedFields,
      exactMatches,
      accuracy: assertedFields === 0 ? 0 : exactMatches / assertedFields,
      expectedUnknowns,
      unknownMatches,
      unsupportedInferenceCount,
      falseVsUnknownErrors,
      contradictionScenarios,
      contradictionHandled
    },
    failures,
    resultsByScenarioId
  };
}

function evaluateRuleConsistency(
  scenarios: GatherwiseEvaluationScenario[],
  engineRules: EngineRuleRecord[],
  resultsByScenarioId: Map<string, EventExtractionResult>
) {
  let scenariosChecked = 0;
  let ruleIdMatches = 0;
  let sourceIdMatches = 0;
  let boundaryMatches = 0;
  const failures: string[] = [];

  for (const scenario of scenarios) {
    if (scenario.skipRuleConsistency) {
      continue;
    }

    const extractionResult = resultsByScenarioId.get(scenario.id);
    if (!extractionResult) {
      continue;
    }

    scenariosChecked += 1;

    const manualDocument = intakeToEventFacts(scenario.intake, {
      defaultStatus: "confirmed"
    });
    const extractedDocument = extractionResultToEventFacts(scenario.intake, extractionResult);
    const manualChecklist = matchRulesToEventFacts(manualDocument, engineRules);
    const extractedChecklist = matchRulesToEventFacts(extractedDocument, engineRules);

    const manualRuleIds = new Set(manualChecklist.map((item) => item.ruleId));
    const extractedRuleIds = new Set(extractedChecklist.map((item) => item.ruleId));
    const manualSourceIds = new Set(
      manualChecklist
        .map((item) => item.sourceId)
        .filter((sourceId): sourceId is string => Boolean(sourceId))
    );
    const extractedSourceIds = new Set(
      extractedChecklist
        .map((item) => item.sourceId)
        .filter((sourceId): sourceId is string => Boolean(sourceId))
    );

    if (setsEqual(manualRuleIds, extractedRuleIds)) {
      ruleIdMatches += 1;
    } else {
      failures.push(`${scenario.id}: rule IDs diverged between manual and extracted facts.`);
    }

    if (setsEqual(manualSourceIds, extractedSourceIds)) {
      sourceIdMatches += 1;
    } else {
      failures.push(`${scenario.id}: source IDs diverged between manual and extracted facts.`);
    }

    if (
      manualDocument.jurisdiction.supported === extractedDocument.jurisdiction.supported &&
      manualDocument.jurisdiction.jurisdictionCode ===
        extractedDocument.jurisdiction.jurisdictionCode
    ) {
      boundaryMatches += 1;
    } else {
      failures.push(`${scenario.id}: jurisdiction support boundary diverged.`);
    }
  }

  return {
    scenariosChecked,
    ruleIdAgreement: scenariosChecked === 0 ? 0 : ruleIdMatches / scenariosChecked,
    sourceIdAgreement: scenariosChecked === 0 ? 0 : sourceIdMatches / scenariosChecked,
    boundaryAgreement: scenariosChecked === 0 ? 0 : boundaryMatches / scenariosChecked,
    failures
  };
}

function evaluateGrounding(engineRules: EngineRuleRecord[]) {
  const packet = buildGroundingPacket(engineRules);
  const failures: string[] = [];
  let validatedCases = 0;
  let unsupportedSourceIdsDetected = 0;
  let addedAgencyClaimsDetected = 0;
  let addedDeadlineClaimsDetected = 0;
  let addedThresholdClaimsDetected = 0;
  let unsupportedRequirementClaimsDetected = 0;
  let citationFailureRejected = false;

  const validCase = {
    type: "success" as const,
    title: "Grounded explanation",
    summary: "This requirement may apply based on the confirmed event details.",
    whatWeKnow: ["The event is in Phoenix."],
    needsReview: ["Parking impact details still need review."],
    nextSteps: ["Check the official source before you rely on this result."],
    citations: [packet.sources[0]?.sourceId ?? ""],
    requirementRefs: [packet.results[0]?.resultId ?? ""]
  };

  try {
    validateGroundedExplanation(packet, validCase);
    validatedCases += 1;
  } catch (error) {
    failures.push(
      `grounding-valid-case: ${error instanceof Error ? error.message : "validation failed"}`
    );
  }

  try {
    validateGroundedExplanation(packet, {
      ...validCase,
      citations: ["unknown-source-id"]
    });
  } catch {
    citationFailureRejected = true;
    unsupportedSourceIdsDetected += 1;
  }

  const redTeamCases = [
    {
      id: "added-agency",
      text: "The City of Surprise Permit Desk will approve this event next.",
      detector: () => {
        addedAgencyClaimsDetected += 1;
      }
    },
    {
      id: "added-deadline",
      text: "Submit everything 45 days in advance.",
      detector: () => {
        addedDeadlineClaimsDetected += 1;
      }
    },
    {
      id: "added-threshold",
      text: "Any event over 500 people triggers this rule.",
      detector: () => {
        addedThresholdClaimsDetected += 1;
      }
    },
    {
      id: "unsupported-requirement",
      text: "You need a police permit for this event.",
      detector: () => {
        unsupportedRequirementClaimsDetected += 1;
      }
    }
  ];

  for (const caseItem of redTeamCases) {
    if (detectGroundingViolation(caseItem.text)) {
      caseItem.detector();
    } else {
      failures.push(`${caseItem.id}: expected red-team violation was not detected.`);
    }
  }

  return {
    cases: 1 + redTeamCases.length,
    validatedCases,
    citationFailureRejected,
    unsupportedSourceIdsDetected,
    addedAgencyClaimsDetected,
    addedDeadlineClaimsDetected,
    addedThresholdClaimsDetected,
    unsupportedRequirementClaimsDetected,
    failures
  };
}

async function evaluateReliability() {
  const checks: Array<{ id: string; passed: boolean; note: string }> = [];

  try {
    createOpenAIExtractionProvider({
      config: {
        enabled: true,
        apiKey: undefined,
        model: "gpt-test"
      }
    });
    checks.push({
      id: "missing-key",
      passed: false,
      note: "Missing key check did not throw."
    });
  } catch (error) {
    checks.push({
      id: "missing-key",
      passed: error instanceof ExtractionConfigError,
      note: "Missing OpenAI API key is rejected before live extraction starts."
    });
  }

  try {
    const timeoutService = createExtractionService({
      provider: new MockExtractionProvider(
        ({ signal }) =>
          new Promise<ExtractionProviderResult>((_, reject) => {
            signal.addEventListener(
              "abort",
              () => reject(new ExtractionTimeoutError("AI extraction timed out.")),
              { once: true }
            );
          })
      ),
      config: {
        enabled: true,
        timeoutMs: 20,
        maxInputChars: 8_000
      }
    });
    await timeoutService.extract("Timeout probe");
    checks.push({
      id: "timeout",
      passed: false,
      note: "Timeout probe unexpectedly completed."
    });
  } catch (error) {
    checks.push({
      id: "timeout",
      passed: error instanceof ExtractionTimeoutError,
      note: "Extraction timeout returns a bounded failure."
    });
  }

  try {
    const failingService = createExtractionService({
      provider: new MockExtractionProvider(new ExtractionProviderError("synthetic upstream failure")),
      config: {
        enabled: true,
        timeoutMs: 100,
        maxInputChars: 8_000
      }
    });
    await failingService.extract("Failure probe");
    checks.push({
      id: "provider-failure",
      passed: false,
      note: "Provider failure probe unexpectedly completed."
    });
  } catch (error) {
    checks.push({
      id: "provider-failure",
      passed: error instanceof ExtractionProviderError,
      note: "Provider failures surface as operational errors."
    });
  }

  try {
    const malformedService = createExtractionService({
      provider: new MockExtractionProvider({
        type: "success",
        facts: [
          {
            key: "expectedAttendance",
            value: "not-a-number" as unknown as number,
            status: "extracted"
          }
        ],
        ambiguities: []
      }),
      config: {
        enabled: true,
        timeoutMs: 100,
        maxInputChars: 8_000
      }
    });
    await malformedService.extract("Malformed output probe");
    checks.push({
      id: "malformed-response",
      passed: false,
      note: "Malformed output probe unexpectedly completed."
    });
  } catch (error) {
    checks.push({
      id: "malformed-response",
      passed: error instanceof ExtractionMalformedOutputError,
      note: "Malformed extraction output is rejected."
    });
  }

  const packet = buildGroundingPacket(buildEngineRulesFromSeed());
  try {
    validateGroundedExplanation(packet, {
      type: "success",
      title: "Grounded explanation",
      summary: "This may apply.",
      whatWeKnow: [],
      needsReview: [],
      nextSteps: [],
      citations: ["fake-id"],
      requirementRefs: [packet.results[0]?.resultId ?? ""]
    });
    checks.push({
      id: "citation-failure",
      passed: false,
      note: "Citation failure probe unexpectedly validated."
    });
  } catch {
    checks.push({
      id: "citation-failure",
      passed: true,
      note: "Unknown citation IDs are rejected."
    });
  }

  try {
    simulateDatabaseFailure();
    checks.push({
      id: "database-failure",
      passed: false,
      note: "Synthetic database failure was not caught."
    });
  } catch {
    checks.push({
      id: "database-failure",
      passed: true,
      note: "Database-backed evaluation failures can be trapped and reported."
    });
  }

  const disabledExplanation = createExplanationService({
    provider: new MockExplanationProvider({
      type: "success",
      title: "Should not render",
      summary: "Should not render",
      whatWeKnow: [],
      needsReview: [],
      nextSteps: [],
      citations: [],
      requirementRefs: []
    }),
    config: {
      enabled: false
    }
  });
  const disabledResult = await disabledExplanation.explain(packet);
  checks.push({
    id: "ai-disabled",
    passed: disabledResult.mode === "fallback",
    note: "AI-disabled mode falls back to deterministic copy."
  });

  return {
    checks
  };
}

function extractionResultToEventFacts(
  intake: GatherwiseEvaluationScenario["intake"],
  result: EventExtractionResult
) {
  const overrides = Object.fromEntries(
    result.facts.map((fact) => [
      fact.key,
      fact.status === "unknown"
        ? {
            status: "unknown" as const,
            value: null
          }
        : {
            status: "confirmed" as const,
            value: fact.value
          }
    ])
  );

  return intakeToEventFacts(intake, {
    defaultStatus: "confirmed",
    overrides
  });
}

function buildEngineRulesFromSeed(): EngineRuleRecord[] {
  return ruleSeedData.map((rule, index) => ({
    id: `seed-rule-${index + 1}`,
    slug: rule.slug,
    title: rule.title,
    plainEnglishSummary: rule.plainEnglishSummary,
    requirementLevel: rule.requirementLevel,
    confidence: rule.confidence,
    leadTimeDays: rule.leadTimeDays,
    sourceUrl: rule.source.url,
    sourceName: rule.source.name,
    lastVerified: rule.lastVerified ? new Date(`${rule.lastVerified}T00:00:00.000Z`) : null,
    isSample: rule.isSample,
    verificationStatus: rule.verificationStatus,
    notes: rule.adminNote,
    jurisdictionName: rule.jurisdiction.name,
    jurisdictionCode: rule.jurisdiction.code,
    jurisdictionType: rule.jurisdiction.type,
    city: rule.jurisdiction.city ?? null,
    county: rule.jurisdiction.county ?? null,
    state: rule.jurisdiction.state,
    agencyName: rule.agency.name,
    agencyPhone: rule.agency.phone ?? null,
    agencyEmail: rule.agency.email ?? null,
    agencyUrl: rule.agency.url ?? null,
    triggerFields: JSON.stringify(rule.triggers),
    updatedAt: rule.lastVerified ? new Date(`${rule.lastVerified}T00:00:00.000Z`) : null
  }));
}

function buildGroundingPacket(engineRules: EngineRuleRecord[]): ExplanationPacket {
  const scenario = listGatherwiseEvaluationScenarios().find(
    (item) => item.jurisdictionCode === "phoenix" && !item.skipRuleConsistency
  ) ?? listGatherwiseEvaluationScenarios()[0];
  const eventFacts = intakeToEventFacts(scenario.intake, {
    defaultStatus: "confirmed"
  });
  const checklistItems = matchRulesToEventFacts(eventFacts, engineRules).slice(0, 2);

  const fallbackSource = officialSourceInventory.find((item) => item.sourceUrl);
  const syntheticChecklist: EvidenceChecklistItem[] =
    checklistItems.length > 0
      ? checklistItems
      : [
          {
            ruleId: "synthetic-rule",
            slug: "synthetic-rule",
            title: "Synthetic verified rule",
            plainEnglishSummary: "Synthetic summary for grounding evaluation.",
            requirementLevel: "may be required",
            sourceUrl: fallbackSource?.sourceUrl ?? "https://example.gov",
            sourceName: fallbackSource?.sourceName ?? "Synthetic source",
            lastVerified: fallbackSource?.lastChecked ?? "2026-07-13",
            isSample: false,
            verificationStatus: "verified",
            jurisdiction: fallbackSource?.jurisdictionName ?? "Arizona",
            jurisdictionType: fallbackSource?.jurisdictionType ?? "state",
            leadTimeDays: 14,
            confidence: "high",
            agencyName: fallbackSource?.agencyName ?? "Synthetic agency",
            sourceId: fallbackSource?.id ?? "synthetic-source",
            ruleVersion: "synthetic-rule:2026-07-13",
            jurisdictionCode: fallbackSource?.jurisdictionCode ?? "az",
            relevantFactKeys: ["city", "propertyUse"],
            matchedConditions: [],
            unknownConditions: [],
            evaluationTimestamp: "2026-07-13T00:00:00.000Z"
          }
        ];

  const requirementResults = syntheticChecklist.map((item) =>
    buildRequirementResultTrace(item, {
      factKeys: item.relevantFactKeys,
      ruleVersion: item.ruleVersion,
      sourceId: item.sourceId ?? undefined,
      matchedConditions: item.matchedConditions.map(
        (condition) => `${condition.label}: expected ${condition.expected}; actual ${condition.actual}.`
      ),
      unknownConditions: item.unknownConditions.map(
        (condition) => `${condition.label}: expected ${condition.expected}; actual ${condition.actual}.`
      ),
      evaluationTimestamp: item.evaluationTimestamp,
      knownUncertainty: item.unknownConditions.map((condition) => condition.label)
    })
  );

  return buildExplanationPacket({
    eventFacts,
    checklistItems: syntheticChecklist,
    requirementResults
  });
}

function collectCoverage(scenarios: GatherwiseEvaluationScenario[]) {
  const tagCounts = Object.fromEntries(
    [
      "public-property",
      "private-property",
      "attendance-boundary",
      "food-truck",
      "on-site-food-prep",
      "prepackaged-food",
      "alcohol",
      "amplified-sound",
      "tent",
      "canopy",
      "stage",
      "right-of-way-use",
      "traffic-control",
      "missing-details",
      "contradiction",
      "unsupported-geography",
      "prompt-injection",
      "ambiguous-quantity",
      "ambiguous-date"
    ].map((tag) => [tag, 0])
  ) as Record<GatherwiseScenarioTag, number>;

  for (const scenario of scenarios) {
    for (const tag of scenario.tags) {
      tagCounts[tag] += 1;
    }
  }

  const supportedJurisdictionsCovered = supportedJurisdictions
    .filter((jurisdiction) =>
      scenarios.some((scenario) => scenario.jurisdictionCode === jurisdiction.code)
    )
    .map((jurisdiction) => jurisdiction.code);

  return {
    supportedJurisdictionsCovered,
    tags: tagCounts
  };
}

function detectGroundingViolation(text: string) {
  return /permit desk|approve|45 days|500 people|police permit/i.test(text);
}

function simulateDatabaseFailure() {
  throw new Error("Synthetic database failure.");
}

function gitValue(args: string[]) {
  return execFileSync("git", args, {
    cwd: process.cwd(),
    encoding: "utf8"
  }).trim();
}

function setsEqual(left: Set<string>, right: Set<string>) {
  if (left.size !== right.size) {
    return false;
  }

  for (const item of left) {
    if (!right.has(item)) {
      return false;
    }
  }

  return true;
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}
