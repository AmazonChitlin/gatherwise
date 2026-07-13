export type Confidence = "high" | "medium" | "low";

export type RequirementLevel =
  | "likely required"
  | "may be required"
  | "confirm with the agency";

export type JurisdictionType = "city" | "county" | "state" | "venue" | "organizer";

export type RuleVerificationStatus =
  | "verified"
  | "needs_review"
  | "sample_unverified"
  | "inactive";

export type RuleTriggerFields = {
  global?: boolean;
  jurisdiction_code?: string;
  jurisdiction_codes?: string[];
  city?: string;
  cities?: string[];
  county?: string;
  counties?: string[];
  state?: string;
  states?: string[];
  event_type?: string;
  event_types?: string[];
  use_case?: string;
  use_cases?: string[];
  food_service?: boolean;
  food_truck?: boolean;
  food_is_prepackaged?: boolean;
  food_is_open_or_prepared_on_site?: boolean;
  food_requires_temperature_control?: boolean;
  food_sampling?: boolean;
  drinks_with_ice_or_garnish?: boolean;
  food_truck_or_mobile_food_unit?: boolean;
  commissary_or_base_of_operations?: boolean;
  believes_food_exemption_may_apply?: boolean;
  retail_sales?: boolean;
  alcohol?: boolean;
  alcohol_present?: boolean;
  alcohol_sold?: boolean;
  alcohol_served_free?: boolean;
  alcohol_byob?: boolean;
  alcohol_on_public_property?: boolean;
  amplified_sound?: boolean;
  public_property?: boolean;
  private_property?: boolean;
  city_park_or_facility?: boolean;
  venue_or_property_owner_permission?: boolean;
  indoor_or_outdoor?: string;
  indoor_or_outdoor_values?: string[];
  sidewalk_or_street_closure?: boolean;
  street_closure?: boolean;
  sidewalk_use_or_closure?: boolean;
  parking_lot_use?: boolean;
  parking_spaces_blocked?: boolean;
  traffic_control_needed?: boolean;
  right_of_way_use?: boolean;
  min_expected_attendance?: number;
  max_expected_attendance?: number;
  min_vendor_count?: number;
  max_vendor_count?: number;
  temporary_structure?: boolean;
  tent_or_canopy?: boolean;
  tent_size_range?: string;
  tent_size_ranges?: string[];
  temporary_stage_or_platform?: boolean;
  generator_use?: boolean;
  open_flame?: boolean;
  cooking_heat_source?: boolean;
  propane_or_fuel_use?: boolean;
  signage?: boolean;
  temporary_signage?: boolean;
  banners?: boolean;
  ticketed_event?: boolean;
  admission_fee?: boolean;
  public_advertising?: boolean;
  multi_vendor_event?: boolean;
  recurring_event?: boolean;
  vendor_count_min?: number;
  vendor_count_max?: number;
  expected_attendance_min?: number;
  expected_attendance_max?: number;
};
