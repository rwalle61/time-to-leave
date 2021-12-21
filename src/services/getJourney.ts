import Journey from '../domain/Journey';
import { getGoogleResponse } from './getGoogleResponse';

const WALKING_ROUTE_WARNING =
  'Walking directions are in beta. Use caution – This route may be missing sidewalks or pedestrian paths.';

const WALKING_ROUTE_WARNING_FRENCH =
  "Le calcul d'itinéraires piétons est en bêta. Faites attention – Cet itinéraire n'est peut-être pas complètement aménagé pour les piétons.";

export const irrelevantRouteWarnings = [
  WALKING_ROUTE_WARNING,
  WALKING_ROUTE_WARNING_FRENCH,
];

type StepWithTransitDetails = google.maps.DirectionsStep & {
  transit: google.maps.TransitDetails;
};

const hasTransitDetails = (
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
    (warning) => !irrelevantRouteWarnings.includes(warning)
  );

  // "A route with no waypoints will contain exactly one DirectionsLeg"
  const recommendedJourney = recommendedRoute.legs[0];

  const transitLines = getTransitLines(recommendedJourney);
  const method = transitLines.length > 0 ? transitLines : ['WALK'];

  const journey: Journey = {
    departureTime: recommendedJourney.departure_time?.value || searchTime,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    duration: recommendedJourney.duration!.value * 1000,
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
