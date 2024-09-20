// hooks/useBattleActions.js
import { useCallback } from "react";
import { useDispatchContext, useStateContext } from "../GameContext";
import { performAttack } from "../utils.js/attackUtils";
import { calculateHealedHealth, selectRandomCreature } from "../utils.js/battleUtils";
export const useBattleActions = (creatureControlsRef) => {
  const state = useStateContext();
  const dispatch = useDispatchContext();

  const handleAttack = useCallback(async () => {
    dispatch({ type: "INCREMENT_TURN" });

    const alivePlayerCreatures = state.playerCreatures.filter((c) => c.health > 0);
    const aliveComputerCreatures = state.computerCreatures.filter((c) => c.health > 0);

    if (alivePlayerCreatures.length > 0 && aliveComputerCreatures.length > 0) {
      const playerAttacker = alivePlayerCreatures[Math.floor(Math.random() * alivePlayerCreatures.length)];
      const computerTarget = aliveComputerCreatures[Math.floor(Math.random() * aliveComputerCreatures.length)];

      const damage = await performAttack(playerAttacker, computerTarget, true, creatureControlsRef);

      dispatch({
        type: "UPDATE_CREATURE",
        side: "computerCreatures",
        creature: {
          ...computerTarget,
          health: Math.max(0, computerTarget.health - damage),
        },
      });
    }

    if (alivePlayerCreatures.length > 0 && aliveComputerCreatures.length > 0) {
      const computerAttacker = aliveComputerCreatures[Math.floor(Math.random() * aliveComputerCreatures.length)];
      const playerTarget = alivePlayerCreatures[Math.floor(Math.random() * alivePlayerCreatures.length)];

      const damage = await performAttack(computerAttacker, playerTarget, false, creatureControlsRef);

      dispatch({
        type: "UPDATE_CREATURE",
        side: "playerCreatures",
        creature: {
          ...playerTarget,
          health: Math.max(0, playerTarget.health - damage),
        },
      });
    }
  }, [state.playerCreatures, state.computerCreatures, dispatch, creatureControlsRef]);

  const handleHeal = useCallback(() => {
    if (state.mp >= 10) {
      dispatch({ type: "UPDATE_MP", mp: state.mp - 10 });
      dispatch({ type: "INCREMENT_TURN" });

      const healedCreatures = state.playerCreatures.map((creature) => ({
        ...creature,
        health: Math.min(creature.health + 20, creature.maxHealth),
      }));

      dispatch({
        type: "UPDATE_CREATURES",
        side: "playerCreatures",
        creatures: healedCreatures,
      });
    }
  }, [state.mp, state.playerCreatures, dispatch]);

  const handleIncreaseHealth = useCallback(() => {
    if (state.mp >= 10) {
      dispatch({ type: "UPDATE_MP", mp: state.mp - 10 });
      dispatch({ type: "INCREMENT_TURN" });
  
      const target = selectRandomCreature(state.playerCreatures);
  
      const updatedCreature = {
        ...target,
        health: calculateHealedHealth(target, 30),
      };
  
      const updatedCreatures = state.playerCreatures.map((creature) =>
        creature.name === target.name ? updatedCreature : creature
      );
  
      dispatch({
        type: "UPDATE_CREATURES",
        side: "playerCreatures",
        creatures: updatedCreatures,
      });
    }
  }, [state.mp, state.playerCreatures, dispatch]);

  const handleIncreaseMpPerTurn = useCallback(() => {
    if (state.mp >= 10) {
      dispatch({ type: "UPDATE_MP", mp: state.mp - 10 });
      dispatch({ type: "INCREMENT_TURN" });
      dispatch({
        type: "UPDATE_MP_PER_TURN",
        mpPerTurn: state.mpPerTurn + 2,
      });
    }
  }, [state.mp, state.mpPerTurn, dispatch]);

  const handleIncreaseMaxMp = useCallback(() => {
    if (state.mp >= 10) {
      dispatch({ type: "UPDATE_MP", mp: state.mp - 10 });
      dispatch({ type: "INCREMENT_TURN" });
      dispatch({
        type: "UPDATE_MAX_MP",
        maxMp: state.maxMp + 10,
      });
    }
  }, [state.mp, state.maxMp, dispatch]);

  return {
    handleAttack,
    handleHeal,
    handleIncreaseHealth,
    handleIncreaseMpPerTurn,
    handleIncreaseMaxMp,
  };
};
