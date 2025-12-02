// Effect Applicators - Pure functions that calculate state changes
// These are decoupled from Effect objects and can be tested independently

import { BattleContext, StateChange, HealthChange } from '../types'
import { Attack, Creature } from '../../../consts/types/types'
import { getCreatureFromContext } from '../effectResolver'
import { battleEventLogger } from '../eventLogger'

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
 * Applicator: Apply a basic attack
 */
export const applyAttackEffect = (
  context: BattleContext,
  attackerId: number,
  targetId: number,
  attack: Attack
): {
  stateChanges: StateChange[]
  damageBreakdown: Array<{ label: string; value: number }>
  actualDamage: number
  attacker: Creature
  target: Creature
} => {
  const attacker = getCreatureFromContext(context, attackerId)
  const target = getCreatureFromContext(context, targetId)

  // Calculate damage components
  const baseAttackDamage = attack.damage
  const attackerBonus = attacker.attack
  const defense = target.defense
  const actualDamage = calculateDamageAfterDefense(baseAttackDamage, attackerBonus, defense)
  const newHealth = clampHealth(target.health - actualDamage, target.maxHealth)

  console.log(`⚔️ Attack: ${attacker.name} attacks ${target.name} for ${actualDamage} damage (${target.health} → ${newHealth})`)

  // Build damage breakdown for display
  const damageBreakdown: Array<{ label: string; value: number }> = []
  if (baseAttackDamage > 0) {
    damageBreakdown.push({ label: `${attack.name}`, value: baseAttackDamage })
  }
  if (attackerBonus > 0) {
    damageBreakdown.push({ label: 'Attack Bonus', value: attackerBonus })
  }
  if (defense > 0) {
    damageBreakdown.push({ label: 'Defense', value: -defense })
  }
  damageBreakdown.push({ label: 'Total Damage', value: actualDamage })

  const healthChange: HealthChange = {
    type: 'HEALTH_CHANGE',
    creatureId: targetId,
    timestamp: Date.now(),
    data: {
      delta: -actualDamage,
      newHealth,
      source: `attack-${attack.name}`
    }
  }

  return {
    stateChanges: [healthChange],
    damageBreakdown,
    actualDamage,
    attacker,
    target
  }
}

/**
 * Applicator: Apply true damage (ignores defense)
 */
export const applyTrueDamageEffect = (
  context: BattleContext,
  attackerId: number,
  targetId: number,
  damage: number
): { stateChanges: StateChange[]; attacker: Creature; target: Creature } => {
  const attacker = getCreatureFromContext(context, attackerId)
  const target = getCreatureFromContext(context, targetId)

  const actualDamage = Math.min(damage, target.health)
  const newHealth = clampHealth(target.health - actualDamage, target.maxHealth)

  console.log(`💥 True Damage: ${attacker.name} deals ${actualDamage} true damage to ${target.name} (${target.health} → ${newHealth})`)

  const healthChange: HealthChange = {
    type: 'HEALTH_CHANGE',
    creatureId: targetId,
    timestamp: Date.now(),
    data: {
      delta: -actualDamage,
      newHealth,
      source: 'true-damage'
    }
  }

  return {
    stateChanges: [healthChange],
    attacker,
    target
  }
}

/**
 * Applicator: Apply healing
 */
export const applyHealingEffect = (
  context: BattleContext,
  casterId: number,
  targetId: number,
  healingAmount: number
): { stateChanges: StateChange[]; caster: Creature; target: Creature; actualHealing: number } => {
  const caster = getCreatureFromContext(context, casterId)
  const target = getCreatureFromContext(context, targetId)

  const actualHealing = calculateActualHealing(healingAmount, target.health, target.maxHealth)
  const newHealth = target.health + actualHealing

  console.log(`💚 Healing: ${caster.name} heals ${target.name} for ${actualHealing} HP (${target.health} → ${newHealth})`)
  
  // Log to battle timeline
  battleEventLogger.logHeal(target.name, actualHealing, caster.name)

  const healthChange: HealthChange = {
    type: 'HEALTH_CHANGE',
    creatureId: targetId,
    timestamp: Date.now(),
    data: {
      delta: actualHealing,
      newHealth,
      source: 'healing'
    }
  }

  return {
    stateChanges: [healthChange],
    caster,
    target,
    actualHealing
  }
}

