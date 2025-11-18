# Complete Implementation Guide: Status Effect System

📚 **System Overview**

This is a two-phase effect pipeline system for a turn-based battle game. Status effects are serializable, decoupled from their application logic, and follow strict patterns for consistency.

## Architecture Components

```
src/utils/effectPipeline/
├── effects/statusEffects.ts    # Effect applicators (pure functions)
├── factories.ts                # Factory functions to create effects
├── hooks/useBattleEngine.ts    # processEndOfTurn integration
├── battleContext.ts            # Status definitions and context
└── types.ts                    # Type definitions

src/consts/
└── statuses.ts                 # UI status definitions
```

## 🎯 Core Concept: Two-Phase Pattern

### Phase 1: Initial Application
- Effect is applied for the FIRST time
- Stores data in status (e.g., damagePerTurn, shieldAmount)
- NO immediate damage/healing (for DoT/HoT effects)
- Returns STATUS_APPLIED state change

### Phase 2: Tick (Turn End)
- Effect is already on the creature
- Reads stored data from status
- Applies damage/healing/effects
- Returns HEALTH_CHANGE or other state changes

### Detection Pattern

```typescript
const hasStatus = creature.statuses.some(s => s.id === 'STATUS_NAME')

if (hasStatus) {
  // Phase 2: This is a tick - apply effect
} else {
  // Phase 1: First application - store data
}
```

## 📋 Implementation Checklist

For each new status effect, you must modify **5 files**:

```
MUST MODIFY (5 files):
├── src/utils/effectPipeline/effects/statusEffects.ts
│   ├── Add type definition (line ~40-60)
│   ├── Add applicator function (line ~450-790)
│   └── Register applicator (line ~785-815)
│
├── src/utils/effectPipeline/factories.ts
│   └── Add factory function (line ~220-300)
│
├── src/utils/effectPipeline/hooks/useBattleEngine.ts
│   ├── Add import (line ~14-33)
│   └── Add processEndOfTurn handler (line ~216-240)
│
├── src/utils/effectPipeline/battleContext.ts
│   └── Add to STATUS_EFFECTS object (line ~410-480)
│
└── src/consts/statuses.ts
    └── Add status definition (line ~45-155)
```

## 🔧 Step-by-Step Implementation

### Pattern A: DoT (Damage over Time) - BLEED, BURN, POISON

#### ✅ Step 1: Effect Data Type

**File:** `src/utils/effectPipeline/effects/statusEffects.ts`  
**Location:** After existing type definitions (around line 40)

```typescript
export type BleedEffectData = {
  damage: number
}
```

#### ✅ Step 2: Effect Applicator

**File:** `src/utils/effectPipeline/effects/statusEffects.ts`  
**Location:** Before `// REGISTER APPLICATORS` section (around line 450)

```typescript
/**
 * Apply a bleed effect that deals damage over time
 * Bleed represents damage from open wounds that cause continuous bleeding
 */
const applyBleedEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const { damage } = effect.data as BleedEffectData
  const creature = getCreatureFromContext(context, effect.targetId)

  // Check if the creature already has bleed status
  const hasBleedStatus = creature.statuses.some(s => s.id === 'BLEED')

  if (hasBleedStatus) {
    // Phase 2: This is a tick - deal damage only
    const actualDamage = Math.min(damage, creature.health)
    const newHealth = creature.health - actualDamage

    console.log(`🩸 Bleed tick: ${creature.name} takes ${actualDamage} bleed damage (${creature.health} → ${newHealth})`)

    const healthChange: HealthChange = {
      type: 'HEALTH_CHANGE',
      creatureId: effect.targetId,
      timestamp: Date.now(),
      data: {
        delta: -actualDamage,
        newHealth,
        source: 'bleed'
      }
    }

    const animations: Animation[] = [
      { type: 'bleed', targetId: effect.targetId, duration: 500 },
      { type: 'damage-number', targetId: effect.targetId, duration: 1000, data: { value: -damage } }
    ]

    return {
      stateChanges: [healthChange],
      animations
    }
  } else {
    // Phase 1: First application - only apply status, no damage
    console.log(`🩸 Applying bleed status to ${creature.name} (${damage} dmg/turn for 3 turns)`)

    const statusChange: StateChange = {
      type: 'STATUS_APPLIED',
      creatureId: effect.targetId,
      timestamp: Date.now(),
      data: {
        statusId: 'BLEED',
        duration: 3,
        damagePerTurn: damage,  // Store damage value in status data
        source: 'bleed'
      }
    }

    const animations: Animation[] = [
      { type: 'status-icon', targetId: effect.targetId, duration: 800, data: { status: 'BLEED' } }
    ]

    return {
      stateChanges: [statusChange],
      animations
    }
  }
}
```

