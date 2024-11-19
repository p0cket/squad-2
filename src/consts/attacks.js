import { STATUS_EFFECTS } from "../utils.js/turnUtils";

//maybe effects for later
export const effects = {
  physical_critical_hit: {
    id: "physical_critical_hit",
    name: "Critical Hit",
    durationRange: "Instant",
    effectChance: 0.2,
    icon: "sword_icon",
    notes: "High risk, high reward. Doubles damage if it lands."
  },
  physical_armor_penetration: {
    id: "physical_armor_penetration",
    name: "Armor Penetration",
    durationRange: "Instant",
    effectChance: 0.25,
    icon: "shield_break_icon",
    notes: "Ignores a portion of enemy's defense."
  },
  physical_bleed: {
    id: "physical_bleed",
    name: "Bleed",
    durationRange: "2-4 turns",
    effectChance: 0.3,
    icon: "bleeding_icon",
    notes: "Causes damage over time."
  },
  elemental_burn: {
    id: "elemental_burn",
    name: "Burn",
    durationRange: "2-5 turns",
    effectChance: 0.3,
    icon: "flame_icon",
    notes: "Deals fire damage over time."
  },
  elemental_paralysis: {
    id: "elemental_paralysis",
    name: "Paralysis",
    durationRange: "1-3 turns",
    effectChance: 0.2,
    icon: "lightning_icon",
    notes: "May prevent enemy from acting."
  },
  elemental_shock: {
    id: "elemental_shock",
    name: "Shock",
    durationRange: "Instant",
    effectChance: 0.25,
    icon: "spark_icon",
    notes: "Deals extra electric damage."
  },
  status_poison: {
    id: "status_poison",
    name: "Poison",
    durationRange: "3-6 turns",
    effectChance: 0.35,
    icon: "poison_icon",
    notes: "Deals damage over time."
  },
  status_sleep: {
    id: "status_sleep",
    name: "Sleep",
    durationRange: "1-3 turns",
    effectChance: 0.15,
    icon: "sleep_icon",
    notes: "Puts enemy to sleep, they cannot act."
  },
  status_confusion: {
    id: "status_confusion",
    name: "Confusion",
    durationRange: "2-4 turns",
    effectChance: 0.2,
    icon: "confusion_icon",
    notes: "Enemy may hurt themselves."
  },
  support_regeneration: {
    id: "support_regeneration",
    name: "Regeneration",
    durationRange: "3-5 turns",
    effectChance: 1.0,
    icon: "heal_icon",
    notes: "Restores health over time."
  },
  support_shield: {
    id: "support_shield",
    name: "Shield",
    durationRange: "2-4 turns",
    effectChance: 1.0,
    icon: "shield_icon",
    notes: "Reduces incoming damage."
  },
  support_cure_status: {
    id: "support_cure_status",
    name: "Cure Status",
    durationRange: "Instant",
    effectChance: 1.0,
    icon: "cure_icon",
    notes: "Removes negative status effects."
  },
  magical_mana_drain: {
    id: "magical_mana_drain",
    name: "Mana Drain",
    durationRange: "Instant",
    effectChance: 0.3,
    icon: "mana_icon",
    notes: "Drains enemy's mana."
  },
  magical_magic_amplify: {
    id: "magical_magic_amplify",
    name: "Magic Amplify",
    durationRange: "3 turns",
    effectChance: 1.0,
    icon: "magic_boost_icon",
    notes: "Increases magic attack power."
  },
  magical_spell_reflect: {
    id: "magical_spell_reflect",
    name: "Spell Reflect",
    durationRange: "2 turns",
    effectChance: 1.0,
    icon: "reflect_icon",
    notes: "Reflects enemy spells."
  },
  ranged_piercing_shot: {
    id: "ranged_piercing_shot",
    name: "Piercing Shot",
    durationRange: "Instant",
    effectChance: 0.25,
    icon: "arrow_icon",
    notes: "Ignores enemy's defense."
  },
  ranged_long_shot: {
    id: "ranged_long_shot",
    name: "Long Shot",
    durationRange: "Instant",
    effectChance: 1.0,
    icon: "long_arrow_icon",
    notes: "Increased damage at a distance."
  },
  ranged_multi_target: {
    id: "ranged_multi_target",
    name: "Multi-Target",
    durationRange: "Instant",
    effectChance: 1.0,
    icon: "multiple_arrows_icon",
    notes: "Hits multiple enemies."
  },
  aura_strength: {
    id: "aura_strength",
    name: "Strength Aura",
    durationRange: "5 turns",
    effectChance: 1.0,
    icon: "strength_icon",
    notes: "Increases allies' attack power."
  },
  aura_defense: {
    id: "aura_defense",
    name: "Defense Aura",
    durationRange: "5 turns",
    effectChance: 1.0,
    icon: "defense_icon",
    notes: "Increases allies' defense."
  },
  aura_speed: {
    id: "aura_speed",
    name: "Speed Aura",
    durationRange: "5 turns",
    effectChance: 1.0,
    icon: "speed_icon",
    notes: "Increases allies' speed."
  },
  environmental_terrain_advantage: {
    id: "environmental_terrain_advantage",
    name: "Terrain Advantage",
    durationRange: "3 turns",
    effectChance: 1.0,
    icon: "terrain_icon",
    notes: "Boosts stats based on environment."
  },
  environmental_weather_effect: {
    id: "environmental_weather_effect",
    name: "Weather Effect",
    durationRange: "4 turns",
    effectChance: 1.0,
    icon: "weather_icon",
    notes: "Changes weather to benefit allies."
  },
  environmental_trap: {
    id: "environmental_trap",
    name: "Trap",
    durationRange: "Until triggered",
    effectChance: 1.0,
    icon: "trap_icon",
    notes: "Damages enemy when triggered."
  },
  special_time_stop: {
    id: "special_time_stop",
    name: "Time Stop",
    durationRange: "1 turn",
    effectChance: 0.15,
    icon: "time_icon",
    notes: "Stops enemy from acting."
  },
  special_teleport: {
    id: "special_teleport",
    name: "Teleport",
    durationRange: "Instant",
    effectChance: 1.0,
    icon: "teleport_icon",
    notes: "Evades enemy attack."
  },
  special_clone: {
    id: "special_clone",
    name: "Clone",
    durationRange: "3 turns",
    effectChance: 1.0,
    icon: "clone_icon",
    notes: "Creates a clone to absorb damage."
  },
  combo_double_strike: {
    id: "combo_double_strike",
    name: "Double Strike",
    durationRange: "Instant",
    effectChance: 1.0,
    icon: "double_sword_icon",
    notes: "Attacks twice in one turn."
  },
  combo_chain_attack: {
    id: "combo_chain_attack",
    name: "Chain Attack",
    durationRange: "Instant",
    effectChance: 1.0,
    icon: "chain_icon",
    notes: "Attack chains to additional enemies."
  },
  combo_elemental_fusion: {
    id: "combo_elemental_fusion",
    name: "Elemental Fusion",
    durationRange: "Instant",
    effectChance: 1.0,
    icon: "fusion_icon",
    notes: "Combines elements for increased damage."
  },
  stealth_backstab: {
    id: "stealth_backstab",
    name: "Backstab",
    durationRange: "Instant",
    effectChance: 1.0,
    icon: "dagger_icon",
    notes: "High damage when attacking from stealth."
  },
  stealth_invisibility: {
    id: "stealth_invisibility",
    name: "Invisibility",
    durationRange: "2-3 turns",
    effectChance: 1.0,
    icon: "invisibility_icon",
    notes: "Avoids enemy detection."
  },
  stealth_silent_kill: {
    id: "stealth_silent_kill",
    name: "Silent Kill",
    durationRange: "Instant",
    effectChance: 0.5,
    icon: "silent_kill_icon",
    notes: "Chance to instantly defeat weaker enemies."
  }
};

