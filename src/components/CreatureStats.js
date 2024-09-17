// CreatureStats.js
import React from "react";
import { useStateContext } from "../GameContext";
import { applyRuneEffects } from "../utils.js/runeUtils";

function CreatureStats() {
  const state = useStateContext();

  return (
    <div className="bg-gray-800 p-4 rounded-lg mt-8">
      <h2 className="text-2xl font-bold mb-4">Creature Stats</h2>
      <div className="grid grid-cols-2 gap-4">
        {state.playerCreatures.map((creature, index) => {
          // Apply rune effects to get current stats
          const enhancedStats = applyRuneEffects(creature, state.runes);

          return (
            <div key={index}>
              <h3 className="text-xl font-bold">{creature.name}</h3>
              {Object.entries(enhancedStats).map(([stat, value]) => {
                const baseValue = creature[stat] || 0; // Use the base creature stat
                const runeContribution = value - baseValue;

                return (
                  <p key={stat} className="text-white">
                    <span className="text-blue-400">{`${stat}: ${value}`}</span>{" "}
                    <span className="text-gray-400">
                      (<span className="text-yellow-400">{baseValue}</span>{" "}
                      +{" "}
                      <span className="text-green-400">
                        {runeContribution > 0
                          ? `${runeContribution} (from runes)`
                          : "no runes"}
                      </span>
                      )
                    </span>
                  </p>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CreatureStats;
