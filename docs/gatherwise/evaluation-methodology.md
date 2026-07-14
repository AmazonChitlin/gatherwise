# Gatherwise evaluation methodology

## Purpose

This harness gives the Gatherwise branch a repeatable way to evaluate four technical areas without charging the default workflow against an API:

- structured event-fact extraction normalization
- deterministic rule consistency
- grounded explanation safeguards
- reliability and fallback behavior

Usability remains a separate research track. Do not merge participant observations into the automated score.

## Dataset

- Dataset file: `lib/evaluation/gatherwise-dataset.ts`
- Current dataset version: `2026-07-13.1`
- Scenario count: 36
- Inputs: synthetic Arizona pilot event descriptions plus one unsupported-geography case

The dataset intentionally covers:

- every supported jurisdiction in the repository
- public and private property
- attendance boundaries
- food trucks
- on-site food preparation
- prepackaged food
- alcohol
- amplified sound
- tents and canopies
- stages
- right-of-way use
- traffic control
- missing details
- contradictions
- unsupported geography
- prompt injection
- ambiguous quantities
- ambiguous dates

## Modes

### Offline: `npm run eval:gatherwise`

The default command uses fixture-driven mock extraction results. This keeps the run free, fast, deterministic, and suitable for CI or local regression checks.

What offline mode does validate:

- field normalization against the current schema
- unknown preservation
- contradiction handling
- rule-engine agreement between ground-truth and extracted facts
- source-ID agreement
- grounding validator behavior
- fallback and failure paths

What offline mode does not validate:

- live model extraction quality
- latency or provider drift in OpenAI responses
- real-world user behavior

### Live: `npm run eval:gatherwise:live`

Live mode is opt-in. It uses the configured OpenAI extraction provider and may incur API cost. Run it only when you want real model comparisons against the synthetic gold dataset.

Required environment expectations:

- `GATHERWISE_AI_EXTRACTION_ENABLED=true`
- `OPENAI_API_KEY`
- `GATHERWISE_AI_MODEL`

The harness also records the model configuration in the output report so a result can be reproduced or challenged later.

## Metrics

### Extraction

- Per-field match: exact equality between expected fixture value and normalized extraction output
- Unknown detection: expected unknown fields that remain unknown after normalization
- Unsupported inference count: fields the extractor marked as extracted even though the gold fixture marked them unknown
- False-versus-unknown errors: boolean fields expected to be false but returned as unknown
- Contradiction handling: scenarios where conflicting candidates collapse back to unknown with ambiguity notes

### Rule consistency

The harness compares:

- confirmed manual EventFacts
- extracted-and-confirmed EventFacts derived from the same base scenario

It records:

- rule-ID agreement
- source-ID agreement
- jurisdiction boundary agreement

### Grounding

Grounding checks use two layers:

1. Runtime validator checks for trusted source IDs, trusted requirement references, and banned unsupported language.
2. A red-team narrative audit checks that the harness can detect added agency claims, added deadlines, added thresholds, and unsupported requirement claims in synthetic explanation text.

This is intentionally honest: the second layer is evaluation logic, not yet a fully structured production parser.

### Reliability

The harness probes:

- missing configuration
- timeout
- provider failure
- malformed extraction output
- citation failure
- database failure reporting
- AI-disabled fallback behavior

## Output artifacts

- Machine-readable: `reports/gatherwise/latest.json`
- Human-readable: `reports/gatherwise/latest.md`
- Docs snapshot: `docs/gatherwise/evaluation-report.md`

Each report includes:

- timestamp
- commit SHA
- working-tree cleanliness
- dataset version
- model configuration
- failures
- limitations

## Interpretation rules

- Do not surface these metrics in the public UI as proof of product success.
- Do not treat offline fixture accuracy as live-model accuracy.
- Keep usability findings separate and evidence-based.
- Update the dataset version whenever scenario meaning changes in a way that could affect comparisons over time.
