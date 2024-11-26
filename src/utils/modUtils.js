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
//   });
export const applyMod = (creature, mod) => {
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

export const applyTurnModEffects = (creature) => {
  let updatedCreature = { ...creature }

  updatedCreature.mods = updatedCreature.mods.map((mod) => {
    if (mod.remainingDuration > 0) {
      switch (mod.type) {
        case "statusEffect":
          if (mod.name === "Burn") {
            updatedCreature.health -= mod.damagePerTurn
          } else if (mod.name === "Regeneration") {
            updatedCreature.health += mod.healPerTurn
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

export const applyEnhancement = (creature, enhancement) => {
  // Clone the creature to avoid direct mutation
  let updatedCreature = { ...creature }

  // Add the enhancement to the creature's statusEffects array
  updatedCreature.statusEffects = [
    ...updatedCreature.statusEffects,
    {
      ...enhancement,
      remainingDuration: enhancement.duration, // Track how long it should last
    },
  ]

  return updatedCreature
}

export const applyTurnEnhancementEffects = (creature) => {
  let updatedCreature = { ...creature }

  updatedCreature.statusEffects = updatedCreature.statusEffects.map(
    (effect) => {
      if (effect.remainingDuration > 0) {
        // Apply burn damage
        if (effect.name === "Burn") {
          updatedCreature.health -= effect.damagePerTurn
        }

        // Apply regeneration
        if (effect.name === "Regeneration") {
          updatedCreature.health += effect.healPerTurn
          if (updatedCreature.health > updatedCreature.maxHealth) {
            updatedCreature.health = updatedCreature.maxHealth // Prevent overhealing
          }
        }

        // Reduce remaining duration
        effect.remainingDuration -= 1
      }
      return effect
    }
  )

  // Filter out effects that have expired
  updatedCreature.statusEffects = updatedCreature.statusEffects.filter(
    (effect) => effect.remainingDuration > 0
  )

  return updatedCreature
}
