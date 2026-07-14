# Gatherwise security review

Date: 2026-07-13
Branch: `showcase/gatherwise-handshake`

## Focus areas

- raw event-description handling
- AI boundary protection
- request throttling
- client/server secret boundaries
- source validation
- stateless demo behavior
- dependency and database posture

## Fixed in this pass

### Request throttling

- Added in-memory per-client rate limiting for:
  - `POST /api/intake/extract`
  - `POST /api/intake`
  - `POST /api/results/simulate`
- Responses now include `Cache-Control: no-store` and rate-limit metadata headers.

### Safer request parsing

- Added guarded JSON parsing with explicit content-type validation.
- Invalid media types now return `415` instead of collapsing into generic parse failures.

### Safer production logging

- The client error boundary no longer logs the full runtime error object in production.
- Extraction logging remains metadata-only and does not include raw event descriptions, prompts, or responses.

### Trusted source lookup path

- Replaced repeated source-inventory scans with validated lookup helpers backed by cached maps.
- Official source IDs still remain constrained to the repository-controlled inventory.

## Verified boundaries

- `OPENAI_API_KEY` is only read from server-side configuration paths.
- No client component reads service credentials.
- No arbitrary model URL configuration exists; the provider targets the OpenAI Responses API directly.
- Explanation validation still rejects unknown citation IDs and untrusted URLs.
- Demo mode remains stateless by default unless persistence is explicitly enabled.
- The chosen SQLite architecture still avoids introducing public write policies or exposed database admin credentials.

## Dependency review

- `npm audit --omit=dev --json` reported:
  - total production vulnerabilities: `0`
  - high/critical production vulnerabilities: `0`

## Database review

Architecture remains Prisma + SQLite, consistent with the approved ADR.

Current posture:

- acceptable for the bounded Arizona pilot demo path
- safe when demo sessions remain stateless by default
- still not evidence of durable writable storage for a generic serverless filesystem

No schema or migration changes were required in this pass.

## Residual risks

- Rate limiting is process-local memory, which is acceptable for this branch but not a distributed production control.
- The public intake endpoint still allows optional database persistence when explicitly enabled; deployment must keep that setting aligned with the retention plan.
- Official-source trust is inventory-backed, but source freshness still depends on disciplined review dates and seed maintenance.
- AI extraction remains an external dependency when enabled, so operational limits still depend on upstream availability and local timeout handling.

## Release assessment

No release-blocking secret leakage or raw-description logging issue remained after this pass.
