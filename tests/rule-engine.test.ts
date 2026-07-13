import assert from "node:assert/strict";
import test from "node:test";
import { matchRulesToIntake, type EngineRuleRecord } from "@/lib/rule-engine";
import type { IntakeInput } from "@/lib/schemas";
import type { RuleTriggerFields } from "@/lib/types";
import { ruleSeedData } from "@/prisma/seed-data/rules";

const baseIntake: IntakeInput = {
  eventName: "Neighborhood maker market",
  city: "phoenix",
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

test("matches a rule by city", () => {
  const results = matchRulesToIntake(baseIntake, [
    rule({
      slug: "phoenix-rule",
      title: "Phoenix sample",
      jurisdictionName: "Phoenix",
      jurisdictionType: "city",
      triggerFields: { city: "Phoenix" }
    })
  ]);

  assert.equal(results.length, 1);
  assert.equal(results[0].slug, "phoenix-rule");
});

test("matches a rule by food involvement", () => {
  const results = matchRulesToIntake(
    { ...baseIntake, hasFood: true, hasFoodTruck: true },
    [
      rule({
        slug: "food-rule",
        title: "Food sample",
        jurisdictionName: "Maricopa County",
        jurisdictionType: "county",
        triggerFields: { food_service: true, food_truck: true }
      })
    ]
  );

  assert.equal(results.length, 1);
  assert.equal(results[0].slug, "food-rule");
});

test("excludes a non-matching rule", () => {
  const results = matchRulesToIntake(baseIntake, [
    rule({
      slug: "tempe-rule",
      title: "Tempe sample",
      jurisdictionName: "Tempe",
      jurisdictionType: "city",
      triggerFields: { city: "Tempe" }
    })
  ]);

  assert.equal(results.length, 0);
});

test("normalizes string trigger matching for casing and spacing", () => {
  const results = matchRulesToIntake(baseIntake, [
    rule({
      slug: "normalization-rule",
      title: "Normalization sample",
      triggerFields: {
        city: " PHOENIX ",
        county: "maricopa county",
        use_case: "multi vendor market",
        event_type: "OUTDOOR MARKET"
      }
    })
  ]);

  assert.equal(results.length, 1);
  assert.equal(results[0].slug, "normalization-rule");
});

test("matches by normalized jurisdiction code", () => {
  const results = matchRulesToIntake(baseIntake, [
    rule({
      slug: "jurisdiction-code-rule",
      jurisdictionCode: "az-phoenix",
      triggerFields: { jurisdiction_code: "AZ Phoenix" }
    })
  ]);

  assert.equal(results.length, 1);
  assert.equal(results[0].slug, "jurisdiction-code-rule");
});

test("matches refined food fire traffic alcohol signage and property triggers", () => {
  const results = matchRulesToIntake(
    {
      ...baseIntake,
      hasFood: false,
      hasFoodTruck: false,
      hasAlcohol: false,
      hasTemporaryStructure: false,
      hasOpenFlame: false,
      hasStreetSidewalkOrParkingImpact: false,
      foodSampling: true,
      foodRequiresTemperatureControl: true,
      drinksWithIceOrGarnish: true,
      foodTruckOrMobileFoodUnit: true,
      commissaryOrBaseOfOperations: true,
      tentOrCanopy: true,
      tentSizeRange: "large-400-sq-ft-or-more",
      temporaryStageOrPlatform: true,
      cookingHeatSource: true,
      propaneOrFuelUse: true,
      parkingSpacesBlocked: true,
      trafficControlNeeded: true,
      rightOfWayUse: true,
      alcoholSold: true,
      alcoholOnPublicProperty: true,
      temporarySignage: true,
      banners: true,
      ticketedEvent: true,
      admissionFee: true,
      publicAdvertising: true,
      cityParkOrFacility: true,
      venueOrPropertyOwnerPermission: true,
      indoorOrOutdoor: "outdoor"
    },
    [
      rule({
        slug: "refined-trigger-rule",
        triggerFields: {
          food_sampling: true,
          food_requires_temperature_control: true,
          drinks_with_ice_or_garnish: true,
          food_truck_or_mobile_food_unit: true,
          commissary_or_base_of_operations: true,
          tent_or_canopy: true,
          tent_size_range: "large 400 sq ft or more",
          temporary_stage_or_platform: true,
          cooking_heat_source: true,
          propane_or_fuel_use: true,
          parking_spaces_blocked: true,
          traffic_control_needed: true,
          right_of_way_use: true,
          alcohol_sold: true,
          alcohol_on_public_property: true,
          temporary_signage: true,
          banners: true,
          ticketed_event: true,
          admission_fee: true,
          public_advertising: true,
          city_park_or_facility: true,
          venue_or_property_owner_permission: true,
          indoor_or_outdoor: "OUTDOOR"
        }
      })
    ]
  );

  assert.equal(results.length, 1);
  assert.equal(results[0].slug, "refined-trigger-rule");
});

test("maps refined fields to existing broad trigger keys", () => {
  const results = matchRulesToIntake(
    {
      ...baseIntake,
      hasFood: false,
      hasFoodTruck: false,
      hasAlcohol: false,
      hasTemporaryStructure: false,
      hasOpenFlame: false,
      hasStreetSidewalkOrParkingImpact: false,
      foodIsOpenOrPreparedOnSite: true,
      foodTruckOrMobileFoodUnit: true,
      alcoholPresent: true,
      tentOrCanopy: true,
      cookingHeatSource: true,
      streetClosure: true,
      temporarySignage: true
    },
    [
      rule({
        slug: "legacy-compatible-rule",
        triggerFields: {
          food_service: true,
          food_truck: true,
          alcohol: true,
          temporary_structure: true,
          open_flame: true,
          sidewalk_or_street_closure: true,
          signage: true
        }
      })
    ]
  );

  assert.equal(results.length, 1);
  assert.equal(results[0].slug, "legacy-compatible-rule");
});

test("excludes empty and invalid trigger records", () => {
  const results = matchRulesToIntake(baseIntake, [
    rule({
      slug: "empty-trigger-rule",
      triggerFields: {}
    }),
    {
      ...rule({
        slug: "invalid-json-rule",
        triggerFields: { state: "AZ" }
      }),
      triggerFields: "{not valid json"
    }
  ]);

  assert.equal(results.length, 0);
});

test("excludes trigger records that only contain unknown keys", () => {
  const results = matchRulesToIntake(baseIntake, [
    {
      ...rule({
        slug: "unknown-trigger-rule",
        triggerFields: { state: "AZ" }
      }),
      triggerFields: JSON.stringify({ unknown_trigger: "anything" })
    }
  ]);

  assert.equal(results.length, 0);
});

test("allows explicitly global trigger records", () => {
  const results = matchRulesToIntake(baseIntake, [
    rule({
      slug: "global-rule",
      triggerFields: { global: true }
    })
  ]);

  assert.equal(results.length, 1);
  assert.equal(results[0].slug, "global-rule");
});

test("sorts matching rules by lead time within requirement urgency", () => {
  const results = matchRulesToIntake(baseIntake, [
    rule({
      slug: "short-lead",
      title: "Short lead",
      leadTimeDays: 7,
      triggerFields: { state: "AZ" }
    }),
    rule({
      slug: "long-lead",
      title: "Long lead",
      leadTimeDays: 30,
      triggerFields: { state: "AZ" }
    })
  ]);

  assert.deepEqual(
    results.map((result) => result.slug),
    ["long-lead", "short-lead"]
  );
});

test("returns source and agency information", () => {
  const results = matchRulesToIntake(baseIntake, [
    rule({
      slug: "source-agency-rule",
      title: "Source and agency sample",
      sourceUrl: "https://example.gov/source",
      sourceName: "Official sample source",
      agencyName: "Sample Agency",
      agencyPhone: "555-0100",
      agencyEmail: "info@example.gov",
      agencyUrl: "https://example.gov",
      triggerFields: { state: "AZ" }
    })
  ]);

  assert.equal(results[0].sourceUrl, "https://example.gov/source");
  assert.equal(results[0].sourceName, "Official sample source");
  assert.equal(results[0].agencyName, "Sample Agency");
  assert.equal(results[0].agencyPhone, "555-0100");
  assert.equal(results[0].agencyEmail, "info@example.gov");
  assert.equal(results[0].agencyUrl, "https://example.gov");
});

test("returns verification information for sample and verified rules", () => {
  const results = matchRulesToIntake(baseIntake, [
    rule({
      slug: "sample-verification-rule",
      triggerFields: { state: "AZ" }
    }),
    rule({
      slug: "verified-rule",
      isSample: false,
      verificationStatus: "verified",
      lastVerified: new Date("2026-06-23T00:00:00.000Z"),
      notes: "Reviewed against official source.",
      leadTimeDays: 21,
      triggerFields: { state: "AZ" }
    })
  ]);

  const sample = results.find((result) => result.slug === "sample-verification-rule");
  const verified = results.find((result) => result.slug === "verified-rule");

  assert.equal(sample?.isSample, true);
  assert.equal(sample?.verificationStatus, "sample_placeholder");
  assert.equal(verified?.isSample, false);
  assert.equal(verified?.verificationStatus, "verified");
  assert.equal(verified?.lastVerified, "2026-06-23");
  assert.equal(verified?.verificationNote, "Reviewed against official source.");
});

test("matches verified Mesa retail and TPT seed rules for Mesa retail intake", () => {
  const results = matchRulesToIntake(
    {
      ...baseIntake,
      city: "mesa",
      useCase: "retail-vendor-booth",
      eventType: "vendor-pop-up",
      vendorCount: 1,
      hasRetailSales: true
    },
    seedRulesToEngineRecords()
  );

  const slugs = results.map((result) => result.slug);

  assert.ok(slugs.includes("mesa-business-license-retail-vendor-check"));
  assert.ok(slugs.includes("mesa-tpt-retail-region-code-check"));
});

test("matches verified Mesa special event seed rule for Mesa event intake", () => {
  const results = matchRulesToIntake(
    {
      ...baseIntake,
      city: "mesa",
      useCase: "multi-vendor-market",
      eventType: "outdoor-market",
      vendorCount: 8,
      hasRetailSales: true,
      hasStreetSidewalkOrParkingImpact: false
    },
    seedRulesToEngineRecords()
  );

  assert.ok(
    results.some(
      (result) => result.slug === "mesa-special-event-license-timing-check"
    )
  );
});

test("matches verified Mesa right-of-way seed rule for refined right-of-way intake", () => {
  const results = matchRulesToIntake(
    {
      ...baseIntake,
      city: "mesa",
      useCase: "multi-vendor-market",
      eventType: "outdoor-market",
      propertyUse: "public-property",
      rightOfWayUse: true
    },
    seedRulesToEngineRecords()
  );

  assert.ok(
    results.some((result) => result.slug === "mesa-right-of-way-special-event-review")
  );
});

test("keeps Mesa right-of-way seed rule backward compatible with broad impact intake", () => {
  const results = matchRulesToIntake(
    {
      ...baseIntake,
      city: "mesa",
      useCase: "multi-vendor-market",
      eventType: "outdoor-market",
      propertyUse: "public-property",
      hasStreetSidewalkOrParkingImpact: true
    },
    seedRulesToEngineRecords()
  );

  assert.ok(
    results.some((result) => result.slug === "mesa-right-of-way-special-event-review")
  );
});

test("does not match Mesa-only seed rules for a non-Mesa intake", () => {
  const mesaOnlyRules = seedRulesToEngineRecords().filter(
    (ruleRecord) => ruleRecord.jurisdictionCode === "az-mesa"
  );

  const results = matchRulesToIntake(baseIntake, mesaOnlyRules);

  assert.equal(results.length, 0);
});

test("returns source and verification metadata for verified Mesa seed rules", () => {
  const results = matchRulesToIntake(
    {
      ...baseIntake,
      city: "mesa",
      useCase: "food-truck-temporary-food-vendor",
      eventType: "food-service",
      hasFood: true,
      hasFoodTruck: true,
      hasRetailSales: true
    },
    seedRulesToEngineRecords()
  );

  const mobileFoodRule = results.find(
    (result) => result.slug === "mesa-mobile-food-vendor-license-check"
  );

  assert.equal(mobileFoodRule?.verificationStatus, "verified");
  assert.equal(mobileFoodRule?.isSample, false);
  assert.equal(mobileFoodRule?.lastVerified, "2026-06-23");
  assert.equal(
    mobileFoodRule?.sourceUrl,
    "https://www.mesaaz.gov/Business-Development/Licensing/Mobile-Food-Vendor-License"
  );
  assert.equal(mobileFoodRule?.agencyName, "City of Mesa Licensing");
  assert.equal(mobileFoodRule?.agencyPhone, "480-644-2316");
  assert.equal(mobileFoodRule?.agencyEmail, "licensing.info@mesaaz.gov");
});

test("matches verified Chandler public-property seed rule for public event intake", () => {
  const results = matchRulesToIntake(
    {
      ...baseIntake,
      city: "chandler",
      useCase: "multi-vendor-market",
      eventType: "outdoor-market",
      propertyUse: "public-property",
      vendorCount: 8,
      hasRetailSales: true
    },
    seedRulesToEngineRecords()
  );

  assert.ok(
    results.some(
      (result) =>
        result.slug === "chandler-public-property-special-event-permit-check"
    )
  );
});

test("matches verified Chandler private-property seed rule for private event intake", () => {
  const results = matchRulesToIntake(
    {
      ...baseIntake,
      city: "chandler",
      useCase: "private-property-parking-lot-event",
      eventType: "outdoor-market",
      propertyUse: "parking-lot",
      vendorCount: 4,
      hasRetailSales: true
    },
    seedRulesToEngineRecords()
  );

  assert.ok(
    results.some(
      (result) => result.slug === "chandler-private-property-tspe-permit-check"
    )
  );
});

test("matches verified Chandler business and specialty seed rules for retail intake", () => {
  const results = matchRulesToIntake(
    {
      ...baseIntake,
      city: "chandler",
      useCase: "retail-vendor-booth",
      eventType: "vendor-pop-up",
      propertyUse: "private-property",
      vendorCount: 1,
      hasRetailSales: true
    },
    seedRulesToEngineRecords()
  );

  const slugs = results.map((result) => result.slug);

  assert.ok(slugs.includes("chandler-business-registration-check"));
  assert.ok(slugs.includes("chandler-specialty-vendor-license-check"));
});

test("does not match Chandler-only seed rules for a non-Chandler intake", () => {
  const chandlerOnlyRules = seedRulesToEngineRecords().filter(
    (ruleRecord) => ruleRecord.jurisdictionCode === "az-chandler"
  );

  const results = matchRulesToIntake(baseIntake, chandlerOnlyRules);

  assert.equal(results.length, 0);
});

test("returns source and verification metadata for verified Chandler seed rules", () => {
  const results = matchRulesToIntake(
    {
      ...baseIntake,
      city: "chandler",
      useCase: "multi-vendor-market",
      eventType: "outdoor-market",
      propertyUse: "public-property",
      hasRetailSales: true
    },
    seedRulesToEngineRecords()
  );

  const publicEventRule = results.find(
    (result) =>
      result.slug === "chandler-public-property-special-event-permit-check"
  );

  assert.equal(publicEventRule?.verificationStatus, "verified");
  assert.equal(publicEventRule?.isSample, false);
  assert.equal(publicEventRule?.lastVerified, "2026-06-23");
  assert.equal(
    publicEventRule?.sourceUrl,
    "https://www.chandleraz.gov/explore/events-in-chandler/host-an-event/special-event-permit"
  );
  assert.equal(publicEventRule?.agencyName, "City of Chandler Special Events");
  assert.equal(publicEventRule?.agencyPhone, "480-782-2669");
  assert.equal(publicEventRule?.agencyEmail, "special.events@chandleraz.gov");
});

test("matches verified Scottsdale special event seed rule for event intake", () => {
  const results = matchRulesToIntake(
    {
      ...baseIntake,
      city: "scottsdale",
      useCase: "multi-vendor-market",
      eventType: "outdoor-market",
      propertyUse: "private-property",
      vendorCount: 8,
      hasRetailSales: true
    },
    seedRulesToEngineRecords()
  );

  assert.ok(
    results.some(
      (result) => result.slug === "scottsdale-special-event-permit-check"
    )
  );
});

test("matches verified Scottsdale business seed rule for retail intake", () => {
  const results = matchRulesToIntake(
    {
      ...baseIntake,
      city: "scottsdale",
      useCase: "retail-vendor-booth",
      eventType: "vendor-pop-up",
      propertyUse: "private-property",
      vendorCount: 1,
      hasRetailSales: true
    },
    seedRulesToEngineRecords()
  );

  assert.ok(
    results.some(
      (result) => result.slug === "scottsdale-business-registration-license-check"
    )
  );
});

test("matches verified Scottsdale fire seed rule for temporary structure intake", () => {
  const results = matchRulesToIntake(
    {
      ...baseIntake,
      city: "scottsdale",
      useCase: "small-outdoor-music-art-event",
      eventType: "music-art-event",
      propertyUse: "private-property",
      hasTemporaryStructure: true
    },
    seedRulesToEngineRecords()
  );

  assert.ok(
    results.some((result) => result.slug === "scottsdale-fire-tent-permit-check")
  );
});

test("matches verified Scottsdale fire seed rule for tent or canopy intake", () => {
  const results = matchRulesToIntake(
    {
      ...baseIntake,
      city: "scottsdale",
      useCase: "small-outdoor-music-art-event",
      eventType: "music-art-event",
      propertyUse: "private-property",
      hasTemporaryStructure: false,
      tentOrCanopy: true,
      tentSizeRange: "large-400-sq-ft-or-more"
    },
    seedRulesToEngineRecords()
  );

  assert.ok(
    results.some((result) => result.slug === "scottsdale-fire-tent-permit-check")
  );
});

test("does not match Scottsdale fire seed rule for generator or open flame alone", () => {
  const results = matchRulesToIntake(
    {
      ...baseIntake,
      city: "scottsdale",
      useCase: "small-outdoor-music-art-event",
      eventType: "music-art-event",
      propertyUse: "private-property",
      hasGenerator: true,
      hasOpenFlame: true,
      cookingHeatSource: true,
      propaneOrFuelUse: true
    },
    seedRulesToEngineRecords()
  );

  assert.equal(
    results.some((result) => result.slug === "scottsdale-fire-tent-permit-check"),
    false
  );
});

test("matches verified Scottsdale liquor seed rule for alcohol intake", () => {
  const results = matchRulesToIntake(
    {
      ...baseIntake,
      city: "scottsdale",
      useCase: "small-outdoor-music-art-event",
      eventType: "music-art-event",
      propertyUse: "private-property",
      hasAlcohol: true
    },
    seedRulesToEngineRecords()
  );

  assert.ok(
    results.some(
      (result) => result.slug === "scottsdale-special-event-liquor-review"
    )
  );
});

test("does not match Scottsdale-only seed rules for a non-Scottsdale intake", () => {
  const scottsdaleOnlyRules = seedRulesToEngineRecords().filter(
    (ruleRecord) => ruleRecord.jurisdictionCode === "az-scottsdale"
  );

  const results = matchRulesToIntake(baseIntake, scottsdaleOnlyRules);

  assert.equal(results.length, 0);
});

test("returns source and verification metadata for verified Scottsdale seed rules", () => {
  const results = matchRulesToIntake(
    {
      ...baseIntake,
      city: "scottsdale",
      useCase: "small-outdoor-music-art-event",
      eventType: "music-art-event",
      propertyUse: "private-property",
      hasTemporaryStructure: true
    },
    seedRulesToEngineRecords()
  );

  const fireRule = results.find(
    (result) => result.slug === "scottsdale-fire-tent-permit-check"
  );

  assert.equal(fireRule?.verificationStatus, "verified");
  assert.equal(fireRule?.isSample, false);
  assert.equal(fireRule?.lastVerified, "2026-06-23");
  assert.equal(
    fireRule?.sourceUrl,
    "https://www.scottsdaleaz.gov/fire/fire-services/fire-permit-services"
  );
  assert.equal(fireRule?.agencyName, "City of Scottsdale Fire Department");
  assert.equal(fireRule?.agencyPhone, "480-312-1855");
});

test("matches verified Gilbert special event seed rule for event intake", () => {
  const results = matchRulesToIntake(
    {
      ...baseIntake,
      city: "gilbert",
      useCase: "multi-vendor-market",
      eventType: "outdoor-market",
      propertyUse: "private-property",
      vendorCount: 8,
      hasRetailSales: true
    },
    seedRulesToEngineRecords()
  );

  assert.ok(
    results.some((result) => result.slug === "gilbert-special-event-permit-check")
  );
});

test("matches verified Gilbert business and TPT seed rules for retail intake", () => {
  const results = matchRulesToIntake(
    {
      ...baseIntake,
      city: "gilbert",
      useCase: "retail-vendor-booth",
      eventType: "vendor-pop-up",
      propertyUse: "private-property",
      vendorCount: 1,
      hasRetailSales: true
    },
    seedRulesToEngineRecords()
  );

  const slugs = results.map((result) => result.slug);

  assert.ok(slugs.includes("gilbert-business-license-check"));
  assert.ok(slugs.includes("gilbert-tpt-and-business-license-check"));
});

test("matches verified Gilbert vendor information seed rule for vendor intake", () => {
  const results = matchRulesToIntake(
    {
      ...baseIntake,
      city: "gilbert",
      useCase: "multi-vendor-market",
      eventType: "outdoor-market",
      propertyUse: "private-property",
      vendorCount: 5,
      hasRetailSales: true
    },
    seedRulesToEngineRecords()
  );

  assert.ok(
    results.some(
      (result) => result.slug === "gilbert-special-event-vendor-interest-check"
    )
  );
});

test("does not match Gilbert-only seed rules for a non-Gilbert intake", () => {
  const gilbertOnlyRules = seedRulesToEngineRecords().filter(
    (ruleRecord) => ruleRecord.jurisdictionCode === "az-gilbert"
  );

  const results = matchRulesToIntake(baseIntake, gilbertOnlyRules);

  assert.equal(results.length, 0);
});

test("returns source and verification metadata for verified Gilbert seed rules", () => {
  const results = matchRulesToIntake(
    {
      ...baseIntake,
      city: "gilbert",
      useCase: "multi-vendor-market",
      eventType: "outdoor-market",
      propertyUse: "private-property",
      hasRetailSales: true
    },
    seedRulesToEngineRecords()
  );

  const eventRule = results.find(
    (result) => result.slug === "gilbert-special-event-permit-check"
  );

  assert.equal(eventRule?.verificationStatus, "verified");
  assert.equal(eventRule?.isSample, false);
  assert.equal(eventRule?.lastVerified, "2026-06-23");
  assert.equal(
    eventRule?.sourceUrl,
    "https://www.gilbertaz.gov/how-do-i/view/special-event-planning-and-permits"
  );
  assert.equal(eventRule?.agencyName, "Town of Gilbert Parks and Recreation");
  assert.equal(eventRule?.agencyPhone, "480-503-6253");
  assert.equal(eventRule?.agencyEmail, "Brent.Taysom@gilbertaz.gov");
});

test("matches verified Peoria special event seed rule for event intake", () => {
  const results = matchRulesToIntake(
    {
      ...baseIntake,
      city: "peoria",
      useCase: "multi-vendor-market",
      eventType: "outdoor-market",
      propertyUse: "private-property",
      vendorCount: 8,
      hasRetailSales: true
    },
    seedRulesToEngineRecords()
  );

  assert.ok(
    results.some((result) => result.slug === "peoria-special-event-review-check")
  );
});

test("matches verified Peoria business and TPT seed rules for retail intake", () => {
  const results = matchRulesToIntake(
    {
      ...baseIntake,
      city: "peoria",
      useCase: "retail-vendor-booth",
      eventType: "vendor-pop-up",
      propertyUse: "private-property",
      vendorCount: 1,
      hasRetailSales: true
    },
    seedRulesToEngineRecords()
  );

  const slugs = results.map((result) => result.slug);

  assert.ok(slugs.includes("peoria-business-license-check"));
  assert.ok(slugs.includes("peoria-tpt-license-check"));
});

test("matches verified Peoria vendor information seed rule for vendor intake", () => {
  const results = matchRulesToIntake(
    {
      ...baseIntake,
      city: "peoria",
      useCase: "multi-vendor-market",
      eventType: "outdoor-market",
      propertyUse: "private-property",
      vendorCount: 5,
      hasRetailSales: true
    },
    seedRulesToEngineRecords()
  );

  assert.ok(
    results.some(
      (result) =>
        result.slug === "peoria-special-event-vendor-information-check"
    )
  );
});

test("does not match Peoria-only seed rules for a non-Peoria intake", () => {
  const peoriaOnlyRules = seedRulesToEngineRecords().filter(
    (ruleRecord) => ruleRecord.jurisdictionCode === "az-peoria"
  );

  const results = matchRulesToIntake(baseIntake, peoriaOnlyRules);

  assert.equal(results.length, 0);
});

test("returns source and verification metadata for verified Peoria seed rules", () => {
  const results = matchRulesToIntake(
    {
      ...baseIntake,
      city: "peoria",
      useCase: "retail-vendor-booth",
      eventType: "vendor-pop-up",
      propertyUse: "private-property",
      hasRetailSales: true
    },
    seedRulesToEngineRecords()
  );

  const businessRule = results.find(
    (result) => result.slug === "peoria-business-license-check"
  );

  assert.equal(businessRule?.verificationStatus, "verified");
  assert.equal(businessRule?.isSample, false);
  assert.equal(businessRule?.lastVerified, "2026-06-23");
  assert.equal(
    businessRule?.sourceUrl,
    "https://www.peoriaaz.gov/i-want-to/pay/business-license"
  );
  assert.equal(businessRule?.agencyName, "City of Peoria Sales Tax and License");
  assert.equal(businessRule?.agencyPhone, "623-773-7160");
  assert.equal(businessRule?.agencyEmail, "businesslicense@peoriaaz.gov");
});

test("matches verified Glendale special event seed rule for event intake", () => {
  const results = matchRulesToIntake(
    {
      ...baseIntake,
      city: "glendale",
      useCase: "multi-vendor-market",
      eventType: "outdoor-market",
      propertyUse: "private-property",
      vendorCount: 8,
      hasRetailSales: true
    },
    seedRulesToEngineRecords()
  );

  assert.ok(
    results.some((result) => result.slug === "glendale-special-event-permit-check")
  );
});

test("matches verified Glendale traffic impact seed rule for street or parking impacts", () => {
  const results = matchRulesToIntake(
    {
      ...baseIntake,
      city: "glendale",
      useCase: "multi-vendor-market",
      eventType: "outdoor-market",
      propertyUse: "public-property",
      hasStreetSidewalkOrParkingImpact: true
    },
    seedRulesToEngineRecords()
  );

  assert.ok(
    results.some(
      (result) => result.slug === "glendale-traffic-impact-review-check"
    )
  );
});

test("matches verified Glendale traffic impact seed rule for refined traffic-control intake", () => {
  const results = matchRulesToIntake(
    {
      ...baseIntake,
      city: "glendale",
      useCase: "multi-vendor-market",
      eventType: "outdoor-market",
      propertyUse: "public-property",
      trafficControlNeeded: true
    },
    seedRulesToEngineRecords()
  );

  assert.ok(
    results.some(
      (result) => result.slug === "glendale-traffic-impact-review-check"
    )
  );
});

test("matches verified Glendale temporary structure seed rule for temporary structure intake", () => {
  const results = matchRulesToIntake(
    {
      ...baseIntake,
      city: "glendale",
      useCase: "small-outdoor-music-art-event",
      eventType: "music-art-event",
      propertyUse: "private-property",
      hasTemporaryStructure: true
    },
    seedRulesToEngineRecords()
  );

  assert.ok(
    results.some(
      (result) => result.slug === "glendale-temporary-structure-site-plan-check"
    )
  );
});

test("matches verified Glendale temporary structure seed rule for stage or platform intake", () => {
  const results = matchRulesToIntake(
    {
      ...baseIntake,
      city: "glendale",
      useCase: "small-outdoor-music-art-event",
      eventType: "music-art-event",
      propertyUse: "private-property",
      hasTemporaryStructure: false,
      temporaryStageOrPlatform: true
    },
    seedRulesToEngineRecords()
  );

  assert.ok(
    results.some(
      (result) => result.slug === "glendale-temporary-structure-site-plan-check"
    )
  );
});

test("does not match Glendale-only seed rules for a non-Glendale intake", () => {
  const glendaleOnlyRules = seedRulesToEngineRecords().filter(
    (ruleRecord) => ruleRecord.jurisdictionCode === "az-glendale"
  );

  const results = matchRulesToIntake(baseIntake, glendaleOnlyRules);

  assert.equal(results.length, 0);
});

test("returns source and verification metadata for verified Glendale seed rules", () => {
  const results = matchRulesToIntake(
    {
      ...baseIntake,
      city: "glendale",
      useCase: "multi-vendor-market",
      eventType: "outdoor-market",
      propertyUse: "private-property",
      hasRetailSales: true
    },
    seedRulesToEngineRecords()
  );

  const eventRule = results.find(
    (result) => result.slug === "glendale-special-event-permit-check"
  );

  assert.equal(eventRule?.verificationStatus, "verified");
  assert.equal(eventRule?.isSample, false);
  assert.equal(eventRule?.lastVerified, "2026-06-23");
  assert.equal(
    eventRule?.sourceUrl,
    "https://www.glendaleaz.gov/Community/ApplyRegister-For/Special-event-application-process"
  );
  assert.equal(eventRule?.agencyName, "City of Glendale Special Events");
  assert.equal(eventRule?.agencyPhone, "623-930-4420");
  assert.equal(eventRule?.agencyEmail, "Events@glendaleaz.com");
});

type RuleOverride = Omit<Partial<EngineRuleRecord>, "triggerFields"> & {
  triggerFields?: RuleTriggerFields;
};

function rule(overrides: RuleOverride): EngineRuleRecord {
  return {
    id: overrides.id ?? overrides.slug ?? "sample-rule",
    slug: overrides.slug ?? "sample-rule",
    title: overrides.title ?? "Sample rule",
    plainEnglishSummary:
      overrides.plainEnglishSummary ??
      "Sample only. Confirm details with the relevant agency.",
    requirementLevel: overrides.requirementLevel ?? "may be required",
    confidence: overrides.confidence ?? "low",
    leadTimeDays: overrides.leadTimeDays ?? 14,
    sourceUrl: overrides.sourceUrl ?? "https://example.gov",
    sourceName: overrides.sourceName ?? "Official sample source",
    lastVerified: overrides.lastVerified ?? null,
    isSample: overrides.isSample ?? true,
    verificationStatus: overrides.verificationStatus ?? "sample_unverified",
    notes: overrides.notes ?? null,
    jurisdictionName: overrides.jurisdictionName ?? "Arizona",
    jurisdictionCode: overrides.jurisdictionCode ?? "az",
    jurisdictionType: overrides.jurisdictionType ?? "state",
    city: overrides.city ?? null,
    county: overrides.county ?? null,
    state: overrides.state ?? "AZ",
    agencyName: overrides.agencyName ?? "Sample Agency",
    agencyPhone: overrides.agencyPhone ?? null,
    agencyEmail: overrides.agencyEmail ?? null,
    agencyUrl: overrides.agencyUrl ?? null,
    triggerFields: JSON.stringify(overrides.triggerFields ?? {})
  };
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
