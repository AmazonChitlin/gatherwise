# Gatherwise EventFacts Schema

## Purpose

`EventFacts` is the canonical event representation for Gatherwise. It extends the existing intake schema instead of replacing it, so the current guided intake, stored submissions, and rule engine can keep working while we add AI-assisted extraction and confirmation flows.

## Document shape

- `schemaVersion`: version string for migration and compatibility checks
- `jurisdiction`: supported-jurisdiction snapshot at the time the facts were created
- `dateScope`: event date and recurrence context
- `locationScope`: city, county, and property-use context
- `facts`: flat list of typed facts with provenance and status metadata

## Fact contract

Each fact includes:

- `key`: existing intake field key
- `label`: human-readable label for UI grouping
- `group`: one of the UX fact groups
- `valueType`: `string`, `number`, `boolean`, `enum`, or `date`
- `value`: typed value or `null`
- `status`: `provided`, `extracted`, `confirmed`, or `unknown`
- `evidenceTextSpan`: optional text span for extraction provenance
- `internalConfidence`: optional internal confidence bucket (`high`, `medium`, `low`)
- `confirmedAt`: optional ISO timestamp for explicit user confirmation

Unknown values remain `unknown` and `null`. They are never silently converted to `false`.

## UX groups

To avoid a wall of fields, facts are grouped into:

1. Event basics
2. Place and access
3. Attendance and operations
4. Food and sales
5. Structures and equipment
6. Sound and alcohol

## User-facing states

Internal statuses map to user-facing states this way:

- `confirmed` -> Confirmed
- `provided` or `extracted` -> Needs review
- `unknown` -> Unknown

Raw extraction confidence is retained for internal use, but it is not meant to be shown as percentages in ordinary product views.

## Compatibility

Current compatibility adapters support:

- existing `IntakeInput` -> `EventFacts`
- `EventFacts` -> partial intake patch
- `EventFacts` + fallback intake -> rule-engine-compatible intake
- legacy `rawAnswers` JSON and the new stored envelope format

This lets the repository adopt canonical facts without forking the intake schema or breaking stored records.
