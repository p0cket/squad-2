// Battle Context - Manages battle state and change tracking
import { BattleState, BattleContext, StateChange, HealthChange, StatusChange, CreatureMovement } from './types'
import { Creature } from '../../consts/types/types'

// Simple structuredClone polyfill for compatibility
const safeClone = <T>(obj: T): T => {
  if (typeof structuredClone !== 'undefined') {
    return structuredClone(obj)
  }
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Creates a new battle context with the given initial state
 */
export const createBattleContext = (initialState: BattleState): BattleContext => {
  const contextId = Math.random().toString(36).substr(2, 9)
  // Battle context created

  const context: BattleContext = {
    contextId,
    state: initialState,
    stateHistory: [],
    subscribers: new Map()
  }

  return context
}

/**
 * Applies state changes to the battle context immutably
 */
export const applyChangesToContext = (
  context: BattleContext,
  changes: StateChange[],
  options: { notify?: boolean; deferNotification?: boolean } = {}
): void => {
  const { notify = true, deferNotification = false } = options

  console.log(`🔄 applyChangesToContext called with ${changes.length} changes`, {
    changes: changes.map(c => ({ type: c.type, creatureId: c.creatureId })),
    notify,
    deferNotification
  })

  if (changes.length === 0) return

  // Save history for potential rollback
  context.stateHistory.push(safeClone(context.state))

  // Apply changes one by one
  changes.forEach(change => {
    console.log(`  🔸 Applying change: ${change.type} to creature ${change.creatureId}`)
    const oldState = context.state
    const newState = applyStateChange(context.state, change)
    console.log(`  🔸 Old state health: ${oldState.computerCreatures[0]?.health}`)
    console.log(`  🔸 New state health: ${newState.computerCreatures[0]?.health}`)
    console.log(`  🔸 Assigning new state to context...`)
    context.state = newState
    console.log(`  🔸 After assignment, context.state health: ${context.state.computerCreatures[0]?.health}`)
  })

  // Notify subscribers unless deferred
  if (notify && !deferNotification) {
    notifySubscribers(context, changes)
  }

  // Limit history size to prevent memory issues
  if (context.stateHistory.length > 50) {
    context.stateHistory.shift()
  }
}

/**
 * Manually trigger subscriber notifications (for deferred updates)
 */
export const notifyContextSubscribers = (
  context: BattleContext,
  changes: StateChange[] = []
): void => {
  notifySubscribers(context, changes)
}

/**
 * Applies a single state change to the battle state
 */
const applyStateChange = (state: BattleState, change: StateChange): BattleState => {
  switch (change.type) {
    case 'HEALTH_CHANGE':
      return applyHealthChange(state, change as HealthChange)

    case 'STATUS_APPLIED':
    case 'STATUS_REMOVED':
      return applyStatusChange(state, change as StatusChange)

    case 'CREATURE_MOVED':
      return applyCreatureMovement(state, change as CreatureMovement)

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
 * Applies health change to a creature
 */
const applyHealthChange = (state: BattleState, change: HealthChange): BattleState => {
  const { creatureId, data } = change

  console.log('❤️❤️❤️ applyHealthChange in battleContext.ts:', {
    creatureId,
    delta: data.delta,
    currentHealth: state.computerCreatures.find(c => c.ID === creatureId)?.health
  })

  const newState = {
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

  console.log('❤️❤️❤️ After health change, new health:', {
    creatureId,
    newHealth: newState.computerCreatures.find(c => c.ID === creatureId)?.health
  })

  return newState
}

/**
 * Applies status effect changes to a creature
 */
const applyStatusChange = (state: BattleState, change: StatusChange): BattleState => {
  const { creatureId, data, type } = change
  // Processing status change

  const updateStatuses = (creature: Creature): Creature => {
    if (type === 'STATUS_APPLIED') {
      // Add or update status
      const existingStatusIndex = creature.statuses.findIndex(s => s.id === data.statusId)

      if (existingStatusIndex >= 0) {
        // Update existing status duration
        const updatedStatuses = [...creature.statuses]
        updatedStatuses[existingStatusIndex] = {
          ...updatedStatuses[existingStatusIndex],
          duration: data.duration || updatedStatuses[existingStatusIndex].duration
        }
        return { ...creature, statuses: updatedStatuses }
      } else {
        // Add new status (you'll need to implement getStatusEffectById)
        const statusEffect = getStatusEffectById(data.statusId)
        if (statusEffect) {
          return {
            ...creature,
            statuses: [...creature.statuses, {
              ...statusEffect,
              duration: data.duration || statusEffect.duration
            }]
          }
        }
      }
    } else {
      // Remove status
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
 * Applies creature movement (like moving to back when dead)
 */
const applyCreatureMovement = (state: BattleState, change: CreatureMovement): BattleState => {
  const { creatureId, data } = change
  // Moving creature

  const moveCreatureInArray = (creatures: Creature[]): Creature[] => {
    const creatureIndex = creatures.findIndex(c => c.ID === creatureId)
    if (creatureIndex === -1) return creatures

    const newCreatures = [...creatures]
    const [creature] = newCreatures.splice(creatureIndex, 1)

    if (data.toPosition === 'back') {
      // Move to back of array
      newCreatures.push(creature)
    } else if (typeof data.toPosition === 'number') {
      // Move to specific position
      newCreatures.splice(data.toPosition, 0, creature)
    }

    return newCreatures
  }

  return {
    ...state,
    playerCreatures: moveCreatureInArray(state.playerCreatures),
    computerCreatures: moveCreatureInArray(state.computerCreatures)
  }
}

/**
 * Handles creature death logic
 */
const applyCreatureDeath = (state: BattleState, change: StateChange): BattleState => {
  // Processing creature death

  // Move dead creature to back and update any death-related state
  return applyCreatureMovement(state, {
    ...change,
    type: 'CREATURE_MOVED',
    data: {
      fromPosition: 0, // Assume they were in front
      toPosition: 'back',
      reason: 'death'
    }
  } as CreatureMovement)
}

/**
 * Applies stat modifications to a creature
 */
const applyStatModification = (state: BattleState, change: StateChange): BattleState => {
  const { creatureId, data } = change
  // Applying stat modification

  return {
    ...state,
    playerCreatures: updateCreatureInArray(state.playerCreatures, creatureId, creature => ({
      ...creature,
      [data.statName]: creature[data.statName as keyof Creature] + data.value
    })),
    computerCreatures: updateCreatureInArray(state.computerCreatures, creatureId, creature => ({
      ...creature,
      [data.statName]: creature[data.statName as keyof Creature] + data.value
    }))
  }
}

/**
 * Helper function to update a creature in an array if it exists
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
 * Subscribes to context changes
 */
export const subscribeToContext = (
  context: BattleContext,
  selector: string,
  callback: Function
): () => void => {
  if (!context.subscribers.has(selector)) {
    context.subscribers.set(selector, [])
  }

  const callbacks = context.subscribers.get(selector)!
  callbacks.push(callback)

  // Return unsubscribe function
  return () => {
    const index = callbacks.indexOf(callback)
    if (index > -1) {
      callbacks.splice(index, 1)
    }
  }
}

/**
 * Notifies subscribers of state changes
 */
const notifySubscribers = (context: BattleContext, changes: StateChange[]): void => {
  const changeTypes = [...new Set(changes.map(c => c.type))]

  changeTypes.forEach(changeType => {
    const subscribers = context.subscribers.get(changeType) || []
    const relevantChanges = changes.filter(c => c.type === changeType)

    subscribers.forEach(callback => {
      try {
        callback(relevantChanges, context.state)
      } catch (error) {
        console.error(`💥 Error in subscriber callback for ${changeType}:`, error)
      }
    })
  })

  // Also notify 'all' subscribers
  const allSubscribers = context.subscribers.get('all') || []
  allSubscribers.forEach(callback => {
    try {
      callback(changes, context.state)
    } catch (error) {
      console.error('💥 Error in general subscriber callback:', error)
    }
  })
}

/**
 * Gets the current state snapshot (for React integration)
 */
export const getContextState = (context: BattleContext): BattleState => {
  return safeClone(context.state)
}

/**
 * Rollback to previous state (useful for debugging/undo)
 */
export const rollbackContext = (context: BattleContext): boolean => {
  if (context.stateHistory.length === 0) {
    console.warn('⚠️ No history available for rollback')
    return false
  }

  const previousState = context.stateHistory.pop()!
  context.state = previousState
  // Rolled back to previous state
  return true
}

/**
 * Helper function to get status effect by ID (integrates with existing status system)
 */
const getStatusEffectById = (statusId: string) => {
  // Import the existing status effects from your system
  const STATUS_EFFECTS: { [key: string]: any } = {
    POISON: {
      name: "Poison",
      type: "debuff",
      timing: "afterAttack",
      duration: 3,
      effectFuncName: "applyPoison",
      chance: 1,
      icon: "🧪",
      id: "POISON",
      notes: "Deals damage over time.",
    },
    BUFF: {
      name: "Buff",
      type: "buff",
      timing: "beforeAttack",
      duration: 2,
      effectFuncName: "applyBuff",
      chance: 1,
      icon: "✨",
      id: "BUFF",
      notes: "Increases attack power.",
    },
    BURN: {
      name: "Burn",
      type: "debuff",
      timing: "afterAttack",
      duration: 3,
      effectFuncName: "applyBurn",
      chance: 1,
      icon: "🔥",
      id: "BURN",
      notes: "Deals fire damage over time.",
    },
    STUN: {
      name: "Stun",
      type: "debuff",
      timing: "beforeAttack",
      duration: 2,
      effectFuncName: "applyStun",
      chance: 1,
      icon: "⚡",
      id: "STUN",
      notes: "Prevents enemy from acting.",
    },
    ATTACK_BUFF: {
      name: "Attack Buff",
      type: "buff",
      timing: "beforeAttack",
      duration: 3,
      effectFuncName: "applyAttackBuff",
      chance: 1,
      icon: "💪",
      id: "ATTACK_BUFF",
      notes: "Increases attack power for a few turns.",
    },
    ATTACK_DEBUFF: {
      name: "Attack Debuff",
      type: "debuff",
      timing: "beforeAttack",
      duration: 3,
      effectFuncName: "applyAttackDebuff",
      chance: 1,
      icon: "⚔️⬇️",
      id: "ATTACK_DEBUFF",
      notes: "Reduces attack power for a few turns.",
    },
    REGENERATION: {
      name: "Regeneration",
      type: "buff",
      timing: "afterAttack",
      duration: 3,
      effectFuncName: "applyRegeneration",
      chance: 1,
      icon: "💚",
      id: "REGENERATION",
      notes: "Restores health over time.",
    },
    DEFENSE_BUFF: {
      name: "Defense Buff",
      type: "buff",
      timing: "beforeAttack",
      duration: 3,
      effectFuncName: "applyDefenseBuff",
      chance: 1,
      icon: "🛡️",
      id: "DEFENSE_BUFF",
      notes: "Increases defense.",
    }
  }

  return STATUS_EFFECTS[statusId] || null
}