/**
 * Applicator: Apply burn damage
 */
export const applyBurnDamage = (
  context: BattleContext,
  targetId: number,
  damage: number
): { stateChanges: StateChange[]; creature: Creature; actualDamage: number } => {
  const creature = getCreatureFromContext(context, targetId)
  const actualDamage = Math.min(damage, creature.health)
  const newHealth = clampHealth(creature.health - actualDamage, creature.maxHealth)

  console.log(`🔥 Burn effect: ${creature.name} takes ${actualDamage} damage (${creature.health} → ${newHealth})`)
  
  // Log to battle timeline
  battleEventLogger.logStatusTick(creature.name, 'Burn', actualDamage, false)

  const healthChange: HealthChange = {
    type: 'HEALTH_CHANGE',
    creatureId: targetId,
    timestamp: Date.now(),
    data: {
      delta: -actualDamage,
      newHealth,
      source: 'burn'
    }
  }

  const statusChange: StateChange = {
    type: 'STATUS_APPLIED',
    creatureId: targetId,
    timestamp: Date.now(),
    data: {
      statusId: 'BURN',
      duration: 3,
      source: 'burn'
    }
  }

  return {
    stateChanges: [healthChange, statusChange],
    creature,
    actualDamage
  }
}

/**
 * Applicator: Apply poison damage
 */
export const applyPoisonDamage = (
  context: BattleContext,
  targetId: number,
  damage: number
): { stateChanges: StateChange[]; creature: Creature; actualDamage: number } => {
  const creature = getCreatureFromContext(context, targetId)
  const actualDamage = Math.min(damage, creature.health)
  const newHealth = clampHealth(creature.health - actualDamage, creature.maxHealth)

  console.log(`🧪 Poison effect: ${creature.name} takes ${actualDamage} poison damage (${creature.health} → ${newHealth})`)
  
  // Log to battle timeline
  battleEventLogger.logStatusTick(creature.name, 'Poison', actualDamage, false)

  const healthChange: HealthChange = {
    type: 'HEALTH_CHANGE',
    creatureId: targetId,
    timestamp: Date.now(),
    data: {
      delta: -actualDamage,
      newHealth,
      source: 'poison'
    }
  }

  const statusChange: StateChange = {
    type: 'STATUS_APPLIED',
    creatureId: targetId,
    timestamp: Date.now(),
    data: {
      statusId: 'POISON',
      duration: 3,
      source: 'poison'
    }
  }

  return {
    stateChanges: [healthChange, statusChange],
    creature,
    actualDamage
  }
}

/**
 * Applicator: Apply regeneration healing
 */
export const applyRegenerationHealing = (
  context: BattleContext,
  targetId: number,
  healing: number
): { stateChanges: StateChange[]; creature: Creature; actualHealing: number } => {
  const creature = getCreatureFromContext(context, targetId)
  const actualHealing = calculateActualHealing(healing, creature.health, creature.maxHealth)
  const newHealth = creature.health + actualHealing

  console.log(`💚 Regeneration effect: ${creature.name} heals ${actualHealing} HP (${creature.health} → ${newHealth})`)

  const healthChange: HealthChange = {
    type: 'HEALTH_CHANGE',
    creatureId: targetId,
    timestamp: Date.now(),
    data: {
      delta: actualHealing,
      newHealth,
      source: 'regeneration'
    }
  }

  return {
    stateChanges: [healthChange],
    creature,
    actualHealing
  }
}

/**
 * Applicator: Apply stat modification
 */
export const applyStatModification = (
  context: BattleContext,
  targetId: number,
  statName: string,
  value: number,
  statusId: string,
  duration: number,
  source: string
): { stateChanges: StateChange[]; creature: Creature } => {
  const creature = getCreatureFromContext(context, targetId)

  console.log(`📊 Stat modification: ${creature.name} ${statName} ${value > 0 ? '+' : ''}${value}`)

  const statChange: StateChange = {
    type: 'STAT_MODIFIED',
    creatureId: targetId,
    timestamp: Date.now(),
    data: {
      statName,
      value,
      source
    }
  }

  const statusChange: StateChange = {
    type: 'STATUS_APPLIED',
    creatureId: targetId,
    timestamp: Date.now(),
    data: {
      statusId,
      duration,
      source
    }
  }

  return {
    stateChanges: [statChange, statusChange],
    creature
  }
}

