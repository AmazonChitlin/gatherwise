# Gatherwise Civic Signal v2 baseline

## Baseline

- Date: 2026-07-13
- Starting branch: `showcase/gatherwise-handshake`
- Working branch: `redesign/gatherwise-civic-signal-v2`
- Baseline commit: `0bc4ba295352b296f8783ad2972aeee031abcc84`
- Local annotated baseline tag: `pre-civic-signal-v2`
- Package installation: `npm ci` completed successfully

## Baseline checks

| Check                     | Result                                                                       |
| ------------------------- | ---------------------------------------------------------------------------- |
| `npm test`                | Passed: 223 tests, 0 failed                                                  |
| `npm run typecheck`       | Passed                                                                       |
| `npm run build`           | Passed; Next.js production build completed and generated all expected routes |
| `npm run eval:gatherwise` | Passed in offline mode; dataset `2026-07-13.1`, 36 scenarios                 |

## Known defects to address

1. Unknown AI facts can become default values. Resolved on 2026-07-13 by preserving partial reviewed values and rebuilding validated fact statuses on the server.
2. Derived booleans can remain true after child toggles are turned off. Resolved on 2026-07-13 by separating raw answers from deterministic compatibility derivation.
3. AI extraction is not canceled when switching paths. Resolved on 2026-07-13 with abort and request-generation guards across path changes, retry, cancel, and unmount.
4. Retail sales is asked twice. Resolved on 2026-07-13 by keeping the question only in Selling and vendors.
5. BYOB wording asks about permission rather than the event fact. Resolved on 2026-07-13 with factual event wording.
6. Homepage mockup marks extracted facts as confirmed. Resolved on 2026-07-14 by showing extracted facts as `Needs review` and preserving unknown status.
7. Homepage character count disagrees with the live input. Resolved on 2026-07-14 by aligning the mockup with the 4,000-character intake limit.
8. `metadataBase` points to `gatherwise.local`. Resolved on 2026-07-14 with validated `NEXT_PUBLIC_SITE_URL` metadata and a safe development fallback.
9. The header has two competing intake links. Resolved on 2026-07-14 with four informational links and one `Start a route` action.
10. Mobile navigation is too tall. Resolved on 2026-07-14 with a 64px closed header and compact disclosure menu.
11. Footer legal text contrast is too low. Resolved on 2026-07-14 with AA-oriented support and legal text treatments.
12. The Civic Signal style is not yet applied throughout the full product. Resolved across the intake, results, showcase, how-it-works, sources, and about routes before this browser-level pass.

## Scope

This baseline establishes a safe workspace for the full-site redesign. No application behavior was changed.

## Unknown-fact preservation verification

- Reviewed AI sessions now submit partial intake values with a strict, versioned fact-status envelope.
- The server validates canonical values, touched fields, statuses, and evidence before rebuilding `EventFactsDocument`.
- Untouched unknown facts remain `unknown` with a `null` value; extracted facts remain pending review and cannot drive rule evaluation.
- Explicitly confirmed `true` and `false` values remain confirmed.
- Existing complete `IntakeInput` requests retain their prior API behavior.
- Verification: `npm test` passed 232 tests, type checking and the production build passed, and the offline evaluation passed all 36 scenarios.

## Aggregate-fact derivation verification

- Child controls now update only their own factual fields; parent answers remain independent.
- `deriveCompatibilityFacts()` recomputes aggregate food, alcohol, structure, heat, property, and public-space triggers from current validated state.
- EventFacts retain explicit parent values, including confirmed `false`, while rule-trigger compatibility remains backward compatible.
- Turning off the last contributing child removes its aggregate contribution without component synchronization effects.
- Verification: `npm test` passed 240 tests, type checking and the production build passed, and the offline evaluation passed all 36 scenarios.

## Intake path and content verification

- Leaving the describe path aborts the active request and invalidates its generation so stale success or failure callbacks cannot update the interface.
- Explicit Cancel remains distinct from path switching and announces that description review was canceled.
- Retry starts a fresh request generation; an older request cannot clear its loading state or replace its result.
- The guided form renders one retail-sales control and asks about BYOB as an event fact rather than implied permission.
- Path-choice buttons expose selected state with `aria-pressed` and a visible selected treatment.
- Verification: `npm test` passed 250 tests, type checking and the production build passed, and the offline evaluation passed all 36 scenarios.

## Civic Signal foundation verification

