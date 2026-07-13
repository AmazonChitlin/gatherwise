# Cross-Jurisdiction QA

Date: 2026-06-23

This QA pass checks whether EventLocal can combine verified city and Arizona state guidance without leaking city-only rules across jurisdictions. It does not add new permit rules or research new sources.

## Scenarios Tested

| Scenario | Expected behavior | Actual behavior |
| --- | --- | --- |
| Mesa retail vendor booth on private property selling taxable items | Mesa business/TPT city guidance should stack with Arizona TPT guidance. | Passed after fixing the Arizona TPT trigger to match by `state: "AZ"` plus `retail_sales` instead of exact `jurisdiction_code: "az"`. |
| Mesa mobile food vendor or food truck at an event | Mesa mobile food guidance, verified Maricopa County food guidance, and Arizona TPT guidance should stack where triggers support them. | Passed after adding the verified Maricopa County food batch. Mesa mobile food, Maricopa County food registration/temporary/mobile food, and Arizona TPT can match together. |
| Chandler public-property special event with multiple vendors | Chandler public-property event guidance and supported vendor guidance should appear. | Passed. Chandler public special event, specialty vendor, and Arizona TPT can match where triggers support them. |
| Scottsdale event with temporary structures, open flame, generator, or cooking | Scottsdale fire/tent-related guidance should appear where current intake fields support it. | Passed for refined `tent_or_canopy` and backward-compatible `temporary_structure`. Generator, open flame, and cooking-specific Scottsdale rules are intentionally not represented yet. |
| Glendale event with street, sidewalk, parking, or traffic impact | Glendale event and traffic-impact guidance should appear. | Passed. Glendale special event and traffic-impact rules match. |
| Gilbert vendor participating in a special event | Gilbert special event, vendor-interest, business/TPT, and Arizona TPT guidance should appear where triggers support them. | Passed. |
| Peoria vendor/seller at a special event | Peoria special event, vendor, business/TPT, and Arizona TPT guidance should appear where triggers support them. | Passed. |
| Phoenix private-property food truck or vendor event | Phoenix private-property/vending guidance, Maricopa County food guidance, and Arizona TPT guidance should stack where triggers support them. | Passed after adding the verified Phoenix batch. Phoenix private-property ATUP, Phoenix vending/temporary tax, Maricopa County mobile/market food, and Arizona TPT guidance can match together. |
| Tempe park or special event with food/vendor activity | Tempe event or park review guidance should stack with Maricopa County food guidance and Arizona TPT guidance where triggers support them. | Passed after adding the cautious verified Tempe batch. Tempe event/park ordinance review, Maricopa County mobile/market food, and Arizona TPT guidance can match together. |
| Non-matching jurisdiction check | Mesa intake should not match Chandler, Scottsdale, Glendale, Gilbert, or Peoria city-only rules. Chandler intake should not match Mesa, Scottsdale, Glendale, Gilbert, or Peoria city-only rules. | Passed. City-only rules remain isolated by normalized jurisdiction code and city triggers. |

## Fixes Made

- Updated the verified Arizona TPT proof-of-concept rule trigger so it can stack with city intakes using `state: "AZ"` and `retail_sales: true`.
- Replaced the old sample Maricopa food placeholder with verified Maricopa County food rules based on reviewed official Environmental Services sources.
- Refined the Maricopa County temporary-food coverage to use specific food intake fields for open/prepared food, temperature-controlled food, food sampling, and claimed exemption confirmation.
- Refined Scottsdale and Glendale structure-related coverage to use `tent_or_canopy` and `temporary_stage_or_platform` while preserving legacy temporary-structure compatibility.
- Refined Phoenix, Mesa, and Glendale traffic/right-of-way coverage to use `right_of_way_use` and `traffic_control_needed` while preserving legacy street/sidewalk/parking impact compatibility.
- Refined Phoenix and Scottsdale alcohol coverage to use `alcohol_present` while preserving legacy broad alcohol compatibility.
- Refined Tempe amplified-sound coverage to use the collected `amplified_sound` field while leaving temporary signage, banners, ticketing, admission, and public advertising future-facing until stronger source support exists.
- Replaced the old sample Phoenix event/vendor placeholder with verified Phoenix rules based on reviewed official Temporary Assembly, Outdoor Events, and Special Event Liquor sources.
- Replaced the old sample Tempe event/vendor placeholder with cautious verified Tempe rules based on the official Tempe Special Events and Parks Ordinances source.
- Added cross-jurisdiction QA tests for mixed city/state results, city-only isolation, food scenario honesty, source/verification metadata, and lead-time sorting.
- Updated results page copy from "sample results" and "sample rules" to more accurate "results" and "seeded rule records."
- Updated the results page agency contacts card to show phone and email when matched rules include those fields.

