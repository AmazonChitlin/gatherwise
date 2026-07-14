# Gatherwise Release Audit

Date: July 13, 2026  
Branch: `showcase/gatherwise-handshake`  
Audit baseline commit: `c01aa32 chore: harden Gatherwise showcase`

## Scope

This audit focused on release readiness for the Handshake submission package, not new feature work. Checks were run against a clean-room clone at `/tmp/gatherwise-release-audit` to avoid relying on an already-prepared local workspace.

## Clean-Environment Verification

- Repository cloned cleanly from the branch under audit.
- `.env.example` copied to `.env`.
- `npm ci` passed.
- `npm run prisma:generate` passed.
- `npx prisma migrate deploy` passed and applied all checked-in migrations.
- `npm run prisma:seed` passed.

## Repository-Defined Checks

- `npm run typecheck`: passed
- `npm test`: passed, 207 tests total
- `npm run eval:gatherwise`: passed
- `npm run build`: passed
- `npm start`: passed on `http://localhost:3100`

## Evaluation Snapshot

Source: `/tmp/gatherwise-release-audit/reports/gatherwise/latest.json`

- Mode: offline
- Dataset version: `2026-07-13.1`
- Scenarios: 36
- Extraction: 1941 exact matches out of 1944 asserted fields
- Unknown preservation: 28/28
- Rule/source/boundary agreement: 35/35 checked scenarios
- Reliability checks: 7/7 passed
- Harness failures: 0

## Production Smoke Results

- `GET /showcase`: 200
- `GET /intake`: 200
- `GET /sources`: 200
- `/showcase` rendered the recruiter hero, Arizona pilot label, primary CTA, and architecture section.
- `/intake` rendered the two-path start with a recommended describe path and manual fallback.
- The guided fictional demo produced a production results page with the Readiness Route, Evidence Trail, and official source link affordances.
- The extraction API returned the expected deterministic fallback message when AI extraction was disabled in the audit environment.
- Browser console inspection on the audited public paths showed no warnings or errors during the sampled checks.
- Sampled production server logs remained clean during the audit run.

## Accessibility Status

- Skip links are present in server-rendered output.
- Reduced-motion support is implemented in `app/globals.css` and covered by `tests/readiness-route-ui.test.ts`.
- Public demo controls use large touch targets in the rendered UI.
- Production smoke checks did not surface console accessibility warnings.
- Manual keyboard and assistive-technology coverage is improved but still lighter than a full browser-matrix accessibility audit.

## Security and Privacy Status

- No raw event-description logging was introduced in the audited branch.
- AI configuration remains server-side only.
- Public intake extraction fails safely when AI is disabled.
- No client-side service credentials were found in the audited code paths.
- No skipped or disabled tests were found.
- No evidence of fake success metrics in the shipped UI was found.

## Scans

- Old-brand scan: no blocking user-facing EventLocal branding remains on the current public Gatherwise experience, but some internal code symbols, CSS class names, and historical docs still use `EventLocal`.
- Placeholder scan: only legitimate form placeholders and intentionally labeled internal placeholder states were found.
- Disabled-test scan: none found.
- Client-side AI import scan: only type-only imports appear in client code; live provider logic remains server-side.
- Secret scan: no hard-coded production secrets found in tracked source files.

## Findings

One release-facing documentation issue was found during the clean-room audit:

- `npm run prisma:migrate` was not the reproducible setup path for a clean environment.
- `npx prisma migrate deploy` succeeded and is now the documented deployment path.

No application-code release blockers were discovered in this audit pass.
