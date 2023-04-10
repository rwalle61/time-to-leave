import React from 'react';
import 'reactjs-popup/dist/index.css';
import { JourneyWithSteps } from '../domain/Journey';
import { MILLISECONDS_PER_MINUTE } from '../services/time.utils';

type Props = {
  journeys: JourneyWithSteps[];
};

const JourneysWithStepsTable: React.VFC<Props> = ({ journeys }: Props) => (
  <div className="px-1 py-2">
    <div className="inline-block min-w-full overflow-hidden rounded-lg shadow">
      <table className="min-w-full leading-normal">
        <thead>
          <tr>
            <th className="w-1/3 px-2 py-3 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
              Depart
            </th>
            <th className="w-1/3 px-2 py-3 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
              Arrive
            </th>
            <th className="w-1/3 px-2 py-3 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
              Duration
            </th>
          </tr>
        </thead>
        <tbody>
          {journeys.map(({ departureTime, arrivalTime, duration }) => (
            <tr
              key={departureTime.getTime()}
              className={`text-gray-600 text-center uppercase text-xs font-semibold tracking-wider bg-white border-b-2 border-gray-200`}
            >
              <th className="w-1/3 px-2 py-3 ">
                {departureTime.toLocaleDateString('en-GB', {
                  weekday: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </th>
              <th className="w-1/3 px-2 py-3 ">
                {arrivalTime.toLocaleDateString('en-GB', {
                  weekday: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </th>
              <th className="w-1/3 px-2 py-3 ">
                {Math.round(duration / MILLISECONDS_PER_MINUTE)} mins
              </th>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default JourneysWithStepsTable;
