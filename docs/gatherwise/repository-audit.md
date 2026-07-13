# Gatherwise Repository Audit

Date: 2026-07-13
Branch: `showcase/gatherwise-handshake`
Repository root: `/Volumes/SSD 1/Codex/EventLocalMVP`

## Git Baseline

- Current branch before setup: `main`
- Working branch for this audit: `showcase/gatherwise-handshake`
- Default branch: not detectable from local `origin/HEAD`
- Working tree before setup: clean
- Latest source-branch commit: `6a09980 chore: establish EventLocal baseline before Gatherwise`

## Technical Summary

- Package manager: npm
  Evidence: `package-lock.json` present and all repo scripts are npm-oriented.
- Framework: Next.js `16.2.9`
  Evidence: `package.json`
- Router: App Router
  Evidence: `app/` directory with route segments and `app/api/intake/route.ts`
- React: `19.2.7`
- TypeScript: `5.8.3`, strict mode enabled
- Styling: Tailwind CSS v4 via `@import "tailwindcss"` in `app/globals.css`, plus custom CSS variables and utility classes
- Icons/UI: `lucide-react` plus local shared components in `components/ui.tsx` and `components/eventlocal-icons.tsx`
- Validation: Zod
- Data layer: Prisma `6.10.1` with SQLite datasource

## TypeScript Settings

Confirmed from `tsconfig.json`:

- `strict: true`
- `noEmit: true`
- `moduleResolution: "bundler"`
- `jsx: "react-jsx"`
- `paths` alias `@/* -> ./*`
- Includes `.next/types/**/*.ts` and `.next/dev/types/**/*.ts`

## Styling System And Design Tokens

Confirmed from `app/globals.css`:

- Tailwind CSS v4 import is active.
- CSS custom properties define the visual system.
- Tokens include:
  - Surfaces: `--background`, `--surface`, `--surface-muted`, `--sand`, `--sand-light`
  - Text and lines: `--foreground`, `--muted`, `--line`, `--line-strong`
  - Brand colors: `--primary`, `--primary-strong`, `--primary-soft`
  - Secondary/status colors: `--secondary*`, `--highlight*`, `--success*`, `--warning*`, `--alert*`, `--verified*`
  - Layout tokens: `--shadow`, `--shadow-soft`, `--radius-card`, `--radius-control`
- Shared semantic classes include `.local-card`, `.local-callout`, `.local-badge`, `.local-button`, `.focus-ring`, `.command-pattern`, and `.eventlocal-command-hero`.

## Existing Component Library

Confirmed local shared UI:

- `components/ui.tsx`
  - `PageContainer`
  - `Card`
  - `CalloutPanel`
  - `SectionHeading`
  - `Badge`
  - `ButtonLink`
- `components/disclaimer-notice.tsx`
- `components/site-header.tsx`
- `components/site-footer.tsx`
- `components/intake-form.tsx`
- `components/copy-contact-button.tsx`
- `components/eventlocal-icons.tsx`

There is no external component library config such as `components.json`, Storybook, or a design-system package.

## Prisma And Database Setup

Confirmed from `prisma/schema.prisma`, `.env.example`, and `lib/prisma.ts`:

- Datasource provider: `sqlite`
- Database URL env var: `DATABASE_URL`
- Example local value: `file:./dev.db`
- Prisma client is cached on `globalThis` outside production.
- Migrations exist under `prisma/migrations/`.
- Local DB file exists at `prisma/dev.db`.

### Schema Models

- `Jurisdiction`
- `Agency`
- `UseCase`
- `RuleRecord`
- `IntakeSubmission`
- `GeneratedChecklistItem`
- `FutureProductOrder`

## Deployment Assumptions

Confirmed:

- No deployment configuration files were found for Vercel, Docker, Sites, or container hosting.
- `next.config.ts` is effectively empty.
- The app expects `.env` during build and local runtime.
- Current database setup is local SQLite, which is simple for local development but not production-host friendly without adaptation.

Recommended interpretation:

- The repository is optimized for local demo/development, not a production deployment target yet.

## Event Intake Schema

Confirmed from `lib/schemas.ts` and `components/intake-form.tsx`:

- Core required fields:
  - `eventName`
  - `city`
  - `county`
  - `useCase`
  - `eventType`
  - `propertyUse`
  - `expectedAttendance`
  - `vendorCount`
  - `eventDate`
  - `recurrence`
- Required boolean controls:
  - `hasFood`
  - `hasFoodTruck`
  - `hasRetailSales`
  - `hasAlcohol`
  - `hasAmplifiedSound`
  - `hasTemporaryStructure`
  - `hasGenerator`
  - `hasOpenFlame`
  - `hasStreetSidewalkOrParkingImpact`
- Optional detail fields cover food handling, traffic/right-of-way, temporary structures, alcohol nuance, signage, park/property use, indoor/outdoor context, and recurrence detail.

## Rule-Engine Entry Points

Confirmed from `lib/rule-engine.ts`:

- `loadActiveRuleRecords()`
- `buildChecklistForIntake(intake)`
- `matchRulesToIntake(intake, rules)`
- `triggerFieldsMatch(triggerFields, facts)`

Supporting result formatting lives in:

- `lib/results-helpers.ts`
- `lib/queries.ts`
- `app/results/page.tsx`

## Source-Record Structure

Confirmed from `prisma/seed-data/source-inventory.ts` and `prisma/source-inventory-validation.ts`:

- Source inventory records include:
  - `id`
  - `jurisdictionCode`
  - `jurisdictionName`
  - `jurisdictionType`
  - `agencyName`
  - `sourceName`
  - `sourceUrl`
  - `sourceCategory`
  - `useCaseRelevance`
  - `notes`
  - `verificationStatus`
  - `lastChecked`
  - `isOfficial`
  - `rulesCreated`
