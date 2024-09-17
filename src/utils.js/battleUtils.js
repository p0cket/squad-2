// utils/gameUtils.js
export const resetCreatures = (creatures) => {
    return creatures.map((creature) => ({
      ...creature,
      health: creature.maxHealth, // Restore health to maxHealth
      statusEffects: [], // Clear temporary status effects
    }));
  };
  