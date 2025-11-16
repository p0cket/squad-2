// Check Triggers - Detects and creates cascade effects based on state changes
// Renamed from: effectResolver.ts / resolveTriggeredEffects

import { Effect, StateChange, BattleContext, TriggerRule } from './types'

// Global registry of trigger rules
const triggerRules = new Map<string, TriggerRule[]>()

/**
 * Check for triggered effects based on state changes
 * Renamed from: resolveTriggeredEffects
 * 
 * @param stateChanges - Array of state changes that occurred
 * @param context - Current battle context
 * @returns Array of effects that were triggered
 */
export const checkTriggers = (
  stateChanges: StateChange[],
  context: BattleContext
): Effect[] => {
  console.group(`🔍 Checking triggers for ${stateChanges.length} changes`)
  
  const triggeredEffects: Effect[] = []

  stateChanges.forEach(change => {
    console.log(`Checking change: ${change.type}`)
    
    const rules = triggerRules.get(change.type) || []
    
    if (rules.length === 0) {
      console.log(`  No triggers registered for ${change.type}`)
      return
    }

    console.log(`  Found ${rules.length} trigger rules`)

    rules.forEach((rule, index) => {
      try {
        if (rule.condition(change, context)) {
          console.log(`  ✅ Trigger ${index + 1} activated`)
          const newEffect = rule.createEffect(change, context)

          if (newEffect) {
            triggeredEffects.push(newEffect)
            console.log(`  📤 Created triggered effect: ${newEffect.type}`)
          }
        } else {
          console.log(`  ❌ Trigger ${index + 1} condition not met`)
        }
      } catch (error) {
        console.error(`💥 Error in trigger rule for ${change.type}:`, error)
      }
    })
  })

  console.log(`📊 Total triggered effects: ${triggeredEffects.length}`)
  console.groupEnd()
  
  return triggeredEffects
}

/**
 * Register a trigger rule for a specific state change type
 * 
 * @param changeType - The state change type to trigger on
 * @param rule - The trigger rule
 */
export const registerTrigger = (
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

  console.log(`✅ Registered trigger for: ${changeType}`)
}

/**
 * Remove all trigger rules for a specific change type
 * 
 * @param changeType - The state change type
 */
export const clearTriggersForChangeType = (changeType: string): void => {
  triggerRules.delete(changeType)
  console.log(`🧹 Cleared triggers for: ${changeType}`)
}

/**
 * Remove all trigger rules (useful for testing)
 */
export const clearAllTriggers = (): void => {
  triggerRules.clear()
  console.log('🧹 Cleared all triggers')
}

/**
 * Get all registered triggers (for debugging)
 * 
 * @returns Map of change types to trigger rules
 */
export const getAllTriggers = (): Map<string, TriggerRule[]> => {
  return new Map(triggerRules)
}

// ============================================================================
// BACKWARDS COMPATIBILITY - Deprecated functions
// ============================================================================

/**
 * @deprecated Use checkTriggers() instead
 */
export const resolveTriggeredEffects = (
  sourceEffect: Effect,
  stateChanges: StateChange[],
  context: BattleContext
): Effect[] => {
  console.warn('⚠️ resolveTriggeredEffects() is deprecated. Use checkTriggers() instead.')
  return checkTriggers(stateChanges, context)
}

/**
 * @deprecated Use registerTrigger() instead
 */
export const registerEffectTrigger = (
  changeType: string,
  rule: TriggerRule
): void => {
  console.warn('⚠️ registerEffectTrigger() is deprecated. Use registerTrigger() instead.')
  registerTrigger(changeType, rule)
}