- Inventory validation states:
  - `official_reviewed`
  - `needs_review`
  - `needs_research`

## Result-Generation Flow

Confirmed end-to-end path:

1. `components/intake-form.tsx` validates client-side with `intakeSchema`.
2. `POST /api/intake` revalidates with `intakeSchema`.
3. The API normalizes compatibility facts via `lib/intake-persistence.ts`.
4. The API persists `IntakeSubmission` through Prisma and returns `intakeId`.
5. The browser routes to `/results?intakeId=...`.
6. `app/results/page.tsx` loads the saved intake from Prisma.
7. `buildChecklistForIntake()` loads active `RuleRecord` rows and matches them.
8. `lib/results-helpers.ts` groups items, builds timelines, and surfaces red flags.
9. Results render checklist items, jurisdiction grouping, source metadata, agency contacts, disclaimers, and future-product placeholders.

## Jurisdictions

Confirmed supported intake jurisdictions from `lib/config.ts`:

- Phoenix
- Tempe
- Mesa
- Scottsdale
- Glendale
- Peoria
- Chandler
- Gilbert
- Maricopa County
- Arizona state-level rules
- Arizona TPT / sales tax guidance

State support is currently fixed to Arizona in both config and schema defaults.

## Routes

Confirmed from the `app/` tree and production build output:

- `/`
- `/about`
- `/intake`
- `/results`
- `/api/intake`
- `/_not-found`

Routing notes:

- `/`, `/about`, and `/intake` are statically generated.
- `/results` is dynamic and server-rendered on demand.
- `/api/intake` is a route handler.

## Tests And Commands

Confirmed package scripts:

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm test`
- `npm run typecheck`
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:push`
- `npm run prisma:reset`
- `npm run prisma:seed`
- `npm run prisma:studio`

Confirmed automated test coverage:

- Node test runner via `tsx --test tests/**/*.test.ts`
- Current suite focuses on:
  - rule-engine behavior
  - intake validation
  - results helpers
  - seed validation
  - source-inventory validation
  - cross-jurisdiction coverage
  - launch-coverage QA
  - future paid-product placeholder honesty

## Accessibility Tooling

Confirmed:

- No dedicated automated accessibility tooling is installed.
- Accessibility attention exists in implementation details:
  - shared `.focus-ring`
  - decorative SVGs marked `aria-hidden`
  - `aria-live="polite"` and `role="status"` in the intake form
  - labeled navigation regions in header/footer

## End-To-End Or Browser Testing

Confirmed:

- No repository-configured Playwright or Cypress suite exists.
- No `playwright.config.*`, `cypress.config.*`, or `e2e/` tests were found.
- Existing docs explicitly say there is no end-to-end browser test suite yet.

Note:

- `package-lock.json` contains transitive Playwright references, but there is no first-class E2E test setup in the repo.

## Analytics, Telemetry, And Error Monitoring

Confirmed:

- No app-level analytics, telemetry, or monitoring integration was found.
- No PostHog, Segment, Mixpanel, Plausible, GA4, Sentry, Datadog, or similar setup was found in app code.

## AI Dependencies

Confirmed:

- No OpenAI, Anthropic, LangChain, Vercel AI SDK, embeddings, or model runtime dependencies are present.
- The app itself is not AI-powered in the current baseline.

## Authentication

Confirmed:

- No authentication library or auth flow exists.
- Repo docs repeatedly describe auth as explicitly out of scope for the current MVP.

## Environment Variables

Confirmed:

- `.env.example` only declares `DATABASE_URL="file:./dev.db"`.
- The build output shows `.env` is loaded.
- No other environment variables were found in repository code or example config.

## Public Demo Behavior

Confirmed from UI copy and docs:

- The app positions itself as an informational readiness tool, not a government portal.
- It saves an intake, generates a checklist, and shows cautious wording with source links and agency contacts.
- It includes visible disclaimers across the experience.
- Results include a disabled future paid-product CTA rather than a live checkout or download flow.
- Docs recommend demoing against a freshly seeded local database.

## Performance Problems

Confirmed:

- No explicit performance budget, profiling setup, or telemetry-backed performance issue tracking exists.
- No caching strategy, ISR configuration, or bundle-analysis tooling is present.

Observed risks worth tracking:

- `components/intake-form.tsx` is a very large client component, which increases maintenance and likely client bundle weight.
- `/results` recomputes matched rules on demand from Prisma with no visible caching layer.
- Current local-SQLite architecture is simple for demos but may become a throughput bottleneck if reused in hosted multi-user environments.

## Visible Brand References

Confirmed current brand references:

- Product name: `EventLocal`
- Tagline: `Ready. Set. Local.`
- CSS class naming such as `.eventlocal-command-hero`
- Component naming such as `EventLocalIcon`
- Asset naming such as `/brand/eventlocal-logo.png`
- Metadata and copy across `README.md`, `PROJECT_CONTEXT.md`, `app/`, `components/`, and existing docs

Confirmed older-brand references:

- `PROJECT_CONTEXT.md` still contains `Original working concept: PopUpPermitAZ`
- `docs/ux-qa.md` references an older theme in prose

## Repository Hygiene Notes

Confirmed:

- AppleDouble metadata files such as `._page.tsx` and `._seed-validation.ts` are present alongside real source files.
- They are currently part of the working tree baseline and should be treated carefully during future cleanup because this audit did not remove or normalize them.

## Key Takeaways For Gatherwise

- The repo already has a stable MVP spine: intake -> persistence -> rule match -> results.
- The highest leverage near-term work is likely brand migration, UX clarity, data-model trust hardening, and documentation-guided implementation discipline.
- The repo is still a local-demo-oriented Arizona MVP, not a deployment-ready multi-market product.
