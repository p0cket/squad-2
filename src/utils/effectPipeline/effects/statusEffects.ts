// Status Effect Definitions - Serializable effects with decoupled applicators
// 📋 See STATUS_EFFECT_CHECKLIST.md for implementation guidelines and verification steps
import { Effect, BattleContext, EffectApplicationResult, HealthChange, StateChange, Animation } from '../types'
import { StatusEffect, Creature } from '../../../consts/types/types'
import { 
  buildBurnEffect, 
  buildPoisonEffect, 
  buildBleedEffect, 
  buildRegenerationEffect 
} from '../factories'
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
  spreadCount?: number
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

export type FreezeEffectData = {
  defenseReduction: number
}

export type SlowEffectData = {
  skipFrequency: number  // Skip every N turns (2 = every other turn)
}

export type AttackDebuffEffectData = {
  attackReduction: number
}

export type CleanseEffectData = {
  targetType: 'debuffs' | 'all'  // What to remove
}

export type SilenceEffectData = {
  // No additional data needed - just a flag
}

export type VulnerableEffectData = {
  damageMultiplier: number  // 1.5 = 50% more damage
}

export type ThornsEffectData = {
  damageAmount: number  // Flat damage to return to attacker
}

export type LeechEffectData = {
  lifestealPercentage: number  // 0.3 = 30% lifesteal
}

export type EvasionEffectData = {
  dodgeChance: number  // 0.4 = 40% dodge chance
}

export type ReflectEffectData = {
  percentage: number  // 0.5 = 50% reflection
}

// ============================================================================
// STATUS TICK LOGIC
// ============================================================================

/**
 * Determines the effect to apply for a status tick at the end of a turn
 */
export const getStatusTickEffect = (status: StatusEffect, creature: Creature): Effect | null => {
  const sid = status.id
  
  if (sid === 'BURN') {
    const damage = status.damagePerTurn ?? 5
    if (status.damagePerTurn === undefined) {
      console.warn(`⚠️ BURN status on ${creature.name} missing damagePerTurn! Using fallback: 5`)
    }
    console.log(`🔥 Creating burn tick effect for ${creature.name} (${damage} dmg)`)
    return buildBurnEffect(creature.ID, damage)
  } 
  
  if (sid === 'POISON') {
    const damage = status.damagePerTurn ?? 3
    if (status.damagePerTurn === undefined) {
      console.warn(`⚠️ POISON status on ${creature.name} missing damagePerTurn! Using fallback: 3`)
    }
    console.log(`🧪 Creating poison tick effect for ${creature.name} (${damage} dmg)`)
    return buildPoisonEffect(creature.ID, damage)
  } 
  
  if (sid === 'BLEED') {
    const damage = status.damagePerTurn ?? 7
    if (status.damagePerTurn === undefined) {
      console.warn(`⚠️ BLEED status on ${creature.name} missing damagePerTurn! Using fallback: 7`)
    }
    console.log(`🩸 Creating bleed tick effect for ${creature.name} (${damage} dmg)`)
    return buildBleedEffect(creature.ID, damage)
  } 
  
  if (sid === 'REGENERATION') {
    const healing = status.healPerTurn ?? 5
    if (status.healPerTurn === undefined) {
      console.warn(`⚠️ REGENERATION status on ${creature.name} missing healPerTurn! Using fallback: 5`)
    }
    console.log(`💚 Creating regen tick effect for ${creature.name} (${healing} heal)`)
    return buildRegenerationEffect(creature.ID, healing)
  }

  // Passive effects that don't tick
  if (['SHIELD', 'FREEZE', 'SLOW', 'ATTACK_DEBUFF', 'SILENCE'].includes(sid)) {
    console.log(`ℹ️ ${sid} on ${creature.name} is a passive effect (no tick)`)
    return null
  }

  return null
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
      { type: 'damage-number', targetId: effect.targetId, duration: 1000, data: { value: -damage, label: 'burn' } }
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
 * Apply a bleed effect that deals damage over time
 */
const applyBleedEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const { damage } = effect.data as { damage: number }
  const creature = getCreatureFromContext(context, effect.targetId)

  console.log(`🩸🔍 applyBleedEffect called - damage value: ${damage}, effect.data:`, effect.data)

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
      { type: 'shake', targetId: effect.targetId, duration: 300 },
      { type: 'damage-number', targetId: effect.targetId, duration: 1000, data: { value: -damage, label: 'bleed' } }
    ]

    return {
      stateChanges: [healthChange],
      animations
    }
  } else {
    // First application - only apply status, no damage
    console.log(`🩸 Applying bleed status to ${creature.name} (${damage} dmg/turn for 3 turns)`)
    console.log(`🩸💾 Storing damagePerTurn: ${damage}`)

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

    console.log(`🩸📦 STATUS_APPLIED change data:`, statusChange.data)

    const animations: Animation[] = [
      { type: 'status-icon', targetId: effect.targetId, duration: 800, data: { status: 'BLEED' } }
    ]

    return {
      stateChanges: [statusChange],
      animations
    }
  }
}

