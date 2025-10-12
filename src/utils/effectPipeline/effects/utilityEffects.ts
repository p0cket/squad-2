// Utility Effects - Miscellaneous effects for combat flow and special triggers
import { Effect, BattleContext, EffectApplicationResult, StateChange, Animation } from '../types'
import { registerEffectApplicator } from '../effectApplicatorRegistry'

// ============================================================================
// EFFECT DATA TYPES (Serializable)
// ============================================================================

export type StatBuffEffectData = {
  statName: string
  value: number
  source: string
}

export type OverkillEffectData = {
  // No additional data needed - placeholder for future splash damage
}

export type StunRecoveryEffectData = {
  // No additional data needed
}

export type FirstBloodEffectData = {
  // No additional data needed
}

// ============================================================================
// EFFECT APPLICATORS (Pure functions)
// ============================================================================

/**
 * Apply a generic stat buff effect
 */
const applyStatBuffEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const { statName, value, source } = effect.data as StatBuffEffectData

  const statChange: StateChange = {
    type: 'STAT_MODIFIED',
    creatureId: effect.targetId,
    timestamp: Date.now(),
    data: {
      statName,
      value,
      source
    }
  }

  const animations: Animation[] = [
    { type: 'status-apply', targetId: effect.targetId, duration: 800, data: { statusType: 'buff' } }
  ]

  return {
    stateChanges: [statChange],
    animations
  }
}

/**
 * Apply overkill effect (placeholder for future splash damage)
 */
const applyOverkillEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const animations: Animation[] = [
    { type: 'impact', targetId: effect.targetId, duration: 600 }
  ]

  return {
    stateChanges: [],
    animations
  }
}

/**
 * Apply stun recovery effect
 */
const applyStunRecoveryEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const animations: Animation[] = [
    { type: 'status-apply', targetId: effect.targetId, duration: 500, data: { statusType: 'recovery' } }
  ]

  return {
    stateChanges: [],
    animations
  }
}

/**
 * Apply first blood effect (placeholder for battle events)
 */
const applyFirstBloodEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  // Could trigger battle music change or other effects
  return {
    stateChanges: [],
    animations: []
  }
}

// ============================================================================
// REGISTER APPLICATORS
// ============================================================================

registerEffectApplicator('STAT_BUFF', applyStatBuffEffect)
registerEffectApplicator('OVERKILL', applyOverkillEffect)
registerEffectApplicator('STUN_RECOVERY', applyStunRecoveryEffect)
registerEffectApplicator('FIRST_BLOOD', applyFirstBloodEffect)

// ============================================================================
// EFFECT FACTORY FUNCTIONS (Create serializable effects)
// ============================================================================

export const createStatBuffEffect = (
  targetId: number,
  statName: string,
  value: number,
  source: string
): Effect => ({
  id: `stat-buff-${statName}`,
  type: 'STAT_BUFF',
  targetId,
  priority: 30,
  timestamp: Date.now(),
  data: {
    statName,
    value,
    source
  }
})

export const createOverkillEffect = (targetId: number): Effect => ({
  id: 'overkill',
  type: 'OVERKILL',
  targetId,
  priority: 15,
  timestamp: Date.now(),
  data: {}
})

export const createStunRecoveryEffect = (targetId: number): Effect => ({
  id: 'stun-recovery',
  type: 'STUN_RECOVERY',
  targetId,
  priority: 10,
  timestamp: Date.now(),
  data: {}
})

export const createFirstBloodEffect = (targetId: number): Effect => ({
  id: 'first-blood',
  type: 'FIRST_BLOOD',
  targetId,
  priority: 5,
  timestamp: Date.now(),
  data: {}
})
