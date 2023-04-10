import React from 'react';
import 'reactjs-popup/dist/index.css';
import { Step } from '../domain/Journey';

type Props = {
  steps: Step[];
};

const StepsTable: React.VFC<Props> = ({ steps }: Props) => (
  <div className="px-1 py-2">
    <div className="inline-block min-w-full overflow-hidden rounded-lg shadow">
      <table className="min-w-full leading-normal">
        <thead>
          <tr>
            <th className="w-1/4 px-2 py-3 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
              Depart
            </th>
            <th className="w-1/4 px-2 py-3 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
              Arrive
            </th>
            <th className="w-1/4 px-2 py-3 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
              Duration
            </th>
            <th className="w-1/4 px-2 py-3 text-xs font-semibold tracking-wider text-center text-gray-600 uppercase bg-gray-100 border-b-2 border-gray-200">
              Method
            </th>
          </tr>
        </thead>
        <tbody>
          {steps.map((step) => (
            <tr
              key={step.departureTime.getTime()}
              className={`text-gray-600 text-center uppercase text-xs font-semibold tracking-wider bg-white border-b-2 border-gray-200`}
            >
              <th className="w-1/4 px-2 py-3 ">
                <p>
                  {step.departureTime.toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p>{step.origin.name}</p>
              </th>
              <th className="w-1/4 px-2 py-3 ">
                <p>
                  {step.arrivalTime.toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p>{step.destination.name}</p>
              </th>
              <th className="w-1/4 px-2 py-3 ">
                {Math.round(step.duration / 60_000)} mins
              </th>
              <th className="w-1/4 px-2 py-3 ">{step.method}</th>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default StepsTable;
