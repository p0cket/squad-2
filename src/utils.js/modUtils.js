export const applyEnhancement = (creature, enhancement) => {
    // Clone the creature to avoid direct mutation
    let updatedCreature = { ...creature };
  
    // Add the enhancement to the creature's statusEffects array
    updatedCreature.statusEffects = [
      ...updatedCreature.statusEffects,
      {
        ...enhancement,
        remainingDuration: enhancement.duration, // Track how long it should last
      },
    ];
  
    return updatedCreature;
  };

  export const applyTurnEnhancementEffects = (creature) => {
    let updatedCreature = { ...creature };
  
    updatedCreature.statusEffects = updatedCreature.statusEffects.map((effect) => {
      if (effect.remainingDuration > 0) {
        // Apply burn damage
        if (effect.name === "Burn") {
          updatedCreature.health -= effect.damagePerTurn;
        }
  
        // Apply regeneration
        if (effect.name === "Regeneration") {
          updatedCreature.health += effect.healPerTurn;
          if (updatedCreature.health > updatedCreature.maxHealth) {
            updatedCreature.health = updatedCreature.maxHealth; // Prevent overhealing
          }
        }
  
        // Reduce remaining duration
        effect.remainingDuration -= 1;
      }
      return effect;
    });
  
    // Filter out effects that have expired
    updatedCreature.statusEffects = updatedCreature.statusEffects.filter(
      (effect) => effect.remainingDuration > 0
    );
  
    return updatedCreature;
  };