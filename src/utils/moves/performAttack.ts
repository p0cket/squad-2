import { AnimationControls } from "framer-motion"
import {
  AttackPayload,
  LogType,
  PushLogType,
  State,
} from "../../consts/types/types"
import { logStep } from "../../debug/logUtils"
import { getControls } from "../anim/getControls"
import { performAttackAnimation } from "../anim/performAttackAnimation"
import { showDamageOnTarget } from "../anim/showDamageOnTarget"
import { updateTargetState } from "../party/updateTargetState"
import { newFindRelevantProcs } from "./attackUtils"
import { calculateDamageAndStatuses } from "./calculateDamageAndStatuses"

// Each of these is added to the stack, and each part is individually resolved.
// add: atk1 - anim
// add: atk1 - calc damage
// add: atk1 - calc effects
// -
// run stack

export const newPerformAttack = async (attackPayload: AttackPayload) => {
  const {
    attacker,
    target,
    isPlayerAttack,
    playerCreatureControlsRef,
    enemyCreatureControlsRef,
    attack,
    dispatch,
    playerCreatures,
    computerCreatures,
  } = attackPayload

  const newLogEntry: LogType = {
    message: `Performing attack. ${attacker?.icon}${attacker?.name} used ${attack.name} on ${attacker?.icon}${target?.name}`,
    timestamp: new Date().toISOString(),
    details: `#LFG`,
    source: "runTurn 45",
  }
  logStep(newLogEntry, dispatch)

  // Retrieve controls (we don't need for the adding)
  const { attackerControls, targetControls, targetShowDamage } = getControls(
    attacker,
    target,
    isPlayerAttack,
    playerCreatureControlsRef,
    enemyCreatureControlsRef
  )

  const newPushLogEntry: PushLogType = {
    message: `Animate ${attacker?.name} attack on ${target?.name}`,
    timestamp: new Date().toISOString(),
    action: {
      type: "HANDLE_ATTACK_ANIMATION",
      payload: { attacker, target }, //also attackPayload
      //  await performAttackAnimation(attackerControls, targetControls, isPlayerAttack)
    },
    source: "performAttack 70",
  }
  logStep(newPushLogEntry, dispatch)

  const createAnimPayload = (
    attackerControls: AnimationControls | null,
    targetControls: AnimationControls | null,
    isPlayerAttack: boolean
  ) => {
    const p = {
      controls: { attacker: attackerControls, target: targetControls },
      isPlayer: isPlayerAttack,
      //details?
    }
    return p
  }

  const addAnimToStack = (
    attackerControls: AnimationControls | null,
    targetControls: AnimationControls | null,
    isPlayerAttack: boolean
  ) => {
    const animPayload = createAnimPayload(
      attackerControls,
      targetControls,
      isPlayerAttack
    )

    // do this somewhere
    // pushAnimToStack(animPayload)
  }

  // instead, add this animation to the stack.
  addAnimToStack(attackerControls, targetControls, isPlayerAttack)

  await performAttackAnimation(attackerControls, targetControls, isPlayerAttack)

  // Calculate damage and apply new statuses
  console.group(
    "%c🧮💻Damage Calculation & Show Damage",
    "color: purple; font-weight: bold;"
  )
  // calculate and add each to the stack
  const { statuses, damage } = calculateDamageAndStatuses(attackPayload)

  console.log(
    "%c🏥Target's health after damage:",
    "color: red;",
    target.health - damage
  )
  console.groupEnd()
  const newAnim2: PushLogType = {
    message: `Animate ${target?.name} health loss of ${damage} - ${
      target?.health
    } = ${target.health - damage}.`,
    timestamp: new Date().toISOString(),
    action: {
      type: "HANDLE_DAMAGE_ANIMATION",
      payload: { attacker, target }, //also attackPayload
    },
    source: "performAttack 100",
  }
  logStep(newAnim2, dispatch)

  const logEntry3: LogType = {
    message: `damage: ${damage} to be applied to ${target.name}`,
    timestamp: new Date().toISOString(),
    details: `Target's health: ${target.health}-${damage}=${
      target.health - damage
    }`,
    source: "performAttack 233",
  }
  logStep(logEntry3, dispatch)

  // Show damage on target
  showDamageOnTarget(targetShowDamage, damage, target.ID)

  // Update target's health and statuses
  const updatedCreatureObj = updateTargetState(target, damage, statuses)
  console.log(
    `updatedCreatureObj (with status) after attack`,
    updatedCreatureObj
  )
  const newPush2: PushLogType = {
    message: `updatedCreatureObj ${updatedCreatureObj?.name} updated with "updateTargetState`,
    timestamp: new Date().toISOString(),
    action: {
      type: "HANDLE_CREATURE_UPDATE", //is it more than just the health?
      payload: { updatedCreatureObj }, //also attackPayload
    },
    source: "performAttack 132",
  }
  logStep(newPush2, dispatch)

  const curSide = isPlayerAttack ? "computerCreatures" : "playerCreatures"
  const log4: LogType = {
    message: `before dispatch: ${updatedCreatureObj.name} has ${updatedCreatureObj.health} health.`,
    timestamp: new Date().toISOString(),
    details: `Updating ${curSide} with ${updatedCreatureObj.name}'s new health.`,
    source: "performAttack 141",
  }
  logStep(log4, dispatch)

  // Now that creature is updated, proceed with post-attack logic
  const updatedAttackPayload = {
    ...attackPayload,
    target: updatedCreatureObj,
  }

  const procdAttackPayload = newFindRelevantProcs(
    updatedAttackPayload,
    "beforeAttack"
  )

  console.groupEnd()
}
