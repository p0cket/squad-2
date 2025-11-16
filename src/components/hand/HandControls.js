// HandControls Component
import React from 'react';

const HandControls = ({ handSize, setHandSize, dealCards }) => (
  <div className="mb-1">
    <label htmlFor="handSize" className="mr-2">Hand Size:</label>
    <input
      id="handSize"
      type="number"
      min="1"
      max="10"
      value={handSize}
      onChange={(e) => setHandSize(parseInt(e.target.value))}
      className="border rounded px-2 py-1 bg-gray-600 text-blue-400"
    />
    <button
      onClick={dealCards}
      className="ml-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
    >
      Deal Cards
    </button>
  </div>
);

export default HandControls;