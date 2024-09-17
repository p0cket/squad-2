import React from "react"
import CreatureBattleGame from "./CreatureBattleGame"
import { useStateContext } from "../GameContext"
import Results from "./screens/Results"
import Death from "./screens/GameOver"

function Main() {
  const state = useStateContext()
  const { screen } = state
  return (
    <>
     {/* <Results /> */}
      {screen === "battle" && <CreatureBattleGame />}
      {screen === "results" && <Results />}
      {screen === "game_over" && <Death />}

      {screen === "intro" && <CreatureBattleGame />}
      {screen === "shop" && <CreatureBattleGame />}
    </>
  )
}

export default Main
