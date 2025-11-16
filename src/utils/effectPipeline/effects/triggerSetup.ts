// Trigger Setup - Configures all the default trigger rules for effect cascading
import { registerEffectTrigger, getCreatureFromContext, getAliveCreaturesByOwner, clearAllTriggers } from '../effectResolver'
import { createBurnEffect, createPoisonEffect } from '../factories'
import { createDeathEffect } from '../factories'
import { resolveTargets, TargetSelector } from '../targetResolver'
import { Effect } from '../types'

// Battle-wide tracking flags
// NOTE: These persist across trigger re-registrations but reset on module reload
let firstBloodTriggered = false

/**
 * Resets battle-wide tracking flags (call when starting a new battle)
 */
export const resetBattleTracking = (): void => {
  firstBloodTriggered = false
  console.log('🔄 Battle tracking flags reset')
}

/**
 * Sets up all default trigger rules for effect cascading
 * Call this once when initializing the battle system
 * 
 * IMPORTANT: Clears all existing triggers first to prevent duplicates
 * when called multiple times (e.g., React Strict Mode, hot reload)
 */
export const setupDefaultTriggers = (): void => {
  console.log('🎯 Setting up default effect triggers')
  
  // Clear any previously registered triggers to prevent duplicates
  clearAllTriggers()

  setupDeathTriggers()
  setupStatusSpreadTriggers()
  setupChainReactionTriggers()
  setupCombatTriggers()
  setupPassiveAbilityTriggers()

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
 * 
 * Example: "Outbreak" passive ability
 * - Can be attached to creatures as passive ability
 * - Can be triggered by attacks
 * - Can be response to damage
 * 
 * To use as passive ability on a creature:
 * ```
 * passiveAbilities: [{
 *   id: 'outbreak',
 *   name: 'Outbreak',
 *   description: 'When you burn an enemy, 25% chance to spread to their ally',
 *   trigger: 'on_status_applied',
 *   effect: { type: 'spread_burn', chance: 0.25 }
 * }]
 * ```
 */
const setupStatusSpreadTriggers = (): void => {
  // Outbreak: Burn spread trigger (LOCAL SCOPE)
  // Only triggers when the creature WITH the "outbreak" passive gets burned
  // This demonstrates LOCAL scope - passive only affects the creature that has it
  registerEffectTrigger('STATUS_APPLIED', {
    condition: (change, context) => {
      // Only trigger for BURN status
      if (change.data.statusId !== 'BURN') return false
      
      // LOCAL SCOPE: Check if the burned creature has the "outbreak" passive
      const burnedCreature = getCreatureFromContext(context, change.creatureId)
      const hasOutbreakPassive = burnedCreature.passiveAbilities?.some(
        ability => ability.id === 'outbreak'
      )
      
      if (!hasOutbreakPassive) return false
      
      // If creature has outbreak passive, check probability
      const outbreakAbility = burnedCreature.passiveAbilities?.find(a => a.id === 'outbreak')
      const chance = outbreakAbility?.effect.chance ?? 0.25
      
      return Math.random() < chance
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
        console.log(`🦠 Outbreak! ${creature.name}'s passive spreads burn to ${randomTarget.name}`)
        
        // Get damage value from passive ability or default to 3
        const outbreakAbility = creature.passiveAbilities?.find(a => a.id === 'outbreak')
        const spreadDamage = outbreakAbility?.effect.value ?? 3
        
        return createBurnEffect(randomTarget.ID, spreadDamage)
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
        timestamp: Date.now(),
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
        timestamp: Date.now(),
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
        timestamp: Date.now(),
        data: {}
      }
    },
    priority: 10
  })

  // First blood trigger - tracks the FIRST damage dealt to ANY creature in the battle
  // Purely for logging/tracking, no gameplay effect (yet)
  registerEffectTrigger('HEALTH_CHANGE', {
    condition: (change, context) => {
      return !firstBloodTriggered && change.data.delta < 0 // First damage dealt in entire battle
    },
    createEffect: (change, context) => {
      firstBloodTriggered = true
      const creature = getCreatureFromContext(context, change.creatureId)
      console.log(`🩸 First blood: ${creature.name} takes the first damage in this battle!`)

      // Return a no-op effect (no gameplay effect, just tracking)
      return {
        id: 'first-blood-marker',
        type: 'NO_OP',
        targetId: change.creatureId,
        priority: 5,
        timestamp: Date.now(),
        data: {}
      }
    },
    priority: 5
  })
}