export const attacks = {
  slash: {
    template: "slash",
    name: "Slash",
    attackType: "Physical",
    effects: [STATUS_EFFECTS.BUFF], // Example buff application
    chanceToLand: 0.95,
    damage: 10,
    trueDamage: 0,
    icon: "sword_icon",
    notes: "Basic physical attack with a chance for a critical hit."
  },
  pierce: {
    template: "pierce",
    name: "Pierce",
    attackType: "Physical",
    effects: [], // No direct match in STATUS_EFFECTS for armor penetration
    chanceToLand: 0.9,
    damage: 12,
    trueDamage: 0,
    icon: "spear_icon",
    notes: "Attack that penetrates enemy armor."
  },
  rend: {
    template: "rend",
    name: "Rend",
    attackType: "Physical",
    effects: [STATUS_EFFECTS.POISON], // Replacing bleed with poison effect for similarity
    chanceToLand: 0.85,
    damage: 8,
    trueDamage: 2,
    icon: "axe_icon",
    notes: "Attack that causes bleeding over time."
  },
  bash: {
    template: "bash",
    name: "Bash",
    attackType: "Physical",
    effects: [STATUS_EFFECTS.STUN], // Stun effect added
    chanceToLand: 0.9,
    damage: 15,
    trueDamage: 0,
    icon: "hammer_icon",
    notes: "A strong attack that may stun the enemy."
  },
  fireball: {
    template: "fireball",
    name: "Fireball",
    attackType: "Elemental",
    effects: [STATUS_EFFECTS.BURN], // Matches burn effect
    chanceToLand: 0.9,
    damage: 20,
    trueDamage: 5,
    icon: "fireball_icon",
    notes: "Deals fire damage with a chance to burn the target."
  },
  thunderbolt: {
    template: "thunderbolt",
    name: "Thunderbolt",
    attackType: "Elemental",
    effects: [STATUS_EFFECTS.STUN], // Substituting paralysis with stun
    chanceToLand: 0.85,
    damage: 18,
    trueDamage: 4,
    icon: "lightning_icon",
    notes: "Deals electric damage with a chance to paralyze."
  },
  ice_shard: {
    template: "ice_shard",
    name: "Ice Shard",
    attackType: "Elemental",
    effects: [],
    chanceToLand: 0.95,
    damage: 10,
    trueDamage: 0,
    icon: "ice_icon",
    notes: "Basic ice attack with high accuracy."
  },
  shockwave: {
    template: "shockwave",
    name: "Shockwave",
    attackType: "Elemental",
    effects: [],
    chanceToLand: 0.8,
    damage: 14,
    trueDamage: 2,
    icon: "shockwave_icon",
    notes: "Earth attack that may shock the enemy."
  },
  venom_strike: {
    template: "venom_strike",
    name: "Venom Strike",
    attackType: "Status",
    effects: [STATUS_EFFECTS.POISON],
    chanceToLand: 0.8,
    damage: 6,
    trueDamage: 3,
    icon: "poison_icon",
    notes: "Inflicts poison on the enemy."
  },
  lullaby: {
    template: "lullaby",
    name: "Lullaby",
    attackType: "Status",
    effects: [], // Sleep is not explicitly listed in STATUS_EFFECTS
    chanceToLand: 0.6,
    damage: 0,
    trueDamage: 0,
    icon: "sleep_icon",
    notes: "Puts the enemy to sleep."
  },
  dizzying_blow: {
    template: "dizzying_blow",
    name: "Dizzying Blow",
    attackType: "Status",
    effects: [STATUS_EFFECTS.STUN], // Confusion approximated as stun
    chanceToLand: 0.75,
    damage: 12,
    trueDamage: 1,
    icon: "confusion_icon",
    notes: "May confuse the enemy."
  },
  weakening_touch: {
    template: "weakening_touch",
    name: "Weakening Touch",
    attackType: "Status",
    effects: [],
    chanceToLand: 0.85,
    damage: 5,
    trueDamage: 0,
    icon: "weakness_icon",
    notes: "Reduces enemy's attack power."
  },
  heal: {
    template: "heal",
    name: "Heal",
    attackType: "Support/Healing",
    effects: [STATUS_EFFECTS.REGENERATION],
    chanceToLand: 1.0,
    damage: 0,
    trueDamage: 0,
    icon: "heal_icon",
    notes: "Restores health to an ally over time."
  },
  protect: {
    template: "protect",
    name: "Protect",
    attackType: "Support/Healing",
    effects: [],
    chanceToLand: 1.0,
    damage: 0,
    trueDamage: 0,
    icon: "shield_icon",
    notes: "Shields an ally, reducing incoming damage."
  },
  purify: {
    template: "purify",
    name: "Purify",
    attackType: "Support/Healing",
    effects: [],
    chanceToLand: 1.0,
    damage: 0,
    trueDamage: 0,
    icon: "cure_icon",
    notes: "Removes negative status effects from an ally."
  },
  revitalize: {
    template: "revitalize",
    name: "Revitalize",
    attackType: "Support/Healing",
    effects: [],
    chanceToLand: 1.0,
    damage: 0,
    trueDamage: 0,
    icon: "revitalize_icon",
    notes: "Restores a moderate amount of health instantly."
  },
  arcane_blast: {
    template: "arcane_blast",
    name: "Arcane Blast",
    attackType: "Magical",
    effects: [],
    chanceToLand: 0.9,
    damage: 20,
    trueDamage: 0,
    icon: "arcane_icon",
    notes: "Deals magical damage to an enemy."
  },
  mana_leech: {
    template: "mana_leech",
    name: "Mana Leech",
    attackType: "Magical",
    effects: [],
    chanceToLand: 0.85,
    damage: 10,
    trueDamage: 2,
    icon: "mana_icon",
    notes: "Drains mana from the enemy."
  },
  spell_boost: {
    template: "spell_boost",
    name: "Spell Boost",
    attackType: "Magical",
    effects: [STATUS_EFFECTS.BUFF], // Approximated as a buff
    chanceToLand: 1.0,
    damage: 0,
    trueDamage: 0,
    icon: "magic_boost_icon",
    notes: "Increases caster's magic power."
  },
  reflective_shield: {
    template: "reflective_shield",
    name: "Reflective Shield",
    attackType: "Magical",
    effects: [],
    chanceToLand: 1.0,
    damage: 0,
    trueDamage: 0,
    icon: "reflect_icon",
    notes: "Reflects enemy spells back at them."
  },
  arrow_shot: {
    template: "arrow_shot",
    name: "Arrow Shot",
    attackType: "Ranged",
    effects: [],
    chanceToLand: 0.95,
    damage: 10,
    trueDamage: 0,
    icon: "arrow_icon",
    notes: "Basic ranged attack."
  },
  snipe: {
    template: "snipe",
    name: "Snipe",
    attackType: "Ranged",
    effects: [],
    chanceToLand: 0.8,
    damage: 25,
    trueDamage: 5,
    icon: "long_arrow_icon",
    notes: "High damage at a distance."
  },
  volley: {
    template: "volley",
    name: "Volley",
    attackType: "Ranged",
    effects: [],
    chanceToLand: 0.85,
    damage: 15,
    trueDamage: 0,
    icon: "multiple_arrows_icon",
    notes: "Attacks multiple enemies."
  },
  penetrating_shot: {
    template: "penetrating_shot",
    name: "Penetrating Shot",
    attackType: "Ranged",
    effects: [],
    chanceToLand: 0.75,
    damage: 18,
    trueDamage: 0,
    icon: "piercing_arrow_icon",
    notes: "Ignores enemy defenses."
  },
  battle_cry: {
    template: "battle_cry",
    name: "Battle Cry",
    attackType: "Auras",
    effects: [STATUS_EFFECTS.BUFF], // Strength approximated as a buff
    chanceToLand: 1.0,
    damage: 0,
    trueDamage: 0,
    icon: "strength_icon",
    notes: "Boosts allies' attack power."
  },
  fortify: {
    template: "fortify",
    name: "Fortify",
    attackType: "Auras",
    effects: [STATUS_EFFECTS.BUFF], // Defense approximated as a buff
    chanceToLand: 1.0,
    damage: 0,
    trueDamage: 0,
    icon: "defense_icon",
    notes: "Boosts allies' defense."
  },
  haste: {
    template: "haste",
    name: "Haste",
    attackType: "Auras",
    effects: [STATUS_EFFECTS.BUFF], // Speed approximated as a buff
    chanceToLand: 1.0,
    damage: 0,
    trueDamage: 0,
    icon: "speed_icon",
    notes: "Boosts allies' speed."
  },
  inspire: {
    template: "inspire",
    name: "Inspire",
    attackType: "Auras",
    effects: [],
    chanceToLand: 1.0,
    damage: 0,
    trueDamage: 0,
    icon: "inspire_icon",
    notes: "Boosts allies' morale."
  },
  quicksand: {
    template: "quicksand",
    name: "Quicksand",
    attackType: "Environmental",
    effects: [STATUS_EFFECTS.STUN], // Trap approximated as a stun effect
    chanceToLand: 0.9,
    damage: 5,
    trueDamage: 0,
    icon: "quicksand_icon",
    notes: "Sets a trap that slows enemies."
  },
  rain_dance: {
    template: "rain_dance",
    name: "Rain Dance",
    attackType: "Environmental",
    effects: [],
    chanceToLand: 1.0,
    damage: 0,
    trueDamage: 0,
    icon: "rain_icon",
    notes: "Changes weather to rain."
  },
  rock_slide: {
    template: "rock_slide",
    name: "Rock Slide",
    attackType: "Environmental",
    effects: [],
    chanceToLand: 0.85,
    damage: 20,
    trueDamage: 0,
    icon: "rock_icon",
    notes: "Deals damage using the environment."
  },
  camouflage: {
    template: "camouflage",
    name: "Camouflage",
    attackType: "Environmental",
    effects: [],
    chanceToLand: 1.0,
    damage: 0,
    trueDamage: 0,
    icon: "camouflage_icon",
    notes: "Uses terrain to hide and gain advantage."
  },
  chrono_break: {
    template: "chrono_break",
    name: "Chrono Break",
    attackType: "Special",
    effects: [STATUS_EFFECTS.STUN], // Time stop mapped to stun
    chanceToLand: 0.15,
    damage: 10,
    trueDamage: 0,
    icon: "time_icon",
    notes: "Attempts to stop time for enemies."
  },
  phase_shift: {
    template: "phase_shift",
    name: "Phase Shift",
    attackType: "Special",
    effects: [],
    chanceToLand: 1.0,
    damage: 0,
    trueDamage: 0,
    icon: "teleport_icon",
    notes: "Evades attacks by teleporting."
  },
  mirror_image: {
    template: "mirror_image",
    name: "Mirror Image",
    attackType: "Special",
    effects: [],
    chanceToLand: 1.0,
    damage: 0,
    trueDamage: 0,
    icon: "clone_icon",
    notes: "Creates clones to confuse enemies."
  },
  ultimate_blast: {
    template: "ultimate_blast",
    name: "Ultimate Blast",
    attackType: "Special",
    effects: [],
    chanceToLand: 0.7,
    damage: 40,
    trueDamage: 5,
    icon: "blast_icon",
    notes: "A powerful attack with high damage."
  },
  twin_slash: {
    template: "twin_slash",
    name: "Twin Slash",
    attackType: "Combo",
    effects: [],
    chanceToLand: 0.9,
    damage: 15,
    trueDamage: 0,
    icon: "double_sword_icon",
    notes: "Attacks twice in quick succession."
  },
  whirlwind: {
    template: "whirlwind",
    name: "Whirlwind",
    attackType: "Combo",
    effects: [],
    chanceToLand: 0.85,
    damage: 18,
    trueDamage: 2,
    icon: "whirlwind_icon",
    notes: "Attacks multiple enemies in succession."
  },
  elemental_burst: {
    template: "elemental_burst",
    name: "Elemental Burst",
    attackType: "Combo",
    effects: [],
    chanceToLand: 0.8,
    damage: 30,
    trueDamage: 5,
    icon: "fusion_icon",
    notes: "Combines elements for massive damage."
  },
  flurry: {
    template: "flurry",
    name: "Flurry",
    attackType: "Combo",
    effects: [],
    chanceToLand: 0.95,
    damage: 12,
    trueDamage: 0,
    icon: "flurry_icon",
    notes: "Rapidly attacks the enemy multiple times."
  },
  sneak_attack: {
    template: "sneak_attack",
    name: "Sneak Attack",
    attackType: "Stealth",
    effects: [],
    chanceToLand: 1.0,
    damage: 20,
    trueDamage: 5,
    icon: "dagger_icon",
    notes: "Deals high damage when undetected."
  },
  vanish: {
    template: "vanish",
    name: "Vanish",
    attackType: "Stealth",
    effects: [],
    chanceToLand: 1.0,
    damage: 0,
    trueDamage: 0,
    icon: "invisibility_icon",
    notes: "Becomes invisible to enemies."
  },
  silent_strike: {
    template: "silent_strike",
    name: "Silent Strike",
    attackType: "Stealth",
    effects: [],
    chanceToLand: 0.5,
    damage: 25,
    trueDamage: 10,
    icon: "silent_kill_icon",
    notes: "Chance to instantly defeat an enemy."
  },
  shadow_step: {
    template: "shadow_step",
    name: "Shadow Step",
    attackType: "Stealth",
    effects: [],
    chanceToLand: 1.0,
    damage: 5,
    trueDamage: 0,
    icon: "shadow_icon",
    notes: "Moves swiftly, increasing evasion."
  }
};



