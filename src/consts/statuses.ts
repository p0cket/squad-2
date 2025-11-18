import { logStep } from "../debug/logUtils"
import { getCreatureControlsById } from "../utils/anim/getControls"
import {
  AttackPayload,
  Creature,
  LogType,
  PushLogType,
  StatusEffect,
} from "./types/types"

export const STATUS_EFFECTS: { [key: string]: StatusEffect } = {
  POISON: {
    name: "Poison",
    type: "debuff",
    timing: "afterAttack",
    duration: 3,
    effectFuncName: "applyPoison",
    chance: 1,
    icon: "🧪",
    id: `POISON`,
    notes: "Deals damage over time.",
  },
  BUFF: {
    name: "Buff",
    type: "buff",
    timing: "beforeAttack",
    duration: 2,
    effectFuncName: "applyBuff",
    chance: 1,
    icon: "✨",
    id: `BUFF`,
    notes: "Increases attack power.",
  },
  BURN: {
    name: "Burn",
    type: "debuff",
    timing: "afterAttack",
    duration: 3,
    effectFuncName: "applyBurn",
    chance: 1,
    icon: "🔥",
    id: `BURN`,
    notes: "Deals fire damage over time.",
  },
  STUN: {
    name: "Stun",
    type: "debuff",
    timing: "beforeAttack",
    duration: 2,
    effectFuncName: "applyStun",
    chance: 1,
    icon: "⚡",
    id: `STUN`,
    notes: "Prevents enemy from acting.",
  },
  ATTACK_BUFF: {
    name: "Attack Buff",
    type: "buff",
    timing: "beforeAttack",
    duration: 3,
    effectFuncName: "applyBuff",
    chance: 1,
    icon: "💪",
    id: `ATTACK_BUFF`,
    notes: "Increases attack power for a few turns.",
  },
  ATTACK_DEBUFF: {
    name: "Attack Debuff",
    type: "debuff",
    timing: "beforeAttack",
    duration: 3,
    effectFuncName: "applyStun",
    chance: 1,
    icon: "⚔️⬇️",
    id: `ATTACK_DEBUFF`,
    notes: "Reduces attack power for a few turns.",
  },
  REGENERATION: {
    name: "Regeneration",
    type: "buff",
    timing: "afterAttack",
    duration: 3,
    effectFuncName: "applyRegeneration",
    chance: 1,
    icon: "💚",
    id: `REGENERATION`,
    notes: "Restores health over time.",
  },
  SHIELD: {
    name: "Shield",
    type: "buff",
    timing: "beforeAttack",
    duration: 3,
    effectFuncName: "applyShield",
    chance: 1,
    icon: "🛡️",
    id: `SHIELD`,
    notes: "Absorbs incoming damage for a few turns.",
  },
  FREEZE: {
    name: "Freeze",
    type: "debuff",
    timing: "beforeAttack",
    duration: 2,
    effectFuncName: "applyFreeze",
    chance: 1,
    icon: "❄️",
    id: `FREEZE`,
    notes: "Cannot act. Defense reduced by 5.",
  },
}
// Function to log and apply poison effect, reducing health by 10
// export const applyPoison = (
//   creature: Creature,
//   statusEffectObj: StatusEffect,
//   attackPayload?: AttackPayload
// ): void => {
//   const { dispatch } = attackPayload ?? {}
//   console.log(
//     `Applying ${statusEffectObj.name} to ${creature.name}, reducing health by 10`
//   )
//   let updatedCreature = { ...creature }
//   updatedCreature.health = Math.max(0, creature.health - 10)
//   if (!dispatch) {
//     console.log("applyPoison: No dispatch", attackPayload)
//     return
//   }
//   dispatch({
//     type: "UPDATE_CREATURE",
//     side: creature.owner === "player" ? "playerCreatures" : "computerCreatures",
//     creature: updatedCreature,
//   })
// }
export const applyPoison = (
  creature: Creature,
  statusEffectObj: StatusEffect,
  attackPayload?: AttackPayload
): Creature => {
  const { dispatch } = attackPayload ?? {}
  console.log(
    `Applying ${statusEffectObj.name} to ${creature.name}, reducing health by 10`
  )
  const updatedCreature = { ...creature }
  updatedCreature.health = Math.max(0, creature.health - 10)
  if (dispatch) {
    dispatch({
      type: "UPDATE_CREATURE",
      // side:
      //   creature.owner === "player" ? "playerCreatures" : "computerCreatures",
      creature: updatedCreature,
    })
  }
  return updatedCreature
}

