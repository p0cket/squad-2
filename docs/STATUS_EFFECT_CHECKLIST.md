# 🎯 Status Effect Checklist Framework

**Purpose**: Systematic verification and implementation guide for all status effects in the battle system.

**Author**: Based on Claude's framework recommendations  
**Last Updated**: 2025-11-16

---

## 📋 Core Questions Every Status Must Answer

### 1. WHEN does it tick/apply?
- ⏰ **On turn end?** (DoT/HoT effects like Poison, Burn, Regeneration)
- ⚡ **On trigger?** (Reactive/passive abilities)
- 💥 **On application only?** (Instant debuffs like Stun)

### 2. WHAT does it do?
- 💔 Damage amount per turn
- 💚 Healing amount per turn
- 📊 Stat modification (attack/defense buffs)
- 🚫 Action prevention (stun, sleep)
- 🔄 Other effects (cleanse, dispel, etc.)

### 3. HOW LONG does it last?
- ⏱️ Duration (in turns)
- ⬇️ Decrements when? (end of turn, start of turn)
- 📚 Stacks or refreshes? (multiple applications)

### 4. WHAT'S THE VISUAL?
- 🎨 Badge icon + color
- ✨ Animation type
- 🔢 Damage/heal numbers

---

## ✅ Verification Checklist (For Existing Statuses)

For each status (e.g., POISON, BURN, REGENERATION):

### Step 1: Factory Exists
```typescript
// In src/utils/effectPipeline/factories.ts
✅ buildPoisonEffect(targetId, damage?)
✅ buildBurnEffect(targetId, damage?)
✅ buildRegenerationEffect(targetId, healing?)
```

### Step 2: Applicator Registered
```typescript
// In src/utils/effectPipeline/effects/statusEffects.ts
✅ registerEffectApplicator('POISON', applyPoisonEffect)
✅ registerEffectApplicator('BURN', applyBurnEffect)
✅ registerEffectApplicator('REGENERATION', applyRegenerationEffect)
```

### Step 3: Applicator Follows Two-Phase Pattern
**For DoT/HoT effects (Poison, Burn, Regeneration):**

```typescript
// Phase 1: Initial Application (stores status, NO immediate effect)
const hasStatus = creature.statuses.some(s => s.id === 'STATUS_NAME')

if (!hasStatus) {
  // First time - apply status only, store dynamic values
  return {
    stateChanges: [{
      type: 'STATUS_APPLIED',
      creatureId: targetId,
      data: {
        statusId: 'STATUS_NAME',
        duration: 3,
        damagePerTurn: damage,  // or healPerTurn for healing
        source: 'status-name'
      }
    }],
    animations: [...]
  }
}

// Phase 2: Tick (applies damage/healing only)
if (hasStatus) {
  // Already has status - this is a tick, apply effect only
  return {
    stateChanges: [{
      type: 'HEALTH_CHANGE',
      creatureId: targetId,
      data: {
        delta: -damage,  // or +healing
        newHealth: creature.health - damage,
        source: 'status-name'
      }
    }],
    animations: [...]
  }
}
```

### Step 4: In processEndOfTurn
```typescript
// In src/utils/effectPipeline/hooks/useBattleEngine.ts
else if (sid === 'POISON') {
  const damage = status.damagePerTurn ?? 3  // Defensive fallback
  if (status.damagePerTurn === undefined) {
    console.warn(`⚠️ POISON missing damagePerTurn!`)
  }
  effectsToApply.push(buildPoisonEffect(creature.ID, damage))
}
```

### Step 5: Status Definition (for UI)
```typescript
// In src/consts/statuses.ts (or similar)
export const STATUS_EFFECTS = {
  POISON: {
    id: 'POISON',
    name: 'Poisoned',
    icon: '🧪',
    type: 'debuff',
    description: 'Takes damage at end of turn',
    duration: 3
  }
}
```

### Step 6: Manual Test Checklist
```
1. Apply status to creature
2. Click "End Turn"
3. Check console for:
   ✅ Applicator called with correct values
   ✅ Health changes correctly (decreases for DoT, increases for HoT)
   ✅ Duration decrements: 3→2→1→removed
   ✅ Status badge appears
   ✅ Animation plays
```

