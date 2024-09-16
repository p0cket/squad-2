// CreatureStats.js
import React from 'react';
import { useStateContext } from '../GameContext';

function CreatureStats() {
  const state = useStateContext();
  const currentStats = Object.fromEntries(
    Object.entries(state.baseStats).map(([stat, baseValue]) => {
      const value = baseValue + state.runes.reduce(
        (sum, rune) => (rune.statEffect.stat === stat ? sum + rune.statEffect.value : sum),
        0
      );
      return [stat, value];
    })
  );

  return (
    <div className="bg-gray-800 p-4 rounded-lg mt-8">
      <h2 className="text-2xl font-bold mb-4">Creature Stats</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          {Object.entries(state.baseStats).map(([stat, value]) => (
            <p key={stat}>{`${stat}: ${value}`}</p>
          ))}
        </div>
        <div>
          {Object.entries(currentStats).map(([stat, value]) => (
            <p key={stat}>{`${stat}: ${value} (${value > state.baseStats[stat] ? '+' : ''}${value - state.baseStats[stat]})`}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CreatureStats;

