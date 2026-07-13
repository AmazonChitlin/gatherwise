import { z } from "zod";

const triggerValueSchema = z.union([
  z.string().min(1),
  z.array(z.string().min(1)).min(1),
  z.number().int(),
  z.boolean()
]);

const triggerFieldsSchema = z
  .object({
    global: z.boolean().optional(),
    jurisdiction_code: z.string().min(1).optional(),
    jurisdiction_codes: z.array(z.string().min(1)).min(1).optional(),
    city: z.string().min(1).optional(),
    cities: z.array(z.string().min(1)).min(1).optional(),
    county: z.string().min(1).optional(),
    counties: z.array(z.string().min(1)).min(1).optional(),
    state: z.string().min(1).optional(),
    states: z.array(z.string().min(1)).min(1).optional(),
    event_type: z.string().min(1).optional(),
    event_types: z.array(z.string().min(1)).min(1).optional(),
    use_case: z.string().min(1).optional(),
    use_cases: z.array(z.string().min(1)).min(1).optional(),
    food_service: z.boolean().optional(),
    food_truck: z.boolean().optional(),
    food_is_prepackaged: z.boolean().optional(),
    food_is_open_or_prepared_on_site: z.boolean().optional(),
    food_requires_temperature_control: z.boolean().optional(),
    food_sampling: z.boolean().optional(),
    drinks_with_ice_or_garnish: z.boolean().optional(),
    food_truck_or_mobile_food_unit: z.boolean().optional(),
    commissary_or_base_of_operations: z.boolean().optional(),
    believes_food_exemption_may_apply: z.boolean().optional(),
    retail_sales: z.boolean().optional(),
    alcohol: z.boolean().optional(),
    alcohol_present: z.boolean().optional(),
    alcohol_sold: z.boolean().optional(),
    alcohol_served_free: z.boolean().optional(),
    alcohol_byob: z.boolean().optional(),
    alcohol_on_public_property: z.boolean().optional(),
    amplified_sound: z.boolean().optional(),
    public_property: z.boolean().optional(),
    private_property: z.boolean().optional(),
    city_park_or_facility: z.boolean().optional(),
    venue_or_property_owner_permission: z.boolean().optional(),
    indoor_or_outdoor: z.string().min(1).optional(),
    indoor_or_outdoor_values: z.array(z.string().min(1)).min(1).optional(),
    sidewalk_or_street_closure: z.boolean().optional(),
    street_closure: z.boolean().optional(),
    sidewalk_use_or_closure: z.boolean().optional(),
    parking_lot_use: z.boolean().optional(),
    parking_spaces_blocked: z.boolean().optional(),
    traffic_control_needed: z.boolean().optional(),
    right_of_way_use: z.boolean().optional(),
    min_expected_attendance: z.number().int().min(0).optional(),
    max_expected_attendance: z.number().int().min(0).optional(),
    min_vendor_count: z.number().int().min(0).optional(),
    max_vendor_count: z.number().int().min(0).optional(),
    temporary_structure: z.boolean().optional(),
    tent_or_canopy: z.boolean().optional(),
    tent_size_range: z.string().min(1).optional(),
    tent_size_ranges: z.array(z.string().min(1)).min(1).optional(),
    temporary_stage_or_platform: z.boolean().optional(),
    generator_use: z.boolean().optional(),
    open_flame: z.boolean().optional(),
    cooking_heat_source: z.boolean().optional(),
    propane_or_fuel_use: z.boolean().optional(),
    signage: z.boolean().optional(),
    temporary_signage: z.boolean().optional(),
    banners: z.boolean().optional(),
    ticketed_event: z.boolean().optional(),
    admission_fee: z.boolean().optional(),
    public_advertising: z.boolean().optional(),
    multi_vendor_event: z.boolean().optional(),
    recurring_event: z.boolean().optional(),
    vendor_count_min: z.number().int().min(0).optional(),
    vendor_count_max: z.number().int().min(0).optional(),
    expected_attendance_min: z.number().int().min(0).optional(),
    expected_attendance_max: z.number().int().min(0).optional()
  })
  .strict()
  .refine(
    (triggers) => {
      const keys = Object.keys(triggers).filter((key) => key !== "global");
      return keys.length > 0 || triggers.global === true;
    },
    {
      message:
        "Trigger fields cannot be empty unless the rule explicitly sets global: true."
    }
  );

const seedRuleSchema = z
  .object({
    slug: z.string().min(1),
    title: z.string().min(1),
    plainEnglishSummary: z.string().min(1),
    requirementLevel: z.enum([
      "likely required",
      "may be required",
      "confirm with the agency"
    ]),
    confidence: z.enum(["high", "medium", "low"]),
    leadTimeDays: z.number().int().min(0),
    isSample: z.boolean(),
    verificationStatus: z.enum([
      "verified",
      "needs_review",
      "sample_unverified",
      "inactive"
    ]),
    lastVerified: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
    source: z.object({
      name: z.string().min(1),
      url: z.string().url()
    }),
    jurisdiction: z.object({
      code: z.string().min(1),
      name: z.string().min(1),
      type: z.enum(["city", "county", "state", "venue", "organizer"]),
      city: z.string().min(1).optional(),
      county: z.string().min(1).optional(),
      state: z.string().min(1)
    }),
    agency: z.object({
      slug: z.string().min(1),
      name: z.string().min(1),
      phone: z.string().min(1).optional(),
      email: z.string().email().optional(),
      url: z.string().url().optional()
    }),
    useCase: z.string().min(1),
    triggers: triggerFieldsSchema,
    adminNote: z.string().min(1)
  })
  .superRefine((rule, context) => {
    if (rule.verificationStatus === "verified") {
      if (rule.isSample) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Verified rules cannot be marked as sample data.",
          path: ["isSample"]
        });
      }

      if (!rule.lastVerified) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Verified rules need a lastVerified date.",
          path: ["lastVerified"]
        });
      }
    }

    if (rule.verificationStatus === "sample_unverified" && !rule.isSample) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "sample_unverified rules should be marked isSample: true.",
        path: ["isSample"]
      });
    }

    try {
      JSON.stringify(rule.triggers);
    } catch {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Trigger fields must be JSON serializable.",
        path: ["triggers"]
      });
    }
  });

const seedDataSchema = z.array(seedRuleSchema);

export function validateSeedRules(rules: unknown) {
  const result = seedDataSchema.safeParse(rules);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".") || "seed"}: ${issue.message}`)
      .join("\n");

    throw new Error(`Seed rule validation failed:\n${details}`);
  }

  for (const rule of result.data) {
    for (const [key, value] of Object.entries(rule.triggers)) {
      if (value === undefined || !triggerValueSchema.safeParse(value).success) {
        throw new Error(
          `Seed rule validation failed:\n${rule.slug}.triggers.${key}: invalid trigger value`
        );
      }
    }
  }

  return result.data;
}
