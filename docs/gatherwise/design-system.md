# Gatherwise Design System

Date: 2026-07-13
Chosen direction: `Local Signal`
Implementation base: `app/globals.css`

## Purpose

The Gatherwise design system turns the selected concept direction into a maintainable, mathematically coherent foundation for future product work.

This phase does not ship the final product interface. It establishes the token layer, geometry rules, motion vocabulary, and documentation needed to build that interface consistently.

## System Goals

- Distinctive
- Readable
- Responsive
- Accessible
- Mathematically coherent
- Easy to maintain
- Compatible with the existing Next.js App Router and shared CSS architecture

## Chosen Character

`Local Signal` is the active direction because it best supports:

- first-glance message clarity
- strong route-state legibility
- high mobile scannability
- a recognizable visual identity without copying public-sector brands

The system keeps the route line, evidence tab, status marker, and local grid motifs from Prompt 3, but expresses them through reusable semantic tokens rather than one-off concept styling.

## What Was Implemented

The token layer now lives in `app/globals.css` and includes:

- semantic color tokens
- OKLCH overrides with hex fallbacks
- typography tokens and modular scale
- spacing, layout, radius, border, shadow, z-layer, and motion tokens
- future-facing utility classes for status, source, route-stop, requirement, error, unsupported, and AI-unavailable states
- compatibility aliases so existing repo styling still renders without a large refactor

## Design Rules

- Semantic meaning should live in tokens, not ad hoc component colors.
- Status must never depend on hue alone.
- Body copy should stay in a stable, readable range.
- Motion should support feedback, not spectacle.
- Responsive behavior should follow content stress, not arbitrary breakpoint soup.
- DOM order must remain the reading order at all breakpoints.

## System Architecture

### Foundation layer

- CSS custom properties in `:root`
- OKLCH upgrades inside `@supports`
- compatibility aliases mapping existing variables to Gatherwise semantics

### Reusable primitives

- typography helper classes
- page/grid helpers
- semantic state tokens
- requirement and error-state containers

## Component State Contract

The system is designed to support the following state families during rollout:

- Buttons: default, hover, focus-visible, pressed, disabled
- Inputs: default, hover, focus-visible, filled, disabled, invalid
- Text areas: default, focus-visible, disabled, invalid
- Selects: default, focus-visible, disabled, invalid
- Checkboxes: unchecked, checked, focus-visible, disabled, invalid
- Radio groups: unchecked, checked, focus-visible, disabled, invalid
- Tabs: idle, active, hover, focus-visible, disabled
- Disclosure panels: collapsed, expanded, focus-visible
- Source links: default, hover, visited, focus-visible
- Requirement cards: unknown, AI-extracted, verified-rule, caution, critical
- Route stops: pending, active, complete, unknown, unsupported
- Toasts: information, caution, critical, success
- Inline errors: visible, resolved
- Empty states: no results, no supported path, no intake yet
- Loading states: inline pending, route loading, source loading
- AI unavailable state: visible fallback with manual path preserved
- Unsupported jurisdiction state: visible unsupported message with no false verified styling

In this prompt, the reusable state classes implemented in `app/globals.css` are the foundation rather than the final component library.

### Product rollout expectation

- Future UI work should consume Gatherwise semantic tokens first.
- Existing EventLocal screens can migrate incrementally because the alias layer preserves current variable names.

## Accessibility Commitments

- WCAG AA contrast for normal text
- visible focus indicators
- minimum practical 44px touch targets for primary interactive controls
- no essential meaning conveyed by color alone
- no CSS `order` tricks that change reading or keyboard sequence
- reduced-motion fallback for non-essential animation

## Linked Specs

- `docs/gatherwise/color-system.md`
- `docs/gatherwise/typography-system.md`
- `docs/gatherwise/layout-system.md`
- `docs/gatherwise/motion-system.md`