#### ✅ Step 3: Register Applicator

**File:** `src/utils/effectPipeline/effects/statusEffects.ts`  
**Location:** In the `// REGISTER APPLICATORS` section (around line 785)

```typescript
registerEffectApplicator('BLEED', applyBleedEffect)
console.log('✅ BLEED applicator registered')
```

#### ✅ Step 4: Factory Function

**File:** `src/utils/effectPipeline/factories.ts`  
**Location:** After buildShieldEffect (around line 220)

```typescript
/**
 * Build a bleed effect
 * Creates a DoT effect from open wounds that cause continuous bleeding
 */
export const buildBleedEffect = (
  targetId: number,
  damage: number = 8
): Effect => ({
  id: generateEffectId('bleed'),
  type: 'BLEED',
  targetId,
  priority: 40,
  timestamp: Date.now(),
  data: { damage }
})
```

#### ✅ Step 5: processEndOfTurn Integration

**File:** `src/utils/effectPipeline/hooks/useBattleEngine.ts`

**Part A - Add import (line 14-33):**

```typescript
import {
  buildBurnEffect,
  buildPoisonEffect,
  buildRegenerationEffect,
  buildBleedEffect,  // ← ADD THIS
  // ... other imports
} from '../factories'
```

**Part B - Add tick handling (around line 216):**

```typescript
} else if (sid === 'BLEED') {
  const damage = status.damagePerTurn ?? 8  // Use stored value or default
  if (status.damagePerTurn === undefined) {
    console.warn(`⚠️ BLEED status on ${creature.name} missing damagePerTurn! Using fallback: 8`)
  }
  console.log(`🩸 Creating bleed tick effect for ${creature.name} (${damage} dmg)`)
  effectsToApply.push(buildBleedEffect(creature.ID, damage))
} else if (sid === 'SHIELD') {
```

#### ✅ Step 6: battleContext STATUS_EFFECTS Registration

**File:** `src/utils/effectPipeline/battleContext.ts`  
**Location:** Inside `getStatusEffectById()` STATUS_EFFECTS object (line ~410-480)

```typescript
BLEED: {
  name: "Bleed",
  type: "debuff",
  timing: "onTurnEnd",
  duration: 3,
  effectFuncName: "applyBleed",
  chance: 1,
  icon: "🩸",
  id: "BLEED",
  notes: "Loses HP per turn from open wounds.",
},
```

**⚠️ CRITICAL:** Without this step, the status won't be recognized by `getStatusEffectById()` and UI rendering will fail!

#### ✅ Step 7: Status Definition

**File:** `src/consts/statuses.ts`  
**Location:** Inside STATUS_EFFECTS object (around line 45)

```typescript
BLEED: {
  name: "Bleed",
  type: "debuff",
  timing: "afterAttack",
  duration: 3,
  effectFuncName: "applyBleed",
  chance: 1,
  icon: "🩸",
  id: `BLEED`,
  notes: "Loses HP per turn from open wounds.",
},
```

---

### Pattern B: Hybrid (Action Prevention + Stat Mod) - FREEZE

#### Step 1: Effect Data Type

```typescript
export type FreezeEffectData = {
  defenseReduction: number
}
```

#### Step 2: Effect Applicator

