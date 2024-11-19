import React from "react";

export default function AttackDetails({ attack }) {
  if (!attack) return null;

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg shadow-md w-full max-w-full">
      <h2 className="text-xl font-bold mb-2 flex items-center">
        {attack.icon} <span className="ml-2">{attack.name}</span>
      </h2>
      <p className="text-sm italic text-gray-400 mb-4">{attack.notes}</p>

      <div className="space-y-2">
        {/* Attack Details */}
        <div className="flex justify-between">
          <span className="font-semibold">Type:</span>
          <span>{attack.attackType}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Damage:</span>
          <span>{attack.damage}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Chance to Land:</span>
          <span>{(attack.chanceToLand * 100).toFixed(0)}%</span>
        </div>

        {/* Effects */}
        {attack.effects && attack.effects.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold">Effects:</h3>
            <ul className="list-disc list-inside ml-4 space-y-1">
              {attack.effects.map((effect, index) => (
                <li key={index}>
                  <div className="flex justify-between">
                    <span>{effect.name}</span>
                    <span className="italic text-gray-400">
                      {effect.effectChance * 100}% chance
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">{effect.notes}</div>
                  <div className="text-sm text-gray-400">
                    Duration: {effect.durationRange}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
