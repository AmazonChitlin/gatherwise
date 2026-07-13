# Gatherwise MVP

Gatherwise is a Next.js MVP for local event readiness.

Brand:

- Name: Gatherwise
- Tagline: Ready. Set. Local.
- Core message: Get your local event ready before you set up.

Gatherwise helps vendors, food trucks, artists, pop-up businesses, small event organizers, venues, and market hosts understand what permits, licenses, deadlines, documents, contacts, and red flags may apply before a local event.

## What Gatherwise Does

- Collects practical intake details about a local event.
- Saves intake submissions to a local SQLite database.
- Matches intake answers against source-linked rule records.
- Displays a basic checklist, timeline, red flags, agency contacts, and official source links.
- Uses cautious wording: `Likely required`, `May be required`, and `Confirm with agency`.

## What Gatherwise Does Not Do

- Gatherwise is not legal advice.
- Gatherwise does not submit permits.
- Gatherwise does not guarantee compliance.
- Gatherwise does not confirm final legal requirements.
- Gatherwise does not replace the relevant agency.
- Users should confirm requirements, deadlines, fees, forms, and final instructions with the relevant agency.

Disclaimer language used in the app: **Informational guidance only, not legal advice.**

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Zod
- Prisma
- SQLite for local development
- Node test runner through `tsx --test`

## Local Setup

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Open `http://localhost:3000`.

## Common Commands

Development server:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

Typecheck:

```bash
npm run typecheck
```

Production build:

```bash
npm run build
```

## Demo Readiness

Before showing the MVP, review `docs/demo-readiness.md` for local setup steps,
recommended demo scenarios, known limitations, and claims to avoid.

## Prisma And Data Setup

Local development uses SQLite through:

```bash
DATABASE_URL="file:./dev.db"
```

Create or apply migrations:

```bash
npm run prisma:migrate
```

Reset the local database:

```bash
npm run prisma:reset
```

Seed data:

```bash
npm run prisma:seed
```

Seed data lives in `prisma/seed-data/rules.ts`. The seed importer lives in `prisma/seed.ts`.

Current user-facing seed rules are verified starter records for Arizona TPT, Maricopa County food guidance, and the launch-city batches. Source inventory records still include research gaps and inventory-only pages that should not be treated as checklist rules until converted.

## Project Structure

- `app/`: App Router pages and API routes.
- `components/`: Reusable UI components.
- `lib/config.ts`: City, county, use-case, event-type, property, and recurrence options.
- `lib/schemas.ts`: Zod intake validation.
- `lib/prisma.ts`: Prisma client setup.
- `lib/rule-engine.ts`: Isolated rule matching and checklist generation.
- `lib/results-helpers.ts`: Results formatting, grouping, timeline, and red flag helpers.
- `lib/future-products.ts`: Non-functional future paid product copy.
- `lib/types.ts`: Shared domain types.
- `prisma/schema.prisma`: Database schema.
- `prisma/seed-data/rules.ts`: Readable seed catalog.
- `tests/`: Fast unit tests.
- `PROJECT_CONTEXT.md`: Stable product and architecture context.

## Data Model

The Prisma schema includes:

- `Jurisdiction`: city, county, and state-level geography.
- `Agency`: agency contact details connected to jurisdictions.
- `UseCase`: MVP event/use-case categories.
- `RuleRecord`: source-linked rules with structured trigger fields.
- `IntakeSubmission`: saved user intake answers.
- `GeneratedChecklistItem`: future persisted generated checklist rows.
- `FutureProductOrder`: placeholder for future paid products without payment processing.

## Intake Flow

The intake form collects:

- City and county
- Use case and event type
- Public/private property or venue type
- Expected attendance and vendor count
- Event date
- One-time or recurring status
- Food service, food truck, retail sales, alcohol, amplified sound
- Temporary structures, generator use, open flame
- Street, sidewalk, or parking impacts
- Refined optional details for food handling, alcohol, temporary structures, traffic, signage/promotion, and park/property use

Validation lives in `lib/schemas.ts` and uses Zod. The browser validates before submit, and `app/api/intake/route.ts` validates again on the server before saving.

Valid submissions are saved to `IntakeSubmission`. The API returns an `intakeId`, and the user is routed to:

```text
/results?intakeId=...
```

The intake form does not show permit conclusions.

## Rule Engine Overview

Rule matching lives in `lib/rule-engine.ts`. UI components and page components should not contain city-specific permit logic.

The engine:

- Accepts a validated intake object.
- Loads active rule records from Prisma.
- Parses each rule's structured `triggerFields`.
- Compares trigger fields against normalized intake facts.
- Excludes non-matching rules.
- Returns checklist items with requirement level, source URL, jurisdiction, lead time, confidence, and agency info.
- Sorts by requirement urgency, lead time, jurisdiction type, confidence, and title.

Supported trigger examples include:

- `jurisdiction_code`
- `city`
- `county`
- `state`
- `use_case`
- `event_type`
- `food_service`
- `food_truck`
- `retail_sales`
- `alcohol`
- `amplified_sound`
- `public_property`
- `private_property`
- `vendor_count_min`
- `expected_attendance_min`
- `temporary_structure`
- `generator_use`
- `open_flame`
- `multi_vendor_event`
- `recurring_event`

