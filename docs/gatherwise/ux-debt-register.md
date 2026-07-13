# Gatherwise UX Debt Register

Date: 2026-07-13
Scope: current EventLocal MVP baseline only; no UX changes applied in this pass

## Current Friction

### High

- The product name, visual identity, and voice are still EventLocal throughout the user journey, which blocks a clean Gatherwise story.
- The intake form is long and dense, with many toggles and conditional ideas presented in a single large client component.
- The app asks for a lot of detail before showing value, which may feel heavy for first-time users who are still unsure whether the tool can help.
- Results depend on the user reaching a saved-intake URL with `intakeId`, and the empty-state recovery path is minimal.

### Medium

- Public-facing copy repeats disclaimers often, which is honest but can crowd out confidence-building guidance if not balanced carefully in a later pass.
- The supported geography is narrow and Arizona-specific, but the homepage framing can feel broader than the actual rule coverage.
- The disabled future paid-product section is honest, but it occupies meaningful results-page space without providing current user utility.
- The about page explains limitations clearly but does not yet help users understand why Gatherwise/EventLocal is meaningfully better than searching agency sites manually.
- The intake defaults are opinionated, which helps demos but may bias user inputs.

### Low

- Shared UI patterns are clear but fairly custom and hand-rolled, which can make consistency drift easier over time.
- Accessibility intent is visible in the code, but there is no automated accessibility safety net yet.
- There is no browser smoke test covering the actual intake-to-results experience.

## Current UX Strengths Worth Preserving

- The product avoids false certainty and stays explicit about informational limits.
- The intake form uses plain language instead of government jargon.
- Results organize matched guidance into summary, timeline, red flags, contacts, and sources.
- Source and verification metadata are treated as first-class trust signals.

## Deferred UX Work

- No page redesigns yet.
- No copy rewrite yet.
- No IA or route changes yet.
- No interaction-model simplification yet.
