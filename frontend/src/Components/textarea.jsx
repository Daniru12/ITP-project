import React from 'react';

export const Textarea = ({ value, onChange, placeholder, className, rows, onInput }) => {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`resize-none border rounded-md p-2 bg-gray-700 text-white ${className}`}
      rows={rows}
      onInput={onInput}
    />
  );
};
