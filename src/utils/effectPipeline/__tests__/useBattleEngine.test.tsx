// React Hook Integration Tests
import { renderHook, act } from '@testing-library/react'
import { useBattleEngine } from '../hooks/useBattleEngine'
import { BattleState } from '../types'

// Mock the effect pipeline engine
jest.mock('../effectPipelineEngine', () => ({
  processEffectChain: jest.fn().mockResolvedValue(undefined)
}))

jest.mock('../effects/triggerSetup', () => ({
  setupDefaultTriggers: jest.fn()
}))

describe('useBattleEngine Hook', () => {
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
    turn: 0,
    currentTurnOwner: null,
    battleStatus: null
  }

  test('initializes with provided battle state', () => {
    const { result } = renderHook(() => useBattleEngine(mockInitialState))

    expect(result.current.battleState).toEqual(mockInitialState)
    expect(result.current.isProcessingEffects).toBe(false)
  })

  test('provides utility functions', () => {
    const { result } = renderHook(() => useBattleEngine(mockInitialState))

    expect(typeof result.current.applyBurn).toBe('function')
    expect(typeof result.current.applyPoison).toBe('function')
    expect(typeof result.current.performAttack).toBe('function')
    expect(typeof result.current.performHealing).toBe('function')
    expect(typeof result.current.getAliveCreatures).toBe('function')
    expect(typeof result.current.isBattleOver).toBe('function')
    expect(typeof result.current.getBattleWinner).toBe('function')
    expect(typeof result.current.resetBattle).toBe('function')
    expect(typeof result.current.getDebugInfo).toBe('function')
  })

  test('getAliveCreatures filters correctly', () => {
    const { result } = renderHook(() => useBattleEngine(mockInitialState))

    const playerCreatures = result.current.getAliveCreatures('player')
    const computerCreatures = result.current.getAliveCreatures('computer')

    expect(playerCreatures).toHaveLength(1)
    expect(playerCreatures[0].name).toBe('Dragon')
    expect(computerCreatures).toHaveLength(1)
    expect(computerCreatures[0].name).toBe('Goblin')
  })

  test('getAliveCreatures excludes dead creatures', () => {
    const stateWithDeadCreature: BattleState = {
      ...mockInitialState,
      computerCreatures: [
        {
          ...mockInitialState.computerCreatures[0],
          health: 0 // Dead creature
        }
      ]
    }

    const { result } = renderHook(() => useBattleEngine(stateWithDeadCreature))

    const computerCreatures = result.current.getAliveCreatures('computer')
    expect(computerCreatures).toHaveLength(0)
  })

  test('isBattleOver detects when all creatures on one side are dead', () => {
    const stateWithDeadGoblin: BattleState = {
      ...mockInitialState,
      computerCreatures: [
        {
          ...mockInitialState.computerCreatures[0],
          health: 0
        }
      ]
    }

    const { result } = renderHook(() => useBattleEngine(stateWithDeadGoblin))

    expect(result.current.isBattleOver()).toBe(true)
    expect(result.current.getBattleWinner()).toBe('player')
  })

  test('isBattleOver returns false when both sides have living creatures', () => {
    const { result } = renderHook(() => useBattleEngine(mockInitialState))

    expect(result.current.isBattleOver()).toBe(false)
    expect(result.current.getBattleWinner()).toBeNull()
  })

  test('resetBattle restores initial state', () => {
    const { result } = renderHook(() => useBattleEngine(mockInitialState))

    act(() => {
      result.current.resetBattle()
    })

    expect(result.current.battleState).toEqual(mockInitialState)
  })

  test('applyBurn sets processing state', async () => {
    const { result } = renderHook(() => useBattleEngine(mockInitialState))

    act(() => {
      result.current.applyBurn(2, 10)
    })

    expect(result.current.isProcessingEffects).toBe(true)

    // Wait for effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10))
    })
  })

  test('applyPoison sets processing state', async () => {
    const { result } = renderHook(() => useBattleEngine(mockInitialState))

    act(() => {
      result.current.applyPoison(2, 15)
    })

    expect(result.current.isProcessingEffects).toBe(true)

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10))
    })
  })

  test('performAttack handles attack with all parameters', async () => {
    const { result } = renderHook(() => useBattleEngine(mockInitialState))

    const attack = {
      name: 'Fire Breath',
      damage: 20,
      template: 'fire',
      attackType: 'magical',
      effects: [],
      chanceToLand: 1,
      trueDamage: 0,
      icon: '🔥',
      notes: 'Test attack',
      cooldown: 0
    }

    act(() => {
      result.current.performAttack(1, 2, attack)
    })

    expect(result.current.isProcessingEffects).toBe(true)

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10))
    })
  })

  test('performHealing applies healing', async () => {
    const damagedState: BattleState = {
      ...mockInitialState,
      playerCreatures: [
        {
          ...mockInitialState.playerCreatures[0],
          health: 50 // Damaged dragon
        }
      ]
    }

    const { result } = renderHook(() => useBattleEngine(damagedState))

    act(() => {
      result.current.performHealing(1, 1, 25)
    })

    expect(result.current.isProcessingEffects).toBe(true)

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10))
    })
  })

  test('getDebugInfo returns useful debugging information', () => {
    const { result } = renderHook(() => useBattleEngine(mockInitialState))

    const debugInfo = result.current.getDebugInfo()

    expect(debugInfo).toBeDefined()
    expect(debugInfo.battleState).toBeDefined()
    expect(typeof debugInfo.stateHistoryLength).toBe('number')
    expect(typeof debugInfo.subscriberCount).toBe('number')
    expect(typeof debugInfo.isProcessingEffects).toBe('boolean')
  })

  test('handles invalid creature IDs gracefully', async () => {
    const { result } = renderHook(() => useBattleEngine(mockInitialState))

    // Should not throw for invalid creature ID
    await act(async () => {
      await result.current.applyBurn(999, 10) // Non-existent creature
    })

    expect(result.current.battleState).toEqual(mockInitialState) // State unchanged
  })
})