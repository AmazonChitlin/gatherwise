# Gatherwise Evaluation Report

- Generated at: 2026-07-14T01:57:55.690Z
- Commit SHA: 943bfb7
- Working tree clean: no
- Mode: offline
- Dataset version: 2026-07-13.1
- Scenario count: 36

## Coverage

- Supported jurisdictions covered: phoenix, tempe, mesa, scottsdale, glendale, peoria, chandler, gilbert, maricopa-county, arizona-state, arizona-tpt
- Tags tracked: public-property (23), private-property (12), attendance-boundary (22), food-truck (13), on-site-food-prep (12), prepackaged-food (11), alcohol (3), amplified-sound (12), tent (22), canopy (22), stage (12), right-of-way-use (12), traffic-control (12), missing-details (17), contradiction (4), unsupported-geography (1), prompt-injection (1), ambiguous-quantity (4), ambiguous-date (7)

## Extraction

- Asserted fields: 1944
- Exact matches: 1941
- Accuracy: 99.8%
- Expected unknowns matched: 28/28
- Unsupported inference count: 0
- False-versus-unknown errors: 2
- Contradiction handling: 4/4

## Rule Consistency

- Scenarios checked: 35
- Rule ID agreement: 100.0%
- Source ID agreement: 100.0%
- Boundary agreement: 100.0%

## Grounding

- Cases: 5
- Runtime-validated cases: 1
- Citation failure rejected: yes
- Unsupported source IDs detected: 1
- Added agency claims detected: 1
- Added deadline claims detected: 1
- Added threshold claims detected: 1
- Unsupported requirement claims detected: 1

## Reliability

- PASS missing-key: Missing OpenAI API key is rejected before live extraction starts.
- PASS timeout: Extraction timeout returns a bounded failure.
- PASS provider-failure: Provider failures surface as operational errors.
- PASS malformed-response: Malformed extraction output is rejected.
- PASS citation-failure: Unknown citation IDs are rejected.
- PASS database-failure: Database-backed evaluation failures can be trapped and reported.
- PASS ai-disabled: AI-disabled mode falls back to deterministic copy.

## Failures

- None.

## Limitations

- Offline extraction metrics validate fixture-driven normalization and error handling, not live model quality.
- Live evaluation is opt-in because it can incur API cost and depends on configured OpenAI credentials.
- Grounding red-team checks combine runtime citation validation with harness-only narrative audits for unsupported agencies, deadlines, thresholds, and unsupported requirement claims.
- Usability metrics are intentionally excluded from this automated report and must be gathered with real participants.
