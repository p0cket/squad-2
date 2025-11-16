# Status Effect Development Guide

**Purpose:** Systematic approach for implementing and verifying status effects in the battle system.

**Date Created:** 2025-11-16
**Status:** Active Development Guide

---

## 📐 Core Principles

Every status effect is built on these components:
1. **Effect Data Type** - Serializable data structure
2. **Applicator Function** - Pure function that applies the effect
3. **Factory Function** - Creates the effect object
4. **Registration** - Links effect type to applicator
5. **Turn System Integration** - When/how it ticks
6. **UI Definition** - Badge, icon, description

---

## 🔍 Status Effect Anatomy

### The 4 Questions Every Status Must Answer:

#### 1. **WHEN** does it apply?
- **On turn end** (DoT/HoT): Poison, Burn, Bleed, Regeneration
- **On trigger** (reactive): Outbreak, Poison Skin, Stone Thorns
- **On application only** (instant): Stun, Freeze, Weaken

#### 2. **WHAT** does it do?
- **Health change**: Damage (DoT) or Healing (HoT)
- **Stat modification**: Attack/Defense/Speed up/down
- **Action prevention**: Stun, Freeze, Silence
- **Cascading effects**: Outbreak (spread burn to allies)

#### 3. **HOW LONG** does it last?
- **Duration** (turns): Usually 3-4 turns
- **Decrement timing**: After effect ticks (end of turn)
- **Stacking behavior**:
  - Replace duration (default)
  - Stack damage (advanced)
  - Stack duration (advanced)

#### 4. **WHAT'S THE VISUAL**?
- **Badge**: Icon + color + name
- **Animation**: Fire, poison cloud, sparkles, etc.
- **Damage numbers**: Pop up on tick
- **Debuff/Buff type**: Red (debuff), green (buff), blue (neutral)

---

## ✅ Status Effect Checklist

Before marking a status as "complete", verify ALL items:

```
Status: [NAME]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CODE IMPLEMENTATION
  ☐ 1. Effect data type defined
  ☐ 2. Applicator function written
  ☐ 3. Applicator registered
  ☐ 4. Factory function created
  ☐ 5. Added to processEndOfTurn (if recurring)
  ☐ 6. Status definition in consts/effects

TESTING
  ☐ 7. Unit test written (optional but recommended)
  ☐ 8. E2E test written
  ☐ 9. Manual browser test passed

MANUAL TEST VERIFICATION
  ☐ Console shows applicator called
  ☐ Health/stats change as expected
  ☐ Duration decrements correctly
  ☐ Status expires and removes at 0
  ☐ Visual badge displays
  ☐ Animation plays
  ☐ No errors in console

EDGE CASES
  ☐ Works when target is at low health
  ☐ Doesn't break when creature dies
  ☐ Multiple statuses on same creature work
  ☐ Stacking behavior is correct
```

---

## 🛠️ Implementation Template

### For DoT/HoT Effects (Recurring Damage/Healing)

**Example: BLEED**

#### Step 1: Define Data Type
```typescript
// In src/utils/effectPipeline/effects/statusEffects.ts

export type BleedEffectData = {
  damage: number
}
```

#### Step 2: Create Applicator
```typescript
/**
 * Apply a bleed effect that deals damage over time
 */
const applyBleedEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  console.log('🩸 BLEED APPLICATOR CALLED')

  const { damage } = effect.data as BleedEffectData
  const creature = getCreatureFromContext(context, effect.targetId)

  const actualDamage = Math.min(damage, creature.health)
  const newHealth = creature.health - actualDamage

  console.log(`🩸 ${creature.name} bleeds for ${actualDamage} damage (${creature.health} → ${newHealth})`)

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

  // Only add STATUS_APPLIED on first application (not ticks)
  const hasBleedStatus = creature.statuses.some(s => s.id === 'BLEED')
  const stateChanges: StateChange[] = [healthChange]

  if (!hasBleedStatus) {
    stateChanges.push({
      type: 'STATUS_APPLIED',
      creatureId: effect.targetId,
      timestamp: Date.now(),
      data: {
        statusId: 'BLEED',
        duration: 3,
        source: 'bleed'
      }
    })
    console.log('📝 First application - adding BLEED status')
  } else {
    console.log('⏭️ Tick damage - status already exists')
  }

  const animations: Animation[] = [
    { type: 'bleed', targetId: effect.targetId, duration: 500 },
    { type: 'damage-number', targetId: effect.targetId, duration: 1000, data: { value: -damage } }
  ]

  return {
    stateChanges,
    animations
  }
}
```

#### Step 3: Register Applicator
```typescript
registerEffectApplicator('BLEED', applyBleedEffect)
console.log('✅ BLEED applicator registered')
```

