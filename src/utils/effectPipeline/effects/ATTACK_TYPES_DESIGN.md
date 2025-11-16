# Attack Types System Design

This document defines all the attack types and effects supported by the battle system.

## Overview

The attack system uses the `Attack` type which has an `effects: string[]` array. When an attack lands, the `applyAttackEffect` function processes each effect in this array.

## Current Implementation Status

### ✅ Already Implemented
- **Basic Attacks**: Standard damage attacks with defense calculation
- **True Damage**: Bypasses defense
- **Life Drain**: Damages enemy and heals attacker
- **AoE Attacks**: Hits multiple targets
- **Healing**: Restores HP to target
- **Burn Effect** (via Attack.effects): Applies burn status (5 dmg/turn, 3 turns)
- **Poison Effect** (via Attack.effects): Applies poison status (10 dmg/turn, 3 turns)

## New Attack Effects to Implement

### 🔥 Status Effect Attacks

#### 1. **STUN**
- **Description**: Prevents target from taking actions for N turns
- **Implementation**: Add STUN to attack.effects array
- **Example**: `effects: ['stun']`
- **Parameters**: Duration (default: 1 turn)

#### 2. **FREEZE**
- **Description**: Similar to stun but with ice theme
- **Implementation**: Same as STUN but different visual/flavor
- **Example**: `effects: ['freeze']`
- **Parameters**: Duration (default: 2 turns)

#### 3. **SLOW**
- **Description**: Reduces target's speed/action economy
- **Implementation**: Apply SLOW status
- **Example**: `effects: ['slow']`
- **Parameters**: Magnitude and duration

#### 4. **WEAKEN**
- **Description**: Reduces target's attack stat
- **Implementation**: Apply ATTACK_DEBUFF status
- **Example**: `effects: ['weaken']`
- **Parameters**: Reduction amount and duration

#### 5. **VULNERABILITY**
- **Description**: Reduces target's defense stat
- **Implementation**: Apply DEFENSE_DEBUFF status
- **Example**: `effects: ['vulnerability']`
- **Parameters**: Reduction amount and duration

#### 6. **BLIND**
- **Description**: Reduces target's accuracy
- **Implementation**: Apply BLIND status
- **Example**: `effects: ['blind']`
- **Parameters**: Accuracy reduction and duration

### 💚 Buff Effect Attacks

#### 7. **STRENGTHEN**
- **Description**: Increases attacker's attack stat
- **Implementation**: Apply ATTACK_BUFF to self
- **Example**: `effects: ['strengthen']`
- **Parameters**: Bonus amount and duration

#### 8. **FORTIFY**
- **Description**: Increases attacker's defense stat
- **Implementation**: Apply DEFENSE_BUFF to self
- **Example**: `effects: ['fortify']`
- **Parameters**: Bonus amount and duration

#### 9. **REGENERATION**
- **Description**: Heals over time
- **Implementation**: Apply REGENERATION status
- **Example**: `effects: ['regeneration']`
- **Parameters**: Healing per turn and duration

#### 10. **HASTE**
- **Description**: Increases speed/action economy
- **Implementation**: Apply HASTE status
- **Example**: `effects: ['haste']`
- **Parameters**: Speed bonus and duration

### 🧹 Cleansing/Dispel Effects

#### 11. **CLEANSE**
- **Description**: Removes all debuffs from target
- **Implementation**: New effect type that clears debuff statuses
- **Example**: `effects: ['cleanse']`
- **Target**: Self or ally
- **Parameters**: None

#### 12. **DISPEL**
- **Description**: Removes all buffs from target
- **Implementation**: New effect type that clears buff statuses
- **Example**: `effects: ['dispel']`
- **Target**: Enemy
- **Parameters**: None

#### 13. **PURGE**
- **Description**: Removes ALL status effects (buffs and debuffs)
- **Implementation**: New effect type that clears all statuses
- **Example**: `effects: ['purge']`
- **Target**: Any
- **Parameters**: None

### 🎯 Special Effect Attacks

#### 14. **MARK**
- **Description**: Marks target for increased damage from all sources
- **Implementation**: Apply MARKED status that amplifies incoming damage
- **Example**: `effects: ['mark']`
- **Parameters**: Damage amplification % and duration

#### 15. **BLEED**
- **Description**: Causes bleeding damage over time
- **Implementation**: Similar to burn/poison but with physical theme
- **Example**: `effects: ['bleed']`
- **Parameters**: Damage per turn and duration

#### 16. **CONFUSION**
- **Description**: Causes target to attack randomly (including allies)
- **Implementation**: Apply CONFUSED status
- **Example**: `effects: ['confusion']`
- **Parameters**: Duration

