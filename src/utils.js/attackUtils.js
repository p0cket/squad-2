export const calcDamage = (attacker, target) => {
  const attack = attacker.attack || 0
  const defense = target.defense || 0
  const trueDamage = attacker.trueDamage || 0

  // Calculate base damage
  let baseDamage = attack - defense
  if (baseDamage < 0) baseDamage = 0

  // Add true damage
  const totalDamage = baseDamage + trueDamage

  // Add some randomness
  const randomFactor = Math.random() * 0.2 + 0.9 // Random factor between 0.9 and 1.1
  const damage = totalDamage * randomFactor

  return Math.floor(damage)
}
// utils.js/attackUtils.js

export const performAttack = async (
  attacker,
  target,
  isPlayerAttack,
  creatureControlsRef
) => {
  const attackerName = attacker.name
  const targetName = target.name
  const attackerData = creatureControlsRef.current[attackerName]
  const targetData = creatureControlsRef.current[targetName]

  const attackerControls = attackerData.controls
  const targetControls = targetData.controls
  const targetShowDamage = targetData.showDamage

  const direction = isPlayerAttack ? -1 : 1
  const distance = 150

  // Move attacker towards target
  await attackerControls.start({
    y: direction * distance,
    transition: { duration: 0.3 },
  })

  // Simulate attack impact with a shake
  if (targetControls) {
    await targetControls.start({
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.3 },
    })
  }

  // Return attacker to original position
  await attackerControls.start({
    y: 0,
    transition: { duration: 0.3 },
  })

  // Calculate damage
  const damage = calcDamage(attacker, target)

  // Show damage on target creature
  if (targetShowDamage) {
    targetShowDamage(damage)
  }

  return damage
}

