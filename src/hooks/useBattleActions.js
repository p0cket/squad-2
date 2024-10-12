// hooks/useBattleActions.js
import { useCallback } from "react"
import { useDispatchContext, useStateContext } from "../GameContext"
import { performAttack } from "../utils.js/attackUtils"
import { getAliveCreatures, processEndOfTurn } from "../utils.js/battleUtils"

export const useBattleActions = (
  playerCreatureControlsRef,
  enemyCreatureControlsRef
) => {
  const state = useStateContext()
  const dispatch = useDispatchContext()

  const handleAttack = useCallback(async () => {
    console.log("Handling Attack... State at start:", JSON.stringify(state, null, 2))
    dispatch({ type: "INCREMENT_TURN" })

    const alivePlayerCreatures = getAliveCreatures(state.playerCreatures)
    const aliveComputerCreatures = getAliveCreatures(state.computerCreatures)

    console.log("Alive player creatures:", JSON.stringify(alivePlayerCreatures, null, 2))
    console.log("Alive computer creatures:", JSON.stringify(aliveComputerCreatures, null, 2))

    if (alivePlayerCreatures.length > 0 && aliveComputerCreatures.length > 0) {
      const playerAttacker = alivePlayerCreatures[0]
      const computerTarget = aliveComputerCreatures[0]

      console.log("Player attacking computer...")
      console.log("Player Attacker details:", JSON.stringify(playerAttacker, null, 2))
      console.log("Computer Target details before attack:", JSON.stringify(computerTarget, null, 2))

      let damage;
      try {
        damage = await performAttack(
          playerAttacker,
          computerTarget,
          true,
          playerCreatureControlsRef,
          enemyCreatureControlsRef
        )
        console.log("Damage dealt by player:", damage)
      } catch (error) {
        console.error("Error in performAttack:", error)
        damage = 0; // Set damage to zero if there's an error to prevent NaN issues
      }

      if (isNaN(damage) || damage === undefined) {
        console.error("Error: Damage is NaN or undefined. Player Attacker:", JSON.stringify(playerAttacker, null, 2), "Computer Target:", JSON.stringify(computerTarget, null, 2))
        damage = 0; // Prevent health from being affected by invalid damage
      }

      dispatch({
        type: "UPDATE_CREATURE",
        side: "computerCreatures",
        creature: {
          ...computerTarget,
          health: Math.max(0, computerTarget.health - damage),
        },
      })

      console.log("Computer Target details after attack:", JSON.stringify({
        ...computerTarget,
        health: Math.max(0, computerTarget.health - damage),
      }, null, 2))
    }

    if (alivePlayerCreatures.length > 0 && aliveComputerCreatures.length > 0) {
      const computerAttacker = aliveComputerCreatures[0]
      const playerTarget = alivePlayerCreatures[0]

      console.log("Computer attacking player...")
      console.log("Computer Attacker details:", JSON.stringify(computerAttacker, null, 2))
      console.log("Player Target details before attack:", JSON.stringify(playerTarget, null, 2))

      let damage;
      try {
        damage = await performAttack(
          computerAttacker,
          playerTarget,
          false,
          playerCreatureControlsRef,
          enemyCreatureControlsRef
        )
        console.log("Damage dealt by computer:", damage)
      } catch (error) {
        console.error("Error in performAttack:", error)
        damage = 0; // Set damage to zero if there's an error to prevent NaN issues
      }

      if (isNaN(damage) || damage === undefined) {
        console.error("Error: Damage is NaN or undefined. Computer Attacker:", JSON.stringify(computerAttacker, null, 2), "Player Target:", JSON.stringify(playerTarget, null, 2))
        damage = 0; // Prevent health from being affected by invalid damage
      }

      dispatch({
        type: "UPDATE_CREATURE",
        side: "playerCreatures",
        creature: {
          ...playerTarget,
          health: Math.max(0, playerTarget.health - damage),
        },
      })

      console.log("Player Target details after attack:", JSON.stringify({
        ...playerTarget,
        health: Math.max(0, playerTarget.health - damage),
      }, null, 2))
    }

    if (aliveComputerCreatures.length === 0) {
      console.log("Player has won the battle. Dispatching WIN_GAME...")
      dispatch({ type: "WIN_GAME" })
    }

    const { playerLost, computerLost } = processEndOfTurn(state, dispatch)
    console.log("End of turn processing results: Player Lost:", playerLost, "Computer Lost:", computerLost)

    if (!playerLost && !computerLost) {
      console.log("Preparing for next turn...")
      dispatch({ type: "PREPARE_NEXT_TURN" })
    }
  }, [state, dispatch, playerCreatureControlsRef, enemyCreatureControlsRef])

  return { handleAttack }
}
