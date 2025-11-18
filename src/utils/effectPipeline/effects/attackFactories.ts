// Attack Factory Functions - Helper functions to create common attack patterns
import { Attack } from '../../../consts/types/types'

/**
 * Creates a basic physical attack
 */
export const createBasicAttack = (
  name: string,
  damage: number,
  icon: string = '⚔️',
  cooldown: number = 0
): Attack => ({
  name,
  template: 'physical',
  attackType: 'physical',
  damage,
  trueDamage: 0,
  effects: [],
  chanceToLand: 0.95,
  cooldown,
  icon,
  notes: `Basic physical attack dealing ${damage} damage`
})

/**
 * Creates a fire/burn attack
 */
export const createBurnAttack = (
  name: string,
  damage: number,
  icon: string = '🔥',
  cooldown: number = 2
): Attack => ({
  name,
  template: 'fire',
  attackType: 'magical',
  damage,
  trueDamage: 0,
  effects: ['burn'],
  chanceToLand: 0.9,
  cooldown,
  icon,
  notes: `Fire attack dealing ${damage} damage and applying burn (5 dmg/turn for 3 turns)`
})

/**
 * Creates a poison attack
 */
export const createPoisonAttack = (
  name: string,
  damage: number,
  icon: string = '🧪',
  cooldown: number = 2
): Attack => ({
  name,
  template: 'poison',
  attackType: 'physical',
  damage,
  trueDamage: 0,
  effects: ['poison'],
  chanceToLand: 0.95,
  cooldown,
  icon,
  notes: `Poison attack dealing ${damage} damage and applying poison (10 dmg/turn for 3 turns)`
})

/**
 * Creates a bleeding attack
 */
export const createBleedAttack = (
  name: string,
  damage: number,
  icon: string = '🩸',
  cooldown: number = 1
): Attack => ({
  name,
  template: 'bleed',
  attackType: 'physical',
  damage,
  trueDamage: 0,
  effects: ['bleed'],
  chanceToLand: 0.95,
  cooldown,
  icon,
  notes: `Physical attack dealing ${damage} damage and causing bleeding (7 dmg/turn for 3 turns)`
})

/**
 * Creates a stunning attack
 */
export const createStunAttack = (
  name: string,
  damage: number,
  icon: string = '💫',
  cooldown: number = 3
): Attack => ({
  name,
  template: 'stun',
  attackType: 'physical',
  damage,
  trueDamage: 0,
  effects: ['stun'],
  chanceToLand: 0.85,
  cooldown,
  icon,
  notes: `Attack dealing ${damage} damage and stunning target for 1 turn`
})

/**
 * Creates a freezing attack
 */
export const createFreezeAttack = (
  name: string,
  damage: number,
  icon: string = '❄️',
  cooldown: number = 3
): Attack => ({
  name,
  template: 'ice',
  attackType: 'magical',
  damage,
  trueDamage: 0,
  effects: ['freeze'],
  chanceToLand: 0.85,
  cooldown,
  icon,
  notes: `Ice attack dealing ${damage} damage and freezing target for 2 turns`
})

/**
 * Creates a slow attack (reduces turn frequency)
 */
export const createSlowAttack = (
  name: string,
  damage: number,
  icon: string = '🐌',
  cooldown: number = 3
): Attack => ({
  name,
  template: 'slow',
  attackType: 'magical',
  damage,
  trueDamage: 0,
  effects: ['slow'],
  chanceToLand: 0.9,
  cooldown,
  icon,
  notes: `Attack dealing ${damage} damage and slowing target (skips every 2nd turn for 4 turns)`
})

/**
 * Creates a silence attack (prevents abilities)
 */
export const createSilenceAttack = (
  name: string,
  damage: number,
  icon: string = '🤐',
  cooldown: number = 3
): Attack => ({
  name,
  template: 'silence',
  attackType: 'magical',
  damage,
  trueDamage: 0,
  effects: ['silence'],
  chanceToLand: 0.85,
  cooldown,
  icon,
  notes: `Attack dealing ${damage} damage and silencing target for 2 turns (can only use basic attacks)`
})

/**
 * Creates a weakening attack (reduces target's attack)
 */
export const createWeakeningAttack = (
  name: string,
  damage: number,
  icon: string = '⚔️↓',
  cooldown: number = 2
): Attack => ({
  name,
  template: 'weaken',
  attackType: 'physical',
  damage,
  trueDamage: 0,
  effects: ['weaken'],
  chanceToLand: 0.9,
  cooldown,
  icon,
  notes: `Attack dealing ${damage} damage and reducing target's attack by 5 for 3 turns`
})

/**
 * Creates a vulnerability attack (reduces target's defense)
 */
