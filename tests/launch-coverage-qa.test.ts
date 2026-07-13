import assert from "node:assert/strict";
import test from "node:test";
import {
  matchRulesToIntake,
  type ChecklistItem,
  type EngineRuleRecord
} from "@/lib/rule-engine";
import {
  buildRedFlags,
  formatTimeline,
  groupByJurisdiction
} from "@/lib/results-helpers";
import type { IntakeInput } from "@/lib/schemas";
import { ruleSeedData } from "@/prisma/seed-data/rules";
import { officialSourceInventory } from "@/prisma/seed-data/source-inventory";

const launchCities = [
  "phoenix",
  "tempe",
  "mesa",
  "scottsdale",
  "glendale",
  "peoria",
  "chandler",
  "gilbert"
] as const;

const cityJurisdictionCodes: Record<(typeof launchCities)[number], string> = {
  phoenix: "az-phoenix",
  tempe: "az-tempe",
  mesa: "az-mesa",
  scottsdale: "az-scottsdale",
  glendale: "az-glendale",
  peoria: "az-peoria",
  chandler: "az-chandler",
  gilbert: "az-gilbert"
};

const baseIntake: IntakeInput = {
  eventName: "Launch QA event",
  city: "phoenix",
  county: "Maricopa County",
  useCase: "multi-vendor-market",
  eventType: "outdoor-market",
  propertyUse: "private-property",
  expectedAttendance: 175,
  vendorCount: 5,
  eventDate: "2026-08-12",
  recurrence: "one-time",
  hasFood: false,
  hasFoodTruck: false,
  hasRetailSales: false,
  hasAlcohol: false,
  hasAmplifiedSound: false,
  hasTemporaryStructure: false,
  hasGenerator: false,
  hasOpenFlame: false,
  hasStreetSidewalkOrParkingImpact: false
};

test("retail vendor booth scenarios stack Arizona TPT in every launch city", () => {
  for (const city of launchCities) {
    const results = matchSeedRules({
      ...baseIntake,
      city,
      useCase: "retail-vendor-booth",
      eventType: "vendor-pop-up",
      vendorCount: 1,
      hasRetailSales: true
    });

    assertIncludes(results, "az-tpt-retail-sales-license-check", city);
    assertNoOtherCityRules(results, cityJurisdictionCodes[city]);
    assertSourceAndVerificationMetadata(results);
  }
});

test("food truck or temporary food scenarios stack Maricopa County food guidance in every launch city", () => {
  for (const city of launchCities) {
    const results = matchSeedRules({
      ...baseIntake,
      city,
      useCase: "food-truck-temporary-food-vendor",
      eventType: "food-service",
      hasFood: true,
      hasFoodTruck: true,
      hasRetailSales: true
    });

    assertIncludes(results, "maricopa-special-event-food-registration-check", city);
    assertIncludes(results, "maricopa-mobile-food-establishment-permit-check", city);
    assertIncludes(results, "az-tpt-retail-sales-license-check", city);
    assertNoOtherCityRules(results, cityJurisdictionCodes[city]);
  }
});

test("small outdoor music or art event coverage is broad with Chandler private-event gap documented", () => {
  const expectedCityMatches: Partial<Record<(typeof launchCities)[number], string>> = {
    phoenix: "phoenix-temporary-assembly-event-review-check",
    tempe: "tempe-special-events-code-review-check",
    mesa: "mesa-special-event-license-timing-check",
    scottsdale: "scottsdale-special-event-permit-check",
    glendale: "glendale-special-event-permit-check",
    peoria: "peoria-special-event-review-check",
    gilbert: "gilbert-special-event-permit-check"
  };

  for (const city of launchCities) {
    const results = matchSeedRules({
      ...baseIntake,
      city,
      useCase: "small-outdoor-music-art-event",
      eventType: "music-art-event",
      propertyUse: "private-property"
    });

    if (city === "chandler") {
      assert.equal(results.length, 0);
    } else {
      assertIncludes(results, expectedCityMatches[city], city);
    }
  }
});

test("multi-vendor market scenarios return city and Arizona guidance where supported", () => {
  for (const city of launchCities) {
    const results = matchSeedRules({
      ...baseIntake,
      city,
      useCase: "multi-vendor-market",
      eventType: "outdoor-market",
      propertyUse: "public-property",
      vendorCount: 8,
      hasRetailSales: true
    });

    assert.ok(results.length > 0, `${city} should return at least one item`);
    assertIncludes(results, "az-tpt-retail-sales-license-check", city);
    assertNoOtherCityRules(results, cityJurisdictionCodes[city]);
  }
});

