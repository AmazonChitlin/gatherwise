# Intake Refinement

Date: 2026-06-23

This update makes the EventLocal intake more useful for future verified food, fire, alcohol, signage, ticketed-event, parking/traffic, and park/facility rules. It does not add new permit rules.

## What Changed

The intake form now groups questions into practical sections:

- Food and sales.
- Alcohol.
- Fire and temporary structures.
- Street, sidewalk, parking, and traffic.
- Signage, sound, and promotion.
- Park, facility, and property details.

The goal is to capture more precise facts before future rules are written, so the rule engine does not have to guess from broad answers.

## New Intake Fields

Food details:

- `foodIsPrepackaged`
- `foodIsOpenOrPreparedOnSite`
- `foodRequiresTemperatureControl`
- `foodSampling`
- `drinksWithIceOrGarnish`
- `foodTruckOrMobileFoodUnit`
- `commissaryOrBaseOfOperations`
- `believesFoodExemptionMayApply`

Fire and temporary structure details:

- `tentOrCanopy`
- `tentSizeRange`
- `temporaryStageOrPlatform`
- `cookingHeatSource`
- `propaneOrFuelUse`

Street, sidewalk, parking, and traffic details:

- `streetClosure`
- `sidewalkUseOrClosure`
- `parkingLotUse`
- `parkingSpacesBlocked`
- `trafficControlNeeded`
- `rightOfWayUse`

Alcohol details:

- `alcoholPresent`
- `alcoholSold`
- `alcoholServedFree`
- `alcoholByob`
- `alcoholOnPublicProperty`

Signage and promotion details:

- `temporarySignage`
- `banners`
- `ticketedEvent`
- `admissionFee`
- `publicAdvertising`

Park, facility, and property details:

- `cityParkOrFacility`
- `privateProperty`
- `publicProperty`
- `venueOrPropertyOwnerPermission`
- `indoorOrOutdoor`
- `recurringEvent`

## Storage Approach

No Prisma migration was added for this task.

The existing `IntakeSubmission.rawAnswers` field stores the refined intake answers as JSON. Existing summary columns, such as `hasFood`, `hasAlcohol`, `hasTemporaryStructure`, `hasStreetClosure`, `hasParkingImpact`, `hasSignage`, and `isTicketed`, are still populated for compatibility.

This avoids adding dozens of columns before the future rule set proves which fields need reporting, indexing, or admin workflows.

## Trigger Support

The rule engine now supports these future snake_case trigger keys:

- `food_is_prepackaged`
- `food_is_open_or_prepared_on_site`
- `food_requires_temperature_control`
- `food_sampling`
- `drinks_with_ice_or_garnish`
- `food_truck_or_mobile_food_unit`
- `commissary_or_base_of_operations`
- `believes_food_exemption_may_apply`
- `alcohol_present`
- `alcohol_sold`
- `alcohol_served_free`
- `alcohol_byob`
- `alcohol_on_public_property`
- `city_park_or_facility`
- `venue_or_property_owner_permission`
- `indoor_or_outdoor`
- `indoor_or_outdoor_values`
- `street_closure`
- `sidewalk_use_or_closure`
- `parking_lot_use`
- `parking_spaces_blocked`
- `traffic_control_needed`
- `right_of_way_use`
- `tent_or_canopy`
- `tent_size_range`
- `tent_size_ranges`
- `temporary_stage_or_platform`
- `cooking_heat_source`
- `propane_or_fuel_use`
- `temporary_signage`
- `banners`
- `admission_fee`
- `public_advertising`

Seed validation also accepts these trigger keys, so future seed rules can fail fast if a trigger name is misspelled.

## Backward Compatibility

Existing broad trigger keys remain supported:

- `food_service`
- `food_truck`
- `retail_sales`
- `alcohol`
- `amplified_sound`
- `public_property`
- `private_property`
- `sidewalk_or_street_closure`
- `temporary_structure`
- `generator_use`
- `open_flame`
- `signage`
- `ticketed_event`
- `multi_vendor_event`
- `recurring_event`

Refined answers map back into the broad facts. For example:

