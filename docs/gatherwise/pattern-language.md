# Gatherwise Pattern Language

Date: 2026-07-13
Status: provisional concept vocabulary

## Purpose

This pattern language defines the recurring building blocks that make Gatherwise recognizable without making every screen look like a special case.

## Pattern Rules

- Patterns should explain meaning, not just decorate surfaces.
- Every pattern should reinforce one of the core jobs: orient, explain, verify, compare, or warn.
- Reuse the same motifs across product, concept prototypes, and recruiter-facing explanations.

## Pattern Catalog

### Route line

- Job: show causal flow between event facts, route forks, requirements, and evidence
- Best use:
  - progress strips
  - requirement sequences
  - comparison views
  - explanation trails
- Avoid:
  - decorative lines that do not connect actual meaning

### Evidence tab

- Job: reveal provenance at the edge of the component
- Best use:
  - source cards
  - rule explanation cards
  - unsupported or partial-coverage notices
- Avoid:
  - tab shapes that imply click behavior when none exists

### Status marker

- Job: communicate state through icon, shape, label, and color together
- Best use:
  - may apply
  - verified source
  - missing fact
  - unsupported area
- Avoid:
  - status shown only with colored dots

### Local grid

- Job: create orientation rhythm and subtle place-based structure
- Best use:
  - page backgrounds
  - hero fields
  - reviewer concept boards
- Avoid:
  - noisy pseudo-map drawings that suggest geographic specificity where none exists

## Surface Patterns

### Hero

- One dominant CTA
- Immediate explanation of product purpose
- Visible signal that the product is about route logic plus source evidence

### Fact chip

- Compact, scannable, and clearly user/input oriented
- Good place for location, venue type, attendance, food, or jurisdiction facts

### Requirement card

- Needs a visible status marker
- Should explain why the card exists
- Should point to evidence, not just conclusion

### Evidence source

- Must reveal provenance state quickly
- Should distinguish official source from AI or product-generated explanation

### Progress indicator

- Should communicate route progression, not vague completeness
- Best when tied to specific stages or stops

### Error or uncertainty state

- Must say what is missing and why it matters
- Should give a next action or review path

## Interaction Patterns To Keep Familiar

- Standard links
- Standard buttons
- Standard form controls
- Standard tabs
- Standard breadcrumbs
- Standard mobile menu expectations
- Standard focus visibility
- Standard modal accessibility behavior

## Content Patterns

- Explain cause before jargon.
- Name uncertainty explicitly.
- Separate user facts from inferred facts.
- Separate deterministic output from official-source evidence.
- Avoid legal-certainty language.
