# Gatherwise Production Environment

This document lists the production environment variables and Railway-provided runtime variables used by the current Gatherwise branch.

## Deployment model

- Application: Next.js
- Database provider: Prisma + SQLite
- Hosted strategy: Railway service with a persistent volume
- Public route for Handshake: `/showcase`
- AI mode for public demo: disabled by default

## 1. Required for all deployments

### `DATABASE_URL`

- Purpose: Prisma datasource URL for the SQLite database.
- Server-only: yes
- Safe example: `file:/data/gatherwise.db`
- Railway supplies it automatically: no
- Deployment fails without it: yes, unless the Railway startup script derives it from `RAILWAY_VOLUME_MOUNT_PATH`
- Deterministic fallback works without it: no, because rule and source data live in the database

Notes:

- For Railway, the committed startup script can derive this automatically from the mounted volume if `DATABASE_URL` is left unset and `RAILWAY_VOLUME_MOUNT_PATH` is available.
- For non-Railway hosting, set it explicitly.

## 2. Required only for live AI

### `OPENAI_API_KEY`

- Purpose: server-side credential for the AI extraction and explanation providers.
- Server-only: yes
- Safe example: `sk-live-placeholder`
- Railway supplies it automatically: no
- Deployment fails without it: no, unless a live AI feature flag is turned on
- Deterministic fallback works without it: yes

### `GATHERWISE_AI_EXTRACTION_ENABLED`

- Purpose: enables the natural-language extraction provider.
- Server-only: yes
- Safe example: `true`
- Railway supplies it automatically: no
- Deployment fails without it: no
- Deterministic fallback works without it: yes

### `GATHERWISE_AI_MODEL`

- Purpose: model name for extraction.
- Server-only: yes
- Safe example: `gpt-5-mini`
- Railway supplies it automatically: no
- Deployment fails without it: only if extraction is enabled
- Deterministic fallback works without it: yes

### `GATHERWISE_AI_EXPLANATION_ENABLED`

- Purpose: enables grounded explanation generation.
- Server-only: yes
- Safe example: `true`
- Railway supplies it automatically: no
- Deployment fails without it: no
- Deterministic fallback works without it: yes

### `GATHERWISE_AI_EXPLANATION_MODEL`

- Purpose: model name for grounded explanations.
- Server-only: yes
- Safe example: `gpt-5-mini`
- Railway supplies it automatically: no
- Deployment fails without it: only if explanation AI is enabled
- Deterministic fallback works without it: yes

## 3. Optional

### `PERSIST_INTAKE_SUBMISSIONS`

- Purpose: controls whether validated intake submissions are stored in the database instead of staying stateless.
- Server-only: yes
- Safe example: `false`
- Railway supplies it automatically: no
- Deployment fails without it: no
- Deterministic fallback works without it: yes

Recommended Railway setting:

- `false` for the public Handshake deployment

### `GATHERWISE_AI_TIMEOUT_MS`

- Purpose: extraction timeout in milliseconds.
- Server-only: yes
- Safe example: `8000`
- Railway supplies it automatically: no
- Deployment fails without it: no
- Deterministic fallback works without it: yes

### `GATHERWISE_AI_MAX_INPUT_CHARS`

- Purpose: maximum accepted description length for extraction.
- Server-only: yes
- Safe example: `4000`
- Railway supplies it automatically: no
- Deployment fails without it: no
- Deterministic fallback works without it: yes

### `GATHERWISE_AI_REQUEST_LIMIT`

- Purpose: extraction request cap used by the provider.
- Server-only: yes
- Safe example: `25`
- Railway supplies it automatically: no
- Deployment fails without it: no
- Deterministic fallback works without it: yes

### `GATHERWISE_AI_MAX_OUTPUT_TOKENS`

- Purpose: extraction response budget.
- Server-only: yes
- Safe example: `1200`
- Railway supplies it automatically: no
- Deployment fails without it: no
- Deterministic fallback works without it: yes

### `GATHERWISE_AI_EXPLANATION_TIMEOUT_MS`

- Purpose: explanation timeout in milliseconds.
- Server-only: yes
- Safe example: `8000`
- Railway supplies it automatically: no
- Deployment fails without it: no
- Deterministic fallback works without it: yes

### `GATHERWISE_AI_EXPLANATION_REQUEST_LIMIT`

- Purpose: explanation request cap used by the provider.
- Server-only: yes
- Safe example: `25`
- Railway supplies it automatically: no
- Deployment fails without it: no
- Deterministic fallback works without it: yes

### `GATHERWISE_AI_EXPLANATION_MAX_OUTPUT_TOKENS`

- Purpose: explanation response budget.
- Server-only: yes
- Safe example: `900`
- Railway supplies it automatically: no
- Deployment fails without it: no
- Deterministic fallback works without it: yes

## 4. Local-development only

### `DATABASE_URL="file:./dev.db"`

- Purpose: local SQLite development database from `.env.example`
- Server-only: yes
- Safe example: `file:./dev.db`
- Railway supplies it automatically: no
- Deployment fails without it: not applicable to Railway
- Deterministic fallback works without it: not applicable to Railway

Recommended note:

- Do not reuse the local relative-path value for Railway production.

## 5. Variables provided automatically by Railway

### `PORT`

- Purpose: runtime port for the public web process and health checks.
- Server-only: yes
- Safe example: `3000`
- Railway supplies it automatically: yes
- Deployment fails without it: Railway provides it automatically
- Deterministic fallback works without it: yes, as long as Railway provides it

### `RAILWAY_VOLUME_NAME`

- Purpose: identifies the attached Railway volume.
- Server-only: yes
- Safe example: `gatherwise-data`
- Railway supplies it automatically: yes, when a volume is attached
- Deployment fails without it: no
- Deterministic fallback works without it: yes, if `DATABASE_URL` is set another way

### `RAILWAY_VOLUME_MOUNT_PATH`

- Purpose: mount path used by the committed startup script to derive a SQLite `DATABASE_URL`.
- Server-only: yes
- Safe example: `/data`
- Railway supplies it automatically: yes, when a volume is attached
- Deployment fails without it: only if `DATABASE_URL` is also missing
- Deterministic fallback works without it: yes, if `DATABASE_URL` is set

## Railway service-setting variable used for reproducible installs

### `RAILPACK_INSTALL_CMD`

- Purpose: tells Railway Railpack to install dependencies with `npm ci`.
- Server-only: build-time only
- Safe example: `npm ci`
- Railway supplies it automatically: no
- Deployment fails without it: no
- Deterministic fallback works without it: yes

Recommended setting:

- `npm ci`

## Recommended Railway production values

- Leave `DATABASE_URL` unset and let the startup script derive `file:${RAILWAY_VOLUME_MOUNT_PATH}/gatherwise.db`
- Set `PERSIST_INTAKE_SUBMISSIONS=false`
- Leave all AI flags off for the public Handshake deployment unless a live AI demo is intentionally enabled
