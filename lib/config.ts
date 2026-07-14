type SupportedJurisdiction = {
  code: string;
  jurisdictionCode: string;
  label: string;
  city?: string;
  county?: string;
  state: "AZ";
};

// Future geography should start here and in seed rules, not in page components.
// When other states are added, widen SupportedJurisdiction["state"] and confirm
// validation, seed data, and rule triggers still use stable state codes.
export const supportedJurisdictions: readonly SupportedJurisdiction[] = [
  {
    code: "phoenix",
    jurisdictionCode: "az-phoenix",
    label: "Phoenix",
    city: "Phoenix",
    county: "Maricopa County",
    state: "AZ"
  },
  {
    code: "tempe",
    jurisdictionCode: "az-tempe",
    label: "Tempe",
    city: "Tempe",
    county: "Maricopa County",
    state: "AZ"
  },
  {
    code: "mesa",
    jurisdictionCode: "az-mesa",
    label: "Mesa",
    city: "Mesa",
    county: "Maricopa County",
    state: "AZ"
  },
  {
    code: "scottsdale",
    jurisdictionCode: "az-scottsdale",
    label: "Scottsdale",
    city: "Scottsdale",
    county: "Maricopa County",
    state: "AZ"
  },
  {
    code: "glendale",
    jurisdictionCode: "az-glendale",
    label: "Glendale",
    city: "Glendale",
    county: "Maricopa County",
    state: "AZ"
  },
  {
    code: "peoria",
    jurisdictionCode: "az-peoria",
    label: "Peoria",
    city: "Peoria",
    county: "Maricopa County",
    state: "AZ"
  },
  {
    code: "chandler",
    jurisdictionCode: "az-chandler",
    label: "Chandler",
    city: "Chandler",
    county: "Maricopa County",
    state: "AZ"
  },
  {
    code: "gilbert",
    jurisdictionCode: "az-gilbert",
    label: "Gilbert",
    city: "Gilbert",
    county: "Maricopa County",
    state: "AZ"
  },
  {
    code: "maricopa-county",
    jurisdictionCode: "az-maricopa",
    label: "Maricopa County",
    county: "Maricopa County",
    state: "AZ"
  },
  {
    code: "arizona-state",
    jurisdictionCode: "az",
    label: "Arizona state-level rules",
    state: "AZ"
  },
  {
    code: "arizona-tpt",
    jurisdictionCode: "az",
    label: "Arizona TPT / sales tax guidance",
    state: "AZ"
  }
];

export function findSupportedJurisdiction(code: string) {
  return supportedJurisdictions.find((item) => item.code === code);
}

export function findSupportedJurisdictionByNormalizedCode(
  jurisdictionCode: string | null | undefined
) {
  return supportedJurisdictions.find(
    (item) => item.jurisdictionCode === jurisdictionCode
  );
}

export const countyOptions = [
  { value: "Maricopa County", label: "Maricopa County" }
] as const;

// Future use cases can be added as intake options and matched through RuleRecord
// trigger fields. Avoid adding one-off permit conclusions in the form UI.
export const useCaseOptions = [
  { value: "retail-vendor-booth", label: "Retail vendor booth" },
  {
    value: "food-truck-temporary-food-vendor",
    label: "Food truck or temporary food vendor"
  },
  { value: "small-outdoor-music-art-event", label: "Small outdoor music/art event" },
  { value: "multi-vendor-market", label: "Multi-vendor market" },
  {
    value: "private-property-parking-lot-event",
    label: "Private-property parking lot event"
  },
  { value: "venue-host-readiness", label: "Pop-up venue/host readiness" }
] as const;

export const eventTypeOptions = [
  { value: "vendor-pop-up", label: "Vendor pop-up or booth" },
  { value: "food-service", label: "Food service setup" },
  { value: "outdoor-market", label: "Outdoor market" },
  { value: "music-art-event", label: "Music or art event" },
  { value: "venue-hosted-event", label: "Venue-hosted event" },
  { value: "community-gathering", label: "Community gathering" }
] as const;

export const venueTypeOptions = [
  { value: "private-property", label: "Private property" },
  { value: "parking-lot", label: "Parking lot or outdoor private space" },
  { value: "public-property", label: "Public property" },
  { value: "park-or-plaza", label: "Park or plaza" },
  { value: "licensed-venue", label: "Existing licensed venue" }
] as const;

export const recurrenceOptions = [
  { value: "one-time", label: "One-time event" },
  { value: "recurring", label: "Recurring event" }
] as const;

export const tentSizeRangeOptions = [
  { value: "none", label: "No tent or canopy" },
  { value: "small-under-400-sq-ft", label: "Small, under 400 square feet" },
  {
    value: "large-400-sq-ft-or-more",
    label: "Large, 400 square feet or more"
  },
  { value: "not-sure", label: "Not sure yet" }
] as const;

export const indoorOrOutdoorOptions = [
  { value: "indoor", label: "Indoor" },
  { value: "outdoor", label: "Outdoor" },
  { value: "both", label: "Both indoor and outdoor" },
  { value: "not-sure", label: "Not sure yet" }
] as const;

export const supportedUseCases = useCaseOptions.map((option) => option.label);