// Function to log and apply buff effect, increasing attack by 5
export const applyBuff = (
  creature: Creature,
  statusEffectObj: StatusEffect,
  attackPayload?: AttackPayload
): Creature => {
  const { dispatch } = attackPayload ?? {}
  console.log(
    `Applying ${statusEffectObj.name} to ${creature.name}, increasing attack by 5`
  )
  const updatedCreature = { ...creature }
  updatedCreature.attack = creature.attack + 5
  if (dispatch) {
    dispatch({
      type: "UPDATE_CREATURE",
      // side:
      //   creature.owner === "player" ? "playerCreatures" : "computerCreatures",
      creature: updatedCreature,
    })
  }
  return updatedCreature
}

// Function to log and apply burn effect, reducing health by 5
export const applyBurn = async (
  creature: Creature,
  statusEffectObj: StatusEffect,
  attackPayload?: AttackPayload
): Promise<Creature> => {
  const { dispatch } = attackPayload ?? {}
  console.log(
    `Applying ${statusEffectObj.name} to ${creature.name}, reducing health by 5`
  )

  let updatedCreature = { ...creature }
  updatedCreature.health = Math.max(0, updatedCreature.health - 5)

  //1. PROBABLY THIS THREE TIMES (Anim shake, Anim dmg, Dispatch Update)
  const burnLog2: PushLogType = {
    message: `applyBurn: updatedCreature ${updatedCreature?.name} updated with burn damage (-5) ${updatedCreature.health}`,
    timestamp: new Date().toISOString(),
    action: {
      type: "HANDLE_CREATURE_UPDATE", //is it more than just the health?
      payload: { updatedCreature }, //also attackPayload
    },
    source: "statuses 157",
  }
  // @ts-ignore
  logStep(burnLog2, dispatch)
  //2. PROBABLY THIS THREE TIMES (Anim shake, Anim dmg, Dispatch Update)
  const burnLog3: PushLogType = {
    message: `applyBurn: updatedCreature ${updatedCreature?.name} updated with burn damage (-5) ${updatedCreature.health}`,
    timestamp: new Date().toISOString(),
    action: {
      type: "HANDLE_ANIM_BURN_SHAKE", //is it more than just the health?
      payload: { updatedCreature }, //also attackPayload
    },
    source: "statuses 157",
  }
  // @ts-ignore
  logStep(burnLog3, dispatch)
  const newPush2: PushLogType = {
    message: `Animate applyBurn: on ${updatedCreature?.name}`,
    timestamp: new Date().toISOString(),
    action: {
      type: "HANDLE_ANIM_BURN_DMG", //is it more than just the health?
      payload: { updatedCreature }, //also attackPayload
    },
    source: "statuses 178",
  }
  // @ts-ignore
  logStep(newPush2, dispatch)
  if (!dispatch) {
    console.log("applyBurn: No dispatch", attackPayload)
    return updatedCreature
  }
  // find creature controls
  if (!attackPayload) {
    return updatedCreature
  }
  // Queue of these events. pop. The specific UI updates need to happen.
  // a queue of promises

  const { playerCreatureControlsRef, enemyCreatureControlsRef } = attackPayload
  const targetControls = await getCreatureControlsById(
    creature.ID,
    playerCreatureControlsRef,
    enemyCreatureControlsRef
  )
  if (targetControls) {
    // await shakeTarget(targetControls)
  }
  const logEntry: LogType = {
    message: `dispatching burn stuff ☄️. ${attackPayload.attacker?.name} on ${creature.name}`,
    timestamp: new Date().toISOString(),
    details: `Here we're expecting to see the attackPayload:`,
    source: "runTurn",
    // details: `Attack details: ${JSON.stringify(attackPayload)}`,
  }
  dispatch({
    type: "ADD_OBJ_TO_DEBUG_STEP",
    payload: {
      stepIndex: 0,
      obj: logEntry,
    },
  })

  // have something that updates both the state,
  // and dispatches at the same time.
  dispatch({
    type: "UPDATE_CREATURE",
    // side: creature.owner === "player" ? "playerCreatures" : "computerCreatures",
    creature: updatedCreature,
  })
  return updatedCreature
}

