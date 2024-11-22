import { checkGameOver, handleEndOfTurnEffects } from "./turnUtils"
import { moveDeadCreaturesToBack } from "./creatureUtils"

export const resetCreatures = (creatures) => {
  return creatures.map((creature) => {
    const clonedCreature = structuredClone(creature)
    clonedCreature.health = clonedCreature.maxHealth
    clonedCreature.statusEffects = []
    return clonedCreature
  })
}

export const selectRandomCreature = (creatures) => {
  return creatures[Math.floor(Math.random() * creatures.length)]
}

export const calculateHealedHealth = (creature, healAmount) => {
  return Math.min(creature.health + healAmount, creature.maxHealth)
}

// go through all (mods, effects) and apply to each relevant
// target (creature, party)
export const processEndOfTurn = (state, dispatch) => {
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

export const getAliveCreatures = (creatures) => {
  return creatures.filter((c) => c.health > 0)
}

// Abstracted game over check logic
export const checkAndHandleGameOver = (
  playerCreatures,
  computerCreatures,
  dispatch
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
