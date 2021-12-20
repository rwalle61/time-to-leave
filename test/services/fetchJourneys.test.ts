import * as configModule from '../../src/config';
import { BRIXTON_STATION, HOME } from '../../src/domain/defaultLocations';
import Journey from '../../src/domain/Journey';
import {
  expectedDurationDeviance,
  fetchJourneys,
  getEarliestSearchTime,
  getLatestSearchTime,
  minimumSearchPeriod,
} from '../../src/services/fetchJourneys';
import * as getJourneyModule from '../../src/services/getJourney';
import logger from '../../src/services/logger';
import {
  isSameTime,
  MILLISECONDS_PER_DAY,
  minutesToMilliseconds,
} from '../../src/services/time.utils';

const transitLines = ['Victoria'];

const EIGHT_PM_IN_THE_EVENING = new Date(2021, 0, 0, 20);
const MIDNIGHT = new Date(2021, 0, 1, 0);
const ONE_AM = new Date(2021, 0, 1, 1);

jest.useFakeTimers().setSystemTime(EIGHT_PM_IN_THE_EVENING);

// These must be called after `jest.useFakeTimers().setSystemTime`
const earliestSearchTime = getEarliestSearchTime();
const latestSearchTime = getLatestSearchTime();

const findJourneyNearTime = (
  journeys: Journey[],
  bestDepartureTime: Date
): Journey | undefined =>
  journeys.find(
    ({ departureTime }) =>
      bestDepartureTime.getTime() - departureTime.getTime() <
      minimumSearchPeriod
  );

