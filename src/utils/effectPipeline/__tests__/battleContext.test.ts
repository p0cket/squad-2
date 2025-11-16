// Battle Context State Management Tests
import {
  createBattleContext,
  applyChangesToContext,
  subscribeToContext,
  getContextState,
  rollbackContext
} from '../battleContext'
import { BattleState, StateChange } from '../types'

describe('Battle Context', () => {
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

  test('creates battle context with initial state', () => {
    const context = createBattleContext(mockBattleState)

    expect(context.state).toEqual(mockBattleState)
    expect(context.stateHistory).toHaveLength(0)
    expect(context.subscribers).toBeInstanceOf(Map)
  })

  test('applies health changes correctly', () => {
    const context = createBattleContext(mockBattleState)

    const healthChange: StateChange = {
      type: 'HEALTH_CHANGE',
      creatureId: 2,
      timestamp: Date.now(),
      data: {
        delta: -20,
        newHealth: 40,
        source: 'test'
      }
    }

    applyChangesToContext(context, [healthChange])

    expect(context.state.computerCreatures[0].health).toBe(40)
    expect(context.stateHistory).toHaveLength(1) // Previous state saved
  })

  test('applies status changes correctly', () => {
    const context = createBattleContext(mockBattleState)

    const statusChange: StateChange = {
      type: 'STATUS_APPLIED',
      creatureId: 1,
      timestamp: Date.now(),
      data: {
        statusId: 'BURN',
        duration: 3
      }
    }

    applyChangesToContext(context, [statusChange])

    const dragon = context.state.playerCreatures[0]
    expect(dragon.statuses).toHaveLength(1)
    expect(dragon.statuses[0].id).toBe('BURN')
    expect(dragon.statuses[0].duration).toBe(3)
  })

  test('removes status effects correctly', () => {
    const contextWithBurn = createBattleContext({
      ...mockBattleState,
      playerCreatures: [
        {
          ...mockBattleState.playerCreatures[0],
          statuses: [{
            name: 'Burn',
            type: 'debuff',
            timing: 'afterAttack',
            duration: 3,
            effectFuncName: 'applyBurn',
            chance: 1,
            icon: '🔥',
            id: 'BURN',
            notes: 'Test burn'
          }]
        }
      ]
    })

    const statusRemoval: StateChange = {
      type: 'STATUS_REMOVED',
      creatureId: 1,
      timestamp: Date.now(),
      data: {
        statusId: 'BURN'
      }
    }

    applyChangesToContext(contextWithBurn, [statusRemoval])

    const dragon = contextWithBurn.state.playerCreatures[0]
    expect(dragon.statuses).toHaveLength(0)
  })

  test('applies stat modifications correctly', () => {
    const context = createBattleContext(mockBattleState)

    const statChange: StateChange = {
      type: 'STAT_MODIFIED',
      creatureId: 1,
      timestamp: Date.now(),
      data: {
        statName: 'attack',
        value: 5,
        source: 'test-buff'
      }
    }

    applyChangesToContext(context, [statChange])

    expect(context.state.playerCreatures[0].attack).toBe(30) // 25 + 5
  })

  test('handles creature movement', () => {
    const context = createBattleContext(mockBattleState)

    const moveChange: StateChange = {
      type: 'CREATURE_MOVED',
      creatureId: 2,
      timestamp: Date.now(),
      data: {
        fromPosition: 0,
        toPosition: 'back',
        reason: 'death'
      }
    }

    applyChangesToContext(context, [moveChange])

    // Goblin should be moved to the back (still in array but repositioned)
    expect(context.state.computerCreatures).toHaveLength(1)
  })

  test('handles creature death', () => {
    const context = createBattleContext(mockBattleState)

    const deathChange: StateChange = {
      type: 'CREATURE_DIED',
      creatureId: 2,
      timestamp: Date.now(),
      data: {}
    }

    applyChangesToContext(context, [deathChange])

    // Death triggers movement to back
    expect(context.state.computerCreatures).toHaveLength(1)
  })

  test('subscription system works correctly', () => {
    const context = createBattleContext(mockBattleState)
    const mockCallback = jest.fn()

    const unsubscribe = subscribeToContext(context, 'HEALTH_CHANGE', mockCallback)

    const healthChange: StateChange = {
      type: 'HEALTH_CHANGE',
      creatureId: 1,
      timestamp: Date.now(),
      data: { delta: -10, newHealth: 90, source: 'test' }
    }

    applyChangesToContext(context, [healthChange])

    expect(mockCallback).toHaveBeenCalledWith([healthChange], context.state)

    // Test unsubscribe
    unsubscribe()
    applyChangesToContext(context, [healthChange])

    expect(mockCallback).toHaveBeenCalledTimes(1) // Should not be called again
  })

  test('notifies "all" subscribers', () => {
    const context = createBattleContext(mockBattleState)
    const mockAllCallback = jest.fn()

    subscribeToContext(context, 'all', mockAllCallback)

    const healthChange: StateChange = {
      type: 'HEALTH_CHANGE',
      creatureId: 1,
      timestamp: Date.now(),
      data: { delta: -10, newHealth: 90, source: 'test' }
    }

    applyChangesToContext(context, [healthChange])

    expect(mockAllCallback).toHaveBeenCalledWith([healthChange], context.state)
  })

  test('getContextState returns deep copy', () => {
    const context = createBattleContext(mockBattleState)

    const stateCopy = getContextState(context)

    expect(stateCopy).toEqual(context.state)
    expect(stateCopy).not.toBe(context.state) // Different reference
    expect(stateCopy.playerCreatures).not.toBe(context.state.playerCreatures)
  })

  test('rollback functionality works', () => {
    const context = createBattleContext(mockBattleState)

    // Make a change
    const healthChange: StateChange = {
      type: 'HEALTH_CHANGE',
      creatureId: 1,
      timestamp: Date.now(),
      data: { delta: -10, newHealth: 90, source: 'test' }
    }

    applyChangesToContext(context, [healthChange])
    expect(context.state.playerCreatures[0].health).toBe(90)

    // Rollback
    const success = rollbackContext(context)

    expect(success).toBe(true)
    expect(context.state.playerCreatures[0].health).toBe(100) // Back to original
  })

  test('rollback fails when no history available', () => {
    const context = createBattleContext(mockBattleState)

    const success = rollbackContext(context)

    expect(success).toBe(false)
  })

  test('limits state history to prevent memory issues', () => {
    const context = createBattleContext(mockBattleState)

    // Apply 60 changes (more than the 50 limit)
    for (let i = 0; i < 60; i++) {
      const change: StateChange = {
        type: 'HEALTH_CHANGE',
        creatureId: 1,
        timestamp: Date.now(),
        data: { delta: -1, newHealth: 100 - i - 1, source: 'test' }
      }
      applyChangesToContext(context, [change])
    }

    // Should be limited to 50
    expect(context.stateHistory.length).toBeLessThanOrEqual(50)
  })

  test('handles invalid change types gracefully', () => {
    const context = createBattleContext(mockBattleState)
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

    const invalidChange: StateChange = {
      type: 'INVALID_TYPE' as any,
      creatureId: 1,
      timestamp: Date.now(),
      data: {}
    }

    applyChangesToContext(context, [invalidChange])

    expect(consoleSpy).toHaveBeenCalledWith('⚠️ Unknown state change type: INVALID_TYPE')
    expect(context.state).toEqual(mockBattleState) // State unchanged

    consoleSpy.mockRestore()
  })

  test('handles subscriber callback errors gracefully', () => {
    const context = createBattleContext(mockBattleState)
    const errorCallback = jest.fn().mockImplementation(() => {
      throw new Error('Subscriber error')
    })
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    subscribeToContext(context, 'HEALTH_CHANGE', errorCallback)

    const healthChange: StateChange = {
      type: 'HEALTH_CHANGE',
      creatureId: 1,
      timestamp: Date.now(),
      data: { delta: -10, newHealth: 90, source: 'test' }
    }

    applyChangesToContext(context, [healthChange])

    expect(consoleErrorSpy).toHaveBeenCalled()
    consoleErrorSpy.mockRestore()
  })
})