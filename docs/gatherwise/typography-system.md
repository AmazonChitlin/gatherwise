# Gatherwise Typography System

Date: 2026-07-13
Direction: `Local Signal`

## Type Families

The system uses no more than two functional families:

- Sans/body family: `--font-sans`
- Display/signage family: `--font-display`

## Role Logic

- `--font-sans` handles body copy, form labels, helper text, and dense explanatory content.
- `--font-display` handles high-emphasis headings, route numbers, and numeric or signage-like moments where extra compression and authority help.
- Decorative display styling is never intended for dense paragraphs.

## Modular Scale

Implemented fluid steps:

- `--text-step--1`
- `--text-step-0`
- `--text-step-1`
- `--text-step-2`
- `--text-step-3`
- `--text-step-4`
- `--text-step-5`

The scale stays in the restrained 1.2-1.25 zone across the system rather than jumping into oversized marketing-type ratios.

## Line Height

Implemented unitless line-height tokens:

- `--line-height-tight`
- `--line-height-copy`
- `--line-height-roomy`

Use:

- tight for headings and numeric displays
- copy for default readable content
- roomy for long-form or explanation-heavy contexts

## Reading Measure

- Standard prose target: `--measure-reading`
- Compact measure: `--measure-compact`

This keeps typical prose close to the preferred 45-75 character range while still allowing responsive layouts.

## Functional Text Styles

Available helper intent:

- `.gw-text-display`
- `.gw-text-label`
- `.gw-text-caption`
- `.gw-text-number`
- `.gw-text-body`

These classes are primitives, not a complete component API.

## Stress Cases To Preserve

Future UI work should explicitly test:

- long agency names
- long source titles
- long jurisdiction names
- multi-line route explanations
- compact mobile widths

## Accessibility Notes

- Body text stays in the sans family for readability.
- Numeric emphasis uses tabular/lining numeric settings where useful.
- Fluid `clamp()` values prevent abrupt size jumps across viewport widths.
