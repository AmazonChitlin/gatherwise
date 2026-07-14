import { PrismaClient } from "@prisma/client";
import { ruleSeedData, useCaseSeedData } from "./seed-data/rules";
import { validateSeedIntegrity } from "./seed-integrity";
import { validateSeedRules } from "./seed-validation";

const prisma = new PrismaClient();

async function main() {
  const validatedRuleSeedData = validateSeedRules(ruleSeedData);
  validateSeedIntegrity(validatedRuleSeedData, useCaseSeedData);

  await prisma.ruleRecord.deleteMany({
    where: {
      slug: {
        in: ["sample-az-tpt-sales-tax-guidance"]
      }
    }
  });

  for (const useCase of useCaseSeedData) {
    await prisma.useCase.upsert({
      where: { slug: useCase.slug },
      update: useCase,
      create: useCase
    });
  }

  for (const seedRule of validatedRuleSeedData) {
    const jurisdiction = await prisma.jurisdiction.upsert({
      where: { code: seedRule.jurisdiction.code },
      update: {
        code: seedRule.jurisdiction.code,
        name: seedRule.jurisdiction.name,
        jurisdictionType: seedRule.jurisdiction.type,
        city: seedRule.jurisdiction.city,
        county: seedRule.jurisdiction.county,
        state: seedRule.jurisdiction.state
      },
      create: {
        code: seedRule.jurisdiction.code,
        name: seedRule.jurisdiction.name,
        jurisdictionType: seedRule.jurisdiction.type,
        city: seedRule.jurisdiction.city,
        county: seedRule.jurisdiction.county,
        state: seedRule.jurisdiction.state
      }
    });

    const agency = await prisma.agency.upsert({
      where: { slug: seedRule.agency.slug },
      update: {
        name: seedRule.agency.name,
        phone: seedRule.agency.phone,
        email: seedRule.agency.email,
        url: seedRule.agency.url,
        jurisdictionId: jurisdiction.id
      },
      create: {
        slug: seedRule.agency.slug,
        name: seedRule.agency.name,
        phone: seedRule.agency.phone,
        email: seedRule.agency.email,
        url: seedRule.agency.url,
        jurisdictionId: jurisdiction.id
      }
    });

    const useCase = await prisma.useCase.findUniqueOrThrow({
      where: { slug: seedRule.useCase }
    });

    const ruleData = {
      title: seedRule.title,
      plainEnglishSummary: seedRule.plainEnglishSummary,
      requirementLevel: seedRule.requirementLevel,
      confidence: seedRule.confidence,
      leadTimeDays: seedRule.leadTimeDays,
      sourceUrl: seedRule.source.url,
      sourceName: seedRule.source.name,
      lastVerified: seedRule.lastVerified
        ? new Date(`${seedRule.lastVerified}T00:00:00.000Z`)
        : null,
      isSample: seedRule.isSample,
      verificationStatus: seedRule.verificationStatus,
      jurisdictionName: jurisdiction.name,
      jurisdictionCode: jurisdiction.code,
      jurisdictionType: jurisdiction.jurisdictionType,
      city: jurisdiction.city,
      county: jurisdiction.county,
      state: jurisdiction.state,
      agencyName: agency.name,
      agencyPhone: agency.phone,
      agencyEmail: agency.email,
      agencyUrl: agency.url,
      triggerFields: JSON.stringify(seedRule.triggers),
      notes: seedRule.adminNote,
      jurisdictionId: jurisdiction.id,
      agencyId: agency.id,
      useCaseId: useCase.id
    };

    await prisma.ruleRecord.upsert({
      where: { slug: seedRule.slug },
      update: ruleData,
      create: {
        slug: seedRule.slug,
        ...ruleData
      }
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
