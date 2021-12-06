import React from 'react';

export const Input = ({
  value, onChange,
}: {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}) => <input value={value} onChange={onChange} className="italic" />;
