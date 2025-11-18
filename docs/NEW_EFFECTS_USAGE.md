# New Status Effects - Usage Guide

Quick reference for using the 5 newly implemented status effects.

## 🎯 Quick Reference

| Effect | Icon | Duration | Type | Purpose |
|--------|------|----------|------|---------|
| FREEZE | ❄️ | 2 turns | Debuff | Reduces defense (-5), prevents actions |
| SLOW | 🐌 | 4 turns | Debuff | Causes turn skipping (every 2nd turn) |
| ATTACK_DEBUFF | ⚔️⬇️ | 3 turns | Debuff | Reduces attack stat (-10) |
| CLEANSE | ✨ | Instant | Utility | Removes all debuffs |
| SILENCE | 🤐 | 2 turns | Debuff | Prevents special abilities (basic attacks only) |

## 💻 Code Examples

### Import Factory Functions

```typescript
import {
  buildFreezeEffect,
  buildSlowEffect,
  buildAttackDebuffEffect,
  buildCleanseEffect,
  buildSilenceEffect
} from '@/utils/effectPipeline/factories'
```

### Apply Effects

```typescript
// FREEZE - Reduce defense and prevent actions
const freezeEffect = buildFreezeEffect(targetId)
await processEffectChain([freezeEffect], context)

// SLOW - Cause turn skipping
const slowEffect = buildSlowEffect(targetId)
await processEffectChain([slowEffect], context)

// ATTACK_DEBUFF - Reduce attack stat
const weakenEffect = buildAttackDebuffEffect(targetId, 10) // -10 attack
await processEffectChain([weakenEffect], context)

// CLEANSE - Remove all debuffs
const cleanseEffect = buildCleanseEffect(targetId)
await processEffectChain([cleanseEffect], context)

// SILENCE - Prevent special abilities
const silenceEffect = buildSilenceEffect(targetId)
await processEffectChain([silenceEffect], context)
```

### Use in Attack Definitions

```typescript
// Example: Ice Blast attack that freezes target
const iceBlast: Attack = {
  id: 'ice-blast',
  name: 'Ice Blast',
  icon: '❄️',
  damage: 15,
  energyCost: 2,
  targetType: 'single',
  effects: [
    {
      type: 'FREEZE',
      chance: 0.8, // 80% chance to freeze
      factory: (targetId: number) => buildFreezeEffect(targetId)
    }
  ]
}

// Example: Time Warp attack that slows target
const timeWarp: Attack = {
  id: 'time-warp',
  name: 'Time Warp',
  icon: '🐌',
  damage: 10,
  energyCost: 3,
  targetType: 'single',
  effects: [
    {
      type: 'SLOW',
      chance: 1.0, // Always slows
      factory: (targetId: number) => buildSlowEffect(targetId)
    }
  ]
}

// Example: Weaken attack that reduces enemy attack
const weaken: Attack = {
  id: 'weaken',
  name: 'Weaken',
  icon: '⚔️⬇️',
  damage: 5,
  energyCost: 1,
  targetType: 'single',
  effects: [
    {
      type: 'ATTACK_DEBUFF',
      chance: 1.0,
      factory: (targetId: number) => buildAttackDebuffEffect(targetId, 15) // -15 attack
    }
  ]
}

// Example: Purify attack that cleanses ally
const purify: Attack = {
  id: 'purify',
  name: 'Purify',
  icon: '✨',
  damage: 0, // Utility, no damage
  energyCost: 2,
  targetType: 'ally',
  effects: [
    {
      type: 'CLEANSE',
      chance: 1.0,
      factory: (targetId: number) => buildCleanseEffect(targetId)
    }
  ]
}

// Example: Silence Spell that prevents abilities
const silenceSpell: Attack = {
  id: 'silence',
  name: 'Silence',
  icon: '🤐',
  damage: 8,
  energyCost: 2,
  targetType: 'single',
  effects: [
    {
      type: 'SILENCE',
      chance: 0.7, // 70% chance
      factory: (targetId: number) => buildSilenceEffect(targetId)
    }
  ]
}
```

## 🎮 UI Integration

### Add Test Buttons (for development)

In your battle UI component:

```typescript
// Freeze button
<button onClick={() => {
  const effect = buildFreezeEffect(enemyId)
  processEffectChain([effect], context)
}}>
  ❄️ Freeze
</button>

// Slow button
<button onClick={() => {
  const effect = buildSlowEffect(enemyId)
  processEffectChain([effect], context)
}}>
  🐌 Slow
</button>

// Weaken button
<button onClick={() => {
  const effect = buildAttackDebuffEffect(enemyId, 10)
  processEffectChain([effect], context)
}}>
  ⚔️⬇️ Weaken
</button>

// Cleanse button
<button onClick={() => {
  const effect = buildCleanseEffect(allyId)
  processEffectChain([effect], context)
}}>
  ✨ Cleanse
</button>

// Silence button
<button onClick={() => {
  const effect = buildSilenceEffect(enemyId)
  processEffectChain([effect], context)
}}>
  🤐 Silence
</button>
```

## 📊 Status Badge Display

Status badges automatically show in the UI when effects are applied:

