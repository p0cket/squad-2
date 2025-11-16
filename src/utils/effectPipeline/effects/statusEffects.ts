// Status Effect Definitions - Serializable effects with decoupled applicators
// 📋 See STATUS_EFFECT_CHECKLIST.md for implementation guidelines and verification steps
import { Effect, BattleContext, EffectApplicationResult, HealthChange, StateChange, Animation } from '../types'
import { registerEffectApplicator } from '../effectApplicatorRegistry'
import { getCreatureFromContext } from '../effectResolver'
import './utilityEffects' // Import to register NO_OP and other utility effects

// ============================================================================
// EFFECT DATA TYPES (Serializable)
// ============================================================================

export type BurnEffectData = {
  damage: number
}

export type PoisonEffectData = {
  damage: number
}

export type RegenerationEffectData = {
  healing: number
}

export type AttackBuffEffectData = {
  attackBonus: number
}

export type DefenseBuffEffectData = {
  defenseBonus: number
}

export type StunEffectData = {
  duration: number
}

export type ShieldEffectData = {
  shieldAmount: number
}

export type BleedEffectData = {
  damage: number
}

// ============================================================================
// EFFECT APPLICATORS (Pure functions)
// ============================================================================

/**
 * Apply a burn effect that deals damage over time
 * 
 * TODO: Differentiate burn from poison in the future
 * Current: Same as poison (status on initial, damage on tick)
 * Future ideas: Burn could spread to nearby enemies, stack intensity, etc.
 */
const applyBurnEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const { damage } = effect.data as BurnEffectData
  const creature = getCreatureFromContext(context, effect.targetId)

  // Check if the creature already has burn status
  const hasBurnStatus = creature.statuses.some(s => s.id === 'BURN')
  
  if (hasBurnStatus) {
    // This is a tick - deal damage only
    const actualDamage = Math.min(damage, creature.health)
    const newHealth = creature.health - actualDamage

    console.log(`🔥 Burn tick: ${creature.name} takes ${actualDamage} burn damage (${creature.health} → ${newHealth})`)

    const healthChange: HealthChange = {
      type: 'HEALTH_CHANGE',
      creatureId: effect.targetId,
      timestamp: Date.now(),
      data: {
        delta: -actualDamage,
        newHealth,
        source: 'burn'
      }
    }

    const animations: Animation[] = [
      { type: 'burn', targetId: effect.targetId, duration: 500 },
      { type: 'damage-number', targetId: effect.targetId, duration: 1000, data: { value: -damage } }
    ]

    return {
      stateChanges: [healthChange],
      animations
    }
  } else {
    // First application - only apply status, no damage
    console.log(`🔥 Applying burn status to ${creature.name} (${damage} dmg/turn for 3 turns)`)

    const statusChange: StateChange = {
      type: 'STATUS_APPLIED',
      creatureId: effect.targetId,
      timestamp: Date.now(),
      data: {
        statusId: 'BURN',
        duration: 3,
        damagePerTurn: damage,  // Store damage value in status data
        source: 'burn'
      }
    }

    const animations: Animation[] = [
      { type: 'status-icon', targetId: effect.targetId, duration: 800, data: { status: 'BURN' } }
    ]

    return {
      stateChanges: [statusChange],
      animations
    }
  }
}

/**
 * Apply a poison effect that deals damage over time
 */
const applyPoisonEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const { damage } = effect.data as PoisonEffectData
  const creature = getCreatureFromContext(context, effect.targetId)

  console.log(`🧪🔍 applyPoisonEffect called - damage value: ${damage}, effect.data:`, effect.data)

  // Check if the creature already has poison status
  const hasPoisonStatus = creature.statuses.some(s => s.id === 'POISON')
  
  if (hasPoisonStatus) {
    // This is a tick - deal damage only
    const actualDamage = Math.min(damage, creature.health)
    const newHealth = creature.health - actualDamage

    console.log(`🧪 Poison tick: ${creature.name} takes ${actualDamage} poison damage (${creature.health} → ${newHealth})`)

    const healthChange: HealthChange = {
      type: 'HEALTH_CHANGE',
      creatureId: effect.targetId,
      timestamp: Date.now(),
      data: {
        delta: -actualDamage,
        newHealth,
        source: 'poison'
      }
    }

    const animations: Animation[] = [
      { type: 'shake', targetId: effect.targetId, duration: 300 },
      { type: 'damage-number', targetId: effect.targetId, duration: 1000, data: { value: -damage } }
    ]

    return {
      stateChanges: [healthChange],
      animations
    }
  } else {
    // First application - only apply status, no damage
    console.log(`🧪 Applying poison status to ${creature.name} (${damage} dmg/turn for 3 turns)`)
    console.log(`🧪💾 Storing damagePerTurn: ${damage}`)

    const statusChange: StateChange = {
      type: 'STATUS_APPLIED',
      creatureId: effect.targetId,
      timestamp: Date.now(),
      data: {
        statusId: 'POISON',
        duration: 3,
        damagePerTurn: damage,  // Store damage value in status data
        source: 'poison'
      }
    }

    console.log(`🧪📦 STATUS_APPLIED change data:`, statusChange.data)

    const animations: Animation[] = [
      { type: 'status-icon', targetId: effect.targetId, duration: 800, data: { status: 'POISON' } }
    ]

    return {
      stateChanges: [statusChange],
      animations
    }
  }
}

/**
 * Apply a regeneration effect that heals over time
 * Follows two-phase pattern: initial application stores status, ticks apply healing
 */
const applyRegenerationEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const { healing } = effect.data as RegenerationEffectData
  const creature = getCreatureFromContext(context, effect.targetId)

  // Check if the creature already has regeneration status
  const hasRegenStatus = creature.statuses.some(s => s.id === 'REGENERATION')
  
  if (hasRegenStatus) {
    // This is a tick - heal only
    const actualHealing = Math.min(healing, creature.maxHealth - creature.health)
    const newHealth = creature.health + actualHealing

    console.log(`💚 Regeneration tick: ${creature.name} heals ${actualHealing} HP (${creature.health} → ${newHealth})`)

    const healthChange: HealthChange = {
      type: 'HEALTH_CHANGE',
      creatureId: effect.targetId,
      timestamp: Date.now(),
      data: {
        delta: actualHealing,
        newHealth,
        source: 'regeneration'
      }
    }

    const animations: Animation[] = [
      { type: 'healing', targetId: effect.targetId, duration: 800 },
      { type: 'damage-number', targetId: effect.targetId, duration: 1000, data: { value: healing } }
    ]

    return {
      stateChanges: [healthChange],
      animations
    }
  } else {
    // First application - only apply status, no healing
    console.log(`💚 Applying regeneration status to ${creature.name} (${healing} HP/turn for 3 turns)`)

    const statusChange: StateChange = {
      type: 'STATUS_APPLIED',
      creatureId: effect.targetId,
      timestamp: Date.now(),
      data: {
        statusId: 'REGENERATION',
        duration: 3,
        healPerTurn: healing,  // Store healing value in status data
        source: 'regeneration'
      }
    }

    const animations: Animation[] = [
      { type: 'status-icon', targetId: effect.targetId, duration: 800, data: { status: 'REGENERATION' } }
    ]

    return {
      stateChanges: [statusChange],
      animations
    }
  }
}

/**
 * Apply an attack buff effect
 */
const applyAttackBuffEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const { attackBonus } = effect.data as AttackBuffEffectData
  const creature = getCreatureFromContext(context, effect.targetId)

  console.log(`⚔️ Attack buff: ${creature.name} gains +${attackBonus} attack power`)

  const statChange: StateChange = {
    type: 'STAT_MODIFIED',
    creatureId: effect.targetId,
    timestamp: Date.now(),
    data: {
      statName: 'attack',
      value: attackBonus,
      source: 'attack-buff'
    }
  }

  const statusChange: StateChange = {
    type: 'STATUS_APPLIED',
    creatureId: effect.targetId,
    timestamp: Date.now(),
    data: {
      statusId: 'BUFF',
      duration: 3,
      source: 'attack-buff'
    }
  }

  const animations: Animation[] = [
    { type: 'status-apply', targetId: effect.targetId, duration: 600, data: { statusType: 'buff' } }
  ]

  return {
    stateChanges: [statChange, statusChange],
    animations
  }
}

/**
 * Apply a defense buff effect
 */
const applyDefenseBuffEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const { defenseBonus } = effect.data as DefenseBuffEffectData
  const creature = getCreatureFromContext(context, effect.targetId)

  console.log(`🛡️ Defense buff: ${creature.name} gains +${defenseBonus} defense`)

  const statChange: StateChange = {
    type: 'STAT_MODIFIED',
    creatureId: effect.targetId,
    timestamp: Date.now(),
    data: {
      statName: 'defense',
      value: defenseBonus,
      source: 'defense-buff'
    }
  }

  const statusChange: StateChange = {
    type: 'STATUS_APPLIED',
    creatureId: effect.targetId,
    timestamp: Date.now(),
    data: {
      statusId: 'DEFENSE_BUFF',
      duration: 3,
      source: 'defense-buff'
    }
  }

  const animations: Animation[] = [
    { type: 'status-apply', targetId: effect.targetId, duration: 600, data: { statusType: 'buff' } }
  ]

  return {
    stateChanges: [statChange, statusChange],
    animations
  }
}

/**
 * Apply a stun effect
 */
const applyStunEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const { duration } = effect.data as StunEffectData
  const creature = getCreatureFromContext(context, effect.targetId)

  console.log(`⚡ Stun effect: ${creature.name} is stunned for ${duration} turns`)

  const statusChange: StateChange = {
    type: 'STATUS_APPLIED',
    creatureId: effect.targetId,
    timestamp: Date.now(),
    data: {
      statusId: 'STUN',
      duration,
      source: 'stun'
    }
  }

  const animations: Animation[] = [
    { type: 'status-apply', targetId: effect.targetId, duration: 800, data: { statusType: 'debuff' } }
  ]

  return {
    stateChanges: [statusChange],
    animations
  }
}

/**
 * Apply a shield effect that absorbs incoming damage
 * Shield is unique: it doesn't tick damage/healing, but stores shieldAmount that reduces incoming damage
 * Duration still decrements each turn
 */
const applyShieldEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const { shieldAmount } = effect.data as ShieldEffectData
  const creature = getCreatureFromContext(context, effect.targetId)

  // Check if the creature already has shield status
  const hasShieldStatus = creature.statuses.some(s => s.id === 'SHIELD')
  
  if (hasShieldStatus) {
    // Shield already exists - this could be a refresh or stack
    // For now, we'll just refresh the duration and add to shield amount
    console.log(`🛡️ Shield refresh: ${creature.name} gains ${shieldAmount} more shield`)

    const existingShield = creature.statuses.find(s => s.id === 'SHIELD')
    const currentShield = existingShield?.shieldAmount ?? 0
    const newShieldAmount = currentShield + shieldAmount

    const statusChange: StateChange = {
      type: 'STATUS_APPLIED',
      creatureId: effect.targetId,
      timestamp: Date.now(),
      data: {
        statusId: 'SHIELD',
        duration: 3,
        shieldAmount: newShieldAmount,
        source: 'shield'
      }
    }

    const animations: Animation[] = [
      { type: 'status-icon', targetId: effect.targetId, duration: 800, data: { status: 'SHIELD' } }
    ]

    return {
      stateChanges: [statusChange],
      animations
    }
  } else {
    // First application - apply shield status with shieldAmount
    console.log(`🛡️ Applying shield to ${creature.name} (${shieldAmount} shield for 3 turns)`)

    const statusChange: StateChange = {
      type: 'STATUS_APPLIED',
      creatureId: effect.targetId,
      timestamp: Date.now(),
      data: {
        statusId: 'SHIELD',
        duration: 3,
        shieldAmount: shieldAmount,  // Store shield amount in status data
        source: 'shield'
      }
    }

    const animations: Animation[] = [
      { type: 'status-icon', targetId: effect.targetId, duration: 800, data: { status: 'SHIELD' } }
    ]

    return {
      stateChanges: [statusChange],
      animations
    }
  }
}

