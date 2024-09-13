import React, { createContext, useReducer } from "react"

// Define initial runes
const availableRunes = [
  {
    id: 1,
    name: "Rune of Strength",
    type: "Common",
    effect: "Increases the Attack stat of all creatures by 10.",
    cost: 100,
    count: 0,
    statEffect: { stat: "attack", value: 10 },
    active: false,
  },
  {
    id: 2,
    name: "Rune of Vitality",
    type: "Common",
    effect: "Increases the Health stat of all creatures by 20.",
    cost: 100,
    count: 0,
    statEffect: { stat: "health", value: 20 },
    active: false,
  },
  {
    id: 3,
    name: "Rune of Speed",
    type: "Common",
    effect: "Increases the Speed stat of all creatures by 5.",
    cost: 100,
    count: 0,
    statEffect: { stat: "speed", value: 5 },
    active: false,
  },
  // ... add more runes here
]

// Updated initial state
const initialState = {
  playerCreatures: [
    {
      name: "🐉",
      health: 100,
      maxHealth: 100,
      attack: 50,
      defense: 10,
      speed: 15,
    },
    {
      name: "🦄",
      health: 100,
      maxHealth: 100,
      attack: 45,
      defense: 12,
      speed: 18,
    },
  ],
  computerCreatures: [
    {
      name: "👾",
      health: 100,
      maxHealth: 100,
      attack: 48,
      defense: 11,
      speed: 16,
    },
    {
      name: "🐙",
      health: 100,
      maxHealth: 100,
      attack: 52,
      defense: 9,
      speed: 14,
    },
  ],
  mp: 0,
  maxMp: 50,
  mpPerTurn: 5,
  turn: 0,
  gold: 1000,
  runes: [],
  availableRunes: availableRunes,
  baseStats: {
    attack: 0,
    health: 0,
    speed: 0,
  },
}

const ACTIONS = {
  UPDATE_CREATURE: "UPDATE_CREATURE",
  UPDATE_MP: "UPDATE_MP",
  UPDATE_MAX_MP: "UPDATE_MAX_MP",
  UPDATE_MP_PER_TURN: "UPDATE_MP_PER_TURN",
  INCREMENT_TURN: "INCREMENT_TURN",
  UPDATE_GOLD: "UPDATE_GOLD",
  ACTIVATE_RUNE: "ACTIVATE_RUNE",
  DEACTIVATE_RUNE: "DEACTIVATE_RUNE",
  BUY_RUNE: "BUY_RUNE",
  SELL_RUNE: "SELL_RUNE",
}

// Updated game reducer
const gameReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.UPDATE_CREATURE:
      return {
        ...state,
        [action.side]: state[action.side].map((creature) =>
          creature.name === action.creature.name
            ? { ...creature, ...action.creature }
            : creature
        ),
      }
    case ACTIONS.UPDATE_MP:
      return { ...state, mp: action.mp }
    case ACTIONS.UPDATE_MAX_MP:
      return { ...state, maxMp: action.maxMp }
    case ACTIONS.UPDATE_MP_PER_TURN:
      return { ...state, mpPerTurn: action.mpPerTurn }
    case ACTIONS.INCREMENT_TURN:
      return { ...state, turn: state.turn + 1 }
    case ACTIONS.UPDATE_GOLD:
      return { ...state, gold: action.gold }
    case ACTIONS.BUY_RUNE:
      if (state.gold < action.rune.cost) return state
      return {
        ...state,
        gold: state.gold - action.rune.cost,
        runes: [...state.runes, { ...action.rune, count: 1 }],
        availableRunes: state.availableRunes.map((rune) =>
          rune.id === action.rune.id ? { ...rune, count: rune.count + 1 } : rune
        ),
      }
    case ACTIONS.SELL_RUNE:
      return {
        ...state,
        gold: state.gold + Math.floor(action.rune.cost / 2),
        runes: state.runes.filter((rune, index) => index !== action.index),
        availableRunes: state.availableRunes.map((rune) =>
          rune.id === action.rune.id ? { ...rune, count: rune.count - 1 } : rune
        ),
      }
    case ACTIONS.ACTIVATE_RUNE:
      return {
        ...state,
        runes: state.runes.map((rune) =>
          rune.id === action.rune.id ? { ...rune, active: true } : rune
        ),
      }
    case ACTIONS.DEACTIVATE_RUNE:
      return {
        ...state,
        runes: state.runes.map((rune) =>
          rune.id === action.rune.id ? { ...rune, active: false } : rune
        ),
      }
    default:
      return state
  }
}

// Create the game context
const GameContext = createContext()

// Game context provider component
const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  // Helper function to apply rune effects
  const applyRuneEffects = (creatures) => {
    return creatures.map((creature) => {
      let updatedCreature = { ...creature }

      // Apply active runes to each creature
      state.runes.forEach((rune) => {
        if (rune.active) {
          switch (rune.statEffect.stat) {
            case "attack":
              updatedCreature.attack += rune.statEffect.value
              break
            case "health":
              updatedCreature.maxHealth += rune.statEffect.value
              updatedCreature.health += rune.statEffect.value
              break
            case "speed":
              updatedCreature.speed += rune.statEffect.value
              break
            // ... handle other stats
            default:
              break
          }
        }
      })
      return updatedCreature
    })
  }

  // Wrap the dispatch function to apply rune effects after each action
  const wrappedDispatch = (action) => {
    dispatch(action)

    if (
      [
        ACTIONS.UPDATE_CREATURE,
        ACTIONS.ACTIVATE_RUNE,
        ACTIONS.DEACTIVATE_RUNE,
        ACTIONS.BUY_RUNE,
        ACTIONS.SELL_RUNE,
      ].includes(action.type)
    ) {
      // Update player creatures
      const updatedPlayerCreatures = applyRuneEffects(state.playerCreatures)
      updatedPlayerCreatures.forEach((creature) => {
        dispatch({
          type: ACTIONS.UPDATE_CREATURE,
          side: "playerCreatures",
          creature: creature,
        })
      })
    }
  }

  return (
    <GameContext.Provider value={{ state, dispatch: wrappedDispatch }}>
      {children}
    </GameContext.Provider>
  )
}

export { GameContext, GameProvider }