- `foodSampling` or `foodIsOpenOrPreparedOnSite` can satisfy `food_service`.
- `foodTruckOrMobileFoodUnit` can satisfy `food_truck`.
- `alcoholSold`, `alcoholServedFree`, `alcoholByob`, or `alcoholOnPublicProperty` can satisfy `alcohol`.
- `tentOrCanopy` or `temporaryStageOrPlatform` can satisfy `temporary_structure`.
- `cookingHeatSource` or `propaneOrFuelUse` can satisfy `open_flame`.
- `streetClosure`, `sidewalkUseOrClosure`, `parkingSpacesBlocked`, `trafficControlNeeded`, or `rightOfWayUse` can satisfy `sidewalk_or_street_closure`.
- `temporarySignage` or `banners` can satisfy `signage`.

Old submissions remain safe because missing refined fields default to false or unspecified during rule matching.

## Future Rules This Supports

These fields prepare the app for more precise future rules, including:

- Maricopa County food permit categories and exemptions.
- Mobile food unit and commissary checks.
- Food sampling and open-food handling checks.
- Fire review for tents, stages, propane, generators, cooking, and open flame.
- Right-of-way, street closure, sidewalk use, parking, and traffic control checks.
- Alcohol sales, free service, BYOB, and public-property alcohol review.
- Temporary signage, banners, ticketed event, and public advertising checks.
- Park/facility reservation and city facility use checks.

## Active Refined Food Rules

The first verified Maricopa County food-detail refinement batch now uses these refined food fields:

- `foodIsOpenOrPreparedOnSite`, matched by `food_is_open_or_prepared_on_site`, for open, handled, or prepared-on-site food review.
- `foodRequiresTemperatureControl`, matched by `food_requires_temperature_control`, for hot/cold temperature-control food review.
- `foodSampling`, matched by `food_sampling`, for food or drink sampling review.
- `foodTruckOrMobileFoodUnit`, matched through existing mobile food rules via compatibility with `food_truck`.
- `believesFoodExemptionMayApply`, matched by `believes_food_exemption_may_apply`, as a confirm-with-agency item, not an exemption conclusion.

The older broad Maricopa County temporary-food rule was replaced with these more specific records to avoid showing duplicate near-identical county food items for the same source and scenario.

Food fields still future-facing only:

- `foodIsPrepackaged`
- `drinksWithIceOrGarnish`
- `commissaryOrBaseOfOperations`

These fields are collected and available to the rule engine, but no verified rule currently depends on them directly. They should be activated only after a reviewed official source supports a specific checklist item.

Food-detail assumptions:

- Temperature-control matching stays at `may be required` because the current converted source supports county food review but should not be treated as a legal conclusion.
- Claimed exemptions are surfaced only as `confirm with the agency`.
- Packaged, non-temperature-control scenarios continue to show broad event food registration guidance when food is served, but do not trigger the new open/prepared, temperature-control, or sampling detail rules.

## Active Refined Fire And Structure Rules

The first verified city fire/temporary-structure refinement now uses these refined fields:

- `tentOrCanopy`, matched by `tent_or_canopy`, for Scottsdale fire permit review for tents and canopies.
- `temporaryStageOrPlatform`, matched by `temporary_stage_or_platform`, for Glendale special event site-plan review involving stages or platforms.

The older broad `temporary_structure` intake remains backward compatible. If an older submission only has `hasTemporaryStructure`, the rule engine maps that broad fact into the refined tent/canopy and stage/platform facts so existing verified rules still match.

Fire and structure fields still future-facing only:

- `tentSizeRange`
- `generatorUse`
- `openFlame`
- `cookingHeatSource`
- `propaneOrFuelUse`

These facts are collected and available to future rules, but this batch does not create standalone generator, open-flame, cooking-heat, propane, or tent-size threshold claims. The current reviewed sources do not support those as separate verified checklist items without more source review.

Fire/tent/generator assumptions:

- Scottsdale tent/canopy review uses the existing Fire Permit Services source and keeps the 10-day planning warning from the prior rule.
- Glendale stage/platform review uses the existing Special Event Permit source and keeps the 30-day complete/final document planning milestone.
- Generator language remains inside Glendale source context only; it was not converted into a generator-specific rule.
- Open flame, cooking heat, propane/fuel, and precise tent-size threshold rules should be added only after more specific official source language is reviewed.

## Active Refined Traffic And Right-Of-Way Rules

The first verified city right-of-way/traffic refinement now uses these refined fields:

