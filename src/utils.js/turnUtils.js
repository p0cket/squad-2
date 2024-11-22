import { runApplyEffect, STATUS_EFFECTS } from "../consts/statuses"

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

// timing: 'endOfTurn' apply end of turn mods, effects, etc. to creatures, etc.
export const handleEndOfTurnEffects = (creatures) => {
  //this should just be handlePhaseEffects (`endOfTurn`, creatures)

  const creaturesAppliedWithMods = creatures.map((creature) => {
    return applyMods(creature)
  })

  // for the effects, run the effect, decrease the amount of turns left, and remove if 0
  const creaturesAppliedWithEffects = creaturesAppliedWithMods.map(
    (creature) => {
      let updatedCreature = { ...creature }
      if (creature.statuses) {
        creature.statuses.forEach((status) => {
          if (STATUS_EFFECTS[status.name]) {
            //appluEffect is a string, so we need to use the effectFunctions object to get the function
            const individualEffect = STATUS_EFFECTS[status.name].effectFuncName
            updatedCreature = runApplyEffect(creature, individualEffect)
          }
        })
      }
      return updatedCreature
    }
  )

  return creaturesAppliedWithEffects // Return the updated creatures
}

const applyMods = (creature) => {
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

  return creature
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
