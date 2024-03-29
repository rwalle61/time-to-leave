import Journey from '../domain/Journey';
import { getGoogleResponse } from './getGoogleResponse';

const WALKING_ROUTE_WARNING_START = 'Walking directions are in beta';

const WALKING_ROUTE_WARNING_START_FRENCH =
  "Le calcul d'itinéraires piétons est en bêta";

export const irrelevantRouteWarningStarts = [
  WALKING_ROUTE_WARNING_START,
  WALKING_ROUTE_WARNING_START_FRENCH,
];

export const WALK_METHOD = 'WALK';

export type DirectionsLeg = google.maps.DirectionsLeg & {
  duration: google.maps.Duration;
  distance: google.maps.Distance;
};

type StepWithTransitDetails = google.maps.DirectionsStep & {
  transit: google.maps.TransitDetails;
};

export const hasTransitDetails = (
  step: google.maps.DirectionsStep
): step is StepWithTransitDetails => Boolean(step.transit);

const getTransitLines = ({ steps }: google.maps.DirectionsLeg): string[] =>
  steps
    .filter(hasTransitDetails)
    .map(({ transit }) => transit.line.short_name || transit.line.name);

const extractJourney = (
  response: google.maps.DirectionsResult,
  searchTime: Date
): Journey => {
  const recommendedRoute = response.routes[0];

  const warnings = recommendedRoute.warnings.filter(
    (warning) =>
      !irrelevantRouteWarningStarts.some((warningStart) =>
        warning.startsWith(warningStart)
      )
  );

  // "A route with no waypoints will contain exactly one DirectionsLeg"
  const recommendedJourney = recommendedRoute.legs[0] as DirectionsLeg;

  const transitLines = getTransitLines(recommendedJourney);
  const method = transitLines.length > 0 ? transitLines : [WALK_METHOD];

  const journey: Journey = {
    departureTime: recommendedJourney.departure_time?.value || searchTime,
    duration: recommendedJourney.duration.value * 1000,
    transitLines: method,
    warnings,
  };
  return journey;
};

export const getJourney = async (
  origin: google.maps.LatLngLiteral,
  destination: google.maps.LatLngLiteral,
  searchTime: Date
): Promise<Journey> => {
  const response = await getGoogleResponse(origin, destination, searchTime);
  const journey = extractJourney(response, searchTime);
  return journey;
};
