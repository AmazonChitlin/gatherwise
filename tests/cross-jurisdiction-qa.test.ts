import assert from "node:assert/strict";
import test from "node:test";
import { matchRulesToIntake, type EngineRuleRecord } from "@/lib/rule-engine";
import type { IntakeInput } from "@/lib/schemas";
import { ruleSeedData } from "@/prisma/seed-data/rules";

const baseIntake: IntakeInput = {
  eventName: "Cross-jurisdiction QA event",
  city: "mesa",
  county: "Maricopa County",
  useCase: "multi-vendor-market",
  eventType: "outdoor-market",
  propertyUse: "private-property",
  expectedAttendance: 175,
  vendorCount: 8,
  eventDate: "2026-08-12",
  recurrence: "one-time",
  hasFood: false,
  hasFoodTruck: false,
  hasRetailSales: true,
  hasAlcohol: false,
  hasAmplifiedSound: false,
  hasTemporaryStructure: false,
  hasGenerator: false,
  hasOpenFlame: false,
  hasStreetSidewalkOrParkingImpact: false
};

test("stacks Mesa city retail guidance with Arizona TPT guidance", () => {
  const results = matchSeedRules({
    ...baseIntake,
    city: "mesa",
    useCase: "retail-vendor-booth",
    eventType: "vendor-pop-up",
    vendorCount: 1,
    hasRetailSales: true
  });

  const slugs = slugsFor(results);

  assert.ok(slugs.includes("mesa-business-license-retail-vendor-check"));
  assert.ok(slugs.includes("mesa-tpt-retail-region-code-check"));
  assert.ok(slugs.includes("az-tpt-retail-sales-license-check"));
  assertNoDuplicateSlugs(results);
});

test("stacks Mesa mobile food city county and state guidance", () => {
  const results = matchSeedRules({
    ...baseIntake,
    city: "mesa",
    useCase: "food-truck-temporary-food-vendor",
    eventType: "food-service",
    hasFood: true,
    hasFoodTruck: true,
    hasRetailSales: true
  });

  const slugs = slugsFor(results);

  assert.ok(slugs.includes("mesa-mobile-food-vendor-license-check"));
  assert.ok(slugs.includes("az-tpt-retail-sales-license-check"));
  assert.ok(slugs.includes("maricopa-mobile-food-establishment-permit-check"));
  assert.ok(slugs.includes("maricopa-special-event-food-registration-check"));
  assertNoDuplicateSlugs(results);
});

test("matches temporary food vendor event with Maricopa County food guidance", () => {
  const results = matchSeedRules({
    ...baseIntake,
    city: "gilbert",
    useCase: "food-truck-temporary-food-vendor",
    eventType: "food-service",
    hasFood: true,
    hasFoodTruck: false,
    foodIsOpenOrPreparedOnSite: true,
    hasRetailSales: true
  });

  const slugs = slugsFor(results);

  assert.ok(
    slugs.includes("maricopa-open-or-prepared-food-temporary-permit-check")
  );
  assert.ok(slugs.includes("maricopa-special-event-food-registration-check"));
  assert.equal(
    slugs.includes("maricopa-mobile-food-establishment-permit-check"),
    false
  );
});

test("matches refined Maricopa County food-detail guidance", () => {
  const results = matchSeedRules({
    ...baseIntake,
    city: "phoenix",
    useCase: "food-truck-temporary-food-vendor",
    eventType: "food-service",
    hasFood: true,
    foodIsOpenOrPreparedOnSite: true,
    foodRequiresTemperatureControl: true,
    foodSampling: true,
    believesFoodExemptionMayApply: true,
    hasRetailSales: false
  });

  const slugs = slugsFor(results);

  assert.ok(
    slugs.includes("maricopa-open-or-prepared-food-temporary-permit-check")
  );
  assert.ok(slugs.includes("maricopa-temperature-controlled-food-review-check"));
  assert.ok(slugs.includes("maricopa-food-sampling-temporary-permit-check"));
  assert.ok(slugs.includes("maricopa-food-exemption-confirmation-check"));
  assert.equal(
    results.find(
      (result) => result.slug === "maricopa-food-exemption-confirmation-check"
    )?.requirementLevel,
    "confirm with the agency"
  );
  assertNoDuplicateSlugs(results);
});

