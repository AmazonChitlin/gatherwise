# Gatherwise Motion System

Date: 2026-07-13
Direction: `Local Signal`

## Motion Goals

- clear feedback
- restrained movement
- no theatrical compliance animation
- no dependence on motion for meaning

## Tokens

Implemented in `app/globals.css`:

- `--motion-micro`
- `--motion-standard`
- `--motion-route`
- `--ease-standard`
- `--ease-snappy`
- `--ease-gentle`

## Timing Bands

- Micro-feedback: `--motion-micro` = 140ms
- Standard transitions: `--motion-standard` = 220ms
- Larger route transitions: `--motion-route` = 240ms

These stay within the requested restrained ranges.

## Property Strategy

- Prefer transform and opacity for feedback and movement.
- Use color and border transitions as secondary support.
- Avoid bounce as a default, especially for compliance-related or risk-related information.
- Do not delay access to content with entrance animation.

## Current Application

The shared button transition layer now uses named motion tokens rather than hard-coded values, creating a path for future state consistency across buttons, inputs, tabs, source links, and route stops.

## Reduced Motion

Implemented baseline:

- reduced-motion media query is now present in `app/globals.css`
- scroll smoothing is disabled when reduced motion is requested
- transitions and animations are effectively neutralized
- the existing hover-lift effect is removed in reduced motion

Rule that still applies during future rollout:

- Essential information must remain visible and understandable with motion removed.
