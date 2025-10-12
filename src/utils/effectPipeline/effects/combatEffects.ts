// Combat Effect Definitions - Serializable effects with decoupled applicators
import { Effect, BattleContext, EffectApplicationResult, HealthChange, StateChange, Animation } from '../types'
import { registerEffectApplicator } from '../effectApplicatorRegistry'
import { getCreatureFromContext } from '../effectResolver'
import { Attack } from '../../../consts/types/types'

// ============================================================================
// EFFECT DATA TYPES (Serializable)
// ============================================================================

export type AttackEffectData = {
  attackerId: number
  attack: Attack
}

export type TrueDamageEffectData = {
  attackerId: number
  damage: number
}

export type HealingEffectData = {
  casterId: number
  healingAmount: number
}

export type DeathEffectData = {
  // No additional data needed
}

export type LifeDrainEffectData = {
  attackerId: number
  drainAmount: number
}

export type AoeAttackEffectData = {
  attackerId: number
  targetIds: number[]
  damage: number
}

// ============================================================================
// EFFECT APPLICATORS (Pure functions)
// ============================================================================

/**
 * Apply a basic attack effect
 */
const applyAttackEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const { attackerId, attack } = effect.data as AttackEffectData
  const attacker = getCreatureFromContext(context, attackerId)
  const target = getCreatureFromContext(context, effect.targetId)

  // Calculate damage components
  const baseAttackDamage = attack.damage
  const attackerBonus = attacker.attack
  const totalDamage = baseAttackDamage + attackerBonus
  const defense = target.defense
  const actualDamage = Math.max(1, totalDamage - defense)
  const newHealth = Math.max(0, target.health - actualDamage)

  console.log(`⚔️ Attack: ${attacker.name} attacks ${target.name} for ${actualDamage} damage (${target.health} → ${newHealth})`)

  // Build damage breakdown for display
  const damageBreakdown: Array<{ label: string; value: number }> = []
  if (baseAttackDamage > 0) {
    damageBreakdown.push({ label: `${attack.name}`, value: baseAttackDamage })
  }
  if (attackerBonus > 0) {
    damageBreakdown.push({ label: 'Attack Bonus', value: attackerBonus })
  }
  if (defense > 0) {
    damageBreakdown.push({ label: 'Defense', value: -defense })
  }
  damageBreakdown.push({ label: 'Total Damage', value: actualDamage })

  // Create animations
  const animations: Animation[] = [
    { type: 'attack-windup', targetId: attackerId, duration: 600 },
    { type: 'impact', targetId: effect.targetId, duration: 300 },
    ...damageBreakdown.map((breakdown, index) => ({
      type: 'damage-number',
      targetId: effect.targetId,
      duration: 1500,
      data: {
        value: breakdown.value,
        label: breakdown.label,
        isTotal: breakdown.label === 'Total Damage',
        delay: index * 200
      }
    }))
  ]

  const healthChange: HealthChange = {
    type: 'HEALTH_CHANGE',
    creatureId: effect.targetId,
    timestamp: Date.now(),
    data: {
      delta: -actualDamage,
      newHealth,
      source: `attack-${attack.name}`
    }
  }

  return {
    stateChanges: [healthChange],
    animations
  }
}

/**
 * Apply a true damage effect (ignores defense)
 */
const applyTrueDamageEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const { attackerId, damage } = effect.data as TrueDamageEffectData
  const attacker = getCreatureFromContext(context, attackerId)
  const target = getCreatureFromContext(context, effect.targetId)

  const newHealth = Math.max(0, target.health - damage)

  console.log(`💥 True Damage: ${attacker.name} deals ${damage} true damage to ${target.name} (${target.health} → ${newHealth})`)

  const healthChange: HealthChange = {
    type: 'HEALTH_CHANGE',
    creatureId: effect.targetId,
    timestamp: Date.now(),
    data: {
      delta: -damage,
      newHealth,
      source: 'true-damage'
    }
  }

  const animations: Animation[] = [
    { type: 'attack-windup', targetId: attackerId, duration: 800 },
    { type: 'impact', targetId: effect.targetId, duration: 400 },
    { type: 'damage-number', targetId: effect.targetId, duration: 1200, data: { value: -damage } }
  ]

  return {
    stateChanges: [healthChange],
    animations
  }
}

/**
 * Apply a healing effect
 */
const applyHealingEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const { casterId, healingAmount } = effect.data as HealingEffectData
  const caster = getCreatureFromContext(context, casterId)
  const target = getCreatureFromContext(context, effect.targetId)

  const actualHealing = Math.min(healingAmount, target.maxHealth - target.health)
  const newHealth = target.health + actualHealing

  console.log(`💚 Healing: ${caster.name} heals ${target.name} for ${actualHealing} HP (${target.health} → ${newHealth})`)

  const healthChange: HealthChange = {
    type: 'HEALTH_CHANGE',
    creatureId: effect.targetId,
    timestamp: Date.now(),
    data: {
      delta: actualHealing,
      newHealth,
      source: 'healing'
    }
  }

  const animations: Animation[] = [
    { type: 'healing', targetId: effect.targetId, duration: 1000 },
    { type: 'damage-number', targetId: effect.targetId, duration: 1200, data: { value: healingAmount } }
  ]

  return {
    stateChanges: [healthChange],
    animations
  }
}

/**
 * Apply a death effect
 */
const applyDeathEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const creature = getCreatureFromContext(context, effect.targetId)

  console.log(`💀 Death: ${creature.name} has died`)

  const deathChange: StateChange = {
    type: 'CREATURE_DIED',
    creatureId: effect.targetId,
    timestamp: Date.now(),
    data: {
      reason: 'health-depleted'
    }
  }

  const movementChange: StateChange = {
    type: 'CREATURE_MOVED',
    creatureId: effect.targetId,
    timestamp: Date.now(),
    data: {
      fromPosition: 0,
      toPosition: 'back',
      reason: 'death'
    }
  }

  const animations: Animation[] = [
    { type: 'death-animation', targetId: effect.targetId, duration: 2000 }
  ]

  return {
    stateChanges: [deathChange, movementChange],
    animations
  }
}

/**
 * Apply a life drain effect
 */
const applyLifeDrainEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const { attackerId, drainAmount } = effect.data as LifeDrainEffectData
  const attacker = getCreatureFromContext(context, attackerId)
  const target = getCreatureFromContext(context, effect.targetId)

  const actualDrain = Math.min(drainAmount, target.health)
  const actualHealing = Math.min(actualDrain, attacker.maxHealth - attacker.health)

  const targetNewHealth = target.health - actualDrain
  const attackerNewHealth = attacker.health + actualHealing

  console.log(`🩸 Life Drain: ${attacker.name} drains ${actualDrain} HP from ${target.name} and heals for ${actualHealing}`)

  const targetHealthChange: HealthChange = {
    type: 'HEALTH_CHANGE',
    creatureId: effect.targetId,
    timestamp: Date.now(),
    data: {
      delta: -actualDrain,
      newHealth: targetNewHealth,
      source: 'life-drain'
    }
  }

  const attackerHealthChange: HealthChange = {
    type: 'HEALTH_CHANGE',
    creatureId: attackerId,
    timestamp: Date.now(),
    data: {
      delta: actualHealing,
      newHealth: attackerNewHealth,
      source: 'life-drain-heal'
    }
  }

  const animations: Animation[] = [
    { type: 'attack-windup', targetId: attackerId, duration: 600 },
    { type: 'impact', targetId: effect.targetId, duration: 300 },
    { type: 'damage-number', targetId: effect.targetId, duration: 1200, data: { value: -drainAmount } },
    { type: 'healing', targetId: attackerId, duration: 800 }
  ]

  return {
    stateChanges: [targetHealthChange, attackerHealthChange],
    animations
  }
}

/**
 * Apply an AoE attack effect
 */
const applyAoeAttackEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const { attackerId, targetIds, damage } = effect.data as AoeAttackEffectData
  const attacker = getCreatureFromContext(context, attackerId)
  const changes: StateChange[] = []

  console.log(`💥 AoE Attack: ${attacker.name} attacks ${targetIds.length} targets for ${damage} damage each`)

  targetIds.forEach(targetId => {
    try {
      const target = getCreatureFromContext(context, targetId)
      const actualDamage = Math.min(damage, target.health)
      const newHealth = target.health - actualDamage

      const healthChange: HealthChange = {
        type: 'HEALTH_CHANGE',
        creatureId: targetId,
        timestamp: Date.now(),
        data: {
          delta: -actualDamage,
          newHealth,
          source: 'aoe-attack'
        }
      }

      changes.push(healthChange)
    } catch (error) {
      console.warn(`⚠️ Could not find target ${targetId} for AoE attack`)
    }
  })

  const animations: Animation[] = [
    { type: 'attack-windup', targetId: attackerId, duration: 800 },
    ...targetIds.map(id => ({ type: 'impact', targetId: id, duration: 300 })),
    ...targetIds.map(id => ({ type: 'damage-number', targetId: id, duration: 1200, data: { value: -damage } }))
  ]

  return {
    stateChanges: changes,
    animations
  }
}

// ============================================================================
// REGISTER APPLICATORS
// ============================================================================

registerEffectApplicator('ATTACK', applyAttackEffect)
registerEffectApplicator('TRUE_DAMAGE', applyTrueDamageEffect)
registerEffectApplicator('HEALING', applyHealingEffect)
registerEffectApplicator('DEATH', applyDeathEffect)
registerEffectApplicator('LIFE_DRAIN', applyLifeDrainEffect)
registerEffectApplicator('AOE_ATTACK', applyAoeAttackEffect)

// ============================================================================
// EFFECT FACTORY FUNCTIONS (Create serializable effects)
// ============================================================================

export const createAttackEffect = (
  attackerId: number,
  targetId: number,
  attack: Attack
): Effect => ({
  id: 'attack',
  type: 'ATTACK',
  targetId,
  priority: 50,
  data: {
    attackerId,
    attack
  }
})

export const createTrueDamageAttackEffect = (
  attackerId: number,
  targetId: number,
  damage: number
): Effect => ({
  id: 'true-damage-attack',
  type: 'TRUE_DAMAGE',
  targetId,
  priority: 55,
  data: {
    attackerId,
    damage
  }
})

export const createHealingEffect = (
  casterId: number,
  targetId: number,
  healingAmount: number
): Effect => ({
  id: 'healing',
  type: 'HEALING',
  targetId,
  priority: 30,
  data: {
    casterId,
    healingAmount
  }
})

export const createDeathEffect = (creatureId: number): Effect => ({
  id: 'death',
  type: 'DEATH',
  targetId: creatureId,
  priority: 100,
  data: {}
})

export const createLifeDrainEffect = (
  attackerId: number,
  targetId: number,
  drainAmount: number
): Effect => ({
  id: 'life-drain',
  type: 'LIFE_DRAIN',
  targetId,
  priority: 40,
  data: {
    attackerId,
    drainAmount
  }
})

export const createAoeAttackEffect = (
  attackerId: number,
  targetIds: number[],
  damage: number
): Effect => ({
  id: 'aoe-attack',
  type: 'AOE_ATTACK',
  targetId: targetIds[0],
  priority: 45,
  data: {
    attackerId,
    targetIds,
    damage
  }
})
