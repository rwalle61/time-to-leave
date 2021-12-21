import Journey from '../domain/Journey';
import { getGoogleResponse } from './getGoogleResponse';

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
  // "A route with no waypoints will contain exactly one DirectionsLeg"
  const recommendedJourney = response.routes[0].legs[0];

  const transitLines = getTransitLines(recommendedJourney);
  const method = transitLines.length > 0 ? transitLines : ['WALK'];

  const journey: Journey = {
    departureTime: recommendedJourney.departure_time?.value || searchTime,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    duration: recommendedJourney.duration!.value * 1000,
    transitLines: method,
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