## Results Page Review

- Disclaimer remains visible in the right-side results column and in the no-intake state.
- Paid roadmap/vendor packet CTA remains disabled and clearly labeled as a future paid feature.
- Source links are visible for each checklist item.
- Verification labels and verification messages are visible for each checklist item.
- Jurisdiction grouping is readable, but group order currently follows sorted result insertion order rather than a dedicated state/county/city hierarchy.
- Lead-time sorting works within groups and engine sorting prioritizes requirement level, lead time, jurisdiction type, confidence, then title.
- No legal-conclusion wording was added. Result wording still uses "may be required," "likely required," "confirm with agency," and "informational guidance only, not legal advice."

## Rule Engine Review

- Statewide rules can stack with city rules when statewide triggers use `state` rather than exact city-level `jurisdiction_code`.
- City-only rules stay city-only through normalized jurisdiction and city matching.
- Empty or invalid trigger records still fail safely unless `global: true` is explicit.
- Food scenarios now stack city, county, and state guidance where triggers support it. Maricopa County food rules match by county so they can appear alongside city rules for launch cities in Maricopa County. Detailed county food rules now use refined food triggers where source support exists.
- Cautious placeholder lead times display as normal lead-time values today. The admin notes document assumptions, but the user-facing results page does not yet distinguish published lead times from cautious planning placeholders.

## Intake Field Gaps

- Refined signage and promotion fields are now collected, including temporary signage, banners, ticketed event, admission fee, public advertising, and amplified sound.
- Only `amplified_sound` is currently active in verified rules. Temporary signage, banners, ticketed event, admission fee, and public advertising remain future-facing until reviewed official sources support narrower rules.
- `cooking` is not collected as a separate field. It is partly implied by food/open flame but should probably become explicit before more food/fire rules are added.
- Food handling details such as open food, packaged TCS food, sampling type, drinks with ice/garnish, commissary use, and permit exemption facts are not collected yet.
- `generator_use`, `open_flame`, `temporary_structure`, `alcohol`, `street/sidewalk/parking impact`, `public/private property`, `vendor_count`, `food`, and `food_truck` are collected.
- Street, sidewalk, and parking impacts are currently one combined intake field. Some future rules may need these split.
- Refined street, sidewalk, parking, traffic, and right-of-way fields are now collected; Phoenix, Mesa, and Glendale use selected refined triggers, while several sub-fields remain future-facing until more source-specific rules are created.
- Refined alcohol fields are now collected; Phoenix and Scottsdale use `alcohol_present`, while alcohol sales, free service, BYOB, and public-property alcohol remain future-facing as standalone rule triggers.

## Remaining Gaps

- Maricopa County food rules now include a first detail refinement for open/prepared food, temperature-controlled food, food sampling, and claimed exemption confirmation. Packaged food, drinks with ice/garnish, and commissary/base-of-operations still need more source-specific rules.
- Tempe now has a first cautious verified city batch, but business/tax, special event application, right-of-way, fire, food-specific, alcohol, and signage sources still need research before creating more precise Tempe rules.
- Phoenix now has a first verified city batch, but primary vending/business/privilege tax, parks, fire, temporary power, tent/canopy, amplified sound, and signage sources still need review.
- Glendale business licensing and vendor-specific licensing remain unconverted because reviewed source coverage is not strong enough yet.
- Scottsdale generator/open flame/cooking rules still need more granular source support; the current verified refinement covers tents/canopies only.
- Results page does not deduplicate near-duplicate concepts from different official sources. The current QA found no duplicate slugs, but future rule batches may need a topic/category grouping layer.
- Agency contacts now display name, website, phone, and email where available, but checklist item cards still show only the agency name.

## Recommended Next Task

Add any remaining controlled verified source batches for launch jurisdictions, or refine food/fire/right-of-way intake fields before adding more granular rules.
