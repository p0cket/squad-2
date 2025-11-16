// Run Effect Queue - Main pipeline orchestrator
// Consolidates: processEffectChain + executeEffectPipeline

import { BattleContext } from './types'
import { 
  hasQueuedEffects, 
  dequeueEffect, 
  queueEffect,
  getQueueSize 
} from './effectQueue'
import { findHandler } from './registry'
import { recordChanges } from './recordChanges'
import { playAnims } from './playAnims'
import { updateDisplay } from './updateDisplay'
import { checkTriggers } from './checkTriggers'

/**
 * Processing state to prevent concurrent runs
 */
let isProcessing = false

/**
 * Maximum iterations to prevent infinite loops
 */
const MAX_ITERATIONS = 100

/**
 * Run the effect queue - processes all queued effects until empty
 * Consolidates processEffectChain + executeEffectPipeline
 * 
 * @param context - The battle context
 */
export const runEffectQueue = async (
  context: BattleContext
): Promise<void> => {
  // Prevent concurrent processing
  if (isProcessing) {
    console.log('⏸️ Queue already processing, skipping')
    return
  }
  
  isProcessing = true
  let iterations = 0
  
  console.group(`⚙️ Running Effect Queue (${getQueueSize()} effects)`)
  
  try {
    // Loop until queue is empty
    while (hasQueuedEffects() && iterations < MAX_ITERATIONS) {
      iterations++
      
      // Get next effect
      const effect = dequeueEffect()
      
      if (!effect) {
        console.log('No more effects to process')
        break
      }
      
      console.group(`📍 Processing Effect #${iterations}: ${effect.type}`)
      
      try {
        // Step 1: Find handler
        const handler = findHandler(effect.type)
        
        // Step 2: Calculate result
        console.log('🎲 Calculating result...')
        const result = await handler(effect, context)
        
        // Step 3: Record changes
        recordChanges(context, result.changes)
        
        // Step 4: Play animations (returns finisher)
        const finisher = await playAnims(result.anims)
        
        // Step 5: Update display (before animations complete)
        updateDisplay(context, result.changes)
        
        // Step 6: Wait for animations to finish
        await finisher()
        
        // Step 7: Check for triggered effects
        const triggers = checkTriggers(result.changes, context)
        
        // Step 8: Queue triggered effects
        if (triggers.length > 0) {
          console.log(`📤 Queueing ${triggers.length} triggered effects`)
          triggers.forEach(queueEffect)
        } else {
          console.log('No triggered effects')
        }
        
      } catch (error) {
        console.error('💥 Error processing effect:', error)
        // Continue with next effect
      }
      
      console.groupEnd()
    }
    
    if (iterations >= MAX_ITERATIONS) {
      console.warn('⚠️ Hit max iterations - possible infinite loop detected')
    }
    
    console.log(`✅ Queue processing complete (${iterations} effects processed)`)
    
  } finally {
    isProcessing = false
    console.groupEnd()
  }
}

/**
 * Check if the queue is currently processing
 * 
 * @returns True if processing
 */
export const isQueueProcessing = (): boolean => {
  return isProcessing
}

/**
 * Reset processing state (useful for testing)
 */
export const resetProcessingState = (): void => {
  isProcessing = false
  console.log('🧹 Reset processing state')
}

// ============================================================================
// BACKWARDS COMPATIBILITY - Deprecated functions
// ============================================================================

/**
 * @deprecated Use runEffectQueue() instead
 */
export const processEffectChain = async (
  initialEffect: any,
  context: BattleContext
): Promise<void> => {
  console.warn('⚠️ processEffectChain() is deprecated. Use runEffectQueue() instead.')
  
  // Queue the initial effect
  queueEffect(initialEffect)
  
  // Run the queue
  await runEffectQueue(context)
}

/**
 * @deprecated Internal function - use runEffectQueue() instead
 */
export const executeEffectPipeline = async (
  effect: any,
  context: BattleContext
): Promise<void> => {
  console.warn('⚠️ executeEffectPipeline() is deprecated. Use runEffectQueue() instead.')
  
  // Queue the effect
  queueEffect(effect)
  
  // Run the queue
  await runEffectQueue(context)
}
