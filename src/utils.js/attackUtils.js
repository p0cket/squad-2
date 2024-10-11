export const calcDamage = (attacker, target) => {
  console.group("calcDamage");
  if (!attacker || !target) {
    console.error("Undefined attacker or target in calcDamage");
    console.groupEnd();
    return 0;
  }

  console.log("Attacker:", attacker);
  console.log("Target:", target);

  const attack = attacker.attack || 0;
  const defense = target.defense || 0;
  const trueDamage = attacker.trueDamage || 0;

  console.log("Attack:", attack, "Defense:", defense, "True Damage:", trueDamage);

  // Calculate base damage
  let baseDamage = attack - defense;
  if (baseDamage < 0) baseDamage = 0;

  console.log("Base Damage:", baseDamage);

  // Add true damage
  const totalDamage = baseDamage + trueDamage;

  console.log("Total Damage before Random Factor:", totalDamage);

  // Add some randomness
  const randomFactor = 1; // Random factor between 0.9 and 1.1
  // const randomFactor = Math.random() * 0.2 + 0.9; // Random factor between 0.9 and 1.1
  const damage = totalDamage * randomFactor;

  console.log("Total Damage after Random Factor:", damage);
  console.groupEnd();

  return Math.floor(damage);
};

export const performAttack = async (
  attacker,
  target,
  isPlayerAttack,
  playerCreatureControlsRef,
  enemyCreatureControlsRef
) => {
  console.group("performAttack");
  console.log("Performing attack from:", attacker, "to:", target);

  // Ensure we're using the correct key for IDs
  const attackerID = attacker.ID;
  const targetID = target.ID;

  console.group("ID and Controls Validation");
  console.log("Attacker ID:", attackerID);
  console.log("Target ID:", targetID);
  console.log("All Player Controls:", playerCreatureControlsRef.current);
  console.log("All Enemy Controls:", enemyCreatureControlsRef.current);
  console.groupEnd();

  // Retrieve the correct controls using the IDs
  const attackerControls = isPlayerAttack
    ? playerCreatureControlsRef.current[attackerID]?.controls
    : enemyCreatureControlsRef.current[attackerID]?.controls;

  const targetControls = isPlayerAttack
    ? enemyCreatureControlsRef.current[targetID]?.controls
    : playerCreatureControlsRef.current[targetID]?.controls;

  const targetShowDamage = isPlayerAttack
    ? enemyCreatureControlsRef.current[targetID]?.showDamage
    : playerCreatureControlsRef.current[targetID]?.showDamage;

  console.group("Controls Assignment Check");
  console.log("Attacker Controls:", attackerControls);
  console.log("Target Controls:", targetControls);
  console.log("Target Show Damage Function:", targetShowDamage);
  console.groupEnd();

  if (!attackerControls || !targetControls) {
    console.warn(
      `Animation controls not found for attacker ID: ${attackerID} or target ID: ${targetID}, skipping attack animation.`
    );
    console.groupEnd();
    return 0; // Ensure a valid return value to avoid NaN errors later
  }

  const direction = isPlayerAttack ? -1 : 1;
  const distance = 150;

  // Move attacker towards target
  try {
    console.group("Animation Step: Attacker Moving");
    console.log(
      "Attacker moving towards target... Direction:",
      direction,
      "Distance:",
      distance
    );
    await attackerControls.start({
      y: direction * distance,
      transition: { duration: 0.3 },
    });
    console.groupEnd();
  } catch (error) {
    console.error("Error moving attacker:", error);
  }

  // Simulate attack impact with a shake
  try {
    if (targetControls) {
      console.group("Animation Step: Target Shake");
      console.log("Target shaking...");
      await targetControls.start({
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.3 },
      });
      console.groupEnd();
    }
  } catch (error) {
    console.error("Error shaking target:", error);
  }

  // Return attacker to original position
  try {
    console.group("Animation Step: Attacker Returning");
    console.log("Attacker returning to original position...");
    await attackerControls.start({
      y: 0,
      transition: { duration: 0.3 },
    });
    console.groupEnd();
  } catch (error) {
    console.error("Error returning attacker to position:", error);
  }

  const damage = calcDamage(attacker, target);
  if (typeof damage !== "number" || isNaN(damage)) {
    console.error("Calculated damage is not a valid number:", damage);
    console.groupEnd();
    return 0; // Ensure we return a valid number
  }

  // Apply damage to target health
  console.group("Damage Calculation and Application");
  console.log("Damage dealt:", damage);
  console.log("Target's health before damage:", target.health);
  target.health -= damage;

  if (typeof target.health !== "number" || isNaN(target.health)) {
    console.error(
      "Target's health became invalid after applying damage. Setting health to 0:",
      target.health
    );
    target.health = 0;
  } else {
    console.log("Target's health after damage:", target.health);
  }
  console.groupEnd();

  // Show damage on target if the function is available
  if (targetShowDamage) {
    try {
      console.group("Showing Damage on Target");
      console.log("Showing damage on target:", targetID);
      targetShowDamage(damage);
      console.groupEnd();
    } catch (error) {
      console.error("Error showing damage on target:", error);
    }
  }

  console.groupEnd();
  return damage; // Ensure we return a valid number
};
