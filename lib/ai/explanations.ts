import type { EventFactsDocument, EventFactFieldKey, RequirementResult } from "@/lib/event-facts";
import type { EvidenceChecklistItem } from "@/lib/rule-engine";
import { findOfficialSourceById } from "@/lib/source-records";

const DEFAULT_TIMEOUT_MS = 8_000;
const DEFAULT_MAX_OUTPUT_TOKENS = 900;

export class ExplanationConfigError extends Error {}
export class ExplanationTimeoutError extends Error {}
export class ExplanationProviderError extends Error {}
export class ExplanationMalformedOutputError extends Error {}
export class ExplanationGroundingError extends Error {}

export type ExplanationSourceRecord = {
  sourceId: string;
  title: string;
  jurisdiction: string;
  reviewDate: string | null;
  url: string;
  verifiedExcerpt: string;
};

export type ExplanationRequirementRecord = {
  resultId: string;
  title: string;
  requirementLevel: string;
  jurisdiction: string;
  ruleId: string;
  ruleVersion: string;
  sourceIds: string[];
  matchedConditions: string[];
  unknownConditions: string[];
};

export type ExplanationPacket = {
  facts: {
    key: EventFactFieldKey;
    label: string;
    value: string;
  }[];
  results: ExplanationRequirementRecord[];
  trace: RequirementResult[];
  sources: ExplanationSourceRecord[];
  knownLimitations: string[];
};

export type ExplanationResult = {
  mode: "ai" | "fallback";
  title: string;
  summary: string;
  whatWeKnow: string[];
  needsReview: string[];
  nextSteps: string[];
  citations: string[];
  sourceLinks: ExplanationSourceRecord[];
};

export type ExplanationConfig = {
  enabled: boolean;
  apiKey?: string;
  model?: string;
  timeoutMs: number;
  maxOutputTokens: number;
  requestLimit?: number;
};

export type ExplanationProviderRequest = {
  packet: ExplanationPacket;
  signal: AbortSignal;
};

type ProviderSuccess = {
  type: "success";
  title: string;
  summary: string;
  whatWeKnow: string[];
  needsReview: string[];
  nextSteps: string[];
  citations: string[];
  requirementRefs: string[];
};

type ProviderRefusal = {
  type: "refusal";
  reason: string;
};

type ProviderResult = ProviderSuccess | ProviderRefusal;

export interface GatherwiseExplanationProvider {
  readonly name: string;
  readonly model?: string;
  explain(request: ExplanationProviderRequest): Promise<ProviderResult>;
}

const systemPrompt = [
  "You explain Gatherwise deterministic event-readiness results.",
  "You may explain matched rules, organize next steps, restate uncertainty, translate official wording, compare deterministic results, and summarize evidence.",
  "You may not add a requirement, agency, fee, threshold, deadline, form, URL, approval claim, or legal advice.",
  "Use only the evidence packet you are given.",
  "Output source IDs only. Do not output URLs.",
  "Separate what we know from what needs review.",
  "Use short sentences and concrete verbs.",
  "If evidence is missing, say so plainly.",
  "Return only JSON that matches the schema."
].join(" ");

export function readExplanationConfig(
  env = process.env
): ExplanationConfig {
  return {
    enabled: env.GATHERWISE_AI_EXPLANATION_ENABLED === "true",
    apiKey: env.OPENAI_API_KEY,
    model: env.GATHERWISE_AI_EXPLANATION_MODEL,
    timeoutMs: parseInteger(
      env.GATHERWISE_AI_EXPLANATION_TIMEOUT_MS,
      DEFAULT_TIMEOUT_MS
    ),
    requestLimit: env.GATHERWISE_AI_EXPLANATION_REQUEST_LIMIT
      ? parseInteger(env.GATHERWISE_AI_EXPLANATION_REQUEST_LIMIT, 0)
      : undefined,
    maxOutputTokens: parseInteger(
      env.GATHERWISE_AI_EXPLANATION_MAX_OUTPUT_TOKENS,
      DEFAULT_MAX_OUTPUT_TOKENS
    )
  };
}

