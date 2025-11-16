// React Integration Hook - Main hook for using the Effect Pipeline System in React
import { useState, useRef, useCallback, useEffect } from 'react'
import { BattleState, BattleContext, Effect, StateChange } from '../types'
import { applyChangesToContext } from '../battleContext'
import { createBattleContext, subscribeToContext, getContextState } from '../battleContext'
import {
  createZustandBattleStore,
  subscribeToZustandContext,
  getZustandContextState,
  zustandToBattleContext
} from '../zustandAdapter'
import { processEffectChain } from '../effectPipelineEngine'
import { setupDefaultTriggers, resetBattleTracking } from '../effects/triggerSetup'
import {
  buildBurnEffect,
  buildPoisonEffect,
  buildRegenerationEffect,
  buildAttackBuffEffect,
  buildDefenseBuffEffect,
  buildStunEffect,
  buildAttackEffect,
  buildTrueDamageEffect,
  buildHealEffect,
  buildDeathEffect,
  buildLifeDrainEffect,
  buildAoeAttackEffect
} from '../factories'

// Feature flag: Set to true to use Zustand adapter instead of native BattleContext
const USE_ZUSTAND_ADAPTER = true // ✅ ZUSTAND ENABLED FOR TESTING

/**
 * Main hook for integrating the Effect Pipeline System with React
 */
