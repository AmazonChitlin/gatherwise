# EventLocal Project Context

EventLocal is a Next.js website MVP for local event readiness.

Brand:

- Name: EventLocal
- Tagline: Ready. Set. Local.
- Core message: Get your local event ready before you set up.
- Original working concept: PopUpPermitAZ

EventLocal helps local vendors, food trucks, artists, pop-up businesses, small event organizers, venues, and market hosts understand what permits, licenses, deadlines, documents, contacts, and red flags may apply before they sell, vend, serve food, host, gather, or promote a local event.

EventLocal is not a legal service. It does not submit permits. It does not make legal conclusions. It gives plain-English informational guidance based on structured rule records and user intake.

Current MVP status: EventLocal has verified starter rule coverage for Arizona TPT, Maricopa County food guidance, Phoenix, Tempe, Mesa, Scottsdale, Glendale, Peoria, Chandler, and Gilbert. The source inventory still contains research gaps, and the product does not include payments, auth, PDFs, admin UI, dashboards, uploads, subscriptions, venue listings, marketplace features, or consulting intake.

## Required Language

- Use `likely required`, `may be required`, and `confirm with the agency`.
- Do not say a permit is definitely required unless the rule record explicitly supports that wording.
- Every results page must include an informational disclaimer.
- Every checklist item should link to an official source when possible.

## Initial Geography

- Phoenix
- Tempe
- Mesa
- Scottsdale
- Glendale
- Peoria
- Chandler
- Gilbert
- Maricopa County
- Arizona state-level/TPT rules

## Initial Use Cases

- Retail vendor booth
- Food truck or temporary food vendor
- Small outdoor music/art event
- Multi-vendor market
- Private-property parking lot event
- Pop-up venue/host readiness

## Architecture Rules

- Keep UI, validation, rule matching, and data access separated.
- Keep reusable domain types in `lib/types.ts`.
- Keep intake validation in `lib/schemas.ts`.
- Keep checklist matching in `lib/rule-engine.ts`.
- Keep source-linked rules in Prisma-backed `RuleRecord` rows seeded from `prisma/seed-data/rules.ts`.
- Rule matching should evaluate structured trigger fields, not one-off page conditionals.
- Do not build auth, payments, dashboards, uploads, or listings until a later focused task asks for them.

## Rule Records

Rule records should support:

- `id`
- `title`
- `plain_english_summary`
- `jurisdiction`
- `jurisdiction_type`
- `city`
- `county`
- `state`
- `use_case`
- `requirement_level`
- `source_url`
- `source_name`
- `last_verified`
- `confidence`
- `lead_time_days`
- `agency_name`
- `agency_phone`
- `agency_email`
- `agency_url`
- `trigger_fields`

Trigger fields are structured data and may include city, event type, food service, food truck, retail sales, alcohol, amplified sound, public/private property, sidewalk or street closure, attendance, vendor count, temporary structure, generator use, open flame, signage, ticketing, multi-vendor status, and recurring event status.
