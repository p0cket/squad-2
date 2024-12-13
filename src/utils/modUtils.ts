// dispatch({
//     type: "APPLY_MOD",
//     payload: {
//       creature: selectedCreature,
//       mod: {
//         name: "Burn",
//         type: "statusEffect",
//         duration: 3,
//         damagePerTurn: 5,
//       },
//     },

import { STATUS_EFFECTS } from "../consts/statuses"
import { Creature, Enhancement, Mod } from "../consts/types/types"
import { applyStatus } from "./moves/attackUtils"

//   });
export const applyMod = (creature: Creature, mod: Mod) => {
  // Clone the creature to avoid direct mutation
  let updatedCreature = { ...creature }

  // Add the mod to the creature's mods array
  updatedCreature.mods = [
    ...updatedCreature.mods,
    {
      ...mod,
      remainingDuration: mod.duration || 0, // Track how long it should last (if temporary)
    },
  ]

  return updatedCreature
}

export const applyTurnModEffects = (creature: Creature) => {
  let updatedCreature = { ...creature }

  updatedCreature.mods = updatedCreature.mods.map((mod) => {
    if (mod.remainingDuration > 0) {
      switch (mod.type) {
        case "statusEffect":
          if (mod.name === "Burn") {
            // updatedCreature.health -= mod.damagePerTurn
            updatedCreature.health += mod.amount
          } else if (mod.name === "Regeneration") {
            // updatedCreature.health += mod.healPerTurn
            updatedCreature.health += mod.amount
            if (updatedCreature.health > updatedCreature.maxHealth) {
              updatedCreature.health = updatedCreature.maxHealth // Prevent overhealing
            }
          }
          break
        case "buff":
          // Add logic for buffs, if any
          break
        case "aura":
          // Aura handling logic
          break
        default:
          break
      }

      // Reduce remaining duration
      mod.remainingDuration -= 1
    }
    return mod
  })

  // Filter out mods that have expired
  updatedCreature.mods = updatedCreature.mods.filter(
    (mod) => mod.remainingDuration > 0
  )

  return updatedCreature
}

// Todo:  More like global enchantments?
export const applyEnhancement = (
  creature: Creature,
  enhancement: Enhancement
) => {
  // Clone the creature to avoid direct mutation
  let updatedCreature = { ...creature }

  // Add the enhancement to the creature's statusEffects array
  return updatedCreature
}

// Maybe get rid of this function and just use others
export const applyTurnEnhancementEffects = (creature: Creature) => {
  let updatedCreature = { ...creature }
  updatedCreature.statuses = updatedCreature.statuses.map((effect) => {
    if (effect.duration > 0) {
      // Apply burn damage
      if (effect.name === "Burn") {
        // This is applying the status effect, which is done through a function.
        // StatuseEffect's effectFuncName key is a string that
        // matches a function name to be ran by effectFunctions
        //
        //effectFunctions[effect.effectFuncName](creature)
        // updatedCreature.health -= STATUS_EFFECTS[effect].amount
      }
      // Apply regeneration
      if (effect.name === "Regeneration") {
        //effectFunctions[effect.effectFuncName](creature)
        if (updatedCreature.health > updatedCreature.maxHealth) {
          updatedCreature.health = updatedCreature.maxHealth // Prevent overhealing
        }
      }

      // Reduce remaining duration
      effect.duration -= 1
    }
    return effect
  })

  // Filter out effects that have expired
  updatedCreature.statuses = updatedCreature.statuses.filter(
    (effect) => effect.duration > 0
  )

  return updatedCreature
}
