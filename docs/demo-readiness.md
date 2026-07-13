# EventLocal Demo Readiness

Date: 2026-06-23

Use this guide to demo EventLocal honestly. The MVP is a local event readiness tool. It provides informational guidance only, not legal advice. It does not submit permits, guarantee compliance, process payments, or generate paid roadmaps yet.

## Run The App Locally

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Open `http://localhost:3000`.

Recommended pre-demo checks:

```bash
npm test
npm run typecheck
npx prisma validate
npm run build
```

## Recommended Demo Setup

1. Start with a freshly seeded local database so demo results match the verified starter rule set.
2. Open the home page and point to the promise: `Get your local event ready before you set up.`
3. Show the intake form as practical setup questions, not legal paperwork.
4. Submit one strong stacking scenario first so the results page shows city, county, and state guidance together.
5. Walk through the results dashboard: event summary, top items, timeline, jurisdiction groups, agency contacts, source links, verification labels, disclaimer, and future-only paid CTA.
6. End with a no-match or low-match scenario to show that EventLocal is honest about uncertainty.

## Recommended Demo Scenarios

### 1. Phoenix Private-Property Food/Vendor Event

Suggested intake:

- City: Phoenix
- County: Maricopa County
- Use case: Food truck or temporary food vendor
- Event type: Food service or vendor pop-up
- Property: Private property or parking lot
- Turn on food, food truck/mobile unit, retail sales, and any relevant parking lot details

What this should show:

- Phoenix city guidance where triggers support it.
- Maricopa County food guidance for food truck or food-served details.
- Arizona TPT guidance when retail sales are true.
- City + county + state stacking on one results page.

### 2. Mesa Food Truck Scenario

Suggested intake:

- City: Mesa
- County: Maricopa County
- Use case: Food truck or temporary food vendor
- Event type: Food service or vendor pop-up
- Turn on food, food truck/mobile unit, and retail sales

What this should show:

- Mesa city guidance.
- Maricopa County food guidance.
- Arizona TPT guidance where retail sales are true.
- Agency contacts and official source links grouped by jurisdiction.

### 3. Scottsdale Temporary Structure / Tent Scenario

Suggested intake:

- City: Scottsdale
- Use case: Small outdoor music/art event or multi-vendor market
- Event type: Music/art event or community gathering
- Turn on temporary structure and tent/canopy
- Add tent size if useful for the conversation

What this should show:

- Scottsdale event guidance where supported.
- Scottsdale tent/canopy or fire-review guidance where supported.
- Clear lead-time and verification labels.

### 4. Tempe Amplified Sound / Park Event

Suggested intake:

- City: Tempe
- Use case: Small outdoor music/art event
- Event type: Community gathering or music/art event
- Property: Park or plaza
- Turn on city park/facility and amplified sound

What this should show:

- Tempe park or special-event guidance where supported.
- Amplified-sound guidance where current verified rules support it.
- Practical wording that asks users to confirm with the agency.

### 5. Glendale Traffic-Impact Event

Suggested intake:

- City: Glendale
- Use case: Small outdoor music/art event or multi-vendor market
- Event type: Music/art event or community gathering
- Turn on street/sidewalk/parking impacts, traffic control needed, or parking spaces blocked

What this should show:

- Glendale special-event guidance where supported.
- Glendale traffic-impact guidance where supported.
- Refined traffic fields improving match specificity.

### 6. Non-Food Retail Booth

Suggested intake:

- City: any supported launch city
- Use case: Retail vendor booth
- Event type: Vendor pop-up
- Turn on retail sales
- Leave food, food truck, sampling, and temperature-control fields off

What this should show:

- Arizona TPT guidance where retail sales are true.
- City vendor/business guidance where supported by verified city rules.
- Food-specific Maricopa County rules should not appear.

### 7. No-Match Or Low-Match Scenario

Suggested intake:

- City: Arizona state-level or another lightly matched setup
- Use case: Venue/host readiness
- Event type: Venue-hosted event
- Property: Licensed venue or private property
- Leave food, retail, alcohol, sound, structures, and traffic impacts off

What this should show:

- The no-match state does not imply nothing applies.
- The copy tells the user to confirm with the city, county, state, venue, or relevant agency.
- EventLocal is careful about uncertainty instead of pretending coverage is complete.

## What The Demo Should Show

- EventLocal is not a government portal; it is a local event readiness tool.
- Intake answers drive source-linked rule matching.
- City, county, and state guidance can stack when the event facts support it.
- Results use cautious wording: `Likely required`, `May be required`, and `Confirm with agency`.
- Results include source links, agency contacts, confidence labels, verification status, lead times, and red flags.
- The paid roadmap/vendor packet CTA is future-only and disabled.

## Known Limitations To Mention Honestly

- Verified rule coverage is starter MVP coverage, not every possible Arizona event requirement.
- Source inventory still includes inventory-only records and research gaps.
- Requirements can change, and EventLocal does not automatically refresh government source pages.
- Some refined intake fields are collected before verified rules use them directly.
- Lead times may be cautious planning values unless an official source clearly states a deadline.
- No admin UI, CMS, auth, payments, PDF generation, uploads, document vault, subscriptions, venue listings, or marketplace features exist yet.
- There is no end-to-end browser test suite yet.
- SQLite is used locally; Postgres migration remains a future review task.

## What Not To Claim

- Do not claim legal advice.
- Do not claim compliance.
- Do not claim permits are submitted.
- Do not claim every possible rule is covered.
- Do not claim paid roadmap or vendor packet purchasing is active.
- Do not claim PDF generation, accounts, dashboards, uploads, subscriptions, venue listings, or marketplace features are active.
- Do not claim source data updates automatically.

## Next Recommended Build Tasks After Demo Feedback

1. Run usability sessions with a vendor, food truck operator, organizer, and venue host using the scenarios above.
2. Capture confusing intake labels and refine wording before adding more fields.
3. Add a simple coverage report script for current rules by jurisdiction, trigger, and use case.
4. Add an end-to-end smoke test for intake submission and results display.
5. Prioritize the next verified official-source gaps based on demo feedback.
6. Review Postgres migration readiness before adding accounts, payments, uploads, or subscriptions.
