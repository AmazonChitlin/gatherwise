# Gatherwise

Gatherwise is a source-grounded event-readiness application for organizers, vendors, venues, and recruiters reviewing the Handshake showcase project.

Brand:

- Product: Gatherwise
- Tagline: Ready. Set. Local.
- Subtitle: AI-powered event readiness for organizers, vendors, and venues
- Scope: Arizona pilot

## Product Overview

Gatherwise helps a user move from messy event details to a source-backed readiness summary without pretending to make a legal determination.

The current branch supports:

- a guided intake path
- a natural-language extraction path with human review
- deterministic rule evaluation
- official-source linking
- grounded explanation with deterministic fallback
- the Readiness Route
- the Event Change Simulator
- public fictional demo scenarios
- a recruiter-facing `/showcase` route

## Architecture

The application keeps a clear authority boundary:

1. A user describes an event or completes the guided form.
2. AI may extract structured event facts from natural language.
3. The user reviews or edits those facts.
4. Deterministic rules decide which requirements may apply.
5. Official source records provide the trusted evidence layer.
6. AI may explain the verified result, but it does not invent rules, agencies, thresholds, fees, or deadlines.

Core implementation areas:

- `app/`: Next.js App Router routes and API endpoints
- `components/`: shared UI, intake experience, and readiness route
- `lib/event-facts.ts`: canonical event-facts model and evidence chain helpers
- `lib/rule-engine.ts`: deterministic rule matching and evidence-aware results
- `lib/ai/extraction.ts`: structured event-fact extraction provider
- `lib/ai/explanations.ts`: grounded explanation provider and fallback
- `lib/readiness-route.ts`: route and change-simulator logic
- `prisma/`: Prisma schema, migrations, and seed data

## Setup

