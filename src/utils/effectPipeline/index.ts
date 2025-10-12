// Effect Pipeline System - Main exports
export * from './types'
export * from './effectPipelineEngine'
export * from './effectPipeline'
export * from './effectResolver'
export * from './effectApplicatorRegistry'
export * from './animationEngine'
export * from './battleContext'

// Effect definitions
export * from './effects/statusEffects'
export * from './effects/combatEffects'
export * from './effects/utilityEffects'
export * from './effects/triggerSetup'

// React integration
export * from './hooks/useBattleEngine'

// Re-export main hook for convenience
export { useBattleEngine as useEffectPipeline } from './hooks/useBattleEngine'