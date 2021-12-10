import { extractJourneyInfo } from './extractJourneyInfo';
import mockGoogleResponses from './mockGoogleResponses';
import { reallyCallGoogleAPI } from '../config';

const getDepartureTimes = () => {
  const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;

  const MILLISECONDS_PER_DAY = MILLISECONDS_PER_HOUR * 24;

  const isPast6AM = new Date().getHours() > 6;

  const firstDepartureDate = new Date();
  firstDepartureDate.setHours(22);
  firstDepartureDate.setMinutes(0);
  firstDepartureDate.setSeconds(0);
  firstDepartureDate.setMilliseconds(0);

  const firstDepartureTime = isPast6AM
    ? Number(firstDepartureDate)
    : Number(firstDepartureDate) - MILLISECONDS_PER_DAY;

  const departureTimes = [
    new Date(Number(firstDepartureTime) + 0 * MILLISECONDS_PER_HOUR),
    new Date(Number(firstDepartureTime) + 0.5 * MILLISECONDS_PER_HOUR),
    new Date(Number(firstDepartureTime) + 1 * MILLISECONDS_PER_HOUR),
    new Date(Number(firstDepartureTime) + 1.5 * MILLISECONDS_PER_HOUR),
    new Date(Number(firstDepartureTime) + 2 * MILLISECONDS_PER_HOUR),
    new Date(Number(firstDepartureTime) + 2.5 * MILLISECONDS_PER_HOUR),
    new Date(Number(firstDepartureTime) + 3 * MILLISECONDS_PER_HOUR),
    new Date(Number(firstDepartureTime) + 3.5 * MILLISECONDS_PER_HOUR),
    new Date(Number(firstDepartureTime) + 4 * MILLISECONDS_PER_HOUR),
  ];
  return departureTimes;
};

const getGoogleResponses = async (
  originLatLng: google.maps.LatLngLiteral,
  destinationLatLng: google.maps.LatLngLiteral,
  departureTimes: Date[]
) => {
  const directionsService = new google.maps.DirectionsService();

  const travelMode = google.maps.TravelMode.TRANSIT;

  const responses = await Promise.all(
    departureTimes.map(async (departureTime) => {
      const request: google.maps.DirectionsRequest = {
        origin: originLatLng,
        destination: destinationLatLng,
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
  originLatLng: google.maps.LatLngLiteral,
  destinationLatLng: google.maps.LatLngLiteral
) => {
  const departureTimes = getDepartureTimes();

  const responses = reallyCallGoogleAPI
    ? await getGoogleResponses(originLatLng, destinationLatLng, departureTimes)
    : (mockGoogleResponses as unknown as google.maps.DirectionsResult[]);

  return extractJourneyInfo(responses);
};
