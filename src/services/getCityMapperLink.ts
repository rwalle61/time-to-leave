import Location from '../domain/Location';

// See https://citymapper.com/news/2386/launch-citymapper-for-directions
const getCityMapperLink = (origin: Location, destination: Location): string => {
  const queryParams = new URLSearchParams({
    startcoord: `${origin.latLng?.lat},${origin.latLng?.lng}`,
    startname: origin.name,
    endcoord: `${destination.latLng?.lat},${destination.latLng?.lng}`,
    endname: destination.name,
  });

  return `https://citymapper.com/directions?${queryParams.toString()}`;
};
export default getCityMapperLink;
