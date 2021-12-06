import { extractJourneyInfo } from './extractJourneyInfo';
import mockGoogleResponses from './mockGoogleResponses';
import { Location } from '../pages/index';
import { reallyCallGoogleAPI } from '../config';

const getGoogleResponses = async (origin: Location, destination: Location) => {
  const directionsService = new google.maps.DirectionsService();

  const travelMode = google.maps.TravelMode.TRANSIT;

  const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;

  const now = Date.now();

  const departureTimes = [
    new Date(now + 0 * MILLISECONDS_PER_HOUR),
    new Date(now + 1 * MILLISECONDS_PER_HOUR),
    new Date(now + 2 * MILLISECONDS_PER_HOUR),
    new Date(now + 3 * MILLISECONDS_PER_HOUR),
    new Date(now + 4 * MILLISECONDS_PER_HOUR),
    new Date(now + 5 * MILLISECONDS_PER_HOUR),
    new Date(now + 6 * MILLISECONDS_PER_HOUR),
    new Date(now + 7 * MILLISECONDS_PER_HOUR),
    new Date(now + 8 * MILLISECONDS_PER_HOUR),
  ];

  const responses = await Promise.all(
    departureTimes.map(async (departureTime) => {
      const request: google.maps.DirectionsRequest = {
        origin,
        destination,
        travelMode,
        drivingOptions: {
          departureTime,
        },
        transitOptions: {
          departureTime,
        },
      };
      const response = await directionsService.route(request);
      return response;
    })
  );
  return responses;
};

export const fetchJourneys = async (
  origin: Location,
  destination: Location
) => {
  const responses = reallyCallGoogleAPI
    ? await getGoogleResponses(origin, destination)
    : mockGoogleResponses;

  return extractJourneyInfo(responses);
};
