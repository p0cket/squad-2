import React, { useEffect, useState } from 'react';

// Import your level generator function
import { generateLevels } from '../../utils.js/levelGeneratorUtils';

// Define the Levels component
const Levels = ({ numLevels }) => {
  const [levels, setLevels] = useState([]);

  // Generate levels on component mount
  useEffect(() => {
    const generatedLevels = generateLevels(numLevels);
    setLevels(generatedLevels);
  }, [numLevels]);

  return (
    <div className="levels-container">
      <h1 className="text-3xl font-bold mb-8">Generated Levels</h1>
      {levels.map((level, index) => (
        <div key={index} className="level-card p-4 mb-6 border border-gray-200 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Level {level.levelNumber}</h2>

          <div className="opponent-creatures mb-4 flex flex-row">
            {level.opponentCreatures.map((creature, idx) => (
              <div key={idx} className="creature mb-2 mr-4 flex flex-col">
                <p><strong>Name:</strong> {creature.name}</p>
                <p><strong>Health:</strong> {creature.health}</p>
                <p><strong>Attack:</strong> {creature.attack}</p>
                <p><strong>Defence:</strong> {creature.defence}</p>
                <p><strong>Mods:</strong></p>
                <ul className="ml-4">
                  {creature.mods.map((mod, modIdx) => (
                    <li key={modIdx}>
                      {mod.name} (Type: {mod.type}, Duration: {mod.duration})
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="opponent-runes mb-4">
            <h3 className="text-xl font-bold mb-2">Opponent Runes:</h3>
            <ul>
              {level.opponentRunes.map((rune, runeIdx) => (
                <li key={runeIdx}>
                  <p><strong>{rune.name}</strong> - {rune.effect}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="level-effects mb-4">
            <h3 className="text-xl font-bold mb-2">Level Effects:</h3>
            <ul>
              {level.levelEffects.map((effect, effectIdx) => (
                <li key={effectIdx}>
                  <p><strong>{effect.name}</strong> - {effect.effect}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Levels;