String trigger comparisons are normalized for casing and spacing before matching. For example, `Phoenix`, `phoenix`, and ` PHOENIX ` compare the same. Empty trigger objects do not match any intake unless a rule explicitly sets `global: true`. Invalid trigger JSON is skipped by the rule engine instead of matching every result.

## Results Page Overview

The results page:

- Loads the saved intake by `intakeId`.
- Calls the rule engine.
- Shows the event summary.
- Shows matched checklist items grouped by jurisdiction.
- Shows a timeline based on `leadTimeDays`.
- Shows red flags.
- Shows agency contacts.
- Shows official source links.
- Shows the visible disclaimer.
- Shows a disabled CTA for future paid products.

The results page does not claim Gatherwise has confirmed legal requirements. It does not say the user is compliant.

## Adding Future Jurisdictions

To add a future jurisdiction:

1. Add the city/county/state option to `lib/config.ts` if users should select it in intake.
2. Assign a normalized `jurisdictionCode`, such as `az`, `az-maricopa`, or `az-phoenix`.
3. Add jurisdiction details to seed rules in `prisma/seed-data/rules.ts`.
4. Use the same normalized code in `jurisdiction.code` and, when useful, in `triggers.jurisdiction_code`.
5. Run `npm run prisma:seed`.

Adding a jurisdiction should not require changing UI page logic.

## Adding Future Rules

Seed rules live in `prisma/seed-data/rules.ts`.

Review official source inventory records before adding rules. Source inventory lives in `prisma/seed-data/source-inventory.ts` and is documented in `docs/source-inventory.md`. Source inventory records are not checklist rules; they are the review queue for official pages that may later become rule records.

To add a rule, add one object to `ruleSeedData` with:

- `jurisdiction`: name, type, stable code, city/county/state.
- `agency`: agency name plus phone, email, or URL if known.
- `source`: official source name and URL.
- `lastVerified`: date string like `2026-06-23`, or `null` if not verified.
- `confidence`: `low`, `medium`, or `high`.
- `triggers`: structured trigger fields.
- `leadTimeDays`: suggested planning lead time.
- `plainEnglishSummary`: practical wording for users.
- `requirementLevel`: `likely required`, `may be required`, or `confirm with the agency`.
- `isSample`: `true` for sample/unverified rules.
- `verificationStatus`: `verified` for source-checked rules, `sample_unverified` for placeholders, or `needs_review` for rule candidates that need more review.
- `adminNote`: internal notes for future source verification.

Seed rules are validated with Zod in `prisma/seed-validation.ts` before they are inserted. Validation catches missing source URLs, missing requirement levels, missing jurisdictions, missing sample/verification status, unsupported trigger keys, and empty trigger objects unless `global: true` is set.

Adding a normal rule should not require changing the rule engine, UI components, or page logic. Only update `lib/types.ts`, `prisma/seed-validation.ts`, and `lib/rule-engine.ts` when adding a brand-new trigger type the engine does not understand yet.

## Official Source Inventory

The official source inventory is config-backed, not database-backed. It tracks source IDs, jurisdiction codes, agencies, URLs, source categories, use-case relevance, notes, verification status, last checked dates, official-source status, and whether rules have been created.

Missing sources are tracked with `verificationStatus: "needs_research"`, `sourceUrl: null`, and `isOfficial: false`. This keeps research gaps visible without pretending a source is verified.

Source records validate through `prisma/source-inventory-validation.ts` and related tests. A future admin workflow or CMS can move this inventory into the database; no migration was added for this task.

## Source Verification Workflow

Gatherwise does not scrape government websites and does not automatically refresh source data. Rule verification is intentionally lightweight for the MVP.

Each `RuleRecord` supports:

- `sourceUrl`: official source link when available.
- `sourceName`: readable source name shown to users.
- `lastVerified`: the date a human checked the official source, or `null`.
- `confidence`: `low`, `medium`, or `high`.
- `isSample`: `true` when the rule is placeholder/sample data.
- `verificationStatus`: source review state.
- `notes`: internal verification notes from seed `adminNote`.
- Agency contact fields: `agencyName`, `agencyPhone`, `agencyEmail`, and `agencyUrl`.

Use these verification statuses:

- `sample_unverified`: placeholder data used for MVP testing. Keep `isSample: true` and `lastVerified: null`.
- `needs_review`: a real rule candidate that still needs human review or has stale/incomplete source details.
- `verified`: a human checked the official source. Set `isSample: false` and update `lastVerified`.
- `inactive`: exclude a rule from matching without deleting it.

To mark a sample rule, use:

```ts
isSample: true,
verificationStatus: "sample_unverified",
lastVerified: null,
confidence: "low",
adminNote: "Sample/unverified seed data for schema development only."
```

To mark a rule verified, only do so after a human checks the official source:

```ts
isSample: false,
verificationStatus: "verified",
lastVerified: "2026-06-23"
```

Confidence should describe source clarity, not legal certainty:

