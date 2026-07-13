# Gatherwise Baseline Test Report

Date: 2026-07-13
Branch: `showcase/gatherwise-handshake`

## Commands Run

All checks below used repository-defined npm scripts.

1. `npm test`
2. `npm run typecheck`
3. `npm run build`

## Results

### `npm test`

- Status: passed
- Summary:
  - `122` tests passed
  - `0` failed
  - duration reported by runner: about `216.56ms`

Coverage themes from the current suite:

- Rule matching behavior
- Cross-jurisdiction isolation
- Launch-city coverage
- Intake validation
- Result formatting helpers
- Seed validation
- Source inventory validation
- Future paid-product placeholder honesty

### `npm run typecheck`

- Status: passed
- Notes:
  - `tsc --noEmit`
  - no TypeScript errors reported

### `npm run build`

- Status: passed
- Notes:
  - Next.js `16.2.9` with Turbopack
  - `.env` loaded during build
  - production build completed successfully

Build route summary:

- `○ /`
- `○ /about`
- `○ /intake`
- `ƒ /results`
- `ƒ /api/intake`
- `○ /_not-found`

## Baseline Assessment

- The repository baseline is currently healthy for the existing MVP scope.
- The project has strong unit/QA-style coverage for rule/data logic.
- The baseline still lacks browser-level end-to-end validation and automated accessibility testing.

## Important Constraints Observed

- Baseline verification did not run non-script commands such as ad hoc Prisma validation because this report is restricted to repository-defined commands.
- No product behavior changes were made during this baseline pass.
