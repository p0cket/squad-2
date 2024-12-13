import { runApplyEffect, STATUS_EFFECTS } from "../../consts/statuses"
import { Creature, StatusEffect } from "../../consts/types/types"

export const handleEndOfTurnEffects = (creatures: Creature[]) => {
  //this should just be handlePhaseEffects (`endOfTurn`, creatures)

  const creaturesAppliedWithMods = creatures.map((creature) => {
    return applyMods(creature)
  })

  // for the effects, run the effect, decrease the amount of turns left, and remove if 0
  const creaturesAppliedWithEffects = creaturesAppliedWithMods.map(
    (creature) => {
      let updatedCreature = { ...creature }
      if (creature.statuses) {
        creature.statuses.forEach((status: StatusEffect) => {
          // if (STATUS_EFFECTS[status]) {
          //appluEffect is a string, so we need to use the effectFunctions object to get the function
          // const individualEffect = STATUS_EFFECTS[status]
          // updatedCreature = runApplyEffect(creature, individualEffect)
          updatedCreature = runApplyEffect(creature, status)

          // }
        })
      }
      return updatedCreature
    }
  )

  return creaturesAppliedWithEffects // Return the updated creatures
}

// Go Back To Mods
const applyMods = (creature: Creature) => {
  if (creature.mods) {
    creature.mods.forEach((mod: { name: string }) => {
      // Ensure the effect exists in STATUS_EFFECTS before applying it
      // @ts-ignore
      if (STATUS_EFFECTS[mod.name]) {
        // @ts-ignore
        STATUS_EFFECTS[mod.name].applyEffect(creature)
      }
    })
  }

  // Reduce the duration of effects and filter out expired ones
  if (creature.mods) {
    creature.mods = creature.mods
      .map((mod) => ({
        ...mod,
        duration: mod.duration - 1,
      }))
      .filter((mod) => mod.duration > 0) // Keep effects that still have duration
  }

  return creature
}
