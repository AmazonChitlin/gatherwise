# Gatherwise Rule Engine Integration

## Scope

Prompt 12 connects canonical `EventFacts` documents to the existing deterministic rule engine without moving rule authority into AI.

## Authority Boundary

- `EventFacts` provide the structured input surface.
- The deterministic rule engine remains the only authority for triggered requirements, agencies, planning lead times, and official source selection.
- AI is not used to decide applicability at this stage.

## Flow

1. Intake or snapshot data is normalized into an `EventFactsDocument`.
2. Stored `provided` facts are promoted to `confirmed` for results rendering because the user entered them directly.
3. `eventFactsToRuleEngineFacts()` derives the normalized trigger facts used by the existing rule engine.
4. `matchRulesToEventFacts()` evaluates each active rule with a three-state trace:
   - `matched`
   - `unknown`
   - `failed`
5. A rule is included in results when it has no failed conditions and at least one relevant trigger. This keeps deterministic coverage while surfacing uncertainty instead of silently suppressing possible requirements.

## Evaluation Trace

Each evidence-backed result now captures:

- Rule ID
- Rule version token derived from the persisted rule record timestamp
- Jurisdiction code
- Relevant fact keys
- Matched conditions
- Unknown conditions
- Source IDs
- Evaluation timestamp
- Known uncertainty labels

## Source Mapping

- Source IDs are resolved from the reviewed official source inventory using `jurisdictionCode + sourceUrl`.
- Missing source IDs are preserved as `null` rather than fabricated.

## Result Semantics

- Matched conditions explain why a result appeared.
- Unknown conditions explain which missing facts could still change the result.
- Unsupported jurisdictions stop at the boundary instead of presenting guessed guidance.

## Tests

Coverage added in Prompt 12 includes:

- Evidence-trace regression tests for matched and unknown conditions
- Requirement-result serialization tests for source IDs and timestamps
- Results-route assertions for the Evidence Trail hierarchy and status language
