// Level Generator Configurations

import { CREATURES } from "../consts/creatures";
import { BASE_RUNES } from "../consts/items";
import { auras, buffs, debuffs } from "../consts/mods";

// Combine auras, buffs, and debuffs into availableMods
export const availableMods = [
  ...Object.values(auras),
  ...Object.values(buffs),
  ...Object.values(debuffs),
];

// Function to scale stats based on level
const scaleStat = (baseValue, level, scaleFactor = 1.05) => {
  return Math.floor(baseValue * Math.pow(scaleFactor, level));
};

// Level Generator Function with Thematic Mods
const levelEffects = [
  { name: "Double Damage", effect: "All damage is doubled" },
  { name: "No Healing", effect: "Healing is disabled" },
];

// Level Generator Function using the central `creatures` object
export const generateLevels = (numLevels) => {
  const levels = [];

  for (let i = 1; i <= numLevels; i++) {
    console.group(`Generating Level ${i}`);

    const numberOfCreatures = Math.floor(Math.random() * 10) + 1; // 1 to 10 creatures per level
    console.log(`Number of opponent creatures: ${numberOfCreatures}`);
    const opponentCreatures = [];

    for (let j = 0; j < numberOfCreatures; j++) {
      console.group(`Configuring Creature ${j + 1}`);

      // Randomly select a creature from the `creatures` object
      const creatureKeys = Object.keys(CREATURES); // ["dragon", "unicorn", "alien", "fish"]
      const randomCreatureKey = creatureKeys[Math.floor(Math.random() * creatureKeys.length)];
      const randomCreature = structuredClone(CREATURES[randomCreatureKey]); // Deep copy the selected creature using structuredClone

      console.log(`Selected creature: ${randomCreatureKey}`);

      // Scale creature stats based on level (exponential scaling)
      randomCreature.health = scaleStat(randomCreature.health, i);
      randomCreature.attack = scaleStat(randomCreature.attack, i);
      randomCreature.defence = scaleStat(randomCreature.defence, i);

      console.log(`Scaled stats - Health: ${randomCreature.health}, Attack: ${randomCreature.attack}, Defence: ${randomCreature.defence}`);

      // Apply thematic mods to creatures (auras, buffs, debuffs)
      const randomAura = Object.values(auras)[Math.floor(Math.random() * Object.values(auras).length)];
      const randomBuff = Object.values(buffs)[Math.floor(Math.random() * Object.values(buffs).length)];
      const randomDebuff = Object.values(debuffs)[Math.floor(Math.random() * Object.values(debuffs).length)];

      randomCreature.mods = [randomAura, randomBuff, randomDebuff]; // Assign random mods

      console.log(`Assigned mods: Aura - ${randomAura?.name}, Buff - ${randomBuff?.name}, Debuff - ${randomDebuff?.name}`);

      opponentCreatures.push(randomCreature); // Add the configured creature to the opponent list
      console.groupEnd();
    }

    // Scale the number of runes and mods based on level difficulty
    console.group("Assigning Runes and Level Effects");
    const randomRunes = BASE_RUNES.slice(0, Math.floor(Math.random() * BASE_RUNES.length) + 1);
    console.log(`Assigned runes: ${randomRunes.map((rune) => rune.name).join(", ")}`);

    const randomLevelEffects = levelEffects.slice(0, Math.floor(Math.random() * levelEffects.length) + 1);
    console.log(`Level effects: ${randomLevelEffects.map((effect) => effect.name).join(", ")}`);
    console.groupEnd();

    // Push level details to the `levels` array
    levels.push({
      levelNumber: i,
      opponentCreatures,
      opponentRunes: randomRunes,
      levelEffects: randomLevelEffects,
    });
    console.groupEnd();
  }
  console.log("Level generation complete.");
  return levels;
};

// Generate 10 Levels with Scaling
// const levels = generateLevels(10);
// console.log(levels);

export const loadLevelData = (levelNumber) => {
  console.group(`Loading data for Level ${levelNumber}`);
  const allLevels = generateLevels(10); // Generates 10 levels; adjust if needed
  const levelData = allLevels.find((level) => level.levelNumber === levelNumber);
  console.log(`Loaded Level ${levelNumber}:`, levelData);
  console.groupEnd();
  return levelData;
};