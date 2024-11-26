export type Rune = {
  id: number
  name: string
  type: string
  effect: string
  cost: number
  count: number
  statEffect: { stat: string; value: number }
  icon: string
}

export type AttackPayload = {
  attacker: Creature // Replace 'any' with the actual type
  target: Creature // Replace 'any' with the actual type
  isPlayerAttack: boolean
  playerCreatureControlsRef: any // Replace 'any' with the actual type
  enemyCreatureControlsRef: any // Replace 'any' with the actual type
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
}

export type BaseCreature = {
  name: string
  icon: string
  template: string
  health: number
  maxHealth: number
  attack: number
  trueDamage: number
  defence: number
  mods?: any[]
  startingAttacks: Attack[]
  possibleAttacks: Attack[]
  statuses?: StatusEffect[]
  // ID?: number
}

export type Creature = BaseCreature & {
  ID: number 
  id?: number //why?
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
}

export type Effect = {
  id: string
  name: string
  durationRange: string
  effectChance: number
  icon: string
  notes: string
}
