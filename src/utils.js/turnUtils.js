// utils/gameUtils.js

// Define possible status effects
// Define possible status effects
const STATUS_EFFECTS = {
  POISON: {
    name: "Poison",
    type: "debuff",
    duration: 3,
    applyEffect: (creature) => {
      creature.health = Math.max(0, creature.health - 10)
    },
  },
  BUFF: {
    name: "Buff",
    type: "buff",
    duration: 2,
    applyEffect: (creature) => {
      creature.atk += 5
    },
  },
  BURN: {
    name: "Burn",
    type: "debuff",
    duration: 3,
    applyEffect: (creature) => {
      creature.health = Math.max(0, creature.health - 5) // Deals damage each turn
    },
  },
  STUN: {
    name: "Stun",
    type: "debuff",
    duration: 2,
    applyEffect: (creature) => {
      creature.stunned = true // Prevents attack
    },
  },
  REGENERATION: {
    name: "Regeneration",
    type: "buff",
    duration: 3,
    applyEffect: (creature) => {
      creature.health = Math.min(creature.maxHealth, creature.health + 5) // Heals per turn
    },
  },
}

export const handleEndOfTurnEffects = (creatures) => {
    const creaturesApplied = creatures.map((creature) => {
      // Apply each mod's effect to the creature
      creature.mods.forEach((mod) => {
        // Ensure the effect exists in STATUS_EFFECTS before applying it
        if (STATUS_EFFECTS[mod.name]) {
          STATUS_EFFECTS[mod.name].applyEffect(creature);
        }
      });
  
      // Reduce the duration of effects and filter out expired ones
      creature.mods = creature.mods
        .map((mod) => ({
          ...mod,
          duration: mod.duration - 1,
        }))
        .filter((mod) => mod.duration > 0); // Keep effects that still have duration
  
      return { ...creature }; // Return the updated creature
    });
  
    return creaturesApplied; // Return the updated creatures
  };
  
// export const handleEndOfTurnEffects = (creatures) => {
//   const creaturesApplied = creatures.map((creature) => {
//     // Apply each effect to the creature
//     // maybe mods.forEach(mod => mod.statusEffects(
//     //(effect) => effect.applyEffect(creature)))
//     creature.mods.forEach((effect) => {
//       STATUS_EFFECTS[effect.name].applyEffect(creature)
//     })

//     // Reduce duration of effects and filter out expired ones
//     creature.mods = creature.mods
//       .map((effect) => ({
//         ...effect,
//         duration: effect.duration - 1,
//       }))
//       .filter((effect) => effect.duration > 0)
//     return { ...creature }
//   })

//   return creaturesApplied
// }

export const checkGameOver = (creatures) => {
  console.log(
    `checkGameOver: ${creatures.every((creature) => creature.health <= 0)}`,
    creatures
  )
  return creatures.every((creature) => creature.health <= 0)
}
