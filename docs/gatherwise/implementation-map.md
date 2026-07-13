# Gatherwise Implementation Map

Date: 2026-07-13
Branch: `showcase/gatherwise-handshake`

## Confirmed Repository Facts

- The app is a Next.js App Router project using React 19 and TypeScript.
- npm is the active package manager.
- Tailwind CSS v4 plus custom CSS variables define the current visual system.
- Prisma uses SQLite with `DATABASE_URL="file:./dev.db"` in local setup.
- The current experience is a local event-readiness MVP for Arizona jurisdictions.
- Intake submissions are persisted, then replayed into a server-rendered `/results` flow.
- Rule matching is centralized in `lib/rule-engine.ts`, not scattered through page conditionals.
- The app includes no auth, analytics, AI layer, payment flow, PDF generation, admin console, or live document generation.
- The current baseline passes repository-defined test, typecheck, and build commands.
- Visible branding is still overwhelmingly EventLocal, with one confirmed older concept reference: `PopUpPermitAZ`.

## Unverified Assumptions

- The intended default branch is probably `main`, but local `origin/HEAD` did not confirm it.
- The eventual Gatherwise product direction likely includes a rebrand and broader scope than Arizona-only MVP readiness, but that is not encoded in repo behavior yet.
- A future hosted deployment will likely require Postgres or another hosted database instead of SQLite, but that migration is not yet planned in-repo.
- Existing docs imply demo-readiness, but there is no confirmed hosted demo environment or production release pipeline in the repository.

## Recommended Changes

- Establish Gatherwise-specific architecture and branding documents before touching product behavior.
- Preserve the existing intake -> persistence -> rule-engine -> results spine as the core implementation seam.
- Treat `lib/config.ts`, `lib/schemas.ts`, `lib/rule-engine.ts`, and Prisma seed/data files as the primary leverage points for future product expansion.
- Plan the rebrand as a cross-cutting system update, not a piecemeal copy swap, because brand references are embedded in metadata, components, CSS class names, assets, docs, and helper types.
- Introduce browser smoke coverage before broad UX or product refactors so future work is safer to validate.
- Track AppleDouble `._*` files as repo-cleanup debt before they spread into new documentation or source work.
- Break down the large client intake form before or during deeper UX iteration to reduce change risk and improve maintainability.

## Changes Explicitly Deferred

- No application feature implementation in this phase.
- No behavioral product changes.
- No rebrand rollout in UI, metadata, routes, or assets yet.
- No schema redesign or database-provider migration yet.
- No authentication, analytics, AI integration, payments, PDFs, admin tools, or dashboard work.
- No cleanup of `._*` filesystem artifacts in this prompt.
- No accessibility or E2E tooling implementation in this prompt.

## Suggested Future Work Sequence

1. Lock Gatherwise positioning, naming, and trust language in docs first.
2. Map the full EventLocal-to-Gatherwise rename surface, including code symbols and assets.
3. Add one browser smoke path for intake submission through results rendering.
4. Slice the intake form into maintainable sections/components before major UX changes.
5. Tackle rebrand and UX improvements together once validation coverage is stronger.
