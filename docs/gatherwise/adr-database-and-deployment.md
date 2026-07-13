# ADR: Gatherwise Data And Deployment Architecture

Date: 2026-07-13
Status: Proposed
Decision owners: Gatherwise Handshake branch

## Decision

Recommend **A. Keep the existing Prisma and SQLite architecture** for the Gatherwise Handshake branch.

Do **not** migrate the application database in this prompt.

Do **not** add a bounded Supabase subsystem in this prompt.

## Decision question

Should the Handshake branch:

- A. Keep the existing Prisma and SQLite architecture
- B. Keep the core architecture and add a bounded Supabase subsystem
- C. Migrate the application database to Supabase/Postgres

## Context from the current repository

Confirmed in the repository today:

- Prisma uses `sqlite` with `DATABASE_URL="file:./dev.db"`.
- Seeded rule data and source inventory are version-controlled.
- The primary Handshake submission route is `/showcase`.
- The app has no user accounts, auth system, billing, uploads, document vault, real-time collaboration, telemetry, or analytics integration.
- The repo has no deployment config for Vercel, Docker, Sites, or container hosting.
- Repo docs describe the current product as local-demo-oriented and explicitly defer Postgres migration review.
- Current intake submissions store structured event answers and compatibility fields; the app does not yet need cross-user data coordination.
- Current demo and evaluation guidance is based on seeded scenarios and controlled local runs.

## Actual need assessment

### Public demo accounts

No. The public Handshake showcase does not require persistent user accounts.

### Event-description storage

Not as a validated product need for this branch.

Current intake persists structured answers and event metadata for demo flow continuity, but the Handshake outcome does not require long-term retention of user-submitted event descriptions or a new free-form event archive.

### Real-time features

No. There is no real-time collaboration, chat, notifications, presence, or live multi-user editing requirement.

### Multi-user data

No validated need yet. The current branch is a recruiter/demo experience, not an organizer workspace with shared records.

### Production-safe persistence beyond SQLite

Not yet for the validated Handshake outcome.

Important nuance:

- SQLite is fine for local development, local demoing, seeded verification work, and controlled showcase review.
- SQLite is **not** enough evidence for durable serverless production writes.
- The current branch should not assume that local filesystem persistence will be durable in a generic serverless deployment.

### Stateless sample flows

Yes, and they should remain available.

The recruiter-facing `/showcase` route is already static-friendly. Sample/demo evaluation can stay seeded and mostly stateless without validating a database migration.

### Feedback collection

No implemented feedback system exists today. Feedback collection is optional future scope, not a present architectural driver.

### Evaluation data

Current evaluation is primarily synthetic, scenario-driven, and demo-generated. There is no evidence that a hosted multi-user analytics store is required to validate the current branch outcome.

### Migration risk

High relative to the value gained in this branch.

Migration would introduce:

- datasource changes
- migration review and conversion risk
- environment and secrets expansion
- new deployment assumptions
- higher test surface
- security and access-control work that is not currently required by the recruiter outcome

### Handshake timing

The Handshake branch is in a near-term submission and review phase. The current need is to show a credible product, architecture boundary, and judgment. A database migration would consume time without validating the most important current questions.

### Learning value of migration

Low for this phase.

Moving to Supabase/Postgres now would mostly validate infrastructure setup, not the product questions that the current prompt pack is prioritizing:

- can users understand the product quickly
- can they trust the evidence model
- can they interpret the rule boundary
- can a recruiter understand what was built and why it is credible

## Why option A is the right size

Option A is the smallest architecture that safely supports the currently validated outcome:

- seeded official-source data
- deterministic rule evaluation
- local/demo intake persistence
- recruiter showcase
- documentation of architecture judgment

It avoids mistaking tool availability for product need.

## Why not option B yet

Adding a bounded Supabase subsystem would increase complexity before the branch has a validated subsystem need.

It would create a hybrid persistence story without a clear boundary such as:

- accounts
- feedback inbox
- uploaded documents
- shared organizer workspaces
- public, multi-user telemetry-backed evaluation

None of those are validated requirements in this branch today.

## Why not option C yet

A full application migration to Supabase/Postgres is premature because:

- the repo is still demo-oriented
- no deployment target has been selected
- no persistent-account or shared-workspace requirement exists
- no retention-reviewed free-form event archive exists
- no RLS or public-schema design is yet needed for current user flows
- the migration would validate infrastructure more than product value

## Required guardrails while keeping SQLite

### Deployment compatibility proof

Before any public write-enabled deployment, prove one of these:

1. The deployment target provides durable filesystem-backed SQLite storage with backup support.
2. The write path is disabled and demo flows are treated as seeded/stateless.
3. The app is migrated intentionally to a hosted database after approval.

Do not imply that a generic serverless filesystem is durable for intake submissions.

### Backup or reproducible seed strategy

For the current branch, reproducible seed data is the primary recovery strategy:

- migrations are version-controlled
- `prisma/seed.ts` is version-controlled
- rule/source seed data is version-controlled

If local demo submissions matter, back up the SQLite file manually for demo environments.

### Migration discipline

- Keep Prisma migrations version-controlled.
- Keep seed data reproducible.
- Treat a Postgres move as a separate approved change set, not as incidental cleanup.

### Input validation

Continue relying on boundary validation with Zod and server-side parsing before persistence.

### Clear separation of durable vs transient data

Treat these as distinct:

- durable, reviewable seed data: jurisdictions, agencies, use cases, rules, source inventory
- transient demo-session data: intake submissions, generated results, future synthetic evaluation artifacts

## Decision outcome

For the Handshake branch, keep Prisma + SQLite.

Do not add Supabase now.

Do not migrate to Postgres now.

Revisit the database path only after Paul approves a new requirement such as:

- persistent organizer accounts
- shared multi-user event workspaces
- public hosted write durability
- long-term feedback collection
- uploads or document retention
- analytics-backed evaluation with real user data

## Consequences

### Positive

- lowest risk to current branch
- preserves current development workflow
- keeps the architecture story focused and honest
- avoids unnecessary auth/security/data-surface work
- supports recruiter evaluation of product judgment

### Negative

- write-enabled serverless deployment remains unsafe without further proof
- SQLite does not by itself establish production durability
- future hosted multi-user requirements will still require a follow-up architecture change

## Approval checkpoint

Paul should explicitly approve one of these next paths before Prompt 9:

1. Continue with SQLite for the Handshake demo and keep hosted writes constrained or disabled.
2. Open a dedicated follow-up ADR for a hosted Postgres migration when product requirements justify it.
