import React from 'react';
import 'reactjs-popup/dist/index.css';
import Journey from '../domain/Journey';
import { MILLISECONDS_PER_MINUTE } from '../services/time.utils';
import WarningTooltip from './WarningTooltip';

const getBackgroundColour = (minutesSavedComparedToNextJourney: number) => {
  if (minutesSavedComparedToNextJourney > 10) {
    return 'bg-green-300';
  }
  if (minutesSavedComparedToNextJourney < -10) {
    return 'bg-red-200';
  }
  return 'bg-white';
};

const journeysWithDeltas = (journeys: Journey[]) =>
  journeys.map((journeyInfo, i) => {
    const nextJourney = journeys[i === journeys.length - 1 ? i : i + 1];
    const minutesSavedComparedToNextJourney =
      (nextJourney.duration - journeyInfo.duration) / MILLISECONDS_PER_MINUTE;
    return {
      ...journeyInfo,
      minutesSavedComparedToNextJourney,
    };
  });

type Props = {
  journeys: Journey[];
};

const JourneysTable: React.VFC<Props> = ({ journeys }: Props) => (
  <div className="px-1 py-2">
    <div className="inline-block min-w-full overflow-hidden rounded-lg shadow">
      <table className="min-w-full leading-normal">
        <thead>
          <tr>
            <th className="w-1/4 px-2 py-3 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
              Leave at
            </th>
            <th className="w-1/4 px-2 py-3 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
              Duration
            </th>
            <th className="w-1/4 px-2 py-3 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
              Time Saved
            </th>
            <th className="w-1/4 px-2 py-3 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
              Transit Lines
            </th>
          </tr>
        </thead>
        <tbody>
          {journeysWithDeltas(journeys).map(
            ({
              departureTime,
              duration,
              minutesSavedComparedToNextJourney,
              transitLines,
              warnings,
            }) => (
              <tr
                key={departureTime.getTime()}
                className={`text-gray-600 text-center uppercase text-xs font-semibold tracking-wider ${getBackgroundColour(
                  minutesSavedComparedToNextJourney
                )} border-b-2 border-gray-200`}
              >
                <th className="w-1/4 px-2 py-3 ">
                  {departureTime.toLocaleDateString('en-GB', {
                    weekday: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </th>
                <th className="w-1/4 px-2 py-3 ">
                  {Math.round(duration / 60_000)} mins
                </th>
                <th className="w-1/4 px-2 py-3 ">
                  {Math.round(minutesSavedComparedToNextJourney)} mins
                </th>

                <th className="w-1/4 px-2 py-3 ">
                  {Boolean(warnings.length) && (
                    <WarningTooltip warnings={warnings} />
                  )}{' '}
                  {transitLines.join(', ')}
                </th>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default JourneysTable;
