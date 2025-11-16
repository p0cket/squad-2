// Effect Handlers - Calculate results for different effect types
// New naming: calc* for calculations, apply* for simple applications, handle* for complex logic

import { Effect, EffectResult, BattleContext, StateChange, HealthChange } from './types'
import { Attack, Creature } from '../../consts/types/types'
import { getCreatureFromContext } from './effectResolver'

/**
 * Helper: Calculate actual damage after defense
 */
export const calculateDamageAfterDefense = (
  baseDamage: number,
  attackBonus: number,
  defense: number
): number => {
  const totalDamage = baseDamage + attackBonus
  return Math.max(1, totalDamage - defense)
}

/**
 * Helper: Calculate actual healing (capped at max health)
 */
export const calculateActualHealing = (
  healingAmount: number,
  currentHealth: number,
  maxHealth: number
): number => {
  return Math.min(healingAmount, maxHealth - currentHealth)
}

/**
 * Helper: Clamp health between 0 and max
 */
export const clampHealth = (health: number, maxHealth: number): number => {
  return Math.max(0, Math.min(maxHealth, health))
}

/**
 * Handler: Calculate damage for basic attacks
 * Renamed from: applyAttackEffect
 */
export const calcDamage = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectResult> => {
  const { attackerId, attack } = effect.data
  const targetId = effect.targetId

  const attacker = getCreatureFromContext(context, attackerId)
  const target = getCreatureFromContext(context, targetId)

  // Calculate damage components
  const baseDmg = attack.damage
  const atkBonus = attacker.attack
  const defVal = target.defense
  const totalDmg = baseDmg + atkBonus
  const finalDmg = Math.max(1, totalDmg - defVal)
  const newHP = clampHealth(target.health - finalDmg, target.maxHealth)

  console.log(`⚔️ Attack: ${attacker.name} attacks ${target.name} for ${finalDmg} damage (${target.health} → ${newHP})`)

  // Build damage breakdown for display
  const dmgBreakdown: Array<{ label: string; value: number; color?: string }> = []
  if (baseDmg > 0) {
    dmgBreakdown.push({ label: attack.name, value: baseDmg, color: '#fff' })
  }
  if (atkBonus > 0) {
    dmgBreakdown.push({ label: 'ATK', value: atkBonus, color: '#f44' })
  }
  if (defVal > 0) {
    dmgBreakdown.push({ label: 'DEF', value: -defVal, color: '#44f' })
  }
  dmgBreakdown.push({ label: 'Total', value: finalDmg, color: '#ff0' })

  // Build animations
  const anims = [
    { type: 'windup', targetId: attackerId, duration: 600, data: { attackName: attack.name } },
    { type: 'impact', targetId, duration: 300, data: { element: attack.element } },
    ...dmgBreakdown.map((step, i) => ({
      type: 'dmgNum',
      targetId,
      duration: 1500,
      data: { ...step, delay: i * 200 }
    }))
  ]

  // Build state changes
  const changes: StateChange[] = [
    {
      type: 'HEALTH_CHANGE',
      creatureId: targetId,
      timestamp: Date.now(),
      data: {
        delta: -finalDmg,
        newHealth: newHP,
        source: `attack-${attack.name}`
      }
    } as HealthChange
  ]

  return { changes, anims }
}

/**
 * Handler: Calculate true damage (ignores defense)
 * Renamed from: applyTrueDamageAttackEffect
 */
export const calcTrueDamage = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectResult> => {
  const { attackerId, damage } = effect.data
  const targetId = effect.targetId

  const attacker = getCreatureFromContext(context, attackerId)
  const target = getCreatureFromContext(context, targetId)

  const finalDmg = damage
  const newHP = clampHealth(target.health - finalDmg, target.maxHealth)

  console.log(`💥 True Damage: ${attacker.name} hits ${target.name} for ${finalDmg} true damage`)

  const anims = [
    { type: 'impact', targetId, duration: 300, data: { trueDamage: true } },
    { type: 'dmgNum', targetId, duration: 1500, data: { label: 'True Damage', value: finalDmg, color: '#f0f' } }
  ]

  const changes: StateChange[] = [
    {
      type: 'HEALTH_CHANGE',
      creatureId: targetId,
      timestamp: Date.now(),
      data: {
        delta: -finalDmg,
        newHealth: newHP,
        source: 'true-damage'
      }
    } as HealthChange
  ]

  return { changes, anims }
}

/**
 * Handler: Calculate healing
 * Renamed from: applyHealingEffect
 */
