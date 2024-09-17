// GameContext.js
import React, { createContext, useContext, useReducer } from "react"
import { applyRuneEffects } from "./utils.js/runeUtils"
import { resetCreatures } from "./utils.js/battleUtils"

// Constants

export const MAX_HP = 100
export const INITIAL_MAX_MP = 50
export const INITIAL_MP_PER_TURN = 5
export const BASE_ATK = 20
export const BASE_DEFENSE = 5
export const creatures = {
  dragon: {
    name: "🐉",
    template: "dragon",
    health: MAX_HP,
    maxHealth: MAX_HP,
    attack: 20,
    trueDamage: 10,
    defence: 5,
    statusEffects: [],
  },
  unicorn: {
    name: "🦄",
    template: "unicorn",
    health: MAX_HP,
    maxHealth: MAX_HP,
    attack: 20,
    trueDamage: 10,
    defence: 5,
    statusEffects: [],
  },
  alien: {
    name: "👾",
    template: "alien",
    health: MAX_HP,
    maxHealth: MAX_HP,
    attack: 20,
    trueDamage: 10,
    defence: 5,
    statusEffects: [],
  },
  fish: {
    name: "🐙",
    template: "fish",
    health: MAX_HP,
    maxHealth: MAX_HP,
    attack: 20,
    trueDamage: 10,
    defence: 5,
    statusEffects: [],
  },
}
const { dragon, fish, alien, unicorn } = creatures
export const basePlayerCreatures = [dragon, unicorn]
export const baseComputerCreatures = [alien, fish]
export const BASE_RUNES = [
    {
      id: 1,
      name: "Rune of Strength",
      type: "Common",
      effect: "Increases the Attack stat of all creatures by 10.",
      cost: 100,
      count: 0,
      statEffect: { stat: "attack", value: 10 },
      icon: "💪",
    },
    {
      id: 2,
      name: "Rune of Vitality",
      type: "Common",
      effect: "Increases the Health stat of all creatures by 20.",
      cost: 100,
      count: 0,
      statEffect: { stat: "health", value: 20 },
      icon: "❤️",
    },
    {
      id: 3,
      name: "Rune of Speed",
      type: "Common",
      effect: "Increases the Speed stat of all creatures by 5.",
      cost: 100,
      count: 0,
      statEffect: { stat: "speed", value: 5 },
      icon: "⚡",
    },
    {
      id: 4,
      name: "Rune of Wealth",
      type: "Common",
      effect: "Gain 50% more gold after each battle.",
      cost: 150,
      count: 0,
      statEffect: { stat: "goldMultiplier", value: 0.5 },
      icon: "💰",
    },
    {
      id: 5,
      name: "Rune of the Assassin",
      type: "Uncommon",
      effect:
        "Increases damage dealt to creatures with higher health than the user by 20%.",
      cost: 250,
      count: 0,
      statEffect: { stat: "assassinDamage", value: 0.2 },
      icon: "🗡️",
    },
    {
      id: 6,
      name: "Rune of the Dragon",
      type: "Rare",
      effect:
        "Grants the ability to breathe fire, dealing 30 damage to all enemies.",
      cost: 500,
      count: 0,
      statEffect: { stat: "dragonBreath", value: 30 },
      icon: "🐉",
    },
  ];
  
// Initial State
const initialState = {
    // Existing Game State
    playerCreatures: structuredClone(basePlayerCreatures),
    computerCreatures: structuredClone(baseComputerCreatures),
    mp: 0,
    maxMp: INITIAL_MAX_MP,
    mpPerTurn: INITIAL_MP_PER_TURN,
    turn: 0,
  
    // Rune System State
    gold: 1000,
    runes: [],
    availableRunes: structuredClone(BASE_RUNES),
    baseStats: {
      attack: 0,
      health: 0,
      speed: 0,
      goldMultiplier: 1,
      assassinDamage: 0,
      dragonBreath: 0,
    },
    battleStatus: null,
    screen: "intro",
  }

