# Universal Target System Integration Guide

## Overview

The new `targetResolver.ts` module provides a **single reusable targeting system** for ALL game effects:
- ✅ Attacks (slash, fireball, AOE)
- ✅ Status effects (burn, poison, heal)
- ✅ Passive abilities (Stone Thorns, team healer)
- ✅ Items/Potions (heal potion, buff scroll)

**No more duplicated targeting logic!**

---

## Migration Plan

### Phase 1: Update Type Definitions ✅

Replace hardcoded `targetType` with flexible `targetSelector`:

```typescript
// OLD - Limited enum
type PassiveAbility = {
  effect: {
    targetType: 'attacker' | 'self' | 'all_enemies'  // ❌ Only 3 options
  }
}

// NEW - Universal selector
type PassiveAbility = {
  effect: {
    targetSelector: TargetSelector  // ✅ 30+ options + conditional
  }
}
```

**Files to update:**
- `/src/consts/types/types.ts` - PassiveAbility type
- `/src/consts/attacks.ts` - Add multi-target support
- `/src/utils/effectPipeline/types.ts` - Effect type

---

### Phase 2: Update Passive Ability Triggers

Replace manual switch statement with universal resolver:

```typescript
// OLD - Manual targeting in triggerSetup.ts
switch (passiveAbility.effect.targetType) {
  case 'attacker':
    targetId = attackerId
    break
  case 'self':
    targetId = creatureWithPassive.ID
    break
  // ... more cases
}

// NEW - Use universal resolver
const targetIds = resolveTargets({
  selector: passiveAbility.effect.targetSelector,
  context,
  sourceCreatureId: creatureWithPassive.ID,
  triggerChange: change
})
```

**Files to update:**
- `/src/utils/effectPipeline/effects/triggerSetup.ts`

---

### Phase 3: Update Attack System

Add multi-target support to attacks:

```typescript
// attacks.ts - Add targetSelector field
{
  slash: {
    name: "Slash",
    damage: 10,
    targetSelector: 'manual'  // ✅ Single target (current behavior)
  },
  meteor: {
    name: "Meteor",
    damage: 25,
    targetSelector: 'all_enemies'  // ✅ NEW: AOE attack!
  },
  smite: {
    name: "Divine Smite",
    damage: 30,
    targetSelector: 'highest_hp_enemy'  // ✅ NEW: Auto-target tankiest enemy
  }
}
```

**Files to update:**
- `/src/consts/attacks.ts` - Add targetSelector to each attack
- `/src/utils/effectPipeline/effects/combatEffects.ts` - Use resolver for AOE

---

### Phase 4: Update Status Effect System

Simplify status effect targeting:

```typescript
// OLD - Manual targeting in each applicator
const applyBurnEffect = (effect, context) => {
  const creature = getCreatureFromContext(context, effect.targetId)
  // ... apply to single target
}

// NEW - Support multi-target
const applyBurnEffect = (effect, context) => {
  const targetIds = effect.targetIds || [effect.targetId]  // Backward compatible
  
  targetIds.forEach(targetId => {
    const creature = getCreatureFromContext(context, targetId)
    // ... apply to each target
  })
}
```

**Files to update:**
- `/src/utils/effectPipeline/effects/statusEffects.ts` - Support targetIds[]
- Effect creation - Use resolver to generate targetIds

---

## Example Migrations

### Example 1: Stone Thorns (Simple)

**Before:**
```typescript
// creatures.ts
{
  name: 'Stone Thorns',
  trigger: 'on_damaged',
  effect: {
    targetType: 'attacker',  // ❌ Hardcoded
    damage: 15
  }
}

// triggerSetup.ts
switch (passiveAbility.effect.targetType) {
  case 'attacker':
    targetId = attackerId
    break
}
```

**After:**
```typescript
// creatures.ts
{
  name: 'Stone Thorns',
  trigger: 'on_damaged',
  effect: {
    targetSelector: 'trigger_source',  // ✅ Universal
    damage: 15
  }
}

// triggerSetup.ts (simplified)
const targetIds = resolveTargets({
  selector: passiveAbility.effect.targetSelector,
  context,
  sourceCreatureId: creatureWithPassive.ID,
  triggerChange: change
})
```

---

### Example 2: Team Healer (NEW CAPABILITY)

**Impossible Before - Now Simple:**
```typescript
// creatures.ts
{
  name: 'Protective Aura',
  description: 'When any ally takes damage, heal them for 5',
  trigger: {
    event: 'HEALTH_CHANGE',
    scope: 'any_ally',
    condition: (change) => change.data.delta < 0
  },
  effect: {
    type: 'heal',
    targetSelector: 'trigger_target',  // ✅ Heal the damaged ally
    value: 5
  }
}

// triggerSetup.ts (same code as Stone Thorns!)
const targetIds = resolveTargets({
  selector: passiveAbility.effect.targetSelector,  // Works for any selector
  context,
  sourceCreatureId: creatureWithPassive.ID,
  triggerChange: change
})
```

