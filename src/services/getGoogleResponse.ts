export const getGoogleResponse = async (
  origin: google.maps.LatLngLiteral,
  destination: google.maps.LatLngLiteral,
  searchTime: Date
) => {
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
  const response = await directionsService.route(request);

  return response;
};
