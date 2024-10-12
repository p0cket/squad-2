// GameContext.js
import React, { createContext, useContext, useReducer } from "react"
import { applyRuneEffects } from "./utils.js/runeUtils"
import { resetCreatures } from "./utils.js/battleUtils"
import { applyMod, applyTurnEnhancementEffects } from "./utils.js/modUtils"
import { CREATURES } from "./consts/creatures"
import { BASE_RUNES } from "./consts/items"
import { generateLevels, loadLevelData } from "./utils.js/levelGeneratorUtils"
import { createUniqueParty } from "./utils.js/creatureUtils"

// Constants
export const INITIAL_MAX_MP = 50
export const INITIAL_MP_PER_TURN = 5
// Define enhancements for creatures
const { dragon, fish, alien, unicorn } = CREATURES
export const basePlayerCreatures = [dragon, unicorn]
export const baseComputerCreatures = [alien, fish]

// Initial State
const generatedLevels = generateLevels(10) // Generate levels once here

const initialState = {
  // Existing Game State
  playerCreatures: structuredClone(createUniqueParty(basePlayerCreatures)),
  computerCreatures: structuredClone(createUniqueParty(generatedLevels[0].opponentCreatures)), // Load level 1's creatures
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
  level: 1, // Start at level 1
  levels: generatedLevels, // Store the generated levels here
  levelEffects: generatedLevels[0].levelEffects, // Load level 1's effects
  modals: {replaceCreatureModal: null},
}
console.log("Initial State:", initialState)
// Game Reducer
const gameReducer = (state, action) => {
  console.log(`Action dispatched ${action.type}. Action and State:`, action, state)
  switch (action.type) {
    case "UPDATE_CREATURE":
      return {
        ...state,
        [action.side]: state[action.side].map((creature) =>
          creature.ID === action.creature.ID
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
    case "APPLY_MOD":
      return {
        ...state,
        playerCreatures: state.playerCreatures.map((creature) => {
          if (creature.ID === action.payload.creature.ID) {
            return applyMod(creature, action.payload.mod) // Use applyMod for all mods
          }
          return creature
        }),
      }
      case "MOVE_CREATURE_TO_BACK": {
        const { side, creatureId } = action.payload;
      
        // Get the creatures array (either player or computer)
        const creatures = [...state[side]];
      
        // Find the index of the dead creature
        const creatureIndex = creatures.findIndex(
          (creature) => creature.ID === creatureId
        );
      
        if (creatureIndex !== -1) {
          // Remove the creature from its current position
          const [deadCreature] = creatures.splice(creatureIndex, 1);
          // Add it to the end of the array
          creatures.push(deadCreature);
        }
      
        return {
          ...state,
          [side]: creatures,
        };
      }
      case "TOGGLE_SELECT_REPLACEMENT_CREATURE": {
        return {
          ...state,
          modals: {
            ...state.modals,
            replaceCreatureModal: !state.modals.replaceCreatureModal,
          },
        }
      }
      case "SWAP_CREATURE_POSITION": {
        const { side, newActiveCreatureId } = action.payload;
      
        const creatures = [...state[side]];
        const activeIndex = creatures.findIndex(
          (creature) => creature.ID === newActiveCreatureId
        );
      
        if (activeIndex !== -1) {
          const [newActive] = creatures.splice(activeIndex, 1);
          creatures.unshift(newActive); // Place selected creature in active slot
        }
      
        return {
          ...state,
          [side]: creatures,
        };
      }
      
    case "ATTACK_CREATURE":
      // Handle creature attack, applying aura effect if it exists
      const attacker = state.playerCreatures.find(
        (creature) => creature.ID === action.attacker.ID
      )
      if (attacker.aura && Math.random() < 0.75) {
        // 75% chance to apply the aura's effect
        //   applyAuraEffect(attacker.aura);
      }
      return state

    case "APPLY_TURN_EFFECTS":
      return {
        ...state,
        playerCreatures: state.playerCreatures.map((creature) =>
          applyTurnEnhancementEffects(creature)
        ),
        computerCreatures: state.computerCreatures.map((creature) =>
          applyTurnEnhancementEffects(creature)
        ),
      }
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
    case "NEXT_LEVEL":
      const nextLevel = state.currentLevel + 1

      // Use the loadLevelData function to get the next level's configuration
      const nextLevelData = loadLevelData(nextLevel)

      // Reset player creatures and apply rune effects
      const newPlayerTeam = resetCreatures(
        structuredClone(basePlayerCreatures).map((creature) =>
          applyRuneEffects(creature, state.runes)
        )
      )

      // Set up the new enemy team based on the next level's creatures
      const newComputerTeam = resetCreatures(
        structuredClone(nextLevelData.opponentCreatures)
      )

      return {
        ...state,
        playerCreatures: newPlayerTeam, // Reset player creatures with runes applied
        computerCreatures: newComputerTeam, // Load new level enemies
        currentLevel: nextLevel, // Advance to the next level
        levelEffects: nextLevelData.levelEffects, // Apply level-specific effects
        mp: 0, // Reset MP
        turn: 0, // Reset turn
        battleStatus: null, // Clear battle status
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
      const recalculatedPlayerCreatures = structuredClone(
        basePlayerCreatures
      ).map((creature) => applyRuneEffects(creature, remainingRunes))
      return {
        ...state,
        gold: state.gold + Math.floor(action.rune.cost / 2),
        runes: remainingRunes,
        playerCreatures: recalculatedPlayerCreatures,
        availableRunes: state.availableRunes.map((rune) =>
          rune.id === action.rune.id ? { ...rune, count: rune.count - 1 } : rune
        ),
      }
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

// Auras and Enhancements are under MODS
// case "APPLY_AURA":
//   return {
//     ...state,
//     playerCreatures: state.playerCreatures.map((creature) => {
//       if (creature.ID === action.payload.creature.ID) {
//         return {
//           ...creature,
//           aura: action.payload.aura, // Attach the aura to the creature
//         }
//       }
//       return creature
//     }),
//   }
// case "APPLY_ENHANCEMENT":
//     return {
//       ...state,
//       playerCreatures: state.playerCreatures.map((creature) => {
//         if (creature.ID === action.creature.ID) {
//           return applyEnhancement(creature, action.enhancement)
//         }
//         return creature
//       }),
//     }
