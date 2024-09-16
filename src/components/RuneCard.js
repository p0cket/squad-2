// RuneCard.js
import React from 'react';

function RuneCard({ rune, onAction, actionLabel, isShop, disabled }) {
  return (
    <div className="bg-gray-700 p-4 rounded-lg relative">
      <h3 className="text-xl font-bold">{rune.name}</h3>
      <p className="text-sm mb-2">{rune.type}</p>
      <p className="mb-2">{rune.effect}</p>
      {isShop && <p className="absolute top-2 right-2 text-sm font-bold">Cost: {rune.cost} gold</p>}
      {/* <p className="mb-2">Owned: {rune.count}</p> */}
      <button
        onClick={onAction}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors mt-2"
        disabled={disabled}
      >
        {actionLabel}
      </button>
    </div>
  );
}

export default RuneCard;