#### Step 4: Create Factory
```typescript
export const createBleedEffect = (targetId: number, damage: number = 8): Effect => ({
  id: 'bleed',
  type: 'BLEED',
  targetId,
  priority: 10,
  timestamp: Date.now(),
  data: { damage }
})
```

#### Step 5: Add to Turn System
```typescript
// In src/utils/effectPipeline/hooks/useBattleEngine.ts
// Inside processEndOfTurn function:

for (const status of creature.statuses) {
  const sid = status.id
  if (sid === 'BURN') {
    effectsToApply.push(createBurnEffect(creature.ID, undefined))
  } else if (sid === 'POISON') {
    effectsToApply.push(createPoisonEffect(creature.ID, undefined))
  } else if (sid === 'BLEED') {  // ← ADD NEW STATUS HERE
    console.log(`🩸 Creating bleed tick effect for ${creature.name}`)
    effectsToApply.push(createBleedEffect(creature.ID, undefined))
  } else if (sid === 'REGENERATION') {
    effectsToApply.push(createRegenerationEffect(creature.ID, undefined))
  }
}
```

#### Step 6: Define for UI
```typescript
// In src/consts/effects.js (or wherever STATUS_EFFECTS lives)

export const STATUS_EFFECTS = {
  // ... existing statuses
  BLEED: {
    id: 'BLEED',
    name: 'Bleeding',
    icon: '🩸',
    type: 'debuff',
    description: 'Loses 8 HP per turn',
    duration: 3,
    color: 'red'
  }
}
```

#### Step 7: Write E2E Test
```typescript
// In tests/e2e/turn-system.spec.ts

test('should tick bleed damage on turn end', async ({ page }) => {
  console.log('🧪 TEST: Bleed tick damage')

  // Apply bleed
  await applyBleedToGoblin(page)

  // Get health before turn end
  const healthBefore = await getCreatureHealth(page, 'Goblin')
  console.log(`Health before turn end: ${healthBefore}`)

  // End turn
  await page.click('[data-testid="end-turn-button"]')
  await page.waitForTimeout(3000)

  // Get health after turn end
  const healthAfter = await getCreatureHealth(page, 'Goblin')
  console.log(`Health after turn end: ${healthAfter}`)

  // Verify damage was dealt
  expect(healthAfter).toBeLessThan(healthBefore)
  const damageTaken = healthBefore - healthAfter
  expect(damageTaken).toBeGreaterThanOrEqual(5) // At least 5 damage

  console.log(`✅ Bleed dealt ${damageTaken} damage`)

  // Verify bleed badge is visible
  const bleedBadge = goblin.locator('[data-testid="status-badge"]').filter({ hasText: /🩸|bleed/i })
  await expect(bleedBadge).toBeVisible()
})
```

---

## 🧪 Manual Testing Procedure

### Quick Test (5 minutes per status)

1. **Start dev server**: `npm start`
2. **Open browser console** (F12)
3. **Navigate to BattleEngineExample**
4. **Apply the status** (use test buttons or attack)
5. **Check console for**:
   ```
   ✅ [STATUS] applicator registered
   🚨 [STATUS] APPLICATOR CALLED
   ❤️ Health: X → Y
   📝 Creating state changes
   ```
6. **Click "End Turn"**
7. **Verify**:
   - Health changes (decreases for DoT, increases for HoT)
   - Duration badge shows (3→2→1)
   - Console shows tick effects
8. **Click "End Turn" 3 times total**
9. **Verify status expires** (removed at duration 0)

### Deep Test (15 minutes per status)

- [ ] Apply to multiple creatures
- [ ] Apply while creature is low health
- [ ] Apply multiple different statuses to same creature
- [ ] Verify status survives creature attacking
- [ ] Verify status persists across turns
- [ ] Test edge case: creature dies while status active
- [ ] Test stacking: apply same status twice

---

## 📊 Status Effect Patterns

### Pattern 1: DoT (Damage over Time)
**Examples:** Burn, Poison, Bleed
**Key Points:**
- Negative `delta` in HEALTH_CHANGE
- Ticks on `processEndOfTurn`
- Duration decrements after tick
- Damage number animation

### Pattern 2: HoT (Healing over Time)
**Examples:** Regeneration, Life Tap
**Key Points:**
- Positive `delta` in HEALTH_CHANGE
- Ticks on `processEndOfTurn`
- Cap at `maxHealth`
- Healing number animation (green)

### Pattern 3: Stat Modification
**Examples:** Attack Buff, Defense Buff, Weaken
**Key Points:**
- Modifies creature stats temporarily
- Needs stat tracking in state
- Visual indicator on creature
- Affects damage calculations

### Pattern 4: Action Prevention
**Examples:** Stun, Freeze, Silence
**Key Points:**
- Prevents actions during affected turns
- Check before allowing attacks/abilities
- Visual: grayed out creature
- May prevent turn entirely

