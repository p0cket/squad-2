// Status Effect Definitions - Pure effect functions for common status effects
import { Effect, StateChange, BattleContext, HealthChange } from '../types'
import { getCreatureFromContext } from '../effectResolver'

/**
 * Creates a burn effect that deals damage over time
 */
export const createBurnEffect = (targetId: number, damage: number = 5): Effect => ({
  id: 'burn',
  targetId,
  priority: 10,
  animations: [
    { type: 'burn', targetId, duration: 500 },
    { type: 'damage-number', targetId, duration: 1000, data: { value: -damage } }
  ],
  apply: async (context: BattleContext): Promise<StateChange[]> => {
    const creature = getCreatureFromContext(context, targetId)
    const actualDamage = Math.min(damage, creature.health)
    const newHealth = creature.health - actualDamage

    console.log(`🔥 Burn effect: ${creature.name} takes ${actualDamage} damage (${creature.health} → ${newHealth})`)

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

    return [healthChange, statusChange]
  }
})

/**
 * Creates a poison effect that deals damage over time
 */
export const createPoisonEffect = (targetId: number, damage: number = 10): Effect => ({
  id: 'poison',
  targetId,
  priority: 10,
  animations: [
    { type: 'shake', targetId, duration: 300 },
    { type: 'damage-number', targetId, duration: 1000, data: { value: -damage } }
  ],
  apply: async (context: BattleContext): Promise<StateChange[]> => {
    const creature = getCreatureFromContext(context, targetId)
    const actualDamage = Math.min(damage, creature.health)
    const newHealth = creature.health - actualDamage

    console.log(`🧪 Poison effect: ${creature.name} takes ${actualDamage} poison damage (${creature.health} → ${newHealth})`)

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

    return [healthChange, statusChange]
  }
})

/**
 * Creates a regeneration effect that heals over time
 */
export const createRegenerationEffect = (targetId: number, healing: number = 5): Effect => ({
  id: 'regeneration',
  targetId,
  priority: 5,
  animations: [
    { type: 'healing', targetId, duration: 800 },
    { type: 'damage-number', targetId, duration: 1000, data: { value: healing } }
  ],
  apply: async (context: BattleContext): Promise<StateChange[]> => {
    const creature = getCreatureFromContext(context, targetId)
    const actualHealing = Math.min(healing, creature.maxHealth - creature.health)
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

    return [healthChange]
  }
})

/**
 * Creates a buff effect that increases attack power
 */
export const createAttackBuffEffect = (targetId: number, attackBonus: number = 5): Effect => ({
  id: 'attack-buff',
  targetId,
  priority: 15,
  animations: [
    { type: 'status-apply', targetId, duration: 600, data: { statusType: 'buff' } }
  ],
  apply: async (context: BattleContext): Promise<StateChange[]> => {
    const creature = getCreatureFromContext(context, targetId)

    console.log(`⚔️ Attack buff: ${creature.name} gains +${attackBonus} attack power`)

    const statChange: StateChange = {
      type: 'STAT_MODIFIED',
      creatureId: targetId,
      timestamp: Date.now(),
      data: {
        statName: 'attack',
        value: attackBonus,
        source: 'attack-buff'
      }
    }

    const statusChange: StateChange = {
      type: 'STATUS_APPLIED',
      creatureId: targetId,
      timestamp: Date.now(),
      data: {
        statusId: 'BUFF',
        duration: 3,
        source: 'attack-buff'
      }
    }

    return [statChange, statusChange]
  }
})

/**
 * Creates a defense buff effect
 */
export const createDefenseBuffEffect = (targetId: number, defenseBonus: number = 5): Effect => ({
  id: 'defense-buff',
  targetId,
  priority: 15,
  animations: [
    { type: 'status-apply', targetId, duration: 600, data: { statusType: 'buff' } }
  ],
  apply: async (context: BattleContext): Promise<StateChange[]> => {
    const creature = getCreatureFromContext(context, targetId)

    console.log(`🛡️ Defense buff: ${creature.name} gains +${defenseBonus} defense`)

    const statChange: StateChange = {
      type: 'STAT_MODIFIED',
      creatureId: targetId,
      timestamp: Date.now(),
      data: {
        statName: 'defense',
        value: defenseBonus,
        source: 'defense-buff'
      }
    }

    const statusChange: StateChange = {
      type: 'STATUS_APPLIED',
      creatureId: targetId,
      timestamp: Date.now(),
      data: {
        statusId: 'DEFENSE_BUFF',
        duration: 3,
        source: 'defense-buff'
      }
    }

    return [statChange, statusChange]
  }
})

/**
 * Creates a stun effect that prevents action
 */
export const createStunEffect = (targetId: number, duration: number = 2): Effect => ({
  id: 'stun',
  targetId,
  priority: 20, // High priority for crowd control
  animations: [
    { type: 'status-apply', targetId, duration: 800, data: { statusType: 'debuff' } }
  ],
  apply: async (context: BattleContext): Promise<StateChange[]> => {
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

    return [statusChange]
  }
})