import { setupDefaultTriggers, resetBattleTracking } from '../effects/triggerSetup'
import { createBattleContext } from '../battleContext'
import { resolveTriggeredEffects, registerEffectTrigger, clearAllTriggers } from '../effectResolver'
import { buildPoisonEffect } from '../factories'
import { BattleState, StateChange } from '../types'
import { Creature } from '../../../consts/types/types'

describe('Trigger Setup - Poison Spread', () => {
  let mockContext: any
  let playerCreature: Creature
  let computerCreature: Creature

  beforeEach(() => {
    // Reset triggers
    clearAllTriggers()
    setupDefaultTriggers()
    resetBattleTracking()

    // Mock creatures
    playerCreature = {
      ID: 1,
      name: 'Hero',
      owner: 'player',
      health: 100,
      maxHealth: 100,
      statuses: []
    } as any

    computerCreature = {
      ID: 2,
      name: 'Monster',
      owner: 'computer',
      health: 100,
      maxHealth: 100,
      statuses: []
    } as any

    // Mock context
    mockContext = {
      state: {
        playerCreatures: [playerCreature],
        computerCreatures: [computerCreature]
      }
    }
  })

  it('should spread poison to enemy when condition is met', () => {
    // Force random to return < 0.15 to trigger spread
    jest.spyOn(Math, 'random').mockReturnValue(0.1)

    const statusAppliedChange: StateChange = {
      type: 'STATUS_APPLIED',
      creatureId: playerCreature.ID,
      timestamp: Date.now(),
      data: {
        statusId: 'POISON',
        spreadCount: 0
      }
    }

    const triggeredEffects = resolveTriggeredEffects(
      { id: 'test', type: 'TEST', targetId: 1, priority: 1, timestamp: 1, data: {} },
      [statusAppliedChange],
      mockContext
    )

    expect(triggeredEffects).toHaveLength(1)
    expect(triggeredEffects[0].type).toBe('POISON')
    expect(triggeredEffects[0].targetId).toBe(computerCreature.ID)
    expect(triggeredEffects[0].data.spreadCount).toBe(1)
  })

  it('should NOT spread poison if limit is reached', () => {
    // Force random to return < 0.15
    jest.spyOn(Math, 'random').mockReturnValue(0.1)

    const statusAppliedChange: StateChange = {
      type: 'STATUS_APPLIED',
      creatureId: playerCreature.ID,
      timestamp: Date.now(),
      data: {
        statusId: 'POISON',
        spreadCount: 30 // Limit reached
      }
    }

    const triggeredEffects = resolveTriggeredEffects(
      { id: 'test', type: 'TEST', targetId: 1, priority: 1, timestamp: 1, data: {} },
      [statusAppliedChange],
      mockContext
    )

    expect(triggeredEffects).toHaveLength(0)
  })

  it('should increment spread count', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.1)

    const statusAppliedChange: StateChange = {
      type: 'STATUS_APPLIED',
      creatureId: playerCreature.ID,
      timestamp: Date.now(),
      data: {
        statusId: 'POISON',
        spreadCount: 1
      }
    }

    const triggeredEffects = resolveTriggeredEffects(
      { id: 'test', type: 'TEST', targetId: 1, priority: 1, timestamp: 1, data: {} },
      [statusAppliedChange],
      mockContext
    )

    expect(triggeredEffects).toHaveLength(1)
    expect(triggeredEffects[0].data.spreadCount).toBe(2)
  })
})
