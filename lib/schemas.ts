import { z } from "zod";
import {
  countyOptions,
  eventTypeOptions,
  indoorOrOutdoorOptions,
  recurrenceOptions,
  supportedJurisdictions,
  tentSizeRangeOptions,
  useCaseOptions,
  venueTypeOptions
} from "@/lib/config";

const jurisdictionValues = supportedJurisdictions.map((item) => item.code) as [
  string,
  ...string[]
];
const eventTypeValues = eventTypeOptions.map((item) => item.value) as [
  string,
  ...string[]
];
const useCaseValues = useCaseOptions.map((item) => item.value) as [
  string,
  ...string[]
];
const venueTypeValues = venueTypeOptions.map((item) => item.value) as [
  string,
  ...string[]
];
const countyValues = countyOptions.map((item) => item.value) as [
  string,
  ...string[]
];
const recurrenceValues = recurrenceOptions.map((item) => item.value) as [
  string,
  ...string[]
];
const tentSizeRangeValues = tentSizeRangeOptions.map((item) => item.value) as [
  string,
  ...string[]
];
const indoorOrOutdoorValues = indoorOrOutdoorOptions.map((item) => item.value) as [
  string,
  ...string[]
];

const booleanFromQuery = z.preprocess((value) => {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return value;
}, z.boolean({ required_error: "Choose yes or no." }));

const optionalBooleanFromQuery = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return value;
}, z.boolean().optional());

const wholeNumber = (
  requiredMessage: string,
  maximum: number,
  maxMessage: string
) =>
  z.preprocess(
    (value) => {
      if (value === "" || value === undefined || value === null) {
        return undefined;
      }

      return Number(value);
    },
    z
      .number({
        required_error: requiredMessage,
        invalid_type_error: "Use a number."
      })
      .int("Use a whole number.")
      .min(1, requiredMessage)
      .max(maximum, maxMessage)
  );

export const intakeSchema = z.object({
  eventName: z
    .string()
    .trim()
    .min(2, "Add a short event, booth, or business name."),
  city: z.enum(jurisdictionValues, {
    errorMap: () => ({ message: "Choose the city or rule area for the event." })
  }),
  county: z.enum(countyValues, {
    errorMap: () => ({ message: "Choose the county for the event." })
  }),
  useCase: z.enum(useCaseValues, {
    errorMap: () => ({ message: "Choose the closest use case." })
  }),
  eventType: z.enum(eventTypeValues, {
    errorMap: () => ({ message: "Choose the closest event type." })
  }),
  propertyUse: z.enum(venueTypeValues, {
    errorMap: () => ({ message: "Choose the property or venue type." })
  }),
  expectedAttendance: wholeNumber(
    "Add the expected number of people.",
    50000,
    "For now, use a number under 50,000."
  ),
  vendorCount: wholeNumber(
    "Add at least one vendor or host.",
    1000,
    "For now, use a number under 1,000."
  ),
  eventDate: z
    .string({ required_error: "Choose the event date." })
    .min(1, "Choose the event date.")
    .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00`)), {
      message: "Use a valid event date."
    }),
  recurrence: z.enum(recurrenceValues, {
    errorMap: () => ({ message: "Choose one-time or recurring." })
  }),
  hasFood: booleanFromQuery,
  hasFoodTruck: booleanFromQuery,
  hasRetailSales: booleanFromQuery,
  hasAlcohol: booleanFromQuery,
  hasAmplifiedSound: booleanFromQuery,
  hasTemporaryStructure: booleanFromQuery,
  hasGenerator: booleanFromQuery,
  hasOpenFlame: booleanFromQuery,
  hasStreetSidewalkOrParkingImpact: booleanFromQuery,
  foodIsPrepackaged: optionalBooleanFromQuery,
  foodIsOpenOrPreparedOnSite: optionalBooleanFromQuery,
  foodRequiresTemperatureControl: optionalBooleanFromQuery,
  foodSampling: optionalBooleanFromQuery,
  drinksWithIceOrGarnish: optionalBooleanFromQuery,
  foodTruckOrMobileFoodUnit: optionalBooleanFromQuery,
  commissaryOrBaseOfOperations: optionalBooleanFromQuery,
  believesFoodExemptionMayApply: optionalBooleanFromQuery,
  tentOrCanopy: optionalBooleanFromQuery,
  tentSizeRange: z.enum(tentSizeRangeValues).optional(),
  temporaryStageOrPlatform: optionalBooleanFromQuery,
  cookingHeatSource: optionalBooleanFromQuery,
  propaneOrFuelUse: optionalBooleanFromQuery,
  streetClosure: optionalBooleanFromQuery,
  sidewalkUseOrClosure: optionalBooleanFromQuery,
  parkingLotUse: optionalBooleanFromQuery,
  parkingSpacesBlocked: optionalBooleanFromQuery,
  trafficControlNeeded: optionalBooleanFromQuery,
  rightOfWayUse: optionalBooleanFromQuery,
  alcoholPresent: optionalBooleanFromQuery,
  alcoholSold: optionalBooleanFromQuery,
  alcoholServedFree: optionalBooleanFromQuery,
  alcoholByob: optionalBooleanFromQuery,
  alcoholOnPublicProperty: optionalBooleanFromQuery,
  temporarySignage: optionalBooleanFromQuery,
  banners: optionalBooleanFromQuery,
  ticketedEvent: optionalBooleanFromQuery,
  admissionFee: optionalBooleanFromQuery,
  publicAdvertising: optionalBooleanFromQuery,
  cityParkOrFacility: optionalBooleanFromQuery,
  privateProperty: optionalBooleanFromQuery,
  publicProperty: optionalBooleanFromQuery,
  venueOrPropertyOwnerPermission: optionalBooleanFromQuery,
  indoorOrOutdoor: z.enum(indoorOrOutdoorValues).optional(),
  recurringEvent: optionalBooleanFromQuery
});

export type IntakeInput = z.infer<typeof intakeSchema>;
export const partialIntakeSchema = intakeSchema.partial();
export type PartialIntakeInput = z.infer<typeof partialIntakeSchema>;
