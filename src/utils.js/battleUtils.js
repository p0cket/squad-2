// utils/gameUtils.js
export const resetCreatures = (creatures) => {
  return creatures.map((creature) => {
    const clonedCreature = structuredClone(creature)
    clonedCreature.health = clonedCreature.maxHealth
    clonedCreature.statusEffects = []
    return clonedCreature
  })
}