// Level Generator Configurations

import { CREATURES } from "../consts/creatures"
import { BASE_RUNES } from "../consts/items"
import { auras, buffs, debuffs } from "../consts/mods"

// const availableMods = [
//   { name: "Burn", type: "statusEffect", duration: 3, damagePerTurn: 5 },
//   { name: "Regeneration", type: "statusEffect", duration: 3, healPerTurn: 5 },
//   { name: "Stun", type: "statusEffect", duration: 2, preventsAttack: true },
// ]

// Combine auras, buffs, and debuffs into availableMods
export const availableMods = [
  ...Object.values(auras),
  ...Object.values(buffs),
  ...Object.values(debuffs),
]

// const scaleStat = (baseValue, level, scaleFactor = 1.05) => {
//   return Math.floor(baseValue * Math.pow(scaleFactor, level))
// }

// Make sure to export the generateLevels function
// Level Generator Function with Thematic Mods
const levelEffects = [
  { name: "Double Damage", effect: "All damage is doubled" },
  { name: "No Healing", effect: "Healing is disabled" },
]
const scaleStat = (baseValue, level, scaleFactor = 1.05) => {
  return Math.floor(baseValue * Math.pow(scaleFactor, level))
}

// Level Generator Function using the central `creatures` object
export const generateLevels = (numLevels) => {
  const levels = []

  for (let i = 1; i <= numLevels; i++) {
    const numberOfCreatures = Math.floor(Math.random() * 3) + 1 // 1 to 3 creatures per level
    const opponentCreatures = []

    for (let j = 0; j < numberOfCreatures; j++) {
      // Randomly select a creature from the `creatures` object
      const creatureKeys = Object.keys(CREATURES) // ["dragon", "unicorn", "alien", "fish"]
      const randomCreatureKey =
        creatureKeys[Math.floor(Math.random() * creatureKeys.length)]
      const randomCreature = { ...CREATURES[randomCreatureKey] } // Deep copy the selected creature

      // Scale creature stats based on level (exponential scaling)
      randomCreature.health = scaleStat(randomCreature.health, i)
      randomCreature.attack = scaleStat(randomCreature.attack, i)
      randomCreature.defence = scaleStat(randomCreature.defence, i)

      // Apply thematic mods to creatures (auras, buffs, debuffs)
      const randomAura =
        Object.values(auras)[
          Math.floor(Math.random() * Object.values(auras).length)
        ]
      const randomBuff =
        Object.values(buffs)[
          Math.floor(Math.random() * Object.values(buffs).length)
        ]
      const randomDebuff =
        Object.values(debuffs)[
          Math.floor(Math.random() * Object.values(debuffs).length)
        ]

      randomCreature.mods = [randomAura, randomBuff, randomDebuff] // Assign random mods

      opponentCreatures.push(randomCreature) // Add the configured creature to the opponent list
    }

    // Scale the number of runes and mods based on level difficulty
    const randomRunes = BASE_RUNES.slice(
      0,
      Math.floor(Math.random() * BASE_RUNES.length) + 1
    )
    const randomLevelEffects = levelEffects.slice(
      0,
      Math.floor(Math.random() * levelEffects.length) + 1
    )

    // Push level details to the `levels` array
    levels.push({
      levelNumber: i,
      opponentCreatures,
      opponentRunes: randomRunes,
      levelEffects: randomLevelEffects,
    })
  }
  return levels
}

// Generate 10 Levels with Scaling
// const levels = generateLevels(10)
// console.log(levels)

export const loadLevelData = (levelNumber) => {
  const allLevels = generateLevels(10) // Generates 10 levels; adjust if needed
  return allLevels.find((level) => level.levelNumber === levelNumber)
}