export const calcHealing = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectResult> => {
  const { casterId, healingAmount } = effect.data
  const targetId = effect.targetId

  const target = getCreatureFromContext(context, targetId)

  const actualHeal = calculateActualHealing(healingAmount, target.health, target.maxHealth)
  const newHP = target.health + actualHeal

  console.log(`💚 Healing: ${target.name} healed for ${actualHeal} (${target.health} → ${newHP})`)

  const anims = [
    { type: 'heal', targetId, duration: 800, data: {} },
    { type: 'healNum', targetId, duration: 1500, data: { label: 'Heal', value: actualHeal, color: '#0f0' } }
  ]

  const changes: StateChange[] = [
    {
      type: 'HEALTH_CHANGE',
      creatureId: targetId,
      timestamp: Date.now(),
      data: {
        delta: actualHeal,
        newHealth: newHP,
        source: 'healing'
      }
    } as HealthChange
  ]

  return { changes, anims }
}

/**
 * Handler: Calculate life drain (damage + heal)
 * Renamed from: applyLifeDrainEffect
 */
export const calcLifeDrain = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectResult> => {
  const { attackerId, drainAmount } = effect.data
  const targetId = effect.targetId

  const attacker = getCreatureFromContext(context, attackerId)
  const target = getCreatureFromContext(context, targetId)

  // Damage target
  const finalDmg = drainAmount
  const targetNewHP = clampHealth(target.health - finalDmg, target.maxHealth)

  // Heal attacker
  const actualHeal = calculateActualHealing(drainAmount, attacker.health, attacker.maxHealth)
  const attackerNewHP = attacker.health + actualHeal

  console.log(`🩸 Life Drain: ${attacker.name} drains ${finalDmg} from ${target.name}`)

  const anims = [
    { type: 'lifeDrain', targetId, duration: 800, data: { attackerId } },
    { type: 'dmgNum', targetId, duration: 1500, data: { label: 'Drain', value: finalDmg, color: '#a0f' } },
    { type: 'healNum', targetId: attackerId, duration: 1500, data: { label: '+Life', value: actualHeal, color: '#0f0' } }
  ]

  const changes: StateChange[] = [
    {
      type: 'HEALTH_CHANGE',
      creatureId: targetId,
      timestamp: Date.now(),
      data: { delta: -finalDmg, newHealth: targetNewHP, source: 'life-drain' }
    } as HealthChange,
    {
      type: 'HEALTH_CHANGE',
      creatureId: attackerId,
      timestamp: Date.now(),
      data: { delta: actualHeal, newHealth: attackerNewHP, source: 'life-drain-heal' }
    } as HealthChange
  ]

  return { changes, anims }
}

/**
 * Handler: Calculate burn damage
 * Renamed from: applyBurnEffect
 */
export const calcBurn = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectResult> => {
  const { damage } = effect.data
  const targetId = effect.targetId

  const target = getCreatureFromContext(context, targetId)

  const finalDmg = damage || 5
  const newHP = clampHealth(target.health - finalDmg, target.maxHealth)

  console.log(`🔥 Burn: ${target.name} takes ${finalDmg} burn damage`)

  const anims = [
    { type: 'burn', targetId, duration: 500, data: {} },
    { type: 'dmgNum', targetId, duration: 1500, data: { label: 'Burn', value: finalDmg, color: '#f80' } }
  ]

  const changes: StateChange[] = [
    {
      type: 'HEALTH_CHANGE',
      creatureId: targetId,
      timestamp: Date.now(),
      data: { delta: -finalDmg, newHealth: newHP, source: 'burn' }
    } as HealthChange
  ]

  return { changes, anims }
}

/**
 * Handler: Calculate poison damage
 * Renamed from: applyPoisonEffect
 */
export const calcPoison = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectResult> => {
  const { damage } = effect.data
  const targetId = effect.targetId

  const target = getCreatureFromContext(context, targetId)

  const finalDmg = damage || 3
  const newHP = clampHealth(target.health - finalDmg, target.maxHealth)

  console.log(`☠️ Poison: ${target.name} takes ${finalDmg} poison damage`)

  const anims = [
    { type: 'poison', targetId, duration: 500, data: {} },
    { type: 'dmgNum', targetId, duration: 1500, data: { label: 'Poison', value: finalDmg, color: '#0f0' } }
  ]

  const changes: StateChange[] = [
    {
      type: 'HEALTH_CHANGE',
      creatureId: targetId,
      timestamp: Date.now(),
      data: { delta: -finalDmg, newHealth: newHP, source: 'poison' }
    } as HealthChange
  ]

  return { changes, anims }
}

/**
 * Handler: Calculate regeneration healing
 * Renamed from: applyRegenerationEffect
 */
