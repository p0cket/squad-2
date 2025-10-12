// Effect Applicator Registry - Maps effect types to their applicator functions
// This enables decoupled, serializable effects that can be JSON-serialized

import { Effect, EffectApplicator, BattleContext, EffectApplicationResult } from './types'

/**
 * Registry of effect type -> applicator function
 */
const EFFECT_APPLICATORS: Record<string, EffectApplicator> = {}

/**
 * Register an effect applicator for a given effect type
 */
export const registerEffectApplicator = (
  effectType: string,
  applicator: EffectApplicator
): void => {
  if (EFFECT_APPLICATORS[effectType]) {
    console.warn(`⚠️ Overwriting existing applicator for effect type: ${effectType}`)
  }
  EFFECT_APPLICATORS[effectType] = applicator
}

/**
 * Apply an effect by looking up its applicator
 */
export const applyEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const applicator = EFFECT_APPLICATORS[effect.type]
  
  if (!applicator) {
    throw new Error(`No applicator registered for effect type: ${effect.type}`)
  }
  
  return applicator(effect, context)
}

/**
 * Check if an applicator is registered for an effect type
 */
export const hasApplicator = (effectType: string): boolean => {
  return effectType in EFFECT_APPLICATORS
}

/**
 * Get all registered effect types
 */
export const getRegisteredEffectTypes = (): string[] => {
  return Object.keys(EFFECT_APPLICATORS)
}
