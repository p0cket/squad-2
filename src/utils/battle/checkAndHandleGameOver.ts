import { Creature } from "../../consts/types"
import { checkGameOver } from "../turnUtils"

/**
 * Checks if the game is over by evaluating the player's and computer's creatures,
 * and dispatches the appropriate action based on the result.
 */
export const checkAndHandleGameOver = (
  playerCreatures: Creature[],
  computerCreatures: Creature[],
  dispatch: React.Dispatch<any>
) => {
  const playerLost = checkGameOver(playerCreatures)
  const computerLost = checkGameOver(computerCreatures)

  if (computerLost) {
    dispatch({ type: "WIN_GAME" })
    console.log("Computer lost, game won!")
    setTimeout(() => dispatch({ type: "RESET_BATTLE" }), 100)
  } else if (playerLost) {
    dispatch({ type: "LOSE_GAME" })
    console.log("Player lost, game over!")
    setTimeout(() => dispatch({ type: "RESET_BATTLE" }), 100)
  }
}
