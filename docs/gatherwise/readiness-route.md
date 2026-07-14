# Gatherwise Readiness Route

## Purpose

The Readiness Route turns the deterministic result into a route-shaped sequence that still reads cleanly as a normal vertical list.

## Route Elements

- Start: confirmed event
- Fact markers
- Decision points
- Requirement stops
- Missing-information forks
- Source anchors
- End state: next best action

## Accessibility Guardrails

- Native `details` and `summary` provide click-to-reveal behavior without JavaScript.
- DOM order matches focus order.
- The decorative route line is `aria-hidden`.
- The route remains meaningful as plain text when CSS is limited.
- Small screens collapse back to a single-column list.
- Reduced motion removes hover movement and keeps transitions brief.

## Interaction Notes

- Clicking a stop reveals details.
- No drag-only behavior exists.
- No essential hover behavior exists.
- The path drawing never carries meaning on its own.
- The route does not require horizontal scrolling.
