// GameOver.js
import React from "react";
import { useDispatchContext } from "../../GameContext";
// import { useDispatchContext } from "../GameContext";

const GameOver = () => {
  const dispatch = useDispatchContext();

  const handleNewGame = () => {
    dispatch({ type: "RESET_GAME" }); // Reset the game
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white p-4">
      <h1 className="text-4xl font-bold mb-8 text-red-500">
         GameOver
      </h1>
      <p className="text-2xl mb-4">
        You were defeated.
      </p>
      <button
        onClick={handleNewGame}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
      >
        Start New Game
      </button>
    </div>
  );
};

export default GameOver;
