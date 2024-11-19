export const applyPoison = (creature) => ({
  ...creature,
  health: Math.max(0, creature.health - 10),
})

export const applyBuff = (creature) => ({ ...creature, atk: creature.atk + 5 })

export const applyBurn = (creature) => ({
  ...creature,
  health: Math.max(0, creature.health - 5),
})

export const applyStun = (creature) => ({ ...creature, stunned: true })

export const applyRegeneration = (creature) => ({
  ...creature,
  health: Math.min(creature.maxHealth, creature.health + 5),
})
export const tickDownEffects = (creature, statusName) => {
  creature.statuses = creature.statuses
    .map((status) => {
      if (status.name === statusName) {
        return {
          ...status,
          duration: status.duration - 1,
        }
      }
      return status
    })
    .filter((status) => status.duration > 0) // Keep statuses that still have duration
  return creature
}

export const STATUS_EFFECTS = {
  POISON: {
    name: "Poison",
    type: "debuff",
    timing: "afterAttack",
    duration: 3,
    applyEffect: "applyPoison",
    chance: 1,
  },
  BUFF: {
    name: "Buff",
    type: "buff",
    timing: `beforeAttack`,
    duration: 2,
    applyEffect: "applyBuff",
    chance: 1,
  },
  BURN: {
    name: "Burn",
    type: "debuff",
    timing: `afterAttack`,
    duration: 3,
    applyEffect: "applyBurn",
    chance: 1,
  },
  STUN: {
    name: "Stun",
    type: "debuff",
    timing: `beforeAttack`,
    duration: 2,
    applyEffect: "applyStun",
    chance: 1,
  },
  REGENERATION: {
    name: "Regeneration",
    type: "buff",
    timing: `afterAttack`,
    duration: 3,
    applyEffect: "applyRegeneration",
    chance: 1,
  },
}

export const effectFunctions = {
  applyPoison,
  applyBuff,
  applyBurn,
  applyStun,
  applyRegeneration,
}

// export const handleEndOfTurnEffects = (creatures) => {
//   const creaturesApplied = creatures.map((creature) => {
//     // Apply each mod's effect to the creature
//     creature.mods.forEach((mod) => {
//       // Ensure the effect exists in STATUS_EFFECTS before applying it
//       if (STATUS_EFFECTS[mod.name]) {
//         const effectFunction = effectFunctions[STATUS_EFFECTS[mod.name].applyEffect]
//         if (effectFunction) {
//           effectFunction(creature)
//         }
//       }
//     })

//     // Reduce the duration of effects and filter out expired ones
//     creature.mods = creature.mods
//       .map((mod) => ({
//         ...mod,
//         duration: mod.duration - 1,
//       }))
//       .filter((mod) => mod.duration > 0) // Keep effects that still have duration

//     return { ...creature } // Return the updated creature
//   })
//   return creaturesApplied // Return the updated creatures
// }

export const handleEndOfTurnEffects = (creatures) => {
  const creaturesApplied = creatures.map((creature) => {
    // Apply each mod's effect to the creature
    creature.mods.forEach((mod) => {
      // Ensure the effect exists in STATUS_EFFECTS before applying it
      if (STATUS_EFFECTS[mod.name]) {
        STATUS_EFFECTS[mod.name].applyEffect(creature)
      }
    })

    // Reduce the duration of effects and filter out expired ones
    creature.mods = creature.mods
      .map((mod) => ({
        ...mod,
        duration: mod.duration - 1,
      }))
      .filter((mod) => mod.duration > 0) // Keep effects that still have duration

    return { ...creature } // Return the updated creature
  })
  return creaturesApplied // Return the updated creatures
}

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

// replace this with isPartyDead
export const checkGameOver = (creatures) => {
  console.log(
    `checkGameOver: ${creatures.every((creature) => creature.health <= 0)}`,
    creatures
  )
  return creatures.every((creature) => creature.health <= 0)
}

export const checkIfPartyDead = (creatures) => {
  console.log(
    `checkGameOver: ${creatures.every((creature) => creature.health <= 0)}`,
    creatures
  )
  return creatures.every((creature) => creature.health <= 0)
}

export const didPlayerWin = (computerCreatures) => {
  return checkGameOver(computerCreatures)
}

export const didPlayerLose = (playerCreatures) => {
  return checkGameOver(playerCreatures)
}