export const calcRegeneration = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectResult> => {
  const { healAmount } = effect.data
  const targetId = effect.targetId

  const target = getCreatureFromContext(context, targetId)

  const actualHeal = calculateActualHealing(healAmount || 5, target.health, target.maxHealth)
  const newHP = target.health + actualHeal

  console.log(`✨ Regeneration: ${target.name} regenerates ${actualHeal} HP`)

  const anims = [
    { type: 'regen', targetId, duration: 800, data: {} },
    { type: 'healNum', targetId, duration: 1500, data: { label: 'Regen', value: actualHeal, color: '#0ff' } }
  ]

  const changes: StateChange[] = [
    {
      type: 'HEALTH_CHANGE',
      creatureId: targetId,
      timestamp: Date.now(),
      data: { delta: actualHeal, newHealth: newHP, source: 'regeneration' }
    } as HealthChange
  ]

  return { changes, anims }
}

/**
 * Handler: Handle death (no calculation, just triggers)
 * Renamed from: applyDeathEffect
 */
export const handleDeath = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectResult> => {
  const targetId = effect.targetId
  const target = getCreatureFromContext(context, targetId)

  console.log(`💀 Death: ${target.name} has died`)

  const anims = [
    { type: 'death', targetId, duration: 1000, data: {} }
  ]

  const changes: StateChange[] = [
    {
      type: 'CREATURE_DIED',
      creatureId: targetId,
      timestamp: Date.now(),
      data: { reason: 'hp-zero' }
    }
  ]

  return { changes, anims }
}

// ============================================================================
// BACKWARDS COMPATIBILITY - Old function names
// ============================================================================

/**
 * @deprecated Use calcDamage() instead
 */
export const applyAttackEffect = async (effect: Effect, context: BattleContext) => {
  console.warn('⚠️ applyAttackEffect() is deprecated. Use calcDamage() instead.')
  const result = await calcDamage(effect, context)
  return {
    stateChanges: result.changes,
    animations: result.anims
  }
}

/**
 * @deprecated Use calcTrueDamage() instead
 */
export const applyTrueDamageAttackEffect = async (effect: Effect, context: BattleContext) => {
  console.warn('⚠️ applyTrueDamageAttackEffect() is deprecated. Use calcTrueDamage() instead.')
  const result = await calcTrueDamage(effect, context)
  return {
    stateChanges: result.changes,
    animations: result.anims
  }
}

/**
 * @deprecated Use calcHealing() instead
 */
export const applyHealingEffect = async (effect: Effect, context: BattleContext) => {
  console.warn('⚠️ applyHealingEffect() is deprecated. Use calcHealing() instead.')
  const result = await calcHealing(effect, context)
  return {
    stateChanges: result.changes,
    animations: result.anims
  }
}

/**
 * @deprecated Use calcLifeDrain() instead
 */
export const applyLifeDrainEffect = async (effect: Effect, context: BattleContext) => {
  console.warn('⚠️ applyLifeDrainEffect() is deprecated. Use calcLifeDrain() instead.')
  const result = await calcLifeDrain(effect, context)
  return {
    stateChanges: result.changes,
    animations: result.anims
  }
}

/**
 * @deprecated Use calcBurn() instead
 */
export const applyBurnEffect = async (effect: Effect, context: BattleContext) => {
  console.warn('⚠️ applyBurnEffect() is deprecated. Use calcBurn() instead.')
  const result = await calcBurn(effect, context)
  return {
    stateChanges: result.changes,
    animations: result.anims
  }
}

/**
 * @deprecated Use calcPoison() instead
 */
export const applyPoisonEffect = async (effect: Effect, context: BattleContext) => {
  console.warn('⚠️ applyPoisonEffect() is deprecated. Use calcPoison() instead.')
  const result = await calcPoison(effect, context)
  return {
    stateChanges: result.changes,
    animations: result.anims
  }
}

/**
 * @deprecated Use calcRegeneration() instead
 */
export const applyRegenerationEffect = async (effect: Effect, context: BattleContext) => {
  console.warn('⚠️ applyRegenerationEffect() is deprecated. Use calcRegeneration() instead.')
  const result = await calcRegeneration(effect, context)
  return {
    stateChanges: result.changes,
    animations: result.anims
  }
}

/**
 * @deprecated Use handleDeath() instead
 */
export const applyDeathEffect = async (effect: Effect, context: BattleContext) => {
  console.warn('⚠️ applyDeathEffect() is deprecated. Use handleDeath() instead.')
  const result = await handleDeath(effect, context)
  return {
    stateChanges: result.changes,
    animations: result.anims
  }
}