```typescript
const applyFreezeEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const { defenseReduction } = effect.data as FreezeEffectData
  const creature = getCreatureFromContext(context, effect.targetId)

  const hasFreezeStatus = creature.statuses.some(s => s.id === 'FREEZE')

  if (hasFreezeStatus) {
    // Freeze doesn't tick - it's a passive effect
    console.log(`❄️ ${creature.name} remains frozen (no tick effect)`)
    return {
      stateChanges: [],
      animations: []
    }
  } else {
    // First application - apply status and reduce defense
    console.log(`❄️ Freezing ${creature.name} (-${defenseReduction} defense, cannot act for 2 turns)`)

    const statChange: StateChange = {
      type: 'STAT_MODIFIED',
      creatureId: effect.targetId,
      timestamp: Date.now(),
      data: {
        statName: 'defense',
        value: -defenseReduction,
        source: 'freeze'
      }
    }

    const statusChange: StateChange = {
      type: 'STATUS_APPLIED',
      creatureId: effect.targetId,
      timestamp: Date.now(),
      data: {
        statusId: 'FREEZE',
        duration: 2,
        defenseReduction,
        preventsActions: true,  // ← Special flag
        source: 'freeze'
      }
    }

    const animations: Animation[] = [
      { type: 'status-icon', targetId: effect.targetId, duration: 800, data: { status: 'FREEZE' } }
    ]

    return {
      stateChanges: [statChange, statusChange],  // ← TWO changes!
      animations
    }
  }
}
```

#### Steps 3-7: Same pattern as DoT

```typescript
// Register
registerEffectApplicator('FREEZE', applyFreezeEffect)

// Factory
export const buildFreezeEffect = (
  targetId: number,
  defenseReduction: number = 5
): Effect => ({
  id: generateEffectId('freeze'),
  type: 'FREEZE',
  targetId,
  priority: 30,
  timestamp: Date.now(),
  data: { defenseReduction }
})

// processEndOfTurn (Passive - No Tick!)
} else if (sid === 'FREEZE') {
  // Freeze doesn't tick - it's a passive effect that prevents actions
  console.log(`❄️ ${creature.name} is frozen (no tick, passive action prevention + defense reduction)`)
} else if (sid === 'SHIELD') {

// battleContext.ts
FREEZE: {
  name: "Freeze",
  type: "debuff",
  timing: "beforeAttack",
  duration: 2,
  effectFuncName: "applyFreeze",
  chance: 1,
  icon: "❄️",
  id: "FREEZE",
  notes: "Prevents actions and reduces defense.",
},

// statuses.ts
FREEZE: {
  name: "Freeze",
  type: "debuff",
  timing: "beforeAttack",
  duration: 2,
  effectFuncName: "applyFreeze",
  chance: 1,
  icon: "❄️",
  id: `FREEZE`,
  notes: "Prevents actions and reduces defense.",
},
```

---

### Pattern C: Probabilistic DoT - CONFUSION

#### Step 1: Effect Data Type

```typescript
export type ConfusionEffectData = {
  damage: number
  selfDamageChance: number  // ← RNG parameter
}
```

#### Step 2: Effect Applicator

```typescript
const applyConfusionEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const { damage, selfDamageChance } = effect.data as ConfusionEffectData
  const creature = getCreatureFromContext(context, effect.targetId)

  const hasConfusionStatus = creature.statuses.some(s => s.id === 'CONFUSION')

  if (hasConfusionStatus) {
    // Phase 2: Tick - roll for self-damage
    const roll = Math.random()

    if (roll < selfDamageChance) {
      // Confused creature attacks itself!
      const actualDamage = Math.min(damage, creature.health)
      const newHealth = creature.health - actualDamage

      console.log(`😵 Confusion tick: ${creature.name} attacks itself! ${actualDamage} damage (${creature.health} → ${newHealth})`)

      const healthChange: HealthChange = {
        type: 'HEALTH_CHANGE',
        creatureId: effect.targetId,
        timestamp: Date.now(),
        data: {
          delta: -actualDamage,
          newHealth,
          source: 'confusion'
        }
      }

      const animations: Animation[] = [
        { type: 'confusion', targetId: effect.targetId, duration: 600 },
        { type: 'damage-number', targetId: effect.targetId, duration: 1000, data: { value: -actualDamage } }
      ]

      return {
        stateChanges: [healthChange],
        animations
      }
    } else {
      // No self-damage this turn
      console.log(`😵 Confusion tick: ${creature.name} resisted confusion (no self-damage)`)

      const animations: Animation[] = [
        { type: 'confusion', targetId: effect.targetId, duration: 400 }
      ]

      return {
        stateChanges: [],
        animations
      }
    }
  } else {
    // Phase 1: First application
    console.log(`😵 Applying confusion to ${creature.name} (${Math.round(selfDamageChance * 100)}% chance to self-damage for 3 turns)`)

    const statusChange: StateChange = {
      type: 'STATUS_APPLIED',
      creatureId: effect.targetId,
      timestamp: Date.now(),
      data: {
        statusId: 'CONFUSION',
        duration: 3,
        damage,
        selfDamageChance,  // ← Store RNG parameter
        source: 'confusion'
      }
    }

    const animations: Animation[] = [
      { type: 'status-icon', targetId: effect.targetId, duration: 800, data: { status: 'CONFUSION' } }
    ]

    return {
      stateChanges: [statusChange],
      animations
    }
  }
}
```

