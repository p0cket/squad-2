import { Creature } from "./types"

export type Action<Type extends string, Payload> = { type: Type } & Payload
export type ClassicAction<Type extends string, Payload> = {
  type: Type
  payload: Payload
}
export type UpdateMPAction = Action<
  "UPDATE_MP",
  {
    mp: number
  }
>
export type UpdateCreatureAction = Action<
  "UPDATE_CREATURE",
  {
    creature: Creature
    // side: string
  }
>
export type UpdateMaxMPAction = Action<
  "UPDATE_MAX_MP",
  {
    maxMp: number
  }
>
export type UpdateMPTurnAction = Action<
  "UPDATE_MP_PER_TURN",
  {
    mpPerTurn: number
  }
>
export type IncrementTurnAction = Action<"INCREMENT_TURN", {}>
export type ApplyModAction = Action<
  "APPLY_MOD",
  {
    payload: {
      creature: Creature
      mod: any
    }
  }
>
export type MoveCreatureToBackAction = Action<
  "MOVE_CREATURE_TO_BACK",
  {
    payload: {
      side: "playerCreatures" | "computerCreatures"
      creatureId: number
    }
  }
>
export type ToggleSelectReplacementCreatureAction = Action<
  "TOGGLE_SELECT_REPLACEMENT_CREATURE",
  {}
>
export type SwapCreaturePositionAction = Action<
  "SWAP_CREATURE_POSITION",
  {
    payload: {
      side: "playerCreatures" | "computerCreatures"
      newActiveCreatureId: number
    }
  }
>
export type AttackCreatureAction = Action<
  "ATTACK_CREATURE",
  {
    attacker: Creature
  }
>
export type ApplyTurnEffectsAction = Action<"APPLY_TURN_EFFECTS", {}>
export type WinGameAction = Action<"WIN_GAME", {}>
export type LoseGameAction = Action<"LOSE_GAME", {}>
export type NextLevelAction = Action<"NEXT_LEVEL", {}>
export type ResetBattleAction = Action<"RESET_BATTLE", {}>
export type ChangeScreenAction = Action<
  "CHANGE_SCREEN",
  {
    payload: {
      screen: string
    }
  }
>
export type BuyRuneAction = Action<
  "BUY_RUNE",
  {
    rune: any
  }
>
export type SellRuneAction = Action<
  "SELL_RUNE",
  {
    rune: any
    index: number
  }
>
export type AddGoldAction = Action<
  "ADD_GOLD",
  {
    amount: number
  }
>
export type ResetGameAction = Action<"RESET_GAME", {}>

export type MoveCreatureToBackPayload = {
  side: "playerCreatures" | "computerCreatures"
  creatureId: number
}

export type AddObjToDebugStepAction = ClassicAction<
  "ADD_OBJ_TO_DEBUG_STEP",
  {
    stepIndex: number
    obj: any
  }
>

export type Actions =
  | UpdateMPAction
  | UpdateCreatureAction
  | UpdateMaxMPAction
  | UpdateMPTurnAction
  | IncrementTurnAction
  | ApplyModAction
  | MoveCreatureToBackAction
  | ToggleSelectReplacementCreatureAction
  | SwapCreaturePositionAction
  | AttackCreatureAction
  | ApplyTurnEffectsAction
  | WinGameAction
  | LoseGameAction
  | NextLevelAction
  | ResetBattleAction
  | ChangeScreenAction
  | BuyRuneAction
  | SellRuneAction
  | AddGoldAction
  | ResetGameAction
  | AddObjToDebugStepAction