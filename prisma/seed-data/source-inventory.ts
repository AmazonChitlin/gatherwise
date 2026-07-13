export const sourceCategories = [
  "TPT / sales tax",
  "business license",
  "temporary food",
  "mobile food / food truck",
  "special event",
  "park event",
  "street or sidewalk closure",
  "amplified sound",
  "fire / tent / generator / open flame",
  "alcohol",
  "signage",
  "vendor market / multi-vendor event",
  "venue / private property event"
] as const;

export type SourceCategory = (typeof sourceCategories)[number];

export type SourceVerificationStatus =
  | "official_reviewed"
  | "needs_review"
  | "needs_research";

export type OfficialSourceInventoryItem = {
  id: string;
  jurisdictionCode: string;
  jurisdictionName: string;
  jurisdictionType: "state" | "county" | "city";
  agencyName: string;
  sourceName: string;
  sourceUrl: string | null;
  sourceCategory: SourceCategory;
  useCaseRelevance: string[];
  notes: string;
  verificationStatus: SourceVerificationStatus;
  lastChecked: string | null;
  isOfficial: boolean;
  rulesCreated: boolean;
};

export const officialSourceInventory: OfficialSourceInventoryItem[] = [
  {
    id: "az-ador-tpt-license",
    jurisdictionCode: "az",
    jurisdictionName: "Arizona",
    jurisdictionType: "state",
    agencyName: "Arizona Department of Revenue",
    sourceName: "TPT License",
    sourceUrl: "https://azdor.gov/business/transaction-privilege-tax/tpt-license",
    sourceCategory: "TPT / sales tax",
    useCaseRelevance: ["retail-vendor-booth", "multi-vendor-market"],
    notes:
      "Official ADOR page for transaction privilege tax license guidance. Use careful language and confirm details with ADOR.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: false
  },
  {
    id: "az-ador-transaction-privilege-tax",
    jurisdictionCode: "az",
    jurisdictionName: "Arizona",
    jurisdictionType: "state",
    agencyName: "Arizona Department of Revenue",
    sourceName: "Transaction Privilege Tax",
    sourceUrl: "https://azdor.gov/business/transaction-privilege-tax",
    sourceCategory: "TPT / sales tax",
    useCaseRelevance: ["retail-vendor-booth", "multi-vendor-market"],
    notes:
      "Official ADOR overview page currently used by the verified TPT proof-of-concept rule.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: true
  },
  {
    id: "maricopa-special-events-farmers-markets",
    jurisdictionCode: "az-maricopa",
    jurisdictionName: "Maricopa County",
    jurisdictionType: "county",
    agencyName: "Maricopa County Environmental Services",
    sourceName: "Special Events/Farmers' Markets",
    sourceUrl: "https://www.maricopa.gov/3976/Special-EventsFarmers-Markets",
    sourceCategory: "vendor market / multi-vendor event",
    useCaseRelevance: [
      "food-truck-temporary-food-vendor",
      "multi-vendor-market"
    ],
    notes:
      "Official county page for food/event market permitting context. Review before creating county food rules.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: true
  },
  {
    id: "maricopa-mobile-food-establishments",
    jurisdictionCode: "az-maricopa",
    jurisdictionName: "Maricopa County",
    jurisdictionType: "county",
    agencyName: "Maricopa County Environmental Services",
    sourceName: "Mobile Food Establishments",
    sourceUrl: "https://www.maricopa.gov/3977/Mobile-Food-Establishments",
    sourceCategory: "mobile food / food truck",
    useCaseRelevance: ["food-truck-temporary-food-vendor"],
    notes:
      "Official county page for mobile food permits. Convert only after reviewing exact permit categories and deadlines.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: true
  },
  {
    id: "maricopa-special-event-requirements",
    jurisdictionCode: "az-maricopa",
    jurisdictionName: "Maricopa County",
    jurisdictionType: "county",
    agencyName: "Maricopa County Environmental Services",
    sourceName: "Special Event Requirements",
    sourceUrl: "https://www.maricopa.gov/6566/102769/Special-Event-Requirements",
    sourceCategory: "temporary food",
    useCaseRelevance: [
      "food-truck-temporary-food-vendor",
      "multi-vendor-market"
    ],
    notes:
      "Official county page listing food permit types allowed at special events.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: true
  },
  {
    id: "maricopa-transportation-special-events",
    jurisdictionCode: "az-maricopa",
    jurisdictionName: "Maricopa County",
    jurisdictionType: "county",
    agencyName: "Maricopa County Department of Transportation",
    sourceName: "Special Events Permits",
    sourceUrl: "https://www.maricopa.gov/6217/Special-Events-Permits",
    sourceCategory: "street or sidewalk closure",
    useCaseRelevance: ["small-outdoor-music-art-event", "multi-vendor-market"],
    notes:
      "Official county transportation page for events on or adjacent to MCDOT right-of-way.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: false
  },
  {
    id: "phoenix-temporary-assembly-permits",
    jurisdictionCode: "az-phoenix",
    jurisdictionName: "Phoenix",
    jurisdictionType: "city",
    agencyName: "City of Phoenix Planning and Development",
    sourceName: "Temporary Assembly Permits",
    sourceUrl:
      "https://www.phoenix.gov/administration/departments/pdd/tools-resources/temporary-assembly-permits.html",
    sourceCategory: "special event",
    useCaseRelevance: [
      "small-outdoor-music-art-event",
      "private-property-parking-lot-event",
      "venue-host-readiness"
    ],
    notes:
      "Official city landing page for temporary assembly permits. Review child pages before writing detailed rules.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: true
  },
  {
    id: "phoenix-outdoor-events-private-property",
    jurisdictionCode: "az-phoenix",
    jurisdictionName: "Phoenix",
    jurisdictionType: "city",
    agencyName: "City of Phoenix Planning and Development",
    sourceName: "Outdoor Events on Private Property",
    sourceUrl:
      "https://www.phoenix.gov/administration/departments/pdd/tools-resources/temporary-assembly-permits/outdoor-events.html",
    sourceCategory: "venue / private property event",
    useCaseRelevance: [
      "private-property-parking-lot-event",
      "venue-host-readiness"
    ],
    notes:
      "Official Phoenix page for outdoor events in parking lots or other privately owned open spaces.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: true
  },
  {
    id: "phoenix-park-rentals-permits",
    jurisdictionCode: "az-phoenix",
    jurisdictionName: "Phoenix",
    jurisdictionType: "city",
    agencyName: "City of Phoenix Parks and Recreation",
    sourceName: "Rentals and Permits",
    sourceUrl:
      "https://www.phoenix.gov/administration/departments/parks/rentals-permits.html",
    sourceCategory: "park event",
    useCaseRelevance: ["small-outdoor-music-art-event"],
    notes:
      "Official Phoenix parks page for special activity requests, field allocations, and permits.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: false
  },
  {
    id: "phoenix-special-event-liquor",
    jurisdictionCode: "az-phoenix",
    jurisdictionName: "Phoenix",
    jurisdictionType: "city",
    agencyName: "City of Phoenix License Services",
    sourceName: "Special Event Liquor Licenses (Series 15)",
    sourceUrl:
      "https://www.phoenix.gov/administration/departments/cityclerk/programs-services/license-services/special-event-liquor-licenses-series-15.html",
    sourceCategory: "alcohol",
    useCaseRelevance: ["small-outdoor-music-art-event", "multi-vendor-market"],
    notes:
      "Official Phoenix page for special event liquor license city approval process.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: true
  },
  {
    id: "tempe-special-events-application",
    jurisdictionCode: "az-tempe",
    jurisdictionName: "Tempe",
    jurisdictionType: "city",
    agencyName: "City of Tempe",
    sourceName: "City of Tempe Special Events Application",
    sourceUrl: "https://app.apply4.com/eventapp/usa/tempe",
    sourceCategory: "special event",
    useCaseRelevance: [
      "small-outdoor-music-art-event",
      "multi-vendor-market",
      "venue-host-readiness"
    ],
    notes:
      "Application portal used for City of Tempe special events. Treat as needs review because it is not hosted on tempe.gov.",
    verificationStatus: "needs_review",
    lastChecked: "2026-06-23",
    isOfficial: false,
    rulesCreated: false
  },
  {
    id: "tempe-parks-special-events-ordinances",
    jurisdictionCode: "az-tempe",
    jurisdictionName: "Tempe",
    jurisdictionType: "city",
    agencyName: "City of Tempe Parks and Recreation",
    sourceName: "Special Events and Parks Ordinances",
    sourceUrl:
      "https://www.tempe.gov/government/community-services/parks/special-events-and-parks-ordinances",
    sourceCategory: "park event",
    useCaseRelevance: ["small-outdoor-music-art-event", "community-gathering"],
    notes:
      "Official Tempe page for special events and parks ordinance context. Review current ordinance details before rules.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: true
  },
  {
    id: "mesa-special-event-license",
    jurisdictionCode: "az-mesa",
    jurisdictionName: "Mesa",
    jurisdictionType: "city",
    agencyName: "City of Mesa",
    sourceName: "Special Event License",
    sourceUrl: "https://www.mesaaz.gov/Business-Development/Special-Event-License",
    sourceCategory: "special event",
    useCaseRelevance: [
      "small-outdoor-music-art-event",
      "multi-vendor-market",
      "private-property-parking-lot-event",
      "venue-host-readiness"
    ],
    notes:
      "Official Mesa page for special event license process. Review handbook and attachments before converting into rules.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: true
  },
  {
    id: "mesa-special-event-handbook",
    jurisdictionCode: "az-mesa",
    jurisdictionName: "Mesa",
    jurisdictionType: "city",
    agencyName: "City of Mesa",
    sourceName: "Special Events Handbook",
    sourceUrl:
      "https://www.mesaaz.gov/files/assets/public/v/1/business-development/specialevent/city-of-mesa-special-event-handbook.pdf",
    sourceCategory: "special event",
    useCaseRelevance: [
      "small-outdoor-music-art-event",
      "multi-vendor-market",
      "private-property-parking-lot-event",
      "venue-host-readiness"
    ],
    notes:
      "Official Mesa PDF handbook with planning timeline and references to additional licenses such as alcohol, tax, traffic, and park addenda.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: false
  },
  {
    id: "mesa-business-license",
    jurisdictionCode: "az-mesa",
    jurisdictionName: "Mesa",
    jurisdictionType: "city",
    agencyName: "City of Mesa Licensing",
    sourceName: "Mesa General Business License",
    sourceUrl:
      "https://www.mesaaz.gov/Business-Development/Licensing/Mesa-General-Business-License",
    sourceCategory: "business license",
    useCaseRelevance: ["retail-vendor-booth", "multi-vendor-market"],
    notes: "Official Mesa page for general business license information.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: true
  },
  {
    id: "mesa-mobile-food-vendor-license",
    jurisdictionCode: "az-mesa",
    jurisdictionName: "Mesa",
    jurisdictionType: "city",
    agencyName: "City of Mesa Licensing",
    sourceName: "Mobile Food Vendor License",
    sourceUrl:
      "https://www.mesaaz.gov/Business-Development/Licensing/Mobile-Food-Vendor-License",
    sourceCategory: "mobile food / food truck",
    useCaseRelevance: ["food-truck-temporary-food-vendor"],
    notes:
      "Official Mesa page for city mobile food vendor licensing. Review with county food requirements before rule creation.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: true
  },
  {
    id: "mesa-tpt-tax",
    jurisdictionCode: "az-mesa",
    jurisdictionName: "Mesa",
    jurisdictionType: "city",
    agencyName: "City of Mesa",
    sourceName: "Transaction Privilege (TPT) Tax",
    sourceUrl:
      "https://www.mesaaz.gov/Business-Development/Transaction-Privilege-TPT-Tax",
    sourceCategory: "TPT / sales tax",
    useCaseRelevance: ["retail-vendor-booth", "multi-vendor-market"],
    notes:
      "Official Mesa page for local TPT context. Coordinate with ADOR source before city-specific tax rules.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: true
  },
  {
    id: "mesa-liquor-license",
    jurisdictionCode: "az-mesa",
    jurisdictionName: "Mesa",
    jurisdictionType: "city",
    agencyName: "City of Mesa Licensing",
    sourceName: "Liquor License",
    sourceUrl: "https://www.mesaaz.gov/Business-Development/Licensing/Liquor-License",
    sourceCategory: "alcohol",
    useCaseRelevance: ["small-outdoor-music-art-event", "multi-vendor-market"],
    notes:
      "Official Mesa liquor license page references special event liquor license routing. Confirm with DLLC and Mesa before rules.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: false
  },
  {
    id: "scottsdale-special-events",
    jurisdictionCode: "az-scottsdale",
    jurisdictionName: "Scottsdale",
    jurisdictionType: "city",
    agencyName: "City of Scottsdale Tourism and Events",
    sourceName: "Special Event Planning & Permits",
    sourceUrl: "https://www.scottsdaleaz.gov/special-events",
    sourceCategory: "special event",
    useCaseRelevance: [
      "small-outdoor-music-art-event",
      "multi-vendor-market",
      "private-property-parking-lot-event",
      "venue-host-readiness"
    ],
    notes:
      "Official Scottsdale page for special event permits, guidebook, fees, and related event resources.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: true
  },
  {
    id: "scottsdale-business-regulatory-licenses",
    jurisdictionCode: "az-scottsdale",
    jurisdictionName: "Scottsdale",
    jurisdictionType: "city",
    agencyName: "City of Scottsdale Business Services",
    sourceName: "Business & Regulatory Licenses",
    sourceUrl: "https://www.scottsdaleaz.gov/licenses",
    sourceCategory: "business license",
    useCaseRelevance: ["retail-vendor-booth", "multi-vendor-market"],
    notes:
      "Official Scottsdale page for business registration and regulatory licenses.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: true
  },
  {
    id: "scottsdale-special-event-liquor",
    jurisdictionCode: "az-scottsdale",
    jurisdictionName: "Scottsdale",
    jurisdictionType: "city",
    agencyName: "City of Scottsdale",
    sourceName: "Obtaining a Liquor Permit for a Special Event",
    sourceUrl: "https://www.scottsdaleaz.gov/special-events/special-event-liquor",
    sourceCategory: "alcohol",
    useCaseRelevance: ["small-outdoor-music-art-event", "multi-vendor-market"],
    notes:
      "Official Scottsdale page for special event liquor permit process and temporary extension of premises context.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: true
  },
  {
    id: "scottsdale-fire-permit-services",
    jurisdictionCode: "az-scottsdale",
    jurisdictionName: "Scottsdale",
    jurisdictionType: "city",
    agencyName: "City of Scottsdale Fire Department",
    sourceName: "Fire Permit Services",
    sourceUrl: "https://www.scottsdaleaz.gov/fire/fire-services/fire-permit-services",
    sourceCategory: "fire / tent / generator / open flame",
    useCaseRelevance: [
      "small-outdoor-music-art-event",
      "multi-vendor-market",
      "private-property-parking-lot-event"
    ],
    notes:
      "Official Scottsdale fire page listing event-related fire permits such as tents and vehicle displays.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: true
  },
  {
    id: "scottsdale-special-event-guidebook",
    jurisdictionCode: "az-scottsdale",
    jurisdictionName: "Scottsdale",
    jurisdictionType: "city",
    agencyName: "City of Scottsdale Tourism and Events",
    sourceName: "Special Event Guidebook and Rules",
    sourceUrl:
      "https://www.scottsdaleaz.gov/docs/default-source/scottsdaleaz/tourism/special-event-guidebook.pdf?sfvrsn=a4470db2_6",
    sourceCategory: "vendor market / multi-vendor event",
    useCaseRelevance: [
      "small-outdoor-music-art-event",
      "multi-vendor-market",
      "venue-host-readiness"
    ],
    notes:
      "Official Scottsdale guidebook PDF. Review carefully before extracting event, vendor, parking, traffic, signage, or sound rules.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: false
  },
  {
    id: "glendale-special-events",
    jurisdictionCode: "az-glendale",
    jurisdictionName: "Glendale",
    jurisdictionType: "city",
    agencyName: "City of Glendale Special Events",
    sourceName: "Special Event Permit",
    sourceUrl:
      "https://www.glendaleaz.gov/Community/ApplyRegister-For/Special-event-application-process",
    sourceCategory: "special event",
    useCaseRelevance: [
      "small-outdoor-music-art-event",
      "multi-vendor-market",
      "venue-host-readiness"
    ],
    notes:
      "Official Glendale Special Event Permit page with master application, site plan, supplemental document, traffic, and timing guidance.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: true
  },
  {
    id: "glendale-parks-recreation",
    jurisdictionCode: "az-glendale",
    jurisdictionName: "Glendale",
    jurisdictionType: "city",
    agencyName: "City of Glendale Parks and Recreation",
    sourceName: "Parks and Recreation",
    sourceUrl: "https://www.glendaleaz.gov/Explore/Parks-and-Recreation",
    sourceCategory: "park event",
    useCaseRelevance: ["small-outdoor-music-art-event", "venue-host-readiness"],
    notes:
      "Official Glendale parks page. Research facility reservation and special event permit links before park-specific rules.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: false
  },
  {
    id: "glendale-transportation-services",
    jurisdictionCode: "az-glendale",
    jurisdictionName: "Glendale",
    jurisdictionType: "city",
    agencyName: "City of Glendale Transportation Services",
    sourceName: "Transportation Services",
    sourceUrl:
      "https://www.glendaleaz.gov/Community/City-Services/Transportation-Services",
    sourceCategory: "street or sidewalk closure",
    useCaseRelevance: ["small-outdoor-music-art-event", "multi-vendor-market"],
    notes:
      "Official Glendale transportation page referencing barricade permit procedures. Research specific barricade/right-of-way instructions before rules.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: false
  },
  {
    id: "glendale-business-license-open-data",
    jurisdictionCode: "az-glendale",
    jurisdictionName: "Glendale",
    jurisdictionType: "city",
    agencyName: "City of Glendale",
    sourceName: "Glendale Business Licenses",
    sourceUrl:
      "https://opendata.glendaleaz.com/datasets/glendale-business-licenses/about",
    sourceCategory: "business license",
    useCaseRelevance: ["retail-vendor-booth", "multi-vendor-market"],
    notes:
      "Official Glendale open data page states businesses are required to register for a business license. Find primary licensing application page before rule creation.",
    verificationStatus: "needs_review",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: false
  },
  {
    id: "glendale-special-events-licenses-research-needed",
    jurisdictionCode: "az-glendale",
    jurisdictionName: "Glendale",
    jurisdictionType: "city",
    agencyName: "City of Glendale",
    sourceName: "Glendale special events licenses source needed",
    sourceUrl: null,
    sourceCategory: "vendor market / multi-vendor event",
    useCaseRelevance: ["multi-vendor-market", "venue-host-readiness"],
    notes:
      "The Glendale site navigation references Special Events Licenses, but a specific reviewed source URL still needs manual research.",
    verificationStatus: "needs_research",
    lastChecked: null,
    isOfficial: false,
    rulesCreated: false
  },
  {
    id: "peoria-host-special-event",
    jurisdictionCode: "az-peoria",
    jurisdictionName: "Peoria",
    jurisdictionType: "city",
    agencyName: "City of Peoria Arts, Culture and Special Events",
    sourceName: "Host a Special Event",
    sourceUrl:
      "https://www.peoriaaz.gov/government/departments/arts-culture/special-events/host-a-special-event",
    sourceCategory: "special event",
    useCaseRelevance: [
      "small-outdoor-music-art-event",
      "multi-vendor-market",
      "venue-host-readiness"
    ],
    notes:
      "Official Peoria page for hosting special events and event applicant/vendor context.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: true
  },
  {
    id: "peoria-special-events",
    jurisdictionCode: "az-peoria",
    jurisdictionName: "Peoria",
    jurisdictionType: "city",
    agencyName: "City of Peoria Parks and Recreation",
    sourceName: "Special Events",
    sourceUrl: "https://www.peoriaaz.gov/residents/parks-and-recreation/special-events",
    sourceCategory: "park event",
    useCaseRelevance: ["small-outdoor-music-art-event", "multi-vendor-market"],
    notes:
      "Official Peoria special events page with city event and vendor participation context.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: false
  },
  {
    id: "peoria-vendor-information",
    jurisdictionCode: "az-peoria",
    jurisdictionName: "Peoria",
    jurisdictionType: "city",
    agencyName: "City of Peoria Arts, Culture and Special Events",
    sourceName: "Vendor Information",
    sourceUrl:
      "https://www.peoriaaz.gov/government/departments/arts-culture/special-events/vendor-information",
    sourceCategory: "vendor market / multi-vendor event",
    useCaseRelevance: ["retail-vendor-booth", "multi-vendor-market"],
    notes:
      "Official Peoria vendor information page for city special events. Review vendor participation process before rules.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: true
  },
  {
    id: "peoria-business-license",
    jurisdictionCode: "az-peoria",
    jurisdictionName: "Peoria",
    jurisdictionType: "city",
    agencyName: "City of Peoria Sales Tax and License",
    sourceName: "Business Licenses",
    sourceUrl: "https://www.peoriaaz.gov/i-want-to/pay/business-license",
    sourceCategory: "business license",
    useCaseRelevance: ["retail-vendor-booth", "multi-vendor-market"],
    notes:
      "Official Peoria business license page with business, TPT, liquor, peddler/solicitor, and special event liquor context.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: true
  },
  {
    id: "peoria-park-rules",
    jurisdictionCode: "az-peoria",
    jurisdictionName: "Peoria",
    jurisdictionType: "city",
    agencyName: "City of Peoria Parks and Recreation",
    sourceName: "Park Rules and Regulations",
    sourceUrl:
      "https://www.peoriaaz.gov/government/departments/parks-recreation-and-community-facilities/parks-and-trails/park-rules",
    sourceCategory: "park event",
    useCaseRelevance: ["small-outdoor-music-art-event", "venue-host-readiness"],
    notes:
      "Official Peoria park rules page. Review before park event and alcohol-related park guidance.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: false
  },
  {
    id: "chandler-host-event-public-private",
    jurisdictionCode: "az-chandler",
    jurisdictionName: "Chandler",
    jurisdictionType: "city",
    agencyName: "City of Chandler Special Events",
    sourceName: "Host an Event: Public vs. Private Property",
    sourceUrl: "https://www.chandleraz.gov/explore/events-in-chandler/host-an-event",
    sourceCategory: "special event",
    useCaseRelevance: [
      "small-outdoor-music-art-event",
      "multi-vendor-market",
      "private-property-parking-lot-event",
      "venue-host-readiness"
    ],
    notes:
      "Official Chandler page routing event hosts between public property and private property permit processes.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: false
  },
  {
    id: "chandler-public-property-special-event-permit",
    jurisdictionCode: "az-chandler",
    jurisdictionName: "Chandler",
    jurisdictionType: "city",
    agencyName: "City of Chandler Special Events",
    sourceName: "Public Property: Special Event Permit",
    sourceUrl:
      "https://www.chandleraz.gov/explore/events-in-chandler/host-an-event/special-event-permit",
    sourceCategory: "special event",
    useCaseRelevance: ["small-outdoor-music-art-event", "multi-vendor-market"],
    notes: "Official Chandler public-property special event permit page.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: true
  },
  {
    id: "chandler-private-property-tspe-permit",
    jurisdictionCode: "az-chandler",
    jurisdictionName: "Chandler",
    jurisdictionType: "city",
    agencyName: "City of Chandler Special Events",
    sourceName: "Private Property Event: TSPE Permit",
    sourceUrl:
      "https://www.chandleraz.gov/explore/events-in-chandler/host-an-event/tspe-permit",
    sourceCategory: "venue / private property event",
    useCaseRelevance: [
      "private-property-parking-lot-event",
      "venue-host-readiness"
    ],
    notes:
      "Official Chandler page for Temporary Sales and Promotional Event permit process on private property.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: true
  },
  {
    id: "chandler-business-registration",
    jurisdictionCode: "az-chandler",
    jurisdictionName: "Chandler",
    jurisdictionType: "city",
    agencyName: "City of Chandler Tax and License",
    sourceName: "Business Registration",
    sourceUrl:
      "https://www.chandleraz.gov/business/tax-and-license/business-registration",
    sourceCategory: "business license",
    useCaseRelevance: ["retail-vendor-booth", "multi-vendor-market"],
    notes: "Official Chandler business registration page.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: true
  },
  {
    id: "chandler-special-event-licenses",
    jurisdictionCode: "az-chandler",
    jurisdictionName: "Chandler",
    jurisdictionType: "city",
    agencyName: "City of Chandler Tax and License",
    sourceName: "Special Event Licenses",
    sourceUrl:
      "https://www.chandleraz.gov/business/tax-and-license/licensing/special-event-licenses",
    sourceCategory: "alcohol",
    useCaseRelevance: ["small-outdoor-music-art-event", "multi-vendor-market"],
    notes: "Official Chandler page for special event alcohol license context.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: false
  },
  {
    id: "chandler-specialty-licenses",
    jurisdictionCode: "az-chandler",
    jurisdictionName: "Chandler",
    jurisdictionType: "city",
    agencyName: "City of Chandler Tax and License",
    sourceName: "Specialty Licenses",
    sourceUrl:
      "https://www.chandleraz.gov/business/tax-and-license/licensing/specialty-licenses",
    sourceCategory: "vendor market / multi-vendor event",
    useCaseRelevance: ["retail-vendor-booth", "multi-vendor-market"],
    notes:
      "Official Chandler specialty licenses page. Review peddler/transient merchant details before vendor rules.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: true
  },
  {
    id: "gilbert-special-event-planning",
    jurisdictionCode: "az-gilbert",
    jurisdictionName: "Gilbert",
    jurisdictionType: "city",
    agencyName: "Town of Gilbert Parks and Recreation",
    sourceName: "Special Event Planning and Permits",
    sourceUrl:
      "https://www.gilbertaz.gov/how-do-i/view/special-event-planning-and-permits",
    sourceCategory: "special event",
    useCaseRelevance: [
      "small-outdoor-music-art-event",
      "multi-vendor-market",
      "venue-host-readiness"
    ],
    notes: "Official Gilbert page for special event planning and permit process.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: true
  },
  {
    id: "gilbert-special-events-and-permits",
    jurisdictionCode: "az-gilbert",
    jurisdictionName: "Gilbert",
    jurisdictionType: "city",
    agencyName: "Town of Gilbert Parks and Recreation",
    sourceName: "Special Events and Permits",
    sourceUrl:
      "https://www.gilbertaz.gov/departments/parks-and-recreation/special-events-and-permits",
    sourceCategory: "park event",
    useCaseRelevance: ["small-outdoor-music-art-event", "venue-host-readiness"],
    notes: "Official Gilbert parks and recreation special events page.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: false
  },
  {
    id: "gilbert-business-registration",
    jurisdictionCode: "az-gilbert",
    jurisdictionName: "Gilbert",
    jurisdictionType: "city",
    agencyName: "Town of Gilbert Development Services",
    sourceName: "Business Registration and Licensing",
    sourceUrl: "https://www.gilbertaz.gov/business/business-registration-and-licensing",
    sourceCategory: "business license",
    useCaseRelevance: ["retail-vendor-booth", "multi-vendor-market"],
    notes: "Official Gilbert business registration and licensing page.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: true
  },
  {
    id: "gilbert-business-license-faq",
    jurisdictionCode: "az-gilbert",
    jurisdictionName: "Gilbert",
    jurisdictionType: "city",
    agencyName: "Town of Gilbert Development Services",
    sourceName: "Business License FAQ",
    sourceUrl:
      "https://www.gilbertaz.gov/departments/development-services/business-registration-and-licensing/business-license-faq",
    sourceCategory: "business license",
    useCaseRelevance: ["retail-vendor-booth", "multi-vendor-market"],
    notes: "Official Gilbert FAQ for business license processing context.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: false
  },
  {
    id: "gilbert-vendor-information",
    jurisdictionCode: "az-gilbert",
    jurisdictionName: "Gilbert",
    jurisdictionType: "city",
    agencyName: "Town of Gilbert Parks and Recreation",
    sourceName: "Special Event Vendor Information",
    sourceUrl:
      "https://www.gilbertaz.gov/departments/parks-and-recreation/special-event-vendor-information",
    sourceCategory: "vendor market / multi-vendor event",
    useCaseRelevance: ["retail-vendor-booth", "multi-vendor-market"],
    notes:
      "Official Gilbert vendor information page for special events. Review before vendor rules.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: true
  },
  {
    id: "gilbert-liquor-licenses",
    jurisdictionCode: "az-gilbert",
    jurisdictionName: "Gilbert",
    jurisdictionType: "city",
    agencyName: "Town of Gilbert Development Services",
    sourceName: "Liquor Licenses",
    sourceUrl:
      "https://www.gilbertaz.gov/business/business-registration-and-licensing/liquor-licenses",
    sourceCategory: "alcohol",
    useCaseRelevance: ["small-outdoor-music-art-event", "multi-vendor-market"],
    notes:
      "Official Gilbert page for liquor license process context. Convert only after reviewing event-specific steps and state/city approval flow.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: false
  },
  {
    id: "gilbert-tpt-license",
    jurisdictionCode: "az-gilbert",
    jurisdictionName: "Gilbert",
    jurisdictionType: "city",
    agencyName: "Town of Gilbert Tax Compliance Division",
    sourceName: "Business License vs Transaction Privilege (Sales) Tax License",
    sourceUrl:
      "https://www.gilbertaz.gov/departments/finance-mgmt-services/tax-compliance-division/business-license-vs-transaction-privilege-sales-tax-license",
    sourceCategory: "TPT / sales tax",
    useCaseRelevance: ["retail-vendor-booth", "multi-vendor-market"],
    notes:
      "Official Gilbert page explaining business license and TPT license distinctions. Coordinate with ADOR before tax rules.",
    verificationStatus: "official_reviewed",
    lastChecked: "2026-06-23",
    isOfficial: true,
    rulesCreated: true
  }
];
