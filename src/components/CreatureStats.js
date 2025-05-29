// CreatureStats.js - Individual creature stats display component
import React from "react";
import { applyRuneEffects } from "../utils/runeUtils";
import { CREATURES } from "../consts/creatures";
import AttacksDisplay from "./AttacksDisplay";

function CreatureStats({ creature, position, runes = [] }) {
  // Get the base creature data using the template
  const baseCreature = CREATURES[creature.template];
  // Apply rune effects to the base creature to get current stats
  const enhancedStats = applyRuneEffects(baseCreature, runes);

  return (
    <div 
      className="p-4 rounded-lg border border-gray-600 transition-all duration-300 hover:border-gray-500 hover:shadow-lg hover:shadow-blue-500/20"
      style={{
        background: "linear-gradient(135deg, #4b5563 0%, #374151 50%, #1f2937 100%)"
      }}
    >
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-600">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">{creature.icon}</span>
          <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            {creature.name}
          </span>
        </h3>
        {position !== undefined && (
          <div className="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded">
            Position {position + 1}
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {Object.entries(enhancedStats).map(([stat, value]) => {
          if (stat === "startingAttacks" || stat === "possibleAttacks") {
            return (
              <div key={stat} className="bg-gray-800 p-3 rounded-lg">
                <div className="text-blue-300 font-medium capitalize mb-2">
                  {stat.replace(/([A-Z])/g, ' $1').trim()}:
                </div>
                <AttacksDisplay attacks={value} />
              </div>
            );
          }
          
          const baseValue = baseCreature[stat] || 0;
          const runeContribution = value - baseValue;
          
          return (
            <div key={stat} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
              <span className="text-blue-300 font-medium capitalize">
                {stat.replace(/([A-Z])/g, ' $1').trim()}:
              </span>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-lg">{value}</span>
                {runeContribution > 0 && (
                  <div className="text-sm">
                    <span className="text-yellow-400">({baseValue}</span>
                    <span className="text-green-400"> +{runeContribution})</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CreatureStats;
