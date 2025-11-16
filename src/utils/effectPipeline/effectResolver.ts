// Effect Resolver - Manages trigger rules and resolves cascading effects
import { Effect, StateChange, BattleContext, TriggerRule } from './types'

// Global registry of trigger rules
const triggerRules = new Map<string, TriggerRule[]>()

/**
 * Resolves which effects should be triggered based on state changes
 */
export const resolveTriggeredEffects = (
  sourceEffect: Effect,
  stateChanges: StateChange[],
  context: BattleContext
): Effect[] => {
  const triggeredEffects: Effect[] = []

  console.log(`🔍 Checking ${stateChanges.length} state changes for triggers`)

  stateChanges.forEach(change => {
    const rules = triggerRules.get(change.type) || []
    console.log(`  📋 Change type: ${change.type}, Found ${rules.length} trigger rules`)

    rules.forEach((rule, index) => {
      try {
        if (rule.condition(change, context)) {
          console.log(`    ✅ Trigger rule ${index + 1} condition MET`)
          const newEffect = rule.createEffect(change, context)

          if (newEffect) {
            triggeredEffects.push(newEffect)
            console.log(`    📤 Created effect: ${newEffect.type} (id: ${newEffect.id})`)
          }
        } else {
          console.log(`    ❌ Trigger rule ${index + 1} condition NOT met`)
        }
      } catch (error) {
        console.error(`💥 Error in trigger rule for ${change.type}:`, error)
      }
    })
  })

  console.log(`📊 Total triggered effects: ${triggeredEffects.length}`)
  return triggeredEffects
}

/**
 * Registers a trigger rule for a specific state change type
 */
export const registerEffectTrigger = (
  changeType: string,
  rule: TriggerRule
): void => {
  if (!triggerRules.has(changeType)) {
    triggerRules.set(changeType, [])
  }

  const rules = triggerRules.get(changeType)!
  rules.push(rule)

  // Sort by priority (higher priority first)
  rules.sort((a, b) => (b.priority || 0) - (a.priority || 0))

  console.log(`✅ Registered trigger for ${changeType} (total: ${rules.length} rules)`)
}

/**
 * Removes all trigger rules for a specific change type
 */
export const clearTriggersForChangeType = (changeType: string): void => {
  triggerRules.delete(changeType)
  console.log(`🧹 Cleared triggers for: ${changeType}`)
}

/**
 * Removes all trigger rules (useful for testing)
 */
export const clearAllTriggers = (): void => {
  const count = Array.from(triggerRules.values()).reduce((sum, rules) => sum + rules.length, 0)
  triggerRules.clear()
  console.log(`🧹 Cleared all triggers (removed ${count} rules from registry)`)
}

/**
 * Gets debug information about registered triggers
 */
export const getTriggerDebugInfo = () => {
  const info: Record<string, number> = {}
  triggerRules.forEach((rules, changeType) => {
    info[changeType] = rules.length
  })
  return info
}

/**
 * Helper function to find a creature in the battle context
 */
export const getCreatureFromContext = (context: BattleContext, creatureId: number) => {
  const playerCreature = context.state.playerCreatures.find(c => c.ID === creatureId)
  if (playerCreature) return playerCreature

  const computerCreature = context.state.computerCreatures.find(c => c.ID === creatureId)
  if (computerCreature) return computerCreature

  throw new Error(`Creature with ID ${creatureId} not found in battle context`)
}

/**
 * Helper function to check if a creature is alive
 */
export const isCreatureAlive = (context: BattleContext, creatureId: number): boolean => {
  try {
    const creature = getCreatureFromContext(context, creatureId)
    return creature.health > 0
  } catch {
    return false
  }
}

/**
 * Helper function to get all creatures of a specific owner
 */
export const getCreaturesByOwner = (context: BattleContext, owner: 'player' | 'computer') => {
  return owner === 'player' ? context.state.playerCreatures : context.state.computerCreatures
}

/**
 * Helper function to get alive creatures of a specific owner
 */
export const getAliveCreaturesByOwner = (context: BattleContext, owner: 'player' | 'computer') => {
  return getCreaturesByOwner(context, owner).filter(creature => creature.health > 0)
}