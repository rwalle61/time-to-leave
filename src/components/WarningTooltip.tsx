import React from 'react';
import Popup from 'reactjs-popup';

type Props = {
  warnings: string[];
};

const WarningTooltip: React.VFC<Props> = ({ warnings }: Props) => (
  <Popup
    trigger={<button type="button">⚠️</button>}
    position="left center"
    on={['hover', 'focus']}
  >
    <div className="space-y-2">
      {warnings.map((warning) => (
        <p key={warning} className="text-sm text-red-500">
          {warning}
        </p>
      ))}
    </div>
  </Popup>
);

export default WarningTooltip;
