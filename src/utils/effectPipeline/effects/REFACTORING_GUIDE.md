# Effect System Refactoring Guide

## 🎯 Goal

Decouple the `effect.apply()` method from Effect definitions to make the codebase:
- **More testable** - Test logic without creating full Effect objects
- **More maintainable** - Separate concerns (data structure vs. behavior)
- **More reusable** - Share calculation logic across different effects

---

## 📐 Architecture Overview

### Before (Monolithic)
```typescript
export const createAttackEffect = (attackerId, targetId, attack) => ({
  id: 'attack',
  targetId,
  priority: 50,
  animations: [],
  apply: async (context) => {
    // 100+ lines of inline logic
    const attacker = getCreatureFromContext(context, attackerId)
    const target = getCreatureFromContext(context, targetId)
    const damage = calculateDamage(...)
    const healthChange = { type: 'HEALTH_CHANGE', ... }
    return [healthChange]
  }
})
```

**Problems:**
- Logic tightly coupled to Effect object
- Hard to test calculations without creating Effects
- Can't reuse calculation logic
- Difficult to mock for unit tests

### After (Decoupled)
```typescript
// effectApplicators.ts - Pure calculation functions
export const applyAttackEffect = (context, attackerId, targetId, attack) => {
  const attacker = getCreatureFromContext(context, attackerId)
  const target = getCreatureFromContext(context, targetId)
  const damage = calculateDamage(...)

  return {
    stateChanges: [{ type: 'HEALTH_CHANGE', ... }],
    actualDamage: damage,
    attacker,
    target
  }
}

// combatEffects.refactored.ts - Effect definitions
export const createAttackEffect = (attackerId, targetId, attack) => ({
  id: 'attack',
  targetId,
  priority: 50,
  animations: [],
  apply: async (context) => {
    const result = applyAttackEffect(context, attackerId, targetId, attack)
    return result.stateChanges
  }
})
```

**Benefits:**
- ✅ Applicators are pure functions (easy to test)
- ✅ Effect definitions are clean and focused
- ✅ Can test calculations independently
- ✅ Can reuse applicators across different effects
- ✅ Can mock applicators for integration tests

---

## 🗂️ New File Structure

```
src/utils/effectPipeline/effects/
├── effectApplicators.ts              ← NEW: Pure calculation functions
├── combatEffects.refactored.ts       ← NEW: Refactored combat effects
├── statusEffects.refactored.ts       ← NEW: Refactored status effects
├── combatEffects.ts                  ← OLD: Keep for backward compatibility
├── statusEffects.ts                  ← OLD: Keep for backward compatibility
└── __tests__/
    └── effectApplicators.test.ts     ← NEW: Unit tests for applicators
```

---

## 📦 What's in Each File

### `effectApplicators.ts`
**Purpose:** Pure functions that calculate state changes

**Exports:**
- Helper functions: `calculateDamageAfterDefense`, `calculateActualHealing`, `clampHealth`
- Applicators: `applyAttackEffect`, `applyHealingEffect`, `applyBurnDamage`, etc.

**Key characteristics:**
- Pure functions (no side effects)
- Take `BattleContext` and parameters as input
- Return `{ stateChanges, ...metadata }` as output
- Easy to unit test
- Reusable across different effects

**Example:**
```typescript
export const applyAttackEffect = (
  context: BattleContext,
  attackerId: number,
  targetId: number,
  attack: Attack
) => {
  const attacker = getCreatureFromContext(context, attackerId)
  const target = getCreatureFromContext(context, targetId)

  const actualDamage = calculateDamageAfterDefense(
    attack.damage,
    attacker.attack,
    target.defense
  )

  return {
    stateChanges: [{ type: 'HEALTH_CHANGE', ... }],
    actualDamage,
    attacker,
    target,
    damageBreakdown: [...]
  }
}
```

### `combatEffects.refactored.ts` / `statusEffects.refactored.ts`
**Purpose:** Effect definitions that use applicators

**Key characteristics:**
- Lightweight Effect objects
- Call applicators in `apply()` method
- Focus on structure (id, priority, animations)
- Can use applicator results to generate animations dynamically

