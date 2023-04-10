import Location from './Location';

type Journey = {
  departureTime: Date;
  duration: number;
  transitLines: string[];
  warnings: string[];
};

export type Step = {
  departureTime: Date;
  arrivalTime: Date;
  duration: number;
  method: string;
  origin: Location;
  destination: Location;
};

export type JourneyWithSteps = {
  departureTime: Date;
  arrivalTime: Date;
  duration: number;
  distance: number;
  origin: Location;
  destination: Location;
  warnings: string[];
  steps: Step[];
};

export default Journey;