test("private-property parking lot coverage is strongest in Phoenix Chandler and Mesa with Glendale gap documented", () => {
  const scenarios = [
    {
      city: "phoenix" as const,
      expected: "phoenix-private-property-outdoor-event-atup-check"
    },
    {
      city: "chandler" as const,
      expected: "chandler-private-property-tspe-permit-check"
    },
    {
      city: "mesa" as const,
      expected: "mesa-special-event-license-timing-check"
    },
    {
      city: "glendale" as const,
      expected: null
    }
  ];

  for (const scenario of scenarios) {
    const results = matchSeedRules({
      ...baseIntake,
      city: scenario.city,
      useCase: "private-property-parking-lot-event",
      eventType: "outdoor-market",
      propertyUse: "parking-lot",
      hasRetailSales: true
    });

    assertIncludes(results, "az-tpt-retail-sales-license-check", scenario.city);

    if (scenario.expected) {
      assertIncludes(results, scenario.expected, scenario.city);
    } else {
      assert.equal(
        results.some((item) => item.jurisdiction === "Glendale"),
        false
      );
    }
  }
});

test("park-style event coverage returns city guidance for currently supported cities", () => {
  const expected = {
    tempe: "tempe-park-event-ordinance-review-check",
    scottsdale: "scottsdale-special-event-permit-check",
    peoria: "peoria-special-event-review-check",
    gilbert: "gilbert-special-event-permit-check",
    phoenix: "phoenix-temporary-assembly-event-review-check"
  };

  for (const [city, slug] of Object.entries(expected)) {
    const results = matchSeedRules({
      ...baseIntake,
      city,
      useCase: "small-outdoor-music-art-event",
      eventType: "community-gathering",
      propertyUse: "park-or-plaza"
    });

    assertIncludes(results, slug, city);
  }
});

test("specialized triggers match only where current verified rules support them", () => {
  assertIncludes(
    matchSeedRules({
      ...baseIntake,
      city: "tempe",
      useCase: "small-outdoor-music-art-event",
      eventType: "community-gathering",
      propertyUse: "park-or-plaza",
      hasAmplifiedSound: true
    }),
    "tempe-amplified-sound-park-review-check",
    "tempe amplified sound"
  );

  assertIncludes(
    matchSeedRules({
      ...baseIntake,
      city: "scottsdale",
      useCase: "small-outdoor-music-art-event",
      eventType: "music-art-event",
      hasTemporaryStructure: true
    }),
    "scottsdale-fire-tent-permit-check",
    "scottsdale temporary structure"
  );
  assertIncludes(
    matchSeedRules({
      ...baseIntake,
      city: "scottsdale",
      useCase: "small-outdoor-music-art-event",
      eventType: "music-art-event",
      tentOrCanopy: true,
      tentSizeRange: "large-400-sq-ft-or-more"
    }),
    "scottsdale-fire-tent-permit-check",
    "scottsdale tent or canopy"
  );

  assertIncludes(
    matchSeedRules({
      ...baseIntake,
      city: "glendale",
      useCase: "small-outdoor-music-art-event",
      eventType: "music-art-event",
      hasTemporaryStructure: true
    }),
    "glendale-temporary-structure-site-plan-check",
    "glendale temporary structure"
  );
  assertIncludes(
    matchSeedRules({
      ...baseIntake,
      city: "glendale",
      useCase: "small-outdoor-music-art-event",
      eventType: "music-art-event",
      temporaryStageOrPlatform: true
    }),
    "glendale-temporary-structure-site-plan-check",
    "glendale stage or platform"
  );

  assertIncludes(
    matchSeedRules({
      ...baseIntake,
      city: "phoenix",
      useCase: "small-outdoor-music-art-event",
      eventType: "music-art-event",
      hasAlcohol: true
    }),
    "phoenix-special-event-liquor-license-check",
    "phoenix alcohol"
  );

  assertIncludes(
    matchSeedRules({
      ...baseIntake,
      city: "scottsdale",
      useCase: "small-outdoor-music-art-event",
      eventType: "music-art-event",
      hasAlcohol: true
    }),
    "scottsdale-special-event-liquor-review",
    "scottsdale alcohol"
  );
});