**Example:**
```typescript
export const createAttackEffect = (attackerId, targetId, attack): Effect => ({
  id: 'attack',
  targetId,
  priority: 50,
  animations: [],
  apply: async (context) => {
    const result = applyAttackEffect(context, attackerId, targetId, attack)

    // Can use result to generate animations
    effect.animations = generateAnimationsFromResult(result)

    return result.stateChanges
  }
})
```

---

## 🧪 Testing Strategy

### Before: Hard to Test
```typescript
// Had to create full Effect object just to test damage calculation
test('attack deals correct damage', async () => {
  const effect = createAttackEffect(1, 2, attack) // Creates Effect
  const context = createMockContext()
  const changes = await effect.apply(context)  // Executes full effect
  expect(changes[0].data.delta).toBe(-25)
})
```

### After: Easy to Test
```typescript
// Can test applicator directly
test('applyAttackEffect calculates damage correctly', () => {
  const result = applyAttackEffect(context, 1, 2, attack)
  expect(result.actualDamage).toBe(25)
  expect(result.stateChanges[0].data.delta).toBe(-25)
})

// Can test helper functions in isolation
test('calculateDamageAfterDefense', () => {
  expect(calculateDamageAfterDefense(20, 5, 10)).toBe(15)
})

// Can mock applicators for integration tests
jest.mock('./effectApplicators', () => ({
  applyAttackEffect: jest.fn(() => ({ stateChanges: [...] }))
}))
```

---

## 🔄 Migration Steps

### Step 1: Create Applicators (✅ DONE)
- [x] Create `effectApplicators.ts`
- [x] Extract helper functions
- [x] Create applicator for each effect type
- [x] Write unit tests

### Step 2: Create Refactored Effects (✅ DONE)
- [x] Create `combatEffects.refactored.ts`
- [x] Create `statusEffects.refactored.ts`
- [x] Update effect definitions to use applicators

### Step 3: Update Imports (TODO)
Replace old imports with refactored versions:

```typescript
// Before
import { createAttackEffect } from './effects/combatEffects'

// After
import { createAttackEffect } from './effects/combatEffects.refactored'
```

**Files to update:**
- `src/utils/effectPipeline/hooks/useBattleEngine.ts`
- `src/utils/effectPipeline/integration/BattleEngineExample.tsx`
- Any test files

### Step 4: Verify Tests Pass (TODO)
```bash
npm test -- effectPipelineEngine.test.ts
npm test -- effectApplicators.test.ts
```

### Step 5: Remove Old Files (Optional - After Verification)
Once everything works:
- Delete `combatEffects.ts`
- Delete `statusEffects.ts`
- Rename `.refactored.ts` files to remove suffix

---

## 💡 Usage Examples

### Example 1: Testing Damage Calculation
```typescript
import { applyAttackEffect, calculateDamageAfterDefense } from './effectApplicators'

test('high defense reduces damage', () => {
  const damage = calculateDamageAfterDefense(20, 5, 15)
  expect(damage).toBe(10) // (20 + 5) - 15 = 10
})

test('cannot deal less than 1 damage', () => {
  const damage = calculateDamageAfterDefense(10, 0, 20)
  expect(damage).toBe(1) // Minimum damage is 1
})
```

### Example 2: Testing Healing Cap
```typescript
import { applyHealingEffect } from './effectApplicators'

test('healing cannot exceed max health', () => {
  const creature = { health: 90, maxHealth: 100 }
  const context = createContext([creature])

  const result = applyHealingEffect(context, 1, 1, 50)

  expect(result.actualHealing).toBe(10) // Can only heal to 100
  expect(result.stateChanges[0].data.newHealth).toBe(100)
})
```

### Example 3: Mocking Applicators
```typescript
import { createAttackEffect } from './combatEffects.refactored'
import * as applicators from './effectApplicators'

jest.spyOn(applicators, 'applyAttackEffect').mockReturnValue({
  stateChanges: [{ type: 'HEALTH_CHANGE', creatureId: 2, data: { delta: -999 } }],
  actualDamage: 999,
  attacker: mockAttacker,
  target: mockTarget,
  damageBreakdown: []
})

const effect = createAttackEffect(1, 2, testAttack)
const changes = await effect.apply(context)

expect(changes[0].data.delta).toBe(-999) // Uses mocked value
```

