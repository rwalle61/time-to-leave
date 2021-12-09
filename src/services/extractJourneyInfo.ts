import mockGoogleResponses from './mockGoogleResponses';

export const extractJourneyInfo = (
  responses: google.maps.DirectionsResult[] | typeof mockGoogleResponses
) => {
  const journeys = responses.map((response) => {
    // "A route with no waypoints will contain exactly one DirectionsLeg"
    const recommendedJourney = response.routes[0].legs[0];

    const journeyDuration = recommendedJourney.duration;

    const departureTime = new Date(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      recommendedJourney.departure_time!.value
    );
    const departureTimeString = departureTime.toLocaleDateString('en-GB', {
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    const journey = {
      departureTime: departureTimeString,
      duration: journeyDuration,
      // TODO
      // `warnings[]` contains an array of warnings to be displayed when showing these directions. If you do not use the provided DirectionsRenderer object, you must handle and display these warnings yourself.
      // `fare` contains the total fare (that is, the total ticket costs) on this route. This property is only returned for transit requests and only for routes where fare information is available for all transit legs
    };
    return journey;
  });

  const uniqueJourneys = journeys.filter(
    (journey, index) =>
      journeys.findIndex(
        ({ departureTime }) => departureTime === journey.departureTime
      ) === index
  );

  const journeysWithDeltas = uniqueJourneys.map((journeyInfo, i) => {
    const nextJourney =
      uniqueJourneys[i === uniqueJourneys.length - 1 ? i : i + 1];
    if (!journeyInfo.duration || !nextJourney.duration) {
      return {
        ...journeyInfo,
        // TODO handle when "duration" doesn't exist
        timeSavedComparedToNextJourney: NaN,
      };
    }
    const timeSavedComparedToNextJourney =
      nextJourney.duration.value - journeyInfo.duration.value;
    return {
      ...journeyInfo,
      timeSavedComparedToNextJourney,
    };
  });

  const journeysSortedByRank = [...journeysWithDeltas].sort(
    (journeyA, journeyB) =>
      journeyB.timeSavedComparedToNextJourney -
      journeyA.timeSavedComparedToNextJourney
  );

  const journeysWithRanks = journeysWithDeltas.map((journey) => {
    const rank = journeysSortedByRank.findIndex(
      ({ departureTime }) => departureTime === journey.departureTime
    );
    return {
      ...journey,
      rank: rank + 1,
    };
  });

  return journeysWithRanks;
};