#### Step 5: processEndOfTurn (DOES Tick!)

```typescript
} else if (sid === 'CONFUSION') {
  // Confusion DOES tick - chance for self-damage each turn
  const damage = status.damage ?? 6
  const selfDamageChance = status.selfDamageChance ?? 0.5
  if (status.damage === undefined || status.selfDamageChance === undefined) {
    console.warn(`⚠️ CONFUSION status on ${creature.name} missing damage or selfDamageChance! Using fallbacks: ${damage} dmg, ${selfDamageChance} chance`)
  }
  console.log(`😵 Creating confusion tick effect for ${creature.name} (${damage} dmg, ${Math.round(selfDamageChance * 100)}% chance)`)
  effectsToApply.push(buildConfusionEffect(creature.ID, damage, selfDamageChance))
} else {
```

---

### Pattern D: Passive Stat Modification - SLOW

Simplified Version (No Tick)

```typescript
// Data Type
export type SlowEffectData = {
  speedReduction: number
}

// Applicator
const applySlowEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const { speedReduction } = effect.data as SlowEffectData
  const creature = getCreatureFromContext(context, effect.targetId)

  const hasSlowStatus = creature.statuses.some(s => s.id === 'SLOW')

  if (hasSlowStatus) {
    // Passive - no tick
    console.log(`🐌 ${creature.name} remains slowed (no tick effect)`)
    return {
      stateChanges: [],
      animations: []
    }
  } else {
    console.log(`🐌 Slowing ${creature.name} (-${speedReduction} speed for 3 turns)`)

    const statChange: StateChange = {
      type: 'STAT_MODIFIED',
      creatureId: effect.targetId,
      timestamp: Date.now(),
      data: {
        statName: 'speed',
        value: -speedReduction,
        source: 'slow'
      }
    }

    const statusChange: StateChange = {
      type: 'STATUS_APPLIED',
      creatureId: effect.targetId,
      timestamp: Date.now(),
      data: {
        statusId: 'SLOW',
        duration: 3,
        speedReduction,
        source: 'slow'
      }
    }

    return {
      stateChanges: [statChange, statusChange],
      animations: [
        { type: 'status-icon', targetId: effect.targetId, duration: 800, data: { status: 'SLOW' } }
      ]
    }
  }
}

// processEndOfTurn (Passive)
} else if (sid === 'SLOW') {
  console.log(`🐌 ${creature.name} is slowed (no tick, passive speed reduction)`)
} else if (sid === 'SHIELD') {
```

---

## 📊 Pattern Decision Tree

```
Is it DoT/HoT (damage/healing over time)?
├─ YES → Use DoT Pattern (BLEED, BURN, POISON, REGENERATION)
│         - Stores damagePerTurn/healPerTurn
│         - DOES tick in processEndOfTurn
│         - No immediate effect on application
└─ NO → Is it probabilistic?
    ├─ YES → Use Probabilistic Pattern (CONFUSION)
    │         - Stores RNG parameters
    │         - DOES tick with random chance
    └─ NO → Is it multi-mechanic (2+ effects)?
        ├─ YES → Use Hybrid Pattern (FREEZE)
        │         - Multiple stateChanges
        │         - Passive effect (no tick)
        └─ NO → Use Passive Pattern (SLOW, SILENCE, SHIELD)
                  - Single stateChange
                  - Passive effect (no tick)
```

---

## 🎨 Common Patterns & Guidelines

### State Change Types

