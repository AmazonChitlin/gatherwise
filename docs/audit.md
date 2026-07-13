# EventLocal MVP Audit

Audit date: 2026-06-22

This audit covers the MVP after prompts 1 through 11. The app builds and the core flow works. A later data-readiness cleanup added one verified Arizona TPT proof-of-concept rule, but most city/county rule content is still sample/unverified and should not be treated as official Arizona permit guidance yet.

Current status note, 2026-06-23: this audit is historical. Later tasks added verified starter rule batches for Arizona TPT, Maricopa County food guidance, Phoenix, Tempe, Mesa, Scottsdale, Glendale, Peoria, Chandler, and Gilbert, plus refined intake fields and launch QA. Use `docs/launch-coverage-qa.md`, `docs/cross-jurisdiction-qa.md`, `docs/intake-refinement.md`, `docs/source-inventory.md`, and `docs/demo-readiness.md` for the current MVP state.

## Commands Run

- `npm install`: not run because `node_modules` was already present.
- `npm run lint`: not available; no lint script exists in `package.json`.
- `npm run prisma:generate`: passed.
- `npm run prisma:migrate -- --name audit_check`: passed; database was already in sync.
- `npm run prisma:seed`: passed.
- `npm run typecheck`: passed.
- `npm test`: passed; 15 tests at audit time. Data-readiness cleanup increased this to 22 tests.
- `npm run build`: passed.
- Production smoke test with `npm run start -- -p 3001`: passed for `/`, `/intake`, `/about`, `/results`, `POST /api/intake`, and `/results?intakeId=...`.

## What Is Real

- Next.js App Router pages exist for home, intake, results, and about/disclaimer.
- Tailwind styling is active.
- Zod validates intake data on the client and server.
- Intake submissions save to SQLite through Prisma.
- Prisma schema includes jurisdictions, agencies, use cases, source-linked rule records, intake submissions, generated checklist items, and future paid-product placeholder records.
- Seed commands create jurisdictions, agencies, use cases, one verified Arizona TPT proof-of-concept rule, and remaining sample/unverified rule records.
- Rule matching is isolated in `lib/rule-engine.ts`.
- Results render matched checklist items, timeline items, red flags, agency contacts, source links, verification labels, and a visible disclaimer.
- Tests cover intake validation, rule matching, sorting, timeline formatting, verification labels, and red flags.
- README documents setup, Prisma, seed data, tests, rules, verification workflow, limitations, and future expansion points.

## What Is Placeholder Or Sample

- Most city/county seeded rule records are marked `isSample: true`, `verificationStatus: "sample_unverified"`, `lastVerified: null`, and `confidence: "low"`.
- The Arizona TPT proof-of-concept rule is marked verified using the official ADOR Transaction Privilege Tax page. Other seeded source URLs may still be broad agency homepages.
- Agency contact fields are incomplete; most sample agencies only include a URL.
- Lead times are sample planning values, not verified agency deadlines.
- The results page intentionally says `EventLocal sample results`.
- Verification messages clearly say sample items need official verification.
- The paid roadmap and vendor packet section is a disabled, non-functional future CTA.
- `FutureProductOrder` is a schema placeholder only; there is no payment processing.

## Fixes Made During Audit

- Updated stale homepage copy that still described results as placeholders.
- Updated intake page copy to describe sample-rule matching instead of future checklist generation.
- Updated about page copy to reflect the current sample-rule results flow.
- Updated `PROJECT_CONTEXT.md` to point to `lib/rule-engine.ts` and Prisma-backed seed rules instead of old scaffold files.
- Added a disclaimer to the `/results` no-intake state.
- Removed macOS `._*` sidecar files from the project directory.

## Data-Readiness Cleanup Addendum

Completed after the initial audit:

- Removed unused scaffold-era files `lib/engine.ts` and `lib/rules.ts`.
- Removed obsolete readiness/catalog types that only supported the old scaffold path.
- Added `jurisdictionCode` to `IntakeSubmission` and `RuleRecord`.
- Added normalized jurisdiction codes such as `az`, `az-maricopa`, `az-phoenix`, and `az-tempe`.
- Updated intake storage and results rehydration to use the normalized jurisdiction code.
- Hardened rule matching so casing and spacing differences do not break city, county, state, jurisdiction code, use case, or event type matching.
- Changed invalid trigger JSON to skip a rule instead of matching everything.
- Changed empty trigger objects to match nothing unless `global: true` is explicit.
- Added Zod seed validation in `prisma/seed-validation.ts`.
- Converted the Arizona TPT seed rule into one verified proof-of-concept rule using an official ADOR source URL.
- Added tests for normalized matching, empty/invalid trigger safety, global triggers, jurisdiction-code matching, and seed validation.

Deferred during cleanup:

- Prisma enum conversion remains deferred until the Postgres migration review. Seed validation now enforces allowed string values.
- No lint script was added because the project has no ESLint dependency/config yet, and TypeScript plus tests cover the current lightweight quality gate.

## Legal-Safety Review

- Pages use informational language and do not claim legal advice.
- Results use cautious labels such as `May be required`, `Confirm with agency`, and `Sample placeholder`.
- Results do not say the user is compliant.
- Results do not say EventLocal confirmed final requirements.
- The no-match state says no sample rules matched and does not imply nothing applies.
- Paid CTAs are disabled and explicitly marked as future/non-functional.

## Known Limitations Before Official Arizona Data

- Official Arizona, county, and city source pages still need human verification.
- Sample city/county rules should be replaced or supplemented with verified source-specific records before relying on results.
- `triggerFields` are stored as a JSON string for SQLite compatibility; before Postgres, consider Prisma JSON fields and provider-specific migration review.
- `verificationStatus`, `requirementLevel`, `confidence`, and `jurisdictionType` are plain strings in Prisma; consider enums during a Postgres migration.
- Some possible trigger facts exist in the engine but are not collected by the intake form yet, including signage and ticketed event.
- No lint script exists yet.
- No end-to-end browser tests exist yet.
- No admin UI, CMS, auth, payments, PDF generation, document vault, venue listings, marketplace, or consulting intake exists.

## Recommended Next Task

Before adding many official rules, continue with a small verified-source task:

- Add one verified city or county rule end-to-end with source URL, `lastVerified`, agency contact details, and tests.
- Keep sample/unverified labels visible until each source is reviewed.
- Consider adding ESLint only if the project needs a broader code-quality pass.
