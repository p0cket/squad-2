// Define the logic for each effect in a central STATUS_EFFECTS object
export const STATUS_EFFECTS = {
    Burn: {
      applyEffect: (creature) => {
        creature.health -= 5; // Apply burn damage
      },
    },
    Stun: {
      applyEffect: (creature) => {
        creature.canAttack = false; // Prevent the creature from attacking
      },
    },
    Regeneration: {
      applyEffect: (creature) => {
        creature.health += 5; // Apply regeneration healing
      },
    },
  };
  