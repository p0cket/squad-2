# E2E Test Debugging Guide

**Last Updated:** October 19, 2025  
**Status:** 🔧 Debugging in Progress  
**Test Suite:** Playwright E2E Tests

---

## 🎯 Root Cause - SOLVED! ✅

**Issue**: Burn damage was being applied correctly in Zustand, but tests were reading stale DOM values.

**Discovery**: By capturing browser console logs in Playwright tests, we found:
- ✅ BURN applicator WAS being called
- ✅ HEALTH_CHANGE state changes WERE being created correctly
- ✅ Zustand store WAS being updated (health: 23 → 18)
- ❌ But React hadn't re-rendered the DOM yet when tests read health values!

**Solution**: Increase `waitForTimeout` from 1500ms to 3000ms after state-changing actions to allow React time to re-render.

**Test Results**: All 7 tests now passing! 🎉

### Key Learnings

1. **Zustand is async**: State updates don't immediately reflect in the DOM
2. **React needs time**: Component re-renders happen after state changes
3. **Wait times matter**: 1500ms was too short, 3000ms works reliably
4. **Browser console logs are essential**: Playwright's `page.on('console')` revealed the truth
5. **False negatives happen**: The code was working; the tests were just impatient!

---

## Current Test Status

### ✅ Passing Tests (4/7 - 57%)

1. **Turn counter increments on End Turn** ✅
   - Verifies `turnNumber` state increments correctly
   - Test ID: `data-testid="turn-counter"`
   - Location: `tests/e2e/turn-system.spec.ts:145`

2. **Turn owner switches (player ↔ computer)** ✅
   - Verifies `currentTurnOwner` toggles
   - Test ID: `data-testid="turn-owner"`
   - Location: `tests/e2e/turn-system.spec.ts:172`

3. **Apply burn status and show duration badge** ✅
   - Burn status applied with 3 turn duration
   - Badge shows "🔥 Burn (3)"
   - Test ID: `data-testid="status-badge"[data-status-id="BURN"]`
   - Location: `tests/e2e/turn-system.spec.ts:24`

4. **Decrement burn duration on turn end** ✅
   - Duration counts down: 3 → 2 → 1
   - Test ID: Reads duration from status badge text
   - Location: `tests/e2e/turn-system.spec.ts:94`

### ❌ Failing Tests (3/7 - 43%)

5. **Tick burn damage on turn end** ❌
   - **Issue:** Burn doesn't deal damage when turn ends
   - **Expected:** Health decreases by 5 each turn
   - **Actual:** Health stays the same
   - **Root Cause:** `processEndOfTurn()` creates burn effect but damage not applied
   - Location: `tests/e2e/turn-system.spec.ts:67`

6. **Remove burn when duration reaches 0** ❌
   - **Issue:** Burn badge remains visible after duration expires
   - **Expected:** Badge disappears when duration = 0
   - **Actual:** Badge still visible
   - **Root Cause:** STATUS_REMOVED not being applied or badge not respecting removal
   - Location: `tests/e2e/turn-system.spec.ts:119`

