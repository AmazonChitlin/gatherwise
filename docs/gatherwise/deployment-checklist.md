# Gatherwise Deployment Checklist

Use this checklist for a clean Handshake-ready deployment of the current Gatherwise branch.

## Before Deploying

- Confirm the branch is `showcase/gatherwise-handshake`.
- Confirm the working tree is clean.
- Confirm `.env` values are present for the target environment.
- Keep AI feature flags disabled unless the server-side key and model configuration are intentionally enabled.

## Install and Prepare

1. Run `npm ci`
2. Provide environment variables or copy `.env.example` and adjust as needed
3. Run `npm run prisma:generate`
4. Run `npx prisma migrate deploy`
5. Run `npm run prisma:seed`

## Verify Before Release

1. Run `npm run typecheck`
2. Run `npm test`
3. Run `npm run eval:gatherwise`
4. Run `npm run build`
5. Run `npm start`
6. Smoke test:
   `http://localhost:3000/showcase`
7. Smoke test:
   `http://localhost:3000/intake`
8. Smoke test:
   `http://localhost:3000/sources`

## Public Demo Checks

- Open a fictional guided sample from `/intake`
- Build the readiness summary
- Confirm the results page shows the Readiness Route
- Confirm the results page shows the Evidence Trail
- Confirm official source links render from trusted records
- Confirm the manual path remains available when AI is disabled

## Release Guardrails

- Do not expose unsupported jurisdictions as verified guidance.
- Do not enable client-side AI credentials.
- Do not retain raw event descriptions unless the retention decision changes explicitly.
- Do not treat local writable SQLite storage as the production durability plan; seedable verified data and short-lived demo sessions remain the safe baseline.
