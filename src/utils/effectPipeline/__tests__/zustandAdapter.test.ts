// Test file for Zustand Adapter
import {
  createZustandBattleStore,
  applyChangesToZustandContext,
  subscribeToZustandContext,
  getZustandContextState,
  notifyZustandContextSubscribers
} from '../zustandAdapter'
import { BattleState, StateChange } from '../types'

describe('Zustand Adapter', () => {
  const mockBattleState: BattleState = {
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
    battleStatus: null
  }

  test('creates a store with initial state', () => {
    const store = createZustandBattleStore(mockBattleState)
    const state = store.getState()

    expect(state.state).toEqual(mockBattleState)
    expect(state.stateHistory).toEqual([])
    expect(state.contextId).toBeDefined()
  })

  test('applies health changes correctly', () => {
    const store = createZustandBattleStore(mockBattleState)

    const healthChange: StateChange = {
      type: 'HEALTH_CHANGE',
      creatureId: 2,
      timestamp: Date.now(),
      data: {
        delta: -10,
        newHealth: 50,
        source: 'attack'
      }
    }

    applyChangesToZustandContext(store, [healthChange])

    const newState = store.getState().state
    expect(newState.computerCreatures[0].health).toBe(50)
  })

  test('maintains state history', () => {
    const store = createZustandBattleStore(mockBattleState)

    const healthChange: StateChange = {
      type: 'HEALTH_CHANGE',
      creatureId: 2,
      timestamp: Date.now(),
      data: {
        delta: -10,
        newHealth: 50,
        source: 'attack'
      }
    }

    applyChangesToZustandContext(store, [healthChange])

    const state = store.getState()
    expect(state.stateHistory.length).toBe(1)
    expect(state.stateHistory[0].computerCreatures[0].health).toBe(60) // Original health
  })

  test('subscribes to context changes', () => {
    const store = createZustandBattleStore(mockBattleState)
    const callback = jest.fn()

    subscribeToZustandContext(store, 'all', callback)

    const healthChange: StateChange = {
      type: 'HEALTH_CHANGE',
      creatureId: 2,
      timestamp: Date.now(),
      data: {
        delta: -10,
        newHealth: 50,
        source: 'attack'
      }
    }

    applyChangesToZustandContext(store, [healthChange])

    expect(callback).toHaveBeenCalled()
    expect(callback).toHaveBeenCalledWith(
      [healthChange],
      expect.objectContaining({
        computerCreatures: expect.arrayContaining([
          expect.objectContaining({ health: 50 })
        ])
      })
    )
  })

  test('defers notifications when requested', () => {
    const store = createZustandBattleStore(mockBattleState)
    const callback = jest.fn()

    subscribeToZustandContext(store, 'all', callback)

    const healthChange: StateChange = {
      type: 'HEALTH_CHANGE',
      creatureId: 2,
      timestamp: Date.now(),
      data: {
        delta: -10,
        newHealth: 50,
        source: 'attack'
      }
    }

    applyChangesToZustandContext(store, [healthChange], { deferNotification: true })

    // Should not have been called yet
    expect(callback).not.toHaveBeenCalled()

    // Manually trigger notification
    notifyZustandContextSubscribers(store, [healthChange])

    // Now it should be called
    expect(callback).toHaveBeenCalled()
  })

  test('getZustandContextState returns cloned state', () => {
    const store = createZustandBattleStore(mockBattleState)
    
    const state1 = getZustandContextState(store)
    const state2 = getZustandContextState(store)

    // Should be equal but not the same reference
    expect(state1).toEqual(state2)
    expect(state1).not.toBe(state2)
  })

  test('supports multiple subscribers', () => {
    const store = createZustandBattleStore(mockBattleState)
    const callback1 = jest.fn()
    const callback2 = jest.fn()

    subscribeToZustandContext(store, 'all', callback1)
    subscribeToZustandContext(store, 'all', callback2)

    const healthChange: StateChange = {
      type: 'HEALTH_CHANGE',
      creatureId: 2,
      timestamp: Date.now(),
      data: {
        delta: -10,
        newHealth: 50,
        source: 'attack'
      }
    }

    applyChangesToZustandContext(store, [healthChange])

    expect(callback1).toHaveBeenCalled()
    expect(callback2).toHaveBeenCalled()
  })

  test('unsubscribe works correctly', () => {
    const store = createZustandBattleStore(mockBattleState)
    const callback = jest.fn()

    const unsubscribe = subscribeToZustandContext(store, 'all', callback)

    const healthChange: StateChange = {
      type: 'HEALTH_CHANGE',
      creatureId: 2,
      timestamp: Date.now(),
      data: {
        delta: -10,
        newHealth: 50,
        source: 'attack'
      }
    }

    applyChangesToZustandContext(store, [healthChange])
    expect(callback).toHaveBeenCalledTimes(1)

    // Unsubscribe
    unsubscribe()

    // Apply another change
    const healthChange2: StateChange = {
      type: 'HEALTH_CHANGE',
      creatureId: 2,
      timestamp: Date.now(),
      data: {
        delta: -10,
        newHealth: 40,
        source: 'attack'
      }
    }

    applyChangesToZustandContext(store, [healthChange2])

    // Should still be 1 (not called again)
    expect(callback).toHaveBeenCalledTimes(1)
  })
})
