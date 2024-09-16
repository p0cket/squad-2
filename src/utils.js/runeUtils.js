import { MAX_HP } from "../GameContext";

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
  
  export const applyRuneEffects = (creature, runes) => {
    return runes.reduce((modifiedCreature, rune) => {
      if (rune.statEffect) {
        const { stat, value } = rune.statEffect;
        let newStatValue = modifiedCreature[stat] || 0;
  
        // Special handling for health to ensure it doesn't exceed MAX_HP
        if (stat === 'health') {
          newStatValue = Math.min(modifiedCreature.health + value, MAX_HP);
        } else {
          newStatValue += value;
        }
  
        return {
          ...modifiedCreature,
          [stat]: newStatValue,
        };
      }
      return modifiedCreature;
    }, creature);
  };