export const useBattleEngine = (initialState: BattleState) => {
  const [battleState, setBattleState] = useState<BattleState>(initialState)
  const contextRef = useRef<BattleContext>()
  const zustandStoreRef = useRef<ReturnType<typeof createZustandBattleStore>>()
  const [isProcessingEffects, setIsProcessingEffects] = useState(false)

  // Initialize context on first render (during render phase, not in useEffect)
  // This ensures the context persists across React Strict Mode double-mounting
  if (!contextRef.current && !zustandStoreRef.current) {
    if (USE_ZUSTAND_ADAPTER) {
      console.log('🎯 Using Zustand adapter for battle context')
      zustandStoreRef.current = createZustandBattleStore(initialState)
      contextRef.current = zustandToBattleContext(zustandStoreRef.current)
    } else {
      console.log('📦 Using native BattleContext')
      contextRef.current = createBattleContext(initialState)
    }
  }

  // Setup triggers in useEffect to ensure proper lifecycle management
  // This runs once on mount and cleans up on unmount
  useEffect(() => {
    console.log('🎯 Initializing effect triggers')
    setupDefaultTriggers()
    
    return () => {
      console.log('🧹 Cleaning up effect triggers')
      // Triggers will be cleared on next setup call
    }
  }, [])

  // Subscribe to context changes
  // IMPORTANT: Subscription must happen in useEffect, separate from context creation
  // This ensures the subscription is re-established after React Strict Mode cleanup
  useEffect(() => {
    if (!contextRef.current) return

    console.log('🔌 Subscribing to battle context changes')

    const unsubscribe = USE_ZUSTAND_ADAPTER && zustandStoreRef.current
      ? subscribeToZustandContext(
          zustandStoreRef.current,
          'all',
          (changes: StateChange[], newState: BattleState) => {
            console.log('📢 Context change notification received (Zustand):', {
              changeCount: changes.length,
              changeTypes: changes.map(c => c.type)
            })
            
            if (zustandStoreRef.current) {
              const updatedState = getZustandContextState(zustandStoreRef.current)
              console.log('🔄 Updating React state with new battle state (Zustand)')
              setBattleState(updatedState)
            }
          }
        )
      : subscribeToContext(
          contextRef.current,
          'all',
          (changes: StateChange[], newState: BattleState) => {
            console.log('📢 Context change notification received:', {
              changeCount: changes.length,
              changeTypes: changes.map(c => c.type)
            })
            
            if (contextRef.current) {
              const updatedState = getContextState(contextRef.current)
              console.log('🔄 Updating React state with new battle state')
              setBattleState(updatedState)
            }
          }
        )

    return () => {
      console.log('🔌 Unsubscribing from battle context')
      unsubscribe()
    }
  }, [])

  // Note: Removed state synchronization that could interfere with effect pipeline
  // The context should be the single source of truth, not React state

  /**
   * Applies an effect and processes the entire chain
   */
  const applyEffect = useCallback(async (effect: Effect) => {
    if (!contextRef.current) {
      console.error('❌ Battle context not initialized')
      return
    }

    // Applying effect
    setIsProcessingEffects(true)

    try {
      await processEffectChain(effect, contextRef.current)
      // Effect chain processing completed
    } catch (error) {
      console.error('💥 Error processing effect chain:', error)
      throw error
    } finally {
      setIsProcessingEffects(false)
      // End effect group
    }
  }, [])

  /**
   * Helper function to apply a burn effect
   */
  const applyBurn = useCallback(async (targetId: number, damage?: number) => {
    const effect = buildBurnEffect(targetId, damage)
    await applyEffect(effect)
  }, [applyEffect])

  /**
   * Process end-of-turn: apply status ticks (burn/poison/regeneration) and decrement durations.
   */
  const processEndOfTurn = useCallback(async () => {
    if (!contextRef.current) return

    const ctx = contextRef.current

    console.group('🔄 PROCESS END OF TURN')

    // Gather all creatures from the context state
    const allCreatures = [
      ...(ctx.state.playerCreatures || []),
      ...(ctx.state.computerCreatures || [])
    ]

    console.log('📊 All creatures:', allCreatures.map(c => ({ 
      name: c.name, 
      health: c.health, 
      statuses: c.statuses.map(s => ({ id: s.id, duration: s.duration }))
    })))

    // Build effects to apply for each status
    const effectsToApply: Effect[] = []

    for (const creature of allCreatures) {
      if (!creature || creature.health <= 0) continue

      for (const status of creature.statuses) {
        const sid = status.id
        // Create appropriate effect using the existing factories (defaults handle values)
        if (sid === 'BURN') {
          console.log(`🔥 Creating burn tick effect for ${creature.name}`)
          effectsToApply.push(buildBurnEffect(creature.ID, undefined))
        } else if (sid === 'POISON') {
          console.log(`🧪 Creating poison tick effect for ${creature.name}`)
          effectsToApply.push(buildPoisonEffect(creature.ID, undefined))
        } else if (sid === 'REGENERATION') {
          console.log(`💚 Creating regen tick effect for ${creature.name}`)
          effectsToApply.push(buildRegenerationEffect(creature.ID, undefined))
        } else {
          // Unknown status: skip or extend here
        }
      }
    }

    console.log(`🎯 Total effects to apply: ${effectsToApply.length}`, effectsToApply.map(e => e.type))

    // Apply effects sequentially so logs and animations are deterministic
    for (const eff of effectsToApply) {
      try {
        console.log(`⚡ Applying ${eff.type} effect to creature ${eff.targetId}`)
        await applyEffect(eff)
      } catch (err) {
        console.error('Error applying status tick effect', err)
      }
    }

    // After applying ticks, decrement durations (batch update)
    const durationChanges: StateChange[] = []

    for (const creature of allCreatures) {
      if (!creature || creature.health <= 0) continue

      for (const status of creature.statuses) {
        const newDuration = (status.duration || 0) - 1
        console.log(`⏱️ ${creature.name} ${status.id}: duration ${status.duration} → ${newDuration}`)
        
        if (newDuration <= 0) {
          console.log(`❌ ${status.id} expired on ${creature.name}, removing...`)
          durationChanges.push({
            type: 'STATUS_REMOVED',
            creatureId: creature.ID,
            timestamp: Date.now(),
            data: { statusId: status.id, reason: 'expired' }
          })
        } else {
          durationChanges.push({
            type: 'STATUS_APPLIED',
            creatureId: creature.ID,
            timestamp: Date.now(),
            data: { statusId: status.id, duration: newDuration, source: 'tick' }
          })
        }
      }
    }

    console.log(`📝 Duration changes to apply: ${durationChanges.length}`, durationChanges)

    if (durationChanges.length > 0) {
      try {
        applyChangesToContext(ctx, durationChanges)
        console.log('✅ Duration changes applied successfully')
      } catch (err) {
        console.error('Error applying duration changes', err)
      }
    }

    console.groupEnd()
  }, [applyEffect])

  /**
   * Helper function to apply a poison effect
   */
  const applyPoison = useCallback(async (targetId: number, damage?: number) => {
    const effect = buildPoisonEffect(targetId, damage)
    await applyEffect(effect)
  }, [applyEffect])

  /**
   * Helper function to apply regeneration
   */
  const applyRegeneration = useCallback(async (targetId: number, healing?: number) => {
    const effect = buildRegenerationEffect(targetId, healing)
    await applyEffect(effect)
  }, [applyEffect])

  /**
   * Helper function to apply attack buff
   */
  const applyAttackBuff = useCallback(async (targetId: number, attackBonus?: number) => {
    const effect = buildAttackBuffEffect(targetId, attackBonus ?? 5)
    await applyEffect(effect)
  }, [applyEffect])

  /**
   * Helper function to apply defense buff
   */
  const applyDefenseBuff = useCallback(async (targetId: number, defenseBonus?: number) => {
    const effect = buildDefenseBuffEffect(targetId, defenseBonus ?? 5)
    await applyEffect(effect)
  }, [applyEffect])

  /**
   * Helper function to apply stun
   */
  const applyStun = useCallback(async (targetId: number, duration: number) => {
    const effect = buildStunEffect(targetId, duration)
    await applyEffect(effect)
  }, [applyEffect])

  /**
   * Helper function to perform an attack
   */
  const performAttack = useCallback(async (attackerId: number, targetId: number, attack: any) => {
    const effect = buildAttackEffect(attackerId, targetId, attack)
    await applyEffect(effect)
  }, [applyEffect])

  /**
   * Helper function to perform true damage attack
   */
  const performTrueDamageAttack = useCallback(async (attackerId: number, targetId: number, damage: number) => {
    const effect = buildTrueDamageEffect(attackerId, targetId, damage)
    await applyEffect(effect)
  }, [applyEffect])

  /**
   * Helper function to perform healing
   */
  const performHeal = useCallback(async (casterId: number, targetId: number, healingAmount: number) => {
    const effect = buildHealEffect(casterId, targetId, healingAmount)
    await applyEffect(effect)
  }, [applyEffect])

  /**
   * Helper function to trigger death effect
   */
  const performDeath = useCallback(async (creatureId: number) => {
    const effect = buildDeathEffect(creatureId)
    await applyEffect(effect)
  }, [applyEffect])

  /**
   * Helper function to perform life drain attack
   */
  const performLifeDrain = useCallback(async (attackerId: number, targetId: number, drainAmount: number) => {
    const effect = buildLifeDrainEffect(attackerId, targetId, drainAmount)
    await applyEffect(effect)
  }, [applyEffect])

  /**
   * Helper function to perform AoE attack
   */
  const performAoeAttack = useCallback(async (attackerId: number, targetIds: number[], damage: number) => {
    const effect = buildAoeAttackEffect(attackerId, targetIds, damage)
    await applyEffect(effect)
  }, [applyEffect])

  /**
   * Get a creature by ID from current state
   */
  const getCreatureById = useCallback((creatureId: number) => {
    const playerCreature = battleState.playerCreatures.find(c => c.ID === creatureId)
    if (playerCreature) return playerCreature

    const computerCreature = battleState.computerCreatures.find(c => c.ID === creatureId)
    if (computerCreature) return computerCreature

    return null
  }, [battleState])

  /**
   * Get alive creatures by owner
   */
  const getAliveCreatures = useCallback((owner: 'player' | 'computer') => {
    const creatures = owner === 'player' ? battleState.playerCreatures : battleState.computerCreatures
    return creatures.filter(creature => creature.health > 0)
  }, [battleState])

  /**
   * Check if battle is over
   */
  const isBattleOver = useCallback(() => {
    const alivePlayerCreatures = getAliveCreatures('player')
    const aliveComputerCreatures = getAliveCreatures('computer')
    return alivePlayerCreatures.length === 0 || aliveComputerCreatures.length === 0
  }, [getAliveCreatures])

  /**
   * Get battle winner
   */
  const getBattleWinner = useCallback(() => {
    if (!isBattleOver()) return null

    const alivePlayerCreatures = getAliveCreatures('player')
    const aliveComputerCreatures = getAliveCreatures('computer')

    if (alivePlayerCreatures.length > 0) return 'player'
    if (aliveComputerCreatures.length > 0) return 'computer'
    return 'draw'
  }, [isBattleOver, getAliveCreatures])

  /**
   * Reset battle state
   */
  const resetBattle = useCallback((newInitialState?: BattleState) => {
    const stateToUse = newInitialState || initialState
    setBattleState(stateToUse)
    if (contextRef.current) {
      contextRef.current.state = stateToUse
      contextRef.current.stateHistory = []
    }
    // Reset battle-wide tracking flags (e.g., first blood)
    resetBattleTracking()
    console.log('🔄 Battle state reset')
  }, [initialState])

  /**
   * Get debug information about the current state
   */
  const getDebugInfo = useCallback(() => {
    if (!contextRef.current) return null

    return {
      battleState,
      stateHistoryLength: contextRef.current.stateHistory.length,
      subscriberCount: Array.from(contextRef.current.subscribers.values())
        .reduce((total, callbacks) => total + callbacks.length, 0),
      isProcessingEffects
    }
  }, [battleState, isProcessingEffects])

  return {
    // State
    battleState,
    isProcessingEffects,

    // Core functions
    applyEffect,

    // Status effect helpers
    applyBurn,
    applyPoison,
    applyRegeneration,
    applyAttackBuff,
    applyDefenseBuff,
    applyStun,

    // Combat helpers
    performAttack,
    performTrueDamageAttack,
    performHeal,
    performDeath,
    performLifeDrain,
    performAoeAttack,

    // Utility functions
    getCreatureById,
    getAliveCreatures,
    isBattleOver,
    getBattleWinner,
    resetBattle,

    // Turn system
    processEndOfTurn,

    // Debug
    getDebugInfo
  }
}

/**
 * Hook for components that only need to read battle state
 */
export const useBattleState = (initialState: BattleState) => {
  const { battleState, getCreatureById, getAliveCreatures, isBattleOver, getBattleWinner } = useBattleEngine(initialState)

  return {
    battleState,
    getCreatureById,
    getAliveCreatures,
    isBattleOver,
    getBattleWinner
  }
}