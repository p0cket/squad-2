// OwnedRunes.js
import React from "react"
import { useDispatchContext, useStateContext } from "../GameContext"


function OwnedRunes() {
  const state = useStateContext();
  const dispatch = useDispatchContext();

  return (
    <div className="bg-gray-800 p-4 rounded-lg mt-8">
      <h2 className="text-2xl font-bold mb-4">Owned Runes</h2>
      {state.runes.length === 0 ? (
        <p>You don't own any runes yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.runes.map((rune, index) => (
            <div key={index} className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-xl font-bold">{rune.name}</h3>
              <p className="text-sm mb-2">{rune.type}</p>
              <p className="mb-2">{rune.effect}</p>
              <button
                onClick={() => dispatch({ type: 'SELL_RUNE', rune, index })}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                Sell
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OwnedRunes;
