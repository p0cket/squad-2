// App.js
import React from "react"
import { GameProvider } from "./GameContext"
import Navigation from "./components/Navigation"
import "./index.css"
import { AuthProvider } from "./contexts/authContext"
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Navigation />
        </ThemeProvider>
      </GameProvider>
    </AuthProvider>
  )
}

export default App