/**
 * Applicator: Apply death
 */
export const applyDeathEffect = (
  context: BattleContext,
  creatureId: number
): { stateChanges: StateChange[]; creature: Creature } => {
  const creature = getCreatureFromContext(context, creatureId)

  console.log(`💀 Death: ${creature.name} has died`)

  const deathChange: StateChange = {
    type: 'CREATURE_DIED',
    creatureId,
    timestamp: Date.now(),
    data: {
      reason: 'health-depleted'
    }
  }

  const movementChange: StateChange = {
    type: 'CREATURE_MOVED',
    creatureId,
    timestamp: Date.now(),
    data: {
      fromPosition: 0,
      toPosition: 'back',
      reason: 'death'
    }
  }

  return {
    stateChanges: [deathChange, movementChange],
    creature
  }
}

/**
 * Applicator: Apply life drain (damage + heal)
 */
export const applyLifeDrainEffect = (
  context: BattleContext,
  attackerId: number,
  targetId: number,
  drainAmount: number
): {
  stateChanges: StateChange[]
  attacker: Creature
  target: Creature
  actualDrain: number
  actualHealing: number
} => {
  const attacker = getCreatureFromContext(context, attackerId)
  const target = getCreatureFromContext(context, targetId)

  const actualDrain = Math.min(drainAmount, target.health)
  const actualHealing = calculateActualHealing(actualDrain, attacker.health, attacker.maxHealth)

  const targetNewHealth = clampHealth(target.health - actualDrain, target.maxHealth)
  const attackerNewHealth = attacker.health + actualHealing

  console.log(`🩸 Life Drain: ${attacker.name} drains ${actualDrain} HP from ${target.name} and heals for ${actualHealing}`)

  const targetHealthChange: HealthChange = {
    type: 'HEALTH_CHANGE',
    creatureId: targetId,
    timestamp: Date.now(),
    data: {
      delta: -actualDrain,
      newHealth: targetNewHealth,
      source: 'life-drain'
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

  return {
    stateChanges: [targetHealthChange, attackerHealthChange],
    attacker,
    target,
    actualDrain,
    actualHealing
  }
}

/**
 * Applicator: Apply AoE attack to multiple targets
 */
export const applyAoeAttackEffect = (
  context: BattleContext,
  attackerId: number,
  targetIds: number[],
  damage: number
): { stateChanges: StateChange[]; attacker: Creature; hitCount: number } => {
  const attacker = getCreatureFromContext(context, attackerId)
  const changes: StateChange[] = []
  let hitCount = 0

  console.log(`💥 AoE Attack: ${attacker.name} attacks ${targetIds.length} targets for ${damage} damage each`)

  targetIds.forEach(targetId => {
    try {
      const target = getCreatureFromContext(context, targetId)
      const actualDamage = Math.min(damage, target.health)
      const newHealth = clampHealth(target.health - actualDamage, target.maxHealth)

      const healthChange: HealthChange = {
        type: 'HEALTH_CHANGE',
        creatureId: targetId,
        timestamp: Date.now(),
        data: {
          delta: -actualDamage,
          newHealth,
          source: 'aoe-attack'
        }
      }

      changes.push(healthChange)
      hitCount++
    } catch (error) {
      console.warn(`⚠️ Could not find target ${targetId} for AoE attack`)
    }
  })

  return {
    stateChanges: changes,
    attacker,
    hitCount
  }
}

/**
 * Applicator: Apply stun status
 */
export const applyStunEffect = (
  context: BattleContext,
  targetId: number,
  duration: number
): { stateChanges: StateChange[]; creature: Creature } => {
  const creature = getCreatureFromContext(context, targetId)

  console.log(`⚡ Stun effect: ${creature.name} is stunned for ${duration} turns`)

  const statusChange: StateChange = {
    type: 'STATUS_APPLIED',
    creatureId: targetId,
    timestamp: Date.now(),
    data: {
      statusId: 'STUN',
      duration,
      source: 'stun'
    }
  }

  return {
    stateChanges: [statusChange],
    creature
  }
}
