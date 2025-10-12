// Play Animations - Execute visual effects with two-phase completion
// Renamed from: animationEngine.ts / executeAnimationsSequentially

import { Animation } from './types'
import { executeAnimationsSequentially } from './animationEngine'

/**
 * Play animations with two-phase completion
 * Renamed from: executeAnimationsSequentially
 * 
 * Phase 1 (Impact): Damage numbers appear, returns immediately
 * Phase 2 (Complete): Damage numbers fade out, finisher resolves
 * 
 * @param animations - Array of animations to play
 * @returns Finisher function that waits for full completion
 */
export const playAnims = async (
  animations: Animation[]
): Promise<() => Promise<void>> => {
  console.group(`🎬 Playing ${animations.length} animations`)
  
  if (animations.length === 0) {
    console.log('No animations to play')
    console.groupEnd()
    return async () => {}
  }
  
  // Execute animations (returns finisher function)
  const finisher = await executeAnimationsSequentially(animations)
  
  console.log('✅ Impact phase complete (damage numbers visible)')
  console.groupEnd()
  
  // Return the finisher function
  return async () => {
    console.log('⏳ Waiting for animations to fully complete...')
    await finisher()
    console.log('✅ All animations complete')
  }
}

// ============================================================================
// BACKWARDS COMPATIBILITY
// ============================================================================

/**
 * @deprecated Use playAnims() instead
 */
export { executeAnimationsSequentially }