```typescript
// Health modification
{
  type: 'HEALTH_CHANGE',
  creatureId: targetId,
  timestamp: Date.now(),
  data: {
    delta: -damage,  // or +healing
    newHealth: creature.health - damage,
    source: 'effect-name'
  }
}

// Stat modification
{
  type: 'STAT_MODIFIED',
  creatureId: targetId,
  timestamp: Date.now(),
  data: {
    statName: 'attack' | 'defense' | 'speed',
    value: 10,  // positive or negative
    source: 'effect-name'
  }
}

// Status application
{
  type: 'STATUS_APPLIED',
  creatureId: targetId,
  timestamp: Date.now(),
  data: {
    statusId: 'STATUS_NAME',
    duration: 3,
    // ... custom fields (damagePerTurn, etc.)
    source: 'effect-name'
  }
}
```

### Animation Types

```typescript
// Common animations
{ type: 'status-icon', targetId, duration: 800, data: { status: 'NAME' } }
{ type: 'damage-number', targetId, duration: 1000, data: { value: -10 } }
{ type: 'shake', targetId, duration: 300 }
{ type: 'healing', targetId, duration: 800 }
```

### Priority Values

- **100**: Death effects
- **55**: True damage
- **50**: Attacks
- **45**: AOE attacks
- **40**: DoT effects (BURN, POISON, BLEED, CONFUSION)
- **35**: HoT effects (REGENERATION)
- **30**: Control effects (FREEZE, SILENCE, STUN)
- **28**: Shield
- **25**: Buffs (SLOW, ATTACK_BUFF, DEFENSE_BUFF)

### Icon Guide

- 🔥 BURN
- 🧪 POISON
- 🩸 BLEED
- ❄️ FREEZE
- 🐌 SLOW
- 🤐 SILENCE
- 😵 CONFUSION
- 💚 REGENERATION
- 🛡️ SHIELD
- ⚡ STUN

---

## 📐 Type Definitions Reference

```typescript
// Effect (factories.ts return type)
type Effect = {
  id: string
  type: string  // 'BLEED', 'BURN', etc.
  targetId: number
  priority: number
  timestamp: number
  data: object  // Custom data per effect type
}

// EffectApplicationResult (applicator return type)
type EffectApplicationResult = {
  stateChanges: StateChange[]
  animations: Animation[]
}

// StateChange types
type StateChange = 
  | HealthChange 
  | StatusApplied 
  | StatusRemoved 
  | StatModified

// Creature (from context)
type Creature = {
  ID: number
  name: string
  health: number
  maxHealth: number
  attack: number
  defense: number
  statuses: Status[]
  // ...
}

// Status (on creature)
type Status = {
  id: string
  name: string
  type: 'buff' | 'debuff'
  duration: number
  icon: string
  // Custom fields stored from STATUS_APPLIED data:
  damagePerTurn?: number
  healPerTurn?: number
  shieldAmount?: number
  // ...
}
```

---

## 🚨 Common Pitfalls & Debugging

### Issue: Status badge doesn't appear
**Cause:** Missing from `battleContext.ts` STATUS_EFFECTS  
**Fix:** Add status to `getStatusEffectById()` object in battleContext.ts

### Issue: Status doesn't tick
**Cause:** Missing from `processEndOfTurn()` in `useBattleEngine.ts`  
**Fix:** Add tick handler with `effectsToApply.push(build[Name]Effect(...))`

### Issue: "Cannot find name 'build[Name]Effect'"
**Cause:** Missing import in `useBattleEngine.ts`  
**Fix:** Add to import statement from '../factories'

### Issue: Status applies but no damage/effect happens
**Cause:** Two-phase detection failing - check `hasStatus` logic  
**Fix:** Ensure status.id matches exactly (case-sensitive!)

### Issue: "applicator not registered" error
**Cause:** Missing `registerEffectApplicator()` call  
**Fix:** Add registration in statusEffects.ts bottom section

### Issue: Tests pass but UI doesn't show status
**Cause:** Missing from battleContext.ts or statuses.ts  
**Fix:** Add to both STATUS_EFFECTS objects with matching icon

---

## 🔗 Attack Integration (Optional)

To make attacks apply status effects:

### File: `src/utils/effectPipeline/effects/combatEffects.ts`
**Location:** In processAttackEffects section (~line 144-160)

```typescript
} else if (effectType === 'BLEED') {
  console.log(`🩸 Attack applies bleed effect to ${target.name}`)
  stateChanges.push({
    type: 'STATUS_APPLIED',
    creatureId: effect.targetId,
    timestamp: Date.now(),
    data: {
      statusId: 'BLEED',
      duration: 3,
      damagePerTurn: 7
    }
  })
}
```

