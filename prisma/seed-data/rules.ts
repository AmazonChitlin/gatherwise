type SeedJurisdiction = {
  code: string;
  name: string;
  type: string;
  city?: string;
  county?: string;
  state: string;
};

type SeedAgency = {
  slug: string;
  name: string;
  phone?: string;
  email?: string;
  url?: string;
};

type SeedRule = {
  slug: string;
  title: string;
  plainEnglishSummary: string;
  requirementLevel: string;
  confidence: string;
  leadTimeDays: number;
  isSample: boolean;
  verificationStatus: string;
  lastVerified: string | null;
  source: {
    name: string;
    url: string;
  };
  jurisdiction: SeedJurisdiction;
  agency: SeedAgency;
  useCase: string;
  triggers: Record<string, string | string[] | number | boolean>;
  adminNote: string;
};

export const useCaseSeedData = [
  {
    slug: "retail-vendor-booth",
    name: "Retail vendor booth",
    description: "A vendor selling goods at a pop-up, market, or booth."
  },
  {
    slug: "food-truck-temporary-food-vendor",
    name: "Food truck or temporary food vendor",
    description: "Food service from a truck, temporary booth, or market setup."
  },
  {
    slug: "small-outdoor-music-art-event",
    name: "Small outdoor music/art event",
    description: "A small outdoor event with music, art, gathering, or vendors."
  },
  {
    slug: "multi-vendor-market",
    name: "Multi-vendor market",
    description: "A market or event with more than one vendor."
  },
  {
    slug: "private-property-parking-lot-event",
    name: "Private-property parking lot event",
    description: "An outdoor event hosted on private property or a parking lot."
  },
  {
    slug: "venue-host-readiness",
    name: "Pop-up venue/host readiness",
    description: "A venue or host checking readiness before allowing an event."
  }
];