// Function to log and apply stun effect, setting stunned to true
export const applyStun = (
  creature: Creature,
  statusEffectObj: StatusEffect,
  attackPayload?: AttackPayload
): Creature => {
  const { dispatch } = attackPayload ?? {}
  console.log(
    `Applying ${statusEffectObj.name} to ${creature.name}, setting stunned to true`
  )
  let updatedCreature = { ...creature }
  // updatedCreature.stunned = true // Ensure 'stunned' property exists in the Creature type
  if (!dispatch) {
    console.log("applyStun: No dispatch", attackPayload)
    return updatedCreature
  }
  dispatch({
    type: "UPDATE_CREATURE",
    // side: creature.owner === "player" ? "playerCreatures" : "computerCreatures",
    creature: updatedCreature,
  })
  return updatedCreature
}

// Function to log and apply regeneration effect, increasing health by 5 up to maxHealth
export const applyRegeneration = (
  creature: Creature,
  statusEffectObj: StatusEffect,
  attackPayload?: AttackPayload
): Creature => {
  const { dispatch } = attackPayload ?? {}
  console.log(
    `Applying ${statusEffectObj.name} to ${creature.name}, increasing health by 5`
  )
  let updatedCreature = { ...creature }
  updatedCreature.health = Math.min(creature.maxHealth, creature.health + 5)
  if (!dispatch) {
    console.log("applyRegeneration: No dispatch", attackPayload)
    return updatedCreature
  }
  dispatch({
    type: "UPDATE_CREATURE",
    // side: creature.owner === "player" ? "playerCreatures" : "computerCreatures",
    creature: updatedCreature,
  })
  return updatedCreature
}
// Function to tick down the duration of a status effect
export const tickDownEffectDuration = (
  creature: Creature,
  statusName: string
): Creature => {
  if (creature.statuses) {
    creature.statuses = creature.statuses
      .map((status) => {
        if (status.name === statusName) {
          return {
            ...status,
            duration: status.duration - 1,
          }
        }
        return status
      })
      .filter((status) => status.duration > 0) // Keep statuses that still have duration
  }
  return creature
}

export type EffectFunctionsType = {
  [key: string]: (
    creature: Creature,
    status: StatusEffect,
    attackPayload?: AttackPayload
  ) => Creature | Promise<Creature>
}

export const effectFunctions: EffectFunctionsType = {
  applyPoison,
  applyBuff,
  applyBurn,
  applyStun,
  applyRegeneration,
}

// Function to apply the effect to the creature
export const runApplyEffect = (
  creature: Creature,
  effectObj: StatusEffect,
  attackPayload?: AttackPayload
) => {
  let updatedCreature = { ...creature }
  switch (effectObj.effectFuncName) {
    case "applyPoison":
      applyPoison(updatedCreature, effectObj, attackPayload)
      break
    case "applyBuff":
      applyBuff(updatedCreature, effectObj, attackPayload)
      break
    case "applyBurn":
      applyBurn(updatedCreature, effectObj, attackPayload)
      break
    case "applyStun":
      applyStun(updatedCreature, effectObj, attackPayload)
      break
    case "applyRegeneration":
      applyRegeneration(updatedCreature, effectObj, attackPayload)
      break
    default:
      break
  }
  return tickDownEffectDuration(updatedCreature, effectObj.effectFuncName)
}

