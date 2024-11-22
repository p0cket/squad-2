import {
  moveAttacker,
  returnAttacker,
  shakeTarget,
} from "../../components/animations/attackAnimations"
import {
  //   applyEffects,
  applyImmediateEffects,
  applyPhaseEffects,
  applyPhaseStatuses,
  calcAttack,
  calculateDamageAndStatuses,
  getControls,
  getCreatureControlsById,
  performAttackAnimation,
  showDamageOnTarget,
  updateTargetState,
} from "./attackUtils"

export const newOldPerformAttack = async (
  attacker,
  target,
  isPlayerAttack,
  playerCreatureControlsRef,
  enemyCreatureControlsRef,
  attack,
  dispatch
) => {
  console.group("%cnewPerformAttack", "color: blue; font-weight: bold;")
  console.log(
    "%cPerforming attack from:",
    "color: green;",
    attacker,
    "%cto:",
    "color: green;",
    target,
    "%cattack is:",
    "color: green;",
    attack
  )

  // Retrieve the correct controls
  const controlsRef = isPlayerAttack
    ? playerCreatureControlsRef
    : enemyCreatureControlsRef

  const attackerControls = controlsRef.current[attacker.ID]?.controls
  const targetControls = getCreatureControlsById(
    target.ID,
    playerCreatureControlsRef,
    enemyCreatureControlsRef
  )?.controls
  const targetShowDamage = getCreatureControlsById(
    target.ID,
    playerCreatureControlsRef,
    enemyCreatureControlsRef
  )?.showDamage

  if (!attackerControls || !targetControls) {
    console.warn(
      `%c⚠️ Animation controls not found for attacker ID: ${attacker.ID} or target ID: ${target.ID}, skipping attack animation.`,
      "color: orange; font-weight: bold;"
    )
    console.groupEnd()
    return 0 // Return to avoid NaN errors later
  }

  const direction = isPlayerAttack ? -1 : 1
  const distance = 150
  // Execute animations in sequence
  await moveAttacker(attackerControls, direction, distance)
  await shakeTarget(targetControls)
  await returnAttacker(attackerControls)
  // Calculate damage
  console.group(
    "%cDamage Calculation & Show Damage",
    "color: purple; font-weight: bold;"
  )

  // apply immediate Statuses (Buff/Debuffs, but should be a use of them,
  // which means that this would be more rare likely, and
  // we should prob have more for `heal` or `stun` or `poison` etc
  // that occur before the attack)
  // so applyEffects(state, timing)
  const objAfterImmediateStatuses = applyPhaseStatuses(
    attacker,
    target,
    attack,
    "beforeAttack"
  )
  console.log(
    `objAfterImmediateStatuses .attack,
    .attacker,
    .target,
    .changes`,
    objAfterImmediateStatuses.attack,
    objAfterImmediateStatuses.attacker,
    objAfterImmediateStatuses.target,
    objAfterImmediateStatuses.changes
  )
  // --n
  //replace below with calcAttack
  console.log(
    `before calcAttack: attacker, target, attack`,
    attacker,
    target,
    attack
  )
  const { statuses, damage } = calcAttack(attacker, target, attack)

  console.log("Statuses after calcStatuses:", statuses)

  //--n

  const damagedHP = target.health - damage
  console.log("%cTarget's health after damage:", "color: red;", damagedHP)
  console.groupEnd()

  // Show damage on target
  if (targetShowDamage) {
    try {
      console.log("%cShowing damage on target:", "color: red;", target.ID)
      targetShowDamage(damage)
      console.groupEnd()
    } catch (error) {
      console.error("%cError showing damage on target:", "color: red;", error)
    }
  }

  if (target.statuses) {
    console.log(
      "%cTarget statuses after attack:",
      "color: orange;",
      target.statuses
    )
  }

  console.groupEnd()

  //return or just change the target's health/statuses?

  const updatedCreatureObj = {
    ...target,
    health: Math.max(0, target.health - damage),
    statuses: statuses,
  }

  console.log(
    `updatedCreatureObj (with status) after attack`,
    updatedCreatureObj
  )

  //update target with damage
  dispatch({
    type: "UPDATE_CREATURE",
    side: isPlayerAttack ? "computerCreatures" : "playerCreatures",
    // creature: updatedComputerCreature,
    creature: updatedCreatureObj,
  })

  // apply the status effects here:
  // applyEffect(statuses, timing)
}

export const newPerformAttack = async (
  attacker,
  target,
  isPlayerAttack,
  playerCreatureControlsRef,
  enemyCreatureControlsRef,
  attack,
  dispatch
) => {
  console.group("%cnewPerformAttack", "color: blue; font-weight: bold;")
  console.log(
    "%cPerforming attack from:",
    "color: green;",
    attacker,
    "%cto:",
    "color: green;",
    target,
    "%cattack is:",
    "color: green;",
    attack
  )

  // Retrieve controls
  const { attackerControls, targetControls, targetShowDamage } = getControls(
    attacker,
    target,
    isPlayerAttack,
    playerCreatureControlsRef,
    enemyCreatureControlsRef
  )

  if (!attackerControls || !targetControls) {
    console.warn(
      `%c⚠️ Animation controls not found for attacker ID: ${attacker.ID} or target ID: ${target.ID}, skipping attack animation.`,
      "color: orange; font-weight: bold;"
    )
    console.groupEnd()
    return 0 // Return to avoid NaN errors later
  }

  const direction = isPlayerAttack ? -1 : 1
  const distance = 150

  // Execute animations
  await performAttackAnimation(
    attackerControls,
    targetControls,
    direction,
    distance
  )

  // Calculate damage and apply statuses
  console.group(
    "%cDamage Calculation & Show Damage",
    "color: purple; font-weight: bold;"
  )

  const { statuses, damage } = calculateDamageAndStatuses(
    attacker,
    target,
    attack
  )

  console.log(
    "%cTarget's health after damage:",
    "color: red;",
    target.health - damage
  )
  console.groupEnd()

  // Show damage on target
  showDamageOnTarget(targetShowDamage, damage, target.ID)

  // Update target's health and statuses
  const updatedCreatureObj = updateTargetState(target, damage, statuses)

  console.log(
    `updatedCreatureObj (with status) after attack`,
    updatedCreatureObj
  )

  // Dispatch the update
  dispatch({
    type: "UPDATE_CREATURE",
    side: isPlayerAttack ? "computerCreatures" : "playerCreatures",
    creature: updatedCreatureObj,
  })

  console.groupEnd()
}