test("does not duplicate fire or temporary-structure items in common scenarios", () => {
  const scottsdaleResults = matchSeedRules({
    ...baseIntake,
    city: "scottsdale",
    useCase: "small-outdoor-music-art-event",
    eventType: "music-art-event",
    hasTemporaryStructure: true,
    tentOrCanopy: true
  });
  const glendaleResults = matchSeedRules({
    ...baseIntake,
    city: "glendale",
    useCase: "small-outdoor-music-art-event",
    eventType: "music-art-event",
    hasTemporaryStructure: true,
    temporaryStageOrPlatform: true
  });

  assert.equal(
    scottsdaleResults.filter(
      (result) => result.slug === "scottsdale-fire-tent-permit-check"
    ).length,
    1
  );
  assert.equal(
    glendaleResults.filter(
      (result) => result.slug === "glendale-temporary-structure-site-plan-check"
    ).length,
    1
  );
});

test("does not duplicate traffic or right-of-way items in common scenarios", () => {
  const phoenixResults = matchSeedRules({
    ...baseIntake,
    city: "phoenix",
    useCase: "multi-vendor-market",
    eventType: "outdoor-market",
    propertyUse: "public-property",
    hasStreetSidewalkOrParkingImpact: true,
    rightOfWayUse: true
  });
  const mesaResults = matchSeedRules({
    ...baseIntake,
    city: "mesa",
    useCase: "multi-vendor-market",
    eventType: "outdoor-market",
    propertyUse: "public-property",
    hasStreetSidewalkOrParkingImpact: true,
    rightOfWayUse: true
  });
  const glendaleResults = matchSeedRules({
    ...baseIntake,
    city: "glendale",
    useCase: "multi-vendor-market",
    eventType: "outdoor-market",
    propertyUse: "public-property",
    hasStreetSidewalkOrParkingImpact: true,
    trafficControlNeeded: true
  });

  assert.equal(
    phoenixResults.filter(
      (result) => result.slug === "phoenix-right-of-way-or-public-event-review-check"
    ).length,
    1
  );
  assert.equal(
    mesaResults.filter(
      (result) => result.slug === "mesa-right-of-way-special-event-review"
    ).length,
    1
  );
  assert.equal(
    glendaleResults.filter(
      (result) => result.slug === "glendale-traffic-impact-review-check"
    ).length,
    1
  );
});

test("signage and promotion refinement only activates source-supported guidance", () => {
  const tempeSoundResults = matchSeedRules({
    ...baseIntake,
    city: "tempe",
    useCase: "small-outdoor-music-art-event",
    eventType: "community-gathering",
    propertyUse: "park-or-plaza",
    hasAmplifiedSound: true
  });
  const tempeNoSoundResults = matchSeedRules({
    ...baseIntake,
    city: "tempe",
    useCase: "small-outdoor-music-art-event",
    eventType: "community-gathering",
    propertyUse: "park-or-plaza",
    hasAmplifiedSound: false
  });
  const unsupportedPromotionResults = matchSeedRules({
    ...baseIntake,
    city: "scottsdale",
    useCase: "small-outdoor-music-art-event",
    eventType: "music-art-event",
    propertyUse: "private-property",
    temporarySignage: true,
    banners: true,
    ticketedEvent: true,
    admissionFee: true,
    publicAdvertising: true
  });

  assertIncludes(
    tempeSoundResults,
    "tempe-amplified-sound-park-review-check",
    "Tempe amplified sound"
  );
  assert.equal(
    tempeSoundResults.filter(
      (result) => result.slug === "tempe-amplified-sound-park-review-check"
    ).length,
    1
  );
  assert.equal(
    tempeNoSoundResults.some(
      (result) => result.slug === "tempe-amplified-sound-park-review-check"
    ),
    false
  );
  assert.deepEqual(
    unsupportedPromotionResults
      .filter((result) =>
        /sign|banner|ticket|admission|advertis|promotion/i.test(
          `${result.slug} ${result.title}`
        )
      )
      .map((result) => result.slug),
    []
  );
});

test("Tempe amplified sound guidance stays city-specific", () => {
  const tempeSoundRules = seedRulesToEngineRecords().filter(
    (rule) => rule.slug === "tempe-amplified-sound-park-review-check"
  );
  const phoenixResults = matchRulesToIntake(
    {
      ...baseIntake,
      city: "phoenix",
      useCase: "small-outdoor-music-art-event",
      eventType: "community-gathering",
      propertyUse: "park-or-plaza",
      hasAmplifiedSound: true
    },
    tempeSoundRules
  );

  assert.equal(phoenixResults.length, 0);
});

