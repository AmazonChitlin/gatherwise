# Official Source Inventory

This inventory tracks official source pages before they become EventLocal rule records. It is intentionally separate from `RuleRecord` seed data.

Source inventory answers: `What official pages should we review?`

Rule records answer: `What plain-English checklist item should appear for a specific intake?`

Do not create rules from a source until the source has been reviewed, the agency context is clear, and the rule can be written without legal certainty.

## Where Sources Live

- Source inventory data: `prisma/seed-data/source-inventory.ts`
- Source inventory validation: `prisma/source-inventory-validation.ts`
- Source inventory tests: `tests/source-inventory-validation.test.ts`

The inventory is config-backed for now, not database-backed. The current Prisma schema does not have a dedicated source inventory model. A future database migration can add one when an admin review workflow or CMS exists.

## Status Values

- `official_reviewed`: A human reviewed the URL and it appears to be an official government or agency source.
- `needs_review`: A possible source exists, but it needs more review before it should be treated as official.
- `needs_research`: No source URL is included yet. This tracks a research gap without pretending the source is verified.

## Current Inventory

| ID | Jurisdiction | Category | Agency | Status | Official | Rules created | Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `az-ador-tpt-license` | Arizona | TPT / sales tax | Arizona Department of Revenue | `official_reviewed` | Yes | No | [TPT License](https://azdor.gov/business/transaction-privilege-tax/tpt-license) |
| `az-ador-transaction-privilege-tax` | Arizona | TPT / sales tax | Arizona Department of Revenue | `official_reviewed` | Yes | Yes | [Transaction Privilege Tax](https://azdor.gov/business/transaction-privilege-tax) |
| `maricopa-special-events-farmers-markets` | Maricopa County | vendor market / multi-vendor event | Maricopa County Environmental Services | `official_reviewed` | Yes | Yes | [Special Events/Farmers' Markets](https://www.maricopa.gov/3976/Special-EventsFarmers-Markets) |
| `maricopa-mobile-food-establishments` | Maricopa County | mobile food / food truck | Maricopa County Environmental Services | `official_reviewed` | Yes | Yes | [Mobile Food Establishments](https://www.maricopa.gov/3977/Mobile-Food-Establishments) |
| `maricopa-special-event-requirements` | Maricopa County | temporary food | Maricopa County Environmental Services | `official_reviewed` | Yes | Yes | [Special Event Requirements](https://www.maricopa.gov/6566/102769/Special-Event-Requirements) |
| `maricopa-transportation-special-events` | Maricopa County | street or sidewalk closure | Maricopa County Department of Transportation | `official_reviewed` | Yes | No | [Special Events Permits](https://www.maricopa.gov/6217/Special-Events-Permits) |
| `phoenix-temporary-assembly-permits` | Phoenix | special event | City of Phoenix Planning and Development | `official_reviewed` | Yes | Yes | [Temporary Assembly Permits](https://www.phoenix.gov/administration/departments/pdd/tools-resources/temporary-assembly-permits.html) |
| `phoenix-outdoor-events-private-property` | Phoenix | venue / private property event | City of Phoenix Planning and Development | `official_reviewed` | Yes | Yes | [Outdoor Events on Private Property](https://www.phoenix.gov/administration/departments/pdd/tools-resources/temporary-assembly-permits/outdoor-events.html) |
| `phoenix-park-rentals-permits` | Phoenix | park event | City of Phoenix Parks and Recreation | `official_reviewed` | Yes | No | [Rentals and Permits](https://www.phoenix.gov/administration/departments/parks/rentals-permits.html) |
| `phoenix-special-event-liquor` | Phoenix | alcohol | City of Phoenix License Services | `official_reviewed` | Yes | Yes | [Special Event Liquor Licenses](https://www.phoenix.gov/administration/departments/cityclerk/programs-services/license-services/special-event-liquor-licenses-series-15.html) |
| `tempe-special-events-application` | Tempe | special event | City of Tempe | `needs_review` | No | No | [City of Tempe Special Events Application](https://app.apply4.com/eventapp/usa/tempe) |
| `tempe-parks-special-events-ordinances` | Tempe | park event | City of Tempe Parks and Recreation | `official_reviewed` | Yes | Yes | [Special Events and Parks Ordinances](https://www.tempe.gov/government/community-services/parks/special-events-and-parks-ordinances) |
| `mesa-special-event-license` | Mesa | special event | City of Mesa | `official_reviewed` | Yes | Yes | [Special Event License](https://www.mesaaz.gov/Business-Development/Special-Event-License) |
| `mesa-special-event-handbook` | Mesa | special event | City of Mesa | `official_reviewed` | Yes | No | [Special Events Handbook](https://www.mesaaz.gov/files/assets/public/v/1/business-development/specialevent/city-of-mesa-special-event-handbook.pdf) |
| `mesa-business-license` | Mesa | business license | City of Mesa Licensing | `official_reviewed` | Yes | Yes | [Mesa General Business License](https://www.mesaaz.gov/Business-Development/Licensing/Mesa-General-Business-License) |
| `mesa-mobile-food-vendor-license` | Mesa | mobile food / food truck | City of Mesa Licensing | `official_reviewed` | Yes | Yes | [Mobile Food Vendor License](https://www.mesaaz.gov/Business-Development/Licensing/Mobile-Food-Vendor-License) |
| `mesa-tpt-tax` | Mesa | TPT / sales tax | City of Mesa | `official_reviewed` | Yes | Yes | [Transaction Privilege (TPT) Tax](https://www.mesaaz.gov/Business-Development/Transaction-Privilege-TPT-Tax) |
| `mesa-liquor-license` | Mesa | alcohol | City of Mesa Licensing | `official_reviewed` | Yes | No | [Liquor License](https://www.mesaaz.gov/Business-Development/Licensing/Liquor-License) |
| `scottsdale-special-events` | Scottsdale | special event | City of Scottsdale Tourism and Events | `official_reviewed` | Yes | Yes | [Special Event Planning & Permits](https://www.scottsdaleaz.gov/special-events) |
| `scottsdale-business-regulatory-licenses` | Scottsdale | business license | City of Scottsdale Business Services | `official_reviewed` | Yes | Yes | [Business & Regulatory Licenses](https://www.scottsdaleaz.gov/licenses) |
| `scottsdale-special-event-liquor` | Scottsdale | alcohol | City of Scottsdale | `official_reviewed` | Yes | Yes | [Obtaining a Liquor Permit for a Special Event](https://www.scottsdaleaz.gov/special-events/special-event-liquor) |
| `scottsdale-fire-permit-services` | Scottsdale | fire / tent / generator / open flame | City of Scottsdale Fire Department | `official_reviewed` | Yes | Yes | [Fire Permit Services](https://www.scottsdaleaz.gov/fire/fire-services/fire-permit-services) |
| `scottsdale-special-event-guidebook` | Scottsdale | vendor market / multi-vendor event | City of Scottsdale Tourism and Events | `official_reviewed` | Yes | No | [Special Event Guidebook and Rules](https://www.scottsdaleaz.gov/docs/default-source/scottsdaleaz/tourism/special-event-guidebook.pdf?sfvrsn=a4470db2_6) |
| `glendale-special-events` | Glendale | special event | City of Glendale Special Events | `official_reviewed` | Yes | Yes | [Special Event Permit](https://www.glendaleaz.gov/Community/ApplyRegister-For/Special-event-application-process) |
| `glendale-parks-recreation` | Glendale | park event | City of Glendale Parks and Recreation | `official_reviewed` | Yes | No | [Parks and Recreation](https://www.glendaleaz.gov/Explore/Parks-and-Recreation) |
| `glendale-transportation-services` | Glendale | street or sidewalk closure | City of Glendale Transportation Services | `official_reviewed` | Yes | No | [Transportation Services](https://www.glendaleaz.gov/Community/City-Services/Transportation-Services) |
| `glendale-business-license-open-data` | Glendale | business license | City of Glendale | `needs_review` | Yes | No | [Glendale Business Licenses](https://opendata.glendaleaz.com/datasets/glendale-business-licenses/about) |
| `glendale-special-events-licenses-research-needed` | Glendale | vendor market / multi-vendor event | City of Glendale | `needs_research` | No | No | Missing |
| `peoria-host-special-event` | Peoria | special event | City of Peoria Arts, Culture and Special Events | `official_reviewed` | Yes | Yes | [Host a Special Event](https://www.peoriaaz.gov/government/departments/arts-culture/special-events/host-a-special-event) |
| `peoria-special-events` | Peoria | park event | City of Peoria Parks and Recreation | `official_reviewed` | Yes | No | [Special Events](https://www.peoriaaz.gov/residents/parks-and-recreation/special-events) |
| `peoria-vendor-information` | Peoria | vendor market / multi-vendor event | City of Peoria Arts, Culture and Special Events | `official_reviewed` | Yes | Yes | [Vendor Information](https://www.peoriaaz.gov/government/departments/arts-culture/special-events/vendor-information) |
| `peoria-business-license` | Peoria | business license | City of Peoria Sales Tax and License | `official_reviewed` | Yes | Yes | [Business Licenses](https://www.peoriaaz.gov/i-want-to/pay/business-license) |
| `peoria-park-rules` | Peoria | park event | City of Peoria Parks and Recreation | `official_reviewed` | Yes | No | [Park Rules and Regulations](https://www.peoriaaz.gov/government/departments/parks-recreation-and-community-facilities/parks-and-trails/park-rules) |
| `chandler-host-event-public-private` | Chandler | special event | City of Chandler Special Events | `official_reviewed` | Yes | No | [Host an Event: Public vs. Private Property](https://www.chandleraz.gov/explore/events-in-chandler/host-an-event) |
| `chandler-public-property-special-event-permit` | Chandler | special event | City of Chandler Special Events | `official_reviewed` | Yes | Yes | [Public Property: Special Event Permit](https://www.chandleraz.gov/explore/events-in-chandler/host-an-event/special-event-permit) |
| `chandler-private-property-tspe-permit` | Chandler | venue / private property event | City of Chandler Special Events | `official_reviewed` | Yes | Yes | [Private Property Event: TSPE Permit](https://www.chandleraz.gov/explore/events-in-chandler/host-an-event/tspe-permit) |
| `chandler-business-registration` | Chandler | business license | City of Chandler Tax and License | `official_reviewed` | Yes | Yes | [Business Registration](https://www.chandleraz.gov/business/tax-and-license/business-registration) |
| `chandler-special-event-licenses` | Chandler | alcohol | City of Chandler Tax and License | `official_reviewed` | Yes | No | [Special Event Licenses](https://www.chandleraz.gov/business/tax-and-license/licensing/special-event-licenses) |
| `chandler-specialty-licenses` | Chandler | vendor market / multi-vendor event | City of Chandler Tax and License | `official_reviewed` | Yes | Yes | [Specialty Licenses](https://www.chandleraz.gov/business/tax-and-license/licensing/specialty-licenses) |
| `gilbert-special-event-planning` | Gilbert | special event | Town of Gilbert Parks and Recreation | `official_reviewed` | Yes | Yes | [Special Event Planning and Permits](https://www.gilbertaz.gov/how-do-i/view/special-event-planning-and-permits) |
| `gilbert-special-events-and-permits` | Gilbert | park event | Town of Gilbert Parks and Recreation | `official_reviewed` | Yes | No | [Special Events and Permits](https://www.gilbertaz.gov/departments/parks-and-recreation/special-events-and-permits) |
| `gilbert-business-registration` | Gilbert | business license | Town of Gilbert Development Services | `official_reviewed` | Yes | Yes | [Business Registration and Licensing](https://www.gilbertaz.gov/business/business-registration-and-licensing) |
| `gilbert-business-license-faq` | Gilbert | business license | Town of Gilbert Development Services | `official_reviewed` | Yes | No | [Business License FAQ](https://www.gilbertaz.gov/departments/development-services/business-registration-and-licensing/business-license-faq) |
| `gilbert-vendor-information` | Gilbert | vendor market / multi-vendor event | Town of Gilbert Parks and Recreation | `official_reviewed` | Yes | Yes | [Special Event Vendor Information](https://www.gilbertaz.gov/departments/parks-and-recreation/special-event-vendor-information) |
| `gilbert-liquor-licenses` | Gilbert | alcohol | Town of Gilbert Development Services | `official_reviewed` | Yes | No | [Liquor Licenses](https://www.gilbertaz.gov/business/business-registration-and-licensing/liquor-licenses) |
| `gilbert-tpt-license` | Gilbert | TPT / sales tax | Town of Gilbert Tax Compliance Division | `official_reviewed` | Yes | Yes | [Business License vs Transaction Privilege (Sales) Tax License](https://www.gilbertaz.gov/departments/finance-mgmt-services/tax-compliance-division/business-license-vs-transaction-privilege-sales-tax-license) |

## Mesa Rule Conversion Status

The first city-level verified rule batch converts a small set of Mesa reviewed sources into `RuleRecord` seed entries. These are intentionally limited so the pipeline can be tested before broader city expansion.

Converted Mesa source records:

- `mesa-special-event-license`: converted into `mesa-special-event-license-timing-check` and `mesa-right-of-way-special-event-review`.
- `mesa-business-license`: converted into `mesa-business-license-retail-vendor-check`.
- `mesa-mobile-food-vendor-license`: converted into `mesa-mobile-food-vendor-license-check`.
- `mesa-tpt-tax`: converted into `mesa-tpt-retail-region-code-check`.

Mesa sources still inventory-only:

- `mesa-special-event-handbook`: reviewed source, but not converted yet because handbook details should be broken into smaller fire, traffic, park, alcohol, and attachment rules later.
- `mesa-liquor-license`: reviewed source, but not converted yet because special event liquor should be coordinated with the Arizona Department of Liquor Licenses and Control source before rule creation.

Mesa source gaps still requiring research:

- Dedicated Mesa park or facility event source, if separate from the special event license and handbook.
- Dedicated Mesa amplified sound or noise source.
- Dedicated Mesa signage source.
- More granular Mesa fire, tent, generator, open-flame, and temporary-structure source details beyond the special event attachment list.

## Phoenix Rule Conversion Status

The first Phoenix verified rule batch converts a controlled set of reviewed official Phoenix sources into city-level `RuleRecord` seed entries. These rules can now stack with Maricopa County food guidance and Arizona TPT guidance where intake triggers support it.

Converted Phoenix source records:

- `phoenix-temporary-assembly-permits`: converted into `phoenix-temporary-assembly-event-review-check`.
- `phoenix-outdoor-events-private-property`: converted into `phoenix-private-property-outdoor-event-atup-check`, `phoenix-right-of-way-or-public-event-review-check`, and `phoenix-vending-and-temporary-tax-license-check`.
- `phoenix-special-event-liquor`: converted into `phoenix-special-event-liquor-license-check`, now using the refined `alcohol_present` trigger.

Phoenix sources still inventory-only:

- `phoenix-park-rentals-permits`: reviewed parks/rentals source, but not converted in this batch because the outdoor events page provided the more specific park/street event language. Park services permits, amplified sound permits, beer permits, food distribution in parks, field allocation, and major park events should be split into separate rules after more source review.

Phoenix source gaps still requiring research:

- Primary Phoenix business license, vending license, and privilege tax pages for seller-specific rules beyond the outdoor events page.
- Dedicated temporary stage/platform, tent/canopy, generator/temporary power, fire/public outdoor assembly, signage, amplified sound, and park services permit details.
- City-specific guidance for food trucks or temporary food vendors should continue to be coordinated with Maricopa County Environmental Services.

Phoenix lead-time and trigger assumptions:

- Temporary assembly, private-property, right-of-way, and liquor rules use cautious planning placeholder lead times because the reviewed Phoenix pages do not publish one fixed processing timeframe.
- Vending/temporary tax rule uses `retail_sales: true`; it should be refined after reviewing Phoenix's primary vending and privilege tax license pages.
- Right-of-way matching now uses refined `right_of_way_use`; legacy broad street/sidewalk/parking impact intake remains compatible through rule-engine mapping.
- Special-event liquor matching now uses refined `alcohol_present`; legacy broad alcohol intake remains compatible through rule-engine mapping.
- Private-property outdoor event matching uses `private_property`; parking lot intake is treated as private property by the rule engine.

## Tempe Rule Conversion Status

The first Tempe verified rule batch is intentionally cautious. The inventory has one Tempe.gov source reviewed as official and one Apply4 portal source marked `needs_review`. Only the Tempe.gov source was converted.

Converted Tempe source records:

- `tempe-parks-special-events-ordinances`: converted into `tempe-special-events-code-review-check`, `tempe-park-event-ordinance-review-check`, and `tempe-amplified-sound-park-review-check`.
- `tempe-amplified-sound-park-review-check` is currently the only verified signage/promotion refinement because the reviewed Tempe source specifically lists amplified-sound ordinance materials.

Tempe sources still inventory-only:

- `tempe-special-events-application`: not converted because the inventory marks it `needs_review` and `isOfficial: false`; it appears to be a city-used application portal, but it is not hosted on `tempe.gov`.

Tempe source gaps still requiring research:

- Primary Tempe special event application/process page hosted by the city or otherwise formally documented.
- Tempe business license, sales tax/TPT, vending, or seller-specific source pages.
- Tempe street, sidewalk, parking, traffic, or right-of-way event review source.
- Tempe fire, tent, generator, open flame, temporary structure, signage, alcohol, and food-specific city review sources.
- More current park reservation, park permit, amplified sound, and beer/wine process details beyond the ordinance update page.
- Standalone temporary signage, banner, ticketed-event, admission-fee, and public-advertising sources.

Tempe lead-time and trigger assumptions:

- The Tempe rules use `confirm with the agency` because the source is ordinance/process context, not a finalized permit checklist.
- Lead times are cautious planning placeholders because the reviewed Tempe page does not publish one fixed processing timeframe.
- Park and amplified-sound rules are limited to public property/park-style intake because the converted source is parks-focused.
- Ticketing, admission, temporary signage, banners, and public advertising were not converted from broad special-event context because the current reviewed sources do not support narrower standalone checklist items.
- Food-related Tempe scenarios currently stack city event/park review with Maricopa County food guidance and Arizona TPT guidance where triggers support it; no Tempe-specific food rule was added.

## Maricopa County Food Rule Conversion Status

The first Maricopa County food batch converts a controlled set of reviewed official Environmental Services sources into verified `RuleRecord` seed entries. These records now allow food scenarios to stack county guidance with city and Arizona state guidance.

Converted Maricopa County source records:

- `maricopa-special-event-requirements`: converted into `maricopa-special-event-food-registration-check`, `maricopa-open-or-prepared-food-temporary-permit-check`, `maricopa-temperature-controlled-food-review-check`, `maricopa-food-sampling-temporary-permit-check`, and `maricopa-food-exemption-confirmation-check`.
- `maricopa-mobile-food-establishments`: converted into `maricopa-mobile-food-establishment-permit-check`.
- `maricopa-special-events-farmers-markets`: converted into `maricopa-special-event-market-food-vendor-check`.

Maricopa County sources still inventory-only:

- `maricopa-transportation-special-events`: reviewed transportation/right-of-way source, but not converted in the food batch because it is not food-related.

Maricopa County source gaps still requiring research:

- More granular commissary, inspection, permit exemption, promotional sampling, and food handler/Certified Food Protection Manager source details.
- Exact processing windows for mobile food and temporary/seasonal food permits beyond the 30-day special event registration timing.
- Coordination points between Maricopa County Environmental Services and city-specific fire, event, and vendor requirements.

Maricopa County lead-time and trigger assumptions:

- Special event food registration uses the source's 30-day online submission timing.
- Temporary food and market food vendor rules use 30 days as a cautious planning milestone aligned to the special event registration timing.
- Mobile food establishment review uses a cautious 14-day planning placeholder because the source explains permit application paths but does not publish one fixed processing window.
- County rules match by `county: "Maricopa County"` instead of exact county jurisdiction code so they can stack with launch-city intakes.
- Current intake collects `food`, `food_truck`, `multi_vendor_event` through vendor count, event type, use case, county, and state. It does not separately collect cooking method, open food, packaged TCS food, sampling type, drink/ice/garnish handling, commissary use, or permit exemption facts.

## Glendale Rule Conversion Status

The first Glendale verified rule batch is intentionally smaller than the other city batches because Glendale's reviewed source coverage is thinner. Only the official Special Event Permit source was converted.

Converted Glendale source records:

- `glendale-special-events`: converted into `glendale-special-event-permit-check`, `glendale-traffic-impact-review-check`, and `glendale-temporary-structure-site-plan-check`, now refined to use `temporary_stage_or_platform`.

Glendale sources still inventory-only:

- `glendale-parks-recreation`: reviewed broad parks page, but not converted because it is mostly a routing page and does not provide enough park/facility event requirement detail for a checklist rule.
- `glendale-transportation-services`: reviewed broad transportation page, but not converted because the special event permit page has the clearer event-specific traffic and barricade context. A specific right-of-way or barricade procedure source should be reviewed before a standalone transportation rule is added.
- `glendale-business-license-open-data`: left inventory-only because it is still marked `needs_review` and should be replaced or supplemented with a primary licensing application/source page before a business-license rule is created.
- `glendale-special-events-licenses-research-needed`: left inventory-only because it is a `needs_research` placeholder without a reviewed source URL.

Glendale source gaps still requiring research:

- Primary Glendale business license or registration source for vendors and sellers.
- Specific special events licensing or vendor licensing source, if separate from the permit application center.
- Park/facility reservation requirements that are specific enough for event readiness rules.
- Standalone traffic, right-of-way, barricade, parking, amplified-sound, signage, fire, tent, generator, open-flame, alcohol, temporary food, and mobile food sources.

Glendale lead-time and trigger assumptions:

- The general special event rule uses the source's 60-days-before-event application package milestone.
- Traffic and temporary-structure rules use the source's 30-days-before-event complete/final document milestone.
- Traffic matching now uses refined `traffic_control_needed`; legacy broad street/sidewalk/parking impact intake remains compatible through rule-engine mapping.
- Temporary structure matching now uses refined `temporary_stage_or_platform`; legacy broad temporary-structure intake remains compatible through rule-engine mapping. Generator-specific and fire-specific rules should be split out only after more granular Glendale source review.

## Peoria Rule Conversion Status

The first Peoria verified rule batch converts a small set of reviewed official sources into `RuleRecord` seed entries. These rules are intentionally limited and use cautious language because several Peoria event pages should be re-checked manually before more granular rules are added.

Converted Peoria source records:

- `peoria-host-special-event`: converted into `peoria-special-event-review-check`.
- `peoria-business-license`: converted into `peoria-business-license-check` and `peoria-tpt-license-check`.
- `peoria-vendor-information`: converted into `peoria-special-event-vendor-information-check`.

Peoria sources still inventory-only:

- `peoria-special-events`: reviewed city events page, but not converted yet because it is broader city event context rather than a specific intake trigger.
- `peoria-park-rules`: reviewed park rules page, but not converted yet because park/facility rules should be split into smaller rules after more source review.

Peoria source gaps still requiring research:

- City-specific street, sidewalk, right-of-way, parking, and traffic-impact requirements for public or private events.
- City-specific temporary structure, tent, generator, open flame, and fire review requirements outside business-license operational permit context.
- Alcohol rules should be coordinated with Arizona Department of Liquor Licenses and Control context before event-specific rule creation.
- Temporary food and mobile food guidance should be coordinated with Maricopa County and any Peoria event-specific materials.
- Dedicated amplified sound/noise and signage sources still need review.

Peoria lead-time and trigger assumptions:

- Special event lead time uses a 60-day planning recommendation from the reviewed official host-a-special-event source; re-check the page directly during future verification because the site may challenge automated fetches.
- Business license lead time uses the source's 30-day application timeframe from application acceptance.
- TPT lead time uses a cautious 14-day planning placeholder because Peoria points TPT licensing to ADOR but does not publish a fixed TPT processing timeframe.
- Vendor information lead time uses a cautious 30-day planning placeholder because no fixed vendor review timeframe is recorded in the current inventory.
- The vendor rule currently triggers on `retail_sales` plus retail or multi-vendor use cases. Food-specific vendor rules should be split out only after Maricopa County and Peoria source support is reviewed together.

## Chandler Rule Conversion Status

The first Chandler verified rule batch converts a small set of reviewed sources into `RuleRecord` seed entries. Like the Mesa batch, these are intentionally limited and use cautious language.

Converted Chandler source records:

- `chandler-public-property-special-event-permit`: converted into `chandler-public-property-special-event-permit-check`.
- `chandler-private-property-tspe-permit`: converted into `chandler-private-property-tspe-permit-check`.
- `chandler-business-registration`: converted into `chandler-business-registration-check`.
- `chandler-specialty-licenses`: converted into `chandler-specialty-vendor-license-check`.

Chandler sources still inventory-only:

- `chandler-host-event-public-private`: reviewed routing source, but not converted because the public and private process pages now hold the rule-specific details.
- `chandler-special-event-licenses`: reviewed alcohol source, but not converted yet because special event liquor should be coordinated with Arizona Department of Liquor Licenses and Control context before rule creation.

Chandler source gaps still requiring research:

- City-specific fire, tent, generator, open-flame, and temporary-structure details beyond forms linked from the public/private event pages.
- City-specific food vendor guidance outside the event form links and Maricopa County food requirements.
- Dedicated amplified sound or noise source.
- Dedicated signage source.
- More granular right-of-way, traffic-control, and parking-impact source details beyond the public event page and traffic control form link.

## Scottsdale Rule Conversion Status

The first Scottsdale verified rule batch converts a small set of reviewed sources into `RuleRecord` seed entries. These rules are intentionally conservative and do not convert every detail in the Scottsdale guidebook.

Converted Scottsdale source records:

- `scottsdale-special-events`: converted into `scottsdale-special-event-permit-check`.
- `scottsdale-business-regulatory-licenses`: converted into `scottsdale-business-registration-license-check`.
- `scottsdale-fire-permit-services`: converted into `scottsdale-fire-tent-permit-check`, now refined to use `tent_or_canopy`.
- `scottsdale-special-event-liquor`: converted into `scottsdale-special-event-liquor-review`, now using the refined `alcohol_present` trigger.

Scottsdale sources still inventory-only:

- `scottsdale-special-event-guidebook`: reviewed source, but not converted yet because guidebook details should be split into smaller vendor, traffic, parking, signage, sound, layout, and operational rules.

Scottsdale source gaps still requiring research:

- Dedicated park/facility event source if separate from the special event page and city venue links.
- More granular right-of-way, traffic-control, and parking-impact source details.
- Dedicated amplified sound or noise source.
- Dedicated signage source.
- Food vendor guidance should still be coordinated with Maricopa County food sources and any Scottsdale-specific event materials.

Scottsdale lead-time and trigger assumptions:

- Special event lead time uses a cautious 45-day planning placeholder because the landing page links to review resources but does not publish a single fixed number on-page.
- Business registration lead time uses a cautious 14-day planning placeholder because the source does not publish one fixed processing timeframe.
- Fire permit lead time uses 10 days as a planning warning based on the source's rush-fee threshold for under-10-day fire safety permits.
- Special event liquor lead time uses the source's minimum 20-day submission note.
- Special event liquor matching uses refined `alcohol_present`; separate alcohol sales, free service, BYOB, and public-property alcohol rules were not created because the current converted source does not support those as standalone EventLocal checklist items.
- The fire rule now triggers on refined `tent_or_canopy`; legacy broad temporary-structure intake remains compatible through rule-engine mapping. Additional open flame, generator, cooking, tent-size threshold, and pyrotechnic rules should be split out only when exact source support is reviewed.

## Gilbert Rule Conversion Status

The first Gilbert verified rule batch converts a limited set of reviewed official sources into `RuleRecord` seed entries. These rules are intentionally careful and should be expanded only after each additional source is reviewed.

Converted Gilbert source records:

- `gilbert-special-event-planning`: converted into `gilbert-special-event-permit-check`.
- `gilbert-business-registration`: converted into `gilbert-business-license-check`.
- `gilbert-vendor-information`: converted into `gilbert-special-event-vendor-interest-check`.
- `gilbert-tpt-license`: converted into `gilbert-tpt-and-business-license-check`.

Gilbert sources still inventory-only:

- `gilbert-special-events-and-permits`: reviewed parks and events landing page, but not converted because the special event planning page and vendor page hold more rule-specific details.
- `gilbert-business-license-faq`: reviewed FAQ source, but not converted yet because it should support future processing, renewal, and exception details rather than a broad first-pass rule.
- `gilbert-liquor-licenses`: reviewed liquor source, but not converted yet because event alcohol rules should be coordinated with Arizona Department of Liquor Licenses and Control context before rule creation.

Gilbert source gaps still requiring research:

- City-specific fire, tent, generator, open-flame, and temporary-structure details beyond the special event forms.
- City-specific traffic, right-of-way, parking-impact, amplified-sound, and signage details.
- Temporary food or mobile food guidance should still be coordinated with Maricopa County and any Gilbert event-specific requirements.
- Park or facility rental rules may need a more granular source if the existing events pages do not cover the use case clearly enough.

Gilbert lead-time and trigger assumptions:

- Special event lead time uses the source's 60-day application deadline; the source notes new or larger events may need additional time.
- Business license and TPT lead times use cautious 14-day planning placeholders because the reviewed sources do not publish a fixed processing timeframe.
- Vendor interest lead time uses a cautious 30-day planning placeholder because the source does not publish a fixed vendor review or selection window.
- The vendor rule currently triggers on `retail_sales` plus retail or multi-vendor use cases. Food-specific vendor rules should be split out only after Maricopa County and Gilbert source support is reviewed together.

## Missing Source Categories

The current inventory has reviewed starting points for each Arizona launch city, but it is still not complete. These categories still need more source research before writing rules:

- Amplified sound or noise sources are still thin across most cities unless covered inside a special event guidebook.
- Signage sources are still thin across most cities unless covered inside a special event guidebook.
- Fire, tent, generator, open flame, and temporary-structure sources still need city-specific review for Mesa, Glendale, Peoria, Chandler, and Gilbert. Scottsdale now has one verified tent/temporary-structure fire rule, but more granular fire triggers still need review.
- Street, sidewalk, right-of-way, parking, and traffic-impact sources still need city-specific detail for Mesa, Scottsdale, Peoria, Chandler, and Gilbert. Glendale has a transportation starting point, and Chandler has public/private event starting points.
- Alcohol sources still need better Glendale and Peoria review. Mesa, Scottsdale, Chandler, and Gilbert have reviewed starting points.
- Temporary/mobile food now has a first verified Maricopa County batch and Mesa city mobile food support. Other city-specific food vendor pages still need research if they exist.
- Glendale business licensing, special event licensing, parks/facility rules, and standalone traffic/fire/food/alcohol details need manual review beyond the first converted Special Event Permit source.
- Tempe business/tax, special event application, right-of-way, fire, alcohol, signage, and food-specific sources still need research before additional Tempe rules are created.

## Likely Rule Candidates Later

These sources should probably be reviewed first when converting sources into rule records:

- Phoenix: Parks Rentals and Permits, primary vending/business/privilege tax pages, temporary stage/platform, tent/canopy, generator/temporary power, public outdoor assembly/fire, signage, and amplified sound sources.
- Tempe: Special event application/process, business/tax, right-of-way, fire, alcohol, signage, and food-specific sources need review before more precise Tempe rules are created.
- Mesa: Special Events Handbook and Liquor License remain the next Mesa inventory-only sources to break into smaller rules after related state/county context is reviewed.
- Scottsdale: Special Event Guidebook remains inventory-only and should be broken into smaller vendor, traffic, parking, signage, sound, and operational rules.
- Peoria: Special Events and Park Rules remain inventory-only; traffic, fire, food, alcohol, sound, signage, and park/facility details still need more granular source review.
- Chandler: Special Event Licenses remains inventory-only pending state liquor context; traffic, fire, food, sound, and signage details still need more granular source review.
- Gilbert: Special Events and Permits, Business License FAQ, and Liquor Licenses remain inventory-only; traffic, fire, food, sound, signage, and park/facility details still need more granular source review.
- Glendale: Business licensing, Special Events Licenses, Parks and Recreation, Transportation Services, and more granular fire/food/alcohol/signage/sound sources need review before additional rule conversion.

## How Sources Become Rules

1. Add or update a source inventory record.
2. Set `verificationStatus: "official_reviewed"` only after human review.
3. Keep `isOfficial: false` for third-party portals or unclear sources until confirmed.
4. Write one small rule record in `prisma/seed-data/rules.ts`.
5. Link the rule to the source URL and agency.
6. Use careful language: `likely required`, `may be required`, or `confirm with the agency`.
7. Keep the result informational only and add or update tests.
8. Set `rulesCreated: true` in the source inventory only after a rule exists.