export function buildExplanationPacket(options: {
  eventFacts: EventFactsDocument;
  checklistItems: EvidenceChecklistItem[];
  requirementResults: RequirementResult[];
}) {
  const trustedSourceIds = new Set<string>();
  const sourceById = new Map<string, ExplanationSourceRecord>();

  for (const result of options.requirementResults) {
    const sourceRecord = findOfficialSourceById(result.officialSource.sourceId);

    if (
      !sourceRecord ||
      !sourceRecord.sourceUrl ||
      sourceRecord.sourceUrl !== result.officialSource.sourceUrl
    ) {
      continue;
    }

    trustedSourceIds.add(sourceRecord.id);
    sourceById.set(sourceRecord.id, {
      sourceId: sourceRecord.id,
      title: sourceRecord.sourceName,
      jurisdiction: sourceRecord.jurisdictionName,
      reviewDate: sourceRecord.lastChecked,
      url: sourceRecord.sourceUrl,
      verifiedExcerpt: sourceRecord.notes
    });
  }

  return {
    facts: options.eventFacts.facts.flatMap((fact) => {
      if (fact.status !== "confirmed" || fact.value === null) {
        return [];
      }

      return [
        {
          key: fact.key,
          label: fact.label,
          value: formatFactValue(fact.value)
        }
      ];
    }),
    results: options.checklistItems.map((item) => ({
      resultId: item.slug,
      title: item.title,
      requirementLevel: item.requirementLevel,
      jurisdiction: item.jurisdiction,
      ruleId: item.ruleId,
      ruleVersion: item.ruleVersion,
      sourceIds: item.sourceId ? [item.sourceId] : [],
      matchedConditions: item.matchedConditions.map(formatConditionLine),
      unknownConditions: item.unknownConditions.map(formatConditionLine)
    })),
    trace: options.requirementResults,
    sources: [...sourceById.values()],
    knownLimitations: [
      "Arizona pilot only.",
      "Gatherwise is informational and does not make legal determinations.",
      "Unknown details may change whether a requirement appears.",
      "Official source pages can change."
    ]
  } satisfies ExplanationPacket;
}

export function createExplanationService(options: {
  provider: GatherwiseExplanationProvider;
  config?: Partial<ExplanationConfig>;
}) {
  const baseConfig = readExplanationConfig();
  const config = { ...baseConfig, ...options.config } as ExplanationConfig;
  let requestCount = 0;

  return {
    async explain(packet: ExplanationPacket): Promise<ExplanationResult> {
      if (!config.enabled) {
        return buildDeterministicFallback(packet, "AI is disabled for this demo.");
      }

      if (
        config.requestLimit !== undefined &&
        config.requestLimit > 0 &&
        requestCount >= config.requestLimit
      ) {
        return buildDeterministicFallback(packet, "AI explanation limit reached.");
      }

      requestCount += 1;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

      try {
        const providerResult = await options.provider.explain({
          packet,
          signal: controller.signal
        });

        if (providerResult.type === "refusal") {
          return buildDeterministicFallback(packet, providerResult.reason);
        }

        const validated = validateGroundedExplanation(packet, providerResult);
        return {
          ...validated,
          mode: "ai",
          sourceLinks: validated.citations
            .map((id) => packet.sources.find((source) => source.sourceId === id))
            .filter((source): source is ExplanationSourceRecord => Boolean(source))
        };
      } catch (error) {
        if (controller.signal.aborted) {
          return buildDeterministicFallback(packet, "AI explanation timed out.");
        }

        return buildDeterministicFallback(
          packet,
          error instanceof Error ? error.message : "AI explanation failed."
        );
      } finally {
        clearTimeout(timeout);
      }
    }
  };
}