test("alcohol refinement activates Phoenix and Scottsdale alcohol-present guidance", () => {
  const phoenixResults = matchSeedRules({
    ...baseIntake,
    city: "phoenix",
    useCase: "small-outdoor-music-art-event",
    eventType: "music-art-event",
    alcoholPresent: true
  });
  const scottsdaleResults = matchSeedRules({
    ...baseIntake,
    city: "scottsdale",
    useCase: "small-outdoor-music-art-event",
    eventType: "music-art-event",
    alcoholPresent: true
  });

  assertIncludes(
    phoenixResults,
    "phoenix-special-event-liquor-license-check",
    "Phoenix alcohol present"
  );
  assertIncludes(
    scottsdaleResults,
    "scottsdale-special-event-liquor-review",
    "Scottsdale alcohol present"
  );
  assertSourceAndVerificationMetadata([
    phoenixResults.find(
      (result) => result.slug === "phoenix-special-event-liquor-license-check"
    )!,
    scottsdaleResults.find(
      (result) => result.slug === "scottsdale-special-event-liquor-review"
    )!
  ]);
});

test("alcohol sales and free service map to alcohol-present guidance without separate claims", () => {
  const phoenixSaleResults = matchSeedRules({
    ...baseIntake,
    city: "phoenix",
    useCase: "small-outdoor-music-art-event",
    eventType: "music-art-event",
    alcoholSold: true
  });
  const scottsdaleFreeServiceResults = matchSeedRules({
    ...baseIntake,
    city: "scottsdale",
    useCase: "small-outdoor-music-art-event",
    eventType: "music-art-event",
    alcoholServedFree: true
  });

  assertIncludes(
    phoenixSaleResults,
    "phoenix-special-event-liquor-license-check",
    "Phoenix alcohol sold"
  );
  assertIncludes(
    scottsdaleFreeServiceResults,
    "scottsdale-special-event-liquor-review",
    "Scottsdale alcohol served free"
  );
  assert.equal(
    phoenixSaleResults.filter((result) => /sold|sale/i.test(result.slug)).length,
    0
  );
  assert.equal(
    scottsdaleFreeServiceResults.filter((result) =>
      /free|byob|public-property/i.test(result.slug)
    ).length,
    0
  );
});

test("alcohol broad trigger remains backward compatible without duplicate liquor items", () => {
  const phoenixResults = matchSeedRules({
    ...baseIntake,
    city: "phoenix",
    useCase: "small-outdoor-music-art-event",
    eventType: "music-art-event",
    hasAlcohol: true,
    alcoholPresent: true,
    alcoholSold: true
  });
  const scottsdaleResults = matchSeedRules({
    ...baseIntake,
    city: "scottsdale",
    useCase: "small-outdoor-music-art-event",
    eventType: "music-art-event",
    hasAlcohol: true,
    alcoholPresent: true,
    alcoholServedFree: true
  });

  assert.equal(
    phoenixResults.filter(
      (result) => result.slug === "phoenix-special-event-liquor-license-check"
    ).length,
    1
  );
  assert.equal(
    scottsdaleResults.filter(
      (result) => result.slug === "scottsdale-special-event-liquor-review"
    ).length,
    1
  );
});

test("non-alcohol intake does not match alcohol-specific rules", () => {
  const phoenixResults = matchSeedRules({
    ...baseIntake,
    city: "phoenix",
    useCase: "small-outdoor-music-art-event",
    eventType: "music-art-event",
    hasAlcohol: false,
    alcoholPresent: false
  });
  const scottsdaleResults = matchSeedRules({
    ...baseIntake,
    city: "scottsdale",
    useCase: "small-outdoor-music-art-event",
    eventType: "music-art-event",
    hasAlcohol: false,
    alcoholPresent: false
  });

  assert.equal(
    phoenixResults.some(
      (result) => result.slug === "phoenix-special-event-liquor-license-check"
    ),
    false
  );
  assert.equal(
    scottsdaleResults.some(
      (result) => result.slug === "scottsdale-special-event-liquor-review"
    ),
    false
  );
});

test("Phoenix and Scottsdale alcohol guidance stays city-specific", () => {
  const alcoholRules = seedRulesToEngineRecords().filter((rule) =>
    [
      "phoenix-special-event-liquor-license-check",
      "scottsdale-special-event-liquor-review"
    ].includes(rule.slug)
  );
  const mesaResults = matchRulesToIntake(
    {
      ...baseIntake,
      city: "mesa",
      useCase: "small-outdoor-music-art-event",
      eventType: "music-art-event",
      alcoholPresent: true
    },
    alcoholRules
  );

  assert.equal(mesaResults.length, 0);
});

