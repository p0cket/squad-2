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

  // Build damage breakdown for display
  const damageBreakdown: Array<{ label: string; value: number }> = []
  if (baseAttackDamage > 0) {
    damageBreakdown.push({ label: `${attack.name}`, value: baseAttackDamage })
  }
  if (attackerBonus > 0) {
    damageBreakdown.push({ label: `+${attacker.name} ATK`, value: attackerBonus })
  }
  if (defense > 0) {
    damageBreakdown.push({ label: `-${target.name} DEF`, value: -defense })
  }
  damageBreakdown.push({ label: 'Total', value: actualDamage })

  // Enhanced console log with breakdown
  console.log(`⚔️ Attack: ${attacker.name} attacks ${target.name}`)
  console.log(`  📊 Breakdown: ${damageBreakdown.map(b => `${b.label} ${b.value >= 0 ? '+' : ''}${b.value}`).join(' | ')}`)
  console.log(`  💔 Result: ${target.health} → ${newHealth} (-${actualDamage} damage)`)

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
      source: `attack-${attack.name}`,
      sourceCreatureId: attackerId // Track attacker for counter-attack triggers
    }
  }

  const stateChanges: StateChange[] = [healthChange]

  // Process attack effects (burn, poison, stun, cleanse, etc.)
  if (attack.effects && Array.isArray(attack.effects)) {
    for (const effectName of attack.effects) {
      const effectType = effectName.toUpperCase()

      // Damage Over Time Effects
      if (effectType === 'BURN') {
        console.log(`🔥 Attack applies burn effect to ${target.name}`)
        stateChanges.push({
          type: 'STATUS_APPLIED',
          creatureId: effect.targetId,
          timestamp: Date.now(),
          data: {
            statusId: 'BURN',
            duration: 3,
            damagePerTurn: 5
          }
        })
      } else if (effectType === 'POISON') {
        console.log(`🧪 Attack applies poison effect to ${target.name}`)
        stateChanges.push({
          type: 'STATUS_APPLIED',
          creatureId: effect.targetId,
          timestamp: Date.now(),
          data: {
            statusId: 'POISON',
            duration: 3,
            damagePerTurn: 10
          }
        })
      } else if (effectType === 'BLEED') {
        console.log(`🩸 Attack applies bleed effect to ${target.name}`)
        stateChanges.push({
          type: 'STATUS_APPLIED',
          creatureId: effect.targetId,
          timestamp: Date.now(),
          data: {
            statusId: 'BLEED',
            duration: 3,
            damagePerTurn: 7
          }
        })
      }

      // Crowd Control Effects
      else if (effectType === 'STUN') {
        console.log(`💫 Attack stuns ${target.name}`)
        stateChanges.push({
          type: 'STATUS_APPLIED',
          creatureId: effect.targetId,
          timestamp: Date.now(),
          data: {
            statusId: 'STUN',
            duration: 2
          }
        })
      } else if (effectType === 'FREEZE') {
        console.log(`❄️ Attack freezes ${target.name}`)
        stateChanges.push({
          type: 'STATUS_APPLIED',
          creatureId: effect.targetId,
          timestamp: Date.now(),
          data: {
            statusId: 'FREEZE',
            duration: 2
          }
        })
      }

      // Debuff Effects
      else if (effectType === 'WEAKEN') {
        console.log(`⚔️↓ Attack weakens ${target.name}`)
        stateChanges.push({
          type: 'STATUS_APPLIED',
          creatureId: effect.targetId,
          timestamp: Date.now(),
          data: {
            statusId: 'ATTACK_DEBUFF',
            duration: 3,
            amount: -5
          }
        })
      } else if (effectType === 'VULNERABILITY') {
        console.log(`🛡️↓ Attack makes ${target.name} vulnerable`)
        stateChanges.push({
          type: 'STATUS_APPLIED',
          creatureId: effect.targetId,
          timestamp: Date.now(),
          data: {
            statusId: 'DEFENSE_DEBUFF',
            duration: 3,
            amount: -5
          }
        })
      }

      // Self-Buff Effects (applied to attacker)
      else if (effectType === 'STRENGTHEN') {
        console.log(`💪 ${attacker.name} gains strength`)
        stateChanges.push({
          type: 'STATUS_APPLIED',
          creatureId: attackerId,
          timestamp: Date.now(),
          data: {
            statusId: 'ATTACK_BUFF',
            duration: 3,
            amount: 5
          }
        })
      } else if (effectType === 'FORTIFY') {
        console.log(`🛡️ ${attacker.name} fortifies defenses`)
        stateChanges.push({
          type: 'STATUS_APPLIED',
          creatureId: attackerId,
          timestamp: Date.now(),
          data: {
            statusId: 'DEFENSE_BUFF',
            duration: 3,
            amount: 5
          }
        })
      }

      // Cleansing Effects
      else if (effectType === 'CLEANSE') {
        console.log(`✨ Cleansing debuffs from ${target.name}`)
        // Remove all debuffs from target
        const targetStatuses = target.statuses.filter(s => s.type === 'debuff')
        for (const status of targetStatuses) {
          stateChanges.push({
            type: 'STATUS_REMOVED',
            creatureId: effect.targetId,
            timestamp: Date.now(),
            data: {
              statusId: status.id,
              reason: 'cleansed'
            }
          })
        }
      } else if (effectType === 'DISPEL') {
        console.log(`🌟 Dispelling buffs from ${target.name}`)
        // Remove all buffs from target
        const targetStatuses = target.statuses.filter(s => s.type === 'buff')
        for (const status of targetStatuses) {
          stateChanges.push({
            type: 'STATUS_REMOVED',
            creatureId: effect.targetId,
            timestamp: Date.now(),
            data: {
              statusId: status.id,
              reason: 'dispelled'
            }
          })
        }
      } else if (effectType === 'PURGE') {
        console.log(`💥 Purging all effects from ${target.name}`)
        // Remove ALL status effects from target
        for (const status of target.statuses) {
          stateChanges.push({
            type: 'STATUS_REMOVED',
            creatureId: effect.targetId,
            timestamp: Date.now(),
            data: {
              statusId: status.id,
              reason: 'purged'
            }
          })
        }
      }
    }
  }

  return {
    stateChanges,
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
      source: 'true-damage',
      sourceCreatureId: attackerId // Track attacker for counter-attack triggers
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
      source: 'life-drain',
      sourceCreatureId: attackerId // Track attacker for counter-attack triggers
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
          source: 'aoe-attack',
          sourceCreatureId: attackerId // Track attacker for counter-attack triggers
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
  timestamp: Date.now(),
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
  timestamp: Date.now(),
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
  timestamp: Date.now(),
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
  timestamp: Date.now(),
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
  timestamp: Date.now(),
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
  timestamp: Date.now(),
  data: {
    attackerId,
    targetIds,
    damage
  }
})
