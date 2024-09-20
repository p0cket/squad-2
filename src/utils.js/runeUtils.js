
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