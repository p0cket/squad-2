import { attacks } from "../../consts/attacks"
import {
  AttackPayload,
  Creature,
  LogType,
  PushLogType,
} from "../../consts/types/types"
import { logStep } from "../../debug/logUtils"
import { checkAndHandleGameOver } from "../battle/checkAndHandleGameOver"
import { processEndOfTurn } from "../turn/processEndOfTurn"
import { checkTeamsAlive } from "./checkTeamsAlive"
import { newPerformAttack } from "./performAttack"

export const getAliveCreatures = (creatures: Creature[]) => {
  return creatures.filter((c) => c.health > 0)
}

// runTurn
// run the player's attack, then run the opponent's attack
export const runTurn = async (
  // export const handleTargetedAttack = async (
  state: any,
  attackPayload: AttackPayload
) => {
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
    `⚔️⚔️⚔️running attack: ${attacker?.name} uses ${attack?.name} on ${target?.name}. AttackPayload:`,
    attackPayload
  )
  // PLAYER ATTACK:
  try {
    await newPerformAttack(attackPayload)
  } catch (error) {
    console.error("Error in performAttack:", error)
  }
  console.log(
    `🔚 after newPerformAttack: state.playerCreatures, state.computerCreatures`,
    playerCreatures,
    computerCreatures
  )


//before the attack, we should see if we end the game
  // COMPUTER ATTACK:
  const teamsAliveStatus = checkTeamsAlive(playerCreatures, computerCreatures)
  // runCheckBattleEndConditions(teamsAliveStatus) // if teamsAliveStatus. playerTeamAlive
  // run  checkAndHandleGameOver ? 
 


  dispatch({
    type: "ADD_OBJ_TO_DEBUG_STEP",
    payload: {
      stepIndex: 0,
      // stepTitle: "1. Attack Initialization",
      obj:  teamsAliveStatus.aliveComputerCreatures,
    },
  })
  dispatch({
    type: "ADD_OBJ_TO_DEBUG_STEP",
    payload: {
      stepIndex: 0,
      obj: teamsAliveStatus.alivePlayerCreatures,
    },
  })

  const newLogEntry: LogType = {
    message: `So: ${attacker?.name} on ${target?.name}`,
    timestamp: new Date().toISOString(),
    details: `Does this look right?:`,
    source: "handleTargetedAttack",
  }

  logStep(newLogEntry, dispatch)

  const logEntry: LogType = {
    message: `Attack by ${attacker?.name} on ${target?.name}`,
    timestamp: new Date().toISOString(),
    details: `Here we're expecting to see the attackPayload:`,
    source: "handleTargetedAttack",
    // details: `Attack details: ${JSON.stringify(attackPayload)}`,
  }
  dispatch({
    type: "ADD_OBJ_TO_DEBUG_STEP",
    payload: {
      stepIndex: 0,
      obj: logEntry,
    },
  })

  //hmm? Why is this the logic?
  const computerAttacker = teamsAliveStatus.aliveComputerCreatures[0] //{ comp: 0 }
  const computersTarget = teamsAliveStatus.alivePlayerCreatures[0] //{ user: 0 }
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
    await newPerformAttack(computerAttackPayload)
  } catch (error) {
    console.error("Error in performAttack:", error)
    // Set damage to zero if there's an error to prevent NaN issues
  }

  //handleEndOfTurnActions
  // processEndOfTurn(state, dispatch)
  // applyAfterMoveStatusEffects  // go through and apply poison animation, and any other
  //stacked ones. At the end increase turn by 1.
  processEndOfTurn(state, dispatch)
  console.groupEnd()
}