//maybe effects for later
export const effects = {
  physical_critical_hit: {
    id: "physical_critical_hit",
    name: "Critical Hit",
    durationRange: "Instant",
    effectChance: 0.2,
    icon: "sword_icon",
    notes: "High risk, high reward. Doubles damage if it lands.",
  },
  physical_armor_penetration: {
    id: "physical_armor_penetration",
    name: "Armor Penetration",
    durationRange: "Instant",
    effectChance: 0.25,
    icon: "shield_break_icon",
    notes: "Ignores a portion of enemy's defense.",
  },
  physical_bleed: {
    id: "physical_bleed",
    name: "Bleed",
    durationRange: "2-4 turns",
    effectChance: 0.3,
    icon: "bleeding_icon",
    notes: "Causes damage over time.",
  },
  elemental_burn: {
    id: "elemental_burn",
    name: "Burn",
    durationRange: "2-5 turns",
    effectChance: 0.3,
    icon: "flame_icon",
    notes: "Deals fire damage over time.",
  },
  elemental_paralysis: {
    id: "elemental_paralysis",
    name: "Paralysis",
    durationRange: "1-3 turns",
    effectChance: 0.2,
    icon: "lightning_icon",
    notes: "May prevent enemy from acting.",
  },
  elemental_shock: {
    id: "elemental_shock",
    name: "Shock",
    durationRange: "Instant",
    effectChance: 0.25,
    icon: "spark_icon",
    notes: "Deals extra electric damage.",
  },
  status_poison: {
    id: "status_poison",
    name: "Poison",
    durationRange: "3-6 turns",
    effectChance: 0.35,
    icon: "poison_icon",
    notes: "Deals damage over time.",
  },
  status_sleep: {
    id: "status_sleep",
    name: "Sleep",
    durationRange: "1-3 turns",
    effectChance: 0.15,
    icon: "sleep_icon",
    notes: "Puts enemy to sleep, they cannot act.",
  },
  status_confusion: {
    id: "status_confusion",
    name: "Confusion",
    durationRange: "2-4 turns",
    effectChance: 0.2,
    icon: "confusion_icon",
    notes: "Enemy may hurt themselves.",
  },
  support_regeneration: {
    id: "support_regeneration",
    name: "Regeneration",
    durationRange: "3-5 turns",
    effectChance: 1.0,
    icon: "heal_icon",
    notes: "Restores health over time.",
  },
  support_shield: {
    id: "support_shield",
    name: "Shield",
    durationRange: "2-4 turns",
    effectChance: 1.0,
    icon: "shield_icon",
    notes: "Reduces incoming damage.",
  },
  support_cure_status: {
    id: "support_cure_status",
    name: "Cure Status",
    durationRange: "Instant",
    effectChance: 1.0,
    icon: "cure_icon",
    notes: "Removes negative status effects.",
  },
  magical_mana_drain: {
    id: "magical_mana_drain",
    name: "Mana Drain",
    durationRange: "Instant",
    effectChance: 0.3,
    icon: "mana_icon",
    notes: "Drains enemy's mana.",
  },
  magical_magic_amplify: {
    id: "magical_magic_amplify",
    name: "Magic Amplify",
    durationRange: "3 turns",
    effectChance: 1.0,
    icon: "magic_boost_icon",
    notes: "Increases magic attack power.",
  },
  magical_spell_reflect: {
    id: "magical_spell_reflect",
    name: "Spell Reflect",
    durationRange: "2 turns",
    effectChance: 1.0,
    icon: "reflect_icon",
    notes: "Reflects enemy spells.",
  },
  ranged_piercing_shot: {
    id: "ranged_piercing_shot",
    name: "Piercing Shot",
    durationRange: "Instant",
    effectChance: 0.25,
    icon: "arrow_icon",
    notes: "Ignores enemy's defense.",
  },
  ranged_long_shot: {
    id: "ranged_long_shot",
    name: "Long Shot",
    durationRange: "Instant",
    effectChance: 1.0,
    icon: "long_arrow_icon",
    notes: "Increased damage at a distance.",
  },
  ranged_multi_target: {
    id: "ranged_multi_target",
    name: "Multi-Target",
    durationRange: "Instant",
    effectChance: 1.0,
    icon: "multiple_arrows_icon",
    notes: "Hits multiple enemies.",
  },
  aura_strength: {
    id: "aura_strength",
    name: "Strength Aura",
    durationRange: "5 turns",
    effectChance: 1.0,
    icon: "strength_icon",
    notes: "Increases allies' attack power.",
  },
  aura_defense: {
    id: "aura_defense",
    name: "Defense Aura",
    durationRange: "5 turns",
    effectChance: 1.0,
    icon: "defense_icon",
    notes: "Increases allies' defense.",
  },
  aura_speed: {
    id: "aura_speed",
    name: "Speed Aura",
    durationRange: "5 turns",
    effectChance: 1.0,
    icon: "speed_icon",
    notes: "Increases allies' speed.",
  },
  environmental_terrain_advantage: {
    id: "environmental_terrain_advantage",
    name: "Terrain Advantage",
    durationRange: "3 turns",
    effectChance: 1.0,
    icon: "terrain_icon",
    notes: "Boosts stats based on environment.",
  },
  environmental_weather_effect: {
    id: "environmental_weather_effect",
    name: "Weather Effect",
    durationRange: "4 turns",
    effectChance: 1.0,
    icon: "weather_icon",
    notes: "Changes weather to benefit allies.",
  },
  environmental_trap: {
    id: "environmental_trap",
    name: "Trap",
    durationRange: "Until triggered",
    effectChance: 1.0,
    icon: "trap_icon",
    notes: "Damages enemy when triggered.",
  },
  special_time_stop: {
    id: "special_time_stop",
    name: "Time Stop",
    durationRange: "1 turn",
    effectChance: 0.15,
    icon: "time_icon",
    notes: "Stops enemy from acting.",
  },
  special_teleport: {
    id: "special_teleport",
    name: "Teleport",
    durationRange: "Instant",
    effectChance: 1.0,
    icon: "teleport_icon",
    notes: "Evades enemy attack.",
  },
  special_clone: {
    id: "special_clone",
    name: "Clone",
    durationRange: "3 turns",
    effectChance: 1.0,
    icon: "clone_icon",
    notes: "Creates a clone to absorb damage.",
  },
  combo_double_strike: {
    id: "combo_double_strike",
    name: "Double Strike",
    durationRange: "Instant",
    effectChance: 1.0,
    icon: "double_sword_icon",
    notes: "Attacks twice in one turn.",
  },
  combo_chain_attack: {
    id: "combo_chain_attack",
    name: "Chain Attack",
    durationRange: "Instant",
    effectChance: 1.0,
    icon: "chain_icon",
    notes: "Attack chains to additional enemies.",
  },
  combo_elemental_fusion: {
    id: "combo_elemental_fusion",
    name: "Elemental Fusion",
    durationRange: "Instant",
    effectChance: 1.0,
    icon: "fusion_icon",
    notes: "Combines elements for increased damage.",
  },
  stealth_backstab: {
    id: "stealth_backstab",
    name: "Backstab",
    durationRange: "Instant",
    effectChance: 1.0,
    icon: "dagger_icon",
    notes: "High damage when attacking from stealth.",
  },
  stealth_invisibility: {
    id: "stealth_invisibility",
    name: "Invisibility",
    durationRange: "2-3 turns",
    effectChance: 1.0,
    icon: "invisibility_icon",
    notes: "Avoids enemy detection.",
  },
  stealth_silent_kill: {
    id: "stealth_silent_kill",
    name: "Silent Kill",
    durationRange: "Instant",
    effectChance: 0.5,
    icon: "silent_kill_icon",
    notes: "Chance to instantly defeat weaker enemies.",
  },
}
