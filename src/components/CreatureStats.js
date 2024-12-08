// CreatureStats.js
import React from "react";
import { useStateContext } from "../GameContext";
import { applyRuneEffects } from "../utils/runeUtils";
import { CREATURES } from "../consts/creatures";
import AttacksDisplay from "./AttacksDisplay";

function CreatureStats() {
  const state = useStateContext();
  const { playerCreatures } = state;
  // remove elements values if the values are empty, additionally optionally
  // if theres a second parameter, remove the elements that have those keys
  // return the rest of the elements
  // const removeValues = (obj, values) => {
  //   return Object.fromEntries(
  //     Object.entries(obj).filter(
  //       ([key, value]) => !values.includes(key) && !values.includes(value)
  //     )
  //   );
  // };
  return (
    <div className="bg-gray-800 p-4 rounded-lg mt-1">
      {/* <h2 className="text-2xl font-bold mb-2">Creature Stats</h2> */}
      <div className="grid grid-cols-2 gap-4">
        {playerCreatures.map((creature, index) => {
          // Get the base creature data using the template
          const baseCreature = CREATURES[creature.template];
          // Apply rune effects to the base creature to get current stats
          const enhancedStats = applyRuneEffects(baseCreature, state.runes);
          // const filteredStats = removeValues(enhancedStats, [0, "", `icon`]);
            return (
            <div key={index}>
              <h3 className="text-xl font-bold">{`${creature.name} ${creature.icon}`}</h3>
              {Object.entries(enhancedStats).map(([stat, value]) => {
              if (stat === "startingAttacks" || stat === "possibleAttacks") {
                return <AttacksDisplay key={`${index}-${stat}`} attacks={value} />;
              }
              const baseValue = baseCreature[stat] || 0;
              const runeContribution = value - baseValue;
              return (
                <p key={`${index}-${stat}`} className="text-white">
                <span className="text-blue-400">{`${stat}: ${value}`}</span>{" "}
                <span className="text-gray-400">
                  {runeContribution > 0 && (
                  <span>
                    <span className="text-yellow-400">{baseValue}</span> +{" "}
                    <span className="text-green-400">
                    {runeContribution}
                    </span>
                  </span>
                  )}
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
