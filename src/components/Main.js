import React from "react"
import Battle from "./Battle"
import { useStateContext } from "../GameContext"
import Results from "./screens/Results"
import Death from "./screens/GameOver"

function Main() {
  const state = useStateContext()
  const { screen } = state
  return (
    <>
     {/* <Results /> */}
      {screen === "battle" && <Battle />}
      {screen === "results" && <Results />}
      {screen === "game_over" && <Death />}

      {screen === "intro" && <Battle />}
      {screen === "shop" && <Battle />}
    </>
  )
}

export default Main