export function buildDeterministicFallback(
  packet: ExplanationPacket,
  reason: string
): ExplanationResult {
  const topResult = packet.results[0];
  const summary = topResult
    ? `${topResult.title} may apply based on the confirmed details in this event plan. Check the cited official source before you rely on it.`
    : "No verified pilot rules matched the current details. Check the official source for your city, county, venue, or state agency before you move ahead.";

  const whatWeKnow = packet.results.length
    ? packet.results.slice(0, 3).map((result) => {
        const condition = result.matchedConditions[0];
        return condition
          ? `${result.title}: ${condition}`
          : `${result.title}: deterministic rule matched this event setup.`;
      })
    : ["No deterministic pilot rule matched the current details."];

  const needsReview = packet.results.flatMap((result) =>
    result.unknownConditions.slice(0, 2).map((condition) => `${result.title}: ${condition}`)
  );

  const nextSteps = packet.results.length
    ? [
        "Start with the highest-priority requirement shown above.",
        "Check the official source for dates, forms, and exact instructions.",
        "Update any unknown event details before you rely on the result."
      ]
    : [
        "Confirm the event jurisdiction and venue details.",
        "Check the most relevant official source directly.",
        "Use the guided form to fill in missing event details."
      ];

  const citations = unique(packet.results.flatMap((result) => result.sourceIds)).slice(0, 4);

  return {
    mode: "fallback",
    title: "Grounded explanation",
    summary: `${summary} ${reason}`.trim(),
    whatWeKnow,
    needsReview:
      needsReview.length > 0
        ? needsReview
        : ["No extra review flags were found in the current deterministic result set."],
    nextSteps,
    citations,
    sourceLinks: citations
      .map((id) => packet.sources.find((source) => source.sourceId === id))
      .filter((source): source is ExplanationSourceRecord => Boolean(source))
  };
}

export function validateGroundedExplanation(
  packet: ExplanationPacket,
  result: ProviderSuccess
) {
  const trustedSourceIds = new Set(packet.sources.map((source) => source.sourceId));
  const trustedResultIds = new Set(packet.results.map((entry) => entry.resultId));

  if (containsUrl(result.summary) || result.whatWeKnow.some(containsUrl)) {
    throw new ExplanationGroundingError("AI explanation included an untrusted URL.");
  }

  for (const citation of result.citations) {
    if (!trustedSourceIds.has(citation)) {
      throw new ExplanationGroundingError("AI explanation cited an unknown source ID.");
    }
  }

  for (const resultId of result.requirementRefs) {
    if (!trustedResultIds.has(resultId)) {
      throw new ExplanationGroundingError("AI explanation referenced an unknown requirement.");
    }
  }

  const bannedPhrases = [
    "approved",
    "legal advice",
    "guaranteed",
    "compliant",
    "permit fee",
    "application fee"
  ];

  const allText = [result.summary, ...result.whatWeKnow, ...result.needsReview, ...result.nextSteps]
    .join(" ")
    .toLowerCase();

  if (bannedPhrases.some((phrase) => allText.includes(phrase))) {
    throw new ExplanationGroundingError("AI explanation used unsupported legal or approval language.");
  }

  return {
    title: result.title,
    summary: result.summary,
    whatWeKnow: result.whatWeKnow,
    needsReview: result.needsReview,
    nextSteps: result.nextSteps,
    citations: unique(result.citations)
  };
}

export function buildExplanationResponseFormat() {
  return {
    type: "json_schema" as const,
    name: "gatherwise_grounded_explanation",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      required: [
        "title",
        "summary",
        "whatWeKnow",
        "needsReview",
        "nextSteps",
        "citations",
        "requirementRefs"
      ],
      properties: {
        title: { type: "string" },
        summary: { type: "string" },
        whatWeKnow: { type: "array", items: { type: "string" } },
        needsReview: { type: "array", items: { type: "string" } },
        nextSteps: { type: "array", items: { type: "string" } },
        citations: { type: "array", items: { type: "string" } },
        requirementRefs: { type: "array", items: { type: "string" } }
      }
    }
  };
}

