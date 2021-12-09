type Journey = {
  departureTime: string;
  duration: google.maps.Duration | undefined;
  timeSavedComparedToNextJourney: number;
  transitLines: string[];
};

export default Journey;
