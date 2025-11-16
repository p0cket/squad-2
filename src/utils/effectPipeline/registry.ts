// Effect Handler Registry - Maps effect types to their handler functions
// Enables decoupled, serializable effects with centralized handler management

import { Effect, EffectHandler, EffectResult, BattleContext } from './types'

/**
 * Registry of effect type → handler function
 */
const EFFECT_HANDLERS: Record<string, EffectHandler> = {}

/**
 * Find and return the handler for a given effect type
 * 
 * @param effectType - The effect type to find handler for (e.g., 'ATTACK', 'HEAL')
 * @returns The handler function
 * @throws Error if no handler registered for the effect type
 */
export const findHandler = (effectType: string): EffectHandler => {
  const handler = EFFECT_HANDLERS[effectType]
  
  if (!handler) {
    throw new Error(`No handler registered for effect type: ${effectType}`)
  }
  
  console.log(`🔍 Found handler for: ${effectType}`)
  return handler
}

/**
 * Register a handler for a given effect type
 * 
 * @param effectType - The effect type (e.g., 'ATTACK', 'HEAL')
 * @param handler - The handler function
 */
export const registerHandler = (
  effectType: string,
  handler: EffectHandler
): void => {
  if (EFFECT_HANDLERS[effectType]) {
    console.warn(`⚠️ Overwriting existing handler for effect type: ${effectType}`)
  }
  
  EFFECT_HANDLERS[effectType] = handler
  console.log(`✅ Registered handler for: ${effectType}`)
}

/**
 * Check if a handler is registered for an effect type
 * 
 * @param effectType - The effect type to check
 * @returns True if handler exists
 */
export const hasHandler = (effectType: string): boolean => {
  return effectType in EFFECT_HANDLERS
}

/**
 * Get all registered effect types
 * 
 * @returns Array of registered effect type strings
 */
export const getRegisteredHandlers = (): string[] => {
  return Object.keys(EFFECT_HANDLERS)
}

/**
 * Clear all registered handlers (useful for testing)
 */
export const clearHandlers = (): void => {
  Object.keys(EFFECT_HANDLERS).forEach(key => {
    delete EFFECT_HANDLERS[key]
  })
  console.log('🧹 Cleared all handlers')
}

// ============================================================================
// BACKWARDS COMPATIBILITY - Deprecated functions
// ============================================================================

/**
 * @deprecated Use findHandler() instead
 * Legacy function for backwards compatibility
 */
export const applyEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<{ stateChanges: any[], animations: any[] }> => {
  console.warn('⚠️ applyEffect() is deprecated. Use findHandler() instead.')
  const handler = findHandler(effect.type)
  const result = await handler(effect, context)
  
  // Convert new format to old format
  return {
    stateChanges: result.changes,
    animations: result.anims
  }
}

/**
 * @deprecated Use registerHandler() instead
 */
export const registerEffectApplicator = (
  effectType: string,
  handler: EffectHandler
): void => {
  console.warn('⚠️ registerEffectApplicator() is deprecated. Use registerHandler() instead.')
  registerHandler(effectType, handler)
}

/**
 * @deprecated Use hasHandler() instead
 */
export const hasApplicator = (effectType: string): boolean => {
  console.warn('⚠️ hasApplicator() is deprecated. Use hasHandler() instead.')
  return hasHandler(effectType)
}

/**
 * @deprecated Use getRegisteredHandlers() instead
 */
export const getRegisteredEffectTypes = (): string[] => {
  console.warn('⚠️ getRegisteredEffectTypes() is deprecated. Use getRegisteredHandlers() instead.')
  return getRegisteredHandlers()
}
