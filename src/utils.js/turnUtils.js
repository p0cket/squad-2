// utils/gameUtils.js

// Define possible status effects
const STATUS_EFFECTS = {
    POISON: {
      name: "Poison",
      type: "debuff",
      duration: 3,
      applyEffect: (creature) => {
        creature.health = Math.max(0, creature.health - 10);
      },
    },
    BUFF: {
      name: "Buff",
      type: "buff",
      duration: 2,
      applyEffect: (creature) => {
        creature.atk += 5;
      },
    },
    // Add more effects as needed
  };
  
  export const handleEndOfTurnEffects = (creatures) => {
    return creatures.map((creature) => {
      // Apply each effect to the creature
      creature.statusEffects.forEach((effect) => {
        STATUS_EFFECTS[effect.name].applyEffect(creature);
      });
  
      // Reduce duration of effects and filter out expired ones
      creature.statusEffects = creature.statusEffects
        .map((effect) => ({
          ...effect,
          duration: effect.duration - 1,
        }))
        .filter((effect) => effect.duration > 0);
      return creature;
    });
  };
  
  export const checkGameOver = (creatures) => {
    console.log(`checkGameOver: ${creatures.every((creature) => creature.health <= 0)}`, creatures)
    return creatures.every((creature) => creature.health <= 0);
  };