export const statDescriptions = {
  creature: {
    name: "🦄",
    template: "unicorn",
    health: "MAX_HP",
    maxHealth: "MAX_HP",
    attack: 20,
    trueDamage: 10,
    defence: 5,
    statusEffects: [],
  },
  runes: {
    id: 1,
    name: "Rune of Strength",
    type: "Common",
    effect: "Increases the Attack stat of all creatures by 10.",
    cost: 100,
    count: 0,
    statEffect: { stat: "attack", value: 10 },
    icon: "💪",
  },
}

export const theme = {
  dark: {
    primary: "#f5f5f5",
    secondary: "#f5f5f5",
    tertiary: "#f5f5f5",
  },
  light: {
    primary: "#f5f5f5",
    secondary: "#f5f5f5",
    tertiary: "#f5f5f5",
  },
}

export const objShapeExamples = {
  creature: {
    unicorn: {
      name: "🦄",
      template: "unicorn",
      health: 100,
      maxHealth: 100,
      attack: 20,
      trueDamage: 10,
      defence: 5,
      statusEffects: [],
    },
  },
  rune: {
    id: 1,
    name: "Rune of Strength",
    type: "Common",
    effect: "Increases the Attack stat of all creatures by 10.",
    cost: 100,
    count: 0,
    statEffect: { stat: "attack", value: 10 },
    icon: "💪",
  },
}