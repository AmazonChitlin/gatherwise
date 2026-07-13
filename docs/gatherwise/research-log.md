# Gatherwise Research Log

## 2026-07-13

### Objective

Establish the repository baseline, document technical constraints, and create a Gatherwise implementation framework without changing product behavior.

### Repository Evidence Reviewed

- Root config and metadata:
  - `package.json`
  - `tsconfig.json`
  - `next.config.ts`
  - `.env.example`
  - `README.md`
  - `PROJECT_CONTEXT.md`
- App surfaces:
  - `app/layout.tsx`
  - `app/page.tsx`
  - `app/intake/page.tsx`
  - `app/results/page.tsx`
  - `app/about/page.tsx`
  - `app/api/intake/route.ts`
- Shared implementation:
  - `components/ui.tsx`
  - `components/intake-form.tsx`
  - `lib/config.ts`
  - `lib/schemas.ts`
  - `lib/intake-persistence.ts`
  - `lib/rule-engine.ts`
  - `lib/results-helpers.ts`
  - `lib/types.ts`
  - `lib/prisma.ts`
  - `lib/future-products.ts`
- Data/model layer:
  - `prisma/schema.prisma`
  - `prisma/seed.ts`
  - `prisma/seed-validation.ts`
  - `prisma/source-inventory-validation.ts`
- Tests and QA docs:
  - `tests/rule-engine.test.ts`
  - `tests/launch-coverage-qa.test.ts`
  - `tests/cross-jurisdiction-qa.test.ts`
  - `docs/demo-readiness.md`
  - `docs/ux-qa.md`
  - `docs/audit.md`

### Search Passes Run

- Branding references
- Older-brand references
- Analytics/telemetry references
- AI/runtime dependency references
- Auth references
- Accessibility references
- E2E/browser-test references
- Deployment/runtime references

### Baseline Commands Run

- `npm test`
- `npm run typecheck`
- `npm run build`

### Key Findings

- The MVP architecture is coherent and already separated into config, schema, persistence, rule matching, and results formatting layers.
- The repository is heavily branded as EventLocal across code, assets, metadata, and docs.
- The app is strong on logic-level testing and weaker on browser-level verification.
- The current environment and schema are optimized for local demos, not hosted production.
- There is no auth, analytics, AI layer, or payments footprint to unwind yet.

### Open Questions

- Should Gatherwise remain Arizona-first in the next phase or simply use the current MVP as a technical shell?
- Should future brand migration preserve some `eventlocal-*` class/type names temporarily to limit churn, or rename comprehensively once?
- Is the next best leverage point UX simplification, brand migration, or hosted-readiness hardening?
