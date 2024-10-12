import React, { useEffect } from "react"
import { useDispatchContext, useStateContext } from "../GameContext"
import OwnedRunes from "./OwnedRunes"
import CreatureStats from "./CreatureStats"
import Hud from "./Hud"
import ActionButtons from "./battle/ActionButtons"
import CreatureGroup from "./battle/CreatureGroup"
import { useCreatureControls } from "../hooks/useCreatureControls"
import { useBattleActions } from "../hooks/useBattleActions"
// import { useEndOfTurnEffects } from "../hooks/useEndOfTurnEffects"

const Battle = () => {
  const state = useStateContext()
  const dispatch = useDispatchContext()
  const {
    playerCreatureControlsRef,
    enemyCreatureControlsRef,
    setCreatureControls,
  } = useCreatureControls()

  const { handleAttack } = useBattleActions(
    playerCreatureControlsRef,
    enemyCreatureControlsRef
  )

  // Apply end-of-turn effects using the custom hook
  // useEndOfTurnEffects(state, dispatch)

  useEffect(() => {
    dispatch({
      type: "UPDATE_MP",
      mp: Math.min(state.mp + state.mpPerTurn, state.maxMp),
    })
  }, [state.turn, dispatch, state.mp, state.mpPerTurn, state.maxMp])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white p-1">
      <Hud />
      <OwnedRunes />
      <div className="flex flex-col items-center w-full max-w-3xl mb-1">
        {/* Enemy Creatures at the Top */}
        <div className="flex flex-row items-center justify-center mb-4">
          <CreatureGroup
            creatures={state.computerCreatures}
            isPlayer={false}
            setCreatureControls={setCreatureControls}
            isFlipped
          />
        </div>
        {/* Player Creatures at the Bottom */}
        <div className="flex flex-row items-center justify-center">
          <CreatureGroup
            creatures={state.playerCreatures}
            isPlayer={true}
            setCreatureControls={setCreatureControls}
          />
        </div>
      </div>
      <ActionButtons handleAttack={handleAttack} />
      <CreatureStats />
    </div>
  )
}

export default Battle
