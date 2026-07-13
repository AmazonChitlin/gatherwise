# AGENTS.md

## Standing Repo Instructions

- Confirm the repository root before making changes.
- Report the current branch, detectable default branch, working-tree status, and latest commit before branch-sensitive work.
- Require a clean working tree before creating or switching task branches.
- If the tree is dirty, stop. Do not stash, discard, commit, or alter unrelated changes unless the user explicitly asks.
- Never reset or rewrite the source branch as part of task setup.
- When a task names a branch, create it if missing or switch to it if it already exists without resetting it.

## Working Style

- Audit the existing repository before implementing product changes.
- Separate confirmed repository facts from assumptions and recommendations in planning docs.
- Run repository-defined baseline checks before major implementation work and record the results.
- Prefer additive documentation and isolated changes over broad refactors during discovery phases.
- Do not change product behavior during audit-only or baseline-establishment tasks unless the user explicitly expands scope.

## Documentation Expectations

- Keep decision history in `docs/gatherwise/decision-log.md`.
- Keep open questions, follow-up research, and source trails in `docs/gatherwise/research-log.md`.
- Keep repository facts, assumptions, deferred work, and recommendations clearly separated in `docs/gatherwise/implementation-map.md`.
- Record current UX friction in `docs/gatherwise/ux-debt-register.md` before changing it.
