import Location from '../domain/Location';

// See https://citymapper.com/news/2386/launch-citymapper-for-directions
const getCityMapperLink = (
  origin: Location | null,
  destination: Location | null
): string => {
  const queryParams = new URLSearchParams({
    ...(origin && {
      startcoord: `${origin.latLng?.lat},${origin.latLng?.lng}`,
      startname: origin.name,
    }),
    ...(destination && {
      endcoord: `${destination.latLng?.lat},${destination.latLng?.lng}`,
      endname: destination.name,
    }),
  });

  return `https://citymapper.com/directions?${queryParams.toString()}`;
};
export default getCityMapperLink;