/**
 * Apply a regeneration effect that heals over time
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
      { type: 'damage-number', targetId: effect.targetId, duration: 1000, data: { value: -damage, label: 'poison' } }
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
      { type: 'damage-number', targetId: effect.targetId, duration: 1000, data: { value: healing, label: 'regen' } }
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
 * Apply a freeze effect that prevents actions and reduces defense
 * Freeze represents being frozen solid, unable to move
 */
const applyFreezeEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const { defenseReduction } = effect.data as FreezeEffectData
  const creature = getCreatureFromContext(context, effect.targetId)

  const hasFreezeStatus = creature.statuses.some(s => s.id === 'FREEZE')

  if (hasFreezeStatus) {
    // Freeze doesn't tick - it's a passive effect
    console.log(`❄️ ${creature.name} remains frozen (no tick effect)`)
    return {
      stateChanges: [],
      animations: []
    }
  } else {
    // First application - apply status and reduce defense
    console.log(`❄️ Freezing ${creature.name} (-${defenseReduction} defense, cannot act for 2 turns)`)

    const statChange: StateChange = {
      type: 'STAT_MODIFIED',
      creatureId: effect.targetId,
      timestamp: Date.now(),
      data: {
        stat: 'defense',
        delta: -defenseReduction,
        source: 'freeze'
      }
    }

    const statusChange: StateChange = {
      type: 'STATUS_APPLIED',
      creatureId: effect.targetId,
      timestamp: Date.now(),
      data: {
        statusId: 'FREEZE',
        duration: 2,
        defenseReduction: defenseReduction,
        preventsActions: true,  // Flag for action system to check
        source: 'freeze'
      }
    }

    const animations: Animation[] = [
      { type: 'freeze', targetId: effect.targetId, duration: 800 },
      { type: 'status-icon', targetId: effect.targetId, duration: 800, data: { status: 'FREEZE' } }
    ]

    return {
      stateChanges: [statChange, statusChange],
      animations
    }
  }
}

/**
 * Apply a slow effect that reduces action frequency
 * Slow causes creature to skip turns periodically
 */
const applySlowEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const { skipFrequency } = effect.data as SlowEffectData
  const creature = getCreatureFromContext(context, effect.targetId)

  const hasSlowStatus = creature.statuses.some(s => s.id === 'SLOW')

  if (hasSlowStatus) {
    console.log(`🐌 ${creature.name} remains slowed (passive effect)`)
    return {
      stateChanges: [],
      animations: []
    }
  } else {
    console.log(`🐌 Slowing ${creature.name} (skip every ${skipFrequency} turns for 3 turns)`)

    const statusChange: StateChange = {
      type: 'STATUS_APPLIED',
      creatureId: effect.targetId,
      timestamp: Date.now(),
      data: {
        statusId: 'SLOW',
        duration: 3,
        skipFrequency: skipFrequency,
        turnCounter: 0,  // Track turns to know when to skip
        source: 'slow'
      }
    }

    const animations: Animation[] = [
      { type: 'slow', targetId: effect.targetId, duration: 800 },
      { type: 'status-icon', targetId: effect.targetId, duration: 800, data: { status: 'SLOW' } }
    ]

    return {
      stateChanges: [statusChange],
      animations
    }
  }
}

