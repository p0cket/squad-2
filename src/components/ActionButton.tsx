// ActionButton.js
import React from 'react';

type ActionButtonProps = {
  onClick: () => void; //<HTMLButtonElement>
  children: React.ReactNode;
  disabled?: boolean;
};

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, children, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {children}
  </button>
);

export default ActionButton;