export const createVulnerabilityAttack = (
  name: string,
  damage: number,
  icon: string = '🛡️↓',
  cooldown: number = 2
): Attack => ({
  name,
  template: 'vulnerability',
  attackType: 'physical',
  damage,
  trueDamage: 0,
  effects: ['vulnerability'],
  chanceToLand: 0.9,
  cooldown,
  icon,
  notes: `Attack dealing ${damage} damage and reducing target's defense by 5 for 3 turns`
})

/**
 * Creates a self-buffing attack (increases attacker's stats)
 */
export const createBuffingAttack = (
  name: string,
  damage: number,
  buffTypes: ('strengthen' | 'fortify')[],
  icon: string = '💪',
  cooldown: number = 4
): Attack => ({
  name,
  template: 'self-buff',
  attackType: 'physical',
  damage,
  trueDamage: 0,
  effects: buffTypes,
  chanceToLand: 1.0,
  cooldown,
  icon,
  notes: `Attack dealing ${damage} damage and granting ${buffTypes.join(' + ')} for 3 turns`
})

/**
 * Creates a cleansing attack (removes debuffs from target)
 */
export const createCleanseAttack = (
  name: string,
  healing: number = 0,
  icon: string = '✨',
  cooldown: number = 4
): Attack => ({
  name,
  template: 'cleanse',
  attackType: 'support',
  damage: 0,
  trueDamage: 0,
  effects: ['cleanse'],
  chanceToLand: 1.0,
  cooldown,
  icon,
  notes: `Removes all debuffs from target${healing > 0 ? ` and heals for ${healing}` : ''}`
})

/**
 * Creates a dispel attack (removes buffs from enemy)
 */
export const createDispelAttack = (
  name: string,
  damage: number,
  icon: string = '🌟',
  cooldown: number = 3
): Attack => ({
  name,
  template: 'dispel',
  attackType: 'magical',
  damage,
  trueDamage: 0,
  effects: ['dispel'],
  chanceToLand: 1.0,
  cooldown,
  icon,
  notes: `Deals ${damage} damage and removes all buffs from target`
})

/**
 * Creates a purge attack (removes ALL status effects)
 */
export const createPurgeAttack = (
  name: string,
  damage: number,
  icon: string = '💥',
  cooldown: number = 5
): Attack => ({
  name,
  template: 'purge',
  attackType: 'magical',
  damage,
  trueDamage: 0,
  effects: ['purge'],
  chanceToLand: 1.0,
  cooldown,
  icon,
  notes: `Deals ${damage} damage and removes ALL status effects from target`
})

/**
 * Creates a combo attack with multiple effects
 */
export const createComboAttack = (
  name: string,
  damage: number,
  effects: string[],
  icon: string,
  cooldown: number = 5
): Attack => ({
  name,
  template: 'combo',
  attackType: 'special',
  damage,
  trueDamage: 0,
  effects,
  chanceToLand: 0.85,
  cooldown,
  icon,
  notes: `Special combo attack dealing ${damage} damage with effects: ${effects.join(', ')}`
})

// ============================================================================
// Pre-made Attack Examples
// ============================================================================

/** Fire Breath - Classic dragon attack */
export const FIRE_BREATH = createBurnAttack('Fire Breath', 20, '🔥', 2)

/** Venomous Bite - Poison attack */
export const VENOMOUS_BITE = createPoisonAttack('Venomous Bite', 15, '🦷', 2)

/** Stunning Strike - Stuns enemy */
export const STUNNING_STRIKE = createStunAttack('Stunning Strike', 18, '💫', 3)

/** Frost Bolt - Freezes enemy */
export const FROST_BOLT = createFreezeAttack('Frost Bolt', 16, '❄️', 3)

/** Weakening Slash - Reduces attack */
export const WEAKENING_SLASH = createWeakeningAttack('Weakening Slash', 14, '⚔️↓', 2)

/** Armor Break - Reduces defense */
export const ARMOR_BREAK = createVulnerabilityAttack('Armor Break', 14, '🛡️↓', 2)

/** Berserker Rage - Self-buff */
export const BERSERKER_RAGE = createBuffingAttack('Berserker Rage', 10, ['strengthen', 'fortify'], '💪', 4)

/** Cleansing Touch - Removes debuffs */
export const CLEANSING_TOUCH = createCleanseAttack('Cleansing Touch', 25, '✨', 4)

/** Dispel Magic - Removes buffs */
export const DISPEL_MAGIC = createDispelAttack('Dispel Magic', 10, '🌟', 3)

/** Purifying Blast - Removes all effects */
export const PURIFYING_BLAST = createPurgeAttack('Purifying Blast', 12, '💥', 5)

/** Lacerate - Causes bleeding */
export const LACERATE = createBleedAttack('Lacerate', 16, '🩸', 1)

/** Basic Slash - Simple attack */
export const BASIC_SLASH = createBasicAttack('Slash', 15, '⚔️', 0)
