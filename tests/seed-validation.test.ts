import assert from "node:assert/strict";
import test from "node:test";
import { validateSeedRules } from "@/prisma/seed-validation";

const validRule = {
  slug: "valid-seed-rule",
  title: "Valid seed rule",
  plainEnglishSummary: "Confirm this sample rule with the agency.",
  requirementLevel: "may be required",
  confidence: "low",
  leadTimeDays: 14,
  isSample: true,
  verificationStatus: "sample_unverified",
  lastVerified: null,
  source: {
    name: "Official sample source",
    url: "https://example.gov/source"
  },
  jurisdiction: {
    code: "az",
    name: "Arizona",
    type: "state",
    state: "AZ"
  },
  agency: {
    slug: "sample-agency",
    name: "Sample Agency",
    url: "https://example.gov"
  },
  useCase: "retail-vendor-booth",
  triggers: {
    state: "AZ",
    retail_sales: true
  },
  adminNote: "Sample note."
};

test("accepts valid seed rule trigger data", () => {
  const result = validateSeedRules([validRule]);

  assert.equal(result[0].slug, "valid-seed-rule");
});

test("accepts refined future trigger keys", () => {
  const result = validateSeedRules([
    {
      ...validRule,
      slug: "refined-trigger-seed-rule",
      triggers: {
        city: "Phoenix",
        food_sampling: true,
        food_requires_temperature_control: true,
        tent_or_canopy: true,
        tent_size_range: "large-400-sq-ft-or-more",
        parking_spaces_blocked: true,
        alcohol_sold: true,
        temporary_signage: true,
        ticketed_event: true,
        city_park_or_facility: true,
        indoor_or_outdoor: "outdoor"
      }
    }
  ]);

  assert.equal(result[0].slug, "refined-trigger-seed-rule");
});

test("rejects empty seed triggers unless explicitly global", () => {
  assert.throws(
    () =>
      validateSeedRules([
        {
          ...validRule,
          slug: "empty-trigger-rule",
          triggers: {}
        }
      ]),
    /Trigger fields cannot be empty/
  );
});

test("rejects missing source URLs and verification status", () => {
  assert.throws(
    () =>
      validateSeedRules([
        {
          ...validRule,
          slug: "missing-source-rule",
          verificationStatus: undefined,
          source: {
            name: "Missing URL"
          }
        }
      ]),
    /verificationStatus|required|source.url/
  );
});
