import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findSupportedJurisdiction } from "@/lib/config";
import { intakeToEventFacts, serializeStoredIntakePayload } from "@/lib/event-facts";
import {
  createResultsSnapshot,
  shouldPersistIntakeSubmissions
} from "@/lib/intake-storage";
import { buildIntakeCompatibilityFacts } from "@/lib/intake-persistence";
import {
  buildReviewedEventFacts,
  reviewedIntakeSubmissionSchema
} from "@/lib/reviewed-intake";
import { intakeSchema } from "@/lib/schemas";
import {
  createRateLimitHeaders,
  enforceRateLimit,
  getClientIdentifier,
  readJsonBody,
  RequestValidationError
} from "@/lib/request-guard";

const intakeRateLimit = {
  limit: 24,
  windowMs: 60_000
} as const;

export async function POST(request: Request) {
  const rateLimit = enforceRateLimit({
    key: `intake:${getClientIdentifier(request)}`,
    rule: intakeRateLimit
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        message: "Too many intake attempts in a short time. Please wait and try again."
      },
      {
        status: 429,
        headers: createRateLimitHeaders(rateLimit)
      }
    );
  }

  let body: unknown;
  try {
    body = await readJsonBody(request);
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json(
        { message: error.message },
        {
          status: 415,
          headers: createRateLimitHeaders(rateLimit)
        }
      );
    }

    throw error;
  }
  const isReviewedSubmission =
    body !== null && typeof body === "object" && "review" in body;
  const reviewedResult = isReviewedSubmission
    ? reviewedIntakeSubmissionSchema.safeParse(body)
    : null;
  const result = isReviewedSubmission ? null : intakeSchema.safeParse(body);

  if (
    (isReviewedSubmission && !reviewedResult?.success) ||
    (!isReviewedSubmission && !result?.success)
  ) {
    const fieldErrors = isReviewedSubmission
      ? reviewedResult?.success === false
        ? reviewedResult.error.flatten().fieldErrors
        : {}
      : result?.success === false
        ? result.error.flatten().fieldErrors
        : {};
    return NextResponse.json(
      {
        message: "Please fix the highlighted intake fields.",
        errors: Object.fromEntries(
          Object.entries(fieldErrors).flatMap(
            ([key, messages]) => (messages?.[0] ? [[key, messages[0]]] : [])
          )
        )
      },
      {
        status: 400,
        headers: createRateLimitHeaders(rateLimit)
      }
    );
  }

  const submittedIntake = reviewedResult?.success
    ? reviewedResult.data.intake
    : result?.success
      ? result.data
      : {};
  const eventFacts = reviewedResult?.success
    ? buildReviewedEventFacts(reviewedResult.data)
    : intakeToEventFacts(intakeSchema.parse(submittedIntake));
  const completeIntake = intakeSchema.safeParse(submittedIntake);

  if (!shouldPersistIntakeSubmissions() || !completeIntake.success) {
    try {
      return NextResponse.json(
        {
          snapshot: createResultsSnapshot(submittedIntake, eventFacts),
          persistence: "stateless"
        },
        {
          headers: createRateLimitHeaders(rateLimit)
        }
      );
    } catch {
      return NextResponse.json(
        {
          message:
            "We could not prepare a safe shareable demo session for this intake."
        },
        {
          status: 413,
          headers: createRateLimitHeaders(rateLimit)
        }
      );
    }
  }

  const data = completeIntake.data;
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
  const serializedPayload = serializeStoredIntakePayload(data, eventFacts);

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
      rawAnswers: serializedPayload,
      jurisdictionId: jurisdiction?.id,
      useCaseId: useCase?.id
    }
  });

  return NextResponse.json(
    { intakeId: intake.id, persistence: "database" },
    {
      headers: createRateLimitHeaders(rateLimit)
    }
  );
}
