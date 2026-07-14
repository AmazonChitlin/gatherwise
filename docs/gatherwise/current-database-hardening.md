# Gatherwise Current Database Hardening

Date: 2026-07-13

## Scope

This hardening pass keeps the approved current architecture:

- Prisma
- SQLite
- version-controlled migrations
- reproducible seed data

It does not migrate the application database.

## What changed

### Stateless-safe demo sessions

The intake flow now supports a stateless results snapshot path.

- In production, intake persistence defaults to **off** unless `PERSIST_INTAKE_SUBMISSIONS=true` is explicitly set.
- When persistence is off, `/api/intake` returns a signed-free but structured snapshot token derived from the validated intake payload and canonical event facts.
- The results page can render from either:
  - `intakeId`
  - `snapshot`

This means public demo deployment no longer depends on unsafe writable local storage by default.

### Existing local persistence remains available

- Local/dev usage still keeps the existing Prisma + SQLite intake persistence path by default.
- Existing migrations were preserved.
- Existing seed data remains reproducible through `prisma/seed.ts`.

### Seed integrity hardening

Added integrity validation for:

- verified rule -> reviewed official source mapping
- stable source ID derivation from source inventory
- duplicate reviewed source prevention by jurisdiction + URL
- use-case integrity
- launch-jurisdiction integrity
- `rulesCreated` source completeness

### Schema versioning

The current data-layer versioning continues to rely on the canonical event-facts envelope:

- `schemaVersion`
- `intake`
- `eventFacts`

No new migration was needed for this step.

## Operational guidance

### Local development

Default local workflow remains:

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

### Production-safe demo default

For hosted demo environments, prefer:

- no writable local SQLite assumptions
- stateless intake/result snapshots
- seeded, reproducible rule/source data

If hosted write persistence is intentionally enabled later, that must be an explicit operator choice, not a default assumption.

## What this does not do

- It does not add user accounts.
- It does not add free-form raw event-description retention.
- It does not add Supabase or Postgres.
- It does not make generic serverless SQLite writes durable.

## Test coverage added

The hardening tests now cover:

- rule-source relationships
- source IDs
- schema versions
- seed completeness
- duplicate source prevention
- jurisdiction integrity
- deletion safeguards in the Prisma schema
- stateless production fallback behavior

## Follow-up boundary

Only revisit the database choice when the product actually needs one of these:

- durable hosted writes
- persistent user accounts
- multi-user workspaces
- uploads or document retention
- analytics on real user activity
