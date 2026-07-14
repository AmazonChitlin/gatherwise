# Gatherwise interview talking points

## Problem framing

- Event readiness is not just a search problem; it is a trust and interpretation problem.
- People often do not know which details will change the answer until they are already deep in agency research.

## Product strategy

- Reduce feature-first sprawl and center outcome-first design.
- Keep deterministic rules as the authority.
- Make uncertainty visible instead of smoothing it away.

## AI boundary

- AI extracts and explains.
- AI does not decide permit applicability.
- Unsupported claims fail closed into deterministic fallback behavior.

## Engineering choices

- Prisma + SQLite was kept because the Handshake branch did not need a riskier persistence migration.
- Event facts and evidence were modeled explicitly so rule traceability could survive UI changes.
- Evaluation was built into the repo instead of left as a future presentation claim.

## What to be honest about

- Arizona pilot only
- limited measured usability evidence so far
- offline evaluation harness is not the same thing as live-model validation
