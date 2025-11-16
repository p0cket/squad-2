// Record Changes - Save state changes to the battle context
// Renamed from: applyChangesToContext (part of it)

import { StateChange, BattleContext } from './types'
import { applyChangesToContext } from './battleContext'

/**
 * Record state changes to the battle context
 * Renamed from: applyChangesToContext
 * 
 * @param context - The battle context
 * @param changes - Array of state changes to apply
 */
export const recordChanges = (
  context: BattleContext,
  changes: StateChange[]
): void => {
  console.group(`💾 Recording ${changes.length} changes`)
  
  changes.forEach((change, i) => {
    console.log(`Change ${i + 1}:`, change.type, change)
  })
  
  // Apply changes without notifying (deferred)
  applyChangesToContext(context, changes, { deferNotification: true })
  
  console.log('✅ Changes recorded to context')
  console.groupEnd()
}

// ============================================================================
// BACKWARDS COMPATIBILITY
// ============================================================================

/**
 * @deprecated recordChanges() already calls applyChangesToContext internally
 * Use recordChanges() for new code
 */
export { applyChangesToContext }
