import React from 'react';

export const Button = ({ onClick, children, className, disabled }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
