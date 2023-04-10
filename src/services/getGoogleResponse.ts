import logger from './logger';
import { sleep } from '../utils';

const RETRY_DELAY = 1000;

const numRetries = 2;

type GoogleRequestError = {
  message: string;
  stack: string;
  endpoint: 'DIRECTIONS_ROUTE';
  code: google.maps.DirectionsStatus;
  name: 'MapsRequestError';
};

export const isGoogleAPIZeroResultsError = (
  error: unknown
): error is GoogleRequestError =>
  error instanceof Error &&
  (error as GoogleRequestError)?.code ===
    google.maps.DirectionsStatus.ZERO_RESULTS;

export const getGoogleResponse = async (
  origin: google.maps.LatLngLiteral,
  destination: google.maps.LatLngLiteral,
  searchTime: Date,
  travelMode = google.maps.TravelMode.TRANSIT,
  attempts = 0
): Promise<google.maps.DirectionsResult> => {
  const directionsService = new google.maps.DirectionsService();

  const request: google.maps.DirectionsRequest = {
    origin,
    destination,
    travelMode,
    transitOptions: {
      departureTime: searchTime,
    },
  };

  try {
    const response = await directionsService.route(request);

    logger.debug('response', response);

    return response;
  } catch (error) {
    logger.warn(
      'error.code',
      (error as GoogleRequestError)?.code,
      '\nerror.message',
      (error as GoogleRequestError)?.message,
      '\nattempts',
      attempts
    );

    if (
      attempts <= numRetries &&
      (error as GoogleRequestError).code === 'OVER_QUERY_LIMIT'
    ) {
      await sleep(RETRY_DELAY);
      return getGoogleResponse(
        origin,
        destination,
        searchTime,
        travelMode,
        attempts + 1
      );
    }
    throw error;
  }
};
