export const showDamageOnTarget = (targetShowDamage, damage, targetID) => {
    if (targetShowDamage) {
      try {
        console.log("%cShowing damage on target:", "color: red;", targetID)
        targetShowDamage(damage)
      } catch (error) {
        console.error("%cError showing damage on target:", "color: red;", error)
      }
    }
  }