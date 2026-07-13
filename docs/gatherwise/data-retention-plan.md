# Gatherwise Data Retention Plan

Date: 2026-07-13
Status: Draft for Handshake branch

## Scope

This plan covers the current Gatherwise Handshake branch only.

## Data classes

### 1. Verified product seed data

Includes:

- jurisdictions
- agencies
- use cases
- rule records
- official source inventory

Retention:

- retain in version control
- rebuild through migrations and seed scripts
- treat as durable product/reference data

### 2. Demo session intake data

Includes:

- event name
- structured intake answers
- compatibility fields
- canonical event-facts envelope in `rawAnswers`

Retention:

- keep only as needed for local demo continuity, QA, and short-lived manual review
- do not treat as a long-term user archive
- prefer deleting or recreating demo databases rather than accumulating submissions indefinitely

### 3. Generated result artifacts

Includes:

- matched checklist results
- generated checklist rows

Retention:

- transient
- rebuildable from seeded rules plus intake facts
- safe to discard with demo database resets unless a specific evaluation session must be preserved

### 4. Synthetic evaluation data

Includes:

- seeded scenarios
- test fixtures
- synthetic demo events

Retention:

- retain in version control when useful for reproducibility
- prefer synthetic scenarios over storing real user event details

## Current recommendation

For the Handshake branch:

- do not add long-term retention of raw free-form event descriptions
- do not add persistent user profiles or account histories
- do not store more personal data than the current demo flow requires

## Retention rules

1. Keep official-source and rule seed data as the durable system of record for demo reproducibility.
2. Treat intake submissions as temporary demo-session data unless a new approved use case requires longer retention.
3. If real user feedback is later collected, define a separate retention policy before collecting it.
4. If natural-language event descriptions are introduced later, retain normalized facts by default and keep raw descriptions only if there is a documented product reason.
5. If hosted persistence is added later, document deletion windows and operator access before launch.

## Access expectations

- Current local demo data should be accessible only to local operators/developers.
- No public client should receive administrative database access.
- No service-role or admin credentials should ever be exposed client-side.

## Deletion guidance for current branch

- Local demo resets may delete the SQLite database and reseed it.
- This is acceptable because the main durable assets are migrations, seeds, and source-review records.

## Future trigger for a stricter plan

Create a stricter retention policy before any of these ship:

- real user accounts
- hosted public submissions
- free-form event-description storage
- uploaded files
- feedback forms collecting email or contact details
- analytics tied to identifiable users