/**
 * Apply an attack debuff effect that reduces attack stat
 * Weakens the target's offensive capabilities
 */
const applyAttackDebuffEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const { attackReduction } = effect.data as AttackDebuffEffectData
  const creature = getCreatureFromContext(context, effect.targetId)

  const hasDebuff = creature.statuses.some(s => s.id === 'ATTACK_DEBUFF')

  if (hasDebuff) {
    console.log(`⚔️⬇️ ${creature.name} attack remains reduced (passive effect)`)
    return {
      stateChanges: [],
      animations: []
    }
  } else {
    console.log(`⚔️⬇️ Weakening ${creature.name} (-${attackReduction} attack for 3 turns)`)

    const statChange: StateChange = {
      type: 'STAT_MODIFIED',
      creatureId: effect.targetId,
      timestamp: Date.now(),
      data: {
        stat: 'attack',
        delta: -attackReduction,
        source: 'attack-debuff'
      }
    }

    const statusChange: StateChange = {
      type: 'STATUS_APPLIED',
      creatureId: effect.targetId,
      timestamp: Date.now(),
      data: {
        statusId: 'ATTACK_DEBUFF',
        duration: 3,
        attackReduction: attackReduction,
        source: 'attack-debuff'
      }
    }

    const animations: Animation[] = [
      { type: 'debuff', targetId: effect.targetId, duration: 600 },
      { type: 'status-icon', targetId: effect.targetId, duration: 800, data: { status: 'ATTACK_DEBUFF' } }
    ]

    return {
      stateChanges: [statChange, statusChange],
      animations
    }
  }
}

/**
 * Apply a cleanse effect that removes debuffs
 * Cleanses negative status effects from the target
 */
const applyCleanseEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const creature = getCreatureFromContext(context, effect.targetId)

  // Define known debuff status IDs
  const DEBUFF_IDS = ['POISON', 'BURN', 'BLEED', 'FREEZE', 'SLOW', 'ATTACK_DEBUFF', 'DEFENSE_DEBUFF', 'SILENCE', 'STUN']

  // Find all debuffs to remove
  const debuffsToRemove = creature.statuses.filter(s => 
    DEBUFF_IDS.includes(s.id)
  )

  console.log(`✨ Cleansing ${creature.name}: removing ${debuffsToRemove.length} debuffs`)

  // Create STATUS_REMOVED changes for each debuff
  const stateChanges: StateChange[] = debuffsToRemove.map(status => ({
    type: 'STATUS_REMOVED',
    creatureId: effect.targetId,
    timestamp: Date.now(),
    data: {
      statusId: status.id,
      source: 'cleanse'
    }
  }))

  const animations: Animation[] = [
    { type: 'cleanse', targetId: effect.targetId, duration: 1000 },
    { type: 'sparkle', targetId: effect.targetId, duration: 1500 }
  ]

  return {
    stateChanges,
    animations
  }
}

/**
 * Apply a silence effect that prevents special abilities
 * Silenced creatures can only use basic attacks
 */
const applySilenceEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const creature = getCreatureFromContext(context, effect.targetId)

  const hasSilence = creature.statuses.some(s => s.id === 'SILENCE')

  if (hasSilence) {
    console.log(`🤐 ${creature.name} remains silenced (passive effect)`)
    return {
      stateChanges: [],
      animations: []
    }
  } else {
    console.log(`🤐 Silencing ${creature.name} (cannot use abilities for 2 turns)`)

    const statusChange: StateChange = {
      type: 'STATUS_APPLIED',
      creatureId: effect.targetId,
      timestamp: Date.now(),
      data: {
        statusId: 'SILENCE',
        duration: 2,
        preventsAbilities: true,  // Flag for ability system to check
        source: 'silence'
      }
    }

    const animations: Animation[] = [
      { type: 'silence', targetId: effect.targetId, duration: 800 },
      { type: 'status-icon', targetId: effect.targetId, duration: 800, data: { status: 'SILENCE' } }
    ]

    return {
      stateChanges: [statusChange],
      animations
    }
  }
}

