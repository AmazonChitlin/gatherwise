# Gatherwise Deployment Checklist

Use this checklist before pointing a public Handshake submission at the hosted Gatherwise deployment.

## Branch and release gate

- Branch is `showcase/gatherwise-handshake`
- Latest release-preparation baseline was audited from `48807eb`
- Working tree is clean before release-prep changes
- No `.env` file is committed
- No verified rule logic or official source records were changed in the deployment prep

## Railway service settings

- Repository: `AmazonChitlin/gatherwise`
- Branch: `showcase/gatherwise-handshake`
- Root directory: `/`
- Attached persistent volume: yes
- Volume mount path: `/data`
- Health check path: `/api/health`
- Restart policy: `On Failure`
- Public domain generated

## Required Railway variables

- `RAILPACK_INSTALL_CMD=npm ci`
- `PERSIST_INTAKE_SUBMISSIONS=false`

Optional explicit database override:

- `DATABASE_URL=file:/data/gatherwise.db`

Public deterministic deployment should leave live AI variables unset unless intentionally demonstrating live AI.

## Local verification before deployment

1. `npm ci`
2. `npm run prisma:generate`
3. `npx prisma migrate deploy`
4. `npm run prisma:seed`
5. `npm run typecheck`
6. `npm test`
7. `npm run eval:gatherwise`
8. `npm run build`
9. Start the production server
10. Smoke-test `/`, `/showcase`, `/about`, `/intake`, `/sources`, `/api/health`

## Hosted smoke-test expectations

- `/showcase` loads directly
- no login is required
- guided samples still work
- manual path still works
- natural-language path fails safely when AI is disabled
- Evidence Trail renders
- Readiness Route renders
- Event Change Simulator renders
- official source links remain real and trusted
- unsupported jurisdictions are refused instead of guessed

## Operational guardrails

- Do not run `prisma migrate dev` in production
- Do not seed through an unsafe manual reset flow
- Do not rely on Railway pre-deploy for SQLite volume initialization
- Do not scale the service to multiple replicas while using the Railway volume
- Do not enable raw event-description retention by default
