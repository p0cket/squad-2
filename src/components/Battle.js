import React, {  useEffect } from "react"
import { useDispatchContext, useStateContext } from "../GameContext"
import OwnedRunes from "./OwnedRunes"
import CreatureStats from "./CreatureStats"
import { checkGameOver, handleEndOfTurnEffects } from "../utils.js/turnUtils"
import ShopModal from "./Modal"
import Hud from "./Hud"
import ActionButtons from "./battle/ActionButtons"
import CreatureGroup from "./battle/CreatureGroup"
import { useCreatureControls } from "../hooks/useCreatureControls"
import { useBattleActions } from "../hooks/useBattleActions"
import { useEndOfTurnEffects } from "../hooks/useEndOfTurnEffects"
import Levels from "./screens/Levels"

const Battle = () => {
  const state = useStateContext()
  const dispatch = useDispatchContext()
  const { creatureControlsRef, setCreatureControls } = useCreatureControls()
  // Use battle actions hook
  const {
    handleAttack,
    handleHeal,
    handleIncreaseHealth,
    handleIncreaseMpPerTurn,
    handleIncreaseMaxMp,
  } = useBattleActions(creatureControlsRef);

  // Apply end-of-turn effects using the custom hook
  useEndOfTurnEffects(state, dispatch);

  useEffect(() => {
    dispatch({
      type: "UPDATE_MP",
      mp: Math.min(state.mp + state.mpPerTurn, state.maxMp),
    })
  }, [state.turn, dispatch, state.mp, state.mpPerTurn, state.maxMp])
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white p-1">
      <Hud />
      <Levels numLevels={10} />
      <OwnedRunes />
      <div className="flex flex-col items-center w-full max-w-3xl mb-2">
        {/* Enemy Creatures at the Top */}
        <div className="flex flex-row items-center justify-center mb-8">
          <CreatureGroup
            creatures={state.computerCreatures}
            isPlayer={false}
            setCreatureControls={setCreatureControls}
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
      <CreatureStats />
      <ShopModal />
      <ActionButtons
        handleAttack={handleAttack}
        handleHeal={handleHeal}
        handleIncreaseHealth={handleIncreaseHealth}
        handleIncreaseMpPerTurn={handleIncreaseMpPerTurn}
        handleIncreaseMaxMp={handleIncreaseMaxMp}
        mp={state.mp}
      />
    </div>
  )
}

export default Battle
