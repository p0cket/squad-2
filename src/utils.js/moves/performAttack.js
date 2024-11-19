import {
  moveAttacker,
  returnAttacker,
  shakeTarget,
} from "../../components/animations/attackAnimations"
import {
  //   applyEffects,
  applyImmediateEffects,
  calcAttack,
  getCreatureControlsById,
} from "./attackUtils"
import { calcDamage } from "./calcDamage"

// Main performAttack function
export const performAttack = async (
  attacker,
  target,
  isPlayerAttack,
  playerCreatureControlsRef,
  enemyCreatureControlsRef,
  attack
) => {
  console.group("performAttack")
  console.log(
    "Performing attack from:",
    attacker,
    "to:",
    target,
    "attack is:",
    attack
  )

  const attackerID = attacker.ID
  const targetID = target.ID

  // Retrieve the correct controls
  const controlsRef = isPlayerAttack
    ? playerCreatureControlsRef
    : enemyCreatureControlsRef
  const opponentControlsRef = isPlayerAttack
    ? enemyCreatureControlsRef
    : playerCreatureControlsRef

  const attackerControls = controlsRef.current[attackerID]?.controls
  const targetControls = opponentControlsRef.current[targetID]?.controls
  const targetShowDamage = opponentControlsRef.current[targetID]?.showDamage

  if (!attackerControls || !targetControls) {
    console.warn(
      `Animation controls not found for attacker ID: ${attackerID} or target ID: ${targetID}, skipping attack animation.`
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
  console.group("Damage Calculation & Show Damage")

  // apply immediate effects
  // applyImmediateEffects(attacker, target, attack)
  const damage = calcDamage(attacker, target)
  // apply effects
  // applyEffects(attacker, target, attack)
  if (typeof damage !== "number" || isNaN(damage)) {
    console.error("Calculated damage is not a valid number:", damage)
    console.groupEnd()
    return 0 // Ensure we return a valid number
  }

  const damagedHP = target.health - damage
  console.log("Target's health after damage:", damagedHP)
  console.groupEnd()

  // Show damage on target
  if (targetShowDamage) {
    try {
      console.log("Showing damage on target:", targetID)
      targetShowDamage(damage)
      console.groupEnd()
    } catch (error) {
      console.error("Error showing damage on target:", error)
    }
  }

  console.groupEnd()

  const updatedCreatureObj = {
    ...target,
    health: Math.max(0, target.health - damage),
  }
  return updatedCreatureObj
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

  // apply immediate effects
  const objAfterAppliedImmediateEffects = applyImmediateEffects(
    attacker,
    target,
    attack
  )
  console.table(objAfterAppliedImmediateEffects)

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

  console.log(`updatedCreatureObj (with status) after attack`, updatedCreatureObj)

  //update target with damage
  dispatch({
    type: "UPDATE_CREATURE",
    side: isPlayerAttack ? "computerCreatures" : "playerCreatures",
    // creature: updatedComputerCreature,
    creature: updatedCreatureObj,
  })
  // return { statuses, damage }
}
