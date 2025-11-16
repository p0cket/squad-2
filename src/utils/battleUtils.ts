// import { moveDeadCreaturesToBack } from "./creatureUtils"
import { Creature } from "../consts/types/types";

// Reset The Creatures Between Battles (heal fully, etc)
export const resetCreatures = (creatures: Creature[]) => {
  return creatures.map((creature) => {
    const clonedCreature = structuredClone(creature)
    clonedCreature.health = clonedCreature.maxHealth
    // took this out because the typescript wasn't matching but maybe it does belong there
    // clonedCreature.statusEffects = []
    clonedCreature.statuses = [];
    return clonedCreature
  })
}

export const selectRandomCreature = (creatures: Creature[]) => {
  return creatures[Math.floor(Math.random() * creatures.length)]
}

export const calculateHealedHealth = (creature: Creature, healAmount: number) => {
  return Math.min(creature.health + healAmount, creature.maxHealth)
}