test("keeps packaged non-temperature-control food scenario honest", () => {
  const results = matchSeedRules({
    ...baseIntake,
    city: "mesa",
    useCase: "food-truck-temporary-food-vendor",
    eventType: "food-service",
    hasFood: true,
    foodIsPrepackaged: true,
    foodIsOpenOrPreparedOnSite: false,
    foodRequiresTemperatureControl: false,
    foodSampling: false,
    hasFoodTruck: false,
    hasRetailSales: false
  });

  const slugs = slugsFor(results);

  assert.ok(slugs.includes("maricopa-special-event-food-registration-check"));
  assert.equal(
    slugs.includes("maricopa-open-or-prepared-food-temporary-permit-check"),
    false
  );
  assert.equal(
    slugs.includes("maricopa-temperature-controlled-food-review-check"),
    false
  );
  assert.equal(slugs.includes("maricopa-food-sampling-temporary-permit-check"), false);
});

test("does not match Maricopa County food rules for non-food retail intake", () => {
  const results = matchSeedRules({
    ...baseIntake,
    city: "mesa",
    useCase: "retail-vendor-booth",
    eventType: "vendor-pop-up",
    vendorCount: 1,
    hasFood: false,
    hasFoodTruck: false,
    hasRetailSales: true
  });

  const countyFoodSlugs = slugsFor(results).filter((slug) =>
    slug.startsWith("maricopa-")
  );

  assert.deepEqual(countyFoodSlugs, []);
});

test("matches Chandler public-property event with vendor and statewide guidance", () => {
  const results = matchSeedRules({
    ...baseIntake,
    city: "chandler",
    useCase: "multi-vendor-market",
    eventType: "outdoor-market",
    propertyUse: "public-property",
    vendorCount: 8,
    hasRetailSales: true
  });

  const slugs = slugsFor(results);

  assert.ok(slugs.includes("chandler-public-property-special-event-permit-check"));
  assert.ok(slugs.includes("chandler-specialty-vendor-license-check"));
  assert.ok(slugs.includes("az-tpt-retail-sales-license-check"));
  assertNoOtherCityRules(results, "az-chandler");
});

test("matches Scottsdale temporary structure guidance and documents generator/open flame gap", () => {
  const results = matchSeedRules({
    ...baseIntake,
    city: "scottsdale",
    useCase: "small-outdoor-music-art-event",
    eventType: "music-art-event",
    hasTemporaryStructure: true,
    hasGenerator: true,
    hasOpenFlame: true
  });

  const slugs = slugsFor(results);

  assert.ok(slugs.includes("scottsdale-fire-tent-permit-check"));
  assert.equal(
    slugs.some((slug) => slug.includes("generator") || slug.includes("flame")),
    false
  );
});

test("matches Glendale event guidance for street sidewalk or parking impact", () => {
  const results = matchSeedRules({
    ...baseIntake,
    city: "glendale",
    useCase: "multi-vendor-market",
    eventType: "outdoor-market",
    propertyUse: "public-property",
    hasStreetSidewalkOrParkingImpact: true
  });

  const slugs = slugsFor(results);

  assert.ok(slugs.includes("glendale-special-event-permit-check"));
  assert.ok(slugs.includes("glendale-traffic-impact-review-check"));
});

test("matches Gilbert special event vendor participation guidance", () => {
  const results = matchSeedRules({
    ...baseIntake,
    city: "gilbert",
    useCase: "multi-vendor-market",
    eventType: "outdoor-market",
    vendorCount: 5,
    hasRetailSales: true
  });

  const slugs = slugsFor(results);

  assert.ok(slugs.includes("gilbert-special-event-permit-check"));
  assert.ok(slugs.includes("gilbert-special-event-vendor-interest-check"));
  assert.ok(slugs.includes("gilbert-business-license-check"));
  assert.ok(slugs.includes("az-tpt-retail-sales-license-check"));
});

