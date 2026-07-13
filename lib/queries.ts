import { intakeSchema } from "@/lib/schemas";

export function parseIntakeParams(
  params: Record<string, string | string[] | undefined>
) {
  return intakeSchema.safeParse({
    eventName: getParam(params.eventName),
    city: getParam(params.city),
    county: getParam(params.county),
    useCase: getParam(params.useCase),
    eventType: getParam(params.eventType),
    propertyUse: getParam(params.propertyUse),
    expectedAttendance: getParam(params.expectedAttendance),
    vendorCount: getParam(params.vendorCount),
    eventDate: getParam(params.eventDate),
    recurrence: getParam(params.recurrence),
    hasFood: getParam(params.hasFood),
    hasFoodTruck: getParam(params.hasFoodTruck),
    hasRetailSales: getParam(params.hasRetailSales),
    hasAlcohol: getParam(params.hasAlcohol),
    hasAmplifiedSound: getParam(params.hasAmplifiedSound),
    hasTemporaryStructure: getParam(params.hasTemporaryStructure),
    hasGenerator: getParam(params.hasGenerator),
    hasOpenFlame: getParam(params.hasOpenFlame),
    hasStreetSidewalkOrParkingImpact: getParam(
      params.hasStreetSidewalkOrParkingImpact
    ),
    foodIsPrepackaged: getParam(params.foodIsPrepackaged),
    foodIsOpenOrPreparedOnSite: getParam(params.foodIsOpenOrPreparedOnSite),
    foodRequiresTemperatureControl: getParam(params.foodRequiresTemperatureControl),
    foodSampling: getParam(params.foodSampling),
    drinksWithIceOrGarnish: getParam(params.drinksWithIceOrGarnish),
    foodTruckOrMobileFoodUnit: getParam(params.foodTruckOrMobileFoodUnit),
    commissaryOrBaseOfOperations: getParam(params.commissaryOrBaseOfOperations),
    believesFoodExemptionMayApply: getParam(params.believesFoodExemptionMayApply),
    tentOrCanopy: getParam(params.tentOrCanopy),
    tentSizeRange: getParam(params.tentSizeRange),
    temporaryStageOrPlatform: getParam(params.temporaryStageOrPlatform),
    cookingHeatSource: getParam(params.cookingHeatSource),
    propaneOrFuelUse: getParam(params.propaneOrFuelUse),
    streetClosure: getParam(params.streetClosure),
    sidewalkUseOrClosure: getParam(params.sidewalkUseOrClosure),
    parkingLotUse: getParam(params.parkingLotUse),
    parkingSpacesBlocked: getParam(params.parkingSpacesBlocked),
    trafficControlNeeded: getParam(params.trafficControlNeeded),
    rightOfWayUse: getParam(params.rightOfWayUse),
    alcoholPresent: getParam(params.alcoholPresent),
    alcoholSold: getParam(params.alcoholSold),
    alcoholServedFree: getParam(params.alcoholServedFree),
    alcoholByob: getParam(params.alcoholByob),
    alcoholOnPublicProperty: getParam(params.alcoholOnPublicProperty),
    temporarySignage: getParam(params.temporarySignage),
    banners: getParam(params.banners),
    ticketedEvent: getParam(params.ticketedEvent),
    admissionFee: getParam(params.admissionFee),
    publicAdvertising: getParam(params.publicAdvertising),
    cityParkOrFacility: getParam(params.cityParkOrFacility),
    privateProperty: getParam(params.privateProperty),
    publicProperty: getParam(params.publicProperty),
    venueOrPropertyOwnerPermission: getParam(
      params.venueOrPropertyOwnerPermission
    ),
    indoorOrOutdoor: getParam(params.indoorOrOutdoor),
    recurringEvent: getParam(params.recurringEvent)
  });
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
