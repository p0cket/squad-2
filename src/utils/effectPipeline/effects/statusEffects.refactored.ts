// Refactored Status Effect Definitions - Effects use decoupled applicators
import { Effect, BattleContext } from '../types'
import {
  applyBurnDamage,
  applyPoisonDamage,
  applyRegenerationHealing,
  applyStatModification,
  applyStunEffect
} from './effectApplicators'

/**
 * Creates a burn effect that deals damage over time
 *
 * REFACTORED: Uses applyBurnDamage applicator
 */
export const createBurnEffect = (targetId: number, damage: number = 5): Effect => ({
  id: 'burn',
  targetId,
  priority: 10,
  animations: [
    { type: 'burn', targetId, duration: 500 },
    { type: 'damage-number', targetId, duration: 1000, data: { value: -damage } }
  ],
  apply: async (context: BattleContext) => {
    const result = applyBurnDamage(context, targetId, damage)
    return result.stateChanges
  }
})

/**
 * Creates a poison effect that deals damage over time
 *
 * REFACTORED: Uses applyPoisonDamage applicator
 */
export const createPoisonEffect = (targetId: number, damage: number = 10): Effect => ({
  id: 'poison',
  targetId,
  priority: 10,
  animations: [
    { type: 'shake', targetId, duration: 300 },
    { type: 'damage-number', targetId, duration: 1000, data: { value: -damage } }
  ],
  apply: async (context: BattleContext) => {
    const result = applyPoisonDamage(context, targetId, damage)
    return result.stateChanges
  }
})

/**
 * Creates a regeneration effect that heals over time
 *
 * REFACTORED: Uses applyRegenerationHealing applicator
 */
export const createRegenerationEffect = (targetId: number, healing: number = 5): Effect => ({
  id: 'regeneration',
  targetId,
  priority: 5,
  animations: [
    { type: 'healing', targetId, duration: 800 },
    { type: 'damage-number', targetId, duration: 1000, data: { value: healing } }
  ],
  apply: async (context: BattleContext) => {
    const result = applyRegenerationHealing(context, targetId, healing)
    return result.stateChanges
  }
})

/**
 * Creates a buff effect that increases attack power
 *
 * REFACTORED: Uses applyStatModification applicator
 */
export const createAttackBuffEffect = (targetId: number, attackBonus: number = 5): Effect => ({
  id: 'attack-buff',
  targetId,
  priority: 15,
  animations: [
    { type: 'status-apply', targetId, duration: 600, data: { statusType: 'buff' } }
  ],
  apply: async (context: BattleContext) => {
    const result = applyStatModification(
      context,
      targetId,
      'attack',
      attackBonus,
      'BUFF',
      3,
      'attack-buff'
    )
    return result.stateChanges
  }
})

/**
 * Creates a defense buff effect
 *
 * REFACTORED: Uses applyStatModification applicator
 */
export const createDefenseBuffEffect = (targetId: number, defenseBonus: number = 5): Effect => ({
  id: 'defense-buff',
  targetId,
  priority: 15,
  animations: [
    { type: 'status-apply', targetId, duration: 600, data: { statusType: 'buff' } }
  ],
  apply: async (context: BattleContext) => {
    const result = applyStatModification(
      context,
      targetId,
      'defense',
      defenseBonus,
      'DEFENSE_BUFF',
      3,
      'defense-buff'
    )
    return result.stateChanges
  }
})

/**
 * Creates a stun effect that prevents action
 *
 * REFACTORED: Uses applyStunEffect applicator
 */
export const createStunEffect = (targetId: number, duration: number = 2): Effect => ({
  id: 'stun',
  targetId,
  priority: 20,
  animations: [
    { type: 'status-apply', targetId, duration: 800, data: { statusType: 'debuff' } }
  ],
  apply: async (context: BattleContext) => {
    const result = applyStunEffect(context, targetId, duration)
    return result.stateChanges
  }
})