### Step 7: E2E Test (Optional but Recommended)
```typescript
// In tests/e2e/turn-system.spec.ts
test('Poison: deals damage over time', async ({ page }) => {
  await applyPoisonToGoblin(page)
  const healthBefore = await getCreatureHealth(page, 'Goblin')
  
  await page.click('[data-testid="end-turn-button"]')
  await page.waitForTimeout(3000)
  
  const healthAfter = await getCreatureHealth(page, 'Goblin')
  
  expect(healthAfter).toBeLessThan(healthBefore)
  
  const poisonBadge = page.locator('[data-testid="status-badge"]')
    .filter({ hasText: /🧪|poison/i })
  await expect(poisonBadge).toBeVisible()
})
```

---

## 🆕 Adding New Status Effects (Step-by-Step Template)

**Example: Adding BLEED status**

### Step 1: Define Effect Data Type
```typescript
// In src/utils/effectPipeline/effects/statusEffects.ts
export type BleedEffectData = {
  damage: number
}
```

### Step 2: Create Applicator
```typescript
const applyBleedEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const { damage } = effect.data as BleedEffectData
  const creature = getCreatureFromContext(context, effect.targetId)

  // Check if creature already has bleed status
  const hasBleedStatus = creature.statuses.some(s => s.id === 'BLEED')
  
  if (hasBleedStatus) {
    // This is a tick - deal damage only
    const actualDamage = Math.min(damage, creature.health)
    const newHealth = creature.health - actualDamage

    console.log(`🩸 Bleed tick: ${creature.name} takes ${actualDamage} bleed damage`)

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
    // First application - only apply status, no damage
    console.log(`🩸 Applying bleed status to ${creature.name} (${damage} dmg/turn for 3 turns)`)

    const statusChange: StateChange = {
      type: 'STATUS_APPLIED',
      creatureId: effect.targetId,
      timestamp: Date.now(),
      data: {
        statusId: 'BLEED',
        duration: 3,
        damagePerTurn: damage,  // Store damage value
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

### Step 3: Register Applicator
```typescript
registerEffectApplicator('BLEED', applyBleedEffect)
console.log('✅ BLEED applicator registered')
```

### Step 4: Create Factory Function
```typescript
// In src/utils/effectPipeline/factories.ts
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

### Step 5: Add to processEndOfTurn
```typescript
// In src/utils/effectPipeline/hooks/useBattleEngine.ts
else if (sid === 'BLEED') {
  const damage = status.damagePerTurn ?? 8
  if (status.damagePerTurn === undefined) {
    console.warn(`⚠️ BLEED status on ${creature.name} missing damagePerTurn! Using fallback: 8`)
  }
  console.log(`🩸 Creating bleed tick effect for ${creature.name} (${damage} dmg)`)
  effectsToApply.push(buildBleedEffect(creature.ID, damage))
}
```

### Step 6: Add Status Definition
```typescript
// In src/consts/statuses.ts
export const STATUS_EFFECTS = {
  // ... existing statuses
  BLEED: {
    id: 'BLEED',
    name: 'Bleeding',
    icon: '🩸',
    type: 'debuff',
    description: 'Loses HP per turn from open wounds',
    duration: 3
  }
}
```

### Step 7: Manual Test
```
1. Apply bleed to enemy
2. End turn
3. Check console logs
4. Verify health decreases
5. Verify duration decrements
6. Verify removal at duration 0
```

---

## 📊 Status Effect Patterns

### Pattern 1: DoT (Damage over Time)
**Examples**: Poison, Burn, Bleed  
**Behavior**: No immediate damage; ticks at end of turn  
**Storage**: `damagePerTurn` in status data

### Pattern 2: HoT (Heal over Time)
**Examples**: Regeneration  
**Behavior**: No immediate healing; ticks at end of turn  
**Storage**: `healPerTurn` in status data

### Pattern 3: Stat Modification
**Examples**: Attack Buff, Defense Buff  
**Behavior**: Immediate stat change; persists for duration  
**Storage**: Stat changes tracked separately

### Pattern 4: Action Prevention
**Examples**: Stun, Sleep  
**Behavior**: Prevents actions during duration  
**Storage**: Duration only; checked before actions

---

## 🧪 Quick Verification Template

For each status, fill out this checklist:

```
Status: _____________
━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Factory exists?          build___Effect()
✅ Applicator exists?       apply___Effect()
✅ Registered?              registerEffectApplicator('___', ...)
✅ In processEndOfTurn?     else if (sid === '___')
✅ Two-phase pattern?       hasStatus check + conditional logic
✅ Status definition?       STATUS_EFFECTS.___
✅ E2E test?                turn-system.spec.ts
✅ Manual test?             [Apply → End Turn → Check console]

Results:
  - Console shows applicator called?  YES/NO
  - Health/stat changes correctly?    YES/NO
  - Duration decrements?              YES/NO
  - Expires at 0?                     YES/NO
  - Visual appears?                   YES/NO
```

---

## 🎯 Current Implementation Status

### ✅ Fully Implemented (Correct Pattern)
- **BURN**: Two-phase pattern, stores `damagePerTurn`, ticks at end of turn ✅ E2E tested
- **POISON**: Two-phase pattern, stores `damagePerTurn`, ticks at end of turn ✅ E2E tested
- **REGENERATION**: Two-phase pattern, stores `healPerTurn`, ticks at end of turn ⏳ E2E test pending
- **SHIELD**: Passive absorption pattern, stores `shieldAmount`, duration decrements ✅ E2E tested

### 📝 Partially Implemented
- **ATTACK_BUFF**: Stat modification works, but could benefit from verification
- **DEFENSE_BUFF**: Stat modification works, but could benefit from verification
- **STUN**: Basic implementation exists, needs action-prevention logic

### 🚧 Not Implemented
- **BLEED**: Template ready, awaiting implementation
- **FREEZE**: Action prevention + stat modification
- **SLOW**: Speed reduction mechanic
- **SILENCE**: Ability prevention
- **CLEANSE**: Remove debuffs utility

---

## 📚 Pattern Variations

### DoT/HoT Pattern (Damage/Healing Over Time)
Examples: BURN, POISON, REGENERATION

**Behavior**:
- Initial application: Stores value (`damagePerTurn` or `healPerTurn`), NO immediate effect
- Tick (end of turn): Applies damage/healing based on stored value
- Duration: Decrements each turn, expires at 0

### Passive Absorption Pattern
Examples: SHIELD

**Behavior**:
- Initial application: Stores `shieldAmount`, NO immediate effect
- Passive: Absorbs incoming damage (handled in damage calculation)
- Tick: NO effect (shield doesn't tick)
- Duration: Decrements each turn, expires at 0

**Note**: Shield requires integration with damage calculation logic to actually absorb damage.

### Stat Modification Pattern
Examples: ATTACK_BUFF, DEFENSE_BUFF

**Behavior**:
- Application: Modifies creature stats immediately
- Tick: No effect
- Duration: Decrements each turn, stats revert on expiration

### Action Prevention Pattern
Examples: STUN, FREEZE, SILENCE

**Behavior**:
- Application: Sets flag preventing actions
- Tick: No effect (prevention is checked before actions)
- Duration: Decrements each turn, flag removed on expiration

---

## 📚 Related Documentation

- **Implementation Guide**: [TURN_SYSTEM_IMPLEMENTATION.md](./TURN_SYSTEM_IMPLEMENTATION.md)
- **Attack Flow**: [ATTACK_FLOW_LIFECYCLE_COMPLETE.md](./ATTACK_FLOW_LIFECYCLE_COMPLETE.md)
- **Testing Guide**: [E2E_TESTING_GUIDE.md](./technical/E2E_TESTING_GUIDE.md)

---

## 💡 Recommended Next Steps

1. **Fix Regeneration** (5 min)
   - Add two-phase pattern to applicator
   - Fix factory field name
   - Test manually

2. **Verify Poison & Burn** (5 min each)
   - Manual testing with console logs
   - Verify duration decrements correctly

3. **Add New Status: BLEED** (30 min)
   - Follow template above
   - Good test of the system

4. **Add Action Prevention: STUN** (45 min)
   - Different pattern than DoT
   - Requires turn logic integration

---

**See also**: This checklist is referenced in:
- `/src/utils/effectPipeline/effects/statusEffects.ts` (applicator implementations)
- `/src/utils/effectPipeline/factories.ts` (factory functions)
- `/src/utils/effectPipeline/hooks/useBattleEngine.ts` (processEndOfTurn)