---

### Example 3: AOE Attack (NEW CAPABILITY)

**Before - Impossible:**
```typescript
// Could only hit 1 target
```

**After - Simple:**
```typescript
// attacks.ts
{
  meteor: {
    name: "Meteor Storm",
    damage: 25,
    targetSelector: 'all_enemies',  // ✅ Hit all enemies
    icon: 'meteor_icon'
  }
}

// combatEffects.ts
const applyAttackEffect = (effect, context) => {
  const { attack } = effect.data
  
  // Resolve targets based on attack's selector
  const targetIds = resolveTargets({
    selector: attack.targetSelector || 'manual',
    context,
    sourceCreatureId: attackerId,
    manualTargetId: effect.targetId  // Fallback for single-target
  })
  
  // Apply damage to each target
  targetIds.forEach(targetId => {
    // ... damage calculation
  })
}
```

---

### Example 4: Smart Healing (NEW CAPABILITY)

**Heal the most injured ally automatically:**

```typescript
// attacks.ts
{
  divine_light: {
    name: "Divine Light",
    attackType: "Healing",
    healing: 30,
    targetSelector: 'lowest_hp_percent_ally',  // ✅ Auto-targets most injured
    cooldown: 2
  }
}
```

---

## Benefits

### 1. Zero Code Duplication
```typescript
// ❌ BEFORE - 4 different targeting implementations
// - triggerSetup.ts: switch (targetType) { ... }
// - combatEffects.ts: manual target selection
// - statusEffects.ts: hardcoded single target
// - attacks.ts: only supports manual targeting

// ✅ AFTER - 1 universal system
// - targetResolver.ts: resolveTargets() - used everywhere
```

### 2. Consistent Behavior
```typescript
// 'random_enemy' works the same everywhere:
// - Passive abilities
// - Attacks
// - Status effects
// - Items/potions
```

### 3. Easier to Extend
```typescript
// Add 1 new selector → works in ALL systems
// Example: Add 'closest_enemy'

// targetResolver.ts
case 'closest_enemy':
  return [selectClosestEnemy(sourceCreature, context)]

// Now available for:
// - Passive abilities ✅
// - Attacks ✅
// - Status effects ✅
// - Items ✅
```

### 4. Better Testing
```typescript
// Test targeting logic once, works everywhere
describe('targetResolver', () => {
  it('resolves random_enemy correctly', () => {
    const targets = resolveTargets({
      selector: 'random_enemy',
      context: mockContext,
      sourceCreatureId: 1
    })
    expect(targets).toHaveLength(1)
    expect(targets[0]).toBeEnemyOf(mockContext.creatures[1])
  })
})
```

---

## Implementation Steps

### Step 1: Add targetSelector to types (Backward Compatible)
```typescript
// types.ts
type PassiveAbilityEffect = {
  // Keep old field for migration
  targetType?: 'attacker' | 'self' | 'all_enemies'
  
  // Add new field
  targetSelector?: TargetSelector
  
  // Use targetSelector if present, else fall back to targetType
}
```

### Step 2: Update triggerSetup to use resolver
```typescript
// Import resolver
import { resolveTargets } from '../targetResolver'

// Replace switch statement
const targetIds = resolveTargets({
  selector: passiveAbility.effect.targetSelector || mapOldTargetType(passiveAbility.effect.targetType),
  context,
  sourceCreatureId: creatureWithPassive.ID,
  triggerChange: change
})
```

### Step 3: Migrate creature definitions
```typescript
// Update creatures.ts one by one
// Old: targetType: 'attacker'
// New: targetSelector: 'trigger_source'
```

### Step 4: Add multi-target to attacks
```typescript
// Add targetSelector to Attack type
// Default to 'manual' for existing attacks
// Add new AOE attacks
```

### Step 5: Update status effects for multi-target
```typescript
// Support targetIds[] in effect applicators
// Generate targetIds using resolver
```

---

## Rollout Strategy

✅ **Phase 1**: Create targetResolver.ts (DONE)  
⏳ **Phase 2**: Update type definitions (add targetSelector field)  
⏳ **Phase 3**: Update triggerSetup.ts (use resolver)  
⏳ **Phase 4**: Migrate existing passives (Stone Thorns, etc.)  
⏳ **Phase 5**: Add AOE attack support  
⏳ **Phase 6**: Add new complex passives (team healer, etc.)  
⏳ **Phase 7**: Remove old targetType field (cleanup)

---

**Status**: targetResolver.ts created, ready for integration  
**Next**: Update `/src/consts/types/types.ts` to add targetSelector field
