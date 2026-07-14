# Gatherwise Change Simulator

## Purpose

The Event Change Simulator duplicates the confirmed `EventFacts`, applies supported changes, and compares the deterministic result sets.

## Supported Changes

Current Prompt 14 controls focus on high-signal route changes:

- City
- Property type
- Expected attendance
- Vendor count
- Food involved
- Alcohol involved
- Amplified sound
- Street, sidewalk, or parking impact
- Street closure

## Deterministic Diff Groups

- Added requirements
- Removed requirements
- Changed warnings
- Unchanged requirements
- Newly unresolved requirements

## Comparison Logic

- The simulator never asks AI to invent a diff.
- The diff compares deterministic rule-engine outputs before and after the supported changes.
- Explanations are generated from changed fact lines plus the matching rule trace.
- Unknown conditions are surfaced separately so a user can see when a route became less certain.

## Boundaries

- AI may later summarize a deterministic comparison, but it does not create the comparison itself.
- The simulator preserves the authority boundary established earlier: rules and sources still come from the deterministic engine and trusted records.