export const attackTypes = {
  Physical: [
    attacks.slash,
    attacks.pierce,
    attacks.rend,
    attacks.bash
  ],
  Elemental: [
    attacks.fireball,
    attacks.thunderbolt,
    attacks.ice_shard,
    attacks.shockwave
  ],
  Status: [
    attacks.venom_strike,
    attacks.lullaby,
    attacks.dizzying_blow,
    attacks.weakening_touch
  ],
  SupportHealing: [
    attacks.heal,
    attacks.protect,
    attacks.purify,
    attacks.revitalize
  ],
  Magical: [
    attacks.arcane_blast,
    attacks.mana_leech,
    attacks.spell_boost,
    attacks.reflective_shield
  ],
  Ranged: [
    attacks.arrow_shot,
    attacks.snipe,
    attacks.volley,
    attacks.penetrating_shot
  ],
  Special: [
    attacks.chrono_break,
    attacks.phase_shift,
    attacks.mirror_image,
    attacks.ultimate_blast
  ],
  Combo: [
    attacks.twin_slash,
    attacks.whirlwind,
    attacks.elemental_burst,
    attacks.flurry
  ],
  Stealth: [
    attacks.sneak_attack,
    attacks.vanish,
    attacks.silent_strike,
    attacks.shadow_step
  ]
};

// // Example of how you might use these in a component
// import { attacks } from './attacks';

// function AttackButton({ attackId }) {
//   const attack = attacks[attackId];

//   return (
//     <div>
//       <button>
//         <img src={`/icons/${attack.icon}.png`} alt={attack.name} />
//         {attack.name}
//       </button>
//     </div>
//   );
// }

// export default AttackButton;