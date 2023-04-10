import { JourneyWithSteps, Step } from '../domain/Journey';
import Location from '../domain/Location';
import { getGoogleResponse } from './getGoogleResponse';
import {
  DirectionsLeg,
  WALK_METHOD,
  hasTransitDetails,
  irrelevantRouteWarningStarts,
} from './getJourney';
import { MILLISECONDS_PER_MINUTE } from './time.utils';

const MIN_STEP_DURATION = 1 * MILLISECONDS_PER_MINUTE;

const extractJourney = (
  response: google.maps.DirectionsResult,
  origin: Location,
  destination: Location,
  searchTime: Date,
  travelMode: google.maps.TravelMode
): JourneyWithSteps => {
  const recommendedRoute = response.routes[0];

  const warnings = recommendedRoute.warnings.filter(
    (warning) =>
      !irrelevantRouteWarningStarts.some((warningStart) =>
        warning.startsWith(warningStart)
      )
  );

  // "A route with no waypoints will contain exactly one DirectionsLeg"
  const recommendedJourney = recommendedRoute.legs[0] as DirectionsLeg;

  const duration = recommendedJourney.duration.value * 1000;
  const departureTime = recommendedJourney.departure_time?.value || searchTime;
  const arrivalTime =
    recommendedJourney.arrival_time?.value ||
    new Date(departureTime.getTime() + duration);

  const steps: Step[] =
    travelMode === google.maps.TravelMode.WALKING
      ? [
          {
            departureTime,
            arrivalTime,
            origin,
            destination,
            duration,
            method: WALK_METHOD,
          },
        ]
      : recommendedJourney.steps
          .map((step, i) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const stepDuration = step.duration!.value * 1000;
            if (hasTransitDetails(step)) {
              return {
                departureTime: new Date(step.transit.departure_time.value),
                arrivalTime: new Date(step.transit.arrival_time.value),
                origin: {
                  name: step.transit.departure_stop.name,
                  latLng: step.start_location.toJSON(),
                },
                destination: {
                  name: step.transit.arrival_stop.name,
                  latLng: step.end_location.toJSON(),
                },
                duration: stepDuration,
                method: step.transit.line.short_name || step.transit.line.name,
              };
            }

            // i.e. step.travelMode === google.maps.TravelMode.WALKING
            // so prev & next steps must be transit

            const stepDepartureTime = new Date(
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              recommendedJourney.steps[i - 1]?.transit!.arrival_time.value ||
                departureTime
            );

            return {
              departureTime: stepDepartureTime,
              arrivalTime: new Date(stepDepartureTime.getTime() + stepDuration),
              origin: {
                name:
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  recommendedJourney.steps[i - 1]?.transit!.arrival_stop.name ||
                  origin.name,
                latLng: step.start_location.toJSON(),
              },
              destination: {
                name:
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  recommendedJourney.steps[i + 1]?.transit!.departure_stop
                    .name || destination.name,
                latLng: step.end_location.toJSON(),
              },
              duration: stepDuration,
              method: WALK_METHOD,
            };
          })
          .filter((step) => step.duration > MIN_STEP_DURATION);

  const journey: JourneyWithSteps = {
    departureTime,
    arrivalTime,
    duration,
    distance: recommendedJourney.distance.value,
    origin,
    destination,
    warnings,
    steps,
  };

  return journey;
};

export const getJourneyWithSteps = async (
  origin: Location,
  destination: Location,
  searchTime: Date,
  travelMode = google.maps.TravelMode.TRANSIT
): Promise<JourneyWithSteps> => {
  const response = await getGoogleResponse(
    origin.latLng,
    destination.latLng,
    searchTime,
    travelMode
  );
  const journey = extractJourney(
    response,
    origin,
    destination,
    searchTime,
    travelMode
  );
  return journey;
};
