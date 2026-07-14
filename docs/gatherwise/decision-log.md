# Gatherwise Decision Log

## 2026-07-13

### Decision

Establish a non-behavior-changing Gatherwise research baseline on a dedicated branch before any feature or rebrand implementation work.

### Why

- The repository already has a functioning MVP flow and a meaningful test baseline.
- The current codebase is strongly branded as EventLocal, so future changes need a documented migration frame instead of ad hoc edits.
- A repository audit helps us distinguish safe reuse from areas that need redesign.

### Outcome

- Created and switched to `showcase/gatherwise-handshake`.
- Captured repository facts, baseline checks, UX debt, and implementation boundaries in `docs/gatherwise/`.
- Deferred all product behavior changes.

### Follow-On Decisions Needed

- Whether Gatherwise should preserve the current Arizona-first scope or reposition as a broader product.
- How aggressively to rename code symbols and assets during rebrand work.
- When to add browser smoke coverage relative to UX and branding changes.

## 2026-07-13

### Decision

Prepare Railway as the initial hosted deployment target without changing the approved Prisma + SQLite architecture.

### Why

- The approved ADR kept SQLite for the Handshake branch.
- Railway currently supports persistent volumes, which makes hosted SQLite viable for this bounded demo deployment.
- Railway volumes are mounted only at runtime, so SQLite migration and seed work cannot safely live in build or pre-deploy phases.

### Outcome

- Added a Railway runtime startup path that derives the SQLite database location from the mounted volume when needed.
- Added a read-only `/api/health` route for Railway health checks.
- Documented the required volume mount path, public-domain setup, and post-deployment smoke steps.

### Follow-On Decisions Needed

- Whether a later post-Handshake deployment should keep hosted SQLite or move to Postgres for stronger multi-user durability.
- Whether live AI should be enabled in a hosted environment after server-side key management is approved.
