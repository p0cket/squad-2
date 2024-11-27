import { Creature, Rune } from "../consts/types"

export const applyRuneEffects = (
  creature: Creature,
  runes: Rune[],
  // Add in necessary parameters to change the full state of the creatures (or even game?)
  // playerCreatures?: Creature[],
  // computerCreatures?: Creature[]
) => {
  // Clone the creature to avoid mutating the original
  let modifiedCreature = structuredClone(creature)

  runes.forEach((rune) => {
    if (rune.statEffect) {
      const { stat, value } = rune.statEffect

      if (stat === "health") {
        modifiedCreature.maxHealth = (modifiedCreature.maxHealth || 0) + value
        modifiedCreature.health = (modifiedCreature.health || 0) + value
      } else if (typeof modifiedCreature[stat] === "number") {
        (modifiedCreature[stat] as number) = (modifiedCreature[stat] || 0) + value;
      }
    }
  })
  return modifiedCreature
}
