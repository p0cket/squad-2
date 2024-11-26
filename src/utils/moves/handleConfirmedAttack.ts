import { attacks } from "../../consts/attacks"
import { AttackPayload, Creature } from "../../consts/types"
import { processEndOfTurn } from "../turn/processEndOfTurn"
import { newPerformAttack } from "./performAttack"
// import { pocketLog } from "../../pocketLog/utils"
export const getAliveCreatures = (creatures: Creature[]) => {
  return creatures.filter((c) => c.health > 0)
}
// from chooseTargetsModal.js use when someone selects a target and runs the attack
export const handleTargetedAttack = async (state: any, attackPayload: AttackPayload) => {
  if (!attackPayload) {
    console.error("No attackPayload provided for handleTargetedAttack")
    return
  }
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
  console.group(
    `running attack: ${attacker?.name} uses ${attack?.name} on ${target?.name}. AttackPayload:`,
    attackPayload
  )
  // PLAYER ATTACK:
  try {
    await newPerformAttack(
      attackPayload
    )
  } catch (error) {
    console.error("Error in performAttack:", error)
  }
  console.log(
    `after newPerformAttack: state.playerCreatures, state.computerCreatures`,
    playerCreatures,
    computerCreatures
  )

  // COMPUTER ATTACK:
  const alivePlayers = getAliveCreatures(state.playerCreatures)
  const aliveComputers = getAliveCreatures(state.computerCreatures)
  const bothTeamsAlive = alivePlayers.length > 0 && aliveComputers.length > 0
  if (bothTeamsAlive) {
    const computerAttacker = aliveComputers[0] //{ comp: 0 }
    const computersTarget = alivePlayers[0]//{ user: 0 }
    console.log(
      "Computer attacking player: Computer Attacker details & Player Target details before attack:",
      computerAttacker,
      computersTarget
    )
    const computerAttackPayload: AttackPayload = {
      attacker: computerAttacker,
      target: computersTarget, //these should rly be indexes
      playerCreatures: state.playerCreatures,
      computerCreatures: state.computerCreatures,
      isPlayerAttack: false, //isPlayer: false -> so computer
      playerCreatureControlsRef,
      enemyCreatureControlsRef,
      attack: attacks.fireball, // attack. make a comp select a random attack they have
      dispatch,
    }

    try {
      await newPerformAttack(
        computerAttackPayload
      )
    } catch (error) {
      console.error("Error in performAttack:", error)
      // Set damage to zero if there's an error to prevent NaN issues
    }
  }
  //handleEndOfTurnActions
  // processEndOfTurn(state, dispatch)
  // applyAfterMoveStatusEffects  // go through and apply poison animation, and any other
  //stacked ones. At the end increase turn by 1.
  processEndOfTurn(state, dispatch)
  console.groupEnd()
}

export const runPlayerMove = async () => {}
// Simple log
// pocketLog(
//   `${new Date().toISOString()} isPlayerAttack ${Math.floor(
//     Math.random() * 1000
//   )}`,
//   isPlayerAttack
// )
// Log with tags
// pocketLog("userScore", isPlayerAttack, { tags: ["score", "user"] })
// Log with a condition
// pocketLog("stateKeys", Object.keys(state).length, {
//   condition: Object.keys(state).length > 0 ? "warning" : null,
// })
// Log with a condition
// const responseTime = await new Promise((resolve) => {
//   setTimeout(() => {
//     resolve(2500)
//   }, 1000)
// })
// Log with a custom message and condition
// pocketLog("apiResponseTime", responseTime, {
//   message: "Response time exceeded threshold",
//   condition: responseTime > 2000 ? "issue" : null,
// })
