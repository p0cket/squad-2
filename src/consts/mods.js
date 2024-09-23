export const BASE_ENHANCEMENTS = [
    {
      id: 1,
      name: "Burn",
      type: "Temporary",
      effect: "Deals 5 damage each turn for 3 turns.",
      duration: 3,
      damagePerTurn: 5,
      icon: "🔥",
    },
    {
      id: 2,
      name: "Stun",
      type: "Temporary",
      effect: "Prevents the creature from attacking for 2 turns.",
      duration: 2,
      preventsAttack: true,
      icon: "⚡",
    },
    {
      id: 3,
      name: "Regeneration",
      type: "Temporary",
      effect: "Heals the creature by 5 health per turn for 3 turns.",
      duration: 3,
      healPerTurn: 5,
      icon: "🌿",
    },
  ]

  // Auras (passive effects that apply automatically or enhance the creature's abilities)
export const auras = {
    curseOfCombustion: {
      name: "Curse of Combustion",
      effect: "Burn",
      type: "statusEffect",
      duration: 3,
      damagePerTurn: 5,
      description: "Applies a burning effect to the enemy for 3 turns.",
    },
    tranquility: {
      name: "Tranquility",
      effect: "Regeneration",
      type: "statusEffect",
      duration: 3,
      healPerTurn: 5,
      description: "Heals the creature for 5 health per turn for 3 turns.",
    },
    furyOfTheStorm: {
      name: "Fury of the Storm",
      effect: "Increased Attack",
      type: "buff",
      attackBoost: 10,
      description: "Increases attack by 10 for the duration of the battle.",
    },
  }
  
  // Buffs (positive effects that enhance the creature's abilities)
  export const buffs = {
    strengthSurge: {
      name: "Strength Surge",
      effect: "Increases Attack",
      type: "buff",
      duration: 5,
      attackBoost: 10,
      description: "Boosts the creature's attack by 10 for 5 turns.",
    },
    shieldOfValor: {
      name: "Shield of Valor",
      effect: "Increases Defense",
      type: "buff",
      duration: 5,
      defenseBoost: 10,
      description: "Boosts the creature's defense by 10 for 5 turns.",
    },
  }
  
  // Debuffs (negative effects applied to enemies to weaken them)
  export const debuffs = {
    adhd: {
      name: "ADHD",
      effect: "Stun",
      type: "statusEffect",
      duration: 2,
      preventsAttack: true,
      description: "Prevents the enemy from attacking for 2 turns.",
    },
    shadowCurse: {
      name: "Shadow Curse",
      effect: "Reduce Defense",
      type: "debuff",
      duration: 3,
      defenseReduction: 5,
      description: "Reduces the enemy's defense by 5 for 3 turns.",
    },
  }