/**
 * Apply a bleed effect that deals damage over time
 * Bleed represents damage from open wounds that cause continuous bleeding
 */
const applyBleedEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const { damage } = effect.data as BleedEffectData
  const creature = getCreatureFromContext(context, effect.targetId)

  // Check if the creature already has bleed status
  const hasBleedStatus = creature.statuses.some(s => s.id === 'BLEED')

  if (hasBleedStatus) {
    // This is a tick - deal damage only
    const actualDamage = Math.min(damage, creature.health)
    const newHealth = creature.health - actualDamage

    console.log(`🩸 Bleed tick: ${creature.name} takes ${actualDamage} bleed damage (${creature.health} → ${newHealth})`)

    const healthChange: HealthChange = {
      type: 'HEALTH_CHANGE',
      creatureId: effect.targetId,
      timestamp: Date.now(),
      data: {
        delta: -actualDamage,
        newHealth,
        source: 'bleed'
      }
    }

    const animations: Animation[] = [
      { type: 'bleed', targetId: effect.targetId, duration: 500 },
      { type: 'damage-number', targetId: effect.targetId, duration: 1000, data: { value: -damage } }
    ]

    return {
      stateChanges: [healthChange],
      animations
    }
  } else {
    // First application - only apply status, no damage
    console.log(`🩸 Applying bleed status to ${creature.name} (${damage} dmg/turn for 3 turns)`)

    const statusChange: StateChange = {
      type: 'STATUS_APPLIED',
      creatureId: effect.targetId,
      timestamp: Date.now(),
      data: {
        statusId: 'BLEED',
        duration: 3,
        damagePerTurn: damage,  // Store damage value in status data
        source: 'bleed'
      }
    }

    const animations: Animation[] = [
      { type: 'status-icon', targetId: effect.targetId, duration: 800, data: { status: 'BLEED' } }
    ]

    return {
      stateChanges: [statusChange],
      animations
    }
  }
}

// ============================================================================
// REGISTER APPLICATORS
// ============================================================================

console.log('🔧 Registering status effect applicators...')
registerEffectApplicator('BURN', applyBurnEffect)
console.log('✅ BURN applicator registered')
registerEffectApplicator('POISON', applyPoisonEffect)
console.log('✅ POISON applicator registered')
registerEffectApplicator('REGENERATION', applyRegenerationEffect)
console.log('✅ REGENERATION applicator registered')
registerEffectApplicator('ATTACK_BUFF', applyAttackBuffEffect)
registerEffectApplicator('DEFENSE_BUFF', applyDefenseBuffEffect)
registerEffectApplicator('STUN', applyStunEffect)
registerEffectApplicator('SHIELD', applyShieldEffect)
console.log('✅ SHIELD applicator registered')
registerEffectApplicator('BLEED', applyBleedEffect)
console.log('✅ BLEED applicator registered')

// ============================================================================
// EFFECT FACTORY FUNCTIONS
// ============================================================================
// NOTE: Factory functions have been moved to factories.ts
// Import from there instead: import { buildBurnEffect, ... } from '../factories'
// Backwards-compatible exports remain in factories.ts: createBurnEffect, etc.
