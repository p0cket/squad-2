import React from 'react';
import { useGame } from './GameContext';

// Rune Shop component
function RuneShop() {
  const { state, dispatch } = useGame();

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Rune Shop</h2>
      <p className="mb-4">Gold: {state.gold}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.availableRunes.map(rune => (
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

// Owned Runes component
function OwnedRunes() {
  const { state, dispatch } = useGame();

  return (
    <div className="bg-gray-800 p-4 rounded-lg mt-8">
      <h2 className="text-2xl font-bold mb-4">Owned Runes</h2>
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
    </div>
  );
}

// Creature Stats component
function CreatureStats() {
  const { state } = useGame();

  // Calculate the current stats based on base stats and active runes
  const currentStats = Object.keys(state.baseStats).reduce((acc, stat) => {
    acc[stat] = state.baseStats[stat] + 
      state.runes.reduce((sum, rune) => 
        rune.statEffect.stat === stat ? sum + rune.statEffect.value : sum, 0);
    return acc;
  }, {});

  return (
    <div className="bg-gray-800 p-4 rounded-lg mt-8">
      <h2 className="text-2xl font-bold mb-4">Creature Stats</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-xl font-bold">Base Stats</h3>
          {Object.entries(state.baseStats).map(([stat, value]) => (
            <p key={stat}>{stat}: {value}</p>
          ))}
        </div>
        <div>
          <h3 className="text-xl font-bold">Current Stats</h3>
          {Object.entries(currentStats).map(([stat, value]) => (
            <p key={stat}>
              {stat}: {value} ({value > state.baseStats[stat] ? '+' : ''}{value - state.baseStats[stat]})
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main RuneManagementSystem component
function RuneManagementSystem() {
  return (
    <div>
      <RuneShop />
      <OwnedRunes />
      <CreatureStats />
    </div>
  );
}

export default RuneManagementSystem;
