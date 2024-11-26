import { Creature, StatusEffect } from "./types"

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
  },
}

// Function to apply poison effect, reducing health by 10
export const applyPoison = (creature: Creature): Creature => ({
  ...creature,
  health: Math.max(0, creature.health - 10),
})

// Function to apply buff effect, increasing attack by 5
export const applyBuff = (creature: Creature): Creature => ({
  ...creature,
  attack: creature.attack + 5,
})

// Function to apply burn effect, reducing health by 5
export const applyBurn = (creature: Creature): Creature => ({
  ...creature,
  health: Math.max(0, creature.health - 5),
})

// Function to apply stun effect, setting stunned to true
export const applyStun = (creature: Creature): Creature => ({
  ...creature,
  // stunned: true, // Uncomment this line when you have a 'stunned' property in the Creature type
})

// Function to apply regeneration effect, increasing health by 5 up to maxHealth
export const applyRegeneration = (creature: Creature): Creature => ({
  ...creature,
  health: Math.min(creature.maxHealth, creature.health + 5),
})

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

export const effectFunctions: {
  [key: string]: (creature: Creature) => Creature
} = {
  applyPoison,
  applyBuff,
  applyBurn,
  applyStun,
  applyRegeneration,
}

// Function to apply the effect to the creature
export const runApplyEffect = (creature: Creature, effectObj: StatusEffect) => {
  let updatedCreature = { ...creature }
  switch (effectObj.effectFuncName) {
    case "applyPoison":
      updatedCreature = applyPoison(updatedCreature)
      break
    case "applyBuff":
      updatedCreature = applyBuff(updatedCreature)
      break
    case "applyBurn":
      updatedCreature = applyBurn(updatedCreature)
      break
    case "applyStun":
      updatedCreature = applyStun(updatedCreature)
      break
    case "applyRegeneration":
      updatedCreature = applyRegeneration(updatedCreature)
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
