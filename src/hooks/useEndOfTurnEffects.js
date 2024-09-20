import { useEffect } from "react";
import { checkGameOver, handleEndOfTurnEffects } from "../utils.js/turnUtils";
// import { checkGameOver, handleEndOfTurnEffects } from "../utils.js/turnUtils";

export const useEndOfTurnEffects = (state, dispatch) => {
  useEffect(() => {
    const updatedPlayerCreatures = handleEndOfTurnEffects(state.playerCreatures);
    const updatedComputerCreatures = handleEndOfTurnEffects(state.computerCreatures);

    console.log(updatedPlayerCreatures, updatedComputerCreatures);

    dispatch({
      type: "UPDATE_CREATURES",
      side: "playerCreatures",
      creatures: updatedPlayerCreatures,
    });

    dispatch({
      type: "UPDATE_CREATURES",
      side: "computerCreatures",
      creatures: updatedComputerCreatures,
    });

    const playerLost = checkGameOver(updatedPlayerCreatures);
    const computerLost = checkGameOver(updatedComputerCreatures);

    if (computerLost) {
      dispatch({ type: "WIN_GAME" });
      setTimeout(() => dispatch({ type: "RESET_BATTLE" }), 100);
    }

    if (playerLost) {
      dispatch({ type: "LOSE_GAME" });
      setTimeout(() => dispatch({ type: "RESET_BATTLE" }), 100);
    }
  }, [state.turn, dispatch]);
};
