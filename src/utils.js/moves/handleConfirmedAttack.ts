import { attacks } from "../../consts/attacks"
import { Creature } from "../../consts/types"
import { processEndOfTurn } from "../turn/processEndOfTurn"
// import { pocketLog } from "../../pocketLog/utils"
import { newPerformAttack } from "./performAttack"
export const getAliveCreatures = (creatures: Creature[]) => {
  return creatures.filter((c) => c.health > 0)
}
// export const handleAttack = async (
//   state,
//   dispatch,
//   playerCreatureControlsRef,
//   enemyCreatureControlsRef
// ) => {
//   console.log(
//     "Handling Attack... State at start:"
//     // state
//   )
//   // just turns + 1
//   dispatch({ type: "INCREMENT_TURN" })

//   const alivePlayerCreatures = getAliveCreatures(state.playerCreatures)
//   const aliveComputerCreatures = getAliveCreatures(state.computerCreatures)

//   console.log("Alive player creatures:", alivePlayerCreatures)
//   console.log("Alive computer creatures:", aliveComputerCreatures)

//   // checking if both player is alive and comp too.
//   const isPartyDead = checkIfPartyDead(aliveComputerCreatures)
//   const isPlayerDead = checkIfPartyDead(alivePlayerCreatures)
//   // but now what do we do with this info?

//   if (alivePlayerCreatures.length > 0 && aliveComputerCreatures.length > 0) {
//     const playerAttacker = alivePlayerCreatures[0]
//     const computerTarget = aliveComputerCreatures[0]
//     console.log(
//       "Player Attacking computer. Player, target:",
//       playerAttacker,
//       computerTarget
//     )
//     let damage
//     try {
//       damage = await performAttack(
//         playerAttacker,
//         computerTarget,
//         true,
//         playerCreatureControlsRef,
//         enemyCreatureControlsRef,
//         dispatch
//       )
//       console.log("Damage dealt by player:", damage)
//     } catch (error) {
//       console.error("Error in performAttack:", error)
//       damage = 0 // Set damage to zero if there's an error to prevent NaN issues
//     }

//     // error handling
//     // if (isNaN(damage) || damage === undefined) {
//     //   console.error(
//     //     "Error: Damage is NaN or undefined. Player Attacker:",
//     //     playerAttacker,
//     //     "Computer Target:",
//     //     computerTarget
//     //   )
//     //   damage = 0 // Prevent health from being affected by invalid damage
//     // }

//     // lets move this into the performAttack function
//     const updatedComputerCreature = {
//       ...computerTarget,
//       health: Math.max(0, computerTarget.health - damage),
//     }

//     //update computer with damage
//     dispatch({
//       type: "UPDATE_CREATURE",
//       side: "computerCreatures",
//       creature: updatedComputerCreature,
//     })

//     /// ^^^^

//     console.log(
//       "Computer Target details after attack:",
//       updatedComputerCreature,
//       null,
//       2
//     )
//   }

//   if (alivePlayerCreatures.length > 0 && aliveComputerCreatures.length > 0) {
//     const computerAttacker = aliveComputerCreatures[0]
//     const playerTarget = alivePlayerCreatures[0]

//     console.log("Computer attacking player...")
//     console.log("Computer Attacker details:", computerAttacker)
//     console.log("Player Target details before attack:", playerTarget)

//     let damage
//     try {
//       damage = await performAttack(
//         computerAttacker,
//         playerTarget,
//         false,
//         playerCreatureControlsRef,
//         enemyCreatureControlsRef,
//         dispatch
//       )
//       console.log("Damage dealt by computer:", damage)
//     } catch (error) {
//       console.error("Error in performAttack:", error)
//       damage = 0 // Set damage to zero if there's an error to prevent NaN issues
//     }

//     if (isNaN(damage) || damage === undefined) {
//       console.error(
//         "Error: Damage is NaN or undefined. Computer Attacker, Player Target:",
//         computerAttacker,
//         playerTarget
//       )
//       damage = 0 // Prevent health from being affected by invalid damage
//     }

//     const updatedPlayerCreature = {
//       ...playerTarget,
//       health: Math.max(0, playerTarget.health - damage),
//     }

//     dispatch({
//       type: "UPDATE_CREATURE",
//       side: "playerCreatures",
//       creature: updatedPlayerCreature,
//     })

//     console.log("Player Target details after attack:", updatedPlayerCreature)
//   }

//   if (aliveComputerCreatures.length === 0) {
//     console.log("Player has won the battle. Dispatching WIN_GAME...")
//     dispatch({ type: "WIN_GAME" })
//   }

//   const { playerLost, computerLost } = processEndOfTurn(state, dispatch)
//   console.log(
//     "End of turn processing results: Player Lost:",
//     playerLost,
//     "Computer Lost:",
//     computerLost
//   )

//   if (!playerLost && !computerLost) {
//     console.log("Preparing for next turn...")
//     dispatch({ type: "PREPARE_NEXT_TURN" })
//   }
// }
// from chooseTargetsModal.js use when someone selects a target and runs the attack
export const handleTargetedAttack = async (state, attackPayload) => {
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
      // attacker,
      // selectedTarget,
      // true, //isPlayer: true so not computer
      // playerCreatureControlsRef,
      // enemyCreatureControlsRef,
      // attack,
      // dispatch,
      // state.playerCreatures,
      // state.computerCreatures
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
    const computerAttacker = aliveComputers[0]
    const computersTarget = alivePlayers[0]
    // const computerAttacker = { comp: 0 }
    // const computersTarget = { user: 0 }
    console.log(
      "Computer attacking player: Computer Attacker details & Player Target details before attack:",
      computerAttacker,
      computersTarget
    )
    const computerAttackPayload = {
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
        // computerAttacker,
        // computersTarget,
        // false, //isPlayer: false -> so computer
        // playerCreatureControlsRef,
        // enemyCreatureControlsRef,
        // attacks.fireball, // attack. make a comp select a random attack they have
        // dispatch,
        // state.playerCreatures,
        // state.computerCreatures
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
