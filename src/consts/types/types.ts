import { RefObject } from "react"
import { Actions } from "./actionTypes"
import { AnimationQueue } from "../../utils/anim/AnimationQueue"
import { TargetSelector } from "../../utils/effectPipeline/targetResolver"

export type Rune = {
  id: number
  name: string
  type: string
  effect: string
  cost: number
  count: number
  // statEffect: { stat: keyof Creature; value: number }
  statEffect: { stat: keyof Creature; value: number }
  icon: string
}

export type Mod = {
  name: string
  duration: number
  remainingDuration: number
  type: string
  amount: number
  // icon: string
}

export type AttackPayload = {
  attacker: Creature
  target: Creature
  isPlayerAttack: boolean
  playerCreatureControlsRef: RefObject<any> // Replace 'any' with the actual type
  enemyCreatureControlsRef: RefObject<any> // Replace 'any' with the actual type
  attack: Attack // Replace 'any' with the actual type
  // dispatch: React.Dispatch<any>
  dispatch: EnhancedDispatch
  playerCreatures: Creature[]
  computerCreatures: Creature[]
}
export type Thunk<S, D> = (dispatch: D, getState: () => S) => void

export type EnhancedDispatch = React.Dispatch<
  Actions | Thunk<State, React.Dispatch<Actions>>
>

export type Attack = {
  template: string
  name: string
  attackType: string
  effects: string[]
  chanceToLand: number
  damage: number
  trueDamage: number
  icon: string
  notes: string
  cooldown: number
  targetSelector?: TargetSelector // Default: 'manual' for single-target attacks
}

export type PassiveAbilityTrigger = 
  | 'on_damaged'        // When this creature takes damage
  | 'on_attack'         // When this creature attacks
  | 'on_death'          // When this creature dies
  | 'on_kill'           // When this creature kills another
  | 'start_of_turn'     // At the start of each turn
  | 'end_of_turn'       // At the end of each turn
  | 'on_heal'           // When this creature is healed
  | 'on_status_applied' // When a status is applied to this creature

export type PassiveAbility = {
  id: string
  name: string
  description: string
  trigger: PassiveAbilityTrigger
  effect: {
    type: string // 'poison', 'damage', 'heal', 'status', etc.
    // DEPRECATED: Use targetSelector instead
    targetType?: 'attacker' | 'self' | 'all_enemies' | 'all_allies' | 'random_enemy'
    // NEW: Universal target selector (supports 30+ options)
    targetSelector?: TargetSelector
    value?: number // Amount of damage/heal/etc
    statusId?: string // If applying a status
    duration?: number // Duration if applicable
    chance?: number // Probability (0-1) that the effect triggers
  }
  icon?: string
}

export type BaseCreature = {
  name: string
  icon: string
  template: string
  health: number
  maxHealth: number
  attack: number
  trueDamage: number
  defense: number
  mods: Mod[]
  startingAttacks: Attack[]
  possibleAttacks: Attack[]
  statuses: StatusEffect[]
  passiveAbilities?: PassiveAbility[] // Optional passive abilities (thorns, counter-attack, etc.)
}

export type Owner = "player" | "computer" | null

export type Creature = BaseCreature & {
  ID: number
  owner: Owner
}

export type StatusEffect = {
  name: string
  type: "buff" | "debuff"
  timing: "beforeAttack" | "afterAttack"
  duration: number
  effectFuncName: string
  chance: number
  icon: string
  id: string
  notes?: string
  damagePerTurn?: number  // Dynamic value from effect data
  healPerTurn?: number    // Dynamic value from effect data
  shieldAmount?: number   // Shield absorption amount
  description?: string    // Optional description for tooltips
}

export type Effect = {
  id: string
  name: string
  durationRange: string
  effectChance: number
  icon: string
  notes: string
}

// If we have this, create a better type.
// I think this is more like a global enchanting system
export type Enhancement = {
  name: string
  duration: number
  remainingDuration: number
  type: string
  amount: number
  statusEffect: StatusEffect
  // icon: string
}

export type Aura = {
  name: string
  effect: string // StatusEffect
  type: string // typeof Status or something
  duration: number
  description: string
}

export type GameState = {}

export type State = {
  playerCreatures: Creature[]
  computerCreatures: Creature[]
  mp: number
  maxMp: number
  mpPerTurn: number
  turn: number
  runes: Rune[]
  availableRunes: Rune[]
  your: {
    // health: number
    gold: number
    // items: any[] // Replace 'any' with the actual type if available
  }
  battleStatus: string | null
  screen: string
  level: number
  levels: Level[] // Replace 'any' with the actual type if available
  levelEffects: LevelEffect[] // Replace 'any' with the actual type if available
  modals: {
    replaceCreatureModal: any | null // Replace 'any' with the actual type if available
  }
  debugObj: DebugObj
  animationQueue: AnimationQueue // Build 1.1: Animation queue integration
}

export type Level = {
  levelNumber: number
  opponentCreatures: BaseCreature[]
  opponentRunes: Rune[]
  levelEffects: LevelEffect[]
}

export type LevelEffect = {
  name: string
  effect: string
}
export type LogType = {
  message: string
  timestamp: string
  source: string
  details?: string
}
export type PushLogType = {
  message: string
  timestamp: string
  source: string
  action: any
}

export type DebugObj = {
  steps: Array<{
    title: string
    objs: (Creature | StatusEffect | LogType)[]
    details: any
  }>
}
export type TeamsAliveStatus = {
  alivePlayerCreatures: Creature[]
  aliveComputerCreatures: Creature[]
  playerTeamAlive: boolean
  compTeamAlive: boolean
  bothTeamsAlive: boolean
}
// debugObj: {
//   steps: [
//     {
//       title: "1. Attack Initialization",
//       objs: [
//         // attack
//         // creature
//         // creature
//         ...structuredClone(createUniqueParty(basePlayerCreatures, "player")),
//         {
//           name: "Poison",
//           type: "debuff",
//           timing: "afterAttack",
//           duration: 3,
//           effectFuncName: "applyPoison",
//           chance: 1,
//           icon: "🧪",
//           id: `POISON`,
//           notes: "Deals damage over time.",
//         },
//       ],
//       details: {},
//     },
//     {
