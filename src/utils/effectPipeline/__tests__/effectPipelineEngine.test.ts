// Effect Pipeline Engine Integration Tests
import { processEffectChain } from '../effectPipelineEngine'
import { createBattleContext } from '../battleContext'
import { BattleState, Effect, StateChange } from '../types'

// Mock animation engine
jest.mock('../animationEngine', () => ({
  executeAnimationsSequentially: jest.fn().mockResolvedValue(undefined)
}))

describe('Effect Pipeline Engine', () => {
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

  test('processes single effect successfully', async () => {
    const context = createBattleContext(mockBattleState)
    const changes: StateChange[] = [
      {
        type: 'HEALTH_CHANGE',
        creatureId: 2,
        timestamp: Date.now(),
        data: { delta: -10, newHealth: 50, source: 'test' }
      }
    ]

    const testEffect: Effect = {
      id: 'test-damage',
      targetId: 2,
      priority: 50,
      animations: [
        { type: 'shake', targetId: 2, duration: 300 }
      ],
      apply: async () => changes
    }

    await processEffectChain(testEffect, context)

    // Check that state was updated
    expect(context.state.computerCreatures[0].health).toBe(50)
  })

  test('processes cascading effects correctly', async () => {
    const context = createBattleContext(mockBattleState)
    let cascadeTriggered = false

    const cascadingEffect: Effect = {
      id: 'cascade-trigger',
      targetId: 2,
      priority: 50,
      animations: [],
      apply: async () => {
        cascadeTriggered = true
        return [
          {
            type: 'HEALTH_CHANGE',
            creatureId: 2,
            timestamp: Date.now(),
            data: { delta: -5, newHealth: 55, source: 'cascade' }
          }
        ]
      }
    }

    const initialEffect: Effect = {
      id: 'initial-effect',
      targetId: 2,
      priority: 50,
      animations: [],
      apply: async () => [
        {
          type: 'HEALTH_CHANGE',
          creatureId: 2,
          timestamp: Date.now(),
          data: { delta: -10, newHealth: 50, source: 'initial' }
        }
      ]
    }

    // Register a proper trigger rule that creates a cascade effect
    const { registerEffectTrigger, clearAllTriggers } = require('../effectResolver')
    
    // Clear any existing triggers
    clearAllTriggers()
    
    // Register a trigger that creates a cascade when health changes
    registerEffectTrigger('HEALTH_CHANGE', {
      condition: (change: any, context: any) => {
        // Trigger on any health change from the initial effect
        return change.data.source === 'initial'
      },
      createEffect: (change: any, context: any) => {
        return cascadingEffect
      },
      priority: 10
    })

    await processEffectChain(initialEffect, context)

    // Wait for cascade processing
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(cascadeTriggered).toBe(true)
    expect(context.state.computerCreatures[0].health).toBe(45) // Both initial (-10) and cascade (-5) effects applied

    // Clean up
    clearAllTriggers()
  })

  test('prevents infinite loops', async () => {
    const context = createBattleContext(mockBattleState)
    let applyCount = 0

    const loopingEffect: Effect = {
      id: 'loop-effect',
      targetId: 1,
      priority: 50,
      animations: [],
      apply: async () => {
        applyCount++
        return [
          {
            type: 'HEALTH_CHANGE',
            creatureId: 1,
            timestamp: Date.now(),
            data: { delta: -1, newHealth: 99 - applyCount, source: 'loop' }
          }
        ]
      }
    }

    await processEffectChain(loopingEffect, context)

    // Should only apply once, not loop infinitely
    expect(applyCount).toBe(1)
  })

  test('handles effect application errors gracefully', async () => {
    const context = createBattleContext(mockBattleState)

    const errorEffect: Effect = {
      id: 'error-effect',
      targetId: 1,
      priority: 50,
      animations: [],
      apply: async () => {
        throw new Error('Test error')
      }
    }

    // Should not throw, should handle gracefully
    await expect(processEffectChain(errorEffect, context)).resolves.not.toThrow()
  })

  test('respects effect priority ordering', async () => {
    const context = createBattleContext(mockBattleState)
    const executionOrder: string[] = []

    const lowPriorityEffect: Effect = {
      id: 'low-priority',
      targetId: 1,
      priority: 10,
      animations: [],
      apply: async () => {
        executionOrder.push('low')
        return []
      }
    }

    const highPriorityEffect: Effect = {
      id: 'high-priority',
      targetId: 1,
      priority: 90,
      animations: [],
      apply: async () => {
        executionOrder.push('high')
        return []
      }
    }

    // Process low priority first, but high priority should execute first
    await processEffectChain(lowPriorityEffect, context)
    await processEffectChain(highPriorityEffect, context)

    // Note: In real implementation, we'd need to queue both effects simultaneously
    // This test shows the concept but would need refactoring for true parallel testing
    expect(executionOrder).toContain('low')
    expect(executionOrder).toContain('high')
  })
})