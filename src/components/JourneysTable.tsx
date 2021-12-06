import React from 'react';
import { Journey } from '../pages';

const savings = (journeys: Journey[]) =>
  journeys.map(
    ({ timeSavedComparedToNextJourney }) => timeSavedComparedToNextJourney
  );

const maxSaving = (journeys: Journey[]) => Math.max(...savings(journeys));

const minSaving = (journeys: Journey[]) => Math.min(...savings(journeys));

const range = (journeys: Journey[]) =>
  maxSaving(journeys) - minSaving(journeys);

const normalise = (
  timeSavedComparedToNextJourney: number,
  journeys: Journey[]
) => {
  const almostNormalisedSaving =
    (timeSavedComparedToNextJourney + Math.abs(minSaving(journeys))) /
    range(journeys);
  const normalisedSaving =
    almostNormalisedSaving === 0 ? 0.1 : almostNormalisedSaving;
  return normalisedSaving;
};

type TableProps = {
  journeys: Journey[];
};

const JourneysTable: React.VFC<TableProps> = ({ journeys }: TableProps) => (
  <div className="container px-2 py-2 mx-auto">
    <div className="py-2">
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
                Rank
              </th>
            </tr>
          </thead>
          <tbody>
            {journeys.map(
              ({
                departureTime,
                duration,
                timeSavedComparedToNextJourney,
                rank,
              }) => (
                <tr
                  key={departureTime}
                  className={`text-gray-${
                    Math.round(
                      normalise(timeSavedComparedToNextJourney, journeys) * 10
                    ) * 100
                  } text-center uppercase text-xs font-semibold tracking-wider bg-white border-b-2 border-gray-200`}
                >
                  <th className="w-1/4 px-2 py-3 ">{departureTime}</th>
                  <th className="w-1/4 px-2 py-3 ">{duration?.text}</th>
                  <th className="w-1/4 px-2 py-3 ">
                    {`${Math.round(timeSavedComparedToNextJourney / 60)} mins`}
                  </th>
                  <th className="w-1/4 px-2 py-3 ">{rank}</th>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default JourneysTable;