- Core tokens, resets, legacy aliases, and accessibility defaults remain in `app/globals.css`; shared Civic Signal styles now live in `styles/civic-signal.css` with the original homepage cascade preserved.
- Shared semantic primitives cover page rhythm, sections, labels, actions, icon-plus-text statuses, route markers, notices, workspace panels, dividers, and empty states without requiring card layouts.
- Manrope is assigned directly to body copy and inherited controls; Newsreader is reserved for editorial headings and monumental brand treatments.
- The foundation uses solid ink, limestone, and paper surfaces with signal orange and cactus semantics, deliberate radii, visible focus rules, 44px controls, and reduced-motion fallbacks.
- Visual checks passed at desktop and 320px with no horizontal overflow or browser-console errors.
- Verification: `npm test` passed 253 tests, type checking and the production build passed, and the offline evaluation passed all 36 scenarios.

## Intake workspace verification

- `/intake` now uses a compact dark task introduction, four-stop progress route, two explicit path modes, and one concise supporting rail instead of a generic hero card and repeated sidebar cards.
- The describe workspace uses a large labeled textarea, matching 4,000-character count, privacy guidance, restrained fact-extraction status, explicit cancel/retry/manual fallback actions, and an `aria-live` status.
- Review states distinguish extracted facts, needs review, confirmed facts, and unknown facts with icon-plus-text statuses; source text remains visible and the three highest-value questions appear as route forks.
- The guided form keeps the reviewed-fact submission envelope and corrected aggregate logic while replacing toggle cards with line-based factual controls and numbered semantic fieldsets.
- Browser checks at 320, 375, 768, 1024, and 1440 CSS pixels found no horizontal overflow and a 44-pixel minimum control height. The planning rail is sticky only at wide desktop widths.
- Browser console inspection found no warnings or errors. Reduced-motion and responsive intake contracts are covered by component tests.
- Verification: `npm test` passed 256 tests; type checking, production build, and the 36-scenario offline evaluation are recorded in the final task verification.

## Results workspace verification

- `/results` now presents one Civic Signal planning workspace: event mast, next-action waypoint, deterministic Readiness Route, requirement evidence, missing-detail forks, planning order, secondary explanation, Evidence Trail, official sources, simulator, and limitations.
- Official source links and review metadata remain adjacent to their requirement results; native disclosures preserve the fact-to-rule-to-source reading order.
- Unsupported geography branches to a dedicated stop-state before the supported mast, requirements, Evidence Trail, or simulator can render.
- The Event Change Simulator retains its request payload, comparison groups, reset behavior, and live feedback while using full-width mobile controls.
- Browser checks passed at 1440 and 320 CSS pixels with no horizontal overflow, no controls below 44 pixels, and no console warnings or errors. A Phoenix-to-Tempe comparison returned a deterministic changed-fact line and added-requirement group.
- Supported, unsupported, zero-rule, several-rule, missing-fact, source-link, fallback explanation, disclosure, responsive DOM, and simulator contracts are covered by the existing and expanded test suite.
- Verification: `npm test` passed 261 tests; type checking and the production build passed; the offline evaluation completed all 36 scenarios in dataset `2026-07-13.1`.

## Public information pages verification

- `/showcase` is now a recruiter-focused case study with a real interface fragment, problem and user framing, a five-stage product approach, an explicit AI/rule authority boundary, evaluation methodology, verified stack facts, Paul’s contribution, demo links, repository link, and current limitations.
- `/how-it-works` uses one numbered Describe, Review, Evaluate, Verify route and one architecture diagram. It states that AI can extract or explain facts but cannot select requirements, agencies, thresholds, deadlines, fees, forms, URLs, or approvals.
- `/sources` is generated from the authoritative 46-record source inventory and groups records by jurisdiction and agency. It renders source status, title, category, review date, stable record ID, and the full official URL; 45 available source URLs remain direct keyboard-accessible links and the unavailable placeholder is not presented as an official link.
- `/about` now gives a concise account of the Arizona pilot, source-grounded method, human confirmation, refusal behavior, product principles, and present limitations without unsupported adoption or approval claims.
- The 36-scenario evaluation claim remains because the current offline dataset contains 36 scenarios. No automated test total is embedded in public copy because it would become stale; no customer, adoption, approval, or success-rate claims were added.
- Route and CSS contracts cover semantic landmarks and headings, safe external links, 44-pixel controls, visible focus, mobile reflow, and reduced motion. The in-app browser could not reach this workspace’s localhost in the current session, so no visual-browser pass is claimed for this task.
- Local production HTTP checks returned `200` for `/showcase`, `/how-it-works`, `/sources`, `/about`, and `/api/health`. Host-side output contained no server errors during those requests.
- Verification: `npm test` passed 268 tests; type checking and the production build passed; the offline evaluation completed all 36 scenarios in dataset `2026-07-13.1`.

## Global shell and metadata verification

