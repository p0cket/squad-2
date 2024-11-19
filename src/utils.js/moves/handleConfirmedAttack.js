import { attacks } from "../../consts/attacks"
import { getAliveCreatures, processEndOfTurn } from "../battleUtils"
import { checkIfPartyDead } from "../turnUtils"
import { newPerformAttack, performAttack } from "./performAttack"

export const handleAttack = async (
  state,
  dispatch,
  playerCreatureControlsRef,
  enemyCreatureControlsRef
) => {
  console.log(
    "Handling Attack... State at start:"
    // state
  )
  // just turns + 1
  dispatch({ type: "INCREMENT_TURN" })

  const alivePlayerCreatures = getAliveCreatures(state.playerCreatures)
  const aliveComputerCreatures = getAliveCreatures(state.computerCreatures)

  console.log("Alive player creatures:", alivePlayerCreatures)
  console.log("Alive computer creatures:", aliveComputerCreatures)

  // checking if both player is alive and comp too.
  const isPartyDead = checkIfPartyDead(aliveComputerCreatures)
  const isPlayerDead = checkIfPartyDead(alivePlayerCreatures)
  // but now what do we do with this info?

  if (alivePlayerCreatures.length > 0 && aliveComputerCreatures.length > 0) {
    const playerAttacker = alivePlayerCreatures[0]
    const computerTarget = aliveComputerCreatures[0]
    console.log(
      "Player Attacking computer. Player, target:",
      playerAttacker,
      computerTarget
    )
    let damage
    try {
      damage = await performAttack(
        playerAttacker,
        computerTarget,
        true,
        playerCreatureControlsRef,
        enemyCreatureControlsRef,
        dispatch
      )
      console.log("Damage dealt by player:", damage)
    } catch (error) {
      console.error("Error in performAttack:", error)
      damage = 0 // Set damage to zero if there's an error to prevent NaN issues
    }

    // error handling
    // if (isNaN(damage) || damage === undefined) {
    //   console.error(
    //     "Error: Damage is NaN or undefined. Player Attacker:",
    //     playerAttacker,
    //     "Computer Target:",
    //     computerTarget
    //   )
    //   damage = 0 // Prevent health from being affected by invalid damage
    // }

    // lets move this into the performAttack function
    const updatedComputerCreature = {
      ...computerTarget,
      health: Math.max(0, computerTarget.health - damage),
    }

    //update computer with damage
    dispatch({
      type: "UPDATE_CREATURE",
      side: "computerCreatures",
      creature: updatedComputerCreature,
    })

    /// ^^^^

    console.log(
      "Computer Target details after attack:",
      updatedComputerCreature,
      null,
      2
    )
  }

  if (alivePlayerCreatures.length > 0 && aliveComputerCreatures.length > 0) {
    const computerAttacker = aliveComputerCreatures[0]
    const playerTarget = alivePlayerCreatures[0]

    console.log("Computer attacking player...")
    console.log("Computer Attacker details:", computerAttacker)
    console.log("Player Target details before attack:", playerTarget)

    let damage
    try {
      damage = await performAttack(
        computerAttacker,
        playerTarget,
        false,
        playerCreatureControlsRef,
        enemyCreatureControlsRef,
        dispatch
      )
      console.log("Damage dealt by computer:", damage)
    } catch (error) {
      console.error("Error in performAttack:", error)
      damage = 0 // Set damage to zero if there's an error to prevent NaN issues
    }

    if (isNaN(damage) || damage === undefined) {
      console.error(
        "Error: Damage is NaN or undefined. Computer Attacker, Player Target:",
        computerAttacker,
        playerTarget
      )
      damage = 0 // Prevent health from being affected by invalid damage
    }

    const updatedPlayerCreature = {
      ...playerTarget,
      health: Math.max(0, playerTarget.health - damage),
    }

    dispatch({
      type: "UPDATE_CREATURE",
      side: "playerCreatures",
      creature: updatedPlayerCreature,
    })

    console.log("Player Target details after attack:", updatedPlayerCreature)
  }

  if (aliveComputerCreatures.length === 0) {
    console.log("Player has won the battle. Dispatching WIN_GAME...")
    dispatch({ type: "WIN_GAME" })
  }

  const { playerLost, computerLost } = processEndOfTurn(state, dispatch)
  console.log(
    "End of turn processing results: Player Lost:",
    playerLost,
    "Computer Lost:",
    computerLost
  )

  if (!playerLost && !computerLost) {
    console.log("Preparing for next turn...")
    dispatch({ type: "PREPARE_NEXT_TURN" })
  }
}
// from chooseTargetsModal.js use when someone selects a target and runs the attack
export const handleTargetedAttack = async (
  state,
  dispatch,
  playerCreatureControlsRef,
  enemyCreatureControlsRef,
  attackPayload
) => {
  if (!attackPayload) {
    console.error("No attackPayload provided for handleTargetedAttack")
    return
  }
  const { attacker, selectedTarget, isPlayerAttack, attack } = attackPayload
  console.group(`running attack: ${attacker.name} ${attack.name}`)
  // check if both player is alive and comp too.
  // When should we do that?

  // PLAYER ATTACK:
  // no need rly to have damage = something, we can just do the dispatch
  try {
    await newPerformAttack(
      attacker,
      selectedTarget,
      true, //isPlayer: true so not computer
      playerCreatureControlsRef,
      enemyCreatureControlsRef,
      attack,
      dispatch
    )
  } catch (error) {
    console.error("Error in performAttack:", error)
    // damage = 0 // Set damage to zero if there's an error to prevent NaN issues
  }
  console.log(
    `after newPerformAttack: state.playerCreatures, state.computerCreatures`,
    state.playerCreatures,
    state.computerCreatures
  )

  // COMPUTER ATTACK:
  // We're using old logic here, but it's fine for now.
  const alivePlayerCreatures = getAliveCreatures(state.playerCreatures)
  const aliveComputerCreatures = getAliveCreatures(state.computerCreatures)
  if (alivePlayerCreatures.length > 0 && aliveComputerCreatures.length > 0) {
    const computerAttacker = aliveComputerCreatures[0]
    const computersTarget = alivePlayerCreatures[0]

    console.log(
      "Computer attacking player: Computer Attacker details & Player Target details before attack:",
      computerAttacker,
      computersTarget
    )
    let damage
    let target
    try {
      await newPerformAttack(
        computerAttacker,
        computersTarget,
        false, //isPlayer: false -> so computer
        playerCreatureControlsRef,
        enemyCreatureControlsRef,
        attacks.fireball, // attack. make a comp select a random attack they have
        dispatch
      )
      console.log("Damage dealt by computer:", damage)
    } catch (error) {
      console.error("Error in performAttack:", error)
      // Set damage to zero if there's an error to prevent NaN issues
    }

    console.log("Player Target details after attack:", target) //updatedCreatureObj
  }
  //handleEndOfTurnActions

  // applyAfterMoveStatusEffects  // go through and apply poison animation, and any other
  //stacked ones. At the end increase turn by 1.
  //   if (aliveComputerCreatures.length <= 0) {
  //     console.log("Player has won the battle. Dispatching WIN_GAME...")
  //     dispatch({ type: "WIN_GAME" })
  //   }

  const { playerLost, computerLost } = processEndOfTurn(state, dispatch)
  console.log(
    "End of turn processing results: Player Lost:",
    playerLost,
    "Computer Lost:",
    computerLost
  )

  if (!playerLost && !computerLost) {
    console.log("!playerLost && !computerLost, So preparing for next turn...")
    dispatch({ type: "INCREMENT_TURN" })
    dispatch({ type: "PREPARE_NEXT_TURN" })
  }

  console.groupEnd()
}

export const runPlayerMove = async () => {}
