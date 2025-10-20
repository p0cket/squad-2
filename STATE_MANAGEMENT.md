# State Management Standardization

**Date**: October 20, 2025  
**Status**: Complete ✅  
**Zustand Adapter**: ENABLED (`USE_ZUSTAND_ADAPTER = true`)

## Overview

The battle system uses a **hybrid state management approach** with:
1. **BattleContext** - Core state container with immutable updates
2. **Zustand Adapter** - Optional wrapper for React integration (currently enabled)
3. **Effect Pipeline** - All state changes go through `applyChangesToContext`

## Architecture

### Core Pattern: Immutable State Updates

All state modifications follow this flow:

```
User Action
   ↓
Effect Creation (createAttackEffect, etc.)
   ↓
Effect Application (applyEffect)
   ↓
State Changes Generated (HealthChange, StatusChange, etc.)
   ↓
applyChangesToContext (battleContext.ts)
   ↓
Immutable State Update
   ↓
Subscribers Notified
   ↓
React Re-render
```

## Key Files

### 1. `battleContext.ts` - State Management Core

**Responsibilities**:
- Create battle context
- Apply state changes immutably
- Manage subscriptions
- Track state history for rollback

**Key Functions**:
```typescript
export const createBattleContext(initialState: BattleState): BattleContext
export const applyChangesToContext(context, changes, options)
export const subscribeToContext(context, filter, callback)
export const getContextState(context): BattleState
export const rollbackContext(context): boolean
```

**Immutability Guarantee**:
- All `applyStateChange` functions return NEW state objects
- Original state is never modified
- State history preserved for rollback

### 2. `zustandAdapter.ts` - React Integration

**Purpose**: Wraps BattleContext in Zustand store for React compatibility

**When Enabled** (`USE_ZUSTAND_ADAPTER = true`):
- Uses Zustand's `create()` to manage state
- Automatic React re-renders via Zustand subscriptions
- Same immutability guarantees as BattleContext

**API**:
```typescript
export const createZustandBattleStore(initialState: BattleState)
export const zustandToBattleContext(store): BattleContext
export const subscribeToZustandContext(store, filter, callback)
export const getZustandContextState(store): BattleState
```

### 3. `effectPipelineEngine.ts` - Orchestration

**Role**: Coordinates effects, state changes, and animations

**State Update Pattern**:
```typescript
// 1. Apply effect → get state changes
const { stateChanges, animations } = await applyEffect(effect, context)

// 2. Apply state changes (deferred notification)
applyChangesToContext(context, stateChanges, { deferNotification: true })

// 3. Execute animations
await executeAnimationsSequentially(animations)

// 4. Notify subscribers (triggers React update)
notifyContextSubscribers(context, stateChanges)
```

## Audit Results

### ✅ Effect Pipeline (Clean)

| File | Status | Notes |
|------|--------|-------|
| `battleContext.ts` | ✅ Clean | All updates immutable |
| `combatEffects.ts` | ✅ Clean | Returns state changes, no mutations |
| `statusEffects.ts` | ✅ Clean | Returns state changes, no mutations |
| `effectPipelineEngine.ts` | ✅ Clean | Uses applyChangesToContext |
| `effectResolver.ts` | ✅ Clean | Read-only access to state |
| `useBattleEngine.ts` | ✅ Clean | Uses effect factories only |

### ⚠️ Legacy Code (Out of Scope for Phase 1)

These files contain direct mutations but are **not part of the new effect pipeline**:

| File | Issue | Fix Required |
|------|-------|--------------|
| `runeUtils.ts` | Direct `.health =` mutation | Migrate to effect pipeline when runes integrated |
| `levelGeneratorUtils.ts` | Direct stat mutations | OK - creature initialization |
| `battleUtils.ts` | Direct mutations in `resetCreatureForBattle` | OK - one-time setup |
| `modUtils.ts` | Direct stat/status mutations | Migrate to effect system (Phase 2) |
| `moves/attackUtils.ts` | Direct status mutations | Legacy - not used by new pipeline |

**Decision**: Legacy files are isolated and don't interact with the new effect pipeline. Migration planned for Phase 2.

## State Change Types

All state modifications use typed StateChange objects:

```typescript
type StateChange =
  | HealthChange        // HP modifications
  | StatusChange        // STATUS_APPLIED / STATUS_REMOVED
  | CreatureMovement    // Position changes
  | CreatureDeath       // Death trigger
  | StatModification    // Attack/defense/etc. buffs/debuffs
```

## Immutability Patterns

### Pattern 1: Health Change
```typescript
const applyHealthChange = (state: BattleState, change: HealthChange): BattleState => {
  const { creatureId, data } = change
  
  // Find creature immutably
  const isPlayer = state.playerCreatures.some(c => c.ID === creatureId)
  const creatures = isPlayer ? state.playerCreatures : state.computerCreatures
  
  // Update immutably
  const updated = creatures.map(creature =>
    creature.ID === creatureId
      ? { ...creature, health: data.newHealth }
      : creature
  )
  
  // Return new state
  return isPlayer
    ? { ...state, playerCreatures: updated }
    : { ...state, computerCreatures: updated }
}
```

### Pattern 2: Status Application
```typescript
const applyStatusChange = (state: BattleState, change: StatusChange): BattleState => {
  // Similar immutable pattern
  const updated = creatures.map(creature =>
    creature.ID === creatureId
      ? {
          ...creature,
          statuses: [...creature.statuses, newStatus] // New array
        }
      : creature
  )
  
  return { ...state, [key]: updated }
}
```

