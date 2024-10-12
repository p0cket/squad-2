import { checkGameOver, handleEndOfTurnEffects } from "./turnUtils"

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

export const processEndOfTurn = (state, dispatch) => {
  // Apply end-of-turn effects to the player's and computer's creatures
  const updatedPlayerCreatures = handleEndOfTurnEffects(state.playerCreatures)
  const updatedComputerCreatures = handleEndOfTurnEffects(
    state.computerCreatures
  )

  console.log(
    "Updated Player Creatures & Updated Computer Creatures. Move to back?:",
    updatedPlayerCreatures,
    updatedComputerCreatures
  )

  // Move dead creatures to the back
  updatedPlayerCreatures.forEach((creature) => {
    if (creature.health <= 0) {
      dispatch({
        type: "MOVE_CREATURE_TO_BACK",
        payload: { side: "playerCreatures", creatureId: creature.ID },
      })
    }
  })
  updatedComputerCreatures.forEach((creature) => {
    if (creature.health <= 0) {
      dispatch({
        type: "MOVE_CREATURE_TO_BACK",
        payload: { side: "computerCreatures", creatureId: creature.ID },
      })
    }
  })

  // Update the state with the new creature states
  dispatch({
    type: "UPDATE_CREATURES",
    side: "playerCreatures",
    creatures: updatedPlayerCreatures,
  })
  dispatch({
    type: "UPDATE_CREATURES",
    side: "computerCreatures",
    creatures: updatedComputerCreatures,
  })

  // Check for game over conditions
  checkAndHandleGameOver(updatedPlayerCreatures, updatedComputerCreatures, dispatch)

  // Return the game status
  return {
    playerLost: checkGameOver(updatedPlayerCreatures),
    computerLost: checkGameOver(updatedComputerCreatures),
  }
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
