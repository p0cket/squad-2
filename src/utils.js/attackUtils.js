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
export const performAttack = async (attacker, target, isPlayerAttack, creatureControlsRef) => {
  const damage = await attackAnimation(attacker, target, isPlayerAttack, creatureControlsRef);
  return damage;
};

const attackAnimation = async (attacker, target, isPlayerAttack, creatureControlsRef) => {
  const attackerControls = creatureControlsRef.current[attacker.name];
  const targetControls = creatureControlsRef.current[target.name];

  const direction = isPlayerAttack ? -1 : 1;
  const distance = 150;

  await attackerControls.start({
    y: direction * distance,
    transition: { duration: 0.3 },
  });

  if (targetControls) {
    await targetControls.start({
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.3 },
    });
  }

  await attackerControls.start({
    y: 0,
    transition: { duration: 0.3 },
  });

  const damage = calcDamage(attacker, target);
  return damage;
};
