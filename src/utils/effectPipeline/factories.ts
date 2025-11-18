// Effect Factories - Create serializable effect objects
// Renamed from: create*Effect → build*Effect
// 📋 See STATUS_EFFECT_CHECKLIST.md for implementation guidelines

import { Effect } from './types'
import { Attack } from '../../consts/types/types'

// Import effect files to ensure applicators are registered
import './effects/combatEffects'
import './effects/statusEffects'

/**
 * Helper to generate unique effect IDs
 */
const generateEffectId = (type: string): string => {
  return `${type.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// ============================================================================
// NEW FACTORY FUNCTIONS - "build" naming
// ============================================================================

/**
 * Build an attack effect
 * Renamed from: createAttackEffect
 */
export const buildAttackEffect = (
  attackerId: number,
  targetId: number,
  attack: Attack
): Effect => ({
  id: generateEffectId('attack'),
  type: 'ATTACK',
  targetId,
  priority: 50,
  timestamp: Date.now(),
  data: {
    attackerId,
    attack
  }
})

/**
 * Build a true damage effect (ignores defense)
 * Renamed from: createTrueDamageAttackEffect
 */
export const buildTrueDamageEffect = (
  attackerId: number,
  targetId: number,
  damage: number
): Effect => ({
  id: generateEffectId('true-damage'),
  type: 'TRUE_DAMAGE',
  targetId,
  priority: 55,
  timestamp: Date.now(),
  data: {
    attackerId,
    damage
  }
})

/**
 * Build a healing effect
 * Renamed from: createHealingEffect
 */
export const buildHealEffect = (
  casterId: number,
  targetId: number,
  healingAmount: number
): Effect => ({
  id: generateEffectId('heal'),
  type: 'HEAL',
  targetId,
  priority: 30,
  timestamp: Date.now(),
  data: {
    casterId,
    healingAmount
  }
})

/**
 * Build a death effect
 * Renamed from: createDeathEffect
 */
export const buildDeathEffect = (creatureId: number): Effect => ({
  id: generateEffectId('death'),
  type: 'DEATH',
  targetId: creatureId,
  priority: 100,
  timestamp: Date.now(),
  data: {}
})

/**
 * Build a life drain effect (damage + heal)
 * Renamed from: createLifeDrainEffect
 */
export const buildLifeDrainEffect = (
  attackerId: number,
  targetId: number,
  drainAmount: number
): Effect => ({
  id: generateEffectId('life-drain'),
  type: 'LIFE_DRAIN',
  targetId,
  priority: 40,
  timestamp: Date.now(),
  data: {
    attackerId,
    drainAmount
  }
})

/**
 * Build an AOE attack effect
 * Renamed from: createAoeAttackEffect
 */
export const buildAoeAttackEffect = (
  attackerId: number,
  targetIds: number[],
  damage: number
): Effect => ({
  id: generateEffectId('aoe-attack'),
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

/**
 * Build a burn effect
 * Renamed from: createBurnEffect
 */
export const buildBurnEffect = (
  targetId: number,
  damage: number = 5
): Effect => ({
  id: generateEffectId('burn'),
  type: 'BURN',
  targetId,
  priority: 40,
  timestamp: Date.now(),
  data: { damage }
})

/**
 * Build a poison effect
 * Renamed from: createPoisonEffect
 */
export const buildPoisonEffect = (
  targetId: number,
  damage: number = 3
): Effect => ({
  id: generateEffectId('poison'),
  type: 'POISON',
  targetId,
  priority: 40,
  timestamp: Date.now(),
  data: { damage }
})

/**
 * Build a bleed effect
 * Creates a bleeding damage-over-time effect
 */
export const buildBleedEffect = (
  targetId: number,
  damage: number = 7
): Effect => ({
  id: generateEffectId('bleed'),
  type: 'BLEED',
  targetId,
  priority: 40,
  timestamp: Date.now(),
  data: { damage }
})

/**
 * Build a regeneration effect
 * Renamed from: createRegenerationEffect
 */
export const buildRegenerationEffect = (
  targetId: number,
  healing: number = 5
): Effect => ({
  id: generateEffectId('regen'),
  type: 'REGENERATION',
  targetId,
  priority: 35,
  timestamp: Date.now(),
  data: { healing }  // Changed from healAmount to healing to match applicator
})

/**
 * Build a freeze effect
 * Freezes target, preventing actions and reducing defense
 */
export const buildFreezeEffect = (
  targetId: number,
  defenseReduction: number = 5
): Effect => ({
  id: generateEffectId('freeze'),
  type: 'FREEZE',
  targetId,
  priority: 45,
  timestamp: Date.now(),
  data: { defenseReduction }
})

/**
 * Build a stun effect
 * Renamed from: createStunEffect
 */
export const buildStunEffect = (
  targetId: number,
  duration: number = 1
): Effect => ({
  id: generateEffectId('stun'),
  type: 'STUN',
  targetId,
  priority: 30,
  timestamp: Date.now(),
  data: { duration }
})

/**
 * Build a shield effect
 * Creates a protective barrier that absorbs incoming damage
 */
export const buildShieldEffect = (
  targetId: number,
  shieldAmount: number = 20
): Effect => ({
  id: generateEffectId('shield'),
  type: 'SHIELD',
  targetId,
  priority: 28,
  timestamp: Date.now(),
  data: { shieldAmount }
})

/**
 * Build an attack buff effect
 * Renamed from: createAttackBuffEffect
 */
export const buildAttackBuffEffect = (
  targetId: number,
  bonus: number,
  duration: number = 3
): Effect => ({
  id: generateEffectId('attack-buff'),
  type: 'ATTACK_BUFF',
  targetId,
  priority: 25,
  timestamp: Date.now(),
  data: { bonus, duration }
})

/**
 * Build a defense buff effect
 * Renamed from: createDefenseBuffEffect
 */
export const buildDefenseBuffEffect = (
  targetId: number,
  bonus: number,
  duration: number = 3
): Effect => ({
  id: generateEffectId('defense-buff'),
  type: 'DEFENSE_BUFF',
  targetId,
  priority: 25,
  timestamp: Date.now(),
  data: { bonus, duration }
})

// ============================================================================
// BACKWARDS COMPATIBILITY - Old "create" naming
// ============================================================================

/**
 * @deprecated Use buildAttackEffect() instead
 */
export const createAttackEffect = (
  attackerId: number,
  targetId: number,
  attack: Attack
): Effect => {
  console.warn('⚠️ createAttackEffect() is deprecated. Use buildAttackEffect() instead.')
  return buildAttackEffect(attackerId, targetId, attack)
}

/**
 * @deprecated Use buildTrueDamageEffect() instead
 */
export const createTrueDamageAttackEffect = (
  attackerId: number,
  targetId: number,
  damage: number
): Effect => {
  console.warn('⚠️ createTrueDamageAttackEffect() is deprecated. Use buildTrueDamageEffect() instead.')
  return buildTrueDamageEffect(attackerId, targetId, damage)
}

/**
 * @deprecated Use buildHealEffect() instead
 */
export const createHealingEffect = (
  casterId: number,
  targetId: number,
  healingAmount: number
): Effect => {
  console.warn('⚠️ createHealingEffect() is deprecated. Use buildHealEffect() instead.')
  return buildHealEffect(casterId, targetId, healingAmount)
}

/**
 * @deprecated Use buildDeathEffect() instead
 */
export const createDeathEffect = (creatureId: number): Effect => {
  console.warn('⚠️ createDeathEffect() is deprecated. Use buildDeathEffect() instead.')
  return buildDeathEffect(creatureId)
}

/**
 * @deprecated Use buildLifeDrainEffect() instead
 */
export const createLifeDrainEffect = (
  attackerId: number,
  targetId: number,
  drainAmount: number
): Effect => {
  console.warn('⚠️ createLifeDrainEffect() is deprecated. Use buildLifeDrainEffect() instead.')
  return buildLifeDrainEffect(attackerId, targetId, drainAmount)
}

/**
 * @deprecated Use buildAoeAttackEffect() instead
 */
export const createAoeAttackEffect = (
  attackerId: number,
  targetIds: number[],
  damage: number
): Effect => {
  console.warn('⚠️ createAoeAttackEffect() is deprecated. Use buildAoeAttackEffect() instead.')
  return buildAoeAttackEffect(attackerId, targetIds, damage)
}

/**
 * @deprecated Use buildBurnEffect() instead
 */
export const createBurnEffect = (targetId: number, damage?: number): Effect => {
  console.warn('⚠️ createBurnEffect() is deprecated. Use buildBurnEffect() instead.')
  return buildBurnEffect(targetId, damage)
}

/**
 * @deprecated Use buildPoisonEffect() instead
 */
export const createPoisonEffect = (targetId: number, damage?: number): Effect => {
  console.warn('⚠️ createPoisonEffect() is deprecated. Use buildPoisonEffect() instead.')
  return buildPoisonEffect(targetId, damage)
}

/**
 * @deprecated Use buildRegenerationEffect() instead
 */
export const createRegenerationEffect = (targetId: number, healing?: number): Effect => {
  console.warn('⚠️ createRegenerationEffect() is deprecated. Use buildRegenerationEffect() instead.')
  return buildRegenerationEffect(targetId, healing)
}

/**
 * @deprecated Use buildStunEffect() instead
 */
export const createStunEffect = (targetId: number, duration?: number): Effect => {
  console.warn('⚠️ createStunEffect() is deprecated. Use buildStunEffect() instead.')
  return buildStunEffect(targetId, duration)
}

/**
 * @deprecated Use buildAttackBuffEffect() instead
 */
export const createAttackBuffEffect = (targetId: number, bonus: number, duration?: number): Effect => {
  console.warn('⚠️ createAttackBuffEffect() is deprecated. Use buildAttackBuffEffect() instead.')
  return buildAttackBuffEffect(targetId, bonus, duration)
}

/**
 * @deprecated Use buildDefenseBuffEffect() instead
 */
export const createDefenseBuffEffect = (targetId: number, bonus: number, duration?: number): Effect => {
  console.warn('⚠️ createDefenseBuffEffect() is deprecated. Use buildDefenseBuffEffect() instead.')
  return buildDefenseBuffEffect(targetId, bonus, duration)
}