### Example 4: Reusing Applicators
```typescript
// Can use same applicator in different effects
export const createCriticalHitEffect = (attackerId, targetId, attack): Effect => ({
  id: 'critical-hit',
  targetId,
  priority: 60,
  animations: [{ type: 'critical-flash', duration: 500 }],
  apply: async (context) => {
    // Reuse the same applicator, just with doubled damage
    const criticalAttack = { ...attack, damage: attack.damage * 2 }
    const result = applyAttackEffect(context, attackerId, targetId, criticalAttack)

    return result.stateChanges
  }
})
```

---

## 🎨 Design Patterns

### Pattern 1: Applicator Returns Rich Data
```typescript
// Applicator returns more than just StateChanges
const result = applyAttackEffect(context, attackerId, targetId, attack)

// Can use result for:
// - Animations: result.damageBreakdown
// - Logging: result.actualDamage
// - Cascading: result.target.health <= 0 ? triggerDeath() : null
// - State: result.stateChanges
```

### Pattern 2: Helper Functions for Reusability
```typescript
// Small, focused helpers
export const clampHealth = (health: number, maxHealth: number) => {
  return Math.max(0, Math.min(maxHealth, health))
}

// Used everywhere
const newHealth = clampHealth(creature.health + healing, creature.maxHealth)
```

### Pattern 3: Dynamic Animations from Results
```typescript
apply: async (context) => {
  const result = applyAttackEffect(context, attackerId, targetId, attack)

  // Generate animations based on calculation results
  effect.animations = [
    { type: 'attack-windup', targetId: attackerId },
    ...result.damageBreakdown.map((breakdown, index) => ({
      type: 'damage-number',
      targetId,
      data: { value: breakdown.value, label: breakdown.label },
      delay: index * 200
    }))
  ]

  return result.stateChanges
}
```

---

## 📊 Comparison: Before vs After

| Aspect | Before (Monolithic) | After (Decoupled) |
|--------|---------------------|-------------------|
| **Testability** | Hard - requires full Effect | Easy - test applicators directly |
| **Reusability** | Low - logic in closures | High - pure functions |
| **Maintainability** | Difficult - scattered logic | Easy - centralized in applicators |
| **Mocking** | Complex - mock entire Effect | Simple - mock applicator functions |
| **Debugging** | Hard - inline closures | Easy - named functions with clear inputs/outputs |
| **Documentation** | Implicit in code | Explicit function signatures |
| **Performance** | Same | Same |

---

## 🚀 Next Steps

1. **Run tests to verify refactored code:**
   ```bash
   npm test -- effectApplicators.test.ts
   ```

2. **Update imports in `useBattleEngine.ts`:**
   ```typescript
   import { createAttackEffect } from './effects/combatEffects.refactored'
   import { createBurnEffect } from './effects/statusEffects.refactored'
   ```

3. **Run integration tests:**
   ```bash
   npm test -- effectPipelineEngine.test.ts
   ```

4. **Verify in demo app:**
   ```bash
   npm start
   # Test attack, burn, poison, healing effects
   ```

5. **Clean up old files** (after verification):
   ```bash
   rm src/utils/effectPipeline/effects/combatEffects.ts
   rm src/utils/effectPipeline/effects/statusEffects.ts
   mv combatEffects.refactored.ts combatEffects.ts
   mv statusEffects.refactored.ts statusEffects.ts
   ```

---

## 🎓 Key Takeaways

1. **Separation of Concerns:** Effect structure (id, priority, animations) is separate from logic (applicators)

2. **Testability:** Pure functions are infinitely easier to test than closures

3. **Reusability:** Share calculation logic across different effects

4. **Maintainability:** Centralize business logic in one place

5. **Flexibility:** Can easily swap implementations or mock for tests

---

**Questions?** Check `__tests__/effectApplicators.test.ts` for comprehensive examples!
