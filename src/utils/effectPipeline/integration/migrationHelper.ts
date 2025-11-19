// Migration Helper - Helps integrate Effect Pipeline with existing battle system
import { Creature, AttackPayload, State } from '../../../consts/types/types'
import { BattleState, Effect } from '../types'
import { 
  createAttackEffect, 
  createLifeDrainEffect,
  createBurnEffect, 
  createPoisonEffect, 
  createRegenerationEffect 
} from '../factories'

/**
 * Converts your existing State to the new BattleState format
 */
export const convertStateToBattleState = (state: State): BattleState => {
  return {
    playerCreatures: state.playerCreatures,
    computerCreatures: state.computerCreatures,
    mp: state.mp,
    turn: state.turn,
    currentTurnOwner: null,  // Legacy state doesn't have this, default to null
    battleStatus: (state.battleStatus === 'in-progress' || state.battleStatus === 'victory' || state.battleStatus === 'defeat') 
      ? state.battleStatus 
      : null
  }
}

/**
 * Converts BattleState back to your existing State format (for gradual migration)
 */
export const convertBattleStateToState = (battleState: BattleState, originalState: State): State => {
  return {
    ...originalState,
    playerCreatures: battleState.playerCreatures,
    computerCreatures: battleState.computerCreatures,
    mp: battleState.mp,
    turn: battleState.turn,
    battleStatus: battleState.battleStatus
  }
}

/**
 * Creates an effect from your existing AttackPayload format
 */
export const createEffectFromAttackPayload = (attackPayload: AttackPayload): Effect => {
  const { attacker, target, attack } = attackPayload

  return createAttackEffect(attacker.ID, target.ID, attack)
}

/**
 * Wrapper function to apply your existing status effects using the new system
 */
export const applyExistingStatusEffect = (
  creature: Creature,
  statusEffectName: string,
  attackPayload?: AttackPayload
): Effect | null => {
  switch (statusEffectName) {
    case 'applyBurn':
      return createBurnEffect(creature.ID, 5)

    case 'applyPoison':
      return createPoisonEffect(creature.ID, 10)

    case 'applyRegeneration':
      return createRegenerationEffect(creature.ID, 5)

    default:
      console.warn(`⚠️ Unknown status effect: ${statusEffectName}`)
      return null
  }
}

/**
 * Migration wrapper for your existing performAttack function
 * This allows you to gradually migrate by using the new system inside the old interface
 */
export const migratedPerformAttack = async (
  attackPayload: AttackPayload,
  applyEffectFn: (effect: Effect) => Promise<void>
): Promise<void> => {
  console.log('🔄 Using migrated performAttack with Effect Pipeline')

  const effect = createEffectFromAttackPayload(attackPayload)
  await applyEffectFn(effect)
}

/**
 * Helper to migrate your existing status effect functions
 * This creates a bridge between old and new systems
 */
export const createStatusEffectBridge = (
  applyEffectFn: (effect: Effect) => Promise<void>
) => {
  return {
    applyBurn: async (creature: Creature, statusEffectObj: any, attackPayload?: AttackPayload) => {
      const effect = createBurnEffect(creature.ID, 5)
      await applyEffectFn(effect)
      return creature // Return for compatibility
    },

    applyPoison: async (creature: Creature, statusEffectObj: any, attackPayload?: AttackPayload) => {
      const effect = createPoisonEffect(creature.ID, 10)
      await applyEffectFn(effect)
      return creature
    },

    applyRegeneration: async (creature: Creature, statusEffectObj: any, attackPayload?: AttackPayload) => {
      const effect = createRegenerationEffect(creature.ID, 5)
      await applyEffectFn(effect)
      return creature
    }
  }
}

/**
 * Helper to determine if a creature state change should trigger death
 */
export const shouldTriggerDeath = (creature: Creature): boolean => {
  return creature.health <= 0
}

/**
 * Converts your existing creature to the new format if needed
 */
export const ensureCreatureCompatibility = (creature: Creature): Creature => {
  // Add any missing properties or conversions needed
  return {
    ...creature,
    statuses: creature.statuses || [] // Ensure statuses array exists
  }
}

/**
 * Helper to get the appropriate damage calculation based on your existing system
 */
