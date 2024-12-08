import React, { useEffect } from "react";
import Battle from "./Battle";
import { useStateContext } from "../GameContext";
import Results from "./screens/Results";
import Death from "./screens/GameOver";
import Login from "./Login";
import AttackDebugConsole from "./../debug/AttackDebugConsole";

function Main() {
  const flog = (emoji, details) => {
    const { messageParts, styles, objects } = details;

    // Generate the message string with `%c` placeholders and proper spacing
    const logMessage =
      [`%c${emoji}`, ...messageParts.map(() => "%c")].join(" ") +
      " " +
      messageParts.join(" ");

    // Combine the message, styles, and objects
    const logArgs = [
      logMessage,
      ...styles,
      ...objects,
      JSON.stringify(logMessage, ...styles, ...objects),
    ];
    return logArgs;
  };
  useEffect(() => {
    const attackDetails = {
      messageParts: [
        "Player Attack: Slash", // First styled part
        "| Target: Harper (🦅)", // Second styled part
        "| Damage: 50 HP", // Third styled part
      ],
      styles: [
        "color: #1d3557; font-weight: bold;", // Style for Player Attack
        "color: #e63946; font-weight: bold;", // Style for Target
        "color: #f77f00; font-weight: bold;", // Style for Damage
      ],
      objects: [
        { attack: "Slash", damage: 50 }, // Attack object
        { name: "Harper", icon: "🦅", health: 210, maxHealth: 210 }, // Target object
      ],
    };
    // Log attack details
    // const logArgs = flog("⚔️", attackDetails);
    console.log(...flog("💥", attackDetails));
    // console.log(...flog(logArgs) )
  }, []);

  const state = useStateContext();
  const { screen, debugObj } = state;
  return (
    <>
      {/* <Results /> */}
      {screen === "battle" && <Battle />}
      {screen === "results" && <Results />}
      {screen === "game_over" && <Death />}

      {screen === "intro" && <Battle />}
      {screen === "shop" && <Battle />}
      <AttackDebugConsole debugObj={debugObj} />
    </>
  );
}

export default Main;
