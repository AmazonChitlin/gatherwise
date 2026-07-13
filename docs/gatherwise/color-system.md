# Gatherwise Color System

Date: 2026-07-13
Direction: `Local Signal`

## Strategy

The color system is semantic first, not palette first.

It uses:

- hex fallbacks as the baseline
- OKLCH overrides inside `@supports` for perceptual consistency
- semantic names tied to purpose, not decorative hue labels

## Core Semantic Tokens

Implemented in `app/globals.css`:

- `--gw-canvas`
- `--gw-surface`
- `--gw-surface-elevated`
- `--gw-text`
- `--gw-text-muted`
- `--gw-border`
- `--gw-border-strong`
- `--gw-action-primary`
- `--gw-action-primary-strong`
- `--gw-action-primary-soft`
- `--gw-action-secondary`
- `--gw-action-secondary-strong`
- `--gw-action-secondary-soft`
- `--gw-focus`
- `--gw-information`
- `--gw-information-soft`
- `--gw-caution`
- `--gw-caution-soft`
- `--gw-critical`
- `--gw-critical-soft`
- `--gw-success`
- `--gw-success-soft`
- `--gw-unknown`
- `--gw-unknown-soft`
- `--gw-ai-extracted`
- `--gw-ai-extracted-soft`
- `--gw-verified-rule`
- `--gw-verified-rule-soft`
- `--gw-official-source`
- `--gw-official-source-soft`
- `--gw-disabled-surface`
- `--gw-disabled-text`
- `--gw-link`
- `--gw-link-visited`

## Meaning Map

- Canvas: overall page field
- Surface: standard cards and containers
- Elevated surface: higher-priority or overlay-like content blocks
- Text: default readable foreground
- Muted text: supporting copy, metadata, and captions
- Border: structural outlines
- Primary action: dominant CTA
- Secondary action: stable supporting action and route frame color
- Focus: keyboard-visible emphasis ring
- Information: explanatory, neutral-positive system information
- Caution: uncertain or timing-sensitive guidance
- Critical: blocking issues or validation failure
- Success: confirmed completion or good state
- Unknown: unresolved facts or unsupported certainty
- AI-extracted: machine-assisted facts or AI-origin state
- Verified rule: deterministic product rule with verified status
- Official source: provenance tied to external official evidence

## Contrast Intent

- Normal text is designed to meet WCAG AA.
- Essential result surfaces use darker text and stronger border contrast where practical.
- Links are tested independently from body text by using dedicated link tokens instead of inherited body color.
- Disabled states use both value contrast and state styling, not opacity alone.

## Status Rules

- No status depends on hue alone.
- Every important state should pair color with:
  - shape
  - icon or marker
  - text label
- Existing helper classes such as `gw-status-token-*` and `gw-source-token-*` reflect this approach.

## Light/Dark Strategy

- Only light mode is defined in this phase.
- Dark mode is intentionally deferred rather than added through simple inversion.
- A future dark mode should be designed separately if it can be finished completely and accessibly.

## Legacy Compatibility

Existing variables such as `--primary`, `--surface`, `--foreground`, and `--line` now map to Gatherwise semantic values so older screens keep working while the system migrates forward.