/**
 * Sets up triggers for passive abilities (thorns, counter-attack, etc.)
 */
const setupPassiveAbilityTriggers = (): void => {
  
  // ============================================================================
  // ON_DAMAGED TRIGGERS - When THIS creature takes damage
  // ============================================================================
  // Examples: Stone Thorns (counter-attack), Poison Skin (apply poison to attacker)
  // Condition: change.creatureId must be the creature with the passive
  registerEffectTrigger('HEALTH_CHANGE', {
    condition: (change, context) => {
      // Only trigger on damage (negative delta)
      if (change.data.delta >= 0) return false
      
      // Must have a source creature ID (attacker)
      if (!change.data.sourceCreatureId) return false
      
      const damagedCreature = getCreatureFromContext(context, change.creatureId)
      
      // Check if THIS creature (the one damaged) has on_damaged passive abilities
      return damagedCreature.passiveAbilities?.some(ability => 
        ability.trigger === 'on_damaged'
      ) ?? false
    },
    createEffect: (change, context) => {
      const damagedCreature = getCreatureFromContext(context, change.creatureId)
      
      // Find the first on_damaged passive ability
      const passiveAbility = damagedCreature.passiveAbilities?.find(ability => 
        ability.trigger === 'on_damaged'
      )
      
      if (!passiveAbility) {
        return {
          id: 'no-op',
          type: 'NO_OP',
          targetId: change.creatureId,
          priority: 0,
          timestamp: Date.now(),
          data: {}
        }
      }
      
      // Check if ability triggers (based on chance)
      const chance = passiveAbility.effect.chance ?? 1.0
      if (Math.random() > chance) {
        console.log(`🎲 ${damagedCreature.name}'s ${passiveAbility.name} failed to trigger (${Math.round(chance * 100)}% chance)`)
        return {
          id: 'no-op',
          type: 'NO_OP',
          targetId: change.creatureId,
          priority: 0,
          timestamp: Date.now(),
          data: {}
        }
      }
      
      console.log(`🌿 ${damagedCreature.name}'s ${passiveAbility.name} triggered!`)
      
      // Map old targetType to new targetSelector for backward compatibility
      const selector: TargetSelector = passiveAbility.effect.targetSelector 
        ?? mapTargetTypeToSelector(passiveAbility.effect.targetType, 'on_damaged')
      
      // Resolve targets using universal resolver
      const targetIds = resolveTargets({
        selector,
        context,
        sourceCreatureId: damagedCreature.ID,
        triggerChange: change
      })
      
      // Create effects for each target
      const effects: Effect[] = targetIds.map(targetId => {
        // Create effect based on ability type
        switch (passiveAbility.effect.type) {
          case 'poison':
            return createPoisonEffect(targetId, passiveAbility.effect.value ?? 5)
          
          case 'damage':
            return {
              id: 'counter-damage',
              type: 'TRUE_DAMAGE',
              targetId,
              priority: 55,
              timestamp: Date.now(),
              data: {
                attackerId: damagedCreature.ID,
                damage: passiveAbility.effect.value ?? 10
              }
            }
          
          case 'burn':
            return createBurnEffect(targetId, passiveAbility.effect.value ?? 5)
          
          default:
            console.warn(`⚠️ Unknown passive ability effect type: ${passiveAbility.effect.type}`)
            return {
              id: 'no-op',
              type: 'NO_OP',
              targetId,
              priority: 0,
              timestamp: Date.now(),
              data: {}
            }
        }
      })
      
      // Return first effect (for now, multi-effect support can be added later)
      return effects[0] ?? {
        id: 'no-op',
        type: 'NO_OP',
        targetId: change.creatureId,
        priority: 0,
        timestamp: Date.now(),
        data: {}
      }
    },
    priority: 60 // High priority to trigger soon after damage
  })

  // ============================================================================
  // ON_ATTACK TRIGGERS - When THIS creature deals damage
  // ============================================================================
  // Examples: Lifesteal (heal when attacking), Poison on Hit (apply poison when attacking)
  // Condition: change.data.sourceCreatureId must be the creature with the passive
  registerEffectTrigger('HEALTH_CHANGE', {
    condition: (change, context) => {
      // Only trigger on damage (negative delta)
      if (change.data.delta >= 0) return false
      
      // Must have a source creature ID (attacker)
      if (!change.data.sourceCreatureId) return false
      
      const attackerCreature = getCreatureFromContext(context, change.data.sourceCreatureId)
      
      // Check if the ATTACKER (not the damaged creature) has on_attack passive abilities
      return attackerCreature.passiveAbilities?.some(ability => 
        ability.trigger === 'on_attack'
      ) ?? false
    },
    createEffect: (change, context) => {
      const attackerId = change.data.sourceCreatureId!
      const attackerCreature = getCreatureFromContext(context, attackerId)
      
      // Find the first on_attack passive ability
      const passiveAbility = attackerCreature.passiveAbilities?.find(ability => 
        ability.trigger === 'on_attack'
      )
      
      if (!passiveAbility) {
        return {
          id: 'no-op',
          type: 'NO_OP',
          targetId: attackerId,
          priority: 0,
          timestamp: Date.now(),
          data: {}
        }
      }
      
      // Check if ability triggers (based on chance)
      const chance = passiveAbility.effect.chance ?? 1.0
      if (Math.random() > chance) {
        console.log(`🎲 ${attackerCreature.name}'s ${passiveAbility.name} failed to trigger (${Math.round(chance * 100)}% chance)`)
        return {
          id: 'no-op',
          type: 'NO_OP',
          targetId: attackerId,
          priority: 0,
          timestamp: Date.now(),
          data: {}
        }
      }
      
      console.log(`⚔️ ${attackerCreature.name}'s ${passiveAbility.name} triggered!`)
      
      // Map old targetType to new targetSelector for backward compatibility
      const selector: TargetSelector = passiveAbility.effect.targetSelector 
        ?? mapTargetTypeToSelector(passiveAbility.effect.targetType, 'on_attack')
      
      // Resolve targets using universal resolver
      const targetIds = resolveTargets({
        selector,
        context,
        sourceCreatureId: attackerId,
        triggerChange: change
      })
      
      // Create effects for each target
      const effects: Effect[] = targetIds.map(targetId => {
        // Create effect based on ability type
        switch (passiveAbility.effect.type) {
          case 'heal':
            // Lifesteal - heal based on damage dealt
            const damageDealt = Math.abs(change.data.delta)
            const healAmount = Math.floor(damageDealt * (passiveAbility.effect.value ?? 0.3))
            return {
              id: 'lifesteal-heal',
              type: 'HEAL',
              targetId,
              priority: 50,
              timestamp: Date.now(),
              data: {
                casterId: attackerId,
                healingAmount: healAmount
              }
            }
          
          case 'poison':
            return createPoisonEffect(change.creatureId, passiveAbility.effect.value ?? 5)
          
          case 'burn':
            return createBurnEffect(change.creatureId, passiveAbility.effect.value ?? 5)
          
          default:
            console.warn(`⚠️ Unknown on_attack passive ability effect type: ${passiveAbility.effect.type}`)
            return {
              id: 'no-op',
              type: 'NO_OP',
              targetId,
              priority: 0,
              timestamp: Date.now(),
              data: {}
            }
        }
      })
      
      // Return first effect (for now, multi-effect support can be added later)
      return effects[0] ?? {
        id: 'no-op',
        type: 'NO_OP',
        targetId: attackerId,
        priority: 0,
        timestamp: Date.now(),
        data: {}
      }
    },
    priority: 55 // Slightly lower priority than on_damaged
  })
  
  console.log('✅ Passive ability triggers configured')
}

/**
 * Clears all triggers and resets (useful for testing)
 */
export const resetTriggers = (): void => {
  // You would implement clearAllTriggers in effectResolver.ts
  console.log('🗑️ Resetting all triggers')
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Maps old targetType to new TargetSelector for backward compatibility
 */
const mapTargetTypeToSelector = (
  targetType: 'attacker' | 'self' | 'all_enemies' | 'all_allies' | 'random_enemy' | undefined,
  triggerContext: 'on_damaged' | 'on_attack'
): TargetSelector => {
  if (!targetType) {
    // Default based on trigger context
    return triggerContext === 'on_damaged' ? 'trigger_source' : 'self'
  }
  
  switch (targetType) {
    case 'attacker':
      return 'trigger_source'
    case 'self':
      return 'self'
    case 'all_enemies':
      return 'all_enemies'
    case 'all_allies':
      return 'all_allies'
    case 'random_enemy':
      return 'random_enemy'
    default:
      return 'self'
  }
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