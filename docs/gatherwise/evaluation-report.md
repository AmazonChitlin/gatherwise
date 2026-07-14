# Gatherwise evaluation report

Generated from `npm run eval:gatherwise` on 2026-07-14T01:57:55.690Z.

## Current snapshot

- Commit SHA: `943bfb7`
- Working tree clean during run: no
- Dataset version: `2026-07-13.1`
- Scenario count: 36
- Extraction provider: mock-fixture
- Extraction model: fixture-normalization

## What this run measured

- Extraction fixture accuracy: 99.8% across 1944 asserted fields
- Unknown detection: 28/28
- Rule ID agreement: 100.0%
- Source ID agreement: 100.0%
- Boundary agreement: 100.0%
- Reliability checks passed: 7/7

## Honest interpretation

The default offline command is a deterministic harness. It proves fixture coverage, normalization behavior, rule-trace agreement, grounding validation, and failure handling without incurring API cost. It does not claim live-model extraction quality.

Use `npm run eval:gatherwise:live` only when you intentionally want model-backed extraction metrics and have the required environment variables configured.

## Artifacts

- Machine-readable: `reports/gatherwise/latest.json`
- Human-readable: `reports/gatherwise/latest.md`

## Open limitations

- Offline extraction metrics validate fixture-driven normalization and error handling, not live model quality.
- Live evaluation is opt-in because it can incur API cost and depends on configured OpenAI credentials.
- Grounding red-team checks combine runtime citation validation with harness-only narrative audits for unsupported agencies, deadlines, thresholds, and unsupported requirement claims.
- Usability metrics are intentionally excluded from this automated report and must be gathered with real participants.
