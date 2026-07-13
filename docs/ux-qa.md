# EventLocal Final Visual UX QA

Date: 2026-06-23

This pass reviewed EventLocal after the EventLocal Command visual direction was applied across the homepage, intake page, results page, About / Disclaimer page, header, footer, shared UI components, custom inline SVG icons, subtle command-pattern background utilities, and the results readiness-dashboard contrast fix.

No new product features, permit rules, source records, payments, auth, PDFs, dashboards, admin UI, uploads, subscriptions, marketplace, venue listings, Prisma schema changes, or rule-matching changes were added.

## Pages Reviewed

- Homepage
- Intake page and grouped intake form
- Results page, including no-intake and no-match states
- About / Disclaimer page
- Header and primary navigation
- Footer
- Shared disclaimer, badge, card, CTA, icon, and pattern treatments

## Checks Performed

- Reviewed visual consistency across dark navy hero/panels, white/light content sections, orange CTAs, cards, badges, icons, and footer surfaces.
- Reviewed the results readiness dashboard contrast after the `command-card-dark` fix to make sure dark panels use light text and light cards keep dark text.
- Reviewed CTA hierarchy, including primary `Check my event` links and secondary informational links.
- Reviewed trust and disclaimer language for legal-certainty risks.
- Reviewed no-match and no-intake results copy for honest fallback guidance.
- Reviewed source, verification, agency contact, external-link, and future paid roadmap/vendor packet display copy.
- Reviewed responsive Tailwind layout patterns for wrapping nav, stacked mobile grids, and readable form/results sections.
- Reviewed accessibility basics including focus-ring usage, decorative SVG `aria-hidden` handling, visible link text, and disabled CTA clarity.
- Reviewed internal links for fake or unbuilt feature destinations.
- Ran local HTTP route smoke checks against the active dev server on `http://localhost:3000` for `/`, `/intake`, `/about`, and `/results`.
- Ran the required automated checks: tests, typecheck, Prisma validate, and production build.

Browser/screenshot note: the Browser skill is available in this Codex session, but its required browser-control runtime tool was not exposed through tool discovery. Because this project does not include a Playwright workflow and the task prohibits adding unnecessary dependencies, this pass did not capture rendered desktop/mobile screenshots. Visual QA was completed through code review and build validation; a future pass should restore browser screenshot QA before a public launch.

## Fixes Made

- Cleaned a small indentation issue in the intake page card wrapper. This was a code readability cleanup only and did not change app behavior.
- Added and verified the results dashboard contrast fix: dark dashboard panels now use a dedicated `command-card-dark` style, and dark summary/metric text is explicitly light.
- Refreshed this QA document to reflect the current EventLocal Command dark/white/orange direction instead of the older theme notes.

## Demo Readiness Status

Demo-ready with honest caveats.

The app is cohesive enough to show to a real user or stakeholder as an MVP readiness tool. The homepage explains the value quickly, the intake form is grouped and plain-English, the results page reads as a readiness dashboard, source and verification details are visible, and disclaimers are consistently available without overwhelming the product value.

During demos, continue to say clearly:

- EventLocal provides informational guidance only.
- EventLocal is not legal advice.
- EventLocal does not submit permits.
- EventLocal does not guarantee compliance.
- Users must confirm requirements with official agencies.
- Rule coverage is launch/MVP coverage, not every possible Arizona event rule.
- The downloadable roadmap and vendor packet are future paid features and are not active in this MVP.

## Findings

### Passed

- The EventLocal Command direction is consistent across the reviewed app surfaces.
- Header and footer use the EventLocal logo and do not include fake login, pricing, dashboard, account, or payment links.
- Primary CTA hierarchy is clear, with `Check my event` pointing to the intake flow.
- The homepage is scannable and explains what EventLocal checks, who it helps, how it works, supported areas, trust limits, and next action.
- Intake sections are grouped with calm helper text and small decorative icons that do not change the data model.
- Results show event summary, top items, timeline, jurisdiction grouping, source links, verification badges, agency contacts, disclaimer, and future-only paid CTA.
- Results dashboard contrast is readable: dark panels use off-white/light gray text, while white/light cards preserve charcoal and muted body text.
- No-match results avoid implying that nothing applies.
- Future paid roadmap/vendor packet copy is disabled and clearly future-only.
- Disclaimers state that EventLocal is informational guidance only, not legal advice, does not submit permits, and users should confirm with agencies.
- Copy does not claim official government status, legal advice, compliance, permit submission, or complete rule coverage.
- External source and agency website links visibly indicate they open official/source destinations.
- Custom icons are decorative and marked with `aria-hidden` in the shared icon component.
- Focus styling is present through the shared `.focus-ring` utility on links, buttons, and form controls that use it.

### Deferred Issues

- Capture rendered desktop and mobile screenshots for home, intake, results, about, no-match results, and a many-match scenario once browser tooling is available.
- Add a lightweight end-to-end smoke test for intake submission through results rendering.
- Confirm the sticky header spacing on narrow mobile screens with actual screenshots, especially because the nav includes both a `Check my event` link and CTA button.
- Verify high-density many-match result pages visually with real browser screenshots after more rules are added.
- Consider a future accessibility pass with automated tooling for color contrast, keyboard traversal, and screen-reader landmarks.

## Known Demo Limitations

- Rule coverage is useful MVP launch coverage, not exhaustive coverage for every event, venue, or agency process.
- Source records and rule records still need ongoing verification as agency pages and requirements change.
- The app does not submit permits, pay fees, file taxes, create PDFs, store documents, or manage organizer/vendor accounts.
- The future paid roadmap/vendor packet is a placeholder CTA only.
- Browser-based screenshot QA was not available in this pass.

## Recommended Next Tasks

1. Restore browser-based visual QA and capture desktop/mobile screenshots for the main demo scenarios.
2. Run the demo scenarios in `docs/demo-readiness.md` with 2-4 realistic vendors or organizers and collect confusing labels, missing source expectations, or trust concerns.
3. Add one lightweight end-to-end smoke test for intake submission and results rendering.
4. Prioritize remaining official-source research and rule expansion based on demo feedback.
5. Add an accessibility-focused QA pass before any public launch.
