# Gatherwise Civic Signal v2 baseline

## Baseline

- Date: 2026-07-13
- Starting branch: `showcase/gatherwise-handshake`
- Working branch: `redesign/gatherwise-civic-signal-v2`
- Baseline commit: `0bc4ba295352b296f8783ad2972aeee031abcc84`
- Local annotated baseline tag: `pre-civic-signal-v2`
- Package installation: `npm ci` completed successfully

## Baseline checks

| Check | Result |
| --- | --- |
| `npm test` | Passed: 223 tests, 0 failed |
| `npm run typecheck` | Passed |
| `npm run build` | Passed; Next.js production build completed and generated all expected routes |
| `npm run eval:gatherwise` | Passed in offline mode; dataset `2026-07-13.1`, 36 scenarios |

## Known defects to address

1. Unknown AI facts can become default values. Resolved on 2026-07-13 by preserving partial reviewed values and rebuilding validated fact statuses on the server.
2. Derived booleans can remain true after child toggles are turned off.
3. AI extraction is not canceled when switching paths.
4. Retail sales is asked twice.
5. BYOB wording asks about permission rather than the event fact.
6. Homepage mockup marks extracted facts as confirmed.
7. Homepage character count disagrees with the live input.
8. `metadataBase` points to `gatherwise.local`.
9. The header has two competing intake links.
10. Mobile navigation is too tall.
11. Footer legal text contrast is too low.
12. The Civic Signal style is not yet applied throughout the full product.

## Scope

This baseline establishes a safe workspace for the full-site redesign. No application behavior was changed.

## Unknown-fact preservation verification

- Reviewed AI sessions now submit partial intake values with a strict, versioned fact-status envelope.
- The server validates canonical values, touched fields, statuses, and evidence before rebuilding `EventFactsDocument`.
- Untouched unknown facts remain `unknown` with a `null` value; extracted facts remain pending review and cannot drive rule evaluation.
- Explicitly confirmed `true` and `false` values remain confirmed.
- Existing complete `IntakeInput` requests retain their prior API behavior.
- Verification: `npm test` passed 232 tests, type checking and the production build passed, and the offline evaluation passed all 36 scenarios.
