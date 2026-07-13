# Gatherwise Layout System

Date: 2026-07-13
Direction: `Local Signal`

## Layout Goals

- mobile-first
- shallow DOM structure
- content-stress responsive behavior
- predictable spacing rhythm
- grid-led page composition

## Token Groups

Implemented in `app/globals.css`:

### Spacing

- `--space-1` through `--space-9`
- `--section-space`

### Width and measure

- `--content-width`
- `--content-width-wide`
- `--measure-reading`
- `--measure-compact`

### Gutters and geometry

- `--grid-gutter`
- `--radius-xs`
- `--radius-sm`
- `--radius-md`
- `--radius-lg`
- `--radius-xl`
- `--border-thin`
- `--border-strong`

### Elevation and layers

- `--shadow-1`
- `--shadow-2`
- `--shadow-3`
- `--layer-base`
- `--layer-sticky`
- `--layer-overlay`
- `--layer-toast`

## Layout Methods

- CSS Grid for page composition and multi-dimensional result layouts
- Flexbox for nav rows, action groups, chips, tabs, and one-axis alignment
- `min()`, `clamp()`, and `repeat(auto-fit, minmax(...))` for fluid adaptation

Helper primitives now available:

- `.gw-page-grid`
- `.gw-stack`

## Responsive Philosophy

- Start from a single-column mobile flow.
- Add columns when content proves it can support them.
- Avoid many named breakpoint exceptions unless content genuinely breaks.
- Preserve DOM order when layout changes.

## Geometry Rules

- Primary interactive controls should be at least 44 by 44 CSS pixels in practice.
- Focus rings must remain visible and not be clipped by containers.
- Cards and signals should use consistent radii from the shared token scale.
- Shadows should indicate elevation, not just decoration.

## State Surfaces

The layout system also supports key message surfaces:

- requirement cards
- inline errors
- unsupported jurisdiction states
- AI unavailable states

These use shared radius, border, and spacing tokens to stay structurally consistent even before the full interface rollout.