test("matches Peoria special event vendor and business guidance", () => {
  const results = matchSeedRules({
    ...baseIntake,
    city: "peoria",
    useCase: "multi-vendor-market",
    eventType: "outdoor-market",
    vendorCount: 5,
    hasRetailSales: true
  });

  const slugs = slugsFor(results);

  assert.ok(slugs.includes("peoria-special-event-review-check"));
  assert.ok(slugs.includes("peoria-special-event-vendor-information-check"));
  assert.ok(slugs.includes("peoria-business-license-check"));
  assert.ok(slugs.includes("az-tpt-retail-sales-license-check"));
});

test("matches Phoenix temporary assembly and event review guidance", () => {
  const results = matchSeedRules({
    ...baseIntake,
    city: "phoenix",
    useCase: "small-outdoor-music-art-event",
    eventType: "music-art-event",
    propertyUse: "private-property",
    hasRetailSales: false
  });

  const slugs = slugsFor(results);

  assert.ok(slugs.includes("phoenix-temporary-assembly-event-review-check"));
});

test("matches Phoenix private-property outdoor event guidance", () => {
  const results = matchSeedRules({
    ...baseIntake,
    city: "phoenix",
    useCase: "private-property-parking-lot-event",
    eventType: "outdoor-market",
    propertyUse: "parking-lot",
    hasRetailSales: false
  });

  const slugs = slugsFor(results);

  assert.ok(slugs.includes("phoenix-private-property-outdoor-event-atup-check"));
});

test("matches Phoenix vending and temporary tax guidance for retail intake", () => {
  const results = matchSeedRules({
    ...baseIntake,
    city: "phoenix",
    useCase: "retail-vendor-booth",
    eventType: "vendor-pop-up",
    propertyUse: "private-property",
    vendorCount: 1,
    hasRetailSales: true
  });

  const slugs = slugsFor(results);

  assert.ok(slugs.includes("phoenix-vending-and-temporary-tax-license-check"));
  assert.ok(slugs.includes("az-tpt-retail-sales-license-check"));
});

test("matches Phoenix right-of-way review for street sidewalk or parking impacts", () => {
  const results = matchSeedRules({
    ...baseIntake,
    city: "phoenix",
    useCase: "multi-vendor-market",
    eventType: "outdoor-market",
    propertyUse: "public-property",
    hasStreetSidewalkOrParkingImpact: true
  });

  const slugs = slugsFor(results);

  assert.ok(slugs.includes("phoenix-right-of-way-or-public-event-review-check"));
});

test("matches Phoenix right-of-way review for refined right-of-way intake", () => {
  const results = matchSeedRules({
    ...baseIntake,
    city: "phoenix",
    useCase: "multi-vendor-market",
    eventType: "outdoor-market",
    propertyUse: "public-property",
    rightOfWayUse: true
  });

  const slugs = slugsFor(results);

  assert.ok(slugs.includes("phoenix-right-of-way-or-public-event-review-check"));
});

test("does not match traffic-specific rules for simple private-property event without impacts", () => {
  const trafficSlugs = [
    "phoenix-right-of-way-or-public-event-review-check",
    "mesa-right-of-way-special-event-review",
    "glendale-traffic-impact-review-check"
  ];
  const results = matchSeedRules({
    ...baseIntake,
    city: "phoenix",
    useCase: "private-property-parking-lot-event",
    eventType: "outdoor-market",
    propertyUse: "private-property",
    hasStreetSidewalkOrParkingImpact: false,
    streetClosure: false,
    sidewalkUseOrClosure: false,
    parkingSpacesBlocked: false,
    trafficControlNeeded: false,
    rightOfWayUse: false,
    hasRetailSales: false
  });

  const slugs = slugsFor(results);

  assert.equal(trafficSlugs.some((slug) => slugs.includes(slug)), false);
});

test("stacks Phoenix food truck city county and state guidance", () => {
  const results = matchSeedRules({
    ...baseIntake,
    city: "phoenix",
    useCase: "private-property-parking-lot-event",
    eventType: "outdoor-market",
    propertyUse: "parking-lot",
    hasFood: true,
    hasFoodTruck: true,
    hasRetailSales: true
  });

  const slugs = slugsFor(results);

  assert.ok(slugs.includes("phoenix-private-property-outdoor-event-atup-check"));
  assert.ok(slugs.includes("phoenix-vending-and-temporary-tax-license-check"));
  assert.ok(slugs.includes("maricopa-mobile-food-establishment-permit-check"));
  assert.ok(slugs.includes("maricopa-special-event-market-food-vendor-check"));
  assert.ok(slugs.includes("az-tpt-retail-sales-license-check"));
});

