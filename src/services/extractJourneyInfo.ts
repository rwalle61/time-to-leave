import mockGoogleResponses from './mockGoogleResponses';

export const extractJourneyInfo = (
  responses: google.maps.DirectionsResult[] | typeof mockGoogleResponses
) => {
  const journeys = responses.map((response) => {
    const recommendedRoute = response.routes[0];

    // "A route with no waypoints will contain exactly one DirectionsLeg"
    const journeyDuration = recommendedRoute.legs[0].duration;

    const departureTime = new Date(
      (response as any).request.transitOptions.departureTime
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

  const journeysWithDeltas = journeys.map((journeyInfo, i) => {
    const nextJourney = journeys[i === journeys.length - 1 ? i : i + 1];
    if (!journeyInfo.duration || !nextJourney.duration) {
      return {
        ...journeyInfo,
        // TODO handle when "duration" doesn't exist
        savingComparedToNextJourney: NaN,
      };
    }
    const savingComparedToNextJourney =
      nextJourney.duration.value - journeyInfo.duration.value;
    return {
      ...journeyInfo,
      savingComparedToNextJourney,
    };
  });

  const journeysSortedByRank = [...journeysWithDeltas].sort(
    (journeyA, journeyB) =>
      journeyB.savingComparedToNextJourney -
      journeyA.savingComparedToNextJourney
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
