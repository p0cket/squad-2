export const resetCreatures = (creatures) => {
  return creatures.map((creature) => {
    const clonedCreature = structuredClone(creature)
    clonedCreature.health = clonedCreature.maxHealth
    clonedCreature.statusEffects = []
    return clonedCreature
  })
}

export const selectRandomCreature = (creatures) => {
  return creatures[Math.floor(Math.random() * creatures.length)];
};

export const calculateHealedHealth = (creature, healAmount) => {
  return Math.min(creature.health + healAmount, creature.maxHealth);
};