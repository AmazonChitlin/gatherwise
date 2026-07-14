# Gatherwise accessibility audit

Date: 2026-07-13
Branch: `showcase/gatherwise-handshake`

## Scope

Focused hardening pass for the public showcase, intake, results interaction model, and API-supported loading and error states.

## What was checked

- Keyboard-visible navigation structure in the in-app browser on `/showcase` and `/intake`
- Heading order from live DOM snapshots
- Live region usage for loading and status copy
- Focus visibility and minimum target sizing from CSS and component code
- Reduced-motion support from route UI and global styles
- Reflow and horizontal overflow at:
  - mobile portrait `375x812`
  - mobile landscape `812x375`
  - desktop `1440x900`
  - ultrawide `1728x1117`
- Existing regression coverage for route fallback, evidence trail, intake review, and brand IA

## Findings

### Fixed in this pass

- Added a visible-on-focus skip link so keyboard users can bypass repeated navigation.
- Added global `overflow-wrap: anywhere` protection for long headings, labels, and links.
- Added global `min-width: 0` and `overflow-x: clip` protections to reduce narrow-width overflow risk.

### Verified

- Heading structure is ordered and readable on `/showcase` and `/intake`.
- `aria-live="polite"` and `role="status"` are already present for guided intake and natural-language review feedback.
- Interactive controls already meet the intended 44px minimum target sizing in the shared styles.
- Reduced-motion handling is present in route-related styles and existing regression tests.
- Browser checks showed no document-level horizontal overflow on `/showcase` or `/intake` at the tested viewport sizes.
- Browser console checks on `/showcase` returned no warning or error logs during the audit run.

## Remaining gaps

- No automated screen-reader narration test harness is present; this audit relied on semantic structure checks plus live DOM inspection.
- No automated color-contrast tooling is configured. Token choices were previously designed for AA targets, but contrast is still a manual-review area.
- Safari and Firefox were not directly exercised because repository tooling in this pass only supported Chromium-like local browser validation.
- The route interaction remains custom enough that a dedicated end-to-end keyboard smoke test would still add value.

## Evidence

- In-app browser DOM snapshots for `/showcase` and `/intake`
- Responsive overflow checks at four viewport sizes with no document overflow detected
- Existing tests:
  - `tests/readiness-route-ui.test.ts`
  - `tests/intake-experience.test.ts`
  - `tests/intake-review.test.ts`
  - `tests/hardening.test.ts`

## Recommendation

The current branch is materially safer and more usable than the prior state, but accessibility hardening is not finished. Before calling the experience fully production-ready, add a browser-level keyboard smoke test for intake-to-results and an automated contrast audit in CI.
