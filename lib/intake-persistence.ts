import type { IntakeInput } from "@/lib/schemas";

export function buildIntakeCompatibilityFacts(data: IntakeInput) {
  const usesPublicProperty =
    data.publicProperty === true ||
    data.cityParkOrFacility === true ||
    data.propertyUse === "public-property" ||
    data.propertyUse === "park-or-plaza";
  const usesPrivateProperty =
    data.privateProperty === true ||
    data.propertyUse === "private-property" ||
    data.propertyUse === "parking-lot" ||
    data.propertyUse === "licensed-venue";
  const hasFood =
    data.hasFood ||
    data.foodIsPrepackaged === true ||
    data.foodIsOpenOrPreparedOnSite === true ||
    data.foodRequiresTemperatureControl === true ||
    data.foodSampling === true ||
    data.drinksWithIceOrGarnish === true;
  const hasFoodTruck =
    data.hasFoodTruck || data.foodTruckOrMobileFoodUnit === true;
  const hasAlcohol =
    data.hasAlcohol ||
    data.alcoholPresent === true ||
    data.alcoholSold === true ||
    data.alcoholServedFree === true ||
    data.alcoholByob === true ||
    data.alcoholOnPublicProperty === true;
  const hasStreetOrParkingImpact =
    data.hasStreetSidewalkOrParkingImpact ||
    data.streetClosure === true ||
    data.sidewalkUseOrClosure === true ||
    data.parkingLotUse === true ||
    data.parkingSpacesBlocked === true ||
    data.trafficControlNeeded === true ||
    data.rightOfWayUse === true;
  const hasTemporaryStructure =
    data.hasTemporaryStructure ||
    data.tentOrCanopy === true ||
    data.temporaryStageOrPlatform === true;
  const hasOpenFlame =
    data.hasOpenFlame ||
    data.cookingHeatSource === true ||
    data.propaneOrFuelUse === true;
  const hasSignage = data.temporarySignage === true || data.banners === true;

  return {
    hasFood,
    hasFoodTruck,
    hasAlcohol,
    usesPublicProperty,
    usesPrivateProperty,
    hasStreetOrParkingImpact,
    hasTemporaryStructure,
    hasOpenFlame,
    hasSignage,
    isTicketed: data.ticketedEvent === true,
    isRecurring: data.recurrence === "recurring" || data.recurringEvent === true
  };
}
