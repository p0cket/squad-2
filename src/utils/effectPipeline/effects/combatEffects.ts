// Combat Effect Definitions - Effects related to attacks and combat actions
import { Effect, StateChange, BattleContext, HealthChange } from '../types'
import { getCreatureFromContext } from '../effectResolver'
import { Attack } from '../../../consts/types/types'

/**
 * Creates a basic attack effect
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
    apply: async (context: BattleContext): Promise<StateChange[]> => {
      const attacker = getCreatureFromContext(context, attackerId)
      const target = getCreatureFromContext(context, targetId)

      // Calculate damage components
      const baseAttackDamage = attack.damage
      const attackerBonus = attacker.attack
      const totalDamage = baseAttackDamage + attackerBonus
      const defense = target.defense
      const actualDamage = Math.max(1, totalDamage - defense)
      const newHealth = Math.max(0, target.health - actualDamage)

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

      // Set animations now that we have calculated values
      effect.animations = [
        { type: 'attack-windup', targetId: attackerId, duration: 600 },
        { type: 'impact', targetId, duration: 300 },
        ...damageBreakdown.map((breakdown, index) => ({
          type: 'damage-number',
          targetId,
          duration: 1500, // How long damage number is visible
          data: {
            value: breakdown.value,
            label: breakdown.label,
            isTotal: breakdown.label === 'Total Damage',
            delay: index * 200 // Stagger between damage numbers (200ms)
          }
        }))
      ]

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

      return [healthChange]
    }
  }

  return effect
}

/**
 * Creates a true damage attack effect (ignores defense)
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
  apply: async (context: BattleContext): Promise<StateChange[]> => {
    const attacker = getCreatureFromContext(context, attackerId)
    const target = getCreatureFromContext(context, targetId)

    const newHealth = Math.max(0, target.health - damage)

    console.log(`💥 True Damage: ${attacker.name} deals ${damage} true damage to ${target.name} (${target.health} → ${newHealth})`)

    const healthChange: HealthChange = {
      type: 'HEALTH_CHANGE',
      creatureId: targetId,
      timestamp: Date.now(),
      data: {
        delta: -damage,
        newHealth,
        source: 'true-damage'
      }
    }

    return [healthChange]
  }
})

/**
 * Creates a healing effect
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
  apply: async (context: BattleContext): Promise<StateChange[]> => {
    const caster = getCreatureFromContext(context, casterId)
    const target = getCreatureFromContext(context, targetId)

    const actualHealing = Math.min(healingAmount, target.maxHealth - target.health)
    const newHealth = target.health + actualHealing

    console.log(`💚 Healing: ${caster.name} heals ${target.name} for ${actualHealing} HP (${target.health} → ${newHealth})`)

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

    return [healthChange]
  }
})

/**
 * Creates a death effect that handles creature death
 */
export const createDeathEffect = (creatureId: number): Effect => ({
  id: 'death',
  targetId: creatureId,
  priority: 100, // Highest priority
  animations: [
    { type: 'death-animation', targetId: creatureId, duration: 2000 }
  ],
  apply: async (context: BattleContext): Promise<StateChange[]> => {
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
        fromPosition: 0, // Assume they were active
        toPosition: 'back',
        reason: 'death'
      }
    }

    return [deathChange, movementChange]
  }
})

/**
 * Creates a life drain effect that damages target and heals attacker
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
  apply: async (context: BattleContext): Promise<StateChange[]> => {
    const attacker = getCreatureFromContext(context, attackerId)
    const target = getCreatureFromContext(context, targetId)

    const actualDrain = Math.min(drainAmount, target.health)
    const actualHealing = Math.min(actualDrain, attacker.maxHealth - attacker.health)

    const targetNewHealth = target.health - actualDrain
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

    return [targetHealthChange, attackerHealthChange]
  }
})

/**
 * Creates an area of effect attack
 */
export const createAoeAttackEffect = (
  attackerId: number,
  targetIds: number[],
  damage: number
): Effect => ({
  id: 'aoe-attack',
  targetId: targetIds[0], // Primary target for animation purposes
  priority: 45,
  animations: [
    { type: 'attack-windup', targetId: attackerId, duration: 800 },
    ...targetIds.map(id => ({ type: 'impact', targetId: id, duration: 300 })),
    ...targetIds.map(id => ({ type: 'damage-number', targetId: id, duration: 1200, data: { value: -damage } }))
  ],
  apply: async (context: BattleContext): Promise<StateChange[]> => {
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
            source: 'aoe-attack'
          }
        }

        changes.push(healthChange)
      } catch (error) {
        console.warn(`⚠️ Could not find target ${targetId} for AoE attack`)
      }
    })

    return changes
  }
})