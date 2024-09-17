// export const applyRuneEffects = (creature, runes) => {
//     let modifiedStats = {};
//     runes.forEach(rune => {
//       if (rune.statEffect) {
//         const { stat, value } = rune.statEffect;
//         modifiedStats[stat] = (modifiedStats[stat] || 0) + value;
//       }
//     });
  
//     return modifiedStats;
//   };
  
//   export const applyRuneEffects = (creature, runes) => {
//     return runes.reduce((modifiedCreature, rune) => {
//       if (rune.statEffect) {
//         const { stat, value } = rune.statEffect;
//         let newStatValue = modifiedCreature[stat] || 0;
  
//         // Special handling for health to ensure it doesn't exceed MAX_HP
//         if (stat === 'health') {
//           newStatValue = Math.min(modifiedCreature.health + value, MAX_HP);
//         } else {
//           newStatValue += value;
//         }
  
//         return {
//           ...modifiedCreature,
//           [stat]: newStatValue,
//         };
//       }
//       return modifiedCreature;
//     }, creature);
//   };

// export const applyRuneEffects = (creature, runes) => {
//     return runes.reduce((modifiedCreature, rune) => {
//       if (rune.statEffect) {
//         const { stat, value } = rune.statEffect;
//         let newStatValue = modifiedCreature[stat] || 0;
  
//         if (stat === "health") {
//           // Increase health but ensure it doesn't exceed MAX_HP
//           newStatValue = Math.min(modifiedCreature.health + value, MAX_HP);
//         } else {
//           newStatValue += value;
//         }
  
//         return {
//           ...modifiedCreature,
//           [stat]: newStatValue,
//         };
//       }
//       return modifiedCreature;
//     }, creature);
//   };







export const applyRuneEffects = (creature, runes) => {
    // Clone the creature to avoid mutating the original
    let modifiedCreature = structuredClone(creature)
  
    runes.forEach((rune) => {
      if (rune.statEffect) {
        const { stat, value } = rune.statEffect
  
        if (stat === "health") {
          modifiedCreature.maxHealth = (modifiedCreature.maxHealth || 0) + value
          modifiedCreature.health = (modifiedCreature.health || 0) + value
        } else {
          modifiedCreature[stat] = (modifiedCreature[stat] || 0) + value
        }
      }
    })
  
    return modifiedCreature
  }
// export const applyRuneEffects = (creature, runes) => {
//     return runes.reduce((modifiedCreature, rune) => {
//       if (rune.statEffect) {
//         const { stat, value } = rune.statEffect;
  
//         if (stat === "health") {
//           const newMaxHealth = modifiedCreature.maxHealth + value;
//           const newHealth = modifiedCreature.health + value;
  
//           return {
//             ...modifiedCreature,
//             maxHealth: newMaxHealth,
//             health: newHealth,
//           };
//         }
  
//         // For other stats
//         const newStatValue = (modifiedCreature[stat] || 0) + value;
  
//         return {
//           ...modifiedCreature,
//           [stat]: newStatValue,
//         };
//       }
//       return modifiedCreature;
//     }, creature);
//   };