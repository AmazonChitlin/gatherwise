# Gatherwise Railway Deployment

This guide prepares the current Gatherwise branch for a direct Railway deployment from GitHub without changing product behavior.

## Deployment target

- Repository: `AmazonChitlin/gatherwise`
- Branch: `showcase/gatherwise-handshake`
- Root directory: `/`
- Public Handshake route after deploy: `/showcase`

## Why the deployment uses a Railway volume

The approved architecture keeps Prisma + SQLite. Railway's current documentation says:

- volumes are mounted only when the service container starts
- volumes are not mounted during build time
- volumes are not mounted during pre-deploy time
- replicas cannot be used with volumes
- Railway prevents multiple active deployments from mounting the same volume at once, which causes brief downtime during redeploys

Because of that behavior, Gatherwise does **not** run SQLite migrations in Railway's pre-deploy phase. The committed startup script performs:

1. SQLite path setup
2. `prisma migrate deploy`
3. idempotent seed
4. application start

## Files added for Railway

- `railway.toml`
- `scripts/start-railway.sh`
- `app/api/health/route.ts`

## Dashboard steps

### 1. Create the Railway project

1. Sign in to Railway.
2. Create a new project.
3. Choose **Deploy from GitHub repo**.
4. Select `AmazonChitlin/gatherwise`.
5. Set the source branch to `showcase/gatherwise-handshake`.

### 2. Configure the service source

In the service settings:

- Root directory: `/`
- Config as Code file: leave default root detection, because `railway.toml` is in the repo root

### 3. Attach a persistent volume

1. Add a volume to the service.
2. Set the mount path to `/data`.
3. Keep a single replica only.

Why `/data`:

- it is short
- it avoids local absolute paths
- it matches the documented SQLite example path: `file:/data/gatherwise.db`

### 4. Set Railway service variables

Enter these service variables:

- `RAILPACK_INSTALL_CMD=npm ci`
- `NEXT_PUBLIC_SITE_URL=https://gatherwise-production.up.railway.app`
- `PERSIST_INTAKE_SUBMISSIONS=false`

Leave these unset for the public deterministic deployment:

- `OPENAI_API_KEY`
- `GATHERWISE_AI_EXTRACTION_ENABLED`
- `GATHERWISE_AI_MODEL`
- `GATHERWISE_AI_EXPLANATION_ENABLED`
- `GATHERWISE_AI_EXPLANATION_MODEL`

Do not set `DATABASE_URL` unless you want to override the committed startup default.

If you choose to set it explicitly, use:

- `DATABASE_URL=file:/data/gatherwise.db`

### 5. Confirm Railway build and deploy behavior

The committed `railway.toml` config sets:

- Build command: `npm run prisma:generate && npm run build`
- Start command: `./scripts/start-railway.sh`
- Health check path: `/api/health`
- Health check timeout: `120`
- Restart policy: `ON_FAILURE` with `10` retries

Pre-deploy command:

- none

Reason:

- Railway does not mount volumes during pre-deploy, so SQLite migration and seed work must happen inside the runtime start path.

## Startup behavior on Railway

When the service starts:

1. The script checks `DATABASE_URL`.
2. If `DATABASE_URL` is missing and Railway has mounted a volume, the script derives:
   `file:${RAILWAY_VOLUME_MOUNT_PATH}/gatherwise.db`
3. The script creates the SQLite directory if needed.
4. The script acquires a small lock directory so two concurrent starts do not initialize the same SQLite file at once.
5. The script runs `npx prisma migrate deploy`.
6. The script runs `npm run prisma:seed`.
7. The script starts Next.js on Railway's `PORT`.

## Production database behavior

- Provider: SQLite
- Storage location: Railway volume
- Expected path: `/data/gatherwise.db`
- Migration command: `npx prisma migrate deploy`
- Seed command: `npm run prisma:seed`
- Seed behavior: idempotent upserts for verified rules, agencies, jurisdictions, and use cases
- Ordinary deployments do not reset the database

## Backup and recovery behavior

- Use Railway volume backups for hosted recovery.
- The verified rule and source dataset is also reproducible from version-controlled migrations plus `prisma/seed.ts`.
- If the volume is replaced, the next startup will recreate the SQLite file, apply migrations, and reseed verified data.
- If `PERSIST_INTAKE_SUBMISSIONS=false`, public demo intake sessions stay stateless and do not need long-term recovery.

## Redeploy behavior

- Railway will rebuild the container from the selected branch.
- The new deploy will start against the same mounted volume.
- Because Railway blocks multiple active deployments on the same volume, expect brief downtime during redeploy.
- Migrations and seed will re-run safely at startup.

## What this guide does not claim

- It does not claim that a live Railway deployment has already been performed.
- It does not claim zero-downtime SQLite redeploys on Railway.
- It does not claim durable public write behavior beyond the attached volume.
