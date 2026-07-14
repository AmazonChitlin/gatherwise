# Gatherwise: Source-Grounded AI Event Readiness

## Problem

Event readiness is fragmented across city, county, and state agencies. Organizers, vendors, and venues often need to piece together thresholds, forms, lead times, and source pages before they even know which agency language matters. That creates three recurring problems:

- the research path is slow and confusing
- small changes in event details can change the answer
- people end up relying on copied advice instead of current official sources

## Solution

Gatherwise is an Arizona-pilot event-readiness product that turns event details into a source-backed readiness summary while keeping deterministic rules in charge.

The flow includes:

- **Natural-language fact extraction**
  A user can describe an event in plain language. AI may extract structured event facts from that description.
- **Human review**
  Extracted facts are grouped, reviewable, editable, and allowed to remain unknown. Unknown never silently becomes false.
- **Deterministic rules**
  Verified rule records evaluate the confirmed event facts and remain the only authority for requirements, agencies, thresholds, lead times, and official source selection.
- **Official evidence**
  Every result traces back to a rule ID, rule version, relevant facts, and trusted official source records.
- **Grounded explanation**
  AI may explain a deterministic result using a constrained evidence packet. When AI is unavailable or grounding fails, Gatherwise falls back to a deterministic explanation template.
- **Readiness Route**
  The result is presented as a route from confirmed facts to decision points, requirement stops, missing-information forks, and source anchors.
- **Change Simulator**
  A user can duplicate confirmed facts, change selected details, and compare deterministic differences without AI inventing the diff.

## Personal Contribution

Paul Rotzler's role on this project included:

- identifying the problem space around fragmented event-readiness research
- researching official Arizona pilot sources and source-review structure
- designing the product and information architecture
- developing the deterministic rule architecture
- designing the AI boundaries so AI can assist without becoming the authority
- building and testing the application with AI-assisted development
- designing the evaluation system and evidence model

This project should not be described as independently designed or owned by Codex. AI-assisted development was used as a build and iteration partner under Paul's direction.

## AI Usage

Verified AI usage in this branch:

- server-side structured event-fact extraction from natural-language descriptions
- server-side grounded explanation of deterministic results
- deterministic fallback behavior when AI is disabled, unavailable, or fails validation
- AI-assisted implementation support during development

Verified non-usage:

- AI does not decide permit applicability
- AI does not invent agencies, thresholds, deadlines, fees, or source links
- AI does not override deterministic rule results

## Outcomes

Verified technical outcomes from the repository evaluation harness:

- 36 synthetic evaluation scenarios
- 99.8% fixture-normalization extraction accuracy across 1944 asserted fields
- 28/28 expected unknowns preserved
- 100% rule-ID, source-ID, and jurisdiction-boundary agreement across 35 checked scenarios
- 7/7 reliability checks passed

Verified usability status:

- the five-participant usability plan and research templates are in the repository
- measured live usability outcomes have not been claimed yet because they have not been run

## Limitations

- Arizona pilot only
- informational guidance only
- official source pages can change
- human verification is still recommended
- unsupported jurisdictions are refused instead of guessed
- AI-backed paths depend on availability and configuration, with manual and deterministic fallbacks where implemented
