import Journey from '../domain/Journey';

const getGoogleResponse = async (
  originLatLng: google.maps.LatLngLiteral,
  destinationLatLng: google.maps.LatLngLiteral,
  searchTime: Date
) => {
  const directionsService = new google.maps.DirectionsService();
  const travelMode = google.maps.TravelMode.TRANSIT;
  const request: google.maps.DirectionsRequest = {
    origin: originLatLng,
    destination: destinationLatLng,
    travelMode,
    drivingOptions: {
      departureTime: searchTime,
    },
    transitOptions: {
      departureTime: searchTime,
    },
  };
  const response = await directionsService.route(request);
  return response;
};

const getTransitLines = ({ steps }: google.maps.DirectionsLeg) =>
  steps
    .filter(({ transit }) => transit)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .map(({ transit }) => transit!.line.short_name || transit!.line.name);

const extractJourney = (response: google.maps.DirectionsResult): Journey => {
  // "A route with no waypoints will contain exactly one DirectionsLeg"
  const recommendedJourney = response.routes[0].legs[0];

  const journey: Journey = {
    departureTime:
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      recommendedJourney.departure_time!.value,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    duration: recommendedJourney.duration!.value * 1000,
    transitLines: getTransitLines(recommendedJourney),
  };
  return journey;
};

export const getJourney = async (
  originLatLng: google.maps.LatLngLiteral,
  destinationLatLng: google.maps.LatLngLiteral,
  searchTime: Date
) => {
  const response = await getGoogleResponse(
    originLatLng,
    destinationLatLng,
    searchTime
  );
  const journey = extractJourney(response);
  return journey;
};
