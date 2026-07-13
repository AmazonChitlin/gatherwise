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
