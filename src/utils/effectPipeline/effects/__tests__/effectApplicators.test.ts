// Tests for Effect Applicators - Demonstrating testability of decoupled logic
import {
  applyAttackEffect,
  applyHealingEffect,
  applyBurnDamage,
  calculateDamageAfterDefense,
  calculateActualHealing,
  clampHealth
} from '../effectApplicators'
import { BattleContext, BattleState } from '../../types'
import { Creature } from '../../../../consts/types/types'

// Helper to create a mock creature
const createMockCreature = (overrides: Partial<Creature> = {}): Creature => ({
  ID: 1,
  name: 'Test Creature',
  icon: '🧪',
  template: 'test',
  health: 100,
  maxHealth: 100,
  attack: 10,
  trueDamage: 0,
  defense: 5,
  mods: [],
  startingAttacks: [],
  possibleAttacks: [],
  statuses: [],
  owner: 'player',
  ...overrides
})

// Helper to create a mock battle context
const createMockContext = (
  playerCreatures: Creature[] = [],
  computerCreatures: Creature[] = []
): BattleContext => {
  const state: BattleState = {
    playerCreatures,
    computerCreatures,
    mp: 0,
    turn: 0,
    battleStatus: null
  }

  return {
    contextId: 'test-context',
    state,
    stateHistory: [],
    subscribers: new Map()
  }
}

describe('Effect Applicators', () => {
  describe('Helper Functions', () => {
    test('calculateDamageAfterDefense reduces damage by defense', () => {
      const damage = calculateDamageAfterDefense(20, 5, 10)
      expect(damage).toBe(15) // (20 + 5) - 10 = 15
    })

    test('calculateDamageAfterDefense has minimum of 1', () => {
      const damage = calculateDamageAfterDefense(5, 0, 10)
      expect(damage).toBe(1) // Can't go below 1
    })

    test('calculateActualHealing caps at max health', () => {
      const healing = calculateActualHealing(50, 80, 100)
      expect(healing).toBe(20) // Can only heal to 100
    })

    test('clampHealth prevents negative health', () => {
      const health = clampHealth(-10, 100)
      expect(health).toBe(0)
    })

    test('clampHealth prevents exceeding max health', () => {
      const health = clampHealth(150, 100)
      expect(health).toBe(100)
    })
  })

  describe('applyAttackEffect', () => {
    test('calculates damage correctly', () => {
      const attacker = createMockCreature({ ID: 1, attack: 15 })
      const target = createMockCreature({ ID: 2, defense: 5, health: 100 })
      const context = createMockContext([attacker], [target])

      const attack = {
        name: 'Test Attack',
        damage: 20,
        template: 'test',
        attackType: 'physical' as const,
        effects: [],
        chanceToLand: 1,
        trueDamage: 0,
        icon: '⚔️',
        notes: '',
        cooldown: 0
      }

      const result = applyAttackEffect(context, 1, 2, attack)

      // Damage = (20 + 15) - 5 = 30
      expect(result.actualDamage).toBe(30)
      expect(result.stateChanges).toHaveLength(1)
      expect(result.stateChanges[0].type).toBe('HEALTH_CHANGE')
      expect(result.stateChanges[0].data.delta).toBe(-30)
    })

    test('generates damage breakdown', () => {
      const attacker = createMockCreature({ ID: 1, attack: 10 })
      const target = createMockCreature({ ID: 2, defense: 3 })
      const context = createMockContext([attacker], [target])

      const attack = {
        name: 'Fireball',
        damage: 15,
        template: 'fire',
        attackType: 'magical' as const,
        effects: [],
        chanceToLand: 1,
        trueDamage: 0,
        icon: '🔥',
        notes: '',
        cooldown: 0
      }

      const result = applyAttackEffect(context, 1, 2, attack)

      expect(result.damageBreakdown).toContainEqual({ label: 'Fireball', value: 15 })
      expect(result.damageBreakdown).toContainEqual({ label: 'Attack Bonus', value: 10 })
      expect(result.damageBreakdown).toContainEqual({ label: 'Defense', value: -3 })
      expect(result.damageBreakdown).toContainEqual({ label: 'Total Damage', value: 22 })
    })

    test('does not kill target if health remains', () => {
      const attacker = createMockCreature({ ID: 1, attack: 5 })
      const target = createMockCreature({ ID: 2, health: 100, defense: 0 })
      const context = createMockContext([attacker], [target])

      const attack = {
        name: 'Weak Attack',
        damage: 10,
        template: 'test',
        attackType: 'physical' as const,
        effects: [],
        chanceToLand: 1,
        trueDamage: 0,
        icon: '👊',
        notes: '',
        cooldown: 0
      }

      const result = applyAttackEffect(context, 1, 2, attack)

      expect(result.stateChanges[0].data.newHealth).toBe(85) // 100 - 15
    })
  })

  describe('applyHealingEffect', () => {
    test('heals for correct amount', () => {
      const caster = createMockCreature({ ID: 1 })
      const target = createMockCreature({ ID: 2, health: 50, maxHealth: 100 })
      const context = createMockContext([caster], [target])

      const result = applyHealingEffect(context, 1, 2, 30)

      expect(result.actualHealing).toBe(30)
      expect(result.stateChanges[0].data.delta).toBe(30)
      expect(result.stateChanges[0].data.newHealth).toBe(80)
    })

    test('caps healing at max health', () => {
      const caster = createMockCreature({ ID: 1 })
      const target = createMockCreature({ ID: 2, health: 90, maxHealth: 100 })
      const context = createMockContext([caster], [target])

      const result = applyHealingEffect(context, 1, 2, 50)

      expect(result.actualHealing).toBe(10) // Can only heal to 100
      expect(result.stateChanges[0].data.newHealth).toBe(100)
    })

    test('does not heal if already at max health', () => {
      const caster = createMockCreature({ ID: 1 })
      const target = createMockCreature({ ID: 2, health: 100, maxHealth: 100 })
      const context = createMockContext([caster], [target])

      const result = applyHealingEffect(context, 1, 2, 50)

      expect(result.actualHealing).toBe(0)
      expect(result.stateChanges[0].data.newHealth).toBe(100)
    })
  })

  describe('applyBurnDamage', () => {
    test('applies burn damage and status', () => {
      const target = createMockCreature({ ID: 1, health: 100 })
      const context = createMockContext([target], [])

      const result = applyBurnDamage(context, 1, 10)

      expect(result.actualDamage).toBe(10)
      expect(result.stateChanges).toHaveLength(2)

      const healthChange = result.stateChanges.find(c => c.type === 'HEALTH_CHANGE')
      const statusChange = result.stateChanges.find(c => c.type === 'STATUS_APPLIED')

      expect(healthChange).toBeDefined()
      expect(healthChange?.data.delta).toBe(-10)
      expect(statusChange).toBeDefined()
      expect(statusChange?.data.statusId).toBe('BURN')
    })

    test('cannot deal more damage than current health', () => {
      const target = createMockCreature({ ID: 1, health: 5 })
      const context = createMockContext([target], [])

      const result = applyBurnDamage(context, 1, 20)

      expect(result.actualDamage).toBe(5) // Only 5 health left
      expect(result.stateChanges[0].data.newHealth).toBe(0)
    })
  })
})

