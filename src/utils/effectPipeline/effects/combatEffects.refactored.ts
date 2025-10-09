// Refactored Combat Effect Definitions - Effects use decoupled applicators
import { Effect, BattleContext } from '../types'
import { Attack } from '../../../consts/types/types'
import {
  applyAttackEffect,
  applyTrueDamageEffect,
  applyHealingEffect,
  applyDeathEffect,
  applyLifeDrainEffect,
  applyAoeAttackEffect
} from './effectApplicators'

/**
 * Creates a basic attack effect
 *
 * REFACTORED: Now uses applyAttackEffect applicator
 * - Effect definition is clean and focused on structure
 * - Apply logic is in a separate, testable function
 * - Animations can be dynamically generated from calculation results
 */
export const createAttackEffect = (
  attackerId: number,
  targetId: number,
  attack: Attack
): Effect => {
  const effect: Effect = {
    id: 'attack',
    targetId,
    priority: 50,
    animations: [], // Will be populated in apply()
    apply: async (context: BattleContext) => {
      // Call the decoupled applicator
      const result = applyAttackEffect(context, attackerId, targetId, attack)

      // Generate animations based on calculation results
      effect.animations = [
        { type: 'attack-windup', targetId: attackerId, duration: 600 },
        { type: 'impact', targetId, duration: 300 },
        ...result.damageBreakdown.map((breakdown, index) => ({
          type: 'damage-number',
          targetId,
          duration: 1500,
          data: {
            value: breakdown.value,
            label: breakdown.label,
            isTotal: breakdown.label === 'Total Damage',
            delay: index * 200
          }
        }))
      ]

      return result.stateChanges
    }
  }

  return effect
}

/**
 * Creates a true damage attack effect (ignores defense)
 *
 * REFACTORED: Uses applyTrueDamageEffect applicator
 */
export const createTrueDamageAttackEffect = (
  attackerId: number,
  targetId: number,
  damage: number
): Effect => ({
  id: 'true-damage-attack',
  targetId,
  priority: 55,
  animations: [
    { type: 'attack-windup', targetId: attackerId, duration: 800 },
    { type: 'impact', targetId, duration: 400 },
    { type: 'damage-number', targetId, duration: 1200, data: { value: -damage } }
  ],
  apply: async (context: BattleContext) => {
    const result = applyTrueDamageEffect(context, attackerId, targetId, damage)
    return result.stateChanges
  }
})

/**
 * Creates a healing effect
 *
 * REFACTORED: Uses applyHealingEffect applicator
 */
export const createHealingEffect = (
  casterId: number,
  targetId: number,
  healingAmount: number
): Effect => ({
  id: 'healing',
  targetId,
  priority: 30,
  animations: [
    { type: 'healing', targetId, duration: 1000 },
    { type: 'damage-number', targetId, duration: 1200, data: { value: healingAmount } }
  ],
  apply: async (context: BattleContext) => {
    const result = applyHealingEffect(context, casterId, targetId, healingAmount)
    return result.stateChanges
  }
})

/**
 * Creates a death effect that handles creature death
 *
 * REFACTORED: Uses applyDeathEffect applicator
 */
export const createDeathEffect = (creatureId: number): Effect => ({
  id: 'death',
  targetId: creatureId,
  priority: 100,
  animations: [
    { type: 'death-animation', targetId: creatureId, duration: 2000 }
  ],
  apply: async (context: BattleContext) => {
    const result = applyDeathEffect(context, creatureId)
    return result.stateChanges
  }
})

/**
 * Creates a life drain effect that damages target and heals attacker
 *
 * REFACTORED: Uses applyLifeDrainEffect applicator
 */
export const createLifeDrainEffect = (
  attackerId: number,
  targetId: number,
  drainAmount: number
): Effect => ({
  id: 'life-drain',
  targetId,
  priority: 40,
  animations: [
    { type: 'attack-windup', targetId: attackerId, duration: 600 },
    { type: 'impact', targetId, duration: 300 },
    { type: 'damage-number', targetId, duration: 1200, data: { value: -drainAmount } },
    { type: 'healing', targetId: attackerId, duration: 800 }
  ],
  apply: async (context: BattleContext) => {
    const result = applyLifeDrainEffect(context, attackerId, targetId, drainAmount)
    return result.stateChanges
  }
})

/**
 * Creates an area of effect attack
 *
 * REFACTORED: Uses applyAoeAttackEffect applicator
 */
export const createAoeAttackEffect = (
  attackerId: number,
  targetIds: number[],
  damage: number
): Effect => ({
  id: 'aoe-attack',
  targetId: targetIds[0],
  priority: 45,
  animations: [
    { type: 'attack-windup', targetId: attackerId, duration: 800 },
    ...targetIds.map(id => ({ type: 'impact', targetId: id, duration: 300 })),
    ...targetIds.map(id => ({ type: 'damage-number', targetId: id, duration: 1200, data: { value: -damage } }))
  ],
  apply: async (context: BattleContext) => {
    const result = applyAoeAttackEffect(context, attackerId, targetIds, damage)
    return result.stateChanges
  }
})