test("city-only rules do not leak across launch cities", () => {
  const engineRules = seedRulesToEngineRecords();

  for (const sourceCity of launchCities) {
    const sourceCityRules = engineRules.filter(
      (rule) => rule.jurisdictionCode === cityJurisdictionCodes[sourceCity]
    );

    for (const targetCity of launchCities) {
      if (targetCity === sourceCity) {
        continue;
      }

      const results = matchRulesToIntake(
        {
          ...baseIntake,
          city: targetCity,
          useCase: "multi-vendor-market",
          eventType: "outdoor-market",
          propertyUse: "public-property",
          hasFood: true,
          hasFoodTruck: true,
          hasRetailSales: true,
          hasAlcohol: true,
          hasAmplifiedSound: true,
          hasTemporaryStructure: true,
          hasStreetSidewalkOrParkingImpact: true
        },
        sourceCityRules
      );

      assert.equal(
        results.length,
        0,
        `${sourceCity} rules leaked into ${targetCity}`
      );
    }
  }
});

test("no-match and many-match result helpers stay clear and non-legal", () => {
  const noMatchResults = matchSeedRules({
    ...baseIntake,
    city: "arizona-state",
    useCase: "venue-host-readiness",
    eventType: "venue-hosted-event",
    propertyUse: "licensed-venue"
  });

  assert.equal(noMatchResults.length, 0);
  assert.deepEqual(formatTimeline(noMatchResults), [
    "No timeline items matched yet. Confirm timing with the agency."
  ]);

  const manyMatchResults = matchSeedRules({
    ...baseIntake,
    city: "mesa",
    useCase: "food-truck-temporary-food-vendor",
    eventType: "food-service",
    hasFood: true,
    hasFoodTruck: true,
    hasRetailSales: true
  });

  assert.ok(manyMatchResults.length >= 5);
  assert.ok(groupByJurisdiction(manyMatchResults).length >= 3);
  assert.ok(
    buildRedFlags(manyMatchResults).some((flag) =>
      flag.includes("Confirm dates, fees, forms")
    )
  );
});

test("rulesCreated inventory flags align with actual seed rule source URLs", () => {
  const sourceUrlsInRules = new Set(ruleSeedData.map((rule) => rule.source.url));

  for (const source of officialSourceInventory) {
    if (!source.rulesCreated) {
      continue;
    }

    assert.ok(source.sourceUrl, `${source.id} should have a source URL`);
    assert.ok(
      sourceUrlsInRules.has(source.sourceUrl),
      `${source.id} is marked rulesCreated but no seed rule uses its URL`
    );
  }
});

test("launch seed rules do not include sample or unverified user-facing rules", () => {
  const nonVerifiedRules = ruleSeedData.filter(
    (rule) => rule.isSample || rule.verificationStatus !== "verified"
  );

  assert.deepEqual(nonVerifiedRules, []);
});

function matchSeedRules(intake: IntakeInput) {
  return matchRulesToIntake(intake, seedRulesToEngineRecords());
}

function assertIncludes(
  results: ChecklistItem[],
  slug: string | undefined | null,
  context: string
) {
  assert.ok(slug, `${context} has no expected slug configured`);
  assert.ok(
    results.some((item) => item.slug === slug),
    `${context} did not include ${slug}; got ${results
      .map((item) => item.slug)
      .join(", ")}`
  );
}

function assertNoOtherCityRules(
  results: ChecklistItem[],
  allowedJurisdictionCode: string
) {
  const leakedCityRule = results.find((result) => {
    if (result.jurisdictionType !== "city") {
      return false;
    }

    return (
      seedRulesToEngineRecords().find((rule) => rule.slug === result.slug)
        ?.jurisdictionCode !== allowedJurisdictionCode
    );
  });

  assert.equal(leakedCityRule, undefined);
}

function assertSourceAndVerificationMetadata(results: ChecklistItem[]) {
  for (const result of results) {
    assert.ok(result.sourceUrl.startsWith("https://"));
    assert.ok(result.sourceName.length > 0);
    assert.equal(result.verificationStatus, "verified");
    assert.equal(result.isSample, false);
    assert.ok(result.agencyName.length > 0);
  }
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
