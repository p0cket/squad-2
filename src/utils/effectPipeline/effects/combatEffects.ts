// Combat Effect Definitions - Serializable effects with decoupled applicators
import { Effect, BattleContext, EffectApplicationResult, HealthChange, StateChange, Animation } from '../types'
import { registerEffectApplicator } from '../effectApplicatorRegistry'
import { getCreatureFromContext } from '../effectResolver'
import { Attack } from '../../../consts/types/types'
import { battleEventLogger } from '../eventLogger'

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

  // Check for EVASION first - if dodge succeeds, no damage or effects
  const evasionStatus = target.statuses?.find(s => s.id === 'EVASION')
  if (evasionStatus) {
    const dodgeChance = evasionStatus.dodgeChance || 0.4
    const dodgeRoll = Math.random()
    if (dodgeRoll < dodgeChance) {
      console.log(`✨ ${target.name} EVADED the attack! (${Math.round(dodgeChance * 100)}% chance, rolled ${Math.round(dodgeRoll * 100)}%)`)
      
      const animations: Animation[] = [
        { type: 'attack-windup', targetId: attackerId, duration: 600 },
        { type: 'dodge', targetId: effect.targetId, duration: 300 }
      ]
      
      return {
        stateChanges: [],
        animations
      }
    }
  }

  // Calculate damage components
  const baseAttackDamage = attack.damage
  const attackerBonus = attacker.attack
  const totalDamage = baseAttackDamage + attackerBonus
  const defense = target.defense
  let actualDamage = Math.max(1, totalDamage - defense)

  // Apply VULNERABLE modifier (increases damage taken by 50%)
  const vulnerableStatus = target.statuses?.find(s => s.id === 'VULNERABLE')
  if (vulnerableStatus) {
    const damageMultiplier = vulnerableStatus.damageMultiplier || 1.5
    const originalDamage = actualDamage
    actualDamage = Math.floor(actualDamage * damageMultiplier)
    console.log(`🎯 ${target.name} is VULNERABLE! Damage increased: ${originalDamage} → ${actualDamage} (×${damageMultiplier})`)
  }

  let newHealth = Math.max(0, target.health - actualDamage)

  // LEECH: Attacker heals for percentage of damage dealt
  const leechStatus = attacker.statuses?.find(s => s.id === 'LEECH')
  let attackerHealAmount = 0
  if (leechStatus) {
    const healPercent = leechStatus.healPercent || 0.3
    attackerHealAmount = Math.floor(actualDamage * healPercent)
    console.log(`🩸 ${attacker.name} leeches ${attackerHealAmount} health (${Math.round(healPercent * 100)}% of ${actualDamage} damage)`)
  }

  // THORNS: Attacker takes damage when hitting target
  const thornsStatus = target.statuses?.find(s => s.id === 'THORNS')
  let thornsDamage = 0
  if (thornsStatus) {
    thornsDamage = thornsStatus.damageReflected || 10
    console.log(`🌵 ${attacker.name} takes ${thornsDamage} damage from THORNS!`)
  }

  // REFLECT: Attacker takes percentage of damage dealt
  const reflectStatus = target.statuses?.find(s => s.id === 'REFLECT')
  let reflectDamage = 0
  if (reflectStatus) {
    const reflectPercent = reflectStatus.reflectPercent || 0.5
    reflectDamage = Math.floor(actualDamage * reflectPercent)
    console.log(`🪞 ${attacker.name} takes ${reflectDamage} reflected damage (${Math.round(reflectPercent * 100)}% of ${actualDamage})`)
  }

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

  // Log to battle timeline
  battleEventLogger.logAttack({
    attackerName: attacker.name,
    targetName: target.name,
    attackName: attack.name,
    baseDamage: baseAttackDamage,
    attackerAtk: attackerBonus,
    targetDef: defense,
    totalDamage: actualDamage,
    targetOldHp: target.health,
    targetNewHp: newHealth
  })

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
      sourceCreatureId: attackerId, // Track attacker for counter-attack triggers
      damageBreakdown: damageBreakdown.map(b => `${b.label} ${b.value >= 0 ? '+' : ''}${b.value}`).join(' | ')
    }
  }

  const stateChanges: StateChange[] = [healthChange]

  // Apply THORNS damage to attacker
  if (thornsDamage > 0) {
    const attackerNewHealth = Math.max(0, attacker.health - thornsDamage)
    stateChanges.push({
      type: 'HEALTH_CHANGE',
      creatureId: attackerId,
      timestamp: Date.now(),
      data: {
        delta: -thornsDamage,
        newHealth: attackerNewHealth,
        source: 'thorns-反击',
        sourceCreatureId: effect.targetId
      }
    })
  }

  // Apply REFLECT damage to attacker
  if (reflectDamage > 0) {
    const attackerNewHealth = Math.max(0, attacker.health - reflectDamage)
    stateChanges.push({
      type: 'HEALTH_CHANGE',
      creatureId: attackerId,
      timestamp: Date.now(),
      data: {
        delta: -reflectDamage,
        newHealth: attackerNewHealth,
        source: 'reflect-反射',
        sourceCreatureId: effect.targetId
      }
    })
  }

  // Apply LEECH healing to attacker
  if (attackerHealAmount > 0) {
    const attackerNewHealth = Math.min(attacker.maxHealth, attacker.health + attackerHealAmount)
    stateChanges.push({
      type: 'HEALTH_CHANGE',
      creatureId: attackerId,
      timestamp: Date.now(),
      data: {
        delta: attackerHealAmount,
        newHealth: attackerNewHealth,
        source: 'leech-吸血',
        sourceCreatureId: attackerId
      }
    })
  }

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
      } else if (effectType === 'SLOW') {
        console.log(`🐌 Attack slows ${target.name}`)
        stateChanges.push({
          type: 'STATUS_APPLIED',
          creatureId: effect.targetId,
          timestamp: Date.now(),
          data: {
            statusId: 'SLOW',
            duration: 4,
            skipFrequency: 2  // Skip every 2nd turn
          }
        })
      } else if (effectType === 'SILENCE') {
        console.log(`🤐 Attack silences ${target.name}`)
        stateChanges.push({
          type: 'STATUS_APPLIED',
          creatureId: effect.targetId,
          timestamp: Date.now(),
          data: {
            statusId: 'SILENCE',
            duration: 2
          }
        })
      }

      // Batch 2 Effects
      else if (effectType === 'VULNERABLE') {
        console.log(`🎯 Attack makes ${target.name} vulnerable (50% increased damage taken)`)
        stateChanges.push({
          type: 'STATUS_APPLIED',
          creatureId: effect.targetId,
          timestamp: Date.now(),
          data: {
            statusId: 'VULNERABLE',
            duration: 3,
            damageMultiplier: 1.5
          }
        })
      } else if (effectType === 'THORNS') {
        console.log(`🌵 ${target.name} gains thorns (reflects 10 damage to attackers)`)
        stateChanges.push({
          type: 'STATUS_APPLIED',
          creatureId: effect.targetId,
          timestamp: Date.now(),
          data: {
            statusId: 'THORNS',
            duration: 3,
            damageReflected: 10
          }
        })
      } else if (effectType === 'LEECH') {
        console.log(`🩸 ${attacker.name} gains leech (heals for 30% of damage dealt)`)
        stateChanges.push({
          type: 'STATUS_APPLIED',
          creatureId: attackerId,
          timestamp: Date.now(),
          data: {
            statusId: 'LEECH',
            duration: 3,
            healPercent: 0.3
          }
        })
      } else if (effectType === 'EVASION') {
        console.log(`✨ ${target.name} gains evasion (40% dodge chance)`)
        stateChanges.push({
          type: 'STATUS_APPLIED',
          creatureId: effect.targetId,
          timestamp: Date.now(),
          data: {
            statusId: 'EVASION',
            duration: 3,
            dodgeChance: 0.4
          }
        })
      } else if (effectType === 'REFLECT') {
        console.log(`🪞 ${target.name} gains reflect (returns 50% of damage to attacker)`)
        stateChanges.push({
          type: 'STATUS_APPLIED',
          creatureId: effect.targetId,
          timestamp: Date.now(),
          data: {
            statusId: 'REFLECT',
            duration: 3,
            reflectPercent: 0.5
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
// EFFECT FACTORY FUNCTIONS
// ============================================================================
// NOTE: Factory functions have been moved to factories.ts
// Import from there instead: import { buildAttackEffect, ... } from '../factories'
// Backwards-compatible exports remain in factories.ts: createAttackEffect, etc.
