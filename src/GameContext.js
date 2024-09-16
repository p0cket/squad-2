// GameContext.js
import React, { createContext, useContext, useReducer } from 'react';

// Constants
export const MAX_HP = 100;
export const INITIAL_MAX_MP = 50;
export const INITIAL_MP_PER_TURN = 5;

// Initial State
const initialState = {
  // Existing Game State
  playerCreatures: [
    { name: '🐉', health: MAX_HP },
    { name: '🦄', health: MAX_HP },
  ],
  computerCreatures: [
    { name: '👾', health: MAX_HP },
    { name: '🐙', health: MAX_HP },
  ],
  mp: 0,
  maxMp: INITIAL_MAX_MP,
  mpPerTurn: INITIAL_MP_PER_TURN,
  turn: 0,

  // Rune System State
  gold: 1000,
  runes: [],
  availableRunes: [
    {
      id: 1,
      name: 'Rune of Strength',
      type: 'Common',
      effect: 'Increases the Attack stat of all creatures by 10.',
      cost: 100,
      count: 0,
      statEffect: { stat: 'attack', value: 10 },
    },
    {
      id: 2,
      name: 'Rune of Vitality',
      type: 'Common',
      effect: 'Increases the Health stat of all creatures by 20.',
      cost: 100,
      count: 0,
      statEffect: { stat: 'health', value: 20 },
    },
    {
      id: 3,
      name: 'Rune of Speed',
      type: 'Common',
      effect: 'Increases the Speed stat of all creatures by 5.',
      cost: 100,
      count: 0,
      statEffect: { stat: 'speed', value: 5 },
    },
    {
      id: 4,
      name: 'Rune of Wealth',
      type: 'Common',
      effect: 'Gain 50% more gold after each battle.',
      cost: 150,
      count: 0,
      statEffect: { stat: 'goldMultiplier', value: 0.5 },
    },
    {
      id: 5,
      name: 'Rune of the Assassin',
      type: 'Uncommon',
      effect:
        'Increases damage dealt to creatures with higher health than the user by 20%.',
      cost: 250,
      count: 0,
      statEffect: { stat: 'assassinDamage', value: 0.2 },
    },
    {
      id: 6,
      name: 'Rune of the Dragon',
      type: 'Rare',
      effect: 'Grants the ability to breathe fire, dealing 30 damage to all enemies.',
      cost: 500,
      count: 0,
      statEffect: { stat: 'dragonBreath', value: 30 },
    },
  ],
  baseStats: {
    attack: 0,
    health: 0,
    speed: 0,
    goldMultiplier: 1,
    assassinDamage: 0,
    dragonBreath: 0,
  },
};

// Game Reducer
const gameReducer = (state, action) => {
  switch (action.type) {
    // Existing Game Actions
    case 'UPDATE_CREATURE':
      return {
        ...state,
        [action.side]: state[action.side].map((creature) =>
          creature.name === action.creature.name
            ? { ...creature, ...action.creature }
            : creature
        ),
      };
    case 'UPDATE_MP':
      return { ...state, mp: action.mp };
    case 'UPDATE_MAX_MP':
      return { ...state, maxMp: action.maxMp };
    case 'UPDATE_MP_PER_TURN':
      return { ...state, mpPerTurn: action.mpPerTurn };
    case 'INCREMENT_TURN':
      return { ...state, turn: state.turn + 1 };

    // Rune Shop Actions
    case 'BUY_RUNE':
      if (state.gold < action.rune.cost) return state;
      return {
        ...state,
        gold: state.gold - action.rune.cost,
        runes: [...state.runes, action.rune],
        availableRunes: state.availableRunes.map((rune) =>
          rune.id === action.rune.id ? { ...rune, count: rune.count + 1 } : rune
        ),
      };
    case 'SELL_RUNE':
      return {
        ...state,
        gold: state.gold + Math.floor(action.rune.cost / 2),
        runes: state.runes.filter((rune, index) => index !== action.index),
        availableRunes: state.availableRunes.map((rune) =>
          rune.id === action.rune.id ? { ...rune, count: rune.count - 1 } : rune
        ),
      };

    // Additional Game Actions
    case 'ADD_GOLD':
      return {
        ...state,
        gold: state.gold + action.amount,
      };
    default:
      return state;
  }
};

// Create Contexts
const StateContext = createContext();
const DispatchContext = createContext();

// Custom Hooks for Using Context
export const useStateContext = () => useContext(StateContext);
export const useDispatchContext = () => useContext(DispatchContext);

// Context Provider Component
export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  );
};
