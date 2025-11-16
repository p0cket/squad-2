import { AttackPayload, Creature } from "../../consts/types/types"
import { runLoggingNonsense } from "../../debug/runLoggingNonsese"
import { handleCheckingIfBattleEnds } from "../battle/checkAndHandleGameOver"
import { processEndOfTurn } from "../turn/processEndOfTurn"
import { checkTeamsAlive } from "./checkTeamsAlive"
import { createComputerAttackPayload } from "./createComputerAttackPayload"
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
    console.error("No attackPayload provided for runTurn")
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
    // add player atk to the stack, then run the stack.
    await newPerformAttack(attackPayload)
  } catch (error) {
    console.error("Error in performAttack:", error)
  }
  console.log(
    `🔚 after newPerformAttack: state.playerCreatures, state.computerCreatures`,
    playerCreatures,
    computerCreatures
  )
  // maybe throw this into the newPerformAttack function at the end, seems part of it
  const teamsAliveStatus = checkTeamsAlive(playerCreatures, computerCreatures)
  //before the attack, we should see if we end the game
  handleCheckingIfBattleEnds(teamsAliveStatus, dispatch)

  // COMPUTER ATTACK:
  runLoggingNonsense({
    teamsAliveStatus,
    attacker,
    target,
    dispatch,
  })

  // Create and use the computer's attack payload
  const computerAttackPayload = createComputerAttackPayload(
    teamsAliveStatus.aliveComputerCreatures,
    teamsAliveStatus.alivePlayerCreatures,
    state,
    playerCreatureControlsRef,
    enemyCreatureControlsRef,
    dispatch
  )

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
