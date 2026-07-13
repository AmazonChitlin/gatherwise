# Gatherwise Schema Versioning

## Current version

- `EventFacts.schemaVersion`: `2026-07-13`

## Versioning rules

1. Additive metadata changes can keep the current version if old documents still parse correctly.
2. Any change that reinterprets a fact key, removes a field, or changes meaning should create a new schema version.
3. Adapters must remain backward-compatible with legacy stored intake payloads while they exist in the database.
4. Unknown values must preserve their semantics during migration.

## Storage strategy

Stored intake payloads now support an envelope:

- `schemaVersion`
- `intake`
- `eventFacts`

Older records that only contain raw intake JSON are still accepted and parsed as legacy payloads.

## Migration approach

When the schema evolves:

1. Parse the stored payload.
2. Detect the version.
3. Upgrade through explicit adapter steps.
4. Validate at the boundary before use.

## Deferred work

- Add first-class database columns for canonical event facts if long-term analytics or audit queries require them.
- Add explicit per-rule version storage once the rule authoring workflow gains versioned releases.
- Add document-level migration tests when a second schema version exists.
