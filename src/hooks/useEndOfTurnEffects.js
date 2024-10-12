// import { useEffect } from "react"
// import { checkGameOver, handleEndOfTurnEffects } from "../utils.js/turnUtils"
// import { useDispatchContext, useStateContext } from "../GameContext"
// // Imports the utility functions for applying end-of-turn effects and checking if the game is over.

// // Custom hook to handle end-of-turn effects and victory/defeat checks
// export const useEndOfTurnEffects = () => {
//     //state, dispatch
//     const state = useStateContext()
//     const dispatch = useDispatchContext()
//   useEffect(() => {
//     // Apply end-of-turn effects to the player's creatures (e.g., poison damage, buffs, etc.)
//     const updatedPlayerCreatures = handleEndOfTurnEffects(state.playerCreatures)
//     const updatedComputerCreatures = handleEndOfTurnEffects(
//       state.computerCreatures
//     )

//     // Log the updated state of creatures for debugging purposes
//     console.log("Updated Player Creatures: ", updatedPlayerCreatures)
//     console.log("Updated Computer Creatures: ", updatedComputerCreatures)
    
//     updatedPlayerCreatures.forEach((creature) => {
//       if (creature.health <= 0) {
//         dispatch({
//           type: "MOVE_CREATURE_TO_BACK",
//           payload: { side: "playerCreatures", creatureId: creature.ID },
//         });
//       }
//     });
  
//     updatedComputerCreatures.forEach((creature) => {
//       if (creature.health <= 0) {
//         dispatch({
//           type: "MOVE_CREATURE_TO_BACK",
//           payload: { side: "computerCreatures", creatureId: creature.ID },
//         });
//       }
//     });
//     // Dispatch the updated player creatures into the global state
//     dispatch({
//       type: "UPDATE_CREATURES", // Action to update the state
//       side: "playerCreatures", // Indicates that it's the player's creatures being updated
//       creatures: updatedPlayerCreatures, // The new state of the player's creatures
//     })

//     // Dispatch the updated computer creatures into the global state
//     dispatch({
//       type: "UPDATE_CREATURES", // Action to update the state
//       side: "computerCreatures", // Indicates that it's the computer's creatures being updated
//       creatures: updatedComputerCreatures, // The new state of the computer's creatures
//     })

//     // Check for game over conditions immediately after updating the creatures
//     const playerLost = checkGameOver(updatedPlayerCreatures)
//     const computerLost = checkGameOver(updatedComputerCreatures)

//     // Trigger the appropriate game over action based on the outcome
//     if (computerLost) {
//       // If all computer creatures are dead, the player wins
//       dispatch({ type: "WIN_GAME" }) // Set the game state to win
//       console.log("Computer lost, game won!")

//       // Optional: Delay resetting the battle slightly for animation purposes
//       setTimeout(() => dispatch({ type: "RESET_BATTLE" }), 100)
//     } else if (playerLost) {
//       // If all player creatures are dead, the player loses
//       dispatch({ type: "LOSE_GAME" }) // Set the game state to lose
//       console.log("Player lost, game over!")

//       // Optional: Delay resetting the battle slightly for animation purposes
//       setTimeout(() => dispatch({ type: "RESET_BATTLE" }), 100)
//     }
//     // We check both conditions immediately after effects are applied, no need to wait for a new turn
//   }, [state.playerCreatures, state.computerCreatures, dispatch])
//   // Now, the effect depends on any change in player or computer creatures, triggering the effect as soon as creatures are updated.
// }
