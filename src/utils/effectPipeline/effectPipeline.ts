// Effect Pipeline Management - Pure functions for handling effect queues
import { Effect, EffectPipeline } from './types'

/**
 * Creates a new empty effect pipeline
 */
export const createEffectPipeline = (): EffectPipeline => ({
  queue: [],
  processed: new Set()
})

/**
 * Adds an effect to the pipeline with loop prevention and priority ordering
 */
export const addEffectToPipeline = (
  pipeline: EffectPipeline,
  effect: Effect
): void => {
  const effectId = generateEffectId(effect)

  // Prevent infinite loops by checking if we've already processed this effect
  if (pipeline.processed.has(effectId)) {
    // Skipping duplicate effect
    return
  }

  const priority = effect.priority || 0

  // Insert in priority order (higher priority first)
  const insertIndex = pipeline.queue.findIndex(queuedEffect => (queuedEffect.priority || 0) < priority)
  if (insertIndex === -1) {
    pipeline.queue.push(effect)
  } else {
    pipeline.queue.splice(insertIndex, 0, effect)
  }

  // Added effect to pipeline
}

/**
 * Gets the next effect from the pipeline (highest priority)
 */
export const getNextEffect = (
  pipeline: EffectPipeline
): Effect | null => {
  const effect = pipeline.queue.shift()
  if (!effect) {
    return null
  }

  const effectId = generateEffectId(effect)
  pipeline.processed.add(effectId)

  return effect
}

export const getNextEffectFromPipeline = getNextEffect // Alias for backwards compatibility

/**
 * Checks if the pipeline has any effects waiting to be processed
 */
export const hasEffectsInPipeline = (pipeline: EffectPipeline): boolean => {
  return pipeline.queue.length > 0
}

/**
 * Marks an effect as processed to prevent duplicates
 */
export const markEffectProcessed = (pipeline: EffectPipeline, effect: Effect): void => {
  const effectId = generateEffectId(effect)
  pipeline.processed.add(effectId)
}

/**
 * Generates a unique ID for an effect to prevent infinite loops
 */
const generateEffectId = (effect: Effect): string => {
  // Create a unique ID based on effect type, target, and current context
  // This allows the same effect to be applied multiple times to different targets
  // but prevents the exact same effect from being applied repeatedly to the same target
  return `${effect.id}-${effect.targetId}`
}


/**
 * Gets the current state of the pipeline for debugging
 */
export const getPipelineDebugInfo = (pipeline: EffectPipeline) => ({
  queueLength: pipeline.queue.length,
  processedCount: pipeline.processed.size,
  queuedEffects: pipeline.queue.map(effect => ({
    id: effect.id,
    targetId: effect.targetId,
    priority: effect.priority || 0
  })),
  processedEffects: Array.from(pipeline.processed)
})

/**
 * Clears all effects from the pipeline (useful for testing)
 */
export const clearEffectPipeline = (pipeline: EffectPipeline): void => {
  pipeline.queue.length = 0
  pipeline.processed.clear()
}

/**
 * Estimates if the pipeline might be in an infinite loop
 * This is a safety check based on the number of processed effects
 */
export const checkForPotentialInfiniteLoop = (pipeline: EffectPipeline): boolean => {
  const MAX_PROCESSED_EFFECTS = 100
  return pipeline.processed.size > MAX_PROCESSED_EFFECTS
}