# Gatherwise performance report

Date: 2026-07-13
Branch: `showcase/gatherwise-handshake`

## Method

- `npm run build`
- local `curl` timing against the running app
- inspection of generated `.next/static/chunks`
- code-path review for source lookup and AI waiting behavior

## Build status

- Production build passes on Next.js `16.2.9`
- Static routes:
  - `/`
  - `/about`
  - `/how-it-works`
  - `/showcase`
  - `/sources`
  - `/dev/gatherwise-concepts`
- Dynamic routes:
  - `/intake`
  - `/results`
  - `/api/intake`
  - `/api/intake/extract`
  - `/api/results/simulate`

## Measured local timings

`curl` from the local environment returned:

- `/showcase`
  - TTFB: `0.056s`
  - total: `0.059s`
  - response size: `125475` bytes
- `/intake`
  - TTFB: `0.030s`
  - total: `0.031s`
  - response size: `78877` bytes
- `/results?demo=private-property-punk-show`
  - TTFB: `0.140s`
  - total: `0.141s`
  - response size: `31592` bytes

These are local-development measurements, not production CDN or hosted timings.

## Bundle observations

- `.next/static/chunks` footprint after build inspection: about `29M`
- Summed JavaScript chunk output from the inspected chunk list: about `883 KB`
- Largest observed client chunks in the build output were approximately:
  - `227 KB`
  - `176 KB`
  - `150 KB`
  - `113 KB`

The total `.next` directory size was much larger because it includes build cache and server artifacts, so it is not a reliable user-facing payload metric.

## Improvements made in this pass

- Replaced repeated official-source array scans with cached map lookups for source ID and source record resolution.
- Added bounded request throttling to reduce abusive high-frequency mutation traffic.
- Added reflow protections to reduce layout instability from long text and narrow widths.
- Preserved AI cancel/retry paths rather than hiding long waits behind a passive spinner.

## Performance interpretation

### LCP

No lab-grade LCP instrumentation is configured in the repository. Based on route structure, the most important leverage remains keeping the hero and intake shells mostly server-rendered and minimizing extra client-side work before content is visible.

### CLS

No obvious layout-shift regression was introduced in this pass. The hardening changes were mostly structural and defensive rather than animated or late-loading UI inserts.

### Interaction

Repository-equivalent interaction safety is better after this pass because:

- throttled POST routes fail early instead of piling on expensive work
- long-text reflow is less likely to trigger overflow-driven layout issues
- AI waits remain cancelable

## Deferred work

- No formal Web Vitals reporting pipeline yet
- No chunk analyzer integration yet
- No browser automation timing harness for INP-like interaction measurements
- Intake and route components are still relatively large client surfaces

## Recommendation

The current branch is acceptable for the showcase/demo scope, but the next performance step should be measurement infrastructure rather than speculative micro-optimizations:

1. Add route-level Web Vitals capture or a reproducible Lighthouse workflow.
2. Add a chunk-analysis script for client bundles.
3. Profile whether parts of the intake and results trees can move back to server-rendered shells.
