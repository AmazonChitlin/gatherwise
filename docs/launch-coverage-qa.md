# Launch Coverage QA

Date: 2026-06-23

This pass checks whether the current EventLocal MVP produces useful, clear, non-legal guidance across the initial Arizona launch jurisdictions and use cases. It does not add new permit rules or research new sources.

## Scope

Current verified coverage includes:

- Arizona statewide TPT guidance.
- Maricopa County food-related guidance.
- Phoenix, Tempe, Mesa, Scottsdale, Glendale, Peoria, Chandler, and Gilbert city-level batches.

Current launch use cases checked:

- Retail vendor booth.
- Food truck or temporary food vendor.
- Small outdoor music/art event.
- Multi-vendor market.
- Private-property parking lot event.
- Pop-up venue/host readiness, where existing triggers overlap.

## Scenarios Tested

| Scenario | Expected behavior | Actual behavior |
| --- | --- | --- |
| Retail vendor booth in each launch city | Arizona TPT should stack anywhere `retail_sales` is true. City business, licensing, vendor, or TPT guidance should appear only where verified city rules exist. | Passed. Arizona TPT stacks in every city. City-specific retail/vendor coverage exists for Phoenix, Mesa, Scottsdale, Peoria, Chandler, and Gilbert. Tempe and Glendale currently rely on Arizona TPT only for simple retail intake. |
| Food truck or temporary food vendor in each launch city | Maricopa County food guidance should stack in every launch city when food or food truck triggers are present. Arizona TPT should stack when retail sales are true. | Passed. County food guidance and Arizona TPT stack across all launch cities. City food/vendor guidance appears only where current city rules support it. |
| Small outdoor music/art event in each launch city | City event guidance should appear where current city rules support it. | Passed for Phoenix, Tempe, Mesa, Scottsdale, Glendale, Peoria, and Gilbert. Chandler has a documented gap for a simple private-property music/art event because current Chandler rules are focused on public-property or TSPE/private-property event paths. |
| Multi-vendor market in each launch city | City event/vendor guidance and Arizona TPT should stack where triggers support them. | Passed. Every launch city returns useful guidance, though Tempe remains cautious and Glendale has thinner vendor/business detail. |
| Private-property parking lot event in Phoenix, Chandler, Mesa, and Glendale | Phoenix, Chandler, and Mesa should return city guidance where supported. Glendale should not invent a private-property event rule if unsupported. | Passed. Phoenix, Chandler, and Mesa return city guidance. Glendale currently returns Arizona TPT for retail sales but no simple private-parking city rule unless another verified Glendale trigger applies. |
| Park event in Tempe, Scottsdale, Peoria, Gilbert, and Phoenix | City event or park-adjacent guidance should appear where current rules support it. | Passed. Tempe has park ordinance review. Scottsdale, Peoria, Gilbert, and Phoenix return broader event guidance; Phoenix parks-specific source remains inventory-only. |
| Amplified sound in Tempe and supported cities | Only verified sound-related rules should appear. | Passed. Tempe amplified-sound park review appears. Other cities currently return broader event guidance only, not sound-specific claims. |
| Signage, ticketed event, admission fee, and public advertising refinement | Refined fields should not create standalone checklist items unless reviewed official sources clearly support them. | Passed. Only Tempe amplified-sound guidance is active. Temporary signage, banners, ticketed-event, admission-fee, and public-advertising facts remain future-facing. |
| Temporary structures/tents in Scottsdale and Glendale | Scottsdale and Glendale should return temporary-structure/fire/site-plan style guidance where supported. | Passed. Scottsdale now matches refined tent/canopy guidance, and Glendale now matches refined stage/platform site-plan guidance, while old broad temporary-structure intake remains compatible. |
| Alcohol in Phoenix and Scottsdale | Phoenix and Scottsdale alcohol-specific guidance should appear where supported. | Passed. Phoenix special event liquor and Scottsdale special event liquor checks now use refined `alcohol_present`, while old broad alcohol intake remains compatible. |
| Non-matching city isolation | City-only rules should not leak into any other launch city. | Passed across all city pairs. |
| Arizona/TPT stacking | Statewide TPT should stack with retail scenarios. | Passed. |
| Maricopa County food stacking | County food rules should stack with food-served and food-truck scenarios. | Passed. |
| Right-of-way and traffic-detail refinement | Phoenix, Mesa, and Glendale should match refined traffic/right-of-way fields where current verified sources support them. | Passed. Phoenix and Mesa use refined `right_of_way_use`; Glendale uses refined `traffic_control_needed`; old broad street/sidewalk/parking impact intake remains compatible. |
| No-match result behavior | Empty result helper copy should stay cautious and not imply nothing applies. | Passed after small copy cleanup. |
| Many-match result behavior | Many matched rules should preserve source/verification metadata and group by jurisdiction. | Passed. |

