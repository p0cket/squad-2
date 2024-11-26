// go through all (mods, effects) and apply to each relevant
// import { moveDeadCreaturesToBack } from "../creatureUtils"
import { checkAndHandleGameOver } from "../battle/checkAndHandleGameOver"
import { moveDeadCreaturesToBack } from "../party/moveCreatureToBack"
import { checkGameOver } from "../turnUtils"
import { handleEndOfTurnEffects } from "./handleEndOfTurnEffects"

// target (creature, party)
export const processEndOfTurn = (
  state: any,
  dispatch: (action: any) => void
) => {
  console.group("%c🔄 processEndOfTurn", "color: blue; font-weight: bold;")
  // Apply end-of-turn effects to the player's and computer's creatures
  const updatedPlayers = handleEndOfTurnEffects(state.playerCreatures)
  const updatedComputers = handleEndOfTurnEffects(state.computerCreatures)

  console.log(
    "Updated Player Creatures & Updated Computer Creatures. Move to back?:",
    updatedPlayers,
    updatedComputers
  )

  // Move dead creatures to the back
  moveDeadCreaturesToBack(updatedPlayers, "playerCreatures", dispatch)
  moveDeadCreaturesToBack(updatedComputers, "computerCreatures", dispatch)

  // Update the state with the new creature states
  dispatch({
    type: "UPDATE_CREATURES",
    side: "playerCreatures",
    creatures: updatedPlayers,
  })
  dispatch({
    type: "UPDATE_CREATURES",
    side: "computerCreatures",
    creatures: updatedComputers,
  })

  // Check for game over conditions
  checkAndHandleGameOver(updatedPlayers, updatedComputers, dispatch)

  const playerLost = checkGameOver(updatedPlayers)
  const computerLost = checkGameOver(updatedComputers)

  console.log(
    `End of turn processing results: Player Lost? ${playerLost} Computer Lost? ${computerLost}`
  )

  const bothTeamsHaventLost = !playerLost && !computerLost
  if (bothTeamsHaventLost) {
    console.log("bothTeamsHaventLost, So preparing for next turn...")
    dispatch({ type: "INCREMENT_TURN" })
    dispatch({ type: "PREPARE_NEXT_TURN" })
  }
  console.groupEnd()
}