test("does not match Phoenix-only seed rules for a non-Phoenix intake", () => {
  const phoenixOnlyRules = seedRulesToEngineRecords().filter(
    (ruleRecord) => ruleRecord.jurisdictionCode === "az-phoenix"
  );

  const results = matchRulesToIntake(
    {
      ...baseIntake,
      city: "mesa",
      useCase: "multi-vendor-market",
      eventType: "outdoor-market",
      propertyUse: "private-property",
      hasRetailSales: true
    },
    phoenixOnlyRules
  );

  assert.equal(results.length, 0);
});

test("returns source and verification metadata for verified Phoenix seed rules", () => {
  const results = matchSeedRules({
    ...baseIntake,
    city: "phoenix",
    useCase: "private-property-parking-lot-event",
    eventType: "outdoor-market",
    propertyUse: "parking-lot",
    hasRetailSales: false
  });

  const privateEventRule = results.find(
    (result) => result.slug === "phoenix-private-property-outdoor-event-atup-check"
  );

  assert.equal(privateEventRule?.verificationStatus, "verified");
  assert.equal(privateEventRule?.isSample, false);
  assert.equal(privateEventRule?.lastVerified, "2026-06-23");
  assert.equal(
    privateEventRule?.sourceUrl,
    "https://www.phoenix.gov/administration/departments/pdd/tools-resources/temporary-assembly-permits/outdoor-events.html"
  );
  assert.equal(
    privateEventRule?.agencyName,
    "City of Phoenix Planning and Development"
  );
  assert.equal(privateEventRule?.agencyPhone, "602-262-3111");
});

test("sorts Phoenix city Maricopa County and Arizona statewide results by urgency and lead time", () => {
  const results = matchSeedRules({
    ...baseIntake,
    city: "phoenix",
    useCase: "private-property-parking-lot-event",
    eventType: "outdoor-market",
    propertyUse: "parking-lot",
    hasFood: true,
    hasFoodTruck: true,
    hasRetailSales: true
  });

  const slugs = slugsFor(results);

  assert.ok(
    slugs.indexOf("maricopa-special-event-food-registration-check") <
      slugs.indexOf("phoenix-private-property-outdoor-event-atup-check")
  );
  assert.ok(
    slugs.indexOf("phoenix-private-property-outdoor-event-atup-check") <
      slugs.indexOf("az-tpt-retail-sales-license-check")
  );
});

test("matches Tempe special event ordinance review guidance", () => {
  const results = matchSeedRules({
    ...baseIntake,
    city: "tempe",
    useCase: "small-outdoor-music-art-event",
    eventType: "music-art-event",
    propertyUse: "private-property",
    hasRetailSales: false
  });

  const slugs = slugsFor(results);

  assert.ok(slugs.includes("tempe-special-events-code-review-check"));
});

test("matches Tempe park event and amplified sound review guidance", () => {
  const results = matchSeedRules({
    ...baseIntake,
    city: "tempe",
    useCase: "small-outdoor-music-art-event",
    eventType: "community-gathering",
    propertyUse: "public-property",
    hasAmplifiedSound: true,
    hasRetailSales: false
  });

  const slugs = slugsFor(results);

  assert.ok(slugs.includes("tempe-special-events-code-review-check"));
  assert.ok(slugs.includes("tempe-park-event-ordinance-review-check"));
  assert.ok(slugs.includes("tempe-amplified-sound-park-review-check"));
});

test("stacks Tempe food truck city county and state guidance", () => {
  const results = matchSeedRules({
    ...baseIntake,
    city: "tempe",
    useCase: "multi-vendor-market",
    eventType: "outdoor-market",
    propertyUse: "public-property",
    vendorCount: 5,
    hasFood: true,
    hasFoodTruck: true,
    hasRetailSales: true
  });

  const slugs = slugsFor(results);

  assert.ok(slugs.includes("tempe-special-events-code-review-check"));
  assert.ok(slugs.includes("tempe-park-event-ordinance-review-check"));
  assert.ok(slugs.includes("maricopa-mobile-food-establishment-permit-check"));
  assert.ok(slugs.includes("maricopa-special-event-market-food-vendor-check"));
  assert.ok(slugs.includes("az-tpt-retail-sales-license-check"));
});

