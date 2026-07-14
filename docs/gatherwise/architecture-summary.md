# Gatherwise architecture summary

## Stack

- Next.js 16.2.9 App Router
- React 19
- TypeScript
- Prisma 6
- SQLite
- Zod

## Core pipeline

1. Intake details enter through the guided form or natural-language description path.
2. Natural-language extraction maps user text to structured EventFacts.
3. The user reviews extracted facts before evaluation.
4. Deterministic rules evaluate confirmed facts.
5. Requirement results link back to official source records.
6. AI may explain deterministic results using a constrained evidence packet.
7. The Readiness Route and Change Simulator expose reasoning and result changes in the UI.

## Trust boundary

- AI is optional.
- deterministic rules are authoritative
- official source inventory is repository-controlled
- unsupported jurisdictions are refused
- deterministic fallback copy remains available when AI is not

## Persistence

- Prisma + SQLite
- demo path can remain stateless
- raw natural-language descriptions are not stored by default
