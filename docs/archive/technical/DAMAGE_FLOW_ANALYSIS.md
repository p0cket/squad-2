# Damage Flow Analysis: Why Creatures Don't Lose Health

## Problem Summary

**Issue**: Attacks successfully calculate damage and start animations, but creatures don't actually lose health in the UI. The damage numbers appear, animations play, but creature health bars remain unchanged.

**Root Cause**: The battle system has a **broken state update chain** where damage calculations work correctly but state changes fail to propagate to the UI due to inconsistent dispatch patterns and missing integration points.

---

## Current Attack Flow Analysis

### 1. Attack Initiation (`performAttack.ts`)

```typescript
// ✅ WORKS: Animation and logging setup
const { attackerControls, targetControls, targetShowDamage } = getControls(...)
await performAttackAnimation(attackerControls, targetControls, isPlayerAttack)

// ✅ WORKS: Damage calculation
const { statuses, damage } = calculateDamageAndStatuses(attackPayload)

// ✅ WORKS: Damage animation shows
showDamageOnTarget(targetShowDamage, damage, target.ID)

// ✅ WORKS: Pure function creates updated creature
const updatedCreatureObj = updateTargetState(target, damage, statuses)
```

### 2. State Update Attempt (`performAttack.ts` line 125-160)

```typescript
// ❌ BROKEN: No actual dispatch to update global state
const newPush2: PushLogType = {
  message: `updatedCreatureObj ${updatedCreatureObj?.name} updated with "updateTargetState`,
  action: {
    type: "HANDLE_CREATURE_UPDATE", // ⚠️ This action type doesn't exist in reducer
    payload: { updatedCreatureObj },
  },
}
logStep(newPush2, dispatch) // Only logs, doesn't dispatch

// ❌ MISSING: No dispatch({ type: "UPDATE_CREATURE", creature: updatedCreatureObj })
```

### 3. What Should Happen vs What Actually Happens

**Expected Flow:**
1. Calculate damage ✅
2. Create updated creature object ✅  
3. **Dispatch UPDATE_CREATURE action** ❌ **MISSING**
4. Reducer updates global state ❌ **NEVER CALLED**
5. UI re-renders with new health ❌ **NEVER HAPPENS**

**Actual Flow:**
1. Calculate damage ✅
2. Create updated creature object ✅
3. Log action intent only ❌ **LOGS BUT DOESN'T DISPATCH**
4. State remains unchanged ❌ **BROKEN**
5. UI shows old health values ❌ **BROKEN**

---

## Critical Missing Pieces

### 1. Missing Dispatch Call in `performAttack.ts`

**Location**: `src/utils/moves/performAttack.ts` line 140

**Current Code:**
```typescript
// Update target's health and statuses
const updatedCreatureObj = updateTargetState(target, damage, statuses)
// ❌ This only logs, doesn't update state:
logStep(newPush2, dispatch)
```

**Required Fix:**
```typescript
// Update target's health and statuses
const updatedCreatureObj = updateTargetState(target, damage, statuses)

// ✅ CRITICAL FIX: Actually dispatch the state update
dispatch({
  type: "UPDATE_CREATURE",
  creature: updatedCreatureObj,
})

logStep(newPush2, dispatch)
```

### 2. Inconsistent Status Effect Updates

**Issue**: Status effects in `statuses.ts` sometimes dispatch updates, sometimes don't.

**Example in `applyPoison`:**
```typescript
// ✅ Status effects DO dispatch updates
if (dispatch) {
  dispatch({
    type: "UPDATE_CREATURE", 
    creature: updatedCreature,
  })
}
```

**But main attack flow doesn't follow same pattern** ❌

### 3. Broken Animation Queue Integration

**Issue**: `performAttack.ts` shows intention to queue animations but never integrates with state updates.

```typescript
// ❌ INCOMPLETE: Animation queue exists but isn't used
const addAnimToStack = (attackerControls, targetControls, isPlayerAttack) => {
  const animPayload = createAnimPayload(attackerControls, targetControls, isPlayerAttack)
  // pushAnimToStack(animPayload) // This function doesn't exist
}
```

---

## State Update Verification

### ✅ Reducer Works Correctly

The `UPDATE_CREATURE` reducer in `GameContext.tsx` works properly:

```typescript
case "UPDATE_CREATURE":
  const whichPartyOwnsCreature = (creature: Creature) => {
    if (creature.owner === "player") return "playerCreatures"
    if (creature.owner === "computer") return "computerCreatures"
  }
  const partySide = whichPartyOwnsCreature(action.creature)
  const updatedCreaturesList = updateCreatureInList(state[partySide], action.creature)
  return {
    ...state,
    [partySide]: updatedCreaturesList,
  }
