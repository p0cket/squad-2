import React, { useEffect } from "react";
import { useDispatchContext, useStateContext } from "../GameContext";
import OwnedRunes from "./OwnedRunes";
import CreatureStats from "./CreatureStats";
import Hud from "./Hud";
import CreatureGroup from "./battle/CreatureGroup";
import { useCreatureControls } from "../hooks/useCreatureControls";
import ClassicHand from "./hand/ClassicHand";
import AnimationQueueDemo from "./AnimationQueueDemo"; // Build 1.1: Animation Queue Demo

/**
 * @deprecated LEGACY BATTLE COMPONENT
 * This component is deprecated and kept only for reference.
 * Please use the "Zustand Battle" tab instead for the latest battle system
 * with Auto Battle, Battle Timeline, and the new Effect Pipeline System.
 */
const Battle = () => {
  const state = useStateContext();
  const dispatch = useDispatchContext();
  const {
    playerCreatureControlsRef,
    enemyCreatureControlsRef,
    setCreatureControls,
  } = useCreatureControls();

  // Apply end-of-turn effects using the custom hook
  // useEndOfTurnEffects(state, dispatch)

  // change this to be triggered and not useEffect
  useEffect(() => {
    const { mp, mpPerTurn, maxMp } = state;
    const newMp = Math.min(mp + mpPerTurn, maxMp);
    console.log(
      `Battle useEffect: Math.min(mp ${mp} + mpPerTurn ${mpPerTurn}, maxMp ${maxMp}`,
      newMp
    );
    dispatch({
      type: "UPDATE_MP",
      mp: newMp,
    });
  }, [state.turn, dispatch, state.mp, state.mpPerTurn, state.maxMp]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white p-1">
      {/* ⚠️ DEPRECATION NOTICE */}
      <div className="w-full max-w-3xl mb-4 p-4 bg-yellow-900/80 border-2 border-yellow-500 rounded-lg">
        <div className="flex items-center gap-2 text-yellow-300">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-bold text-lg">DEPRECATED - Legacy Battle System</p>
            <p className="text-sm text-yellow-200">
              This is the old battle system, kept for reference only. 
              Please use <strong>"Zustand Battle"</strong> tab for the latest features including:
            </p>
            <ul className="text-sm text-yellow-200 list-disc list-inside mt-1">
              <li>🤖 Auto Battle mode</li>
              <li>📜 Battle Timeline / Log</li>
              <li>✨ New Effect Pipeline System</li>
              <li>🎯 Enhanced targeting & passives</li>
            </ul>
          </div>
        </div>
      </div>
      
      <Hud />
      <OwnedRunes />
      
      {/* Build 1.1: Animation Queue Demo */}
      <div className="mb-4 w-full max-w-3xl">
        <AnimationQueueDemo />
      </div>
      
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
      <ClassicHand
        playerCreatureControlsRef={playerCreatureControlsRef}
        enemyCreatureControlsRef={enemyCreatureControlsRef}
      />
      <CreatureStats />
    </div>
  );
};

export default Battle;
// handleConfirmedAttack={() =>
//   handleAttack(
//     state,
//     dispatch,
//     playerCreatureControlsRef,
//     enemyCreatureControlsRef
//   )
// }
