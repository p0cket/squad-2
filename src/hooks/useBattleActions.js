// hooks/useBattleActions.js
import { useCallback } from "react";
import { useDispatchContext, useStateContext } from "../GameContext";
import { performAttack } from "../utils.js/attackUtils";
import { calculateHealedHealth, selectRandomCreature } from "../utils.js/battleUtils";
export const useBattleActions = (playerCreatureControlsRef, enemyCreatureControlsRef) => {
  const state = useStateContext();
  const dispatch = useDispatchContext();

  const handleAttack = useCallback(async () => {
    dispatch({ type: "INCREMENT_TURN" });

    const alivePlayerCreatures = state.playerCreatures.filter((c) => c.health > 0);
    const aliveComputerCreatures = state.computerCreatures.filter((c) => c.health > 0);

    if (alivePlayerCreatures.length > 0 && aliveComputerCreatures.length > 0) {
      const playerAttacker = alivePlayerCreatures[Math.floor(Math.random() * alivePlayerCreatures.length)];
      const computerTarget = aliveComputerCreatures[Math.floor(Math.random() * aliveComputerCreatures.length)];

      const damage = await performAttack(
        playerAttacker,
        computerTarget,
        true,
        playerCreatureControlsRef,
        enemyCreatureControlsRef
      );

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

      const damage = await performAttack(
        computerAttacker,
        playerTarget,
        false,
        playerCreatureControlsRef,
        enemyCreatureControlsRef
      );

      dispatch({
        type: "UPDATE_CREATURE",
        side: "playerCreatures",
        creature: {
          ...playerTarget,
          health: Math.max(0, playerTarget.health - damage),
        },
      });
    }
  }, [state.playerCreatures, state.computerCreatures, dispatch, playerCreatureControlsRef, enemyCreatureControlsRef]);

  return { handleAttack };
};
