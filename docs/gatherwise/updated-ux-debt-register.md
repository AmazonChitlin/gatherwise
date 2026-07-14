# Gatherwise UX Debt Register

Date: 2026-07-13
Scope: post-hardening review for the Gatherwise showcase branch

## Release-blocking debt fixed in this pass

- Keyboard users now have a skip link to jump past repeated navigation.
- Public mutation endpoints now have bounded request throttling instead of unlimited POST access.
- Long text is less likely to trigger narrow-width overflow because global reflow protections were added.
- Production error logging no longer emits the full client error object.

## High-priority deferred debt

- The intake experience is still a large interactive surface with many optional toggles, even after the two-path framing reduced first-screen choice load.
- There is still no browser-level end-to-end accessibility smoke test covering intake through results.
- Contrast is guided by the design system, but not enforced by automated tooling.
- Safari and Firefox were not directly exercised in this pass.

## Medium-priority deferred debt

- The natural-language path still depends on AI availability, so the guided path remains the more reliable primary path.
- Results and route explanation patterns are clearer than before, but the custom route UI still asks users to learn a project-specific metaphor.
- The showcase is now recruiter-ready, but measured recruiter-comprehension research still has not been run.
- The footer and disclaimer language remain intentionally repetitive; that supports trust, but still adds reading weight.

## Low-priority deferred debt

- Source lookup performance is improved structurally, but there is no dedicated performance dashboard yet.
- The design system has good semantic state tokens, but there is still no automated contrast regression gate.
- The dev-only concepts route remains intentionally separate and unlinked, but still adds maintenance surface.

## Recommended next UX moves

1. Add one browser-driven keyboard smoke test for the core guided path.
2. Add an automated contrast check or scripted manual checklist to CI.
3. Simplify the deepest optional intake sections with more progressive disclosure if real usability sessions show hesitation or abandonment.
