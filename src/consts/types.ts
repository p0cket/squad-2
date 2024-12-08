import { RefObject } from "react"

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
  attacker: Creature // Replace 'any' with the actual type
  target: Creature // Replace 'any' with the actual type
  isPlayerAttack: boolean
  playerCreatureControlsRef: RefObject<any> // Replace 'any' with the actual type
  enemyCreatureControlsRef: RefObject<any> // Replace 'any' with the actual type
  attack: Attack // Replace 'any' with the actual type
  dispatch: React.Dispatch<any> // Replace 'any' with the actual action type
  playerCreatures: Creature[] // Replace 'any' with the actual creature type
  computerCreatures: Creature[] // Replace 'any' with the actual creature type
}

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
  debugObj: any
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