// Game Reducer
const gameReducer = (state, action) => {
  console.log("Action dispatched:", action)
  console.log("State before action:", state)
  switch (action.type) {
    // case "START_BATTLE":
    //   return {
    //     ...state,
    //     playerCreatures: state.playerCreatures.map((creature) => ({
    //       ...creature,
    //       ...applyRuneEffects(creature, state.runes),
    //     })),
    //     computerCreatures: state.computerCreatures.map((creature) => ({
    //       ...creature,
    //       ...applyRuneEffects(creature, state.runes),
    //     })),
    //   }
    // Existing Game Actions
    case "UPDATE_CREATURE":
      return {
        ...state,
        [action.side]: state[action.side].map((creature) =>
          creature.name === action.creature.name
            ? { ...creature, ...action.creature }
            : creature
        ),
      }
    case "UPDATE_MP":
      return { ...state, mp: action.mp }
    case "UPDATE_MAX_MP":
      return { ...state, maxMp: action.maxMp }
    case "UPDATE_MP_PER_TURN":
      return { ...state, mpPerTurn: action.mpPerTurn }
    case "INCREMENT_TURN":
      return { ...state, turn: state.turn + 1 }
    case "WIN_GAME":
      return {
        ...state,
        // battleStatus: "WON", // Set game status to won
        screen: "results",
      }
    case "LOSE_GAME":
      return {
        ...state,
        // battleStatus: "LOST", // Set game status to lost
        screen: "game_over",
      }
      case "RESET_BATTLE":
        // Deep clone base player creatures and apply rune effects
        const updatedPlayerTeam = resetCreatures(
          structuredClone(basePlayerCreatures).map((creature) =>
            applyRuneEffects(creature, state.runes)
          )
        )
        // Deep clone base computer creatures without rune effects
        const updatedComputerTeam = resetCreatures(
          structuredClone(baseComputerCreatures)
        )
        return {
          ...state,
          playerCreatures: updatedPlayerTeam,
          computerCreatures: updatedComputerTeam,
          mp: 0, // Reset MP
          turn: 0, // Reset turn
          battleStatus: null, // Clear battle status
        }
    case "CHANGE_SCREEN":
      console.log(`CHANGE_SCREEN Here:`, action)
      return {
        ...state,
        screen: action.payload.screen,
      }
    // Rune Shop Actions
    // case "BUY_RUNE":
    //   if (state.gold < action.rune.cost) return state
    //   const newRunes = [...state.runes, action.rune]
    //   // Apply rune effects to player creatures
    //   const updatedPlayerCreatures = state.playerCreatures.map((creature) =>
    //     applyRuneEffects(creature, newRunes)
    //   )
    //   return {
    //     ...state,
    //     gold: state.gold - action.rune.cost,
    //     runes: newRunes,
    //     playerCreatures: updatedPlayerCreatures,
    //     availableRunes: state.availableRunes.map((rune) =>
    //       rune.id === action.rune.id ? { ...rune, count: rune.count + 1 } : rune
    //     ),
    //   }

    // case "SELL_RUNE":
    //   return {
    //     ...state,
    //     gold: state.gold + Math.floor(action.rune.cost / 2),
    //     runes: state.runes.filter((rune, index) => index !== action.index),
    //     availableRunes: state.availableRunes.map((rune) =>
    //       rune.id === action.rune.id ? { ...rune, count: rune.count - 1 } : rune
    //     ),
    //   }
    case "BUY_RUNE":
        if (state.gold < action.rune.cost) return state
        const newRunes = [...state.runes, action.rune]
        // Recalculate player creatures with new rune list starting from base creatures
        const updatedPlayerCreatures = structuredClone(basePlayerCreatures).map(
          (creature) => applyRuneEffects(creature, newRunes)
        )
        return {
          ...state,
          gold: state.gold - action.rune.cost,
          runes: newRunes,
          playerCreatures: updatedPlayerCreatures,
          availableRunes: state.availableRunes.map((rune) =>
            rune.id === action.rune.id ? { ...rune, count: rune.count + 1 } : rune
          ),
        }
      
      case "SELL_RUNE":
        const remainingRunes = state.runes.filter(
          (rune, index) => index !== action.index
        )
        // Recalculate player creatures with remaining runes starting from base creatures
        const recalculatedPlayerCreatures = structuredClone(basePlayerCreatures).map(
          (creature) => applyRuneEffects(creature, remainingRunes)
        )
        return {
          ...state,
          gold: state.gold + Math.floor(action.rune.cost / 2),
          runes: remainingRunes,
          playerCreatures: recalculatedPlayerCreatures,
          availableRunes: state.availableRunes.map((rune) =>
            rune.id === action.rune.id ? { ...rune, count: rune.count - 1 } : rune
          ),
        }

    // Additional Game Actions
    case "ADD_GOLD":
      return {
        ...state,
        gold: state.gold + action.amount,
      }
    case "RESET_GAME":
      return initialState
    default:
      return state
  }
}

// Create Contexts
const StateContext = createContext()
const DispatchContext = createContext()

// Custom Hooks for Using Context
export const useStateContext = () => useContext(StateContext)
export const useDispatchContext = () => useContext(DispatchContext)

// Context Provider Component
export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}
