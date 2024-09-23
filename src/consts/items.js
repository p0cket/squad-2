export const BASE_RUNES = [
  {
    id: 1,
    name: "Rune of Strength",
    type: "Common",
    effect: "Increases the Attack stat of all creatures by 10.",
    cost: 100,
    count: 0,
    statEffect: { stat: "attack", value: 10 },
    icon: "💪",
  },
  {
    id: 2,
    name: "Rune of Vitality",
    type: "Common",
    effect: "Increases the Health stat of all creatures by 20.",
    cost: 100,
    count: 0,
    statEffect: { stat: "health", value: 20 },
    icon: "❤️",
  },
  {
    id: 3,
    name: "Rune of Speed",
    type: "Common",
    effect: "Increases the Speed stat of all creatures by 5.",
    cost: 100,
    count: 0,
    statEffect: { stat: "speed", value: 5 },
    icon: "⚡",
  },
  {
    id: 4,
    name: "Rune of Wealth",
    type: "Common",
    effect: "Gain 50% more gold after each battle.",
    cost: 150,
    count: 0,
    statEffect: { stat: "goldMultiplier", value: 0.5 },
    icon: "💰",
  },
  {
    id: 5,
    name: "Rune of the Assassin",
    type: "Uncommon",
    effect:
      "Increases damage dealt to creatures with higher health than the user by 20%.",
    cost: 250,
    count: 0,
    statEffect: { stat: "assassinDamage", value: 0.2 },
    icon: "🗡️",
  },
  {
    id: 6,
    name: "Rune of the Dragon",
    type: "Rare",
    effect:
      "Grants the ability to breathe fire, dealing 30 damage to all enemies.",
    cost: 500,
    count: 0,
    statEffect: { stat: "dragonBreath", value: 30 },
    icon: "🐉",
  },
]

//   potions act like cards where they can do anything
// add, subtract, buff, complex
export const BASE_POTIONS = []
