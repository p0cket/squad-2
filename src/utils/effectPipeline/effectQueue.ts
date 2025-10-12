// Effect Queue - Manages queuing and priority sorting of effects

import { Effect } from './types'

/**
 * The effect queue - holds effects waiting to be processed
 */
let effectQueue: Effect[] = []

/**
 * Add an effect to the queue with automatic priority sorting
 * 
 * @param effect - The effect to queue
 */
export const queueEffect = (effect: Effect): void => {
  // Add to queue
  effectQueue.push(effect)
  
  // Sort by priority (higher first), then timestamp (earlier first)
  sortQueue()
  
  console.log(`📥 Queued effect: ${effect.type} (priority: ${effect.priority})`)
  console.log(`📊 Queue size: ${effectQueue.length}`)
}

/**
 * Remove and return the next effect from the queue
 * 
 * @returns The next effect, or undefined if queue is empty
 */
export const dequeueEffect = (): Effect | undefined => {
  const effect = effectQueue.shift()
  
  if (effect) {
    console.log(`📤 Dequeued effect: ${effect.type}`)
  }
  
  return effect
}

/**
 * Check if there are effects in the queue
 * 
 * @returns True if queue has effects
 */
export const hasQueuedEffects = (): boolean => {
  return effectQueue.length > 0
}

/**
 * Get the current size of the queue
 * 
 * @returns Number of effects in queue
 */
export const getQueueSize = (): number => {
  return effectQueue.length
}

/**
 * Clear all effects from the queue
 */
export const clearQueue = (): void => {
  effectQueue = []
  console.log('🧹 Cleared effect queue')
}

/**
 * Get a copy of the current queue (for debugging)
 * 
 * @returns Copy of the queue array
 */
export const getQueue = (): Effect[] => {
  return [...effectQueue]
}

/**
 * Sort the queue by priority (high to low), then timestamp (early to late)
 * 
 * @internal
 */
const sortQueue = (): void => {
  effectQueue.sort((a, b) => {
    // First, sort by priority (higher priority first)
    if (b.priority !== a.priority) {
      return b.priority - a.priority
    }
    
    // If priorities are equal, sort by timestamp (earlier first)
    return a.timestamp - b.timestamp
  })
}

/**
 * Peek at the next effect without removing it
 * 
 * @returns The next effect, or undefined if queue is empty
 */
export const peekNext = (): Effect | undefined => {
  return effectQueue[0]
}

// ============================================================================
// BACKWARDS COMPATIBILITY - Deprecated functions
// ============================================================================

/**
 * @deprecated Use initQueue() is not needed - queue is auto-initialized
 */
export const createEffectPipeline = () => {
  console.warn('⚠️ createEffectPipeline() is deprecated. Queue is auto-initialized.')
  return { queue: effectQueue, processed: new Set<string>() }
}

/**
 * @deprecated Use queueEffect() instead
 */
export const addEffectToPipeline = (pipeline: any, effect: Effect): void => {
  console.warn('⚠️ addEffectToPipeline() is deprecated. Use queueEffect() instead.')
  queueEffect(effect)
}

/**
 * @deprecated Use dequeueEffect() instead
 */
export const getNextEffect = (pipeline: any): Effect | undefined => {
  console.warn('⚠️ getNextEffect() is deprecated. Use dequeueEffect() instead.')
  return dequeueEffect()
}

/**
 * @deprecated Use hasQueuedEffects() instead
 */
export const hasEffectsInPipeline = (pipeline: any): boolean => {
  console.warn('⚠️ hasEffectsInPipeline() is deprecated. Use hasQueuedEffects() instead.')
  return hasQueuedEffects()
}
