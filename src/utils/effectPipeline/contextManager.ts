// Context Manager - Unified interface for both native and Zustand contexts
import { BattleContext, StateChange, BattleState } from './types'
import { 
  applyChangesToContext as nativeApply, 
  notifyContextSubscribers as nativeNotify 
} from './battleContext'
import { 
  recordChangesZustand,
  updateDisplayZustand,
  // Deprecated functions (kept for backwards compatibility)
  applyChangesToZustandContext,
  notifyZustandContextSubscribers 
} from './zustandAdapter'

// Type guard to check if context has a Zustand store attached
export const isZustandContext = (context: BattleContext): boolean => {
  // Zustand contexts will have a special marker we can check
  // For now, we'll use the contextId pattern - Zustand ones have a specific format
  return context.contextId?.startsWith('zustand-') || false
}

/**
 * Unified apply changes function that works with both contexts
 */
export const applyChangesToAnyContext = (
  context: BattleContext,
  changes: StateChange[],
  options?: { notify?: boolean; deferNotification?: boolean }
): void => {
  // For now, just use native - the Zustand adapter's proxy should handle it
  // In the future, we could add detection logic here
  nativeApply(context, changes, options)
}

/**
 * Unified notify function that works with both contexts
 */
export const notifyAnyContextSubscribers = (
  context: BattleContext,
  changes: StateChange[]
): void => {
  // For now, just use native - the Zustand adapter's proxy should handle it
  nativeNotify(context, changes)
}
