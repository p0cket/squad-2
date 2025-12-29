import { renderHook, act, waitFor } from '@testing-library/react'
import { useBattleEngine } from '../hooks/useBattleEngine'
import { BattleState } from '../types'
import * as effectPipelineEngine from '../effectPipelineEngine'

// Mock the effect pipeline engine
jest.mock('../effectPipelineEngine', () => ({
  processEffectChain: jest.fn().mockResolvedValue(undefined)
}))

jest.mock('../effects/triggerSetup', () => ({
  setupDefaultTriggers: jest.fn()
}))

describe('useBattleEngine Autopilot', () => {
  const mockInitialState: BattleState = {
    playerCreatures: [
      {
        ID: 1,
        name: 'Dragon',
        icon: '🐉',
        template: 'dragon',
        health: 100,
        maxHealth: 100,
        attack: 25,
        trueDamage: 0,
        defense: 15,
        mods: [],
        startingAttacks: [],
        possibleAttacks: [],
        statuses: [],
        owner: 'player'
      }
    ],
    computerCreatures: [
      {
        ID: 2,
        name: 'Goblin',
        icon: '👺',
        template: 'goblin',
        health: 60,
        maxHealth: 60,
        attack: 15,
        trueDamage: 0,
        defense: 8,
        mods: [],
        startingAttacks: [],
        possibleAttacks: [],
        statuses: [],
        owner: 'computer'
      }
    ],
    mp: 0,
    turn: 1,
    currentTurnOwner: 'player',
    battleStatus: 'in-progress'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('autopilot triggers exactly once per turn', async () => {
    const { result } = renderHook(() => useBattleEngine(mockInitialState))

    // Enable autopilot
    act(() => {
      result.current.setIsAutopilotEnabled(true)
      result.current.setAutopilotSpeed(100) // Fast speed for test
    })

    // Advance timers to trigger autopilot
    await act(async () => {
      jest.advanceTimersByTime(2000) // Wait for autopilot delay (1500ms)
    })

    // Check if processEffectChain was called (indicating an attack)
    // We expect 1 call for the attack
    expect(effectPipelineEngine.processEffectChain).toHaveBeenCalledTimes(1)
    
    // Clear mocks to check next turn
    ;(effectPipelineEngine.processEffectChain as jest.Mock).mockClear()

    // Advance timers to complete the turn and start next one
    await act(async () => {
      jest.advanceTimersByTime(2000) // Wait for turn transition
    })
    
    // Should be computer turn now, wait for computer action
    await act(async () => {
      jest.advanceTimersByTime(1000) // Initial delay
      jest.advanceTimersByTime(1000) // Computer action delay
      jest.advanceTimersByTime(1000) // Transition delay
    })

    // Should be player turn again
    await waitFor(() => {
      expect(result.current.battleState.currentTurnOwner).toBe('player')
    }, { timeout: 5000 })
    
    expect(result.current.battleState.turn).toBe(3) // Turn 1 -> 2 (comp) -> 3 (player)

    // Wait for autopilot to trigger again
    await act(async () => {
      jest.advanceTimersByTime(2000)
    })

    // Should have attacked exactly once this turn (plus one from computer turn = 2)
    expect(effectPipelineEngine.processEffectChain).toHaveBeenCalledTimes(2)
  })
})
