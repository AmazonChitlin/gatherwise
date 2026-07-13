# Gatherwise Lean UX Plan

Date: 2026-07-13
Branch: `showcase/gatherwise-handshake`
Status: planning only; no product features implemented in this phase

## Purpose

This plan shifts Gatherwise from feature-first planning toward outcome-first planning. The goal is to define who we are helping, what observable change matters, which assumptions are riskiest, and what the cheapest learning loops should be before implementation.

## Lean UX Framing

- Treat proto-personas as living assumptions, not finished customer profiles.
- Treat outcomes as observable user or stakeholder change, not shipped UI.
- Treat hypotheses as testable beliefs connecting user, experience, and evidence.
- Treat experiments as staged learning vehicles that reduce uncertainty before build-heavy work.

## Target Users In Scope

- First-time small-event organizer
- Experienced organizer expanding into a new jurisdiction
- Vendor or food operator joining someone else’s event
- Recruiter evaluating the Handshake project

Detailed assumption-driven persona framing lives in `docs/gatherwise/proto-personas.md`.

## Core Outcomes

The current planning focus is to help users:

- Reach a useful, source-backed event-readiness summary quickly without municipal vocabulary knowledge.
- Understand what facts drove the current result and what missing facts could change it.
- Trust the evidence boundary between user facts, AI help, deterministic rule outputs, and official sources.
- Understand the system architecture and AI boundary quickly in a recruiter/demo context.
- Avoid false confidence when jurisdiction coverage or evidence is incomplete.
- Continue through a usable manual path even when AI augmentation is unavailable.

Detailed outcomes live in `docs/gatherwise/outcome-map.md`.

## Risk Framing

The riskiest categories are:

- Trust and evidence interpretation
- Usability of intake choice and explanation
- Rule/evidence integrity
- Recruiter comprehension of product and technical architecture

Detailed ranked assumptions live in `docs/gatherwise/assumption-inventory.md`.

## Primary Learning Agenda

Before major feature implementation, Gatherwise needs to learn:

1. Whether visitors understand what the product does from first glance.
2. Whether users can navigate intake mode choice without confusion.
3. Whether users can tell facts, inference, rules, and sources apart.
4. Whether route-style result explanations improve comprehension.
5. Whether changes between scenarios feel meaningfully comparable.
6. Whether a recruiter can explain the architecture and Paul’s contribution quickly and accurately.

## Working Rules For This Phase

- Do not treat untested solution ideas as committed roadmap items.
- Do not assume AI is always available, trusted, or correct.
- Do not present unsupported jurisdictions or weak evidence as verified guidance.
- Prefer prototype-and-test loops before deep implementation.

## Linked Artifacts

- `docs/gatherwise/proto-personas.md`
- `docs/gatherwise/outcome-map.md`
- `docs/gatherwise/assumption-inventory.md`
- `docs/gatherwise/hypotheses.md`
- `docs/gatherwise/experiment-plan.md`
