export const calcDamage = (attacker, target) => {
  if (!attacker || !target) {
    console.error("Undefined attacker or target in calcDamage")
    return 0
  }

  const attack = attacker.attack || 0
  const defense = target.defense || 0
  const trueDamage = attacker.trueDamage || 0

  // Calculate base damage
  let baseDamage = attack - defense
  if (baseDamage < 0) baseDamage = 0

  // Add true damage
  const totalDamage = baseDamage + trueDamage

  // Add some randomness
  const randomFactor = 1 // Random factor between 0.9 and 1.1
  //   const randomFactor = Math.random() * 0.2 + 0.9 // Random factor between 0.9 and 1.1
  const damage = totalDamage * randomFactor

  return Math.floor(damage)
}

export const performAttack = async (
  attacker,
  target,
  isPlayerAttack,
  playerCreatureControlsRef,
  enemyCreatureControlsRef
) => {
  console.log("performAttack called")
  console.log("Attacker:", attacker)
  console.log("Target:", target)

  const attackerName = attacker.name
  const targetName = target.name

  const attackerControls = isPlayerAttack
    ? playerCreatureControlsRef.current[attackerName]?.controls
    : enemyCreatureControlsRef.current[attackerName]?.controls

  const targetControls = isPlayerAttack
    ? enemyCreatureControlsRef.current[targetName]?.controls
    : playerCreatureControlsRef.current[targetName]?.controls

  const targetShowDamage = isPlayerAttack
    ? enemyCreatureControlsRef.current[targetName]?.showDamage
    : playerCreatureControlsRef.current[targetName]?.showDamage

  console.log("Attacker Controls:", attackerControls)
  console.log("Target Controls:", targetControls)

  if (!attackerControls || !targetControls) {
    console.warn("Animation controls not found, skipping attack animation.")
    return
  }

  const direction = isPlayerAttack ? -1 : 1
  const distance = 150

  // Move attacker towards target
  try {
    console.log("Attacker moving towards target...")
    await attackerControls.start({
      y: direction * distance,
      transition: { duration: 0.3 },
    })
  } catch (error) {
    console.error("Error moving attacker:", error)
  }

  // Simulate attack impact with a shake
  try {
    if (targetControls) {
      console.log("Target shaking...")
      await targetControls.start({
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.3 },
      })
    }
  } catch (error) {
    console.error("Error shaking target:", error)
  }

  // Return attacker to original position
  try {
    console.log("Attacker returning to original position...")
    await attackerControls.start({
      y: 0,
      transition: { duration: 0.3 },
    })
  } catch (error) {
    console.error("Error returning attacker to position:", error)
  }

  const damage = calcDamage(attacker, target)
  if (targetShowDamage) {
    targetShowDamage(damage)
  }

  console.log("Damage dealt:", damage)
  return damage
}