export const ruleSeedData: SeedRule[] = [
  {
    slug: "az-tpt-retail-sales-license-check",
    title: "Arizona TPT license check for retail sales",
    plainEnglishSummary:
      "Official source says Arizona transaction privilege tax is a tax on vendors for the privilege of doing business in the state, and some business activities are subject to TPT licensing. Retail sales may need a TPT license or related tax steps. Confirm with the Arizona Department of Revenue.",
    requirementLevel: "may be required",
    confidence: "medium",
    leadTimeDays: 14,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "Arizona Department of Revenue - Transaction Privilege Tax",
      url: "https://azdor.gov/business/transaction-privilege-tax"
    },
    jurisdiction: {
      code: "az",
      name: "Arizona",
      type: "state",
      state: "AZ"
    },
    agency: {
      slug: "az-department-of-revenue",
      name: "Arizona Department of Revenue",
      url: "https://azdor.gov/"
    },
    useCase: "retail-vendor-booth",
    triggers: {
      state: "AZ",
      retail_sales: true
    },
    adminNote:
      "Verified proof-of-concept rule from the official ADOR Transaction Privilege Tax page. Still use cautious language and ask users to confirm with ADOR."
  },
  {
    slug: "mesa-special-event-license-timing-check",
    title: "Mesa special event license timing check",
    plainEnglishSummary:
      "Official source says Mesa special event license processing can include different application timeframes depending on event size and right-of-way impacts. A Mesa event, market, or outdoor setup may need a special event license review. Start early and confirm timing with Mesa Special Events.",
    requirementLevel: "may be required",
    confidence: "high",
    leadTimeDays: 14,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "City of Mesa - Special Event License",
      url: "https://www.mesaaz.gov/Business-Development/Special-Event-License"
    },
    jurisdiction: {
      code: "az-mesa",
      name: "Mesa",
      type: "city",
      city: "Mesa",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "city-of-mesa-special-events",
      name: "City of Mesa Special Events",
      phone: "480-644-3500",
      email: "specialevents@mesaaz.gov",
      url: "https://www.mesaaz.gov/Business-Development/Special-Event-License"
    },
    useCase: "multi-vendor-market",
    triggers: {
      jurisdiction_code: "az-mesa",
      city: "Mesa",
      use_cases: [
        "multi-vendor-market",
        "small-outdoor-music-art-event",
        "private-property-parking-lot-event",
        "venue-host-readiness"
      ],
      event_types: [
        "outdoor-market",
        "music-art-event",
        "community-gathering",
        "venue-hosted-event"
      ]
    },
    adminNote:
      "Verified from Mesa Special Event License page. Lead time uses the smallest published Mesa application window; page also lists 30- and 90-day windows depending on event size and right-of-way impacts."
  },
  {
    slug: "mesa-right-of-way-special-event-review",
    title: "Mesa right-of-way event review",
    plainEnglishSummary:
      "Official source says Mesa large special events with public right-of-way restrictions have a longer application timeframe. If an event may affect streets, sidewalks, alleys, parking, or traffic, confirm the special event and traffic attachment requirements with Mesa Special Events.",
    requirementLevel: "likely required",
    confidence: "high",
    leadTimeDays: 90,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "City of Mesa - Special Event License",
      url: "https://www.mesaaz.gov/Business-Development/Special-Event-License"
    },
    jurisdiction: {
      code: "az-mesa",
      name: "Mesa",
      type: "city",
      city: "Mesa",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "city-of-mesa-special-events",
      name: "City of Mesa Special Events",
      phone: "480-644-3500",
      email: "specialevents@mesaaz.gov",
      url: "https://www.mesaaz.gov/Business-Development/Special-Event-License"
    },
    useCase: "multi-vendor-market",
    triggers: {
      jurisdiction_code: "az-mesa",
      city: "Mesa",
      right_of_way_use: true
    },
    adminNote:
      "Verified from Mesa Special Event License fees/timeframes and application attachment sections. Trigger now uses refined right_of_way_use; legacy broad street/sidewalk/parking impact intake remains compatible through rule-engine mapping."
  },
  {
    slug: "mesa-business-license-retail-vendor-check",
    title: "Mesa business license check for retail or service vendors",
    plainEnglishSummary:
      "Official source says most businesses that collect sales tax, service businesses, and home-based businesses operating in Mesa need a Mesa business license, while some exemptions apply. Retail vendors or sellers should confirm whether the Mesa general business license applies before selling in Mesa.",
    requirementLevel: "may be required",
    confidence: "medium",
    leadTimeDays: 10,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "City of Mesa - Mesa General Business License",
      url:
        "https://www.mesaaz.gov/Business-Development/Licensing/Mesa-General-Business-License"
    },
    jurisdiction: {
      code: "az-mesa",
      name: "Mesa",
      type: "city",
      city: "Mesa",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "city-of-mesa-licensing",
      name: "City of Mesa Licensing",
      phone: "480-644-2316",
      email: "licensing.info@mesaaz.gov",
      url:
        "https://www.mesaaz.gov/Business-Development/Licensing/Mesa-General-Business-License"
    },
    useCase: "retail-vendor-booth",
    triggers: {
      jurisdiction_code: "az-mesa",
      city: "Mesa",
      retail_sales: true
    },
    adminNote:
      "Verified from Mesa General Business License page. Lead time is a cautious planning placeholder because the page does not publish a fixed calendar-day processing window for the general business license."
  },
  {
    slug: "mesa-tpt-retail-region-code-check",
    title: "Mesa TPT and region code check for retail sales",
    plainEnglishSummary:
      "Official source says Mesa transaction privilege tax is handled through the Arizona Department of Revenue and identifies Mesa's city code as ME. If retail sales will happen in Mesa, confirm whether a TPT license, Mesa region code, or filing step applies before selling.",
    requirementLevel: "may be required",
    confidence: "high",
    leadTimeDays: 14,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "City of Mesa - Transaction Privilege (TPT) Tax",
      url:
        "https://www.mesaaz.gov/Business-Development/Transaction-Privilege-TPT-Tax"
    },
    jurisdiction: {
      code: "az-mesa",
      name: "Mesa",
      type: "city",
      city: "Mesa",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "city-of-mesa-sales-tax",
      name: "City of Mesa Sales Tax",
      phone: "480-644-3816",
      email: "salestax.info@mesaaz.gov",
      url:
        "https://www.mesaaz.gov/Business-Development/Transaction-Privilege-TPT-Tax"
    },
    useCase: "retail-vendor-booth",
    triggers: {
      jurisdiction_code: "az-mesa",
      city: "Mesa",
      retail_sales: true
    },
    adminNote:
      "Verified from Mesa Transaction Privilege Tax page and kept city-specific. Lead time is a cautious planning placeholder; source points users to ADOR/AZTaxes for filing and licensing steps."
  },
  {
    slug: "mesa-mobile-food-vendor-license-check",
    title: "Mesa mobile food vendor license check",
    plainEnglishSummary:
      "Official source says mobile food vendors that wish to operate within Mesa city limits must first obtain the Mesa Mobile Food Vendor license. Food trucks and mobile food vendors should confirm Mesa licensing, fire inspection, county permit, and TPT documentation before operating.",
    requirementLevel: "likely required",
    confidence: "high",
    leadTimeDays: 28,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "City of Mesa - Mobile Food Vendor License",
      url:
        "https://www.mesaaz.gov/Business-Development/Licensing/Mobile-Food-Vendor-License"
    },
    jurisdiction: {
      code: "az-mesa",
      name: "Mesa",
      type: "city",
      city: "Mesa",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "city-of-mesa-licensing",
      name: "City of Mesa Licensing",
      phone: "480-644-2316",
      email: "licensing.info@mesaaz.gov",
      url:
        "https://www.mesaaz.gov/Business-Development/Licensing/Mobile-Food-Vendor-License"
    },
    useCase: "food-truck-temporary-food-vendor",
    triggers: {
      jurisdiction_code: "az-mesa",
      city: "Mesa",
      food_truck: true
    },
    adminNote:
      "Verified from Mesa Mobile Food Vendor License page. Lead time uses four weeks from the source's two-to-four-week average processing time."
  },
  {
    slug: "chandler-public-property-special-event-permit-check",
    title: "Chandler public-property special event permit check",
    plainEnglishSummary:
      "Official source says Chandler public-property events may use the Public Property Special Event Permit process, including events in public venues, outdoor public spaces, parks, right-of-way areas, or events with public participation. Confirm the correct application path and timing with Chandler Special Events.",
    requirementLevel: "may be required",
    confidence: "high",
    leadTimeDays: 120,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "City of Chandler - Public Property: Special Event Permit",
      url:
        "https://www.chandleraz.gov/explore/events-in-chandler/host-an-event/special-event-permit"
    },
    jurisdiction: {
      code: "az-chandler",
      name: "Chandler",
      type: "city",
      city: "Chandler",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "city-of-chandler-special-events",
      name: "City of Chandler Special Events",
      phone: "480-782-2669",
      email: "special.events@chandleraz.gov",
      url:
        "https://www.chandleraz.gov/explore/events-in-chandler/host-an-event/special-event-permit"
    },
    useCase: "multi-vendor-market",
    triggers: {
      jurisdiction_code: "az-chandler",
      city: "Chandler",
      public_property: true,
      use_cases: [
        "multi-vendor-market",
        "small-outdoor-music-art-event",
        "private-property-parking-lot-event",
        "venue-host-readiness"
      ]
    },
    adminNote:
      "Verified from Chandler Public Property Special Event Permit page. Lead time uses 120 days as a cautious approximation of the published first-time event recommendation of 4-6 months."
  },
  {
    slug: "chandler-private-property-tspe-permit-check",
    title: "Chandler private-property TSPE permit check",
    plainEnglishSummary:
      "Official source says Chandler private-property events that deviate from the permitted use of the space may be treated as Temporary Sales and Promotional Events. Private-property markets, food truck events, sidewalk sales, parking lot extensions, or promotional events may need TSPE review. Confirm with Chandler TSPE staff.",
    requirementLevel: "may be required",
    confidence: "high",
    leadTimeDays: 60,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "City of Chandler - Private Property Event: TSPE Permit",
      url:
        "https://www.chandleraz.gov/explore/events-in-chandler/host-an-event/tspe-permit"
    },
    jurisdiction: {
      code: "az-chandler",
      name: "Chandler",
      type: "city",
      city: "Chandler",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "city-of-chandler-tspe",
      name: "City of Chandler TSPE",
      phone: "480-782-2649",
      email: "tspe@chandleraz.gov",
      url:
        "https://www.chandleraz.gov/explore/events-in-chandler/host-an-event/tspe-permit"
    },
    useCase: "private-property-parking-lot-event",
    triggers: {
      jurisdiction_code: "az-chandler",
      city: "Chandler",
      private_property: true,
      use_cases: [
        "private-property-parking-lot-event",
        "venue-host-readiness",
        "multi-vendor-market"
      ]
    },
    adminNote:
      "Verified from Chandler Private Property Event TSPE page. Lead time uses the source's no-cost 60-days-or-more application window; applications 19 days or less are not accepted."
  },
  {
    slug: "chandler-business-registration-check",
    title: "Chandler business registration check",
    plainEnglishSummary:
      "Official source says Chandler businesses are required to complete a Business Registration Application and obtain a business registration for each physical location operating within city limits, with some exclusions listed in city code. Vendors and sellers should confirm whether Chandler business registration applies before operating.",
    requirementLevel: "may be required",
    confidence: "medium",
    leadTimeDays: 14,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "City of Chandler - Business Registration",
      url: "https://www.chandleraz.gov/business/tax-and-license/business-registration"
    },
    jurisdiction: {
      code: "az-chandler",
      name: "Chandler",
      type: "city",
      city: "Chandler",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "city-of-chandler-tax-and-license",
      name: "City of Chandler Tax and License",
      url: "https://www.chandleraz.gov/business/tax-and-license/business-registration"
    },
    useCase: "retail-vendor-booth",
    triggers: {
      jurisdiction_code: "az-chandler",
      city: "Chandler",
      retail_sales: true
    },
    adminNote:
      "Verified from Chandler Business Registration page. Lead time uses 14 calendar days as a cautious planning conversion from the source's normal 10 business day approval process once a completed application is filed."
  },
  {
    slug: "chandler-specialty-vendor-license-check",
    title: "Chandler specialty vendor license check",
    plainEnglishSummary:
      "Official source says Chandler transient merchant, peddler, canvasser, and solicitor permits are required before conducting listed sales or solicitation activities within the city. Retail vendors, mobile sellers, or temporary merchants should confirm whether a specialty license applies.",
    requirementLevel: "may be required",
    confidence: "medium",
    leadTimeDays: 30,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "City of Chandler - Specialty Licenses",
      url:
        "https://www.chandleraz.gov/business/tax-and-license/licensing/specialty-licenses"
    },
    jurisdiction: {
      code: "az-chandler",
      name: "Chandler",
      type: "city",
      city: "Chandler",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "city-of-chandler-tax-and-license",
      name: "City of Chandler Tax and License",
      url:
        "https://www.chandleraz.gov/business/tax-and-license/licensing/specialty-licenses"
    },
    useCase: "retail-vendor-booth",
    triggers: {
      jurisdiction_code: "az-chandler",
      city: "Chandler",
      retail_sales: true,
      use_cases: ["retail-vendor-booth", "multi-vendor-market"]
    },
    adminNote:
      "Verified from Chandler Specialty Licenses page. Lead time is a cautious planning placeholder because the page links to processing timelines but does not publish a fixed number on the source page."
  },
  {
    slug: "scottsdale-special-event-permit-check",
    title: "Scottsdale special event permit check",
    plainEnglishSummary:
      "Official source says Scottsdale requires a special event permit application for temporary outdoor activities on public or private property that are inconsistent with the legal use of the property and open to the public by advertisement or invitation. Confirm the correct permit path with Scottsdale Tourism and Events before hosting.",
    requirementLevel: "may be required",
    confidence: "high",
    leadTimeDays: 45,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "City of Scottsdale - Special Event Planning & Permits",
      url: "https://www.scottsdaleaz.gov/special-events"
    },
    jurisdiction: {
      code: "az-scottsdale",
      name: "Scottsdale",
      type: "city",
      city: "Scottsdale",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "city-of-scottsdale-tourism-and-events",
      name: "City of Scottsdale Tourism and Events",
      phone: "480-312-7177",
      url: "https://www.scottsdaleaz.gov/special-events"
    },
    useCase: "multi-vendor-market",
    triggers: {
      jurisdiction_code: "az-scottsdale",
      city: "Scottsdale",
      use_cases: [
        "multi-vendor-market",
        "small-outdoor-music-art-event",
        "private-property-parking-lot-event",
        "venue-host-readiness"
      ],
      event_types: [
        "outdoor-market",
        "music-art-event",
        "community-gathering",
        "venue-hosted-event"
      ]
    },
    adminNote:
      "Verified from Scottsdale Special Event Planning & Permits page. Lead time is a cautious planning placeholder because the page links to review timeframes but does not publish a single fixed number on the page itself."
  },
  {
    slug: "scottsdale-business-registration-license-check",
    title: "Scottsdale business registration license check",
    plainEnglishSummary:
      "Official source says all businesses located in Scottsdale require a Business Registration License and may require an additional Regulatory License. Vendors and sellers should confirm whether a Scottsdale service, merchant, or regulatory license applies before operating.",
    requirementLevel: "may be required",
    confidence: "medium",
    leadTimeDays: 14,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "City of Scottsdale - Business & Regulatory Licenses",
      url: "https://www.scottsdaleaz.gov/licenses"
    },
    jurisdiction: {
      code: "az-scottsdale",
      name: "Scottsdale",
      type: "city",
      city: "Scottsdale",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "city-of-scottsdale-business-services",
      name: "City of Scottsdale Business Services",
      phone: "480-312-2400",
      url: "https://www.scottsdaleaz.gov/licenses"
    },
    useCase: "retail-vendor-booth",
    triggers: {
      jurisdiction_code: "az-scottsdale",
      city: "Scottsdale",
      retail_sales: true
    },
    adminNote:
      "Verified from Scottsdale Business & Regulatory Licenses page. Lead time is a cautious planning placeholder because the source does not publish one fixed business registration processing timeframe."
  },
  {
    slug: "scottsdale-fire-tent-permit-check",
    title: "Scottsdale fire permit check for tents and canopies",
    plainEnglishSummary:
      "Official source says Scottsdale fire permits are required for various event operations, including tents over listed size thresholds, multiple tents at one event, and certain booth or display setups. If the event uses tents or canopies, confirm fire permit needs with Scottsdale Fire.",
    requirementLevel: "may be required",
    confidence: "high",
    leadTimeDays: 10,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "City of Scottsdale - Fire Permit Services",
      url: "https://www.scottsdaleaz.gov/fire/fire-services/fire-permit-services"
    },
    jurisdiction: {
      code: "az-scottsdale",
      name: "Scottsdale",
      type: "city",
      city: "Scottsdale",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "city-of-scottsdale-fire-department",
      name: "City of Scottsdale Fire Department",
      phone: "480-312-1855",
      url: "https://www.scottsdaleaz.gov/fire/fire-services/fire-permit-services"
    },
    useCase: "small-outdoor-music-art-event",
    triggers: {
      jurisdiction_code: "az-scottsdale",
      city: "Scottsdale",
      tent_or_canopy: true
    },
    adminNote:
      "Verified from Scottsdale Fire Permit Services page. Trigger now uses the refined tent_or_canopy fact; legacy temporary-structure intake remains compatible through rule-engine mapping. Lead time uses the page's rush-fee threshold of under 10 days as a practical planning warning, not as a guarantee of approval timing."
  },
  {
    slug: "scottsdale-special-event-liquor-review",
    title: "Scottsdale special event liquor review",
    plainEnglishSummary:
      "Official source says special events involving alcohol may need either a temporary extension of premises or a special event liquor license process, with city review and Arizona Department of Liquor Licenses and Control involvement. Confirm the correct path with Scottsdale and AZ DLLC before serving or selling alcohol.",
    requirementLevel: "may be required",
    confidence: "high",
    leadTimeDays: 20,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "City of Scottsdale - Obtaining a Liquor Permit for a Special Event",
      url: "https://www.scottsdaleaz.gov/special-events/special-event-liquor"
    },
    jurisdiction: {
      code: "az-scottsdale",
      name: "Scottsdale",
      type: "city",
      city: "Scottsdale",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "city-of-scottsdale-tourism-and-events",
      name: "City of Scottsdale Tourism and Events",
      phone: "480-312-7177",
      url: "https://www.scottsdaleaz.gov/special-events/special-event-liquor"
    },
    useCase: "small-outdoor-music-art-event",
    triggers: {
      jurisdiction_code: "az-scottsdale",
      city: "Scottsdale",
      alcohol_present: true
    },
    adminNote:
      "Verified from Scottsdale special event liquor page. Trigger now uses the refined alcohol_present fact; legacy broad alcohol intake remains compatible through rule-engine mapping. Lead time uses the source's minimum 20-day submission note for special event liquor license applications. This rule does not make separate BYOB, alcohol-sale, free-service, or public-property alcohol conclusions."
  },
  {
    slug: "gilbert-special-event-permit-check",
    title: "Gilbert special event permit check",
    plainEnglishSummary:
      "Official source says some Gilbert events may be required to obtain a special event permit, and applicants can use the Town's flow chart or contact a Special Event Coordinator to evaluate whether a permit is needed. Confirm the correct path with Gilbert Parks and Recreation before hosting.",
    requirementLevel: "may be required",
    confidence: "high",
    leadTimeDays: 60,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "Town of Gilbert - Special Event Planning and Permits",
      url: "https://www.gilbertaz.gov/how-do-i/view/special-event-planning-and-permits"
    },
    jurisdiction: {
      code: "az-gilbert",
      name: "Gilbert",
      type: "city",
      city: "Gilbert",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "town-of-gilbert-parks-and-recreation",
      name: "Town of Gilbert Parks and Recreation",
      phone: "480-503-6253",
      email: "Brent.Taysom@gilbertaz.gov",
      url: "https://www.gilbertaz.gov/how-do-i/view/special-event-planning-and-permits"
    },
    useCase: "multi-vendor-market",
    triggers: {
      jurisdiction_code: "az-gilbert",
      city: "Gilbert",
      use_cases: [
        "multi-vendor-market",
        "small-outdoor-music-art-event",
        "venue-host-readiness"
      ],
      event_types: [
        "outdoor-market",
        "music-art-event",
        "community-gathering",
        "venue-hosted-event"
      ]
    },
    adminNote:
      "Verified from Gilbert Special Event Planning and Permits page. Lead time uses the source's 60-day application deadline; page notes new or larger events may need additional time."
  },
  {
    slug: "gilbert-business-license-check",
    title: "Gilbert business license check",
    plainEnglishSummary:
      "Official source says businesses that are new to Gilbert, have moved to a new location, or have a change in ownership should apply for a new business license through Gilbert's One Stop Shop. Vendors and sellers should confirm whether a Gilbert business license applies before operating.",
    requirementLevel: "may be required",
    confidence: "medium",
    leadTimeDays: 14,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "Town of Gilbert - Business Registration and Licensing",
      url: "https://www.gilbertaz.gov/business/business-registration-and-licensing"
    },
    jurisdiction: {
      code: "az-gilbert",
      name: "Gilbert",
      type: "city",
      city: "Gilbert",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "town-of-gilbert-development-services",
      name: "Town of Gilbert Development Services",
      phone: "480-503-6700",
      email: "onestopshop@gilbertaz.gov",
      url: "https://www.gilbertaz.gov/business/business-registration-and-licensing"
    },
    useCase: "retail-vendor-booth",
    triggers: {
      jurisdiction_code: "az-gilbert",
      city: "Gilbert",
      retail_sales: true
    },
    adminNote:
      "Verified from Gilbert Business Registration and Licensing page. Lead time is a cautious planning placeholder because the source does not publish a fixed processing timeframe."
  },
  {
    slug: "gilbert-special-event-vendor-interest-check",
    title: "Gilbert special event vendor interest check",
    plainEnglishSummary:
      "Official source says food or retail vendors interested in Gilbert special events should submit the vendor interest form, and selected vendors receive additional details and next steps from the Special Events team. Confirm vendor selection and event-specific requirements before setting up.",
    requirementLevel: "confirm with the agency",
    confidence: "medium",
    leadTimeDays: 30,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "Town of Gilbert - Special Event Vendor Information",
      url:
        "https://www.gilbertaz.gov/departments/parks-and-recreation/special-event-vendor-information"
    },
    jurisdiction: {
      code: "az-gilbert",
      name: "Gilbert",
      type: "city",
      city: "Gilbert",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "town-of-gilbert-parks-and-recreation",
      name: "Town of Gilbert Parks and Recreation",
      phone: "480-503-6000",
      url:
        "https://www.gilbertaz.gov/departments/parks-and-recreation/special-event-vendor-information"
    },
    useCase: "retail-vendor-booth",
    triggers: {
      jurisdiction_code: "az-gilbert",
      city: "Gilbert",
      use_cases: ["retail-vendor-booth", "multi-vendor-market"],
      retail_sales: true
    },
    adminNote:
      "Verified from Gilbert Special Event Vendor Information and Special Events and Permits pages. Lead time is a cautious planning placeholder because no fixed vendor review timeframe is published on the source page."
  },
  {
    slug: "gilbert-tpt-and-business-license-check",
    title: "Gilbert TPT and business license check",
    plainEnglishSummary:
      "Official source says Gilbert business licensing and Arizona Transaction Privilege Tax licensing are different, and special event vendors for trade shows, farmers markets, or festivals in Gilbert might need a business license and might need a TPT license. Confirm licensing needs with Gilbert and ADOR before selling.",
    requirementLevel: "may be required",
    confidence: "high",
    leadTimeDays: 14,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name:
        "Town of Gilbert - Business License vs Transaction Privilege (Sales) Tax License",
      url:
        "https://www.gilbertaz.gov/departments/finance-mgmt-services/tax-compliance-division/business-license-vs-transaction-privilege-sales-tax-license"
    },
    jurisdiction: {
      code: "az-gilbert",
      name: "Gilbert",
      type: "city",
      city: "Gilbert",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "town-of-gilbert-tax-compliance",
      name: "Town of Gilbert Tax Compliance Division",
      phone: "480-503-6000",
      email: "SalesTax@GilbertAZ.gov",
      url:
        "https://www.gilbertaz.gov/departments/finance-mgmt-services/tax-compliance-division/business-license-vs-transaction-privilege-sales-tax-license"
    },
    useCase: "retail-vendor-booth",
    triggers: {
      jurisdiction_code: "az-gilbert",
      city: "Gilbert",
      retail_sales: true
    },
    adminNote:
      "Verified from Gilbert Business License vs TPT License page. Lead time is a cautious planning placeholder because the source does not publish a fixed processing timeframe and points users to Gilbert and ADOR for questions."
  },
  {
    slug: "glendale-special-event-permit-check",
    title: "Glendale special event permit check",
    plainEnglishSummary:
      "Official source says Glendale has a Special Event Application Center and that all special events regardless of type require submission of a Special Event Master Application and comprehensive site plan. Glendale events, markets, or outdoor gatherings may need special event review before setup. Confirm the correct application path with Glendale Special Events.",
    requirementLevel: "may be required",
    confidence: "high",
    leadTimeDays: 60,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "City of Glendale - Special Event Permit",
      url:
        "https://www.glendaleaz.gov/Community/ApplyRegister-For/Special-event-application-process"
    },
    jurisdiction: {
      code: "az-glendale",
      name: "Glendale",
      type: "city",
      city: "Glendale",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "city-of-glendale-special-events",
      name: "City of Glendale Special Events",
      phone: "623-930-4420",
      email: "Events@glendaleaz.com",
      url:
        "https://www.glendaleaz.gov/Community/ApplyRegister-For/Special-event-application-process"
    },
    useCase: "multi-vendor-market",
    triggers: {
      jurisdiction_code: "az-glendale",
      city: "Glendale",
      use_cases: [
        "multi-vendor-market",
        "small-outdoor-music-art-event",
        "venue-host-readiness"
      ],
      event_types: [
        "outdoor-market",
        "music-art-event",
        "community-gathering",
        "venue-hosted-event"
      ]
    },
    adminNote:
      "Verified from Glendale Special Event Permit page. Lead time uses the source's 60-days-before-event application package milestone."
  },
  {
    slug: "glendale-traffic-impact-review-check",
    title: "Glendale traffic or barricade review check",
    plainEnglishSummary:
      "Official source says Glendale special event materials include barricade permit procedures and may require traffic operation plans or parade/race routes as part of the complete application package. If the event may affect streets, sidewalks, parking, or traffic, confirm traffic and barricade review with Glendale Special Events.",
    requirementLevel: "confirm with the agency",
    confidence: "medium",
    leadTimeDays: 30,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "City of Glendale - Special Event Permit",
      url:
        "https://www.glendaleaz.gov/Community/ApplyRegister-For/Special-event-application-process"
    },
    jurisdiction: {
      code: "az-glendale",
      name: "Glendale",
      type: "city",
      city: "Glendale",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "city-of-glendale-special-events",
      name: "City of Glendale Special Events",
      phone: "623-930-4420",
      email: "Events@glendaleaz.com",
      url:
        "https://www.glendaleaz.gov/Community/ApplyRegister-For/Special-event-application-process"
    },
    useCase: "multi-vendor-market",
    triggers: {
      jurisdiction_code: "az-glendale",
      city: "Glendale",
      traffic_control_needed: true
    },
    adminNote:
      "Verified from Glendale Special Event Permit page. Trigger now uses refined traffic_control_needed because the source references traffic operation plans and related materials; legacy broad street/sidewalk/parking impact intake remains compatible through rule-engine mapping."
  },
  {
    slug: "glendale-temporary-structure-site-plan-check",
    title: "Glendale temporary structure site plan check",
    plainEnglishSummary:
      "Official source says Glendale special event site plans should show infrastructure such as stages, platforms, generators, tents, canopies, mobile food units, fire access, exits, and structure dimensions. If the event includes temporary structures, confirm site plan and supplemental document needs with Glendale Special Events.",
    requirementLevel: "confirm with the agency",
    confidence: "medium",
    leadTimeDays: 30,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "City of Glendale - Special Event Permit",
      url:
        "https://www.glendaleaz.gov/Community/ApplyRegister-For/Special-event-application-process"
    },
    jurisdiction: {
      code: "az-glendale",
      name: "Glendale",
      type: "city",
      city: "Glendale",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "city-of-glendale-special-events",
      name: "City of Glendale Special Events",
      phone: "623-930-4420",
      email: "Events@glendaleaz.com",
      url:
        "https://www.glendaleaz.gov/Community/ApplyRegister-For/Special-event-application-process"
    },
    useCase: "small-outdoor-music-art-event",
    triggers: {
      jurisdiction_code: "az-glendale",
      city: "Glendale",
      temporary_stage_or_platform: true
    },
    adminNote:
      "Verified from Glendale Special Event Permit page. Trigger now uses the refined temporary_stage_or_platform fact because the source explicitly calls out stages and platforms in site plans; legacy temporary-structure intake remains compatible through rule-engine mapping. Generator-specific and fire-specific rules should be split out only after more granular source review."
  },
  {
    slug: "peoria-special-event-review-check",
    title: "Peoria special event review check",
    plainEnglishSummary:
      "Official source says Peoria provides a host-a-special-event process for people planning special events in the city. Peoria events, markets, or outdoor gatherings may need city event review before setup. Confirm the correct event path with Peoria Arts, Culture and Special Events.",
    requirementLevel: "may be required",
    confidence: "medium",
    leadTimeDays: 60,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "City of Peoria - Host a Special Event",
      url:
        "https://www.peoriaaz.gov/government/departments/arts-culture/special-events/host-a-special-event"
    },
    jurisdiction: {
      code: "az-peoria",
      name: "Peoria",
      type: "city",
      city: "Peoria",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "city-of-peoria-arts-culture-special-events",
      name: "City of Peoria Arts, Culture and Special Events",
      url:
        "https://www.peoriaaz.gov/government/departments/arts-culture/special-events/host-a-special-event"
    },
    useCase: "multi-vendor-market",
    triggers: {
      jurisdiction_code: "az-peoria",
      city: "Peoria",
      use_cases: [
        "multi-vendor-market",
        "small-outdoor-music-art-event",
        "venue-host-readiness"
      ],
      event_types: [
        "outdoor-market",
        "music-art-event",
        "community-gathering",
        "venue-hosted-event"
      ]
    },
    adminNote:
      "Verified from the reviewed official Peoria Host a Special Event source. Lead time uses the official page's indexed 60-day planning recommendation; re-check the page directly during future source verification because the site may challenge automated fetches."
  },
  {
    slug: "peoria-business-license-check",
    title: "Peoria business license check",
    plainEnglishSummary:
      "Official source says people engaging in business within Peoria city limits, or soliciting, canvassing, advertising, delivering products, or performing services in the city, should procure a Peoria business license when the city license requirement applies. Vendors and sellers should confirm before operating.",
    requirementLevel: "may be required",
    confidence: "high",
    leadTimeDays: 30,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "City of Peoria - Business Licenses",
      url: "https://www.peoriaaz.gov/i-want-to/pay/business-license"
    },
    jurisdiction: {
      code: "az-peoria",
      name: "Peoria",
      type: "city",
      city: "Peoria",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "city-of-peoria-sales-tax-and-license",
      name: "City of Peoria Sales Tax and License",
      phone: "623-773-7160",
      email: "businesslicense@peoriaaz.gov",
      url: "https://www.peoriaaz.gov/i-want-to/pay/business-license"
    },
    useCase: "retail-vendor-booth",
    triggers: {
      jurisdiction_code: "az-peoria",
      city: "Peoria",
      retail_sales: true
    },
    adminNote:
      "Verified from Peoria Business Licenses page. Lead time uses the source's application timeframe of not to exceed 30 days from application acceptance."
  },
  {
    slug: "peoria-tpt-license-check",
    title: "Peoria TPT license check",
    plainEnglishSummary:
      "Official source says businesses subject to transaction privilege tax will need an additional license from the Arizona Department of Revenue. Retail vendors selling in Peoria should confirm whether Peoria business licensing and Arizona TPT steps apply before selling.",
    requirementLevel: "may be required",
    confidence: "high",
    leadTimeDays: 14,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "City of Peoria - Business Licenses",
      url: "https://www.peoriaaz.gov/i-want-to/pay/business-license"
    },
    jurisdiction: {
      code: "az-peoria",
      name: "Peoria",
      type: "city",
      city: "Peoria",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "city-of-peoria-sales-tax-and-license",
      name: "City of Peoria Sales Tax and License",
      phone: "623-773-7160",
      email: "businesslicense@peoriaaz.gov",
      url: "https://www.peoriaaz.gov/i-want-to/pay/business-license"
    },
    useCase: "retail-vendor-booth",
    triggers: {
      jurisdiction_code: "az-peoria",
      city: "Peoria",
      retail_sales: true
    },
    adminNote:
      "Verified from Peoria Business Licenses page. Lead time is a cautious planning placeholder because the page points TPT licensing to ADOR but does not publish a fixed TPT processing timeframe."
  },
  {
    slug: "peoria-special-event-vendor-information-check",
    title: "Peoria special event vendor information check",
    plainEnglishSummary:
      "Official source provides Peoria vendor information for city special events. Retail vendors interested in participating in Peoria special events should confirm the vendor participation process and event-specific next steps before setting up.",
    requirementLevel: "confirm with the agency",
    confidence: "medium",
    leadTimeDays: 30,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "City of Peoria - Vendor Information",
      url:
        "https://www.peoriaaz.gov/government/departments/arts-culture/special-events/vendor-information"
    },
    jurisdiction: {
      code: "az-peoria",
      name: "Peoria",
      type: "city",
      city: "Peoria",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "city-of-peoria-arts-culture-special-events",
      name: "City of Peoria Arts, Culture and Special Events",
      url:
        "https://www.peoriaaz.gov/government/departments/arts-culture/special-events/vendor-information"
    },
    useCase: "retail-vendor-booth",
    triggers: {
      jurisdiction_code: "az-peoria",
      city: "Peoria",
      use_cases: ["retail-vendor-booth", "multi-vendor-market"],
      retail_sales: true
    },
    adminNote:
      "Verified from the reviewed official Peoria Vendor Information source. Lead time is a cautious planning placeholder because no fixed vendor review timeframe is recorded in the current inventory."
  },
  {
    slug: "maricopa-special-event-food-registration-check",
    title: "Maricopa County special event food registration check",
    plainEnglishSummary:
      "Official source says special events in Maricopa County where food will be sold or given away are required to be registered with Maricopa County Environmental Services. Event organizers or food vendors should confirm the event registration path and food vendor list requirements before setup.",
    requirementLevel: "likely required",
    confidence: "high",
    leadTimeDays: 30,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "Maricopa County - Special Event Requirements",
      url: "https://www.maricopa.gov/6566/102769/Special-Event-Requirements"
    },
    jurisdiction: {
      code: "az-maricopa",
      name: "Maricopa County",
      type: "county",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "maricopa-county-environmental-services",
      name: "Maricopa County Environmental Services",
      phone: "602-506-6824",
      email: "ENVPlanReview@maricopa.gov",
      url: "https://www.maricopa.gov/3976/Special-EventsFarmers-Markets"
    },
    useCase: "multi-vendor-market",
    triggers: {
      county: "Maricopa County",
      food_service: true,
      event_types: ["outdoor-market", "food-service", "community-gathering"]
    },
    adminNote:
      "Verified from Maricopa County Special Event Requirements page. Lead time uses the source's instruction to submit the special event coordinator registration application online 30 days before the event."
  },
  {
    slug: "maricopa-open-or-prepared-food-temporary-permit-check",
    title: "Maricopa County open or prepared food review",
    plainEnglishSummary:
      "Official source says food vendors that do not already have a Mobile Food Establishment or Catering permit from the Department may need a Temporary Food Establishment permit when they plan to sell, sample, or give away certain foods or drinks at a special event. If food will be open, handled, or prepared on site, confirm the correct county food permit path with Maricopa County Environmental Services.",
    requirementLevel: "may be required",
    confidence: "high",
    leadTimeDays: 30,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "Maricopa County - Special Event Requirements",
      url: "https://www.maricopa.gov/6566/102769/Special-Event-Requirements"
    },
    jurisdiction: {
      code: "az-maricopa",
      name: "Maricopa County",
      type: "county",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "maricopa-county-environmental-services",
      name: "Maricopa County Environmental Services",
      phone: "602-506-6824",
      email: "ENVPlanReview@maricopa.gov",
      url: "https://www.maricopa.gov/3976/Special-EventsFarmers-Markets"
    },
    useCase: "food-truck-temporary-food-vendor",
    triggers: {
      county: "Maricopa County",
      food_is_open_or_prepared_on_site: true,
      use_cases: ["food-truck-temporary-food-vendor", "multi-vendor-market"]
    },
    adminNote:
      "Verified from Maricopa County Special Event Requirements page. This replaces the older broad temporary-food trigger with a refined open/prepared-on-site food trigger. Lead time uses the 30-day special event registration timing as a cautious planning milestone."
  },
  {
    slug: "maricopa-temperature-controlled-food-review-check",
    title: "Maricopa County temperature-controlled food review",
    plainEnglishSummary:
      "Official source says special event food vendors may need county permit review when they sell, sample, or give away certain foods or drinks. If the food needs hot or cold temperature control, confirm whether a Temporary Food Establishment, Mobile Food Establishment, or other county food permit path applies.",
    requirementLevel: "may be required",
    confidence: "medium",
    leadTimeDays: 30,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "Maricopa County - Special Event Requirements",
      url: "https://www.maricopa.gov/6566/102769/Special-Event-Requirements"
    },
    jurisdiction: {
      code: "az-maricopa",
      name: "Maricopa County",
      type: "county",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "maricopa-county-environmental-services",
      name: "Maricopa County Environmental Services",
      phone: "602-506-6824",
      email: "ENVPlanReview@maricopa.gov",
      url: "https://www.maricopa.gov/3976/Special-EventsFarmers-Markets"
    },
    useCase: "food-truck-temporary-food-vendor",
    triggers: {
      county: "Maricopa County",
      food_requires_temperature_control: true,
      use_cases: ["food-truck-temporary-food-vendor", "multi-vendor-market"]
    },
    adminNote:
      "Verified from Maricopa County Special Event Requirements page. Temperature-control handling is captured as a refined intake fact and should remain may-required/confirm language until a more granular county source is converted."
  },
  {
    slug: "maricopa-food-sampling-temporary-permit-check",
    title: "Maricopa County food sampling review",
    plainEnglishSummary:
      "Official source says food vendors may need a Temporary Food Establishment permit when they plan to sell, sample, or give away certain foods or drinks at a special event. If food or drink samples will be offered, confirm the correct food permit or event food vendor path with Maricopa County Environmental Services.",
    requirementLevel: "may be required",
    confidence: "high",
    leadTimeDays: 30,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "Maricopa County - Special Event Requirements",
      url: "https://www.maricopa.gov/6566/102769/Special-Event-Requirements"
    },
    jurisdiction: {
      code: "az-maricopa",
      name: "Maricopa County",
      type: "county",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "maricopa-county-environmental-services",
      name: "Maricopa County Environmental Services",
      phone: "602-506-6824",
      email: "ENVPlanReview@maricopa.gov",
      url: "https://www.maricopa.gov/3976/Special-EventsFarmers-Markets"
    },
    useCase: "food-truck-temporary-food-vendor",
    triggers: {
      county: "Maricopa County",
      food_sampling: true,
      use_cases: ["food-truck-temporary-food-vendor", "multi-vendor-market"]
    },
    adminNote:
      "Verified from Maricopa County Special Event Requirements page. The source explicitly includes sampling in the temporary food permit context."
  },
  {
    slug: "maricopa-food-exemption-confirmation-check",
    title: "Maricopa County food exemption confirmation",
    plainEnglishSummary:
      "If a vendor believes a food exemption may apply, treat that as a question to confirm with Maricopa County Environmental Services rather than assuming the event is exempt. Event food facts can be situation-specific, so confirm the exemption or permit path with the county before relying on it.",
    requirementLevel: "confirm with the agency",
    confidence: "medium",
    leadTimeDays: 14,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "Maricopa County - Special Event Requirements",
      url: "https://www.maricopa.gov/6566/102769/Special-Event-Requirements"
    },
    jurisdiction: {
      code: "az-maricopa",
      name: "Maricopa County",
      type: "county",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "maricopa-county-environmental-services",
      name: "Maricopa County Environmental Services",
      phone: "602-506-6824",
      email: "ENVPlanReview@maricopa.gov",
      url: "https://www.maricopa.gov/3976/Special-EventsFarmers-Markets"
    },
    useCase: "food-truck-temporary-food-vendor",
    triggers: {
      county: "Maricopa County",
      believes_food_exemption_may_apply: true
    },
    adminNote:
      "Verified from Maricopa County Special Event Requirements page as a conservative confirm-with-agency item. This rule intentionally does not say an exemption exists or applies."
  },
  {
    slug: "maricopa-mobile-food-establishment-permit-check",
    title: "Maricopa County mobile food establishment permit check",
    plainEnglishSummary:
      "Official source says Mobile Food Establishment Types I, II, and III are approved to operate at farmers markets, special events, business locations, private functions, and similar locations in Maricopa County when operating within the allowances of the permit issued to them. Food trucks and mobile food vendors should confirm county permit status and operating allowances before serving.",
    requirementLevel: "may be required",
    confidence: "high",
    leadTimeDays: 14,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "Maricopa County - Mobile Food Establishments",
      url: "https://www.maricopa.gov/3977/Mobile-Food-Establishments"
    },
    jurisdiction: {
      code: "az-maricopa",
      name: "Maricopa County",
      type: "county",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "maricopa-county-environmental-services",
      name: "Maricopa County Environmental Services",
      phone: "602-506-6824",
      email: "ENVPlanreview@maricopa.gov",
      url: "https://www.maricopa.gov/3977/Mobile-Food-Establishments"
    },
    useCase: "food-truck-temporary-food-vendor",
    triggers: {
      county: "Maricopa County",
      food_service: true,
      food_truck: true
    },
    adminNote:
      "Verified from Maricopa County Mobile Food Establishments page. Lead time is a cautious planning placeholder because the source explains permit application paths and operating allowances but does not publish one fixed processing window."
  },
  {
    slug: "maricopa-special-event-market-food-vendor-check",
    title: "Maricopa County special event or farmers market food vendor check",
    plainEnglishSummary:
      "Official source says permitted Mobile Food Establishments and Food Caterers are approved to operate at Maricopa County special events and farmers markets, and businesses operating beyond what their annual permit allows may need a Temporary or Seasonal permit. Food vendors at markets or multi-vendor events should confirm permit type and event eligibility with the county.",
    requirementLevel: "confirm with the agency",
    confidence: "medium",
    leadTimeDays: 30,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "Maricopa County - Special Events/Farmers' Markets",
      url: "https://www.maricopa.gov/3976/Special-EventsFarmers-Markets"
    },
    jurisdiction: {
      code: "az-maricopa",
      name: "Maricopa County",
      type: "county",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "maricopa-county-environmental-services",
      name: "Maricopa County Environmental Services",
      phone: "602-506-6824",
      email: "ENVPlanreview@maricopa.gov",
      url: "https://www.maricopa.gov/3976/Special-EventsFarmers-Markets"
    },
    useCase: "multi-vendor-market",
    triggers: {
      county: "Maricopa County",
      food_service: true,
      multi_vendor_event: true
    },
    adminNote:
      "Verified from Maricopa County Special Events/Farmers' Markets page. Lead time is a cautious planning placeholder aligned to the county special event registration timing; the source notes temporary or seasonal permits are not issued for farmers markets, so this rule remains confirm-with-agency."
  },
  {
    slug: "phoenix-temporary-assembly-event-review-check",
    title: "Phoenix temporary assembly event review check",
    plainEnglishSummary:
      "Official source says Phoenix provides a temporary assembly permit roadmap for special events and links to city processes for outdoor private-property events, public park or street events, alcohol service, assembly occupancy, and temporary stages or platforms. Phoenix event hosts should confirm the correct city review path before setup.",
    requirementLevel: "may be required",
    confidence: "medium",
    leadTimeDays: 30,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "City of Phoenix - Temporary Assembly Permits",
      url:
        "https://www.phoenix.gov/administration/departments/pdd/tools-resources/temporary-assembly-permits.html"
    },
    jurisdiction: {
      code: "az-phoenix",
      name: "Phoenix",
      type: "city",
      city: "Phoenix",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "city-of-phoenix-planning-and-development",
      name: "City of Phoenix Planning and Development",
      phone: "602-262-3111",
      url:
        "https://www.phoenix.gov/administration/departments/pdd/tools-resources/temporary-assembly-permits.html"
    },
    useCase: "small-outdoor-music-art-event",
    triggers: {
      jurisdiction_code: "az-phoenix",
      city: "Phoenix",
      use_cases: [
        "multi-vendor-market",
        "small-outdoor-music-art-event",
        "private-property-parking-lot-event",
        "venue-host-readiness"
      ],
      event_types: [
        "outdoor-market",
        "music-art-event",
        "community-gathering",
        "venue-hosted-event"
      ]
    },
    adminNote:
      "Verified from Phoenix Temporary Assembly Permits page. Lead time is a cautious planning placeholder because the landing page provides process routing but no single fixed processing timeframe."
  },
  {
    slug: "phoenix-private-property-outdoor-event-atup-check",
    title: "Phoenix private-property outdoor event review check",
    plainEnglishSummary:
      "Official source says outdoor events held in parking lots or other privately owned open spaces in Phoenix require a number of permits or licenses depending on event features, and zoning approval through an Administrative Temporary Use Permit is always required for those outdoor private-property events. Confirm the correct review path with Phoenix Planning and Development.",
    requirementLevel: "may be required",
    confidence: "high",
    leadTimeDays: 30,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "City of Phoenix - Outdoor Events",
      url:
        "https://www.phoenix.gov/administration/departments/pdd/tools-resources/temporary-assembly-permits/outdoor-events.html"
    },
    jurisdiction: {
      code: "az-phoenix",
      name: "Phoenix",
      type: "city",
      city: "Phoenix",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "city-of-phoenix-planning-and-development",
      name: "City of Phoenix Planning and Development",
      phone: "602-262-3111",
      url:
        "https://www.phoenix.gov/administration/departments/pdd/tools-resources/temporary-assembly-permits/outdoor-events.html"
    },
    useCase: "private-property-parking-lot-event",
    triggers: {
      jurisdiction_code: "az-phoenix",
      city: "Phoenix",
      private_property: true,
      use_cases: ["private-property-parking-lot-event", "venue-host-readiness"]
    },
    adminNote:
      "Verified from Phoenix Outdoor Events page. Lead time is a cautious planning placeholder because the source says permits/licenses depend on event features but does not publish one fixed processing timeframe."
  },
  {
    slug: "phoenix-right-of-way-or-public-event-review-check",
    title: "Phoenix public park, street, or right-of-way event review check",
    plainEnglishSummary:
      "Official source says Phoenix outdoor events that require closure of the right-of-way, typically including public alleys, sidewalks, and streets, or events held in public parks require a number of permits or licenses depending on event features. Confirm the Parks Department Street Special Event Application or park event path before hosting.",
    requirementLevel: "may be required",
    confidence: "high",
    leadTimeDays: 30,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "City of Phoenix - Outdoor Events",
      url:
        "https://www.phoenix.gov/administration/departments/pdd/tools-resources/temporary-assembly-permits/outdoor-events.html"
    },
    jurisdiction: {
      code: "az-phoenix",
      name: "Phoenix",
      type: "city",
      city: "Phoenix",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "city-of-phoenix-planning-and-development",
      name: "City of Phoenix Planning and Development",
      phone: "602-262-3111",
      url:
        "https://www.phoenix.gov/administration/departments/pdd/tools-resources/temporary-assembly-permits/outdoor-events.html"
    },
    useCase: "multi-vendor-market",
    triggers: {
      jurisdiction_code: "az-phoenix",
      city: "Phoenix",
      right_of_way_use: true
    },
    adminNote:
      "Verified from Phoenix Outdoor Events page. Trigger now uses refined right_of_way_use because the source specifically references right-of-way closures; legacy broad street/sidewalk/parking impact intake remains compatible through rule-engine mapping. Lead time is a cautious planning placeholder because no fixed processing timeframe is published."
  },
  {
    slug: "phoenix-vending-and-temporary-tax-license-check",
    title: "Phoenix vending and temporary privilege tax check",
    plainEnglishSummary:
      "Official source says if sales or vending is planned at a Phoenix outdoor event, a vending license may be required depending on vending location and activity, and a temporary privilege tax license is required when conducting taxable business activity within Phoenix. Vendors should confirm licensing and tax steps with Phoenix before selling.",
    requirementLevel: "may be required",
    confidence: "medium",
    leadTimeDays: 14,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "City of Phoenix - Outdoor Events",
      url:
        "https://www.phoenix.gov/administration/departments/pdd/tools-resources/temporary-assembly-permits/outdoor-events.html"
    },
    jurisdiction: {
      code: "az-phoenix",
      name: "Phoenix",
      type: "city",
      city: "Phoenix",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "city-of-phoenix-license-services",
      name: "City of Phoenix License Services",
      phone: "602-262-3111",
      url:
        "https://www.phoenix.gov/administration/departments/pdd/tools-resources/temporary-assembly-permits/outdoor-events.html"
    },
    useCase: "retail-vendor-booth",
    triggers: {
      jurisdiction_code: "az-phoenix",
      city: "Phoenix",
      retail_sales: true
    },
    adminNote:
      "Verified from Phoenix Outdoor Events page. Lead time is a cautious planning placeholder because the source links to vending and temporary privilege tax license paths but does not publish one fixed timeframe."
  },
  {
    slug: "phoenix-special-event-liquor-license-check",
    title: "Phoenix special event liquor license check",
    plainEnglishSummary:
      "Official source says if an organization will purchase, store, serve, or provide liquor, it will be dealing in liquor and will need to be licensed. Phoenix special events involving alcohol should confirm whether a Series 15 special event liquor license or related city and state approval path applies.",
    requirementLevel: "may be required",
    confidence: "high",
    leadTimeDays: 30,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "City of Phoenix - Special Event Liquor Licenses (Series 15)",
      url:
        "https://www.phoenix.gov/administration/departments/cityclerk/programs-services/license-services/special-event-liquor-licenses-series-15.html"
    },
    jurisdiction: {
      code: "az-phoenix",
      name: "Phoenix",
      type: "city",
      city: "Phoenix",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "city-of-phoenix-license-services",
      name: "City of Phoenix License Services",
      phone: "602-262-4638",
      url:
        "https://www.phoenix.gov/administration/departments/cityclerk/programs-services/license-services/special-event-liquor-licenses-series-15.html"
    },
    useCase: "small-outdoor-music-art-event",
    triggers: {
      jurisdiction_code: "az-phoenix",
      city: "Phoenix",
      alcohol_present: true
    },
    adminNote:
      "Verified from Phoenix Special Event Liquor Licenses page. Trigger now uses the refined alcohol_present fact; legacy broad alcohol intake remains compatible through rule-engine mapping. Lead time is a cautious planning placeholder because the source describes the city/DLLC application path but does not publish one fixed processing window. This rule does not make separate BYOB, alcohol-sale, free-service, or public-property alcohol conclusions."
  },
  {
    slug: "tempe-special-events-code-review-check",
    title: "Tempe special events code review check",
    plainEnglishSummary:
      "Official source says Tempe is updating and modernizing its special events and parks and recreation codes because of growth, event variety, and increased demand for public spaces. A Tempe event, market, or gathering may need city special event review. Confirm the current process with City of Tempe Community Services before relying on this item.",
    requirementLevel: "confirm with the agency",
    confidence: "medium",
    leadTimeDays: 30,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "City of Tempe - Special Events and Parks Ordinances",
      url:
        "https://www.tempe.gov/government/community-services/parks/special-events-and-parks-ordinances"
    },
    jurisdiction: {
      code: "az-tempe",
      name: "Tempe",
      type: "city",
      city: "Tempe",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "city-of-tempe-community-services",
      name: "City of Tempe Community Services",
      phone: "480-350-5234",
      email: "craig_hayton@tempe.gov",
      url:
        "https://www.tempe.gov/government/community-services/parks/special-events-and-parks-ordinances"
    },
    useCase: "multi-vendor-market",
    triggers: {
      jurisdiction_code: "az-tempe",
      city: "Tempe",
      use_cases: [
        "multi-vendor-market",
        "small-outdoor-music-art-event",
        "private-property-parking-lot-event",
        "venue-host-readiness"
      ],
      event_types: [
        "outdoor-market",
        "music-art-event",
        "community-gathering",
        "venue-hosted-event"
      ]
    },
    adminNote:
      "Verified from the official Tempe Special Events and Parks Ordinances page. This page is ordinance/process context rather than a final permit checklist, so the rule intentionally uses confirm-with-agency language and a cautious planning placeholder lead time."
  },
  {
    slug: "tempe-park-event-ordinance-review-check",
    title: "Tempe park event ordinance review check",
    plainEnglishSummary:
      "Official source says Tempe's parks and recreation codes are part of the current special events and parks ordinance update, and the page links to park reservations and permit draft materials. If the event uses a Tempe park, plaza, or other public recreation space, confirm park event rules and reservation or permit steps with City of Tempe Community Services.",
    requirementLevel: "confirm with the agency",
    confidence: "medium",
    leadTimeDays: 30,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "City of Tempe - Special Events and Parks Ordinances",
      url:
        "https://www.tempe.gov/government/community-services/parks/special-events-and-parks-ordinances"
    },
    jurisdiction: {
      code: "az-tempe",
      name: "Tempe",
      type: "city",
      city: "Tempe",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "city-of-tempe-community-services",
      name: "City of Tempe Community Services",
      phone: "480-350-5234",
      email: "craig_hayton@tempe.gov",
      url:
        "https://www.tempe.gov/government/community-services/parks/special-events-and-parks-ordinances"
    },
    useCase: "small-outdoor-music-art-event",
    triggers: {
      jurisdiction_code: "az-tempe",
      city: "Tempe",
      public_property: true,
      use_cases: [
        "multi-vendor-market",
        "small-outdoor-music-art-event",
        "venue-host-readiness"
      ]
    },
    adminNote:
      "Verified from the official Tempe Special Events and Parks Ordinances page and its listed park reservations and permits draft ordinance context. Trigger is limited to public property/park-style intake because the source is parks-focused."
  },
  {
    slug: "tempe-amplified-sound-park-review-check",
    title: "Tempe amplified sound park review check",
    plainEnglishSummary:
      "Official source links to Tempe parks ordinance materials that include amplified sound. If amplified sound is part of an event in a Tempe park or public recreation space, confirm current sound, reservation, and permit expectations with City of Tempe Community Services.",
    requirementLevel: "confirm with the agency",
    confidence: "medium",
    leadTimeDays: 14,
    isSample: false,
    verificationStatus: "verified",
    lastVerified: "2026-06-23",
    source: {
      name: "City of Tempe - Special Events and Parks Ordinances",
      url:
        "https://www.tempe.gov/government/community-services/parks/special-events-and-parks-ordinances"
    },
    jurisdiction: {
      code: "az-tempe",
      name: "Tempe",
      type: "city",
      city: "Tempe",
      county: "Maricopa County",
      state: "AZ"
    },
    agency: {
      slug: "city-of-tempe-community-services",
      name: "City of Tempe Community Services",
      phone: "480-350-5234",
      email: "craig_hayton@tempe.gov",
      url:
        "https://www.tempe.gov/government/community-services/parks/special-events-and-parks-ordinances"
    },
    useCase: "small-outdoor-music-art-event",
    triggers: {
      jurisdiction_code: "az-tempe",
      city: "Tempe",
      public_property: true,
      amplified_sound: true
    },
    adminNote:
      "Verified from the official Tempe Special Events and Parks Ordinances page, which lists parks ordinance materials for beer and wine and amplified sound. This is the only current signage/promotion refinement because no reviewed source supports standalone signage, ticketing, admission, or public-advertising rules yet. Alcohol was not converted because the source needs a more specific current process before rule creation."
  }
];