export function createOpenAIExplanationProvider(options?: {
  config?: Partial<ExplanationConfig>;
  fetchImpl?: typeof fetch;
}) {
  assertServerOnly();
  const config = { ...readExplanationConfig(), ...options?.config };

  if (!config.enabled) {
    throw new ExplanationConfigError("AI explanations are disabled.");
  }

  if (!config.apiKey) {
    throw new ExplanationConfigError("OPENAI_API_KEY is required.");
  }

  if (!config.model) {
    throw new ExplanationConfigError("GATHERWISE_AI_EXPLANATION_MODEL is required.");
  }

  const fetchImpl = options?.fetchImpl ?? fetch;

  return {
    name: "openai",
    model: config.model,
    async explain({ packet, signal }: ExplanationProviderRequest) {
      let response: Response;

      try {
        response = await fetchImpl("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.apiKey}`
          },
          body: JSON.stringify({
            model: config.model,
            store: false,
            max_output_tokens: config.maxOutputTokens,
            input: [
              {
                role: "system",
                content: [{ type: "input_text", text: systemPrompt }]
              },
              {
                role: "user",
                content: [
                  {
                    type: "input_text",
                    text: JSON.stringify(packet)
                  }
                ]
              }
            ],
            text: {
              format: buildExplanationResponseFormat()
            }
          }),
          signal
        });
      } catch (error) {
        if (signal.aborted) {
          throw new ExplanationTimeoutError("AI explanation timed out.");
        }

        throw new ExplanationProviderError(
          error instanceof Error ? error.message : "AI explanation failed."
        );
      }

      if (response.status === 429 || response.status >= 500) {
        throw new ExplanationProviderError(
          `AI explanation upstream failed with status ${response.status}.`
        );
      }

      if (!response.ok) {
        throw new ExplanationProviderError(
          `AI explanation request failed with status ${response.status}.`
        );
      }

      const payload = (await response.json()) as OpenAIResponsePayload;
      return parseOpenAIExplanationPayload(payload);
    }
  } satisfies GatherwiseExplanationProvider;
}

export class MockExplanationProvider implements GatherwiseExplanationProvider {
  readonly name = "mock";
  readonly model = "mock-model";

  constructor(
    private readonly result:
      | ProviderResult
      | Error
      | ((request: ExplanationProviderRequest) => Promise<ProviderResult>)
  ) {}

  async explain(request: ExplanationProviderRequest) {
    if (this.result instanceof Error) {
      throw this.result;
    }

    if (typeof this.result === "function") {
      return this.result(request);
    }

    return this.result;
  }
}

type OpenAIResponsePayload = {
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
};

function parseOpenAIExplanationPayload(payload: OpenAIResponsePayload): ProviderResult {
  const text = payload.output
    ?.flatMap((item) => item.content ?? [])
    .find((item) => item.type === "output_text" && item.text)?.text;

  if (!text) {
    throw new ExplanationMalformedOutputError("AI explanation returned no text.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ExplanationMalformedOutputError("AI explanation returned invalid JSON.");
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("summary" in parsed) ||
    !("citations" in parsed)
  ) {
    throw new ExplanationMalformedOutputError("AI explanation response shape was invalid.");
  }

  return parsed as ProviderSuccess;
}

function formatConditionLine(condition: ExplanationRequirementRecord["matchedConditions"][number] | EvidenceChecklistItem["matchedConditions"][number]) {
  if (typeof condition === "string") {
    return condition;
  }

  return `${condition.label}: expected ${condition.expected}; actual ${condition.actual}.`;
}

function formatFactValue(value: string | number | boolean) {
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

function parseInteger(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function containsUrl(value: string) {
  return /https?:\/\//i.test(value);
}

function assertServerOnly() {
  if (typeof window !== "undefined") {
    throw new Error("Gatherwise AI explanation providers must remain server-only.");
  }
}
