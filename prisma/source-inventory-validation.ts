import { z } from "zod";
import { sourceCategories } from "./seed-data/source-inventory";

const officialSourceInventoryItemSchema = z
  .object({
    id: z.string().min(1),
    jurisdictionCode: z.string().min(1),
    jurisdictionName: z.string().min(1),
    jurisdictionType: z.enum(["state", "county", "city"]),
    agencyName: z.string().min(1),
    sourceName: z.string().min(1),
    sourceUrl: z.string().url().nullable(),
    sourceCategory: z.enum(sourceCategories),
    useCaseRelevance: z.array(z.string().min(1)).min(1),
    notes: z.string().min(1),
    verificationStatus: z.enum([
      "official_reviewed",
      "needs_review",
      "needs_research"
    ]),
    lastChecked: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
    isOfficial: z.boolean(),
    rulesCreated: z.boolean()
  })
  .superRefine((source, context) => {
    if (source.verificationStatus === "official_reviewed") {
      if (!source.sourceUrl) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Reviewed official sources need a sourceUrl.",
          path: ["sourceUrl"]
        });
      }

      if (!source.isOfficial) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Reviewed official sources must be marked isOfficial: true.",
          path: ["isOfficial"]
        });
      }

      if (!source.lastChecked) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Reviewed official sources need a lastChecked date.",
          path: ["lastChecked"]
        });
      }
    }

    if (source.verificationStatus === "needs_research") {
      if (source.sourceUrl) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Needs-research placeholders should not include a URL yet.",
          path: ["sourceUrl"]
        });
      }

      if (source.isOfficial) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Needs-research placeholders cannot be marked official.",
          path: ["isOfficial"]
        });
      }

      if (source.rulesCreated) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Rules cannot be marked created before source research.",
          path: ["rulesCreated"]
        });
      }
    }

    if (source.rulesCreated && source.verificationStatus !== "official_reviewed") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Rules should only be marked created from reviewed official sources.",
        path: ["rulesCreated"]
      });
    }
  });

const officialSourceInventorySchema = z
  .array(officialSourceInventoryItemSchema)
  .superRefine((sources, context) => {
    const ids = new Set<string>();

    for (const [index, source] of sources.entries()) {
      if (ids.has(source.id)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate source id: ${source.id}`,
          path: [index, "id"]
        });
      }

      ids.add(source.id);
    }
  });

export function validateOfficialSourceInventory(sources: unknown) {
  const result = officialSourceInventorySchema.safeParse(sources);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".") || "source"}: ${issue.message}`)
      .join("\n");

    throw new Error(`Official source inventory validation failed:\n${details}`);
  }

  return result.data;
}