- `low`: sample data, uncertain interpretation, missing agency confirmation, or incomplete source details.
- `medium`: official source reviewed, but details may vary by event facts or agency interpretation.
- `high`: official source is current and clearly supports the plain-English guidance. Users still need to confirm with the agency.

The results page labels sample or unverified items in plain English. Sample items show: `This item is based on sample data and needs official verification.` All verification states remind users to confirm with the listed agency before relying on the guidance.

## Tests

Run:

```bash
npm test
```

Current tests cover:

- Intake validation.
- Readable validation errors.
- Rule matching by city and food involvement.
- Excluding non-matching rules.
- Normalized trigger matching and invalid/empty trigger safety.
- Seed rule validation.
- Lead-time sorting.
- Results helper formatting for timelines, grouping, confidence, requirement labels, verification labels, and red flags.

Not covered yet:

- End-to-end browser flows.
- Visual regression testing.
- Payment behavior.
- Authentication.
- PDF or file generation.
- Full coverage of every possible trigger field.

## MVP Audit And QA

The original post-scaffold audit lives in `docs/audit.md`. Later QA passes supersede parts of that historical audit as verified Arizona, Maricopa County, and launch-city rule batches were added.

Current QA and demo docs:

- `docs/source-inventory.md`: official source inventory and remaining research gaps.
- `docs/intake-refinement.md`: refined intake fields and active/future-facing triggers.
- `docs/cross-jurisdiction-qa.md`: city/county/state stacking checks.
- `docs/launch-coverage-qa.md`: launch scenario coverage by jurisdiction and use case.
- `docs/demo-readiness.md`: local demo checklist, scenarios, limitations, and what not to claim.
- `docs/ux-playbook.md`: UX direction for homepage, intake, results, trust language, visual patterns, and future paid messaging.

## Data-Readiness Cleanup

The data-readiness cleanup removed unused scaffold-era rule files, added normalized jurisdiction codes to intake submissions and rule records, hardened rule matching, and added Zod validation for seed rule data.

The current jurisdiction code pattern is:

- `az` for Arizona state-level rules.
- `az-maricopa` for Maricopa County rules.
- `az-phoenix`, `az-tempe`, and similar city-level codes for city rules.

Prisma enum conversion was deferred. The schema still stores values such as `requirementLevel`, `confidence`, `jurisdictionType`, and `verificationStatus` as strings for SQLite simplicity, while seed validation enforces allowed values. Revisit Prisma enums during the Postgres migration review.

No lint script was added yet because the project does not currently include ESLint dependencies or config, and this cleanup did not justify a tooling detour. TypeScript and tests remain the active local checks.

Verified starter rule coverage now exists for Arizona TPT, Maricopa County food guidance, Phoenix, Tempe, Mesa, Scottsdale, Glendale, Peoria, Chandler, and Gilbert. Remaining source gaps are tracked in `docs/source-inventory.md`.

## Current MVP Limitations

- Rule coverage is still starter coverage, not a complete permit map.
- Source data is not scraped or automatically refreshed.
- Results are only as good as the current verified seed rule records and source review notes.
- Some refined intake fields are collected before verified rules use them directly.
- No admin UI exists for editing rules.
- No user accounts exist.
- No payments exist.
- No generated PDFs or downloadable files exist.
- No document upload or vault exists.
- No venue listing system exists.
- No marketplace or referral workflow exists.

## Future Expansion Points

These are intentional extension seams, not built features:

- Additional cities: add intake options in `lib/config.ts`, seed jurisdiction/rule records in `prisma/seed-data/rules.ts`, and avoid city-specific logic in pages.
- Additional counties: add county options and county-level rule records with `jurisdiction.type: "county"` and county trigger fields.
- Other states: widen the state typing in `lib/config.ts`, add state-level seed data, review validation defaults, and update `DATABASE_URL` only when changing database providers.
- Paid downloadable roadmap: expand `lib/future-products.ts` and results-page CTA only when payment and document generation are intentionally added.
- Vendor packet: keep future packet content derived from matched checklist items, agency contacts, timelines, and document prep notes.
- Organizer subscription: add auth, billing, and account models only when subscription work is explicitly scoped.
- Vendor document vault: add file storage, permissions, and document metadata only when upload/storage requirements are defined.
- Venue listings: add listing models and public pages only after venue data ownership, moderation, and source rules are defined.
- Referral or lead-generation marketplace: add consent, tracking, partner records, and compliance review before any lead flow is built.
- Done-with-you consulting intake: add a separate consulting request flow only when human follow-up operations are ready.
- Postgres migration: the Prisma schema is designed to move from SQLite to Postgres with a datasource change and migration review, not a rewrite.

## Future Revenue Features Not Yet Built

These are planned possibilities, not live features:

- Paid downloadable event roadmap.
- Paid vendor packet.
- Organizer subscription.
- Vendor document vault.
- Venue listings.
- Referral or lead-generation marketplace.
- Done-with-you consulting intake.

The current results page includes a disabled placeholder CTA for future roadmap and vendor packet products. It does not process payment and does not generate files.