describe('Integration: Applicators are pure and reusable', () => {
  test('can call same applicator multiple times with different contexts', () => {
    const attacker = createMockCreature({ ID: 1, attack: 10 })
    const target1 = createMockCreature({ ID: 2, health: 100 })
    const target2 = createMockCreature({ ID: 3, health: 80 })

    const context1 = createMockContext([attacker], [target1])
    const context2 = createMockContext([attacker], [target2])

    const attack = {
      name: 'Strike',
      damage: 15,
      template: 'test',
      attackType: 'physical' as const,
      effects: [],
      chanceToLand: 1,
      trueDamage: 0,
      icon: '⚔️',
      notes: '',
      cooldown: 0
    }

    const result1 = applyAttackEffect(context1, 1, 2, attack)
    const result2 = applyAttackEffect(context2, 1, 3, attack)

    // Same damage calculation
    expect(result1.actualDamage).toBe(result2.actualDamage)

    // Different targets
    expect(result1.stateChanges[0].creatureId).toBe(2)
    expect(result2.stateChanges[0].creatureId).toBe(3)

    // Different new health values (damage = 15 + 10 - 5 = 20)
    expect(result1.stateChanges[0].data.newHealth).toBe(80) // 100 - 20
    expect(result2.stateChanges[0].data.newHealth).toBe(60) // 80 - 20
  })

  test('applicators do not mutate context', () => {
    const target = createMockCreature({ ID: 1, health: 100 })
    const context = createMockContext([target], [])

    const originalHealth = context.state.playerCreatures[0].health

    applyHealingEffect(context, 1, 1, 50)

    // Context should not be mutated
    expect(context.state.playerCreatures[0].health).toBe(originalHealth)
  })
})
