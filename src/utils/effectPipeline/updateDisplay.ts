// Update Display - Notify React components to re-render
// Renamed from: notifyContextSubscribers

import { StateChange, BattleContext } from './types'
import { notifyContextSubscribers } from './battleContext'

/**
 * Update the display by notifying all subscribers
 * Renamed from: notifyContextSubscribers
 * 
 * @param context - The battle context
 * @param changes - Array of state changes that occurred
 */
export const updateDisplay = (
  context: BattleContext,
  changes: StateChange[] = []
): void => {
  console.log(`📢 Notifying ${context.subscribers.size} subscriber groups`)
  
  // Notify all subscribers
  notifyContextSubscribers(context, changes)
  
  console.log('✅ Display updated')
}

// ============================================================================
// BACKWARDS COMPATIBILITY
// ============================================================================

/**
 * @deprecated Use updateDisplay() instead
 */
export { notifyContextSubscribers }
