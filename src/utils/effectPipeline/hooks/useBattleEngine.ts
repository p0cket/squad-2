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
  buildBleedEffect,
  buildRegenerationEffect,
  buildFreezeEffect,
  buildSlowEffect,
  buildAttackDebuffEffect,
  buildCleanseEffect,
  buildSilenceEffect,
  buildAttackBuffEffect,
  buildDefenseBuffEffect,
  buildStunEffect,
  buildShieldEffect,
  buildAttackEffect,
  buildTrueDamageEffect,
  buildHealEffect,
  buildDeathEffect,
  buildLifeDrainEffect,
  buildAoeAttackEffect
} from '../factories'
import { selectBestTarget, selectAttack } from '../ai/autopilotAI'
import { battleEventLogger } from '../eventLogger'

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
  
  // Autopilot state
  const [isAutopilotEnabled, setIsAutopilotEnabled] = useState(false)
  const [autopilotSpeed, setAutopilotSpeed] = useState(1000) // Default: 1000ms delay

  /**
   * Get battle event log
   */
  const getEventLog = useCallback(() => {
    return battleEventLogger.getEvents()
  }, [])

  /**
   * Clear battle event log
   */
  const clearEventLog = useCallback(() => {
    battleEventLogger.clearEvents()
  }, [])

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

  // Trigger autopilot when enabled during an active player turn
  useEffect(() => {
    if (isAutopilotEnabled && 
        battleState.currentTurnOwner === 'player' && 
        !isProcessingEffects &&
        battleState.battleStatus === 'in-progress') {
      console.log('🤖 Autopilot enabled on player turn - triggering immediately')
      
      // Small delay to allow UI to update
      const timer = setTimeout(async () => {
        const alivePlayerCreatures = battleState.playerCreatures.filter(c => c.health > 0)
        const aliveEnemies = battleState.computerCreatures.filter(c => c.health > 0)
        
        if (alivePlayerCreatures.length > 0 && aliveEnemies.length > 0) {
          // Use the executePlayerAutopilot function via a ref to avoid stale closures
          // For now, we'll manually trigger it here
          const attacker = alivePlayerCreatures[0]
          const target = aliveEnemies.reduce((weakest, current) =>
            current.health < weakest.health ? current : weakest
          )
          
          const attack = {
            name: "Auto Attack",
            damage: 15,
            template: "physical",
            attackType: "physical" as const,
            effects: [],
            chanceToLand: 1,
            trueDamage: 0,
            icon: "⚔️",
            notes: "Autopilot basic attack",
            cooldown: 0
          }
          
          console.log(`🤖 Autopilot: ${attacker.name} attacks ${target.name}`)
          
          if (contextRef.current) {
            const effect = buildAttackEffect(attacker.ID, target.ID, attack)
            await processEffectChain(effect, contextRef.current)
          }
          
          // Apply autopilot speed delay then end turn
          await new Promise(resolve => setTimeout(resolve, autopilotSpeed))
          
          // Manually trigger endTurn by updating state
          const newTurn = battleState.turn + 1
          const newOwner = 'computer'
          
          setBattleState(prev => ({
            ...prev,
            turn: newTurn,
            currentTurnOwner: newOwner
          }))
          
          if (contextRef.current) {
            contextRef.current.state.turn = newTurn
            contextRef.current.state.currentTurnOwner = newOwner
          }
        }
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [isAutopilotEnabled, battleState.currentTurnOwner, battleState.turn, isProcessingEffects, battleState.battleStatus])

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
   * 📋 See docs/STATUS_EFFECT_CHECKLIST.md for status effect implementation guidelines
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
        console.log(`🔍 Processing status ${sid} on ${creature.name}:`, status)
        // Create appropriate effect using the stored damage/heal values from status
        if (sid === 'BURN') {
          const damage = status.damagePerTurn ?? 5  // Use stored value or default
          if (status.damagePerTurn === undefined) {
            console.warn(`⚠️ BURN status on ${creature.name} missing damagePerTurn! Using fallback: 5`)
          }
          console.log(`🔥 Creating burn tick effect for ${creature.name} (${damage} dmg)`)
          effectsToApply.push(buildBurnEffect(creature.ID, damage))
        } else if (sid === 'POISON') {
          const damage = status.damagePerTurn ?? 3  // Use stored value or default
          if (status.damagePerTurn === undefined) {
            console.warn(`⚠️ POISON status on ${creature.name} missing damagePerTurn! Using fallback: 3`)
          }
          console.log(`🧪 Creating poison tick effect for ${creature.name} (${damage} dmg) [status.damagePerTurn = ${status.damagePerTurn}]`)
          effectsToApply.push(buildPoisonEffect(creature.ID, damage))
        } else if (sid === 'BLEED') {
          const damage = status.damagePerTurn ?? 7  // Use stored value or default
          if (status.damagePerTurn === undefined) {
            console.warn(`⚠️ BLEED status on ${creature.name} missing damagePerTurn! Using fallback: 7`)
          }
          console.log(`🩸 Creating bleed tick effect for ${creature.name} (${damage} dmg) [status.damagePerTurn = ${status.damagePerTurn}]`)
          effectsToApply.push(buildBleedEffect(creature.ID, damage))
        } else if (sid === 'REGENERATION') {
          const healing = status.healPerTurn ?? 5  // Use stored value or default
          if (status.healPerTurn === undefined) {
            console.warn(`⚠️ REGENERATION status on ${creature.name} missing healPerTurn! Using fallback: 5`)
          }
          console.log(`💚 Creating regen tick effect for ${creature.name} (${healing} heal)`)
          effectsToApply.push(buildRegenerationEffect(creature.ID, healing))
        } else if (sid === 'SHIELD') {
          // Shield doesn't tick - it passively absorbs damage
          // Duration will be decremented below, no tick effect needed
          console.log(`🛡️ Shield on ${creature.name}: ${status.shieldAmount ?? 0} remaining (no tick, passive absorption)`)
        } else if (sid === 'FREEZE') {
          // Freeze doesn't tick - it's a passive prevention effect
          // No effect to apply, just let duration decrement
          console.log(`❄️ ${creature.name} is frozen (passive effect, no tick)`)
        } else if (sid === 'SLOW') {
          // Slow doesn't tick - it's a passive prevention effect
          // Action skipping is handled by turn system checking turnCounter
          console.log(`🐌 ${creature.name} is slowed (passive effect, no tick)`)
        } else if (sid === 'ATTACK_DEBUFF') {
          // Attack debuff doesn't tick - it's a passive stat modification
          // Stat reduction persists via the status data
          console.log(`⚔️⬇️ ${creature.name} attack is weakened (passive effect, no tick)`)
        } else if (sid === 'SILENCE') {
          // Silence doesn't tick - it's a passive prevention effect
          // Ability blocking is handled by attack selection system
          console.log(`🤐 ${creature.name} is silenced (passive effect, no tick)`)
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

    // ⚠️ CRITICAL: Re-fetch creatures from CURRENT state after effects applied
    // This ensures we have the updated health values and avoid stale closure bugs
    const freshCreatures = [
      ...(contextRef.current.state.playerCreatures || []),
      ...(contextRef.current.state.computerCreatures || [])
    ]

    console.log('🔄 Re-fetched fresh creature state after applying tick effects')

    // After applying ticks, decrement durations (batch update)
    const durationChanges: StateChange[] = []

    for (const creature of freshCreatures) {  // ← Use FRESH data to avoid overwriting health!
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
   * Helper function to apply shield
   */
  const applyShield = useCallback(async (targetId: number, shieldAmount?: number) => {
    const effect = buildShieldEffect(targetId, shieldAmount)
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
    if (typeof resetBattleTracking === 'function') {
      resetBattleTracking()
    }
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

  /**
   * Execute computer turn (simple AI)
   */
  const executeComputerTurn = useCallback(async () => {
    console.log('🤖 Computer turn starting...')
    
    const aliveEnemies = getAliveCreatures('computer')
    const aliveTargets = getAliveCreatures('player')
    
    if (aliveEnemies.length > 0 && aliveTargets.length > 0) {
      // Smart AI: first alive enemy targets the weakest (lowest health) player creature
      const attacker = aliveEnemies[0]
      const target = aliveTargets.reduce((weakest, current) => 
        current.health < weakest.health ? current : weakest
      )
      
      const attack = {
        name: "Enemy Attack",
        damage: 15,
        template: "physical",
        attackType: "physical" as const,
        effects: [],
        chanceToLand: 1,
        trueDamage: 0,
        icon: "⚔️",
        notes: "Computer attack",
        cooldown: 0
      }
      
      console.log(`🤖 ${attacker.name} attacks ${target.name}`)
      await performAttack(attacker.ID, target.ID, attack)
    }
    
    // Small delay before ending computer turn
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Check if battle is over after computer attack
    if (isBattleOver()) {
      const winner = getBattleWinner()
      console.log(`🏆 Battle over after computer attack! Winner: ${winner}`)
      
      // Update battle status
      setBattleState(prev => ({
        ...prev,
        battleStatus: winner === 'player' ? 'victory' : 'defeat'
      }))
      
      if (contextRef.current) {
        contextRef.current.state.battleStatus = winner === 'player' ? 'victory' : 'defeat'
      }
      return // Don't continue turn progression
    }
  }, [getAliveCreatures, performAttack, isBattleOver, getBattleWinner])

  /**
   * Execute player autopilot turn (AI for player)
   */
  const executePlayerAutopilot = useCallback(async () => {
    console.log('🤖 Player autopilot turn starting...')
    
    const alivePlayerCreatures = getAliveCreatures('player')
    const aliveEnemies = getAliveCreatures('computer')
    
    if (alivePlayerCreatures.length > 0 && aliveEnemies.length > 0) {
      // Use first alive player creature as attacker
      const attacker = alivePlayerCreatures[0]
      
      // Use AI to select best target (weakest enemy)
      const target = selectBestTarget(aliveEnemies, 'weakest')
      
      if (!target) {
        console.warn('⚠️ Autopilot could not find a target')
        return
      }
      
      // Use AI to select attack (basic for now)
      const attack = selectAttack(attacker, target, 'basic')
      
      console.log(`🤖 Autopilot: ${attacker.name} attacks ${target.name}`)
      await performAttack(attacker.ID, target.ID, attack)
    }
    
    // Apply autopilot speed delay
    await new Promise(resolve => setTimeout(resolve, autopilotSpeed))
    
    // Check if battle is over after player autopilot attack
    if (isBattleOver()) {
      const winner = getBattleWinner()
      console.log(`🏆 Battle over after autopilot attack! Winner: ${winner}`)
      
      // Update battle status
      setBattleState(prev => ({
        ...prev,
        battleStatus: winner === 'player' ? 'victory' : 'defeat'
      }))
      
      if (contextRef.current) {
        contextRef.current.state.battleStatus = winner === 'player' ? 'victory' : 'defeat'
      }
      return // Don't continue turn progression
    }
  }, [getAliveCreatures, performAttack, isBattleOver, getBattleWinner, autopilotSpeed])

  /**
   * End current turn and process status effects
   */
  const endTurn = useCallback(async () => {
    console.log('🔄 Ending turn...')
    
    // 1. Process end-of-turn status ticks
    await processEndOfTurn()
    
    // 2. Check for battle over
    if (isBattleOver()) {
      const winner = getBattleWinner()
      console.log(`🏆 Battle over! Winner: ${winner}`)
      
      // Update battle status
      setBattleState(prev => ({
        ...prev,
        battleStatus: winner === 'player' ? 'victory' : 'defeat'
      }))
      
      if (contextRef.current) {
        contextRef.current.state.battleStatus = winner === 'player' ? 'victory' : 'defeat'
      }
      return
    }
    
    // 3. Advance turn counter and switch owner
    const newTurn = battleState.turn + 1
    const newOwner = battleState.currentTurnOwner === 'player' ? 'computer' : 'player'
    
    console.log(`📊 Turn ${newTurn}, ${newOwner}'s turn`)
    
    // 4. Update state
    setBattleState(prev => ({
      ...prev,
      turn: newTurn,
      currentTurnOwner: newOwner
    }))
    
    if (contextRef.current) {
      contextRef.current.state.turn = newTurn
      contextRef.current.state.currentTurnOwner = newOwner
    }
    
    // 5. If computer turn, trigger AI after a short delay
    if (newOwner === 'computer') {
      setTimeout(async () => {
        await executeComputerTurn()
        
        // Small delay to ensure turn transition shows
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // After computer acts, switch back to player turn
        // Use functional update to get the latest turn value
        setBattleState(prev => {
          const nextTurn = prev.turn + 1 // Increment for player turn
          
          if (contextRef.current) {
            contextRef.current.state.turn = nextTurn
            contextRef.current.state.currentTurnOwner = 'player'
          }
          
          console.log(`📊 Turn ${nextTurn}, player's turn`)
          
          return {
            ...prev,
            turn: nextTurn,
            currentTurnOwner: 'player'
          }
        })
        
        // 6. If autopilot is enabled, trigger player autopilot after a delay
        if (isAutopilotEnabled) {
          setTimeout(async () => {
            await executePlayerAutopilot()
            // After autopilot acts, end turn to continue the cycle
            await endTurn()
          }, 500)
        }
      }, 1000)
    } else if (newOwner === 'player' && isAutopilotEnabled) {
      // If it's player turn and autopilot is enabled, trigger autopilot
      setTimeout(async () => {
        await executePlayerAutopilot()
        // After autopilot acts, end turn
        await endTurn()
      }, 500)
    }
  }, [battleState, processEndOfTurn, isBattleOver, getBattleWinner, executeComputerTurn, executePlayerAutopilot, isAutopilotEnabled])

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
    applyShield,

    // Combat helpers
    performAttack,
    performTrueDamageAttack,
    performHeal,
    performHealing: performHeal, // Alias for backward compatibility
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
    endTurn,
    executeComputerTurn,
    executePlayerAutopilot,

    // Autopilot
    isAutopilotEnabled,
    setIsAutopilotEnabled,
    autopilotSpeed,
    setAutopilotSpeed,

    // Event Log
    getEventLog,
    clearEventLog,

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