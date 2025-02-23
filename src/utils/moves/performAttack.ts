// import { AttackPayload, LogType } from "../../consts/types"
// import { logStep } from "../../debug/logUtils"
// import { getControls } from "../anim/getControls"
// import { performAttackAnimation } from "../anim/performAttackAnimation"
// import { showDamageOnTarget } from "../anim/showDamageOnTarget"
// import { updateTargetState } from "../party/updateTargetState"
// import { newFindRelevantProcs } from "./attackUtils"
// import { calculateDamageAndStatuses } from "./calculateDamageAndStatuses"

// export const newPerformAttack = async (attackPayload: AttackPayload) => {
//   const {
//     attacker,
//     target,
//     isPlayerAttack,
//     playerCreatureControlsRef,
//     enemyCreatureControlsRef,
//     attack,
//     dispatch,
//     playerCreatures,
//     computerCreatures,
//   } = attackPayload
//   console.group("%c⚔️newPerformAttack", "color: blue; font-weight: bold;")
//   console.log(
//     "%cPerforming attack from:",
//     "color: green;",
//     attacker,
//     "%cto:",
//     "color: green;",
//     target,
//     "%cattack is:",
//     "color: green;",
//     attack
//   )

//   const newLogEntry: LogType = {
//     message: `Performing attack. ${attacker?.icon}${attacker?.name} used ${attack.name} on ${attacker?.icon}${target?.name}`,
//     timestamp: new Date().toISOString(),
//     details: `#LFG`,
//     source: "handleTargetedAttack",
//   }
//   logStep(newLogEntry, dispatch)

//   // Retrieve controls
//   const { attackerControls, targetControls, targetShowDamage } = getControls(
//     attacker,
//     target,
//     isPlayerAttack,
//     playerCreatureControlsRef,
//     enemyCreatureControlsRef
//   )

//   if (!attackerControls || !targetControls || !targetShowDamage) {
//     // this shouldn't happen but theoritecial could happen if the ref wasn't instantiated
//     throw new Error("ref wasn't instantiated")
//   }
//   // Execute animations
//   await performAttackAnimation(attackerControls, targetControls, isPlayerAttack)

//   // Calculate damage and apply new statuses
//   console.group(
//     "%c🧮💻Damage Calculation & Show Damage",
//     "color: purple; font-weight: bold;"
//   )
//   // new statuses
//   // if the attack has a status, add it to the creature it
//   // if there are any statuses on the creature that are applied before the attack,
//   // apply them
//   const { statuses, damage } = calculateDamageAndStatuses(attackPayload)

//   //
//   //now apply that damage

//   console.log(
//     "%c🏥Target's health after damage:",
//     "color: red;",
//     target.health - damage
//   )
//   console.groupEnd()
//   const logEntry3: LogType = {
//     message: `damage: ${damage} to be applied to ${target.name}`,
//     timestamp: new Date().toISOString(),
//     details: `Target's health: ${target.health}-${damage}=${target.health - damage}`,
//     source: "performAttack 83",
//   }
//   logStep(logEntry3, attackPayload.dispatch)

//   // Show damage on target
//   showDamageOnTarget(targetShowDamage, damage, target.ID)
//   // Update target's health and statuses
//   const updatedCreatureObj = updateTargetState(target, damage, statuses)
//   console.log(
//     `updatedCreatureObj (with status) after attack`,
//     updatedCreatureObj
//   )
//   const curSide = isPlayerAttack ? "computerCreatures" : "playerCreatures"
//   const log4: LogType = {
//     message: `before dispatch: ${updatedCreatureObj.name} has ${updatedCreatureObj.health} health.`,
//     timestamp: new Date().toISOString(),
//     details: `Updating ${curSide} with ${updatedCreatureObj.name}'s new health.`,
//     source: "performAttack 99",
//   }
//   logStep(log4, attackPayload.dispatch)
//   // Dispatch the update

//   dispatch({
//     type: "UPDATE_CREATURE",
//     side: curSide,
//     creature: updatedCreatureObj,
//   })

//   // ----- ----- ----- -----
//   // The attack is done, do the postAttack proc's. But use the new data - not stale data
//   const updatedAttackPayload = {
//     ...attackPayload,
//     target: updatedCreatureObj,
//   }
//   const procdAttackPayload = newFindRelevantProcs(updatedAttackPayload, "beforeAttack");
//   // newFindRelevantProcs(updatedAttackPayload, "beforeAttack")

