// Zustand Adapter - Wraps Zustand store with BattleContext-compatible API
import { create } from 'zustand'
import { BattleState, BattleContext, StateChange } from './types'
import { Creature, StatusEffect } from '../../consts/types/types'
import { STATUS_EFFECTS } from '../../consts/statuses'

// Simple structuredClone polyfill for compatibility
const safeClone = <T>(obj: T): T => {
  if (typeof structuredClone !== 'undefined') {
    return structuredClone(obj)
  }
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Zustand Store Type - Internal representation
 */
type BattleStore = {
  // Core state
  state: BattleState
  stateHistory: BattleState[]
  subscribers: Map<string, Function[]>
  contextId: string

  // Actions
  setState: (newState: BattleState) => void
  pushHistory: () => void
  subscribe: (selector: string, callback: Function) => () => void
  notifySubscribers: (changes: StateChange[]) => void
  clearHistory: () => void
}

/**
 * Creates a Zustand-backed BattleContext store
 */
export const createZustandBattleStore = (initialState: BattleState) => {
  const contextId = 'zustand-' + Math.random().toString(36).substr(2, 9)
  console.log('🎯 Creating Zustand battle store:', contextId)
  
  return create<BattleStore>((set, get) => ({
    state: initialState,
    stateHistory: [],
    subscribers: new Map(),
    contextId,

    setState: (newState: BattleState) => {
      console.log('📝 Zustand setState called:', {
        playerHealth: newState.playerCreatures[0]?.health,
        computerHealth: newState.computerCreatures[0]?.health
      })
      set({ state: newState })
    },

    pushHistory: () => {
      const currentState = get().state
      const history = get().stateHistory
      
      // Clone and add to history
      const clonedState = safeClone(currentState)
      const newHistory = [...history, clonedState]
      
      // Limit history size to prevent memory issues
      if (newHistory.length > 50) {
        newHistory.shift()
      }
      
      set({ stateHistory: newHistory })
    },

    subscribe: (selector: string, callback: Function) => {
      console.log('🔌 Zustand subscribe called for selector:', selector)
      const subscribers = get().subscribers
      
      if (!subscribers.has(selector)) {
        subscribers.set(selector, [])
      }
      
      const callbacks = subscribers.get(selector)!
      callbacks.push(callback)
      console.log('📊 Total subscribers for', selector, ':', callbacks.length)
      
      // Update the map reference to trigger Zustand update
      set({ subscribers: new Map(subscribers) })
      
      // Return unsubscribe function
      return () => {
        const currentSubscribers = get().subscribers
        const currentCallbacks = currentSubscribers.get(selector)
        if (currentCallbacks) {
          const index = currentCallbacks.indexOf(callback)
          if (index > -1) {
            currentCallbacks.splice(index, 1)
          }
        }
      }
    },

    notifySubscribers: (changes: StateChange[]) => {
      console.log('📢 Zustand notifySubscribers called:', {
        changeCount: changes.length,
        changeTypes: changes.map(c => c.type)
      })
      const subscribers = get().subscribers
      const changeTypes = [...new Set(changes.map(c => c.type))]
      
      changeTypes.forEach(changeType => {
        const subs = subscribers.get(changeType) || []
        const relevantChanges = changes.filter(c => c.type === changeType)
        
        subs.forEach(callback => {
          try {
            callback(relevantChanges, get().state)
          } catch (error) {
            console.error(`💥 Error in subscriber callback for ${changeType}:`, error)
          }
        })
      })
      
      // Also notify 'all' subscribers
      const allSubs = subscribers.get('all') || []
      allSubs.forEach(callback => {
        try {
          callback(changes, get().state)
        } catch (error) {
          console.error('💥 Error in subscriber callback for "all":', error)
        }
      })
    },

    clearHistory: () => {
      set({ stateHistory: [] })
    }
  }))
}

/**
 * Adapter: Converts Zustand store to BattleContext-compatible interface
 */
export const zustandToBattleContext = (store: ReturnType<typeof createZustandBattleStore>): BattleContext => {
  const storeState = store.getState()
  
  return {
    contextId: storeState.contextId,
    get state() {
      return store.getState().state
    },
    set state(newState: BattleState) {
      console.log('🔵 Zustand context.state setter called - updating store')
      store.getState().setState(newState)
    },
    get stateHistory() {
      return store.getState().stateHistory
    },
    set stateHistory(history: BattleState[]) {
      store.setState({ stateHistory: history })
    },
    get subscribers() {
      return store.getState().subscribers
    },
    set subscribers(subs: Map<string, Function[]>) {
      store.setState({ subscribers: subs })
    }
  }
}

/**
 * Applies state changes to Zustand-backed context
 * @deprecated Use recordChangesZustand() + updateDisplayZustand() instead
 * Old pattern: applyChangesToZustandContext(store, changes, { deferNotification: false })
 * New pattern: recordChangesZustand(store, changes); updateDisplayZustand(store, changes)
 */
export const applyChangesToZustandContext = (
  store: ReturnType<typeof createZustandBattleStore>,
  changes: StateChange[],
  options: { notify?: boolean; deferNotification?: boolean } = {}
): void => {
  const { notify = true, deferNotification = false } = options

  // Show deprecation warning if not using new pattern
  if (!deferNotification) {
    console.warn('⚠️ DEPRECATED: applyChangesToZustandContext() - Use recordChangesZustand() + updateDisplayZustand() instead')
  }

  console.log('🔄 applyChangesToZustandContext:', {
    changeCount: changes.length,
    changeTypes: changes.map(c => c.type),
    notify,
    deferNotification
  })

  if (changes.length === 0) return

  const { pushHistory, setState, notifySubscribers } = store.getState()

  // Save history for potential rollback
  pushHistory()

  // Apply changes one by one
  let currentState = store.getState().state
  changes.forEach(change => {
    currentState = applyStateChange(currentState, change)
  })

  // Update state
  setState(currentState)

  // Notify subscribers unless deferred
  if (notify && !deferNotification) {
    notifySubscribers(changes)
  }
}

/**
 * Manually trigger subscriber notifications (for deferred updates)
 * @deprecated Use updateDisplayZustand() instead - cleaner naming
 */
export const notifyZustandContextSubscribers = (
  store: ReturnType<typeof createZustandBattleStore>,
  changes: StateChange[] = []
): void => {
  console.warn('⚠️ DEPRECATED: notifyZustandContextSubscribers() - Use updateDisplayZustand() instead')
  store.getState().notifySubscribers(changes)
}

/**
 * Subscribe to Zustand context changes
 */
export const subscribeToZustandContext = (
  store: ReturnType<typeof createZustandBattleStore>,
  selector: string,
  callback: Function
): () => void => {
  return store.getState().subscribe(selector, callback)
}

/**
 * Get current state snapshot
 */
export const getZustandContextState = (store: ReturnType<typeof createZustandBattleStore>): BattleState => {
  return safeClone(store.getState().state)
}

// ============================================================================
// NEW NAMING SCHEME (matches effect pipeline refactoring)
// ============================================================================

/**
 * Record state changes to the Zustand store (deferred notification)
 * New name for: applyChangesToZustandContext with deferNotification: true
 * 
 * This applies changes to the store but does NOT notify subscribers yet.
 * Call updateDisplayZustand() afterwards to trigger re-renders.
 * 
 * @param store - The Zustand battle store
 * @param changes - Array of state changes to apply
 */
export const recordChangesZustand = (
  store: ReturnType<typeof createZustandBattleStore>,
  changes: StateChange[]
): void => {
  console.group(`💾 [Zustand] Recording ${changes.length} changes`)
  
  changes.forEach((change, i) => {
    console.log(`Change ${i + 1}:`, change.type, change)
  })
  
  // Apply changes with deferred notification
  applyChangesToZustandContext(store, changes, { 
    notify: true,
    deferNotification: true 
  })
  
  console.log('✅ Changes recorded to Zustand store')
  console.groupEnd()
}

/**
 * Update the display by notifying all Zustand subscribers
 * New name for: notifyZustandContextSubscribers
 * 
 * Triggers React component re-renders by notifying all subscribers
 * of the state changes that occurred.
 * 
 * @param store - The Zustand battle store
 * @param changes - Array of state changes that occurred
 */
export const updateDisplayZustand = (
  store: ReturnType<typeof createZustandBattleStore>,
  changes: StateChange[] = []
): void => {
  const subscriberCount = store.getState().subscribers.size
  console.log(`📢 [Zustand] Notifying ${subscriberCount} subscriber groups`)
  
  // Notify all subscribers
  store.getState().notifySubscribers(changes)
  
  console.log('✅ Display updated')
}

/**
 * Rollback to previous state
 */
export const rollbackZustandContext = (store: ReturnType<typeof createZustandBattleStore>): boolean => {
  const { stateHistory } = store.getState()
  
  if (stateHistory.length === 0) {
    console.warn('⚠️ Cannot rollback: no history available')
    return false
  }

  const previousState = stateHistory[stateHistory.length - 1]
  const newHistory = stateHistory.slice(0, -1)

  store.setState({
    state: previousState,
    stateHistory: newHistory
  })

  return true
}

// ============================================================================
// State Change Application Logic (same as battleContext.ts)
// ============================================================================

/**
 * Applies a single state change to the battle state
 */
const applyStateChange = (state: BattleState, change: StateChange): BattleState => {
  console.log(`🔹 applyStateChange called for type: ${change.type}`)
  
  switch (change.type) {
    case 'HEALTH_CHANGE':
      console.log('  ➡️ Routing to applyHealthChange')
      return applyHealthChange(state, change as any)

    case 'STATUS_APPLIED':
    case 'STATUS_REMOVED':
      return applyStatusChange(state, change as any)

    case 'CREATURE_MOVED':
      return applyCreatureMovement(state, change as any)

    case 'CREATURE_DIED':
      return applyCreatureDeath(state, change)

    case 'STAT_MODIFIED':
      return applyStatModification(state, change)

    default:
      console.warn(`⚠️ Unknown state change type: ${change.type}`)
      return state
  }
}

/**
 * Applies health change to a creature using delta (not absolute values)
 */
const applyHealthChange = (state: BattleState, change: any): BattleState => {
  const { creatureId, data } = change

  console.log('💚 Zustand applying health change:', {
    creatureId,
    delta: data.delta,
    source: data.source
  })

  return {
    ...state,
    playerCreatures: updateCreatureInArray(state.playerCreatures, creatureId, creature => ({
      ...creature,
      health: Math.max(0, Math.min(creature.maxHealth, creature.health + data.delta))
    })),
    computerCreatures: updateCreatureInArray(state.computerCreatures, creatureId, creature => ({
      ...creature,
      health: Math.max(0, Math.min(creature.maxHealth, creature.health + data.delta))
    }))
  }
}

/**
 * Applies status effect changes to a creature
 */
const applyStatusChange = (state: BattleState, change: any): BattleState => {
  const { creatureId, data, type } = change

  console.log(`📊 Zustand applying status change:`, {
    type,
    creatureId,
    statusId: data.statusId,
    duration: data.duration,
    reason: data.reason
  })

  const updateStatuses = (creature: Creature): Creature => {
    if (type === 'STATUS_APPLIED') {
      console.log(`🔍 updateStatuses called for ${creature.name}, current statuses:`, creature.statuses.map(s => s.id))
      const existingStatusIndex = creature.statuses.findIndex(s => s.id === data.statusId)
      console.log(`🔍 existingStatusIndex for ${data.statusId}: ${existingStatusIndex}`)

      if (existingStatusIndex >= 0) {
        console.log(`🔄 Updating existing ${data.statusId} on ${creature.name} - duration: ${creature.statuses[existingStatusIndex].duration} → ${data.duration}`)
        console.log(`⚠️ UPDATING EXISTING STATUS - need to preserve damagePerTurn!`)
        const updatedStatuses = [...creature.statuses]
        updatedStatuses[existingStatusIndex] = {
          ...updatedStatuses[existingStatusIndex],
          duration: data.duration || updatedStatuses[existingStatusIndex].duration,
          damagePerTurn: data.damagePerTurn ?? updatedStatuses[existingStatusIndex].damagePerTurn,
          healPerTurn: data.healPerTurn ?? updatedStatuses[existingStatusIndex].healPerTurn,
          // Batch 2 properties
          damageMultiplier: data.damageMultiplier ?? updatedStatuses[existingStatusIndex].damageMultiplier,
          damageReflected: data.damageReflected ?? updatedStatuses[existingStatusIndex].damageReflected,
          healPercent: data.healPercent ?? updatedStatuses[existingStatusIndex].healPercent,
          dodgeChance: data.dodgeChance ?? updatedStatuses[existingStatusIndex].dodgeChance,
          reflectPercent: data.reflectPercent ?? updatedStatuses[existingStatusIndex].reflectPercent
        }
        return { ...creature, statuses: updatedStatuses }
      } else {
        console.log(`➕ Adding new ${data.statusId} to ${creature.name} with duration ${data.duration}`)
        console.log(`📊 Status data received:`, data)
        const statusEffect = getStatusEffectById(data.statusId)
        console.log(`📦 getStatusEffectById returned:`, statusEffect)
        if (statusEffect) {
          console.log(`💾 Storing damagePerTurn: ${data.damagePerTurn}, healPerTurn: ${data.healPerTurn}`)
          console.log(`💾 Storing Batch 2 - damageMultiplier: ${data.damageMultiplier}, damageReflected: ${data.damageReflected}, healPercent: ${data.healPercent}, dodgeChance: ${data.dodgeChance}, reflectPercent: ${data.reflectPercent}`)
          return {
            ...creature,
            statuses: [...creature.statuses, {
              ...statusEffect,
              duration: data.duration,
              damagePerTurn: data.damagePerTurn,  // Include dynamic damage value
              healPerTurn: data.healPerTurn,      // Include dynamic heal value
              // Batch 2 properties
              damageMultiplier: data.damageMultiplier,
              damageReflected: data.damageReflected,
              healPercent: data.healPercent,
              dodgeChance: data.dodgeChance,
              reflectPercent: data.reflectPercent
            }]
          }
        } else {
          console.error(`❌ getStatusEffectById returned undefined for ${data.statusId}!`)
        }
      }
    } else {
      // Remove status
      console.log(`❌ Removing ${data.statusId} from ${creature.name} (reason: ${data.reason})`)
      return {
        ...creature,
        statuses: creature.statuses.filter(s => s.id !== data.statusId)
      }
    }
    return creature
  }

  return {
    ...state,
    playerCreatures: updateCreatureInArray(state.playerCreatures, creatureId, updateStatuses),
    computerCreatures: updateCreatureInArray(state.computerCreatures, creatureId, updateStatuses)
  }
}

/**
 * Applies creature movement
 */
const applyCreatureMovement = (state: BattleState, change: any): BattleState => {
  // Movement logic would go here
  return state
}

/**
 * Handles creature death
 */
const applyCreatureDeath = (state: BattleState, change: StateChange): BattleState => {
  return {
    ...state,
    playerCreatures: updateCreatureInArray(state.playerCreatures, change.creatureId, creature => ({
      ...creature,
      health: 0
    })),
    computerCreatures: updateCreatureInArray(state.computerCreatures, change.creatureId, creature => ({
      ...creature,
      health: 0
    }))
  }
}

/**
 * Applies stat modifications
 */
const applyStatModification = (state: BattleState, change: StateChange): BattleState => {
  // Stat modification logic would go here
  return state
}

/**
 * Helper function to update a creature in an array immutably
 */
const updateCreatureInArray = (
  creatures: Creature[],
  creatureId: number,
  updateFn: (creature: Creature) => Creature
): Creature[] => {
  const creatureIndex = creatures.findIndex(c => c.ID === creatureId)
  if (creatureIndex === -1) return creatures

  const newCreatures = [...creatures]
  newCreatures[creatureIndex] = updateFn(newCreatures[creatureIndex])
  return newCreatures
}

/**
 * Get status effect by ID
 */
const getStatusEffectById = (statusId: string): StatusEffect | null => {
  const status = STATUS_EFFECTS[statusId]
  return status || null
}
