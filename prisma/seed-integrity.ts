import { supportedJurisdictions } from "@/lib/config";
import { officialSourceInventory } from "@/prisma/seed-data/source-inventory";
import { validateOfficialSourceInventory } from "@/prisma/source-inventory-validation";

export type SeedRule = (typeof import("./seed-data/rules").ruleSeedData)[number];
export type SeedUseCase = (typeof import("./seed-data/rules").useCaseSeedData)[number];

export function findOfficialSourceForRule(
  rule: Pick<SeedRule, "jurisdiction" | "source">
) {
  const matches = officialSourceInventory.filter(
    (source) =>
      source.jurisdictionCode === rule.jurisdiction.code &&
      source.sourceUrl === rule.source.url
  );

  if (matches.length !== 1) {
    return null;
  }

  return matches[0];
}

export function sourceIdForRule(rule: Pick<SeedRule, "jurisdiction" | "source">) {
  return findOfficialSourceForRule(rule)?.id ?? null;
}

export function validateSeedIntegrity(rules: SeedRule[], useCases: SeedUseCase[]) {
  const validatedSources = validateOfficialSourceInventory(officialSourceInventory);
  const ruleSlugs = new Set<string>();
  const useCaseSlugs = new Set(useCases.map((useCase) => useCase.slug));
  const reviewedSourceKeys = new Set<string>();

  for (const source of validatedSources) {
    if (
      source.verificationStatus === "official_reviewed" &&
      source.sourceUrl
    ) {
      const key = `${source.jurisdictionCode}::${source.sourceUrl}`;
      if (reviewedSourceKeys.has(key)) {
        throw new Error(
          `Seed integrity validation failed:\nDuplicate reviewed source reference: ${key}`
        );
      }

      reviewedSourceKeys.add(key);
    }
  }

  for (const rule of rules) {
    if (ruleSlugs.has(rule.slug)) {
      throw new Error(
        `Seed integrity validation failed:\nDuplicate rule slug: ${rule.slug}`
      );
    }

    ruleSlugs.add(rule.slug);

    if (!useCaseSlugs.has(rule.useCase)) {
      throw new Error(
        `Seed integrity validation failed:\nUnknown use case on ${rule.slug}: ${rule.useCase}`
      );
    }

    if (
      rule.jurisdiction.type === "city" &&
      !supportedJurisdictions.some(
        (item) => item.jurisdictionCode === rule.jurisdiction.code
      )
    ) {
      throw new Error(
        `Seed integrity validation failed:\nUnsupported launch city on ${rule.slug}: ${rule.jurisdiction.code}`
      );
    }

    if (rule.verificationStatus !== "verified") {
      continue;
    }

    const matchedSource = findOfficialSourceForRule(rule);
    if (!matchedSource) {
      throw new Error(
        `Seed integrity validation failed:\nVerified rule ${rule.slug} does not map to exactly one official source inventory item.`
      );
    }

    if (matchedSource.verificationStatus !== "official_reviewed") {
      throw new Error(
        `Seed integrity validation failed:\nVerified rule ${rule.slug} must map to a reviewed official source.`
      );
    }
  }

  for (const source of validatedSources) {
    if (!source.rulesCreated) {
      continue;
    }

    const hasRule = rules.some(
      (rule) =>
        rule.jurisdiction.code === source.jurisdictionCode &&
        rule.source.url === source.sourceUrl
    );

    if (!hasRule) {
      throw new Error(
        `Seed integrity validation failed:\nSource ${source.id} is marked rulesCreated but no rule references it.`
      );
    }
  }

  return {
    rules,
    useCases,
    sources: validatedSources
  };
}
