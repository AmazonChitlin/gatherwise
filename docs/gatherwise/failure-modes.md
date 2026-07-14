# Gatherwise failure modes

Date: 2026-07-13

## AI extraction disabled or misconfigured

- Current behavior:
  - extraction route returns a safe `503`
  - UI directs the user to the guided form
- User impact:
  - natural-language path unavailable
  - manual path remains usable

## AI extraction timeout

- Current behavior:
  - extraction route returns `504`
  - UI offers retry, cancel, and guided fallback
- User impact:
  - delay without data loss

## AI provider failure or malformed output

- Current behavior:
  - extraction route returns safe failure copy
  - no raw provider response is shown
- User impact:
  - natural-language path interrupted
  - manual path still available

## Invalid request media type

- Current behavior:
  - public JSON POST routes now return `415`
- User impact:
  - integration clients get a clearer boundary instead of a vague parse error

## Rate-limit exhaustion

- Current behavior:
  - public POST routes return `429`
  - responses include rate-limit metadata
- User impact:
  - short-term pause instead of runaway repeated work

## Unsupported geography

- Current behavior:
  - unsupported jurisdictions are modeled as unsupported rather than silently mapped into Arizona pilot coverage
- User impact:
  - safe refusal instead of false confidence

## Missing or contradictory event facts

- Current behavior:
  - extraction normalization preserves `unknown`
  - contradictory values collapse back to `unknown`
  - results keep uncertainty visible
- User impact:
  - fewer false deterministic conclusions

## Source citation mismatch

- Current behavior:
  - explanation validation rejects unknown source IDs and untrusted URLs
- User impact:
  - grounded explanation falls back instead of rendering unsupported citations

## Browser rendering failure

- Current behavior:
  - error boundary offers retry and guided-form recovery
  - production logging no longer includes the full runtime error object
- User impact:
  - recoverable page failure with reduced privacy exposure

## SQLite persistence mismatch with hosting assumptions

- Current behavior:
  - demo path remains stateless by default
  - persistence requires explicit enablement
- User impact:
  - safer default for the public demo
  - still requires deployment discipline if database persistence is turned on