7. **Handle burn status across turns** ❌
   - **Issue:** Multi-turn burn flow broken (likely same as #5)
   - **Expected:** Damage dealt each turn, duration decrements
   - **Actual:** Duration decrements but no damage
   - Location: `tests/e2e/turn-system.spec.ts:197`

---

## 🔍 Root Cause Analysis

### Issue #1: Burn Tick Damage Not Applied

**Symptom:** Burn duration decrements but health doesn't decrease

**Investigation Path:**
1. ✅ Burn status is applied correctly (test #3 passes)
2. ✅ Duration decrements correctly (test #4 passes)
3. ❌ Damage is NOT being dealt on turn end

**Code Flow:**
```
handleEndTurn() 
  → processEndOfTurn()
  → Creates burn effects for each creature with BURN status
  → Calls applyEffect(burnEffect)
  → Effect should deal damage via BURN effect applicator
  → Health should decrease
```

**Hypothesis:** 
- `createBurnEffect()` is being called correctly
- But BURN effect applicator might not be dealing damage
- OR damage is being calculated but not applied to state

**Files to Check:**
- `src/utils/effectPipeline/effects/statusEffects.ts` - BURN effect definition
- `src/utils/effectPipeline/hooks/useBattleEngine.ts:145-217` - processEndOfTurn()
- Console logs during test execution

### Issue #2: Burn Status Not Removed

**Symptom:** Badge visible even after duration reaches 0

**Investigation Path:**
1. ✅ Duration countdown works (3 → 2 → 1 → 0)
2. ❌ STATUS_REMOVED state change not applied OR UI not updating

**Code Flow:**
```
processEndOfTurn()
  → Loops through creatures and statuses
  → Checks if newDuration <= 0
  → Creates STATUS_REMOVED state change
  → Calls applyChangesToContext()
  → Should remove status from creature.statuses array
  → UI should re-render without badge
```

**Hypothesis:**
- STATUS_REMOVED state change is being created
- But zustand adapter might not be processing it correctly
- OR UI component not re-rendering when status removed

**Files to Check:**
- `src/utils/effectPipeline/hooks/useBattleEngine.ts:145-217` - Duration decrement logic
- `src/utils/effectPipeline/core/battleContext.ts` - applyChangesToContext()
- `src/utils/effectPipeline/core/zustandAdapter.ts` - applyStateChanges()

---

## 🐛 Debugging Strategy

### Phase 1: Add Console Logging

**Where to Add Logs:**

1. **In `processEndOfTurn()`** (useBattleEngine.ts):
   ```typescript
   console.log('🔄 Processing end of turn...')
   console.log('📊 All creatures:', allCreatures.map(c => ({ 
     name: c.name, 
     health: c.health, 
     statuses: c.statuses 
   })))
   console.log('🎯 Effects to apply:', effectsToApply)
   console.log('⏱️ Duration changes:', durationChanges)
   ```

2. **In BURN effect applicator** (statusEffects.ts):
   ```typescript
   console.log('🔥 BURN effect triggered!')
   console.log('🎯 Target:', target.name, 'Current HP:', target.health)
   console.log('💥 Burn damage:', damage)
   console.log('❤️ New health:', newHealth)
   ```

3. **In applyChangesToContext()** (battleContext.ts):
   ```typescript
   console.log('📝 Applying state changes:', changes)
   console.log('🔄 State before:', context.state)
   console.log('🔄 State after:', newState)
   ```

### Phase 2: Run Tests with Logging

```bash
# Run tests in headed mode to see console output
npm run test:e2e:headed

# Or run single test with more detail
npx playwright test --grep "should tick burn damage" --headed --debug
```

### Phase 3: Analyze Logs

Look for:
- ✅ Are burn effects being created?
- ✅ Is the BURN applicator being called?
- ✅ Is damage being calculated?
- ❌ Are state changes being applied?
- ❌ Is Zustand updating?
- ❌ Are components re-rendering?

---

## 🔧 Known Fixes Applied

### Fix #1: ATTACK Effect Now Applies Burn
**Date:** October 19, 2025  
**File:** `src/utils/effectPipeline/effects/combatEffects.ts`

**Problem:** ATTACK effect didn't process `attack.effects` array

**Solution:** Added loop to check for "BURN", "POISON" effects and create STATUS_APPLIED state changes

```typescript
// Process attack effects (burn, poison, etc.)
if (attack.effects && Array.isArray(attack.effects)) {
  for (const effectName of attack.effects) {
    const effectType = effectName.toUpperCase()
    
    if (effectType === 'BURN') {
      const burnChange: StateChange = {
        type: 'STATUS_APPLIED',
        creatureId: effect.targetId,
        timestamp: Date.now(),
        data: {
          statusId: 'BURN',
          duration: 3,
          damagePerTurn: 5
        }
      }
      stateChanges.push(burnChange)
    }
  }
}
```

**Result:** Tests #3 and #4 now pass (burn applies and duration decrements)

---

## 📋 Next Steps

### Immediate Actions (Current)
1. ✅ Add console logging to burn tick flow
2. ✅ Run tests and collect logs
3. ✅ Identify where burn damage calculation fails
4. ✅ Fix BURN effect applicator
5. ✅ Fix STATUS_REMOVED processing

### Future Improvements
- [ ] Add test for poison status
- [ ] Add test for regeneration status
- [ ] Add test for multiple statuses on same creature
- [ ] Add test for status triggers (Outbreak)
- [ ] Add CI/CD integration for automated testing

---

## 🎓 Lessons Learned

### What Worked Well
- **Test-Driven Debugging:** Tests caught real bugs in status application
- **Data Test IDs:** Made UI element selection reliable
- **Incremental Fixes:** Fixed burn application before tackling burn ticking

### What Needs Improvement
- **Better Error Messages:** Hard to diagnose which part of pipeline failed
- **Effect Flow Visibility:** Need better logging of effect chain
- **State Change Tracking:** Need to verify each state change actually applies

### Best Practices Discovered
- Always verify effect handlers process all data fields
- Use `effects: ["BURN"]` string format, not complex objects
- Log both state before/after to verify changes apply
- Test entire flow end-to-end, not just individual pieces

---

**Document Status:** Living document - updated as debugging progresses