### File: `src/utils/effectPipeline/integration/BattleEngineExample.tsx`
**Location:** In handleCreatureClick switch statement (~line 417)

```typescript
case 'bleed':
case 'lacerate':
  await executeBleedAttack(creatureId)
  break
```

**And add the attack executor function:**

```typescript
const executeBleedAttack = async (targetId: number) => {
  if (playerCreatures.length > 0) {
    const attack = {
      ID: 'bleed-attack',
      name: "Bleed",
      baseDamage: 12,
      effects: ['bleed'],
      chanceToLand: 1,
      trueDamage: 0,
      icon: "🩸",
      notes: "Physical attack causing bleeding (7 dmg/turn for 3 turns)",
      cooldown: 0
    }
    await performAttack(playerCreatures[0].ID, targetId, attack)
    setIsSelectingTarget(false)
    setPendingAction(null)
  }
}
```

---

## 🧪 Testing Checklist

After implementing a new status effect:

```typescript
// 1. Apply status to creature
await applyEffect(buildBleedEffect(creatureId, 10))

// 2. Check console for initial application log
// Expected: "🩸 Applying bleed status to Goblin (10 dmg/turn for 3 turns)"

// 3. Check creature.statuses array
// Expected: { id: 'BLEED', duration: 3, damagePerTurn: 10, ... }

// 4. End turn
await processEndOfTurn()

// 5. Check console for tick log (if applicable)
// Expected: "🩸 Bleed tick: Goblin takes 10 bleed damage (50 → 40)"

// 6. Check duration decremented
// Expected: { id: 'BLEED', duration: 2, ... }

// 7. Repeat until duration = 0
// Expected: Status removed from creature.statuses

// 8. Verify no errors in console
```

---

## 🧪 E2E Testing Template

```typescript
test.describe('Turn System - Status Effects - [Name]', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log(`[BROWSER] ${msg.text()}`));
    await page.goto('/');
    await page.waitForSelector('[data-testid="creature-card"]', { timeout: 10000 });
  });

  test('should apply [name] status and show duration badge', async ({ page }) => {
    const goblin = page.locator('[data-testid="creature-card"]').filter({ hasText: 'Goblin' }).first();
    const initialHealth = await getCreatureHealth(page, 'Goblin');

    const button = page.locator('button').filter({ hasText: /[icon].*[Name]/i }).first();
    await button.scrollIntoViewIfNeeded();
    await button.click();
    await goblin.click();
    await page.waitForTimeout(1000);

    const badge = goblin.locator('[data-testid="status-badge"]').filter({ hasText: /[icon]|[name]/i });
    await expect(badge).toBeVisible({ timeout: 5000 });
    
    const duration = await extractDuration(badge);
    expect(duration).toBe(3);
  });

  test('should decrement [name] duration on turn end', async ({ page }) => {
    const goblin = page.locator('[data-testid="creature-card"]').filter({ hasText: 'Goblin' }).first();

    const button = page.locator('button').filter({ hasText: /[icon].*[Name]/i }).first();
    await button.scrollIntoViewIfNeeded();
    await button.click();
    await goblin.click();
    await page.waitForTimeout(1000);

    const badge = goblin.locator('[data-testid="status-badge"]').filter({ hasText: /[icon]|[name]/i });
    const initialDuration = await extractDuration(badge);
    expect(initialDuration).toBe(3);

    const endTurnButton = page.locator('button').filter({ hasText: /End Turn/i }).first();
    await endTurnButton.click();
    await page.waitForTimeout(2500);

    const newDuration = await extractDuration(badge);
    expect(newDuration).toBe(2);
  });

  test('should remove [name] after duration expires', async ({ page }) => {
    const goblin = page.locator('[data-testid="creature-card"]').filter({ hasText: 'Goblin' }).first();

    const button = page.locator('button').filter({ hasText: /[icon].*[Name]/i }).first();
    await button.scrollIntoViewIfNeeded();
    await button.click();
    await goblin.click();
    await page.waitForTimeout(1000);

    const badge = goblin.locator('[data-testid="status-badge"]').filter({ hasText: /[icon]|[name]/i });
    await expect(badge).toBeVisible();

    const endTurnButton = page.locator('button').filter({ hasText: /End Turn/i }).first();

    // End turn until duration expires
    for (let i = 0; i < 3; i++) {
      await endTurnButton.click();
      await page.waitForTimeout(2500);
    }

    // Verify removed
    await expect(badge).not.toBeVisible();
  });
});
```