- `rightOfWayUse`, matched by `right_of_way_use`, for Phoenix public park, street, or right-of-way event review.
- `rightOfWayUse`, matched by `right_of_way_use`, for Mesa right-of-way special event review.
- `trafficControlNeeded`, matched by `traffic_control_needed`, for Glendale traffic or barricade review.

The older broad `hasStreetSidewalkOrParkingImpact` intake remains backward compatible. If an older submission only has that broad field, the rule engine maps it into refined street, sidewalk, parking, traffic, and right-of-way facts so existing verified rules still match.

Traffic fields still future-facing only:

- `streetClosure`
- `sidewalkUseOrClosure`
- `parkingLotUse`
- `parkingSpacesBlocked`

These facts are collected and available to future rules, but this batch does not create standalone street-closure, sidewalk-use, parking-lot, or blocked-parking-space rules. The current reviewed sources support broader right-of-way or traffic-review guidance, not every separate traffic sub-scenario.

Traffic/right-of-way assumptions:

- Phoenix uses the reviewed Outdoor Events source and remains tied to right-of-way/public-event review.
- Mesa uses the reviewed Special Event License source and its longer right-of-way planning context.
- Glendale uses the reviewed Special Event Permit source and its traffic operation plan/barricade context.
- Chandler public-property event coverage remains active through `public_property`; no separate Chandler traffic/right-of-way rule was created in this batch.

## Active Refined Alcohol Rules

The first verified alcohol refinement uses one refined field:

- `alcoholPresent`, matched by `alcohol_present`, for Phoenix and Scottsdale special-event liquor review.

The older broad `hasAlcohol` intake remains backward compatible. If an older submission only has `hasAlcohol`, the rule engine maps that broad fact into `alcohol_present` so the existing Phoenix and Scottsdale verified alcohol rules still match.

Alcohol fields still future-facing as standalone triggers:

- `alcoholSold`
- `alcoholServedFree`
- `alcoholByob`
- `alcoholOnPublicProperty`

These facts are collected and can contribute to the broader alcohol-present fact, but no separate alcohol-sales, free-service, BYOB, or public-property alcohol checklist item was added in this refinement. Those distinctions should become standalone rules only after reviewed official sources clearly support them.

Alcohol assumptions:

- Phoenix uses the reviewed Special Event Liquor Licenses source and remains cautious about the city and Arizona Department of Liquor Licenses and Control approval path.
- Scottsdale uses the reviewed Special Event Liquor source and its 20-day submission note.
- The current rules do not say alcohol is allowed or prohibited and do not conclude which license applies. They only tell users to confirm the right review, permit, or license path with the listed agency.

## Active Refined Signage And Promotion Rules

The first verified signage/promotion refinement uses one refined field:

- `hasAmplifiedSound`, matched by `amplified_sound`, for Tempe park or public-property event sound review.

No standalone signage, banner, ticketed-event, admission-fee, or public-advertising rules were added. The reviewed source support is not specific enough yet to create those checklist items without risking duplicate or overly broad guidance.

Signage and promotion fields still future-facing only:

- `temporarySignage`
- `banners`
- `ticketedEvent`
- `admissionFee`
- `publicAdvertising`

These facts are collected and available to future rules, but they should be activated only after a reviewed official source clearly supports a specific checklist item. Broad special-event pages should not be split into signage or ticketing rules unless the source says enough to support that narrower trigger.

Signage/ticketed-event/public-promotion assumptions:

- Tempe amplified-sound matching stays limited to park or public-property style intake because the converted Tempe source is parks-focused.
- Scottsdale's reviewed special-event source mentions events open to the public by advertisement or invitation, but it remains part of the general special-event rule instead of a separate `public_advertising` rule to avoid duplicate results.
- No reviewed official source currently supports a standalone `temporary_signage`, `banners`, `ticketed_event`, or `admission_fee` rule.

## Intentionally Not Built

This task did not add:

- New permit or license rules.
- New official source research.
- Admin UI.
- Payments.
- Auth.
- PDF generation.
- Document uploads.
- Venue listings.
- A multi-step wizard.
- A Prisma migration for every refined fact.

## Remaining UX Concerns

The form is still one page and now has more questions. It is grouped and plain-English, but a future task may turn it into a lightweight progressive flow if the form starts feeling too long.

## Recommended Next Task

Use the refined intake fields to add the next small verified rule batch for one narrow area, such as Maricopa County food detail or city fire/tent/generator guidance. Keep the batch small so each new trigger can be checked against real official source language.
