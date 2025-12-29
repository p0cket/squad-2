// Core Effect Pipeline Engine - Main orchestrator for effect chains
import { Effect, BattleContext, EffectPipelineState } from './types'
import { applyEffect } from './effectApplicatorRegistry'
import {
  createEffectPipeline,
  addEffectToPipeline,
  hasEffectsInPipeline,
  getNextEffect
} from './effectPipeline'
import { resolveTriggeredEffects } from './effectResolver'
import { executeAnimationsSequentially } from './animationEngine'
import { applyChangesToContext, notifyContextSubscribers } from './battleContext'

// Global pipeline state
const pipelineState: EffectPipelineState = {
  isProcessing: false,
  effectQueue: []
}

/**
 * Main entry point for processing effect chains
 * Handles queuing and sequential processing of effects
 */
export const processEffectChain = async (
  initialEffect: Effect,
  context: BattleContext
): Promise<void> => {
  console.group('🔄 Processing Effect Chain:', initialEffect.id)

  // If already processing, queue the effect
  if (pipelineState.isProcessing) {
    // Pipeline busy, queueing effect
    pipelineState.effectQueue.push({ effect: initialEffect, context })
    console.groupEnd()
    return
  }

  pipelineState.isProcessing = true
  
  // Reset combo count at start of chain
  context.state.currentCombo = 0

  try {
    await executeEffectPipeline(initialEffect, context)

    // Process any queued effects
    while (pipelineState.effectQueue.length > 0) {
      // Processing queued effects
      const next = pipelineState.effectQueue.shift()!
      await executeEffectPipeline(next.effect, next.context)
    }
  } catch (error) {
    console.error('💥 Error in effect pipeline:', error)
    throw error
  } finally {
    pipelineState.isProcessing = false
    console.groupEnd()
  }
}

/**
 * Executes a complete effect pipeline until no more effects are generated
 */
const executeEffectPipeline = async (
  effect: Effect,
  context: BattleContext
): Promise<void> => {
  console.group('⚙️ Executing Effect Pipeline for:', effect.id)

  const pipeline = createEffectPipeline()
  addEffectToPipeline(pipeline, effect)

  let stepCount = 0
  const maxSteps = 50 // Safety limit to prevent infinite loops

  while (hasEffectsInPipeline(pipeline) && stepCount < maxSteps) {
    stepCount++
    // Pipeline step

    const currentEffect = getNextEffect(pipeline)
    if (!currentEffect) {
      // No effect to process
      break
    }

    // Processing effect

    try {
      // 1. Apply the effect and get state changes + animations
      const { stateChanges, animations } = await applyEffect(currentEffect, context)

      // Update combo count based on chain depth
      if (currentEffect.chainDepth && currentEffect.chainDepth > (context.state.currentCombo || 0)) {
        context.state.currentCombo = currentEffect.chainDepth
        console.log(`🔥 Combo increased to x${context.state.currentCombo}!`)
      }

      console.log(`📦 Effect ${currentEffect.type} returned:`, {
        stateChangesCount: stateChanges.length,
        stateChangeTypes: stateChanges.map(sc => sc.type),
        animationsCount: animations.length
      })

      // 2. Apply state changes to context (but defer UI notification)
      if (stateChanges.length > 0) {
        console.log('🔧 Applying state changes to context...')
        applyChangesToContext(context, stateChanges, { deferNotification: true })
        console.log('✅ State changes applied to context')
      }

      // 3. Execute animations (returns after damage numbers appear, not after they fade)
      let finishAnimations: (() => Promise<void>) | null = null
      if (animations.length > 0) {
        finishAnimations = await executeAnimationsSequentially(animations)
      }

      // 4. Now notify UI subscribers AFTER damage numbers have appeared
      if (stateChanges.length > 0) {
        notifyContextSubscribers(context, stateChanges)
      }

      // 5. Wait for animations to fully finish (fade out) before continuing
      if (finishAnimations) {
        await finishAnimations()
      }

      // 6. Check for triggered effects
      // Checking for triggered effects
      const triggeredEffects = resolveTriggeredEffects(
        currentEffect,
        stateChanges,
        context
      )

      if (triggeredEffects.length > 0) {
        // Triggered effects found
        triggeredEffects.forEach(triggeredEffect => {
          addEffectToPipeline(pipeline, triggeredEffect)
        })
      } else {
        // No triggered effects
      }

    } catch (error) {
      console.error('💥 Error processing effect:', currentEffect.id, error)
      // Continue processing other effects
    }
  }

  if (stepCount >= maxSteps) {
    console.warn('⚠️ Pipeline stopped due to step limit. Possible infinite loop detected.')
  }

  // Pipeline completed
  console.groupEnd()
}

/**
 * Get current pipeline state (useful for debugging)
 */
export const getPipelineState = (): EffectPipelineState => ({
  ...pipelineState,
  effectQueue: [...pipelineState.effectQueue] // Return copy
})

/**
 * Reset pipeline state (useful for testing)
 */
export const resetPipelineState = (): void => {
  pipelineState.isProcessing = false
  pipelineState.effectQueue = []
}