describe('fetchJourneys', () => {
  beforeEach(() => {
    jest.spyOn(configModule, 'reallyCallGoogleAPI').mockReturnValue(true);
  });

  describe('when journeys are simple', () => {
    const bestDepartureTime = MIDNIGHT;
    const shortDuration = minutesToMilliseconds(30);
    const longDuration = minutesToMilliseconds(60);

    beforeEach(() => {
      jest
        .spyOn(getJourneyModule, 'getJourney')
        .mockImplementation(
          async (originLatLng, destinationLatLng, searchTime) => ({
            departureTime: searchTime,
            duration:
              searchTime < bestDepartureTime ? shortDuration : longDuration,
            transitLines,
          })
        );
    });

    it('finds the best journeys', async () => {
      const journeys = await fetchJourneys(BRIXTON_STATION.latLng, HOME.latLng);

      expect(journeys[0]).toMatchObject({
        duration: shortDuration,
        departureTime: earliestSearchTime,
      });
      expect(journeys[journeys.length - 1]).toMatchObject({
        duration: longDuration,
        departureTime: latestSearchTime,
      });

      const bestJourney = findJourneyNearTime(journeys, bestDepartureTime);
      expect(bestJourney).toBeDefined();
      expect(bestJourney?.duration).toBe(shortDuration);

      expect(journeys).toStrictEqual(
        [...journeys].sort(
          (journey1, journey2) =>
            journey1.departureTime.getTime() - journey2.departureTime.getTime()
        )
      );
    });
  });

  describe('when journey durations deviate within the expected bounds', () => {
    const bestDepartureTime = MIDNIGHT;
    const shortDuration = minutesToMilliseconds(30);
    const longDuration = minutesToMilliseconds(60);

    const varyWithinExpectedBounds = (time: number) =>
      time -
      expectedDurationDeviance +
      Math.random() * expectedDurationDeviance * 2;

    beforeEach(() => {
      jest
        .spyOn(getJourneyModule, 'getJourney')
        .mockImplementation(
          async (originLatLng, destinationLatLng, searchTime) => ({
            departureTime: searchTime,
            duration: varyWithinExpectedBounds(
              searchTime < bestDepartureTime ? shortDuration : longDuration
            ),
            transitLines,
          })
        );
    });

    it('finds the best journeys', async () => {
      const journeys = await fetchJourneys(BRIXTON_STATION.latLng, HOME.latLng);

      expect(journeys[0].duration).toBeWithin(
        shortDuration - expectedDurationDeviance,
        shortDuration + expectedDurationDeviance
      );
      expect(journeys[journeys.length - 1].duration).toBeWithin(
        longDuration - expectedDurationDeviance,
        longDuration + expectedDurationDeviance
      );

      const bestJourney = findJourneyNearTime(journeys, bestDepartureTime);
      expect(bestJourney).toBeDefined();
      expect(bestJourney?.duration).toBeWithin(
        shortDuration - expectedDurationDeviance,
        shortDuration + expectedDurationDeviance
      );
    });
  });

  describe('when journey durations increase multiple times', () => {
    const goodDepartureTime1 = MIDNIGHT;
    const goodDepartureTime2 = ONE_AM;
    const shortDuration1 = minutesToMilliseconds(30);
    const shortDuration2 = minutesToMilliseconds(45);
    const longDuration = minutesToMilliseconds(60);

    beforeEach(() => {
      jest
        .spyOn(getJourneyModule, 'getJourney')
        .mockImplementation(
          async (originLatLng, destinationLatLng, searchTime) => ({
            departureTime: searchTime,
            duration:
              searchTime < goodDepartureTime1
                ? shortDuration1
                : searchTime < goodDepartureTime2
                ? shortDuration2
                : longDuration,
            transitLines,
          })
        );
    });

    it('finds the best journeys', async () => {
      const journeys = await fetchJourneys(BRIXTON_STATION.latLng, HOME.latLng);

      expect(journeys[0].duration).toBe(shortDuration1);
      expect(journeys[journeys.length - 1].duration).toBe(longDuration);

      const goodJourney1 = findJourneyNearTime(journeys, goodDepartureTime1);
      expect(goodJourney1).toBeDefined();
      expect(goodJourney1?.duration).toBe(shortDuration1);

      const goodJourney2 = findJourneyNearTime(journeys, goodDepartureTime1);
      expect(goodJourney2).toBeDefined();
      expect(goodJourney2?.duration).toBe(shortDuration1);
    });
  });

  describe('when there so few journeys that multiple search times find the same journey', () => {
    beforeEach(() => {
      jest
        .spyOn(getJourneyModule, 'getJourney')
        .mockImplementation(async () => ({
          departureTime: new Date(latestSearchTime),
          duration: 0,
          transitLines,
        }));
    });

    it('omits duplicate journeys', async () => {
      const journeys = await fetchJourneys(BRIXTON_STATION.latLng, HOME.latLng);

      expect(journeys).toHaveLength(1);
    });
  });

  describe('when the latest journey time is later than the latest search time', () => {
    const superLateDepartureTime = new Date(
      latestSearchTime.getTime() + MILLISECONDS_PER_DAY
    );
    beforeEach(() => {
      jest
        .spyOn(getJourneyModule, 'getJourney')
        .mockImplementation(
          async (originLatLng, destinationLatLng, searchTime) => ({
            departureTime: isSameTime(searchTime, latestSearchTime)
              ? superLateDepartureTime
              : searchTime,
            duration: 0,
            transitLines,
          })
        );
      jest.spyOn(logger, 'warn');
    });

    it("doesn't search for journeys between latest search time and latest journey time", async () => {
      const journeys = await fetchJourneys(BRIXTON_STATION.latLng, HOME.latLng);

      expect(logger.warn).not.toHaveBeenCalled();
      expect(journeys.length).toBeGreaterThan(2);

      const mockGetJourney = getJourneyModule.getJourney as jest.Mock<
        ReturnType<typeof getJourneyModule.getJourney>,
        Parameters<typeof getJourneyModule.getJourney>
      >;
      const searchedForJourneyAfterLatestSearchTime =
        mockGetJourney.mock.calls.some(
          ([, , departureTime]) => departureTime > latestSearchTime
        );
      expect(searchedForJourneyAfterLatestSearchTime).toBe(false);
    });
  });

  describe('when there are wait times between journeys', () => {
    const lateDepartureTime = new Date(
      latestSearchTime.getTime() - minutesToMilliseconds(1)
    );
    beforeEach(() => {
      jest
        .spyOn(getJourneyModule, 'getJourney')
        .mockImplementation(
          async (originLatLng, destinationLatLng, searchTime) => ({
            departureTime:
              isSameTime(searchTime, earliestSearchTime) ||
              isSameTime(searchTime, latestSearchTime)
                ? searchTime
                : lateDepartureTime,
            duration: 0,
            transitLines,
          })
        );
    });

    it("doesn't make duplicate journey requests (i.e. it doesn't search in wait times we've already identified)", async () => {
      const journeys = await fetchJourneys(BRIXTON_STATION.latLng, HOME.latLng);

      expect(getJourneyModule.getJourney).toBeCalledTimes(journeys.length);
    });
  });
});