//   console.groupEnd()
// }

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

  console.group("%c⚔️newPerformAttack", "color: blue; font-weight: bold;")
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

  const newLogEntry: LogType = {
    message: `Performing attack. ${attacker?.icon}${attacker?.name} used ${attack.name} on ${attacker?.icon}${target?.name}`,
    timestamp: new Date().toISOString(),
    details: `#LFG`,
    source: "handleTargetedAttack",
  }
  logStep(newLogEntry, dispatch)

  // Retrieve controls
  const { attackerControls, targetControls, targetShowDamage } = getControls(
    attacker,
    target,
    isPlayerAttack,
    playerCreatureControlsRef,
    enemyCreatureControlsRef
  )

  if (!attackerControls || !targetControls || !targetShowDamage) {
    throw new Error("Controls not found")
  }

  const newPushLogEntry: PushLogType = {
    message: `Animate ${attacker?.name} attack on ${target?.name}`,
    timestamp: new Date().toISOString(),
    action: {
      type: "HANDLE_ATTACK_ANIMATION",
      payload: { attacker, target }, //also attackPayload
      //  await performAttackAnimation(attackerControls, targetControls, isPlayerAttack)
    },
    source: "performAttack 192",
  }

  logStep(newPushLogEntry, dispatch)
  // Execute animations
  await performAttackAnimation(attackerControls, targetControls, isPlayerAttack)

  // Calculate damage and apply new statuses
  console.group(
    "%c🧮💻Damage Calculation & Show Damage",
    "color: purple; font-weight: bold;"
  )
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
    source: "performAttack 222",
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
    source: "performAttack 254",
  }
  logStep(newPush2, dispatch)

  const curSide = isPlayerAttack ? "computerCreatures" : "playerCreatures"
  const log4: LogType = {
    message: `before dispatch: ${updatedCreatureObj.name} has ${updatedCreatureObj.health} health.`,
    timestamp: new Date().toISOString(),
    details: `Updating ${curSide} with ${updatedCreatureObj.name}'s new health.`,
    source: "performAttack 99",
  }
  logStep(log4, dispatch)

  // Use a thunk to access state before and after the update
  // dispatch((dispatch: React.Dispatch<Actions>, getState: () => State) => {
  //   console.log("State before UPDATE_CREATURE:", getState())
  //   inner({
  //     type: "UPDATE_CREATURE",
  //     creature: updatedCreatureObj,
  //   })
  //   console.log("State after UPDATE_CREATURE:", getState())
  // })
  // dispatch((innerDispatch: , getState) => {
  //   console.log("State before UPDATE_CREATURE:", getState());

  //   innerDispatch({
  //     type: "UPDATE_CREATURE",
  //     creature: updatedCreatureObj,
  //   });

  //   console.log("State after UPDATE_CREATURE:", getState());
  // });

  // dispatch((innerDispatch, getState) => {
  //   console.log("State before UPDATE_CREATURE:", getState())

  //   // innerDispatch({
  //   //   type: "UPDATE_CREATURE",
  //   //   creature: updatedCreatureObj,
  //   // })

  //   console.log("State after UPDATE_CREATURE:", getState())
  // })

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

// export const newOldPerformAttack = async (
//   attacker,
//   target,
//   isPlayerAttack,
//   playerCreatureControlsRef,
//   enemyCreatureControlsRef,
//   attack,
//   dispatch
// ) => {
//   console.group("%cnewPerformAttack", "color: blue; font-weight: bold;")
//   console.log(
//     "%cPerforming attack from:",
//     "color: green;",
//     attacker,
//     "%cto:",
//     "color: green;",
//     target,
//     "%cattack is:",
//     "color: green;",
//     attack
//   )

//   // Retrieve the correct controls
//   const controlsRef = isPlayerAttack
//     ? playerCreatureControlsRef
//     : enemyCreatureControlsRef

//   const attackerControls = controlsRef.current[attacker.ID]?.controls
//   const targetControls = getCreatureControlsById(
//     target.ID,
//     playerCreatureControlsRef,
//     enemyCreatureControlsRef
//   )?.controls
//   const targetShowDamage = getCreatureControlsById(
//     target.ID,
//     playerCreatureControlsRef,
//     enemyCreatureControlsRef
//   )?.showDamage

//   if (!attackerControls || !targetControls) {
//     console.warn(
//       `%c⚠️ Animation controls not found for attacker ID: ${attacker.ID} or target ID: ${target.ID}, skipping attack animation.`,
//       "color: orange; font-weight: bold;"
//     )
//     console.groupEnd()
//     return 0 // Return to avoid NaN errors later
//   }

//   const direction = isPlayerAttack ? -1 : 1
//   const distance = 150
//   // Execute animations in sequence
//   await moveAttacker(attackerControls, direction, distance)
//   await shakeTarget(targetControls)
//   await returnAttacker(attackerControls)
//   // Calculate damage
//   console.group(
//     "%cDamage Calculation & Show Damage",
//     "color: purple; font-weight: bold;"
//   )

