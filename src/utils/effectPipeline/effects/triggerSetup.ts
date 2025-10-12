// Trigger Setup - Configures all the default trigger rules for effect cascading
import { registerEffectTrigger, getCreatureFromContext, getAliveCreaturesByOwner } from '../effectResolver'
import { createBurnEffect, createPoisonEffect } from './statusEffects'
import { createDeathEffect } from './combatEffects'
import { BattleContext, StateChange } from '../types'

/**
 * Sets up all default trigger rules for effect cascading
 * Call this once when initializing the battle system
 */
export const setupDefaultTriggers = (): void => {
  console.log('🎯 Setting up default effect triggers')

  setupDeathTriggers()
  setupStatusSpreadTriggers()
  setupChainReactionTriggers()
  setupCombatTriggers()

  console.log('✅ Default effect triggers configured')
}

/**
 * Sets up triggers related to creature death
 */
const setupDeathTriggers = (): void => {
  // Death trigger when health reaches 0
  registerEffectTrigger('HEALTH_CHANGE', {
    condition: (change, context) => {
      const creature = getCreatureFromContext(context, change.creatureId)
      return change.data.newHealth <= 0 && creature.health > 0 // Was alive, now dead
    },
    createEffect: (change, context) => {
      console.log(`💀 Death trigger activated for creature ${change.creatureId}`)
      return createDeathEffect(change.creatureId)
    },
    priority: 100
  })

  // Death rattle effects could be added here
  // registerEffectTrigger('CREATURE_DIED', {
  //   condition: (change, context) => {
  //     const creature = getCreatureFromContext(context, change.creatureId)
  //     return creature.template === 'explosive' // Example: explosive creatures
  //   },
  //   createEffect: (change, context) => createExplosionEffect(change.creatureId),
  //   priority: 90
  // })
}

/**
 * Sets up triggers for status effects that can spread
 */
const setupStatusSpreadTriggers = (): void => {
  // Burn spread trigger
  registerEffectTrigger('STATUS_APPLIED', {
    condition: (change, context) => {
      return change.data.statusId === 'BURN' && Math.random() < 0.25 // 25% chance
    },
    createEffect: (change, context) => {
      const creature = getCreatureFromContext(context, change.creatureId)
      const owner = creature.owner

      if (!owner || (owner !== 'player' && owner !== 'computer')) {
        return createBurnEffect(change.creatureId, 0) // No effect if invalid owner
      }

      const allies = getAliveCreaturesByOwner(context, owner)

      // Find a random ally to spread burn to
      const potentialTargets = allies.filter(c =>
        c.ID !== change.creatureId &&
        !c.statuses.some(s => s.id === 'BURN')
      )

      if (potentialTargets.length > 0) {
        const randomTarget = potentialTargets[Math.floor(Math.random() * potentialTargets.length)]
        console.log(`🔥 Burn spreads from ${creature.name} to ${randomTarget.name}`)
        return createBurnEffect(randomTarget.ID, 3) // Weaker spread damage
      }

      return createBurnEffect(change.creatureId, 0) // No effect if no valid targets
    },
    priority: 20
  })

  // Poison spread in certain conditions
  registerEffectTrigger('STATUS_APPLIED', {
    condition: (change, context) => {
      return change.data.statusId === 'POISON' && Math.random() < 0.15 // 15% chance
    },
    createEffect: (change, context) => {
      const creature = getCreatureFromContext(context, change.creatureId)

      if (!creature.owner || (creature.owner !== 'player' && creature.owner !== 'computer')) {
        return createPoisonEffect(change.creatureId, 0) // No effect if invalid owner
      }

      const owner = creature.owner === 'player' ? 'computer' : 'player' // Spread to enemies
      const enemies = getAliveCreaturesByOwner(context, owner)

      if (enemies.length > 0) {
        const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)]
        console.log(`🧪 Poison spreads from ${creature.name} to enemy ${randomEnemy.name}`)
        return createPoisonEffect(randomEnemy.ID, 5)
      }

      return createPoisonEffect(change.creatureId, 0) // No effect if no valid targets
    },
    priority: 20
  })
}

/**
 * Sets up triggers for chain reaction effects
 */
const setupChainReactionTriggers = (): void => {
  // Low health desperation trigger
  registerEffectTrigger('HEALTH_CHANGE', {
    condition: (change, context) => {
      const creature = getCreatureFromContext(context, change.creatureId)
      const healthPercentage = creature.health / creature.maxHealth
      return healthPercentage <= 0.25 && healthPercentage > 0 // Below 25% health
    },
    createEffect: (change, context) => {
      const creature = getCreatureFromContext(context, change.creatureId)
      console.log(`😤 ${creature.name} enters desperation mode!`)

      // Could create a rage buff or desperate attack
      return {
        id: 'desperation',
        type: 'STAT_BUFF',
        targetId: change.creatureId,
        priority: 30,
        data: {
          statName: 'attack',
          value: 10,
          source: 'desperation'
        }
      }
    },
    priority: 25
  })

  // Overkill trigger (when damage exceeds remaining health significantly)
  registerEffectTrigger('HEALTH_CHANGE', {
    condition: (change, context) => {
      if (change.data.delta >= 0) return false // Only for damage
      const creature = getCreatureFromContext(context, change.creatureId)
      const overkillDamage = Math.abs(change.data.delta) - creature.health
      return overkillDamage > 20 // Significant overkill
    },
    createEffect: (change, context) => {
      console.log(`💥 Overkill damage on creature ${change.creatureId}!`)

      // Could create splash damage or intimidation effects
      return {
        id: 'overkill',
        type: 'OVERKILL',
        targetId: change.creatureId,
        priority: 15,
        data: {}
      }
    },
    priority: 15
  })
}

/**
 * Sets up triggers related to combat flow
 */
const setupCombatTriggers = (): void => {
  // Status expiration trigger
  registerEffectTrigger('STATUS_REMOVED', {
    condition: (change, context) => {
      return change.data.statusId === 'STUN'
    },
    createEffect: (change, context) => {
      const creature = getCreatureFromContext(context, change.creatureId)
      console.log(`⚡ ${creature.name} recovers from stun`)

      // Could add a recovery effect
      return {
        id: 'stun-recovery',
        type: 'STUN_RECOVERY',
        targetId: change.creatureId,
        priority: 10,
        data: {}
      }
    },
    priority: 10
  })

  // First blood trigger (first creature to take damage in battle)
  let firstBloodTriggered = false
  registerEffectTrigger('HEALTH_CHANGE', {
    condition: (change, context) => {
      return !firstBloodTriggered && change.data.delta < 0 // First damage dealt
    },
    createEffect: (change, context) => {
      firstBloodTriggered = true
      const creature = getCreatureFromContext(context, change.creatureId)
      console.log(`🩸 First blood: ${creature.name} takes the first damage!`)

      return {
        id: 'first-blood',
        type: 'FIRST_BLOOD',
        targetId: change.creatureId,
        priority: 5,
        data: {}
      }
    },
    priority: 5
  })
}

/**
 * Clears all triggers and resets (useful for testing)
 */
export const resetTriggers = (): void => {
  // You would implement clearAllTriggers in effectResolver.ts
  console.log('🗑️ Resetting all triggers')
}

/**
 * Sets up custom triggers for specific creature types or abilities
 */
export const setupCustomTriggers = (customRules: any[]): void => {
  console.log(`🎯 Setting up ${customRules.length} custom triggers`)

  customRules.forEach(rule => {
    registerEffectTrigger(rule.changeType, rule.triggerRule)
  })

  console.log('✅ Custom triggers configured')
}