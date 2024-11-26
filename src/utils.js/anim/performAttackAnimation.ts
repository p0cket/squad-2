export const performAttackAnimation = async (
    attackerControls,
    targetControls,
    isPlayerAttack
  ) => {
    const direction = isPlayerAttack ? -1 : 1
    const distance = 150
    await moveAttacker(attackerControls, direction, distance)
    await shakeTarget(targetControls)
    await returnAttacker(attackerControls)
  }