export const calculateDamageFromExistingSystem = (
  attacker: Creature,
  target: Creature,
  attack: any
): number => {
  // Use your existing damage calculation logic
  const baseDamage = attack.damage + attacker.attack
  const defense = target.defense
  return Math.max(1, baseDamage - defense)
}

/**
 * Migration guide steps for gradual conversion
 */
export const getMigrationSteps = () => {
  return [
    {
      step: 1,
      title: "Set up Effect Pipeline alongside existing system",
      description: "Install and initialize the Effect Pipeline without removing useReducer",
      code: `
// In your component
import { useBattleEngine } from './utils/effectPipeline'
import { convertStateToBattleState } from './utils/effectPipeline/integration/migrationHelper'

const YourBattleComponent = () => {
  const state = useStateContext() // Your existing useReducer state
  const dispatch = useDispatchContext()

  // New Effect Pipeline
  const battleState = convertStateToBattleState(state)
  const { applyEffect } = useBattleEngine(battleState)

  // Continue using your existing system for now
  // ...
}`
    },
    {
      step: 2,
      title: "Migrate status effects one by one",
      description: "Replace individual status effect calls with the new system",
      code: `
// Old way
dispatch({ type: 'UPDATE_CREATURE', creature: applyBurn(creature, statusObj) })

// New way
await applyBurn(creature.ID, 5)
`
    },
    {
      step: 3,
      title: "Migrate attack system",
      description: "Replace performAttack calls with the new effect system",
      code: `
// Old way
await performAttack(attackPayload)

// New way
const effect = createEffectFromAttackPayload(attackPayload)
await applyEffect(effect)
`
    },
    {
      step: 4,
      title: "Remove useReducer dependencies",
      description: "Once all effects are migrated, remove the old useReducer system",
      code: `
// Remove GameContext.tsx usage
// Remove dispatch prop passing
// Remove manual UPDATE_CREATURE dispatches
// Use only Effect Pipeline system
`
    }
  ]
}

/**
 * Validation helper to ensure migration is working correctly
 */
export const validateMigration = (
  oldState: State,
  newBattleState: BattleState
): { isValid: boolean; issues: string[] } => {
  const issues: string[] = []

  // Check creature count
  if (oldState.playerCreatures.length !== newBattleState.playerCreatures.length) {
    issues.push('Player creature count mismatch')
  }

  if (oldState.computerCreatures.length !== newBattleState.computerCreatures.length) {
    issues.push('Computer creature count mismatch')
  }

  // Check creature health values
  oldState.playerCreatures.forEach((oldCreature, index) => {
    const newCreature = newBattleState.playerCreatures[index]
    if (newCreature && oldCreature.health !== newCreature.health) {
      issues.push(`Player creature ${index} health mismatch: ${oldCreature.health} vs ${newCreature.health}`)
    }
  })

  oldState.computerCreatures.forEach((oldCreature, index) => {
    const newCreature = newBattleState.computerCreatures[index]
    if (newCreature && oldCreature.health !== newCreature.health) {
      issues.push(`Computer creature ${index} health mismatch: ${oldCreature.health} vs ${newCreature.health}`)
    }
  })

  return {
    isValid: issues.length === 0,
    issues
  }
}

/**
 * Test helper to ensure effects are working correctly
 */
export const runEffectTests = async (
  applyEffectFn: (effect: Effect) => Promise<void>,
  getCreatureById: (id: number) => Creature | null
) => {
  console.log('🧪 Running effect pipeline tests')

  const testResults: { test: string; passed: boolean; error?: string }[] = []

  try {
    // Test 1: Burn effect
    const testCreature = getCreatureById(1)
    if (testCreature) {
      const initialHealth = testCreature.health
      await applyEffectFn(createBurnEffect(1, 10))

      const updatedCreature = getCreatureById(1)
      const healthReduced = updatedCreature && updatedCreature.health < initialHealth

      testResults.push({
        test: 'Burn Effect',
        passed: Boolean(healthReduced),
        error: healthReduced ? undefined : 'Health was not reduced'
      })
    }

    // More tests could be added here...

  } catch (error) {
    testResults.push({
      test: 'General Test',
      passed: false,
      error: String(error)
    })
  }

  console.log('🧪 Test results:', testResults)
  return testResults
}