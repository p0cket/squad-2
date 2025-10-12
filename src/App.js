// App.js
import React from "react"
import { GameProvider } from "./GameContext"
import Navigation from "./components/Navigation"
import "./index.css"
import { AuthProvider } from "./contexts/authContext"

function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <Navigation />
      </GameProvider>
    </AuthProvider>
  )
}

export default App
