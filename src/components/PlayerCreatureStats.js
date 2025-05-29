// PlayerCreatureStats.js - Squad overview component
import React from "react";
import { useStateContext } from "../GameContext";
import CreatureStats from "./CreatureStats";

function PlayerCreatureStats() {
  const state = useStateContext();
  const { playerCreatures, runes } = state;

  return (
    <div 
      className="p-6 rounded-xl mt-1 border border-gray-600 shadow-xl"
      style={{
        background: "linear-gradient(135deg, #374151 0%, #1f2937 50%, #111827 100%)"
      }}
    >
      <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        Squad Overview
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {playerCreatures.map((creature, index) => (
          <CreatureStats
            key={creature.ID || index}
            creature={creature}
            position={index}
            runes={runes}
          />
        ))}
      </div>
    </div>
  );
}

export default PlayerCreatureStats;