- The header now exposes How it works, Sources, About, and Showcase as text navigation plus one primary `Start a route` action. `Plan an event` is no longer duplicated in the header.
- At 880px and below, the closed sticky header remains 64px tall. Its compact disclosure uses `aria-expanded`, `aria-controls`, a two-column link layout, a 44px menu control, focus transfer to the first link, Escape-to-close, and focus return to the trigger.
- Footer navigation, pilot scope, and legal text now use higher-contrast paper treatments and minimum sizes of 13px to 14px. The oversized wordmark remains decorative and `aria-hidden`; the informational-guidance notice remains visible.
- `NEXT_PUBLIC_SITE_URL` is parsed through a validated HTTP(S)-only resolver that rejects credentials and malformed values, normalizes to the public origin, and falls back to `http://localhost:3000` for local tests and development.
- The production build used `https://gatherwise-production.up.railway.app`. Local production HTML emitted that origin for Open Graph metadata and route-specific canonical links for `/`, `/showcase`, `/how-it-works`, `/sources`, and `/about` without inventing a social image.
- The homepage extraction mockup now labels extracted facts `Needs review`, preserves the visibly unknown property fact, and shows the same 4,000-character limit as the live intake.
- Existing skip-link, heading, landmark, icon-plus-text status, visible-focus, 44px target, and reduced-motion contracts remain covered. The in-app browser remained isolated from this workspace localhost, so interaction checks are code-, test-, build-, and production-HTML-based rather than a claimed visual-browser pass.
- Verification: `npm test` passed 275 tests; type checking and the production build passed; the offline evaluation completed all 36 scenarios in dataset `2026-07-13.1`.

## Browser-level journey verification

Playwright Chromium coverage now exercises the application through real browser navigation and interaction. The suite fails on page exceptions, browser console errors, unexpected internal `4xx` or `5xx` responses, horizontal overflow, and clipped visible controls. Extraction is intercepted with deterministic fixtures, so browser QA does not require an API key or incur model charges.

### Route matrix

| Area | Routes and behavior covered |
| --- | --- |
| Homepage | `/` load, primary describe action, live demo action, primary navigation, horizontal overflow |
| Describe and review | `/intake?path=describe`, mocked extraction, true and false confirmation, explicit city confirmation, enum edit, untouched unknown facts, reviewed submission envelope |
| Extraction race | AbortSignal observation, guided-path switch, stale response rejection |
| Guided intake | `/intake?path=guided`, required validation, one retail-sales control, factual BYOB wording, child toggles on and off, aggregate payload consistency, successful submission |
| Results | Supported readiness summary, Readiness Route, requirements, missing details, Evidence Trail, official source links, simulator comparison, informational boundary |
| Unsupported geography | Dedicated stop state with no requirement or source fabrication |
| Public demos | First three featured one-click result demos and their guided samples |
| Information pages | `/showcase`, `/how-it-works`, `/sources`, `/about` |
| Health and internal links | `/api/health` plus the known public route matrix, with responses required below `400` |

### Browser matrix

| Browser | Viewports | Result |
| --- | --- | --- |
| Playwright Chromium | `320x800`, `375x812`, `768x1024`, `1024x768`, `1440x1000` | Homepage, guided intake, supported results, sources, responsive navigation, overflow, and clipped-control checks covered |

The keyboard smoke path covers the skip link, brand link, compact navigation, intake mode control, event description, extraction action, Readiness Route disclosure, simulator action, official source link, and footer navigation. The compact menu is also checked for opening focus, Escape closure, and focus return.

### Defects found and fixed

- The initial E2E origin used `127.0.0.1` while the Next.js development client expected `localhost`, producing failed HMR connections. The runner now uses one consistent `localhost` origin.
- AppleDouble `._*` files created by the external macOS volume were being discovered as tests. Playwright ignores those filesystem metadata files without deleting workspace content.
- Edited review enums displayed canonical storage codes after save. Review rows now resolve known canonical values to their user-facing configuration labels.
- Smooth route scrolling produced a Next.js development warning. The document now declares its existing smooth-scroll behavior to Next.js, while the established reduced-motion override remains intact.

### Known limitations

- Automated browser coverage currently uses Chromium only. Safari/WebKit and Firefox remain manual or future CI coverage.
- External official sites are not fetched by the suite; trusted links are checked for visible `https://` destinations to avoid coupling release checks to third-party availability.
- The extraction journey uses a deterministic API mock. Live-provider behavior remains covered separately by opt-in evaluation and provider tests.
- Playwright retains traces, screenshots, and video under `test-results/` on failure and writes the local HTML report to `playwright-report/`; both are ignored generated artifacts.

### Rerun commands