test("does not match Tempe-only seed rules for a non-Tempe intake", () => {
  const tempeOnlyRules = seedRulesToEngineRecords().filter(
    (ruleRecord) => ruleRecord.jurisdictionCode === "az-tempe"
  );

  const results = matchRulesToIntake(
    {
      ...baseIntake,
      city: "mesa",
      useCase: "multi-vendor-market",
      eventType: "outdoor-market",
      propertyUse: "public-property",
      hasAmplifiedSound: true,
      hasRetailSales: true
    },
    tempeOnlyRules
  );

  assert.equal(results.length, 0);
});

test("returns source and verification metadata for verified Tempe seed rules", () => {
  const results = matchSeedRules({
    ...baseIntake,
    city: "tempe",
    useCase: "small-outdoor-music-art-event",
    eventType: "community-gathering",
    propertyUse: "public-property",
    hasAmplifiedSound: true,
    hasRetailSales: false
  });

  const amplifiedSoundRule = results.find(
    (result) => result.slug === "tempe-amplified-sound-park-review-check"
  );

  assert.equal(amplifiedSoundRule?.verificationStatus, "verified");
  assert.equal(amplifiedSoundRule?.isSample, false);
  assert.equal(amplifiedSoundRule?.lastVerified, "2026-06-23");
  assert.equal(
    amplifiedSoundRule?.sourceUrl,
    "https://www.tempe.gov/government/community-services/parks/special-events-and-parks-ordinances"
  );
  assert.equal(
    amplifiedSoundRule?.agencyName,
    "City of Tempe Community Services"
  );
  assert.equal(amplifiedSoundRule?.agencyPhone, "480-350-5234");
  assert.equal(amplifiedSoundRule?.agencyEmail, "craig_hayton@tempe.gov");
});

test("sorts Tempe city Maricopa County and Arizona statewide results by urgency and lead time", () => {
  const results = matchSeedRules({
    ...baseIntake,
    city: "tempe",
    useCase: "multi-vendor-market",
    eventType: "outdoor-market",
    propertyUse: "public-property",
    vendorCount: 5,
    hasFood: true,
    hasFoodTruck: true,
    hasRetailSales: true
  });

  const slugs = slugsFor(results);

  assert.ok(
    slugs.indexOf("maricopa-special-event-food-registration-check") <
      slugs.indexOf("az-tpt-retail-sales-license-check")
  );
  assert.ok(
    slugs.indexOf("az-tpt-retail-sales-license-check") <
      slugs.indexOf("tempe-special-events-code-review-check")
  );
});

test("keeps Mesa and Chandler city-only rules isolated from each other", () => {
  const mesaResults = matchSeedRules({
    ...baseIntake,
    city: "mesa",
    useCase: "retail-vendor-booth",
    eventType: "vendor-pop-up",
    vendorCount: 1,
    hasRetailSales: true
  });
  const chandlerResults = matchSeedRules({
    ...baseIntake,
    city: "chandler",
    useCase: "retail-vendor-booth",
    eventType: "vendor-pop-up",
    vendorCount: 1,
    hasRetailSales: true
  });

  assertNoOtherCityRules(mesaResults, "az-mesa");
  assertNoOtherCityRules(chandlerResults, "az-chandler");
});

test("returns source and verification metadata in mixed city and state results", () => {
  const results = matchSeedRules({
    ...baseIntake,
    city: "mesa",
    useCase: "retail-vendor-booth",
    eventType: "vendor-pop-up",
    vendorCount: 1,
    hasRetailSales: true
  });

  const cityRule = results.find(
    (result) => result.slug === "mesa-business-license-retail-vendor-check"
  );
  const stateRule = results.find(
    (result) => result.slug === "az-tpt-retail-sales-license-check"
  );

  assert.equal(cityRule?.verificationStatus, "verified");
  assert.equal(stateRule?.verificationStatus, "verified");
  assert.ok(cityRule?.sourceUrl.startsWith("https://www.mesaaz.gov/"));
  assert.ok(stateRule?.sourceUrl.startsWith("https://azdor.gov/"));
  assert.equal(cityRule?.agencyName, "City of Mesa Licensing");
  assert.equal(stateRule?.agencyName, "Arizona Department of Revenue");
});

