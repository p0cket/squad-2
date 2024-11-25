
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

export interface AttackPayload {
  attacker: any; // Replace 'any' with the actual type
  target: any; // Replace 'any' with the actual type
  isPlayerAttack: boolean;
  playerCreatureControlsRef: any; // Replace 'any' with the actual type
  enemyCreatureControlsRef: any; // Replace 'any' with the actual type
  attack: any; // Replace 'any' with the actual type
  dispatch: React.Dispatch<any>; // Replace 'any' with the actual action type
  playerCreatures: any[]; // Replace 'any' with the actual creature type
  computerCreatures: any[]; // Replace 'any' with the actual creature type
}
export type Attack = {
  template: string;
  name: string;
  attackType: string;
  effects: string[];
  chanceToLand: number;
  damage: number;
  trueDamage: number;
  icon: string;
  notes: string;
};

export interface Creature {
  id: number;
  name: string;
  icon: string;
  template: string;
  health: number;
  maxHealth: number;
  attack: number;
  trueDamage: number;
  defence: number;
  mods: any[];
  startingAttacks: Attack[];
  possibleAttacks: Attack[];
  statuses?: string[];
}


export interface StatusEffect {
  name: string;
  type: "buff" | "debuff";
  timing: "beforeAttack" | "afterAttack";
  duration: number;
  effectFuncName: string;
  chance: number;
  icon: string;
  id: string;
}


export interface Effect {
  id: string;
  name: string;
  durationRange: string;
  effectChance: number;
  icon: string;
  notes: string;
}