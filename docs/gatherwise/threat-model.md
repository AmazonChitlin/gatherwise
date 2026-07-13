# Gatherwise Threat Model

Date: 2026-07-13
Status: Draft for Handshake branch

## System boundary

Current branch components with data impact:

- public Next.js routes
- intake API route
- Prisma application layer
- local SQLite database
- version-controlled seed data and source inventory

Not present today:

- auth
- user accounts
- file uploads
- payments
- real-time messaging
- public admin tools
- third-party analytics SDKs

## Assets to protect

1. Verified seed rules and official-source inventory integrity
2. Intake submission data, including structured event details
3. Canonical event-facts provenance and evidence chain
4. Accurate source-linked results
5. Repository secrets and environment configuration

## Primary threats

### 1. False trust through overstated verification

Risk:

- users may believe unsupported or weakly supported results are fully verified

Current mitigations:

- cautious requirement wording
- source links
- verification status fields
- unsupported-jurisdiction language
- explicit limitations in public copy

Needed guardrail:

- keep AI explanation downstream of deterministic rule evaluation and official-source evidence

### 2. Unsafe persistence assumptions in hosted deployment

Risk:

- SQLite writes may be treated as durable in a serverless or ephemeral filesystem environment

Impact:

- intake loss
- inconsistent demo behavior
- broken result links

Mitigation:

- do not promise durable hosted writes without deployment proof
- prefer local demo or stateless seeded showcase until a hosted persistence decision is approved

### 3. Excess retention of event submissions

Risk:

- demo intake data accumulates without a defined need or deletion policy

Mitigation:

- treat intake data as transient
- prefer resets and reseeding over indefinite retention
- avoid storing raw free-form event descriptions unless justified

### 4. Seed/source integrity drift

Risk:

- rule records or source links drift away from reviewed official material

Mitigation:

- keep source inventory version-controlled
- keep seed validation in tests
- keep review dates visible where possible
- require explicit review when changing rule/source records

### 5. Input abuse on public intake routes

Risk:

- malformed or abusive input attempts against unauthenticated intake submission

Current mitigations:

- Zod validation
- server-side parsing
- limited schema surface

Future mitigation if public traffic increases:

- rate limiting
- abuse logging
- CAPTCHA or equivalent only if abuse becomes real

### 6. Secret leakage through future hosted infrastructure

Risk:

- future service credentials exposed client-side or over-privileged

Mitigation for current branch:

- keep environment surface minimal
- do not introduce service-role keys without an approved hosted subsystem

## Trust boundaries

### Boundary A: User input -> canonical facts

Risk:

- unknown data may be coerced into false certainty

Mitigation:

- keep `unknown` explicit
- preserve provenance states
- do not silently convert missing facts to `false`

### Boundary B: Canonical facts -> rule evaluation

Risk:

- rule logic and fact normalization diverge

Mitigation:

- keep one canonical normalization path
- test compatibility adapters

### Boundary C: Rule evaluation -> user-facing result

Risk:

- explanation layer may overstate rule certainty

Mitigation:

- keep result traceable to facts, rule ID/version, source ID, review date, jurisdiction, and known uncertainty

## Threat posture conclusion

The biggest current architectural risk is not a missing hosted database. It is making stronger durability, verification, or retention claims than the branch can honestly support.

For the Handshake branch, the safest posture is:

- keep SQLite
- keep seeded data reproducible
- keep demo submissions transient
- avoid hosted-write promises until deployment durability is proven