#### 17. **TAUNT**
- **Description**: Forces enemy to target the attacker
- **Implementation**: Apply TAUNTED status
- **Example**: `effects: ['taunt']`
- **Parameters**: Duration

#### 18. **SHIELD**
- **Description**: Grants temporary HP/damage absorption
- **Implementation**: Apply SHIELD status
- **Example**: `effects: ['shield']`
- **Parameters**: Shield amount

### ⚡ Multi-Hit and Special Mechanics

#### 19. **MULTI_HIT**
- **Description**: Attack hits multiple times (2-5 hits)
- **Implementation**: Process damage calculation multiple times
- **Example**: Special attack property, not in effects array
- **Parameters**: Hit count or range

#### 20. **CRITICAL_STRIKE**
- **Description**: Chance to deal extra damage
- **Implementation**: Roll for crit chance, multiply damage
- **Example**: Special attack property
- **Parameters**: Crit chance and multiplier

#### 21. **EXECUTE**
- **Description**: Deals massive damage to low HP targets
- **Implementation**: Damage scales inversely with target HP%
- **Example**: Special attack property
- **Parameters**: HP threshold

## Implementation Plan

### Phase 1: Core Status Effects
1. Extend `applyAttackEffect` to handle new effect types (STUN, FREEZE, etc.)
2. Create status effect definitions for each new type
3. Update `StatusEffect` type if needed

### Phase 2: Cleanse/Dispel System
1. Create `CLEANSE`, `DISPEL`, `PURGE` effect applicators
2. Add utility functions to filter and remove statuses
3. Create attack factories that use these effects

### Phase 3: Attack Factories
1. Create helper functions to generate common attack patterns:
   - `createBurnAttack(name, damage, burnDuration)`
   - `createStunAttack(name, damage, stunDuration)`
   - `createCleanseAttack(name, damage, targetType)`
   - etc.

### Phase 4: UI Integration
1. Add buttons in BattleEngineExample for new attack types
2. Create test scenarios for each attack type
3. Add visual feedback for new effects

## Example Attack Definitions

```typescript
// Fire Breath - Applies burn
const fireBreath: Attack = {
  name: "Fire Breath",
  template: "fire",
  attackType: "magical",
  damage: 20,
  trueDamage: 0,
  effects: ['burn'],
  chanceToLand: 0.9,
  cooldown: 2,
  icon: "🔥",
  notes: "Breathes fire, applying burn"
}

// Venomous Bite - Applies poison
const venomousBite: Attack = {
  name: "Venomous Bite",
  template: "poison",
  attackType: "physical",
  damage: 15,
  trueDamage: 0,
  effects: ['poison'],
  chanceToLand: 0.95,
  cooldown: 1,
  icon: "🧪",
  notes: "Bites with poison fangs"
}

// Stunning Strike - Stuns target
const stunningStrike: Attack = {
  name: "Stunning Strike",
  template: "stun",
  attackType: "physical",
  damage: 18,
  trueDamage: 0,
  effects: ['stun'],
  chanceToLand: 0.85,
  cooldown: 3,
  icon: "💫",
  notes: "Stuns the target for 1 turn"
}

// Cleansing Touch - Heals and removes debuffs
const cleansingTouch: Attack = {
  name: "Cleansing Touch",
  template: "cleanse",
  attackType: "support",
  damage: 0,
  trueDamage: 0,
  effects: ['heal', 'cleanse'],
  chanceToLand: 1.0,
  cooldown: 4,
  icon: "✨",
  notes: "Heals ally and removes debuffs"
}

// Dispel Magic - Removes enemy buffs
const dispelMagic: Attack = {
  name: "Dispel Magic",
  template: "dispel",
  attackType: "magical",
  damage: 10,
  trueDamage: 0,
  effects: ['dispel'],
  chanceToLand: 1.0,
  cooldown: 3,
  icon: "🌟",
  notes: "Removes all buffs from enemy"
}

// Berserker Rage - Self-buff
const berserkerRage: Attack = {
  name: "Berserker Rage",
  template: "self-buff",
  attackType: "physical",
  damage: 0,
  trueDamage: 0,
  effects: ['strengthen', 'fortify'],
  chanceToLand: 1.0,
  cooldown: 5,
  icon: "💪",
  notes: "Increases attack and defense"
}
```

## Status Effect Configuration

Each status effect should have configurable parameters:
- **Duration**: How many turns it lasts
- **Magnitude**: Damage/healing/stat modifier amount
- **Stack Behavior**: Can multiple instances exist? Do they stack or refresh?
- **Visual**: Icon and animation

## Next Steps

1. ✅ Create this design document
2. Extend `applyAttackEffect` to handle new effect types
3. Create cleanse/dispel effect applicators
4. Create attack factory helper functions
5. Add example attacks to BattleEngineExample
6. Test each attack type thoroughly