```

### ✅ Helper Functions Work Correctly  

**`updateTargetState.ts`** - Pure function that correctly calculates new health:
```typescript
export const updateTargetState = (target: Creature, damage: number, statuses: StatusEffect[]): Creature => {
  return {
    ...target,
    health: Math.max(0, target.health - damage), // ✅ Correctly reduces health
    statuses: [...(target.statuses || []), ...statuses],
  }
}
```

**`updateCreatureInList.ts`** - Correctly updates creature arrays:
```typescript
export const updateCreatureInList = (creatures: Creature[], updatedCreature: Creature) => {
  return creatures.map((creature) => {
    if (creature.ID === updatedCreature.ID) {
      return { ...creature, ...updatedCreature } // ✅ Correctly merges updates
    }
    return creature
  })
}
```

---

## Immediate Fix Required

### Primary Fix: Add Missing Dispatch

**File**: `src/utils/moves/performAttack.ts`
**Line**: ~140 (after `updateTargetState` call)

**Add this code:**
```typescript
// Update target's health and statuses
const updatedCreatureObj = updateTargetState(target, damage, statuses)

// 🔥 CRITICAL FIX: Dispatch the state update
dispatch({
  type: "UPDATE_CREATURE",
  creature: updatedCreatureObj,
})

console.log(`Dispatched UPDATE_CREATURE for ${updatedCreatureObj.name}`, updatedCreatureObj)
```

### Secondary Verification Points

1. **Ensure creature has `owner` property** - Required for `whichPartyOwnsCreature` function
2. **Verify creature `ID` is consistent** - Used for matching in `updateCreatureInList`
3. **Check that dispatch function is available** - Passed through `attackPayload`

---

## Why This Breaks The Game Experience

1. **Visual Disconnect**: Players see damage numbers but no health change
2. **Battle State Confusion**: Creatures appear invincible despite taking damage  
3. **Status Effect Inconsistency**: Some effects update state, main attacks don't
4. **Animation/Logic Mismatch**: Beautiful animations play but no mechanical effect

---

## Testing The Fix

### Before Fix:
1. Perform any attack
2. Damage numbers appear ✅
3. Animations play ✅  
4. Creature health remains unchanged ❌

### After Fix:
1. Perform any attack
2. Damage numbers appear ✅
3. Animations play ✅
4. Creature health reduces correctly ✅
5. Health bar animates downward ✅
6. Dead creatures show defeated state ✅

---

## Related Technical Debt

1. **Animation Queue System**: Needs completion for proper sequencing
2. **State Update Consistency**: All functions should follow same dispatch pattern  
3. **Error Handling**: Missing try/catch blocks around state updates
4. **Type Safety**: Some dispatch calls use `@ts-ignore` comments

---

## Next Steps After Primary Fix

1. **Implement the critical dispatch fix** (5 minutes)
2. **Test attack flow thoroughly** (15 minutes)
3. **Verify status effects still work** (10 minutes)
4. **Begin Build 1.1 from Battle Engine Checklist** (animation queue infrastructure)
5. **Standardize all state update patterns** (Build 1.2-1.3)

This single missing dispatch call is the root cause of the major battle system failure. Once fixed, the foundation will be solid enough to build the remaining features systematically.
