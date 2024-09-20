// Level Generator Configurations
const availableCreatures = [
  {
    name: "🐉",
    template: "dragon",
    baseHealth: 150,
    baseAttack: 25,
    baseDefence: 10,
    mods: [],
  },
  {
    name: "🦄",
    template: "unicorn",
    baseHealth: 120,
    baseAttack: 20,
    baseDefence: 15,
    mods: [],
  },
  {
    name: "👾",
    template: "alien",
    baseHealth: 100,
    baseAttack: 30,
    baseDefence: 5,
    mods: [],
  },
  {
    name: "🐙",
    template: "fish",
    baseHealth: 90,
    baseAttack: 15,
    baseDefence: 12,
    mods: [],
  },
]

const availableMods = [
  { name: "Burn", type: "statusEffect", duration: 3, damagePerTurn: 5 },
  { name: "Regeneration", type: "statusEffect", duration: 3, healPerTurn: 5 },
  { name: "Stun", type: "statusEffect", duration: 2, preventsAttack: true },
]

const availableRunes = [
  {
    name: "Rune of Strength",
    effect: "Increases attack by 10",
    statEffect: { stat: "attack", value: 10 },
  },
  {
    name: "Rune of Vitality",
    effect: "Increases health by 20",
    statEffect: { stat: "health", value: 20 },
  },
]

const levelEffects = [
  { name: "Double Damage", effect: "All damage is doubled" },
  { name: "No Healing", effect: "Healing is disabled" },
]

const scaleStat = (baseValue, level, scaleFactor = 1.05) => {
  return Math.floor(baseValue * Math.pow(scaleFactor, level))
}

// Make sure to export the generateLevels function
export const generateLevels = (numLevels) => {
  const levels = []

  for (let i = 1; i <= numLevels; i++) {
    const numberOfCreatures = Math.floor(Math.random() * 3) + 1 // 1 to 3 creatures
    const creatures = []

    for (let j = 0; j < numberOfCreatures; j++) {
      const randomCreature = {
        ...availableCreatures[
          Math.floor(Math.random() * availableCreatures.length)
        ],
      }

      // Scale creature stats based on level (slow exponential scaling)
      randomCreature.health = scaleStat(randomCreature.baseHealth, i)
      randomCreature.attack = scaleStat(randomCreature.baseAttack, i)
      randomCreature.defence = scaleStat(randomCreature.baseDefence, i)

      // Apply random mods to creatures
      const randomMods = availableMods.slice(
        0,
        Math.floor(Math.random() * availableMods.length) + 1
      )
      randomCreature.mods = randomMods

      creatures.push(randomCreature)
    }

    // Scale the number of runes and mods based on level difficulty
    const randomRunes = availableRunes.slice(
      0,
      Math.floor(Math.random() * availableRunes.length) + 1
    )
    const randomLevelEffects = levelEffects.slice(
      0,
      Math.floor(Math.random() * levelEffects.length) + 1
    )

    levels.push({
      levelNumber: i,
      opponentCreatures: creatures,
      opponentRunes: randomRunes,
      levelEffects: randomLevelEffects,
    })
  }

  return levels
}

//   // Ensure other helper functions are exported if necessary
//   export const scaleStat = (baseValue, level, scaleFactor = 1.05) => {
//     return Math.floor(baseValue * Math.pow(scaleFactor, level));
//   };

// Generate 10 Levels with Scaling
const levels = generateLevels(10)
console.log(levels)
