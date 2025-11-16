// Handler Registration - Register all effect handlers with the registry

import { registerHandler } from './registry'
import {
  calcDamage,
  calcTrueDamage,
  calcHealing,
  calcLifeDrain,
  calcBurn,
  calcPoison,
  calcRegeneration,
  handleDeath
} from './handlers'

/**
 * Register all effect handlers
 * Call this once at application startup
 */
export const registerAllHandlers = (): void => {
  console.log('📝 Registering all effect handlers...')

  // Combat handlers
  registerHandler('ATTACK', calcDamage)
  registerHandler('TRUE_DAMAGE', calcTrueDamage)
  registerHandler('HEAL', calcHealing)
  registerHandler('LIFE_DRAIN', calcLifeDrain)

  // Status effect handlers
  registerHandler('BURN', calcBurn)
  registerHandler('POISON', calcPoison)
  registerHandler('REGENERATION', calcRegeneration)

  // Death handler
  registerHandler('DEATH', handleDeath)

  console.log('✅ All handlers registered')
}
