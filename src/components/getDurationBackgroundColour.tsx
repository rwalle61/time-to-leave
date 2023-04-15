import Journey from '../domain/Journey';

const minRangeColours = ['bg-green-50', 'bg-red-50'];
const midRangeColours = ['bg-green-100', ...minRangeColours, 'bg-red-100'];
const maxRangeColours = ['bg-green-200', ...midRangeColours, 'bg-red-200'];

const getDurationColours = (range: number): string[] => {
  if (range < 15 * 60000) {
    return minRangeColours;
  }
  if (range < 25 * 60000) {
    return midRangeColours;
  }
  return maxRangeColours;
};

export const getDurationBackgroundColour = (
  journeys: Journey[],
  duration: number
): string => {
  const durations = journeys.map((journey) => journey.duration);

  const shortestDuration = Math.min(...durations);
  const longestDuration = Math.max(...durations);

  const range = longestDuration - shortestDuration;
  const normalisedDuration = (duration - shortestDuration) / range;

  const durationColours = getDurationColours(range);
  const index = Math.round(normalisedDuration * (durationColours.length - 1));

  return durationColours[index];
};
