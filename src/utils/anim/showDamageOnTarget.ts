export const showDamageOnTarget = (
  targetShowDamage: ((damage: number | null) => void) | null,
  damage: number,
  targetID: number
) => {
  if (targetShowDamage) {
    try {
      console.log("%cShowing damage on target#", "color: red;", targetID)
      targetShowDamage(damage)
    } catch (error) {
      console.error("%cError showing damage on target#", "color: red;", error)
    }
  }
}
