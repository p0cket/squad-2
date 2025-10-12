// Core types for the Effect Pipeline System
import { Creature, AttackPayload } from "../../consts/types/types"

export type StateChangeType =
  | 'HEALTH_CHANGE'
  | 'STATUS_APPLIED'
  | 'STATUS_REMOVED'
  | 'CREATURE_MOVED'
  | 'CREATURE_DIED'
  | 'STAT_MODIFIED'

export type StateChange = {
  type: StateChangeType
  creatureId: number
  timestamp: number
  data: any
}

export type HealthChange = StateChange & {
  type: 'HEALTH_CHANGE'
  data: {
    delta: number
    newHealth: number
    source: string
  }
}

export type StatusChange = StateChange & {
  type: 'STATUS_APPLIED' | 'STATUS_REMOVED'
  data: {
    statusId: string
    duration?: number
    source: string
  }
}

export type CreatureMovement = StateChange & {
  type: 'CREATURE_MOVED'
  data: {
    fromPosition: number
    toPosition: number | 'back'
    reason: string
  }
}

export type Animation = {
  type: string
  targetId: number
  duration: number
  data?: any
}

export type Effect = {
  id: string
  type: string // Effect type identifier for applicator lookup (e.g., 'ATTACK', 'HEAL', 'STATUS_APPLY')
  targetId: number
  priority?: number
  data: any // Serializable effect-specific payload
}

// Result of applying an effect
export type EffectApplicationResult = {
  stateChanges: StateChange[]
  animations: Animation[]
}

// Pure function that applies an effect and returns state changes + animations
export type EffectApplicator = (
  effect: Effect,
  context: BattleContext
) => Promise<EffectApplicationResult>

export type EffectNode = {
  effect: Effect
  priority: number
  id: string
}

export type EffectPipeline = {
  queue: Effect[]
  processed: Set<string>
}

export type EffectChain = {
  effect: Effect
  context: BattleContext
}

export type BattleState = {
  playerCreatures: Creature[]
  computerCreatures: Creature[]
  mp: number
  turn: number
  battleStatus: string | null
}

export type BattleContext = {
  contextId?: string // For debugging context instance issues
  state: BattleState
  stateHistory: BattleState[]
  subscribers: Map<string, Function[]>
}

export type TriggerRule = {
  condition: (change: StateChange, context: BattleContext) => boolean
  createEffect: (change: StateChange, context: BattleContext) => Effect
  priority?: number
}

export type EffectPipelineState = {
  isProcessing: boolean
  effectQueue: EffectChain[]
}