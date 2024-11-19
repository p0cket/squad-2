import React from "react";
import Battle from "./Battle";
import { useStateContext } from "../GameContext";
import Results from "./screens/Results";
import Death from "./screens/GameOver";
import Login from "./Login";

function Main() {
  const state = useStateContext();
  const { screen } = state;
  return (
    <>
      {<Login />}
      {/* <Results /> */}
      {screen === "battle" && <Battle />}
      {screen === "results" && <Results />}
      {screen === "game_over" && <Death />}

      {screen === "intro" && <Battle />}
      {screen === "shop" && <Battle />}
    </>
  );
}

export default Main;
