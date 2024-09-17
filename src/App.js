// App.js
import React from "react"
import { GameProvider } from "./GameContext"
import Main from "./components/Main"
import './index.css'; 


function App() {
  return (
    <GameProvider>
      <>
        {/* <div className="container mx-auto px-4 py-8"> */}
        {/* <Battle /> */}
        <Main />
        {/* <RuneShop />
        <OwnedRunes />
        <CreatureStats /> */}
      </>
    </GameProvider>
  )
}

export default App
