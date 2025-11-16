# Outbreak Passive Ability - Test Plan

**Last Updated:** October 19, 2025  
**Status:** ⚠️ Ready to implement once Outbreak is configured in BattleEngineExample

---

## 🎯 What is Outbreak?

**Outbreak** is a passive ability demonstrating **LOCAL scope** triggering:
- Triggers only when the creature WITH the passive gets a status effect
- Has a probability-based activation (25% chance)
- Spreads status to adjacent enemies (cascading effect)
- Can potentially trigger recursively if multiple creatures have Outbreak

**Location**: `src/utils/effectPipeline/effects/triggerSetup.ts` (lines 71-120)

---

## 🧪 Test Requirements

### Test 1: Outbreak Triggers on Status Application (LOCAL Scope)

**Setup:**
- Creature A: Has Outbreak passive, no status
- Creature B: Adjacent enemy, no Outbreak passive
- Creature C: Adjacent enemy, no Outbreak passive

**Action:**
- Apply POISON to Creature A

**Expected Result:**
- ✅ Outbreak evaluates (LOCAL scope - only triggers for Creature A)
- ✅ 25% probability roll occurs
- ✅ If successful, POISON spreads to ONE adjacent enemy (B or C randomly)
- ✅ Creature A remains poisoned
- ✅ Log shows: `🦠 Outbreak! ${creatureName}'s passive spreads poison to ${targetName}`

### Test 2: Outbreak Only Triggers for Creatures WITH the Passive

**Setup:**
- Creature A: NO Outbreak passive
- Creature B: HAS Outbreak passive, adjacent
- Creature C: NO Outbreak passive, adjacent

**Action:**
- Apply POISON to Creature A

**Expected Result:**
- ❌ NO Outbreak trigger (Creature A doesn't have the passive)
- ✅ Creature A gets poisoned
- ✅ Creatures B and C remain unaffected

**Action 2:**
- Apply POISON to Creature B

**Expected Result:**
- ✅ Outbreak triggers for Creature B (has the passive)
- ✅ May spread to A or C (if probability succeeds)

### Test 3: No Infinite Loop Protection

**Setup:**
- Creature A: Has Outbreak passive
- Creature B: Has Outbreak passive, adjacent to A
- Creature C: Has Outbreak passive, adjacent to B

**Action:**
- Apply POISON to Creature A

**Expected Result:**
- ✅ Creature A's Outbreak triggers → may spread to B
- ✅ If B gets poisoned, B's Outbreak triggers → may spread to C
- ✅ If C gets poisoned, C's Outbreak triggers → may spread back
- ✅ Each creature can only trigger Outbreak ONCE per poison application
- ✅ Cascade eventually stops (finite chain, not infinite loop)

**Critical Check:**
```typescript
// In triggerSetup.ts - verify this protection exists:
if (context.processingStack?.includes('OUTBREAK')) {
  return []; // Prevent recursive Outbreak
}
```

### Test 4: Cascading Timing Requirements

**Setup:**
- 3+ creatures with Outbreak passive arranged in a line

**Action:**
- Apply POISON to first creature
- Wait for cascade to complete

**Expected Result:**
- ✅ E2E test uses `waitForTimeout(5000)` (or longer) to handle cascades
- ✅ All poison applications visible in DOM before test asserts
- ✅ React has finished all re-renders
- ✅ Animation queue is empty

**Code Example:**
```typescript
test('should handle Outbreak cascading spread', async ({ page }) => {
  // Apply poison to creature with Outbreak
  await applyPoisonToOutbreakCreature(page);
  
  // CRITICAL: Wait for full cascade + animations + React
  await page.waitForTimeout(5000); // Not 3000ms!
  
  // Now safe to count poison badges
  const poisonBadges = await page.locator('[data-status="POISON"]').count();
  expect(poisonBadges).toBeGreaterThanOrEqual(1); // At least original
  
  // Could be more if Outbreak triggered
  console.log(`🦠 Poison spread to ${poisonBadges} creatures`);
});
```

---

## 🚧 Current Blocker

**Outbreak is not configured in BattleEngineExample.tsx**

To enable testing, we need to:

1. Add a creature with `passiveAbilities` in the example:
```typescript
const plagueRat: Creature = {
  id: 3,
  name: 'Plague Rat',
  icon: '🐀',
  health: 50,
  maxHealth: 50,
  attack: 10,
  defense: 5,
  trueDamage: 0,
  team: 'computer',
  passiveAbilities: [{
    id: 'outbreak',
    name: 'Outbreak',
    description: '25% chance to spread poison to adjacent enemies',
    trigger: 'ON_STATUS_APPLIED',
    probability: 0.25,
    scope: 'LOCAL', // Only triggers for THIS creature
    effect: {
      type: 'APPLY_STATUS',
      status: 'POISON',
      target: 'ADJACENT_ENEMIES'
    }
  }]
};
```

2. Add multiple plague rats to test cascading

3. Add an attack that applies POISON:
```typescript
const poisonStrike: Attack = {
  id: 'poison_strike',
  name: 'Poison Strike',
  damage: 10,
  effects: [{
    type: 'APPLY_STATUS',
    status: 'POISON',
    duration: 3,
    value: 5 // 5 damage per turn
  }]
};
```

4. Add data-testid for status badges showing which status type

---

## 📋 E2E Test Checklist

Once Outbreak is configured:

- [ ] Verify LOCAL scope (only creature with passive triggers)
- [ ] Verify probability roll (25% chance)
- [ ] Verify adjacent targeting (spreads to neighbors only)
- [ ] Verify cascading works (chain spreads)
- [ ] Verify no infinite loops (cascade terminates)
- [ ] Verify timing (5000ms+ wait for cascades)
- [ ] Verify UI updates (poison badges appear)
- [ ] Verify logs (console shows "🦠 Outbreak!")

---

## 🔍 Manual Testing Steps

Until E2E is ready, manual test:

1. Open `http://localhost:3000`
2. Set up 3 creatures with Outbreak passive in adjacent positions
3. Apply poison to the first creature
4. Watch console for `🦠 Outbreak!` messages
5. Verify poison spreads (25% chance per creature)
6. Verify cascade stops (doesn't loop forever)
7. Count poison badges in UI match console logs

---

## 🎯 Success Criteria

**Outbreak working correctly if:**
- ✅ Only triggers for creatures WITH the passive (LOCAL scope)
- ✅ Probability respected (roughly 1 in 4 attempts succeed)
- ✅ Spreads to adjacent enemies only
- ✅ Can cascade (spread to creature with Outbreak → that spreads again)
- ✅ Terminates eventually (no infinite loops)
- ✅ UI shows all poison applications
- ✅ Tests use adequate wait times (5000ms+ for cascades)

---

## 📝 Related Documentation

- `E2E_CASCADING_EFFECTS.md` - General cascading effects guide
- `E2E_TIMING_BEST_PRACTICES.md` - Wait time guidelines
- `src/utils/effectPipeline/effects/triggerSetup.ts` - Outbreak implementation
- `tests/e2e/turn-system.spec.ts` - Existing E2E tests as examples

---

**Author:** Battle Engine Team  
**Status:** 📋 Test plan ready, awaiting configuration  
**Priority:** High - validates LOCAL scope and cascading system