## Coverage By Jurisdiction

| Jurisdiction | Current coverage strength | Launch gaps |
| --- | --- | --- |
| Arizona | Good first-pass TPT coverage for retail-sales triggers. | Add more precise TPT license/source rules and state liquor context later. |
| Maricopa County | Good first-pass food stacking for food-served, food truck, event food, open/prepared food, temperature-controlled food, sampling, and claimed exemption-confirmation scenarios. | Packaged food, drinks with ice/garnish, commissary/base-of-operations, and more detailed exemption facts still need source-specific rules. |
| Phoenix | Useful event, private-property, refined right-of-way, vending/tax, and refined alcohol-present starter coverage. | Parks-specific, primary business/vending/privilege tax, fire, tent, generator, stage/platform, amplified sound, signage, and more precise street/sidewalk/parking/alcohol sub-scenario sources need review. |
| Tempe | Cautious event/park/amplified-sound ordinance review coverage. | Business/TPT, formal special event application/process, right-of-way, fire, food-specific, alcohol, signage, and more current parks permit details need research. |
| Mesa | Stronger starter coverage for special events, refined right-of-way, business license, TPT, and mobile food vendor city guidance. | Parks/facility, sound, signage, liquor, separate street/sidewalk/parking sub-scenarios, and more granular fire/tent/generator/open-flame details need review. |
| Scottsdale | Good starter coverage for special events, business/regulatory license, refined tent/canopy fire review, and refined alcohol-present review. | Guidebook details, traffic/parking, sound, signage, generator/open flame/cooking, park/facility, tent-size thresholds, alcohol sub-scenarios, and food-specific coordination need more work. |
| Glendale | Cautious but useful special event, refined traffic-control, and refined stage/platform site-plan coverage. | Simple retail/business, private-property parking lot, vendor licensing, parks/facility, alcohol, sound, signage, fire, generator, tent/canopy, and food-specific sources remain thin. |
| Peoria | Good starter coverage for special events, business/TPT, and vendor information. | Parks/facility, traffic/right-of-way, fire/tent/generator/open flame, alcohol, sound, signage, and food-specific city details need review. |
| Chandler | Good coverage for public-property events, private-property TSPE events, business registration, and specialty vendor licensing. | Simple private-property music/art, alcohol, fire/temporary structure, food-specific city details, sound, signage, and more traffic/parking detail need review. |
| Gilbert | Good starter coverage for special events, business licensing, vendor interest, and TPT/business license distinction. | Park/facility details, traffic/right-of-way, fire/tent/generator/open flame, alcohol, sound, signage, and food-specific city details need review. |

## Coverage By Use Case

