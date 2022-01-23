import logger from './logger';
import { sleep } from '../utils';

const RETRY_DELAY = 1000;

const numRetries = 2;

type GoogleRequestError = {
  code: google.maps.DirectionsStatus;
};

export const getGoogleResponse = async (
  origin: google.maps.LatLngLiteral,
  destination: google.maps.LatLngLiteral,
  searchTime: Date,
  attempts = 0
): Promise<google.maps.DirectionsResult> => {
  const directionsService = new google.maps.DirectionsService();

  const travelMode = google.maps.TravelMode.TRANSIT;

  const request: google.maps.DirectionsRequest = {
    origin,
    destination,
    travelMode,
    transitOptions: {
      departureTime: searchTime,
    },
  };

  let response: google.maps.DirectionsResult;

  try {
    response = await directionsService.route(request);
  } catch (error) {
    logger.warn(
      'error.code',
      (error as GoogleRequestError)?.code,
      'attempts',
      attempts
    );

    if (
      attempts <= numRetries &&
      (error as GoogleRequestError).code === 'OVER_QUERY_LIMIT'
    ) {
      await sleep(RETRY_DELAY);
      return getGoogleResponse(origin, destination, searchTime, attempts + 1);
    }
    throw error;
  }

  return response;
};