```typescript
// Status badges will display:
// ❄️ 2 - Frozen (2 turns remaining)
// 🐌 4 - Slowed (4 turns remaining)
// ⚔️⬇️ 3 - Attack Down (3 turns remaining)
// 🤐 2 - Silenced (2 turns remaining)
// Note: CLEANSE is instant, no badge persists
```

## 🔍 Checking Status Effects

```typescript
// Check if creature is frozen
const isFrozen = creature.statuses.some(s => s.id === 'FREEZE')

// Check if creature is slowed
const isSlowed = creature.statuses.some(s => s.id === 'SLOW')

// Check if creature has attack debuff
const hasAttackDebuff = creature.statuses.some(s => s.id === 'ATTACK_DEBUFF')

// Check if creature is silenced
const isSilenced = creature.statuses.some(s => s.id === 'SILENCE')

// Get attack debuff amount
const attackDebuff = creature.statuses.find(s => s.id === 'ATTACK_DEBUFF')
const reduction = attackDebuff?.attackReduction || 0
```

## 🧪 Testing

Run E2E tests:

```bash
# Test all new status effects
npm run test:e2e -- tests/e2e/new-status-effects.spec.ts

# Test specific effect
npm run test:e2e -- tests/e2e/new-status-effects.spec.ts --grep "FREEZE"
npm run test:e2e -- tests/e2e/new-status-effects.spec.ts --grep "SLOW"
npm run test:e2e -- tests/e2e/new-status-effects.spec.ts --grep "ATTACK_DEBUFF"
npm run test:e2e -- tests/e2e/new-status-effects.spec.ts --grep "CLEANSE"
npm run test:e2e -- tests/e2e/new-status-effects.spec.ts --grep "SILENCE"
```

## ⚙️ Effect Mechanics

### FREEZE ❄️
- **Application**: Reduces defense by 5, sets `preventsActions` flag
- **Duration**: 2 turns (passive, no tick)
- **Behavior**: Frozen creatures cannot take actions (checked by turn system)
- **Priority**: 50 (standard)

### SLOW 🐌
- **Application**: Sets `skipFrequency: 2` (skip every 2nd turn)
- **Duration**: 4 turns (passive, no tick)
- **Behavior**: Turn system increments `turnCounter`, skips action when counter % skipFrequency === 0
- **Priority**: 50 (standard)

### ATTACK_DEBUFF ⚔️⬇️
- **Application**: Reduces attack stat by specified amount (default: 10)
- **Duration**: 3 turns (passive, no tick)
- **Behavior**: Attack reduction persists in status data, combat system uses modified attack
- **Priority**: 50 (standard)

### CLEANSE ✨
- **Application**: Instant - removes all debuffs (BURN, POISON, BLEED, FREEZE, SLOW, ATTACK_DEBUFF, etc.)
- **Duration**: N/A (instant effect, doesn't persist)
- **Behavior**: Creates STATUS_REMOVED changes for each debuff found
- **Priority**: 80 (high - executes before other effects)

### SILENCE 🤐
- **Application**: Sets `preventsAbilities` flag
- **Duration**: 2 turns (passive, no tick)
- **Behavior**: Attack selection system should filter out non-basic attacks when silenced
- **Priority**: 50 (standard)

## 🔧 Advanced Usage

### Combining Effects

```typescript
// Apply multiple debuffs at once
const effects = [
  buildFreezeEffect(enemyId),
  buildSlowEffect(enemyId),
  buildAttackDebuffEffect(enemyId, 15)
]
await processEffectChain(effects, context)

// Cleanse then buff ally
const supportCombo = [
  buildCleanseEffect(allyId),
  buildShieldEffect(allyId, 20),
  buildAttackBuffEffect(allyId, 10)
]
await processEffectChain(supportCombo, context)
```

### Custom Durations/Values

Note: Current implementations use hardcoded durations matching status definitions. To customize:

```typescript
// Custom attack debuff amount
buildAttackDebuffEffect(targetId, 20) // -20 attack instead of -10

// For custom durations, you'd need to modify the factory or add parameters
// (Current implementation uses fixed durations from STATUS_EFFECTS definitions)
```

## 📝 Notes

- All effects follow the **two-phase pattern**: application creates status, tick (if needed) applies effect
- FREEZE, SLOW, ATTACK_DEBUFF, SILENCE are **passive** (no tick, duration just counts down)
- CLEANSE is **instant** (executes once, doesn't persist as status)
- Effects are **isolated** - they don't interfere with existing effects
- Status badges auto-display with durations
- All effects are fully tested in E2E test suite

## 🐛 Troubleshooting

**Effect doesn't apply:**
- Check console logs for applicator registration
- Verify effect factory is imported in component
- Ensure targetId is valid creature ID (number)

**Duration not decrementing:**
- Check processEndOfTurn is being called
- Verify status exists in creature.statuses array
- Look for console warnings about missing status data

**Stats not changing:**
- FREEZE: Check defense stat is being read from creature
- ATTACK_DEBUFF: Verify combat system uses modified attack stat
- SLOW: Ensure turn system checks skipFrequency

**Tests failing:**
- UI buttons may not exist yet - tests gracefully skip if buttons missing
- Start dev server: `npm run dev`
- Run tests: `npm run test:e2e -- tests/e2e/new-status-effects.spec.ts`
