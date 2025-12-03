import { renderHook, act } from '@testing-library/react'
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

describe('useBattleEngine Dead Creature Logic', () => {
  const mockInitialState: BattleState = {
    playerCreatures: [
      {
        ID: 1,
        name: 'Dragon',
        icon: '🐉',
        template: 'dragon',
        health: 0, // Dead
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
        health: 0, // Dead
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

  test('dead creature cannot attack', async () => {
    const { result } = renderHook(() => useBattleEngine(mockInitialState))

    await act(async () => {
      await result.current.performAttack(1, 2, { name: 'Test Attack' })
    })

    // Should not have called processEffectChain
    expect(effectPipelineEngine.processEffectChain).not.toHaveBeenCalled()
  })

  test('cannot target dead creature with normal attack', async () => {
    const aliveState = {
      ...mockInitialState,
      playerCreatures: [{ ...mockInitialState.playerCreatures[0], health: 100 }] // Alive attacker
    }
    const { result } = renderHook(() => useBattleEngine(aliveState))

    await act(async () => {
      await result.current.performAttack(1, 2, { name: 'Test Attack' }) // Target 2 is dead
    })

    // Should not have called processEffectChain
    expect(effectPipelineEngine.processEffectChain).not.toHaveBeenCalled()
  })

  test('can target dead creature if attack allows it', async () => {
    const aliveState = {
      ...mockInitialState,
      playerCreatures: [{ ...mockInitialState.playerCreatures[0], health: 100 }] // Alive attacker
    }
    const { result } = renderHook(() => useBattleEngine(aliveState))

    await act(async () => {
      await result.current.performAttack(1, 2, { name: 'Resurrection', canTargetDead: true })
    })

    // Should have called processEffectChain
    expect(effectPipelineEngine.processEffectChain).toHaveBeenCalledTimes(1)
  })
})
