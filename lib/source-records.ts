import { officialSourceInventory } from "@/prisma/seed-data/source-inventory";

const sourceById = new Map(
  officialSourceInventory.map((source) => [source.id, source] as const)
);

const sourceIdByJurisdictionAndUrl = new Map(
  officialSourceInventory
    .filter((source) => source.sourceUrl)
    .map((source) => [`${source.jurisdictionCode}::${source.sourceUrl}`, source.id] as const)
);

export function findOfficialSourceById(sourceId: string) {
  return sourceById.get(sourceId) ?? null;
}

export function findOfficialSourceIdByJurisdictionAndUrl(options: {
  jurisdictionCode?: string | null | undefined;
  sourceUrl?: string | null | undefined;
}) {
  if (!options.jurisdictionCode || !options.sourceUrl) {
    return null;
  }

  return (
    sourceIdByJurisdictionAndUrl.get(
      `${options.jurisdictionCode}::${options.sourceUrl}`
    ) ?? null
  );
}