```bash
npm install
cp .env.example .env
npm run prisma:generate
npx prisma migrate deploy
npm run prisma:seed
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Configured in `.env.example`:

```bash
DATABASE_URL="file:./dev.db"
PERSIST_INTAKE_SUBMISSIONS="true"
GATHERWISE_AI_EXTRACTION_ENABLED="false"
OPENAI_API_KEY=""
GATHERWISE_AI_MODEL=""
GATHERWISE_AI_TIMEOUT_MS="8000"
GATHERWISE_AI_MAX_INPUT_CHARS="4000"
GATHERWISE_AI_REQUEST_LIMIT="25"
GATHERWISE_AI_MAX_OUTPUT_TOKENS="1200"
GATHERWISE_AI_EXPLANATION_ENABLED="false"
GATHERWISE_AI_EXPLANATION_MODEL=""
GATHERWISE_AI_EXPLANATION_TIMEOUT_MS="8000"
GATHERWISE_AI_EXPLANATION_REQUEST_LIMIT="25"
GATHERWISE_AI_EXPLANATION_MAX_OUTPUT_TOKENS="900"
```

Notes:

- `OPENAI_API_KEY` is server-side only.
- AI can be fully disabled and the manual path still works.
- Live evaluation is opt-in and should not be run by default.

## Database Setup

Gatherwise keeps the approved Prisma + SQLite architecture for the Handshake branch.

Common commands:

```bash
npm run prisma:generate
npx prisma migrate deploy
npm run prisma:seed
```

For local schema iteration, `npm run prisma:migrate` remains useful during development. For a clean environment or release setup, use `npx prisma migrate deploy` so the checked-in migrations apply reproducibly.

For a reset:

```bash
npm run prisma:reset
```

Important constraints:

- existing migrations are preserved
- verified rules and source records are reproducible from seed data
- demo flows can remain stateless even when persistence is enabled elsewhere

## Tests

Repository-defined checks:

```bash
npm test
npm run typecheck
npm run build
```

Current automated coverage includes:

- unit tests
- integration-style tests for rule and intake behavior
- seed and source validation
- evidence trail and route tests
- hardening regressions
- brand and IA regression checks

There is currently no dedicated lint script in the repository.

## Evaluation

Offline evaluation command:

```bash
npm run eval:gatherwise
```

Live model-backed evaluation:

```bash
npm run eval:gatherwise:live
```

Current offline evaluation snapshot:

- 36 synthetic scenarios
- 99.8% fixture-normalization extraction accuracy across 1944 asserted fields
- 28/28 expected unknowns preserved
- 100% rule-ID, source-ID, and boundary agreement across 35 checked scenarios
- 7/7 reliability checks passed

Artifacts:

- `reports/gatherwise/latest.json`
- `reports/gatherwise/latest.md`
- `docs/gatherwise/evaluation-report.md`
- `docs/gatherwise/evaluation-methodology.md`

## Design System

The chosen visual direction is **Local Signal**.

Design-system docs:

- `docs/gatherwise/design-system.md`
- `docs/gatherwise/color-system.md`
- `docs/gatherwise/typography-system.md`
- `docs/gatherwise/layout-system.md`
- `docs/gatherwise/motion-system.md`

The interaction model stays behaviorally familiar while using route, evidence, and status motifs to make source-backed reasoning easier to scan.

## AI Boundaries

AI may:

- extract event facts from a user description
- mark facts as extracted or unknown
- surface ambiguity for review
- explain deterministic results using a trusted evidence packet

AI may not:

- decide permit applicability
- invent event facts
- invent agencies, thresholds, deadlines, or URLs
- select unsupported requirements
- hide missing evidence

The deterministic rule engine remains the authority for requirement results.

## Privacy

Privacy and security posture for this branch:

- no raw event-description logging
- no client-side secret usage
- metadata-only extraction logging
- bounded inputs
- rate limiting on public POST endpoints
- safe fallback behavior when AI is unavailable

Supporting docs:

- `docs/gatherwise/security-review.md`
- `docs/gatherwise/data-retention-plan.md`
- `docs/gatherwise/threat-model.md`

## Demo

Primary recruiter route:

```text
/showcase
```

Public demo entry points:

- guided demo path
- fictional scenarios
- deterministic results
- unsupported-jurisdiction refusal example
- simulator-backed route comparison

Demo and walkthrough docs:

- `HANDSHAKE_SUBMISSION.md`
- `docs/gatherwise/demo-script-90-seconds.md`
- `docs/gatherwise/recruiter-walkthrough.md`

## Deployment

Recommended hosted deployment flow for this branch:

1. Install dependencies with `npm ci`
2. Copy `.env.example` or provide environment variables
3. Run `npm run prisma:generate`
4. Run `npx prisma migrate deploy`
5. Run `npm run prisma:seed`
6. Run `npm run typecheck`
7. Run `npm test`
8. Run `npm run eval:gatherwise`
9. Run `npm run build`
10. Start with `npm start`

Railway-specific notes for the approved SQLite architecture:

- use a persistent Railway volume
- mount the volume at `/data`
- use `./scripts/start-railway.sh` as the Railway start command
- let runtime startup perform `prisma migrate deploy` and idempotent seed work because Railway volumes are not mounted during build or pre-deploy
- use `/api/health` as the health-check path

Release docs:

- `docs/gatherwise/deployment-checklist.md`
- `docs/gatherwise/release-audit.md`
- `docs/gatherwise/railway-deployment.md`
- `docs/gatherwise/production-environment.md`
- `docs/gatherwise/post-deployment-smoke-test.md`

## Limitations

- Arizona pilot only
- informational guidance only
- official source pages can change
- human verification is still recommended
- unsupported jurisdictions are refused rather than guessed
- AI-backed paths depend on configuration and availability
- there is no dedicated lint script in the current repository
- browser-based end-to-end accessibility coverage is still lighter than ideal

See also:

- `docs/gatherwise/known-limitations.md`
- `docs/gatherwise/failure-modes.md`

## Builder Attribution

Gatherwise is Paul Rotzler's Handshake project.

Paul's verified contributions in this branch include:

- identifying the fragmented event-readiness problem
- researching official Arizona pilot source material
- designing the product and information architecture
- defining the deterministic rule architecture
- designing the AI authority boundaries
- building and testing the application with AI-assisted development
- designing the evaluation and evidence systems

AI-assisted development supported implementation and iteration, but it did not independently own or originate the product direction.
