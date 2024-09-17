import React, { useCallback, useEffect, useRef, useMemo } from "react"
import { motion } from "framer-motion"
import { useDispatchContext, useStateContext } from "../GameContext"
import RuneShop from "./RuneShop"
import OwnedRunes from "./OwnedRunes"
import CreatureStats from "./CreatureStats"
import Creature from "./Creature"
import ActionButton from "./ActionButton"
import { checkGameOver, handleEndOfTurnEffects } from "../utils.js/turnUtils"
import ShopModal from "./Modal"
import Hud from "./Hud"

const CreatureBattleGame = () => {
  const state = useStateContext()
  const dispatch = useDispatchContext()

  const creatureControlsRef = useRef({})

  const setCreatureControls = useCallback((name, controls) => {
    creatureControlsRef.current[name] = controls
  }, [])

  // Apply end-of-turn effects using the utility function
  useEffect(() => {
    const updatedPlayerCreatures = handleEndOfTurnEffects(state.playerCreatures)
    const updatedComputerCreatures = handleEndOfTurnEffects(
      state.computerCreatures
    )
    console.log(updatedPlayerCreatures, updatedComputerCreatures)

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

    const playerLost = checkGameOver(state.playerCreatures)
    const computerLost = checkGameOver(state.computerCreatures)
    if (computerLost) {
      dispatch({ type: `WIN_GAME` })
      setTimeout(() => dispatch({ type: "RESET_BATTLE" }), 100)
    }
    if (playerLost) {
      dispatch({ type: `LOSE_GAME` })
      setTimeout(() => dispatch({ type: "RESET_BATTLE" }), 100)
    }
  }, [state.turn, dispatch, state.playerCreatures, state.computerCreatures])

  const currentStats = useMemo(() => {
    return Object.keys(state.baseStats).reduce((acc, stat) => {
      acc[stat] =
        state.baseStats[stat] +
        state.runes.reduce(
          (sum, rune) =>
            rune.statEffect.stat === stat ? sum + rune.statEffect.value : sum,
          0
        )
      return acc
    }, {})
  }, [state.baseStats, state.runes])

  useEffect(() => {
    dispatch({
      type: "UPDATE_MP",
      mp: Math.min(state.mp + state.mpPerTurn, state.maxMp),
    })
  }, [state.turn, dispatch, state.mp, state.mpPerTurn, state.maxMp])

  const attackAnimation = useCallback(
    async (attackerName, targetName, isPlayerAttack) => {
      const attackerControls = creatureControlsRef.current[attackerName]
      const targetControls = creatureControlsRef.current[targetName]

      const direction = isPlayerAttack ? 1 : -1
      const distance = 600

      await attackerControls.start({
        x: direction * distance,
        // y:
        transition: { duration: 0.5 },
      })
      await attackerControls.start({
        x: direction * (distance + 10),
        y: [0, -5, 5, -5, 5, 0],
        transition: { duration: 0.3 },
      })

      if (targetControls) {
        await targetControls.start({
          x: [0, -5, 5, -5, 5, 0],
          transition: { duration: 0.3 },
        })
      }

      await attackerControls.start({
        x: 0,
        transition: { duration: 0.5 },
      })

      const damage = Math.floor(Math.random() * 20) + 10
      return damage
    },
    []
  )

  const handleAttack = useCallback(async () => {
    dispatch({ type: "INCREMENT_TURN" })

    const alivePlayerCreatures = state.playerCreatures.filter(
      (c) => c.health > 0
    )
    const aliveComputerCreatures = state.computerCreatures.filter(
      (c) => c.health > 0
    )

    if (alivePlayerCreatures.length > 0 && aliveComputerCreatures.length > 0) {
      const playerAttacker =
        alivePlayerCreatures[
          Math.floor(Math.random() * alivePlayerCreatures.length)
        ]
      const computerTarget =
        aliveComputerCreatures[
          Math.floor(Math.random() * aliveComputerCreatures.length)
        ]
      const damage = await attackAnimation(
        playerAttacker.name,
        computerTarget.name,
        true
      )
      dispatch({
        type: "UPDATE_CREATURE",
        side: "computerCreatures",
        creature: {
          ...computerTarget,
          health: Math.max(0, computerTarget.health - damage),
        },
      })
    }

    if (alivePlayerCreatures.length > 0 && aliveComputerCreatures.length > 0) {
      const computerAttacker =
        aliveComputerCreatures[
          Math.floor(Math.random() * aliveComputerCreatures.length)
        ]
      const playerTarget =
        alivePlayerCreatures[
          Math.floor(Math.random() * alivePlayerCreatures.length)
        ]
      const damage = await attackAnimation(
        computerAttacker.name,
        playerTarget.name,
        false
      )
      dispatch({
        type: "UPDATE_CREATURE",
        side: "playerCreatures",
        creature: {
          ...playerTarget,
          health: Math.max(0, playerTarget.health - damage),
        },
      })
    }
  }, [
    state.playerCreatures,
    state.computerCreatures,
    attackAnimation,
    dispatch,
  ])

  const handleHeal = useCallback(() => {
    if (state.mp >= 10) {
      dispatch({ type: "UPDATE_MP", mp: state.mp - 10 })
      dispatch({ type: "INCREMENT_TURN" })
      state.playerCreatures.forEach((creature) => {
        dispatch({
          type: "UPDATE_CREATURE",
          side: "playerCreatures",
          creature: {
            ...creature,
            health: Math.min(
              creature.health + 20,
              creature.maxHealth // Use maxHealth from the creature's state
            ),
          },
        })
      })
    }
  }, [state.mp, state.playerCreatures, dispatch])

  const handleIncreaseHealth = useCallback(() => {
    if (state.mp >= 10) {
      dispatch({ type: "UPDATE_MP", mp: state.mp - 10 })
      dispatch({ type: "INCREMENT_TURN" })
      const target =
        state.playerCreatures[
          Math.floor(Math.random() * state.playerCreatures.length)
        ]
      dispatch({
        type: "UPDATE_CREATURE",
        side: "playerCreatures",
        creature: {
          ...target,
          health: Math.min(target.health + 30, target.maxHealth),
        },
      })
    }
  }, [state.mp, state.playerCreatures, dispatch])

  const handleIncreaseMpPerTurn = useCallback(() => {
    if (state.mp >= 10) {
      dispatch({ type: "UPDATE_MP", mp: state.mp - 10 })
      dispatch({ type: "INCREMENT_TURN" })
      dispatch({
        type: "UPDATE_MP_PER_TURN",
        mpPerTurn: state.mpPerTurn + 2,
      })
    }
  }, [state.mp, state.mpPerTurn, dispatch])

  const handleIncreaseMaxMp = useCallback(() => {
    if (state.mp >= 10) {
      dispatch({ type: "UPDATE_MP", mp: state.mp - 10 })
      dispatch({ type: "INCREMENT_TURN" })
      dispatch({
        type: "UPDATE_MAX_MP",
        maxMp: state.maxMp + 10,
      })
    }
  }, [state.mp, state.maxMp, dispatch])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white p-1">
      <Hud />
      <OwnedRunes />
      <CreatureStats />
      <div className="flex justify-between w-full max-w-3xl mb-2">
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-2 text-green-400">Player</h2>
          {state.playerCreatures.map((creature) => (
            <Creature
              key={creature.name}
              name={creature.name}
              health={creature.health}
              maxHealth={creature.maxHealth} // Pass the correct maxHealth
              position={{ x: 0 }}
              isPlayer={true}
              setCreatureControls={setCreatureControls}
            />
          ))}
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4 text-red-400">Computer</h2>
          {state.computerCreatures.map((creature) => (
            <Creature
              key={creature.name}
              name={creature.name}
              health={creature.health}
              maxHealth={creature.maxHealth} // Pass the correct maxHealth
              position={{ x: 0 }}
              isPlayer={false}
              setCreatureControls={setCreatureControls}
            />
          ))}
        </div>
      </div>
      <ShopModal />
      <div className="flex space-x-4 mb-4">
        <ActionButton onClick={handleAttack}>Attack</ActionButton>
        <ActionButton onClick={handleHeal} disabled={state.mp < 10}>
          Heal All (10 MP)
        </ActionButton>
        <div className="flex space-x-4">
          <ActionButton onClick={handleIncreaseHealth} disabled={state.mp < 10}>
            Boost Health (10 MP)
          </ActionButton>
          <ActionButton
            onClick={handleIncreaseMpPerTurn}
            disabled={state.mp < 10}
          >
            Increase MP Gain (10 MP)
          </ActionButton>
          <ActionButton onClick={handleIncreaseMaxMp} disabled={state.mp < 10}>
            Increase Max MP (10 MP)
          </ActionButton>
        </div>
      </div>
      {/* Additional controls here */}
      <div className="mt-4">Turn: {state.turn}</div>
    </div>
  )
}

export default CreatureBattleGame
