// Status Effect Definitions - Serializable effects with decoupled applicators
import { Effect, BattleContext, EffectApplicationResult, HealthChange, StateChange, Animation } from '../types'
import { registerEffectApplicator } from '../effectApplicatorRegistry'
import { getCreatureFromContext } from '../effectResolver'

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

// ============================================================================
// EFFECT APPLICATORS (Pure functions)
// ============================================================================

/**
 * Apply a burn effect that deals damage over time
 */
const applyBurnEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  console.log('🚨🚨🚨 BURN APPLICATOR CALLED! 🚨🚨🚨')
  console.group(`🔥 APPLY BURN EFFECT`)
  console.log('Effect:', effect)
  console.log('Effect type:', effect.type)
  console.log('Effect data:', effect.data)
  
  const { damage } = effect.data as BurnEffectData
  const creature = getCreatureFromContext(context, effect.targetId)
  
  console.log(`Target creature:`, { name: creature.name, health: creature.health, statuses: creature.statuses })
  console.log(`🔥 BURN DAMAGE VALUE: ${damage}`)
  
  const actualDamage = Math.min(damage, creature.health)
  const newHealth = creature.health - actualDamage

  console.log(`💥 Damage calculation: ${damage} → ${actualDamage} (capped by health)`)
  console.log(`❤️ Health: ${creature.health} → ${newHealth}`)
  console.log(`📉 Health delta: -${actualDamage}`)

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

  console.log('📝 Creating HEALTH_CHANGE:', healthChange)

  // NOTE: When called as a tick during processEndOfTurn, we should NOT reapply the status
  // The status already exists and its duration is managed separately
  // Only create health change, not status change
  const animations: Animation[] = [
    { type: 'burn', targetId: effect.targetId, duration: 500 },
    { type: 'damage-number', targetId: effect.targetId, duration: 1000, data: { value: -damage } }
  ]

  console.log('🎬 Animations:', animations)
  console.log('📤 Returning state changes:', [healthChange])
  console.groupEnd()

  return {
    stateChanges: [healthChange], // Only health change, no status reapplication
    animations
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
  const actualDamage = Math.min(damage, creature.health)
  const newHealth = creature.health - actualDamage

  console.log(`🧪 Poison effect: ${creature.name} takes ${actualDamage} poison damage (${creature.health} → ${newHealth})`)

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

  const statusChange: StateChange = {
    type: 'STATUS_APPLIED',
    creatureId: effect.targetId,
    timestamp: Date.now(),
    data: {
      statusId: 'POISON',
      duration: 3,
      source: 'poison'
    }
  }

  const animations: Animation[] = [
    { type: 'shake', targetId: effect.targetId, duration: 300 },
    { type: 'damage-number', targetId: effect.targetId, duration: 1000, data: { value: -damage } }
  ]

  return {
    stateChanges: [healthChange, statusChange],
    animations
  }
}

/**
 * Apply a regeneration effect that heals over time
 */
const applyRegenerationEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const { healing } = effect.data as RegenerationEffectData
  const creature = getCreatureFromContext(context, effect.targetId)
  const actualHealing = Math.min(healing, creature.maxHealth - creature.health)
  const newHealth = creature.health + actualHealing

  console.log(`💚 Regeneration effect: ${creature.name} heals ${actualHealing} HP (${creature.health} → ${newHealth})`)

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

// ============================================================================
// EFFECT FACTORY FUNCTIONS (Create serializable effects)
// ============================================================================

export const createBurnEffect = (targetId: number, damage: number = 5): Effect => ({
  id: 'burn',
  type: 'BURN',
  targetId,
  priority: 10,
  timestamp: Date.now(),
  data: { damage }
})

export const createPoisonEffect = (targetId: number, damage: number = 10): Effect => ({
  id: 'poison',
  type: 'POISON',
  targetId,
  priority: 10,
  timestamp: Date.now(),
  data: { damage }
})

export const createRegenerationEffect = (targetId: number, healing: number = 5): Effect => ({
  id: 'regeneration',
  type: 'REGENERATION',
  targetId,
  priority: 5,
  timestamp: Date.now(),
  data: { healing }
})

export const createAttackBuffEffect = (targetId: number, attackBonus: number = 5): Effect => ({
  id: 'attack-buff',
  type: 'ATTACK_BUFF',
  targetId,
  priority: 15,
  timestamp: Date.now(),
  data: { attackBonus }
})

export const createDefenseBuffEffect = (targetId: number, defenseBonus: number = 5): Effect => ({
  id: 'defense-buff',
  type: 'DEFENSE_BUFF',
  targetId,
  priority: 15,
  timestamp: Date.now(),
  data: { defenseBonus }
})

export const createStunEffect = (targetId: number, duration: number = 2): Effect => ({
  id: 'stun',
  type: 'STUN',
  targetId,
  priority: 20,
  timestamp: Date.now(),
  data: { duration }
})
