import { reallyCallGoogleAPI } from '../config';
import Journey from '../domain/Journey';
import { getJourney } from './getJourney';
import logger from './logger';
import mockJourneysFromBrixtonToHome from './mockJourneys';
import {
  isSameTime,
  MILLISECONDS_PER_DAY,
  MILLISECONDS_PER_MINUTE,
  minutesToMilliseconds,
} from './time.utils';

const EARLIEST_SEARCH_HOUR = 23;

const LATEST_SEARCH_HOUR = 3; // Next day

// Lower this to get nearer the best journey, at the expense of more search requests to Google
// London tubes run every few minutes, so 6 minutes should be close enough
export const minimumSearchPeriod = minutesToMilliseconds(6);

export const expectedDurationDeviance = minutesToMilliseconds(10);

const isSimilarDuration = (duration1: number, duration2: number) =>
  Math.abs(duration1 - duration2) <= expectedDurationDeviance;

const millisecondsToMinutes = (milliseconds: number): number =>
  Math.round(milliseconds / MILLISECONDS_PER_MINUTE);

const isPast6AM = () => new Date().getHours() > 6;

export const getEarliestSearchTime = (): Date => {
  const date = isPast6AM()
    ? new Date()
    : new Date(Date.now() - MILLISECONDS_PER_DAY);
  date.setHours(EARLIEST_SEARCH_HOUR);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  return date;
};

export const getLatestSearchTime = (): Date => {
  const date = isPast6AM()
    ? new Date(Date.now() + MILLISECONDS_PER_DAY)
    : new Date();
  date.setHours(LATEST_SEARCH_HOUR);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  return date;
};

export const findJourneys = async (
  originLatLng: google.maps.LatLngLiteral,
  destinationLatLng: google.maps.LatLngLiteral,
  earliestSearchTime: Date,
  earliestJourneyDuration: number,
  latestSearchTime: Date,
  latestJourneyDuration: number
): Promise<Journey[]> => {
  const searchPeriod =
    latestSearchTime.getTime() - earliestSearchTime.getTime();
  const midpoint = new Date(earliestSearchTime.getTime() + searchPeriod / 2);
  logger.debug(
    `earliestSearchTime: ${earliestSearchTime.toLocaleTimeString()}`,
    `latestSearchTime: ${latestSearchTime.toLocaleTimeString()}`,
    `midpoint: ${midpoint.toLocaleTimeString()}`,
    `searchPeriod: ${millisecondsToMinutes(searchPeriod)} mins`
  );

  if (latestSearchTime < earliestSearchTime) {
    logger.warn(
      `earliestSearchTime (${earliestSearchTime.toLocaleTimeString()})`,
      'is later than',
      `latestSearchTime (${latestSearchTime.toLocaleTimeString()})`
    );
    return [];
  }
  if (searchPeriod < minimumSearchPeriod) {
    return [];
  }

  const journeyAfterMidpoint = await getJourney(
    originLatLng,
    destinationLatLng,
    midpoint
  );

  logger.debug(
    `earliestJourneyDuration: ${millisecondsToMinutes(
      earliestJourneyDuration
    )} mins`,
    `latestJourneyDuration: ${millisecondsToMinutes(
      latestJourneyDuration
    )} mins`,
    `journeyAfterMidpoint.duration: ${millisecondsToMinutes(
      journeyAfterMidpoint.duration
    )} mins`,
    `journeyAfterMidpoint.departureTime: ${journeyAfterMidpoint.departureTime.toLocaleTimeString()}`
  );
  const findJourneysBeforeMidpoint = () =>
    findJourneys(
      originLatLng,
      destinationLatLng,
      earliestSearchTime,
      earliestJourneyDuration,
      midpoint,
      journeyAfterMidpoint.duration
    );
  const findJourneysAfterMidpoint = () =>
    findJourneys(
      originLatLng,
      destinationLatLng,
      // There are no journeys between the midpoint and the departure time of the journey directly after the midpoint.
      journeyAfterMidpoint.departureTime,
      journeyAfterMidpoint.duration,
      latestSearchTime,
      latestJourneyDuration
    );

  if (
    isSimilarDuration(earliestJourneyDuration, journeyAfterMidpoint.duration)
  ) {
    return [journeyAfterMidpoint, ...(await findJourneysAfterMidpoint())];
  }
  if (isSimilarDuration(latestJourneyDuration, journeyAfterMidpoint.duration)) {
    return [...(await findJourneysBeforeMidpoint()), journeyAfterMidpoint];
  }

  return [
    ...(await findJourneysBeforeMidpoint()),
    journeyAfterMidpoint,
    ...(await findJourneysAfterMidpoint()),
  ];
};

export const fetchJourneysFromGoogle = async (
  originLatLng: google.maps.LatLngLiteral,
  destinationLatLng: google.maps.LatLngLiteral
): Promise<Journey[]> => {
  const earliestSearchTime = getEarliestSearchTime();
  const latestSearchTime = getLatestSearchTime();

  const [firstJourney, lastJourney] = await Promise.all([
    getJourney(originLatLng, destinationLatLng, earliestSearchTime),
    getJourney(originLatLng, destinationLatLng, latestSearchTime),
  ]);

  const journeys = [
    firstJourney,
    ...(await findJourneys(
      originLatLng,
      destinationLatLng,
      firstJourney.departureTime,
      firstJourney.duration,
      // There are no journeys between the latestSearchTime and the departure time of the journey directly after the latestSearchTime.
      latestSearchTime,
      lastJourney.duration
    )),
    lastJourney,
  ];

  return journeys;
};

export const fetchJourneys = async (
  originLatLng: google.maps.LatLngLiteral,
  destinationLatLng: google.maps.LatLngLiteral
): Promise<Journey[]> => {
  const journeys = reallyCallGoogleAPI()
    ? await fetchJourneysFromGoogle(originLatLng, destinationLatLng)
    : mockJourneysFromBrixtonToHome;

  const uniqueJourneys = journeys.filter(
    (journey, index) =>
      journeys.findIndex(({ departureTime }) =>
        isSameTime(departureTime, journey.departureTime)
      ) === index
  );

  return uniqueJourneys;
};
