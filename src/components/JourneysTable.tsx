import React from 'react';
import Journey from '../domain/Journey';

const toMinutes = (seconds: number) => Math.round(seconds / 60);

const getBackgroundColour = (timeSavedComparedToNextJourney: number) => {
  const minutesSaved = toMinutes(timeSavedComparedToNextJourney);
  if (minutesSaved > 10) {
    return 'bg-green-300';
  }
  if (minutesSaved < -10) {
    return 'bg-red-200';
  }
  return 'bg-white';
};

type TableProps = {
  journeys: Journey[];
};

const JourneysTable: React.VFC<TableProps> = ({ journeys }: TableProps) => (
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
          {journeys.map(
            ({
              departureTime,
              duration,
              timeSavedComparedToNextJourney,
              transitLines,
            }) => (
              <tr
                key={departureTime}
                className={`text-gray-600 text-center uppercase text-xs font-semibold tracking-wider ${getBackgroundColour(
                  timeSavedComparedToNextJourney
                )} border-b-2 border-gray-200`}
              >
                <th className="w-1/4 px-2 py-3 ">{departureTime}</th>
                <th className="w-1/4 px-2 py-3 ">{duration?.text}</th>
                <th className="w-1/4 px-2 py-3 ">
                  {`${toMinutes(timeSavedComparedToNextJourney)} mins`}
                </th>
                <th className="w-1/4 px-2 py-3 ">{transitLines.join(', ')}</th>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default JourneysTable;