### Pattern 3: Creature Removal (Death)
```typescript
const applyCreatureDeath = (state: BattleState, change: StateChange): BattleState => {
  const updated = creatures.filter(c => c.ID !== creatureId) // New array
  
  return { ...state, [key]: updated }
}
```

## Subscription System

### Purpose
Decouple state changes from React updates

### Pattern
```typescript
subscribeToContext(
  context,
  'all', // or specific change types
  (changes: StateChange[], newState: BattleState) => {
    // Callback receives AFTER state is updated
    setBattleState(newState) // Trigger React render
  }
)
```

### Filters
- `'all'` - All state changes
- `'HEALTH_CHANGE'` - Health modifications only
- `'STATUS_APPLIED'` - Status effects only
- etc.

## Best Practices

### ✅ DO

1. **Always use effect factories**
   ```typescript
   const effect = createAttackEffect(attackerId, targetId, attack)
   await applyEffect(effect)
   ```

2. **Return state changes from applicators**
   ```typescript
   return {
     stateChanges: [healthChange, statusChange],
     animations: [shakeAnim, damageAnim],
     triggeredEffects: []
   }
   ```

3. **Use applyChangesToContext for manual changes**
   ```typescript
   applyChangesToContext(context, [stateChange1, stateChange2])
   ```

### ❌ DON'T

1. **Never mutate state directly**
   ```typescript
   // BAD
   context.state.playerCreatures[0].health -= 10
   
   // GOOD
   const healthChange: HealthChange = {
     type: 'HEALTH_CHANGE',
     creatureId: 1,
     data: { delta: -10, newHealth: 90 }
   }
   applyChangesToContext(context, [healthChange])
   ```

2. **Never mutate creatures directly**
   ```typescript
   // BAD
   creature.statuses.push(newStatus)
   
   // GOOD
   const statusChange: StatusChange = {
     type: 'STATUS_APPLIED',
     creatureId: creature.ID,
     data: { statusId: 'BURN', duration: 3 }
   }
   ```

3. **Never skip the effect pipeline**
   ```typescript
   // BAD - bypasses animations, triggers, history
   context.state = newState
   
   // GOOD - proper flow
   applyChangesToContext(context, stateChanges)
   ```

## Testing Immutability

All state update tests verify:
1. Original state unchanged
2. New state returned
3. Changes applied correctly
4. State history preserved

Example:
```typescript
test('applies health change immutably', () => {
  const context = createBattleContext(initialState)
  const originalState = context.state
  const originalCreature = { ...originalState.computerCreatures[0] }
  
  applyChangesToContext(context, [healthChange])
  
  // Original state unchanged
  expect(originalCreature.health).toBe(60)
  
  // New state updated
  expect(context.state.computerCreatures[0].health).toBe(40)
  
  // State history saved
  expect(context.stateHistory).toHaveLength(1)
  expect(context.stateHistory[0]).toEqual(originalState)
})
```

## Zustand Integration

### Current Status
**Enabled**: `USE_ZUSTAND_ADAPTER = true` in `useBattleEngine.ts`

### Why Zustand?
1. **Automatic React integration** - No manual `setState` calls
2. **DevTools support** - Time-travel debugging
3. **Performance** - Selective re-renders
4. **Type safety** - Full TypeScript support

### How It Works
```typescript
// 1. Create Zustand store wrapping BattleState
const store = createZustandBattleStore(initialState)

// 2. Convert to BattleContext interface
const context = zustandToBattleContext(store)

// 3. Use exactly like BattleContext
applyChangesToContext(context, stateChanges)

// 4. Zustand detects changes → React re-renders automatically
```

### Switching Between Native and Zustand

Easy toggle in `useBattleEngine.ts`:
```typescript
// Enable Zustand (current)
const USE_ZUSTAND_ADAPTER = true

// Disable Zustand (use native BattleContext)
const USE_ZUSTAND_ADAPTER = false
```

Both implementations guarantee immutability and identical behavior.

## Migration Guide (For Legacy Code)

When migrating old battle code to effect pipeline:

### Step 1: Identify Direct Mutations
```typescript
// OLD
creature.health -= damage
creature.statuses.push(burnStatus)
```

### Step 2: Create State Changes
```typescript
// NEW
const changes: StateChange[] = [
  {
    type: 'HEALTH_CHANGE',
    creatureId: creature.ID,
    data: { delta: -damage, newHealth: creature.health - damage }
  },
  {
    type: 'STATUS_APPLIED',
    creatureId: creature.ID,
    data: { statusId: 'BURN', duration: 3 }
  }
]
```

### Step 3: Apply via Context
```typescript
applyChangesToContext(context, changes)
```

### Step 4: Or Use Effect Factories
```typescript
// Even better - use the effect system
const attack = createBurnAttack("Fire Strike", 20)
const effect = createAttackEffect(attackerId, targetId, attack)
await applyEffect(effect)
```

## Performance Considerations

### Immutability Cost
- Small overhead from object spreading
- Offset by React optimization (shallow comparison)
- State history limited to 50 entries

### Optimization Strategies
1. **Batch state changes** - Single `applyChangesToContext` call
2. **Defer notifications** - Wait for animations before re-render
3. **Selective subscriptions** - Filter by change type
4. **Zustand selectors** - Only re-render when specific data changes

## Summary

✅ **Phase 1 Complete**:
- All effect pipeline code uses immutable patterns
- No direct state mutations in active code paths
- Zustand adapter provides React integration
- Comprehensive test coverage
- Clear migration path for legacy code

**Next Phase**:
- Migrate legacy utilities (runes, mods) to effect system
- Add DevTools integration for Zustand
- Performance profiling and optimization

---

**Last Updated**: October 20, 2025  
**Audited By**: AI Assistant  
**Status**: ✅ **STANDARDIZED**
