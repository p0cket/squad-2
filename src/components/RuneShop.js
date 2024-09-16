// RuneShop.js
import React from 'react';
import { useDispatchContext, useStateContext } from '../GameContext';

function RuneShop() {
  const state = useStateContext();
  const dispatch = useDispatchContext();

  return (
    <div className="bg-gray-800 p-4 rounded-lg mt-8">
      <h2 className="text-2xl font-bold mb-4">Rune Shop</h2>
      <p className="mb-4">Gold: {state.gold}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.availableRunes.map((rune) => (
          <div key={rune.id} className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-xl font-bold">{rune.name}</h3>
            <p className="text-sm mb-2">{rune.type}</p>
            <p className="mb-2">{rune.effect}</p>
            <p className="mb-2">Cost: {rune.cost} gold</p>
            <p className="mb-2">Owned: {rune.count}</p>
            <button
              onClick={() => dispatch({ type: 'BUY_RUNE', rune })}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              disabled={state.gold < rune.cost}
            >
              Buy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RuneShop;
