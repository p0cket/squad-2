// Comprehensive tests for Combat Effects (attack, healing, burn, poison, stun, etc.)
import { BattleContext, BattleState } from '../../types'
import { Creature, Attack } from '../../../../consts/types/types'
import { applyEffect } from '../../effectApplicatorRegistry'

// Import the effect creators
import {
  buildAttackEffect,
  buildTrueDamageEffect,
  buildHealEffect,
  buildDeathEffect,
  buildLifeDrainEffect
} from '../../factories'

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
    currentTurnOwner: null,
    battleStatus: null
  }

  return {
    contextId: 'test-context',
    state,
    stateHistory: [],
    subscribers: new Map()
  }
}

// Helper to create a basic attack
const createBasicAttack = (damage: number, effects: string[] = []): Attack => ({
  template: 'test-attack',
  name: 'Test Attack',
  attackType: 'physical',
  effects,
  chanceToLand: 100,
  damage,
  trueDamage: 0,
  icon: '⚔️',
  notes: '',
  cooldown: 0
})

describe('Combat Effects', () => {
  describe('buildAttackEffect', () => {
    test('creates attack effect with correct structure', () => {
      const attack = createBasicAttack(20)
      const effect = buildAttackEffect(1, 2, attack)

      expect(effect.type).toBe('ATTACK')
      expect(effect.targetId).toBe(2)
      expect(effect.data).toEqual({
        attackerId: 1,
        attack
      })
    })
  })

  describe('Attack Effect Application', () => {
    test('applies damage correctly with attack bonus and defense', async () => {
      const attacker = createMockCreature({ ID: 1, attack: 15 })
      const target = createMockCreature({ ID: 2, defense: 10, health: 100 })
      const context = createMockContext([attacker], [target])

      const attack = createBasicAttack(20) // Base damage: 20
      const effect = buildAttackEffect(1, 2, attack)

      const result = await applyEffect(effect, context)

      // Damage calculation: (20 + 15) - 10 = 25
      const healthChange = result.stateChanges.find(sc => sc.type === 'HEALTH_CHANGE')
      expect(healthChange).toBeDefined()
      expect(healthChange?.data.delta).toBe(-25)
      expect(healthChange?.data.newHealth).toBe(75)
    })

    test('minimum damage is always 1', async () => {
      const attacker = createMockCreature({ ID: 1, attack: 0 })
      const target = createMockCreature({ ID: 2, defense: 50, health: 100 })
      const context = createMockContext([attacker], [target])

      const attack = createBasicAttack(5) // (5 + 0) - 50 should be 1, not negative
      const effect = buildAttackEffect(1, 2, attack)

      const result = await applyEffect(effect, context)

      const healthChange = result.stateChanges.find(sc => sc.type === 'HEALTH_CHANGE')
      expect(healthChange?.data.delta).toBe(-1)
      expect(healthChange?.data.newHealth).toBe(99)
    })

    test('reduces target health to 0 if damage exceeds health', async () => {
      const attacker = createMockCreature({ ID: 1, attack: 50 })
      const target = createMockCreature({ ID: 2, defense: 0, health: 30 })
      const context = createMockContext([attacker], [target])

      const attack = createBasicAttack(100) // (100 + 50) = 150 damage
      const effect = buildAttackEffect(1, 2, attack)

      const result = await applyEffect(effect, context)

      const healthChange = result.stateChanges.find(sc => sc.type === 'HEALTH_CHANGE')
      expect(healthChange?.data.newHealth).toBe(0)
    })

    test('applies BURN status when attack has burn effect', async () => {
      const attacker = createMockCreature({ ID: 1 })
      const target = createMockCreature({ ID: 2 })
      const context = createMockContext([attacker], [target])

      const attack = createBasicAttack(15, ['BURN'])
      const effect = buildAttackEffect(1, 2, attack)

      const result = await applyEffect(effect, context)

      const burnStatus = result.stateChanges.find(
        sc => sc.type === 'STATUS_APPLIED' && sc.data.statusId === 'BURN'
      )
      expect(burnStatus).toBeDefined()
      expect(burnStatus?.data.duration).toBe(3)
      expect(burnStatus?.data.damagePerTurn).toBe(5)
    })

    test('applies POISON status when attack has poison effect', async () => {
      const attacker = createMockCreature({ ID: 1 })
      const target = createMockCreature({ ID: 2 })
      const context = createMockContext([attacker], [target])

      const attack = createBasicAttack(10, ['POISON'])
      const effect = buildAttackEffect(1, 2, attack)

      const result = await applyEffect(effect, context)

      const poisonStatus = result.stateChanges.find(
        sc => sc.type === 'STATUS_APPLIED' && sc.data.statusId === 'POISON'
      )
      expect(poisonStatus).toBeDefined()
      expect(poisonStatus?.data.duration).toBe(3)
      expect(poisonStatus?.data.damagePerTurn).toBe(10)
    })

    test('applies STUN status when attack has stun effect', async () => {
      const attacker = createMockCreature({ ID: 1 })
      const target = createMockCreature({ ID: 2 })
      const context = createMockContext([attacker], [target])

      const attack = createBasicAttack(10, ['STUN'])
      const effect = buildAttackEffect(1, 2, attack)

      const result = await applyEffect(effect, context)

      const stunStatus = result.stateChanges.find(
        sc => sc.type === 'STATUS_APPLIED' && sc.data.statusId === 'STUN'
      )
      expect(stunStatus).toBeDefined()
      expect(stunStatus?.data.duration).toBe(2)
    })

    test('applies multiple status effects from single attack', async () => {
      const attacker = createMockCreature({ ID: 1 })
      const target = createMockCreature({ ID: 2 })
      const context = createMockContext([attacker], [target])

      const attack = createBasicAttack(15, ['BURN', 'WEAKEN'])
      const effect = buildAttackEffect(1, 2, attack)

      const result = await applyEffect(effect, context)

      const burnStatus = result.stateChanges.find(
        sc => sc.type === 'STATUS_APPLIED' && sc.data.statusId === 'BURN'
      )
      const weakenStatus = result.stateChanges.find(
        sc => sc.type === 'STATUS_APPLIED' && sc.data.statusId === 'ATTACK_DEBUFF'
      )

      expect(burnStatus).toBeDefined()
      expect(weakenStatus).toBeDefined()
    })

    test('generates animations for attack', async () => {
      const attacker = createMockCreature({ ID: 1 })
      const target = createMockCreature({ ID: 2 })
      const context = createMockContext([attacker], [target])

      const attack = createBasicAttack(20)
      const effect = buildAttackEffect(1, 2, attack)

      const result = await applyEffect(effect, context)

      expect(result.animations.length).toBeGreaterThan(0)
      expect(result.animations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: 'attack-windup', targetId: 1 }),
          expect.objectContaining({ type: 'impact', targetId: 2 })
        ])
      )
    })
  })

  describe('True Damage Attack', () => {
    test('creates true damage effect correctly', () => {
      const effect = buildTrueDamageEffect(1, 2, 30)

      expect(effect.type).toBe('TRUE_DAMAGE')
      expect(effect.targetId).toBe(2)
      expect(effect.data).toEqual({
        attackerId: 1,
        damage: 30
      })
    })

    test('applies true damage ignoring defense', async () => {
      const attacker = createMockCreature({ ID: 1, attack: 0 })
      const target = createMockCreature({ ID: 2, defense: 50, health: 100 })
      const context = createMockContext([attacker], [target])

      const effect = buildTrueDamageEffect(1, 2, 30)
      const result = await applyEffect(effect, context)

      const healthChange = result.stateChanges.find(sc => sc.type === 'HEALTH_CHANGE')
      expect(healthChange?.data.delta).toBe(-30) // Exact damage, no defense calculation
      expect(healthChange?.data.newHealth).toBe(70)
    })
  })

  describe('Healing Effect', () => {
    test('creates healing effect correctly', () => {
      const effect = buildHealEffect(1, 2, 25)

      expect(effect.type).toBe('HEALING')
      expect(effect.targetId).toBe(2)
      expect(effect.data).toEqual({
        casterId: 1,
        healingAmount: 25
      })
    })

    test('applies healing correctly', async () => {
      const caster = createMockCreature({ ID: 1 })
      const target = createMockCreature({ ID: 2, health: 50, maxHealth: 100 })
      const context = createMockContext([caster], [target])

      const effect = buildHealEffect(1, 2, 30)
      const result = await applyEffect(effect, context)

      const healthChange = result.stateChanges.find(sc => sc.type === 'HEALTH_CHANGE')
      expect(healthChange?.data.delta).toBe(30)
      expect(healthChange?.data.newHealth).toBe(80)
    })

    test('caps healing at max health', async () => {
      const caster = createMockCreature({ ID: 1 })
      const target = createMockCreature({ ID: 2, health: 90, maxHealth: 100 })
      const context = createMockContext([caster], [target])

      const effect = buildHealEffect(1, 2, 50) // Would overheal
      const result = await applyEffect(effect, context)

      const healthChange = result.stateChanges.find(sc => sc.type === 'HEALTH_CHANGE')
      expect(healthChange?.data.delta).toBe(10) // Only heals to max
      expect(healthChange?.data.newHealth).toBe(100)
    })

    test('no healing when already at max health', async () => {
      const caster = createMockCreature({ ID: 1 })
      const target = createMockCreature({ ID: 2, health: 100, maxHealth: 100 })
      const context = createMockContext([caster], [target])

      const effect = buildHealEffect(1, 2, 25)
      const result = await applyEffect(effect, context)

      const healthChange = result.stateChanges.find(sc => sc.type === 'HEALTH_CHANGE')
      expect(healthChange?.data.delta).toBe(0)
      expect(healthChange?.data.newHealth).toBe(100)
    })
  })

  describe('Life Drain Effect', () => {
    test('creates life drain effect correctly', () => {
      const effect = buildLifeDrainEffect(1, 2, 20)

      expect(effect.type).toBe('LIFE_DRAIN')
      expect(effect.targetId).toBe(2)
      expect(effect.data).toEqual({
        attackerId: 1,
        drainAmount: 20
      })
    })

    test('damages target and heals attacker', async () => {
      const attacker = createMockCreature({ ID: 1, health: 50, maxHealth: 100 })
      const target = createMockCreature({ ID: 2, health: 80, maxHealth: 100 })
      const context = createMockContext([attacker], [target])

      const effect = buildLifeDrainEffect(1, 2, 20)
      const result = await applyEffect(effect, context)

      const targetDamage = result.stateChanges.find(
        sc => sc.type === 'HEALTH_CHANGE' && sc.creatureId === 2
      )
      const attackerHeal = result.stateChanges.find(
        sc => sc.type === 'HEALTH_CHANGE' && sc.creatureId === 1
      )

      expect(targetDamage?.data.delta).toBe(-20)
      expect(targetDamage?.data.newHealth).toBe(60)
      expect(attackerHeal?.data.delta).toBe(20)
      expect(attackerHeal?.data.newHealth).toBe(70)
    })

    test('caps life drain heal at max health', async () => {
      const attacker = createMockCreature({ ID: 1, health: 95, maxHealth: 100 })
      const target = createMockCreature({ ID: 2, health: 80 })
      const context = createMockContext([attacker], [target])

      const effect = buildLifeDrainEffect(1, 2, 20)
      const result = await applyEffect(effect, context)

      const attackerHeal = result.stateChanges.find(
        sc => sc.type === 'HEALTH_CHANGE' && sc.creatureId === 1
      )

      expect(attackerHeal?.data.delta).toBe(5) // Only heals to max
      expect(attackerHeal?.data.newHealth).toBe(100)
    })
  })

  describe('Death Effect', () => {
    test('creates death effect correctly', () => {
      const effect = buildDeathEffect(1)

      expect(effect.type).toBe('DEATH')
      expect(effect.targetId).toBe(1)
    })

    test('triggers creature death state change', async () => {
      const creature = createMockCreature({ ID: 1, health: 0 })
      const context = createMockContext([creature], [])

      const effect = buildDeathEffect(1)
      const result = await applyEffect(effect, context)

      const deathChange = result.stateChanges.find(sc => sc.type === 'CREATURE_DIED')
      expect(deathChange).toBeDefined()
      expect(deathChange?.creatureId).toBe(1)
    })
  })
})