/**
 * Apply VULNERABLE status - increases damage taken from all sources
 */
const applyVulnerableEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const { damageMultiplier } = effect.data as VulnerableEffectData
  const creature = getCreatureFromContext(context, effect.targetId)

  const hasVulnerable = creature.statuses.some(s => s.id === 'VULNERABLE')

  if (hasVulnerable) {
    console.log(`🎯 ${creature.name} remains vulnerable (passive effect)`)
    return {
      stateChanges: [],
      animations: []
    }
  } else {
    console.log(`🎯 Making ${creature.name} vulnerable (${(damageMultiplier - 1) * 100}% more damage for 3 turns)`)

    const statusChange: StateChange = {
      type: 'STATUS_APPLIED',
      creatureId: effect.targetId,
      timestamp: Date.now(),
      data: {
        statusId: 'VULNERABLE',
        duration: 3,
        damageMultiplier,
        source: 'vulnerable'
      }
    }

    const animations: Animation[] = [
      { type: 'vulnerable', targetId: effect.targetId, duration: 800 },
      { type: 'status-icon', targetId: effect.targetId, duration: 800, data: { status: 'VULNERABLE' } }
    ]

    return {
      stateChanges: [statusChange],
      animations
    }
  }
}

/**
 * Apply THORNS status - deals flat damage to attackers
 */
const applyThornsEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const { damageAmount } = effect.data as ThornsEffectData
  const creature = getCreatureFromContext(context, effect.targetId)

  const hasThorns = creature.statuses.some(s => s.id === 'THORNS')

  if (hasThorns) {
    console.log(`🌵 ${creature.name} thorns remain active (passive effect)`)
    return {
      stateChanges: [],
      animations: []
    }
  } else {
    console.log(`🌵 Applying thorns to ${creature.name} (${damageAmount} damage to attackers for 3 turns)`)

    const statusChange: StateChange = {
      type: 'STATUS_APPLIED',
      creatureId: effect.targetId,
      timestamp: Date.now(),
      data: {
        statusId: 'THORNS',
        duration: 3,
        damageAmount,
        source: 'thorns'
      }
    }

    const animations: Animation[] = [
      { type: 'thorns', targetId: effect.targetId, duration: 800 },
      { type: 'status-icon', targetId: effect.targetId, duration: 800, data: { status: 'THORNS' } }
    ]

    return {
      stateChanges: [statusChange],
      animations
    }
  }
}

/**
 * Apply LEECH status - heals attacker for percentage of damage dealt
 */
const applyLeechEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const { lifestealPercentage } = effect.data as LeechEffectData
  const creature = getCreatureFromContext(context, effect.targetId)

  const hasLeech = creature.statuses.some(s => s.id === 'LEECH')

  if (hasLeech) {
    console.log(`🩸 ${creature.name} leech remains active (passive effect)`)
    return {
      stateChanges: [],
      animations: []
    }
  } else {
    console.log(`🩸 Granting leech to ${creature.name} (${lifestealPercentage * 100}% lifesteal for 3 turns)`)

    const statusChange: StateChange = {
      type: 'STATUS_APPLIED',
      creatureId: effect.targetId,
      timestamp: Date.now(),
      data: {
        statusId: 'LEECH',
        duration: 3,
        lifestealPercentage,
        source: 'leech'
      }
    }

    const animations: Animation[] = [
      { type: 'leech', targetId: effect.targetId, duration: 800 },
      { type: 'status-icon', targetId: effect.targetId, duration: 800, data: { status: 'LEECH' } }
    ]

    return {
      stateChanges: [statusChange],
      animations
    }
  }
}

/**
 * Apply EVASION status - chance to dodge attacks
 */
const applyEvasionEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const { dodgeChance } = effect.data as EvasionEffectData
  const creature = getCreatureFromContext(context, effect.targetId)

  const hasEvasion = creature.statuses.some(s => s.id === 'EVASION')

  if (hasEvasion) {
    console.log(`✨ ${creature.name} evasion remains active (passive effect)`)
    return {
      stateChanges: [],
      animations: []
    }
  } else {
    console.log(`✨ Granting evasion to ${creature.name} (${dodgeChance * 100}% dodge chance for 3 turns)`)

    const statusChange: StateChange = {
      type: 'STATUS_APPLIED',
      creatureId: effect.targetId,
      timestamp: Date.now(),
      data: {
        statusId: 'EVASION',
        duration: 3,
        dodgeChance,
        source: 'evasion'
      }
    }

    const animations: Animation[] = [
      { type: 'evasion', targetId: effect.targetId, duration: 800 },
      { type: 'status-icon', targetId: effect.targetId, duration: 800, data: { status: 'EVASION' } }
    ]

    return {
      stateChanges: [statusChange],
      animations
    }
  }
}

/**
 * Apply REFLECT status - returns percentage of damage to attacker
 */
const applyReflectEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const { percentage } = effect.data as ReflectEffectData
  const creature = getCreatureFromContext(context, effect.targetId)

  const hasReflect = creature.statuses.some(s => s.id === 'REFLECT')

  if (hasReflect) {
    console.log(`🪞 ${creature.name} reflect remains active (passive effect)`)
    return {
      stateChanges: [],
      animations: []
    }
  } else {
    console.log(`🪞 Granting reflect to ${creature.name} (${percentage * 100}% damage reflection for 3 turns)`)

    const statusChange: StateChange = {
      type: 'STATUS_APPLIED',
      creatureId: effect.targetId,
      timestamp: Date.now(),
      data: {
        statusId: 'REFLECT',
        duration: 3,
        percentage,
        source: 'reflect'
      }
    }

    const animations: Animation[] = [
      { type: 'reflect', targetId: effect.targetId, duration: 800 },
      { type: 'status-icon', targetId: effect.targetId, duration: 800, data: { status: 'REFLECT' } }
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
registerEffectApplicator('BLEED', applyBleedEffect)
console.log('✅ BLEED applicator registered')
registerEffectApplicator('REGENERATION', applyRegenerationEffect)
console.log('✅ REGENERATION applicator registered')
registerEffectApplicator('ATTACK_BUFF', applyAttackBuffEffect)
registerEffectApplicator('DEFENSE_BUFF', applyDefenseBuffEffect)
registerEffectApplicator('STUN', applyStunEffect)
registerEffectApplicator('SHIELD', applyShieldEffect)
console.log('✅ SHIELD applicator registered')
registerEffectApplicator('FREEZE', applyFreezeEffect)
console.log('✅ FREEZE applicator registered')
registerEffectApplicator('SLOW', applySlowEffect)
console.log('✅ SLOW applicator registered')
registerEffectApplicator('ATTACK_DEBUFF', applyAttackDebuffEffect)
console.log('✅ ATTACK_DEBUFF applicator registered')
registerEffectApplicator('CLEANSE', applyCleanseEffect)
console.log('✅ CLEANSE applicator registered')
registerEffectApplicator('SILENCE', applySilenceEffect)
console.log('✅ SILENCE applicator registered')
registerEffectApplicator('VULNERABLE', applyVulnerableEffect)
console.log('✅ VULNERABLE applicator registered')
registerEffectApplicator('THORNS', applyThornsEffect)
console.log('✅ THORNS applicator registered')
registerEffectApplicator('LEECH', applyLeechEffect)
console.log('✅ LEECH applicator registered')
registerEffectApplicator('EVASION', applyEvasionEffect)
console.log('✅ EVASION applicator registered')
registerEffectApplicator('REFLECT', applyReflectEffect)
console.log('✅ REFLECT applicator registered')

// ============================================================================
// EFFECT FACTORY FUNCTIONS
// ============================================================================
// NOTE: Factory functions have been moved to factories.ts
// Import from there instead: import { buildBurnEffect, ... } from '../factories'
// Backwards-compatible exports remain in factories.ts: createBurnEffect, etc.