test("returns source and verification metadata for matched county food results", () => {
  const results = matchSeedRules({
    ...baseIntake,
    city: "mesa",
    useCase: "food-truck-temporary-food-vendor",
    eventType: "food-service",
    hasFood: true,
    hasFoodTruck: true,
    hasRetailSales: true
  });

  const countyRule = results.find(
    (result) => result.slug === "maricopa-mobile-food-establishment-permit-check"
  );

  assert.equal(countyRule?.verificationStatus, "verified");
  assert.equal(countyRule?.isSample, false);
  assert.equal(countyRule?.lastVerified, "2026-06-23");
  assert.equal(
    countyRule?.sourceUrl,
    "https://www.maricopa.gov/3977/Mobile-Food-Establishments"
  );
  assert.equal(
    countyRule?.agencyName,
    "Maricopa County Environmental Services"
  );
  assert.equal(countyRule?.agencyPhone, "602-506-6824");
  assert.equal(countyRule?.agencyEmail, "ENVPlanreview@maricopa.gov");
});

test("sorts mixed city county and state results by urgency and lead time", () => {
  const results = matchSeedRules({
    ...baseIntake,
    city: "mesa",
    useCase: "food-truck-temporary-food-vendor",
    eventType: "food-service",
    vendorCount: 1,
    hasFood: true,
    hasFoodTruck: true,
    hasRetailSales: true
  });

  const slugs = slugsFor(results);

  assert.ok(
    slugs.indexOf("maricopa-special-event-food-registration-check") <
      slugs.indexOf("mesa-mobile-food-vendor-license-check")
  );
  assert.ok(
    slugs.indexOf("mesa-mobile-food-vendor-license-check") <
      slugs.indexOf("az-tpt-retail-sales-license-check")
  );
});

function matchSeedRules(intake: IntakeInput) {
  return matchRulesToIntake(intake, seedRulesToEngineRecords());
}

function slugsFor(results: ReturnType<typeof matchSeedRules>) {
  return results.map((result) => result.slug);
}

function assertNoDuplicateSlugs(results: ReturnType<typeof matchSeedRules>) {
  assert.equal(new Set(slugsFor(results)).size, results.length);
}

function assertNoOtherCityRules(
  results: ReturnType<typeof matchSeedRules>,
  allowedJurisdictionCode: string
) {
  const leakedCityRule = results.find(
    (result) =>
      result.jurisdictionType === "city" &&
      seedRulesToEngineRecords().find((rule) => rule.slug === result.slug)
        ?.jurisdictionCode !== allowedJurisdictionCode
  );

  assert.equal(leakedCityRule, undefined);
}

function seedRulesToEngineRecords(): EngineRuleRecord[] {
  return ruleSeedData.map((seedRule) => ({
    id: seedRule.slug,
    slug: seedRule.slug,
    title: seedRule.title,
    plainEnglishSummary: seedRule.plainEnglishSummary,
    requirementLevel: seedRule.requirementLevel,
    confidence: seedRule.confidence,
    leadTimeDays: seedRule.leadTimeDays,
    sourceUrl: seedRule.source.url,
    sourceName: seedRule.source.name,
    lastVerified: seedRule.lastVerified
      ? new Date(`${seedRule.lastVerified}T00:00:00.000Z`)
      : null,
    isSample: seedRule.isSample,
    verificationStatus: seedRule.verificationStatus,
    notes: seedRule.adminNote,
    jurisdictionName: seedRule.jurisdiction.name,
    jurisdictionCode: seedRule.jurisdiction.code,
    jurisdictionType: seedRule.jurisdiction.type,
    city: seedRule.jurisdiction.city ?? null,
    county: seedRule.jurisdiction.county ?? null,
    state: seedRule.jurisdiction.state,
    agencyName: seedRule.agency.name,
    agencyPhone: seedRule.agency.phone ?? null,
    agencyEmail: seedRule.agency.email ?? null,
    agencyUrl: seedRule.agency.url ?? null,
    triggerFields: JSON.stringify(seedRule.triggers)
  }));
}