```bash
npx playwright install chromium
npm run test:e2e
```

Final verification on 2026-07-14: `npm test` passed 275 tests, `npm run test:e2e` passed 15 Chromium journeys, type checking passed, the production build passed, and the offline evaluation passed all 36 scenarios in dataset `2026-07-13.1`.

## Civic Signal v2 release gate

- Release date: 2026-07-14
- Release candidate branch: `redesign/gatherwise-civic-signal-v2`
- Release candidate commit: `49f7b29814034461ae1df03721858434686d1235`
- Release documentation commit: `f9fc272`
- Merge commit: `73bbd5fa773d09e8dba6c4f30eaac51552c01485`
- Deployment branch: `showcase/gatherwise-handshake`
- Release tag: `gatherwise-civic-signal-v2`
- Startup script Git mode: `100755`

### Final results

| Gate | Result |
| --- | --- |
| `npm ci` | Passed; 93 packages audited, 0 vulnerabilities |
| `npm test` | Passed; 275 tests, 0 failed |
| `npm run typecheck` | Passed |
| Production build | Passed with `NEXT_PUBLIC_SITE_URL=https://gatherwise-production.up.railway.app` |
| `npm run eval:gatherwise` | Passed; 36 offline scenarios, dataset `2026-07-13.1` |
| `npm run test:e2e` | Passed; 15 Chromium journeys, 0 failed |
| Railway-style startup | Passed with fresh SQLite migrations, idempotent seed, `0.0.0.0` binding, and restart verification |
| Required route smoke test | Passed; all nine required routes returned `200` |
| Public demo smoke test | Passed; all six fictional result routes and all six guided sample routes returned `200` |
| AI-disabled fallback | Passed; extraction returned the safe guided-form fallback without exposing configuration |

The first fresh local `prisma migrate deploy` process exited with an unelaborated schema-engine error while the host had less than 1 GB free. An immediate isolated retry applied all three migrations, and two subsequent complete Railway startup runs migrated, seeded, started, and passed health checks. This was treated as a visible local environment limitation; it did not change migrations or deployment behavior.

### Release audit

- The working branch matched `origin/redesign/gatherwise-civic-signal-v2` before release documentation.
- The complete 52-file diff against `origin/showcase/gatherwise-handshake` was reviewed.
- No API key, authorization secret, private key, Railway secret, `.env` file, or private event data was found.
- `.env.example` contains placeholders only.
- Extraction logs contain bounded operational metadata, not raw event descriptions, prompts, responses, or request bodies.
- No fake customer logos, adoption claims, approvals, or invented product metrics were added.
- The showcase's 36-scenario, framework, database, AI-boundary, and builder-contribution claims match repository evidence.

### Deployment checklist

- [x] Confirm clean working branch and fresh remote refs.
- [x] Confirm startup script mode `100755`.
- [x] Review the complete deployment diff and release claims.
- [x] Complete secret, privacy, logging, and fake-metric scans.
- [x] Run clean install, unit tests, type checking, build, evaluation, and E2E tests.
- [x] Run Railway-style SQLite migration, seed, startup, restart, health, route, demo, and fallback checks.
- [x] Confirm production URL documentation uses `https://gatherwise-production.up.railway.app`.
- [x] Merge non-destructively into `showcase/gatherwise-handshake` and push.
- [x] Create and push annotated tag `gatherwise-civic-signal-v2` at the merge commit.
- [x] Wait for Railway deployment and verify health, core journeys, live AI, demos, shell, and browser console.

### Live production verification

- Railway reported merge commit `73bbd5f` as successfully deployed.
- `https://gatherwise-production.up.railway.app/api/health` returned `200` with `{"status":"ok"}`.
- The homepage, describe path, guided path, results, sources, showcase, and all public demo routes loaded successfully.
- Live OpenAI extraction returned `200` from configured model `gpt-5.6-luna` in 7.3 seconds for fictional event data. The browser review showed 17 extracted facts needing review, 37 unknown facts, and three visible ambiguities; no extracted fact was auto-confirmed.
- The fictional punk-show result rendered five deterministic possible requirements, a vertical Readiness Route, Evidence Trails, three trusted official-source records, and the informational boundary.
- Changing the simulator city from Phoenix to Tempe produced one added requirement, four removed requirements, and one unchanged requirement from the deterministic trace.
- The source index rendered 45 available official-source links. External source availability was not treated as an application health dependency.
- At `375x812`, the closed mobile header measured 65 pixels, the menu exposed How it works, Sources, About, Showcase, and Start a route, and no horizontal overflow was present.
- Footer guidance remained visible, and the live browser recorded no console warnings or errors.
- No production-only release-blocking issue was found.