---

## 📝 Quick Reference Template

```typescript
// ========================================
// NEW EFFECT: [NAME]
// Pattern: [DoT | Hybrid | Passive | Probabilistic]
// Icon: [emoji]
// ========================================

// 1. DATA TYPE (statusEffects.ts ~line 40)
export type [Name]EffectData = {
  // ... fields
}

// 2. APPLICATOR (statusEffects.ts ~line 450)
const apply[Name]Effect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const { /* fields */ } = effect.data as [Name]EffectData
  const creature = getCreatureFromContext(context, effect.targetId)
  
  const hasStatus = creature.statuses.some(s => s.id === '[NAME]')
  
  if (hasStatus) {
    // Phase 2: Tick or passive
    // ...
  } else {
    // Phase 1: Initial application
    // ...
  }
}

// 3. REGISTER (statusEffects.ts ~line 785)
registerEffectApplicator('[NAME]', apply[Name]Effect)
console.log('✅ [NAME] applicator registered')

// 4. FACTORY (factories.ts ~line 220)
export const build[Name]Effect = (
  targetId: number,
  param: type = default
): Effect => ({
  id: generateEffectId('[name]'),
  type: '[NAME]',
  targetId,
  priority: 40,
  timestamp: Date.now(),
  data: { param }
})

// 5. IMPORT (useBattleEngine.ts ~line 14)
import {
  // ... existing
  build[Name]Effect,
} from '../factories'

// 6. PROCESS END OF TURN (useBattleEngine.ts ~line 216)
} else if (sid === '[NAME]') {
  // Ticking: effectsToApply.push(build[Name]Effect(...))
  // Passive: console.log(`[emoji] ... (no tick, passive)`)
}

// 7. BATTLECONTEXT STATUS (battleContext.ts ~line 410)
[NAME]: {
  name: "[Name]",
  type: "debuff" | "buff",
  timing: "beforeAttack" | "afterAttack" | "onTurnEnd",
  duration: 3,
  effectFuncName: "apply[Name]",
  chance: 1,
  icon: "[emoji]",
  id: "[NAME]",
  notes: "Description of effect.",
},

// 8. STATUS DEFINITION (statuses.ts ~line 45)
[NAME]: {
  name: "[Name]",
  type: "debuff" | "buff",
  timing: "beforeAttack" | "afterAttack",
  duration: 3,
  effectFuncName: "apply[Name]",
  chance: 1,
  icon: "[emoji]",
  id: `[NAME]`,
  notes: "Description of effect.",
},
```

---

## 🚀 Git Workflow

```bash
# 1. Checkout new branch from new-zust
git checkout new-zust
git pull origin new-zust
git checkout -b claude/[effect-name]-implementation-[session-id]

# 2. Make changes (5 files)

# 3. Commit with detailed message
git add src/consts/statuses.ts \
        src/utils/effectPipeline/effects/statusEffects.ts \
        src/utils/effectPipeline/factories.ts \
        src/utils/effectPipeline/hooks/useBattleEngine.ts \
        src/utils/effectPipeline/battleContext.ts

git commit -m "feat: implement [EFFECT_NAME] status effect

[Description of what it does]
[Pattern it follows]
[Key behaviors]
"

# 4. Push to remote
git push -u origin claude/[effect-name]-implementation-[session-id]
```

---

## 💡 Examples Implemented

- **BLEED** (DoT): 8 dmg/turn, 3 turns
- **FREEZE** (Hybrid): -5 defense + action prevention, 2 turns
- **SLOW** (Passive Stat): -10 speed, 3 turns
- **SILENCE** (Passive Prevention): Blocks abilities, 2 turns
- **CONFUSION** (Probabilistic DoT): 50% chance 6 dmg/turn, 3 turns

---

## 📊 Implementation Summary

**Total files modified:** 5  
**Typical lines added:** ~150-200 per status effect

**Time estimate:** 15-30 minutes per status effect (experienced)

---

**Last Updated:** November 17, 2025  
**Version:** 1.0  
**Status:** Production-ready guide for AI assistants