//   // apply immediate Statuses (Buff/Debuffs, but should be a use of them,
//   // which means that this would be more rare likely, and
//   // we should prob have more for `heal` or `stun` or `poison` etc
//   // that occur before the attack)
//   // so applyEffects(state, timing)
//   const objAfterImmediateStatuses = findRelevantStatusesToGive(
//     attacker,
//     target,
//     attack,
//     "beforeAttack"
//   )
//   console.log(
//     `objAfterImmediateStatuses .attack,
//     .attacker,
//     .target,
//     .changes`,
//     objAfterImmediateStatuses.attack,
//     objAfterImmediateStatuses.attacker,
//     objAfterImmediateStatuses.target,
//     objAfterImmediateStatuses.changes
//   )
//   // --n
//   //replace below with calcAttack
//   console.log(
//     `before calcAttack: attacker, target, attack`,
//     attacker,
//     target,
//     attack
//   )
//   const { statuses, damage } = calcAttack(attacker, target, attack)

//   console.log("Statuses after calcStatuses:", statuses)

//   //--n

//   const damagedHP = target.health - damage
//   console.log("%cTarget's health after damage:", "color: red;", damagedHP)
//   console.groupEnd()

//   // Show damage on target
//   if (targetShowDamage) {
//     try {
//       console.log("%cShowing damage on target:", "color: red;", target.ID)
//       targetShowDamage(damage)
//       console.groupEnd()
//     } catch (error) {
//       console.error("%cError showing damage on target:", "color: red;", error)
//     }
//   }

//   if (target.statuses) {
//     console.log(
//       "%cTarget statuses after attack:",
//       "color: orange;",
//       target.statuses
//     )
//   }

//   console.groupEnd()

//   //return or just change the target's health/statuses?

//   const updatedCreatureObj = {
//     ...target,
//     health: Math.max(0, target.health - damage),
//     statuses: statuses,
//   }

//   console.log(
//     `updatedCreatureObj (with status) after attack`,
//     updatedCreatureObj
//   )

//   //update target with damage
//   dispatch({
//     type: "UPDATE_CREATURE",
//     side: isPlayerAttack ? "computerCreatures" : "playerCreatures",
//     // creature: updatedComputerCreature,
//     creature: updatedCreatureObj,
//   })

//   // apply the status effects here:
//   // applyEffect(statuses, timing)
// }

// step by step trigger animations and dispatches of each effect and dmg
// export const pAttack = async (
//   attacker,
//   target,
//   isPlayerAttack,
//   playerCreatureControlsRef,
//   enemyCreatureControlsRef,
//   attack,
//   dispatch,
//   playerCreatures,
//   computerCreatures
// ) => {
//   //  pass in both parties, attacker, the attack, and the target
//   // setup framer motion controls
//   const { attackerControls, targetControls, targetShowDamage } = getControls(
//     attacker,
//     target,
//     isPlayerAttack,
//     playerCreatureControlsRef,
//     enemyCreatureControlsRef
//   )
//   // run status effects before attack (stun, sleep, )
//   // - run animations and dispatch changes ^
//   // run attack (take into account the attack's damage, and any status effects)
//   const direction = isPlayerAttack ? -1 : 1
//   const distance = 150

//   // executeAttackPortion [ animations, calculate changes, dispatch changes ]
//   // a. Execute animations
//   await performAttackAnimation(
//     attackerControls,
//     targetControls,
//     direction,
//     distance
//   )
//   // b. calculate changes

//   const { statuses, damage } = calculateDamageAndStatuses(
//     attacker,
//     target,
//     attack,
//     playerCreatures,
//     computerCreatures,
//     dispatch,
//     isPlayerAttack,
//     playerCreatureControlsRef,
//     enemyCreatureControlsRef
//   )

//   // Show damage on target
//   showDamageOnTarget(targetShowDamage, damage, target.ID)

//   // c. dispatch changes
//   // c1:Update target's health
//   const updatedCreatureObj = updateTargetState(target, damage, statuses)
//   dispatch({
//     type: "UPDATE_CREATURE",
//     side: isPlayerAttack ? "computerCreatures" : "playerCreatures",
//     creature: updatedCreatureObj,
//   })
//   // c2: Apply status (animate and dispatch) Update update status effects
//   // executeApplyStatusEffectsPortion [ animations, calculate changes, dispatch changes ]

//   // apply status effects after attack (poison, burn, heal)
//   // - run animations and dispatch changes^
//   // executeProcStatusEffectsPortion [ animations, calculate changes, dispatch changes ]
//   // run status effects after attack (poison, burn, heal)
//   // - run animations and dispatch changes^
//   // executeEndOfTurnPortion [ animations, calculate changes, dispatch changes ]
//   // run end of turn effects ()
//   // changeTurns
//   // run end of turn things (turn + 1, change priority)
// }