### Pattern 5: Reactive/Trigger
**Examples:** Stone Thorns, Poison Skin, Outbreak
**Key Points:**
- Uses `registerEffectTrigger()`
- Condition checks when to activate
- Passive abilities on creatures
- Can cascade to other effects

---

## 🐛 Common Issues & Solutions

### Issue: "No applicator registered for effect type: X"
**Cause:** Forgot to call `registerEffectApplicator()`
**Solution:** Add registration line after applicator function

### Issue: Status applies but doesn't tick
**Cause:** Not added to `processEndOfTurn`
**Solution:** Add `else if (sid === 'X')` case in turn system

### Issue: Health changes but then reverts
**Cause:** Stale closure bug (like burn tick bug)
**Solution:** Re-fetch fresh creatures after applying effects:
```typescript
const freshCreatures = [
  ...(contextRef.current.state.playerCreatures || []),
  ...(contextRef.current.state.computerCreatures || [])
]
```

### Issue: Duration doesn't decrement
**Cause:** Duration update logic not working
**Solution:** Check `applyStatusChange` in battleContext/zustandAdapter

### Issue: Status doesn't expire at 0
**Cause:** Missing `STATUS_REMOVED` state change
**Solution:** Check duration decrement logic sends STATUS_REMOVED

### Issue: Multiple statuses interfere
**Cause:** Not handling array properly
**Solution:** Use `creature.statuses.some()` to check for existing status

---

## 📝 Development Workflow

### Adding a New Status (Step-by-Step)

1. ✅ Read this guide
2. ✅ Pick a status from ATTACK_TYPES.md
3. ✅ Determine pattern (DoT, HoT, Stat Mod, etc.)
4. ✅ Follow implementation template
5. ✅ Add all 6 code components
6. ✅ Write E2E test
7. ✅ Run manual test in browser
8. ✅ Verify all checklist items
9. ✅ Commit with clear message
10. ✅ Update this guide if you find improvements!

### Verifying an Existing Status

1. ✅ Check all 6 components exist in code
2. ✅ Run E2E test: `npm run test:e2e`
3. ✅ Manual browser test
4. ✅ Check console logs match expected
5. ✅ Mark checklist complete
6. ✅ Document any issues found

---

## 🎯 Status Priority List

### Phase 2: Core DoT/HoT (CURRENT)
- [x] BURN - Damage over time
- [ ] POISON - Damage over time
- [ ] REGENERATION - Healing over time
- [ ] BLEED - Damage over time

### Phase 3: Debuffs & Control
- [ ] STUN - Prevent action for 1 turn
- [ ] FREEZE - Prevent action for 2 turns
- [ ] WEAKEN - Reduce attack
- [ ] SHATTER_ARMOR - Reduce defense
- [ ] SLOW - Reduce speed
- [ ] SILENCE - Prevent abilities

### Phase 4: Buffs & Support
- [ ] ATTACK_BUFF - Increase attack
- [ ] DEFENSE_BUFF - Increase defense
- [ ] HASTE - Increase speed
- [ ] FORTIFY - Extra HP shield

### Phase 5: Advanced
- [ ] OUTBREAK - Spread burn (reactive)
- [ ] STONE_THORNS - Counter-attack (reactive)
- [ ] POISON_SKIN - Poison attackers (reactive)

---

## 📚 Reference Files

**Core Implementation:**
- `/src/utils/effectPipeline/effects/statusEffects.ts` - Effect definitions
- `/src/utils/effectPipeline/hooks/useBattleEngine.ts` - Turn system
- `/src/utils/effectPipeline/battleContext.ts` - State management
- `/src/utils/effectPipeline/zustandAdapter.ts` - Zustand integration

**Testing:**
- `/tests/e2e/turn-system.spec.ts` - E2E tests
- `/src/utils/effectPipeline/effects/__tests__/` - Unit tests

**Documentation:**
- `/ATTACK_TYPES.md` - All 32 attack types designed
- `/docs/technical/BURN_TICK_DEBUG_FINDINGS.md` - Bug analysis

---

## 🚀 Quick Reference

### Console Log Tags to Look For:
```
✅ [STATUS] applicator registered    ← Confirms registration
🚨 [STATUS] APPLICATOR CALLED         ← Confirms it's running
❤️ Health: X → Y                      ← Confirms health change
📝 Creating [STATUS] status           ← Confirms status applied
⏱️ [NAME] [STATUS]: duration X → Y   ← Confirms duration decrement
❌ [STATUS] expired, removing         ← Confirms expiration
```

### Files to Touch for Every New Status:
1. `statusEffects.ts` - Add data type, applicator, factory, registration
2. `useBattleEngine.ts` - Add to processEndOfTurn
3. `effects.js` - Add UI definition
4. `turn-system.spec.ts` - Add E2E test

---

**Last Updated:** 2025-11-16
**Maintained By:** Development Team
**Status:** Living Document - Update as patterns evolve!
