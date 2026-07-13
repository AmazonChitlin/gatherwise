# Gatherwise Experiment Plan

Date: 2026-07-13
Status: staged planning; prototypes not yet built

## Experiment A: Message Clarity

- Hypothesis: New visitors can explain what Gatherwise does after 10 seconds if the hero communicates the audience, action, and outcome in plain language.
- Prototype fidelity required: low-fidelity static hero variants
- Participant type: first-time organizers, vendors, and one or two neutral outsiders
- Task: View the hero for 10 seconds, then answer “What does this product do?” and “Who is it for?”
- Success criteria: most participants describe the product as event-readiness guidance tied to sources, not permit submission or generic AI search
- Failure signal: participants think it is a permit filing tool, general event marketplace, or unclear AI assistant
- Data to collect: first-impression paraphrases, confidence ratings, misunderstood phrases, time-to-explanation
- Privacy limitations: do not collect real event details; use only synthetic examples
- Next decision: choose or revise the message frame before higher-fidelity homepage design

## Experiment B: Intake Comprehension

- Hypothesis: Users can choose between natural-language intake and step-by-step intake without confusion if the difference in control, speed, and confidence is explained clearly.
- Prototype fidelity required: low- to mid-fidelity entry-flow mockups
- Participant type: first-time organizers and vendor/operator participants
- Task: Start a new event-planning session and pick the intake path that feels right, then explain why
- Success criteria: participants choose a mode quickly and can explain the tradeoff between the two paths
- Failure signal: hesitation, wrong expectations about what each mode does, or abandonment before selection
- Data to collect: first click, verbalized expectations, choice rationale, confusion points
- Privacy limitations: use fictional event scenarios; avoid storing personal event plans
- Next decision: keep dual-entry concept, simplify it, or collapse into one guided path

## Experiment C: Evidence Trust

- Hypothesis: Users can distinguish user-provided facts, AI-extracted facts, deterministic rule results, and official sources if each evidence type has a distinct label and explanation.
- Prototype fidelity required: mid-fidelity annotated results prototype
- Participant type: first-time organizers, experienced organizers, and recruiters
- Task: Review a result and label each information block by origin and trust level
- Success criteria: participants correctly classify the four evidence types and do not mistake AI or rule output for official source text
- Failure signal: participants collapse all information into one trust bucket or call inferred content “verified”
- Data to collect: classification accuracy, confidence, misunderstood labels, quotes showing trust reasoning
- Privacy limitations: use synthetic event facts and synthetic AI extraction examples
- Next decision: refine evidence language and visual hierarchy before building hybrid explanation surfaces

## Experiment D: Readiness Route Comprehension

- Hypothesis: Users can interpret route stops, forks, and evidence anchors without instruction if the route metaphor maps clearly to event facts and requirement logic.
- Prototype fidelity required: low- to mid-fidelity flow diagram or interactive mockup
- Participant type: first-time organizers and experienced organizers
- Task: Walk through a readiness route and explain what each stop or fork means
- Success criteria: participants correctly identify what triggered the stop, what the fork depends on, and where the supporting evidence lives
- Failure signal: route visuals are seen as decorative, confusing, or less clear than a plain list
- Data to collect: explanation accuracy, hesitation moments, navigation path, qualitative preference against a checklist baseline
- Privacy limitations: do not use real participant events unless explicitly consented and anonymized
- Next decision: invest in route-based explanation or revert to simpler explanatory structures

## Experiment E: Comparison Value

- Hypothesis: Users can explain what changed after modifying one event fact if Gatherwise shows before/after deltas tied to rules and evidence.
- Prototype fidelity required: mid-fidelity comparison prototype
- Participant type: experienced organizers plus one or two first-time organizers
- Task: Change one event fact and explain what changed in the result and why
- Success criteria: participants accurately identify the changed requirement set, changed confidence, or changed evidence path
- Failure signal: participants notice that “something changed” but cannot explain cause or impact
- Data to collect: explanation accuracy, time to identify delta, confusion about unchanged content, perceived usefulness
- Privacy limitations: prefer canned scenarios; redact any participant-provided examples before notes are shared
- Next decision: prioritize comparison workflow or keep it secondary to core single-scenario comprehension

## Experiment F: Recruiter Understanding

- Hypothesis: Recruiters can identify Paul’s personal contribution, the AI boundary, and the technical architecture if the project narrative is short, explicit, and visually structured.
- Prototype fidelity required: low- to mid-fidelity project overview artifact, architecture panel, or landing section
- Participant type: recruiters, hiring managers, senior peers, or trusted stand-ins who review portfolios
- Task: Review the project artifact for up to 90 seconds and then explain what the product does, where AI is used, what remains deterministic, and what Paul contributed
- Success criteria: participants can correctly describe the hybrid architecture and name at least one concrete contribution area
- Failure signal: they describe it as “an AI app” without system detail, or they cannot separate product, AI, and rule-engine layers
- Data to collect: recall accuracy, misunderstood boundary points, words used to summarize the project, unanswered questions
- Privacy limitations: do not expose proprietary candidate-review notes; anonymize participant feedback
- Next decision: refine recruiter-facing explanation before building showcase-facing product polish

## Staging Guidance

1. Run Experiments A and B first because message and intake framing shape everything else.
2. Run Experiments C and D next because trust and explanation are the core product risks.
3. Run Experiment E after there is enough fidelity to represent result deltas.
4. Run Experiment F in parallel once a recruiter-facing architecture artifact exists.
