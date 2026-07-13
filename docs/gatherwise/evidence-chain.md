# Gatherwise Evidence Chain

## Canonical chain

Gatherwise traces readiness results through this typed chain:

`EventFact -> RuleEvaluation -> RequirementResult -> OfficialSource`

## EventFact

Represents a single structured event detail, including:

- current typed value
- provenance status
- optional evidence span
- optional internal extraction confidence
- confirmation timestamp when applicable

## RuleEvaluation

Represents deterministic evaluation metadata:

- `ruleId`
- `ruleVersion`
- `relevantFactKeys`
- `jurisdictionCode`
- `knownUncertainty`

This is the boundary between facts and a rule conclusion. The rule layer should remain deterministic.

## RequirementResult

Represents the user-facing requirement output tied back to:

- one rule evaluation
- one official source record
- the applicable jurisdiction
- known uncertainty notes

## OfficialSource

Represents the source anchor for a result:

- `sourceId`
- `sourceName`
- `sourceUrl`
- `reviewDate`
- jurisdiction name and type

## Current repository bridge

The repository now includes a compatibility adapter that converts current `ChecklistItem` results into typed `RequirementResult` traces. This preserves source metadata already returned by the rule engine while making the path traceable enough for future evidence UIs.

## Trust guardrails

- Unsupported jurisdictions should remain unsupported, not guessed.
- Missing facts should stay visible as uncertainty.
- Results should point back to relevant facts and source review dates.
- AI explanation should sit after verified rule evaluation, not replace it.