| Use case | Current coverage | Gaps |
| --- | --- | --- |
| Retail vendor booth | Arizona TPT stacks everywhere. City retail/vendor/business guidance exists for Phoenix, Mesa, Scottsdale, Peoria, Chandler, and Gilbert. | Tempe and Glendale need better business/vendor source research. |
| Food truck or temporary food vendor | Maricopa County food guidance stacks across launch cities. Refined county food-detail rules now cover open/prepared food, temperature-control, sampling, and claimed exemption confirmation. Mesa has city mobile food support; city retail/business rules stack where available. | City-specific food rules are sparse. Packaged food, drinks with ice/garnish, and commissary/base-of-operations need more source-specific rules. |
| Small outdoor music/art event | Most cities return event guidance. Tempe has the first active refined amplified-sound rule for park/public-property scenarios. | Chandler simple private-property music/art gap; ticketed event, signage, admission, public advertising, and most city-specific sound/fire detail remains thin. |
| Multi-vendor market | Every city returns useful guidance when retail sales are true. | Vendor-specific depth varies by city; Tempe and Glendale are thinnest. |
| Private-property parking lot event | Phoenix and Chandler are strongest. Mesa returns general event/business/TPT guidance. | Glendale has no simple private-parking city rule yet; other cities need more private-property event specificity. |
| Pop-up venue/host readiness | Existing event/private-property triggers provide some coverage in Phoenix, Tempe, Mesa, Scottsdale, and Chandler. | Venue-specific readiness remains broad and should become a later source/research track. |

## Small Fixes Made

- Changed empty timeline helper copy from “No sample timeline items matched yet” to “No timeline items matched yet.”
- Changed red flag copy from “30-day sample lead time” to “30-day planning lead time.”
- Changed results page no-match heading from “No sample rules matched” to “No rule records matched.”
- Changed no-match body copy from “sample rule set” to “seeded rule set.”
- Added `tests/launch-coverage-qa.test.ts` for launch matrix coverage, city isolation, state/county stacking, source inventory `rulesCreated` alignment, and sample/unverified leakage.

## Intake Refinement Priorities

Status: the intake model now captures these facts for future rules. See `docs/intake-refinement.md`. This QA list remains useful as the source-research priority order.

1. Food detail: cooking, open food, packaged TCS food, sampling type, drinks with ice/garnish, commissary use, and food permit exemption facts.
2. Event impact detail: separate street, sidewalk, parking, traffic control, and right-of-way impacts instead of one combined field.
3. Structure/fire detail: tent size, temporary structure type, generator type, fuel source, temporary power, open flame, cooking heat source, propane, and pyrotechnics.
4. Sales/activity detail: signage, ticketed event, admission fee, merchandise vs services, vendor role vs organizer role.
5. Alcohol detail: alcohol service vs alcohol sales, nonprofit/special event liquor context, BYOB, venue-provided alcohol, and state liquor agency coordination.
6. Park/facility detail: city park, private plaza, school/church/nonprofit property, rented facility, existing licensed venue, and reservation status.

## Remaining Source Research Priorities

1. Tempe: special event application/process, business/TPT, right-of-way, fire, alcohol, signage, and food-specific city guidance.
2. Glendale: business/vendor licensing, private-property parking lot events, parks/facility rules, alcohol, sound, signage, and fire details.
3. Phoenix: primary business/vending/privilege tax pages, parks permits, fire/public assembly, temporary power, tents/canopies, stage/platform, amplified sound, and signage.
4. Chandler: fire/temporary structure, alcohol, food-specific city guidance, sound, signage, and more traffic/parking detail.
5. Scottsdale: guidebook breakdown for vendor, traffic, parking, signage, sound, and operational rules.
6. Mesa, Peoria, and Gilbert: parks/facility, alcohol, traffic/right-of-way, fire/tent/generator/open flame, sound, signage, and city-specific food details.
7. Arizona state: more precise TPT license flow and Arizona Department of Liquor Licenses and Control context before deeper alcohol rules.

## Recommended Next Task

Refine the intake schema for food/fire/event-impact detail before adding more granular food, fire, tent, generator, open-flame, right-of-way, and alcohol rules. This will prevent future verified rules from using triggers that are too broad for reliable launch guidance.
