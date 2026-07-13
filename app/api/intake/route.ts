import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findSupportedJurisdiction } from "@/lib/config";
import { intakeToEventFacts, serializeStoredIntakePayload } from "@/lib/event-facts";
import { buildIntakeCompatibilityFacts } from "@/lib/intake-persistence";
import { intakeSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const result = intakeSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        message: "Please fix the highlighted intake fields.",
        errors: Object.fromEntries(
          Object.entries(result.error.flatten().fieldErrors).flatMap(
            ([key, messages]) => (messages?.[0] ? [[key, messages[0]]] : [])
          )
        )
      },
      { status: 400 }
    );
  }

  const data = result.data;
  const city = findSupportedJurisdiction(data.city);
  const useCase = await prisma.useCase.findUnique({
    where: { slug: data.useCase }
  });
  const jurisdiction = city
    ? await prisma.jurisdiction.findUnique({
        where: { code: city.jurisdictionCode }
      })
    : null;
  const compatibilityFacts = buildIntakeCompatibilityFacts(data);
  const eventFacts = intakeToEventFacts(data);

  const intake = await prisma.intakeSubmission.create({
    data: {
      eventName: data.eventName,
      city: city?.city ?? city?.label ?? data.city,
      county: data.county,
      state: city?.state ?? "AZ",
      jurisdictionCode: city?.jurisdictionCode,
      eventDate: new Date(`${data.eventDate}T00:00:00.000Z`),
      eventType: data.eventType,
      venueType: data.propertyUse,
      expectedAttendance: data.expectedAttendance,
      vendorCount: data.vendorCount,
      hasFood: compatibilityFacts.hasFood,
      hasFoodTruck: compatibilityFacts.hasFoodTruck,
      hasRetailSales: data.hasRetailSales,
      hasAlcohol: compatibilityFacts.hasAlcohol,
      hasAmplifiedSound: data.hasAmplifiedSound,
      usesPublicProperty: compatibilityFacts.usesPublicProperty,
      usesPrivateProperty: compatibilityFacts.usesPrivateProperty,
      hasStreetClosure: compatibilityFacts.hasStreetOrParkingImpact,
      hasParkingImpact: compatibilityFacts.hasStreetOrParkingImpact,
      hasTemporaryStructure: compatibilityFacts.hasTemporaryStructure,
      hasGenerator: data.hasGenerator,
      hasOpenFlame: compatibilityFacts.hasOpenFlame,
      hasSignage: compatibilityFacts.hasSignage,
      isTicketed: compatibilityFacts.isTicketed,
      isMultiVendor: data.vendorCount > 1,
      isRecurring: compatibilityFacts.isRecurring,
      rawAnswers: serializeStoredIntakePayload(data, eventFacts),
      jurisdictionId: jurisdiction?.id,
      useCaseId: useCase?.id
    }
  });

  return NextResponse.json({ intakeId: intake.id });
}
