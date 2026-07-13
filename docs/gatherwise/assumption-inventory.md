# Gatherwise Assumption Inventory

Date: 2026-07-13
Scale:

- Importance: High / Medium / Low
- Uncertainty: High / Medium / Low
- Cost of being wrong: High / Medium / Low

## Ranked Assumptions

| Rank | Category | Assumption | Importance | Uncertainty | Cost of Being Wrong | Cheapest Valid Test |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Trust | Users need to clearly distinguish user facts, AI-extracted facts, deterministic rule outcomes, and official sources to trust the product. | High | High | High | 5 moderated prototype sessions with evidence-label sorting tasks |
| 2 | User value | First-time organizers will value plain-language, source-backed readiness guidance more than a feature-rich but jargon-heavy checklist. | High | Medium | High | Hero + summary comprehension interviews with first-time organizers |
| 3 | Rule accuracy | Users will abandon trust quickly if a requirement appears without an understandable reason tied to their event facts or jurisdiction. | High | Medium | High | Explanation-comprehension prototype with “why this appeared” prompts |
| 4 | Source evidence | Verified guidance must be visually and structurally distinct from incomplete or unsupported evidence states. | High | Medium | High | Evidence-state comparison test using static mockups |
| 5 | Usability | Users can choose between natural-language intake and step-by-step intake without hesitation or mode confusion. | High | High | Medium | 5 first-click / think-aloud sessions on intake entry choices |
| 6 | Visual comprehension | A route-style results metaphor can make complex readiness logic easier to understand than a flat checklist alone. | High | High | Medium | Low-fidelity route interpretation test |
| 7 | Comparison value | Users will better understand the system if they can compare how one changed event fact affects the outcome. | Medium | Medium | Medium | Before/after scenario comparison task |
| 8 | Technical feasibility | The existing deterministic rule engine can remain the trusted backbone while AI adds explanation or extraction layers around it. | High | Medium | High | Architecture spike + recruiter review of boundary diagram |
| 9 | AI extraction | AI can extract event facts in a way that is helpful only if the product makes extraction confidence and user correction obvious. | High | High | High | Wizard-of-oz intake prototype with correction task |
| 10 | Manual path | The non-AI path can still deliver enough value that users do not see AI as mandatory for usefulness. | High | Medium | High | Manual-path walkthrough without AI assistance |
| 11 | Recruiter comprehension | Recruiters need a fast, explicit architecture narrative to understand the Handshake project within 90 seconds. | High | Medium | Medium | 3-5 recruiter or peer reviewer comprehension tests |
| 12 | Deployment | Users or reviewers may judge the project partly on perceived deployability, even if the current baseline is local-demo oriented. | Medium | Medium | Medium | Recruiter/readme comprehension review focused on hosting assumptions |
| 13 | Privacy | Users will be more comfortable sharing event details if the product is explicit about what is saved, inferred, and linked to sources. | Medium | Medium | Medium | Copy comprehension test on data-handling explanation |
| 14 | Visual comprehension | Stronger visual hierarchy in the first 10 seconds matters more than breadth of detail above the fold. | Medium | Medium | Medium | 10-second impression test on static hero variants |
| 15 | User value | Experienced organizers care more about “what changed here” than about complete beginner education. | Medium | Medium | Medium | Jurisdiction-comparison task with experienced organizers |

## Notes

- The top risk cluster is trust plus explanation clarity.
- The second risk cluster is interaction clarity around intake choice and result interpretation.
- The recruiter audience is not a side case for this project; it is an explicit outcome and should be tested as such.
