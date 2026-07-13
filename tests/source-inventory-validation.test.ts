import assert from "node:assert/strict";
import test from "node:test";
import { officialSourceInventory } from "@/prisma/seed-data/source-inventory";
import { validateOfficialSourceInventory } from "@/prisma/source-inventory-validation";

const reviewedSource = {
  id: "reviewed-source",
  jurisdictionCode: "az",
  jurisdictionName: "Arizona",
  jurisdictionType: "state",
  agencyName: "Arizona Department of Revenue",
  sourceName: "Reviewed Source",
  sourceUrl: "https://azdor.gov/business/transaction-privilege-tax",
  sourceCategory: "TPT / sales tax",
  useCaseRelevance: ["retail-vendor-booth"],
  notes: "Official reviewed source.",
  verificationStatus: "official_reviewed",
  lastChecked: "2026-06-23",
  isOfficial: true,
  rulesCreated: false
};

test("validates the official source inventory", () => {
  const result = validateOfficialSourceInventory(officialSourceInventory);

  assert.ok(result.length >= 10);
  assert.ok(result.some((source) => source.jurisdictionCode === "az-gilbert"));
});

test("allows missing source placeholders without pretending they are official", () => {
  const result = validateOfficialSourceInventory([
    {
      ...reviewedSource,
      id: "missing-source",
      jurisdictionCode: "az-mesa",
      jurisdictionName: "Mesa",
      jurisdictionType: "city",
      agencyName: "City of Mesa",
      sourceName: "Mesa official source needed",
      sourceUrl: null,
      sourceCategory: "special event",
      verificationStatus: "needs_research",
      lastChecked: null,
      isOfficial: false,
      rulesCreated: false
    }
  ]);

  assert.equal(result[0].verificationStatus, "needs_research");
});

test("rejects reviewed official sources without official metadata", () => {
  assert.throws(
    () =>
      validateOfficialSourceInventory([
        {
          ...reviewedSource,
          sourceUrl: null,
          isOfficial: false,
          lastChecked: null
        }
      ]),
    /Reviewed official sources/
  );
});

test("rejects rules-created flags on unreviewed sources", () => {
  assert.throws(
    () =>
      validateOfficialSourceInventory([
        {
          ...reviewedSource,
          id: "unreviewed-with-rule",
          verificationStatus: "needs_review",
          isOfficial: false,
          rulesCreated: true
        }
      ]),
    /Rules should only be marked created/
  );
});
