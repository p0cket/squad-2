import React from "react";
import { Attack, Effect } from "../../consts/types/types";
import { STATUS_EFFECTS } from "../../consts/statuses";

// Define color classes for each attack type
const typeColors: { [key: string]: string } = {
  Physical: "bg-gray-500 text-gray-100",
  Elemental: "bg-red-500 text-red-100",
  Support: "bg-green-500 text-green-100",
  Ranged: "bg-blue-500 text-blue-100",
  Aura: "bg-yellow-500 text-yellow-100",
  Environmental: "bg-emerald-500 text-emerald-100",
  Special: "bg-purple-500 text-purple-100",
  Combo: "bg-orange-500 text-orange-100",
  Stealth: "bg-indigo-500 text-indigo-100",
};

/**
 * Displays the details of an attack.
 *
 * @param attack - The attack object of type Attack.
 */
const AttackDetails: React.FC<{ attack: Attack }> = ({ attack }) => {
  if (!attack) return null;

  return (
    <div className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 border-2 border-gray-600 rounded-xl overflow-hidden shadow-2xl text-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-600 p-4 border-b border-gray-500">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="text-3xl mr-3 drop-shadow-lg">{attack.icon}</div>
            <h2 className="text-2xl font-bold text-white">{attack.name}</h2>
          </div>
          <span
            className={`${
              typeColors[attack.attackType] || "bg-gray-500 text-gray-100"
            } px-3 py-1 text-sm rounded-full font-semibold shadow-md`}
          >
            {attack.attackType}
          </span>
        </div>
        {attack.notes && (
          <div className="bg-blue-600/20 rounded-lg px-3 py-2 border border-blue-500/30 mt-2">
            <div className="flex items-start">
              <span className="text-blue-300 font-medium flex items-center mr-2">
                📝 Description
              </span>
            </div>
            <p className="text-blue-100 text-sm leading-relaxed mt-1">
              {attack.notes}
            </p>
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="p-4 space-y-3">
        {/* Damage */}
        <div className="flex items-center justify-between bg-red-600/20 rounded-lg px-3 py-2 border border-red-500/30">
          <span className="text-red-300 font-medium flex items-center">
            ⚔️ Damage
          </span>
          <span className="text-red-100 font-bold text-lg">{attack.damage || 0}</span>
        </div>
        
        {/* Hit Chance */}
        <div className="flex items-center justify-between bg-green-600/20 rounded-lg px-3 py-2 border border-green-500/30">
          <span className="text-green-300 font-medium flex items-center">
            🎯 Hit Chance
          </span>
          <span className="text-green-100 font-bold text-lg">
            {Math.round((attack.chanceToLand || 0) * 100)}%
          </span>
        </div>

        {/* Cooldown */}
        {attack.cooldown !== undefined && (
          <div className="flex items-center justify-between bg-purple-600/20 rounded-lg px-3 py-2 border border-purple-500/30">
            <span className="text-purple-300 font-medium flex items-center">
              ⏱️ Cooldown
            </span>
            <span className="text-purple-100 font-bold text-lg">{attack.cooldown}s</span>
          </div>
        )}

        {/* Special Abilities Section */}
        {(attack.trueDamage > 0 || attack.attackType !== "Physical" || attack.chanceToLand < 1) && (
          <div className="mt-4">
            <div className="bg-cyan-600/20 rounded-lg border border-cyan-500/30 overflow-hidden">
              <div className="bg-cyan-600/30 px-3 py-2 border-b border-cyan-500/30">
                <h3 className="text-cyan-200 font-semibold flex items-center">
                  ⚡ Special Abilities
                </h3>
              </div>
              <div className="p-3 space-y-2">
                {attack.trueDamage > 0 && (
                  <div className="flex items-center justify-between bg-gray-700/50 rounded px-2 py-1">
                    <span className="text-cyan-200 text-sm">🔥 True Damage</span>
                    <span className="text-cyan-100 font-medium">{attack.trueDamage}</span>
                  </div>
                )}
                
                {attack.attackType !== "Physical" && (
                  <div className="flex items-center justify-between bg-gray-700/50 rounded px-2 py-1">
                    <span className="text-cyan-200 text-sm">✨ Magical Attack</span>
                    <span className="text-cyan-100 font-medium">Bypasses armor</span>
                  </div>
                )}
                
                {attack.chanceToLand < 1 && attack.chanceToLand >= 0.9 && (
                  <div className="flex items-center justify-between bg-gray-700/50 rounded px-2 py-1">
                    <span className="text-cyan-200 text-sm">🎯 High Precision</span>
                    <span className="text-cyan-100 font-medium">Reliable hit</span>
                  </div>
                )}
                
                {attack.chanceToLand < 0.9 && attack.chanceToLand >= 0.7 && (
                  <div className="flex items-center justify-between bg-gray-700/50 rounded px-2 py-1">
                    <span className="text-cyan-200 text-sm">⚠️ Risky Attack</span>
                    <span className="text-cyan-100 font-medium">May miss</span>
                  </div>
                )}
                
                {attack.chanceToLand < 0.7 && (
                  <div className="flex items-center justify-between bg-gray-700/50 rounded px-2 py-1">
                    <span className="text-cyan-200 text-sm">💀 High Risk</span>
                    <span className="text-cyan-100 font-medium">Often misses</span>
                  </div>
                )}
                
                {attack.damage >= 20 && (
                  <div className="flex items-center justify-between bg-gray-700/50 rounded px-2 py-1">
                    <span className="text-cyan-200 text-sm">💥 Devastating</span>
                    <span className="text-cyan-100 font-medium">High damage</span>
                  </div>
                )}
                
                {attack.cooldown >= 5 && (
                  <div className="flex items-center justify-between bg-gray-700/50 rounded px-2 py-1">
                    <span className="text-cyan-200 text-sm">⏳ Ultimate Attack</span>
                    <span className="text-cyan-100 font-medium">Long cooldown</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Effects Section */}
        {attack.effects && attack.effects.length > 0 && (
          <div className="mt-6">
            <div className="bg-yellow-600/20 rounded-lg border border-yellow-500/30 overflow-hidden">
              <div className="bg-yellow-600/30 px-3 py-2 border-b border-yellow-500/30">
                <h3 className="text-yellow-200 font-semibold flex items-center">
                  ✨ Status Effects
                </h3>
              </div>
              <div className="p-3 space-y-3">
                {attack.effects.map((effectKey: string, index) => {
                  const statusEffect = STATUS_EFFECTS[effectKey];
                  if (!statusEffect) return null;
                  
                  return (
                    <div key={index} className="bg-gray-700/50 rounded-lg p-3 border border-gray-600/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-yellow-200 font-medium">
                          {statusEffect.name}
                        </span>
                        <span className="text-yellow-300 text-sm bg-yellow-600/20 px-2 py-1 rounded">
                          {Math.round((statusEffect.chance || 0) * 100)}% chance
                        </span>
                      </div>
                      {statusEffect.notes && (
                        <p className="text-gray-300 text-sm mb-2 leading-relaxed">
                          {statusEffect.notes}
                        </p>
                      )}
                      <div className="text-gray-400 text-xs">
                        <span className="bg-gray-600/50 px-2 py-1 rounded">
                          Duration: {statusEffect.duration}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Decorative Border */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 pointer-events-none" />
    </div>
  );
};

export default AttackDetails;
