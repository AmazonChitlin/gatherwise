# Gatherwise Post-Deployment Smoke Test

Use this checklist after a Railway deployment becomes healthy. These checks are for the hosted environment and should be run against the generated public domain.

## Direct route checks

1. Open `/`
2. Open `/showcase`
3. Open `/about`
4. Open `/intake`
5. Open `/sources`
6. Open `/api/health`

Expected results:

- each public page loads without a server error
- `/showcase` loads directly without needing the homepage first
- `/api/health` returns `200` with `{"status":"ok"}`

## Public demo checks

1. From `/intake`, confirm both starting paths appear:
   `Describe my event` and `Use the guided form`
2. Trigger the describe path while AI is disabled
3. Confirm the UI falls back safely and offers the guided form
4. Open a fictional guided sample
5. Build the readiness summary
6. Confirm the results page shows:
   - Readiness summary
   - Evidence Trail
   - Readiness Route
   - Event Change Simulator
7. Open at least one official source link
8. Open an unsupported-jurisdiction sample or path
9. Confirm the product refuses unsupported geography instead of guessing

## Manual-path checks

1. Start with `Use the guided form`
2. Submit a minimal valid intake
3. Confirm a results page is returned
4. Confirm official source links render
5. Confirm the results copy still separates verified results from missing information

## Browser checks

- Check the browser console for errors or secret leakage
- Check the network panel for failed page or API requests
- Check mobile-width rendering for horizontal overflow on `/showcase` and `/intake`

## Restart check

1. Trigger a Railway redeploy or restart
2. Wait for `/api/health` to return `200` again
3. Re-open `/showcase`
4. Re-run one guided demo sample

Expected results:

- the service returns after restart
- the seeded verified rules and source-backed demo results still work
- AI-disabled fallback behavior is unchanged
