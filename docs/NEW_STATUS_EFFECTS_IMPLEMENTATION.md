# New Status Effects Implementation Plan

**Version**: 1.0  
**Date**: November 17, 2025  
**Status**: 🚀 ACTIVE IMPLEMENTATION  
**Risk Level**: 🟢 LOW (Isolated implementation)

---

## 📚 **IMPORTANT: Use the Implementation Guide**

**Primary Reference**: Follow the patterns in [`STATUS_EFFECT_IMPLEMENTATION_GUIDE.md`](./STATUS_EFFECT_IMPLEMENTATION_GUIDE.md)

This guide provides:
- ✅ Two-phase pattern details
- ✅ Code templates with exact syntax
- ✅ File locations and line numbers
- ✅ Common pitfalls and solutions
- ✅ Proven examples (BURN, POISON, BLEED)

**Workflow**: Use the Implementation Guide for HOW to code, use this document for WHAT to implement.

---

## 🎯 Overview

This document specifies the implementation of 5 new status effects using an **isolated, non-breaking approach**. Each effect will be implemented independently with full testing before moving to the next.

### ✨ New Effects to Implement (Priority Order)

1. **FREEZE** - Action prevention + defense debuff
2. **SLOW** - Reduces action frequency (skip turns)
3. **ATTACK_DEBUFF** - Reduces attack stat
4. **CLEANSE** - Removes debuffs (utility)
5. **SILENCE** - Prevents special abilities

---

## 🛡️ Safety Principles

### Isolation Strategy
- ✅ Each effect is self-contained (no shared state)
- ✅ Effects only touch their own status entries
- ✅ Factory functions are independent
- ✅ Applicators handle missing data gracefully
- ✅ Tests verify isolation (one effect doesn't break others)

### Non-Breaking Guarantees
- ✅ Existing effects remain unchanged
- ✅ New effects use same two-phase pattern
- ✅ Default values prevent crashes
- ✅ Console warnings for debugging
- ✅ E2E tests prevent regressions

### Rollback Plan
- Each effect is feature-flagged (can be disabled)
- Git commits are atomic (one effect per commit)
- Tests verify existing effects still work

---

## 📋 Implementation Checklist Template

For EACH new status effect, complete these 7 steps:

```
[ ] Step 1: Add type definition (statusEffects.ts)
[ ] Step 2: Create applicator function (statusEffects.ts)
[ ] Step 3: Register applicator (statusEffects.ts)
[ ] Step 4: Create factory function (factories.ts)
[ ] Step 5: Add processEndOfTurn handler (useBattleEngine.ts)
[ ] Step 6: Add status definition (battleContext.ts)
[ ] Step 7: Add UI definition (statuses.ts)
[ ] Step 8: Create E2E test (turn-system.spec.ts)
[ ] Step 9: Manual testing
[ ] Step 10: Git commit (atomic)
```

---

## 🧊 Effect #1: FREEZE

**Type**: Hybrid (Action Prevention + Stat Debuff)  
**Duration**: 2 turns  
**Behavior**:
- Phase 1 (Application): Apply status, reduce defense by 5
- Phase 2 (Tick): No tick effect (passive prevention)
- Prevents creature from taking actions
- Defense reduction persists for duration
- Visual: ❄️ icon, ice animation

### Technical Specification

#### 1.1 Type Definition
```typescript
// File: src/utils/effectPipeline/effects/statusEffects.ts
// Location: After existing type definitions (~line 40)

export type FreezeEffectData = {
  defenseReduction: number
}
```

#### 1.2 Applicator Function
```typescript
// File: src/utils/effectPipeline/effects/statusEffects.ts
// Location: Before REGISTER APPLICATORS section (~line 450)

/**
 * Apply a freeze effect that prevents actions and reduces defense
 * Freeze represents being frozen solid, unable to move
 */
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
        stat: 'defense',
        delta: -defenseReduction,
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
        defenseReduction: defenseReduction,
        preventsActions: true,  // Flag for action system to check
        source: 'freeze'
      }
    }

    const animations: Animation[] = [
      { type: 'freeze', targetId: effect.targetId, duration: 800 },
      { type: 'status-icon', targetId: effect.targetId, duration: 800, data: { status: 'FREEZE' } }
    ]

    return {
      stateChanges: [statChange, statusChange],
      animations
    }
  }
}
```

#### 1.3 Register Applicator
```typescript
// File: src/utils/effectPipeline/effects/statusEffects.ts
// Location: REGISTER APPLICATORS section (~line 524)

registerEffectApplicator('FREEZE', applyFreezeEffect)
console.log('✅ FREEZE applicator registered')
```

#### 1.4 Factory Function
```typescript
// File: src/utils/effectPipeline/factories.ts
// Location: After existing factories (~line 220)

/**
 * Build a freeze effect
 * Freezes target, preventing actions and reducing defense
 */
export const buildFreezeEffect = (
  targetId: number,
  defenseReduction: number = 5
): Effect => ({
  id: generateEffectId('freeze'),
  type: 'FREEZE',
  targetId,
  priority: 45,
  timestamp: Date.now(),
  data: { defenseReduction }
})
```

#### 1.5 ProcessEndOfTurn Handler
```typescript
// File: src/utils/effectPipeline/hooks/useBattleEngine.ts
// Location: Add import (~line 14-33)

import {
  buildBurnEffect,
  buildPoisonEffect,
  buildBleedEffect,
  buildRegenerationEffect,
  buildFreezeEffect,  // ← ADD THIS
  // ... other imports
} from '../factories'

// Location: In processEndOfTurn (~line 216)

} else if (sid === 'FREEZE') {
  // Freeze doesn't tick - it's a passive prevention effect
  // No effect to apply, just let duration decrement
  console.log(`❄️ ${creature.name} is frozen (passive effect, no tick)`)
} else if (sid === 'SHIELD') {
```

#### 1.6 Status Definition (battleContext.ts)
```typescript
// File: src/utils/effectPipeline/battleContext.ts
// Location: Inside STATUS_EFFECTS object (~line 410-480)

FREEZE: {
  name: "Freeze",
  type: "debuff",
  timing: "beforeAttack",
  duration: 2,
  effectFuncName: "applyFreeze",
  chance: 1,
  icon: "❄️",
  id: "FREEZE",
  notes: "Cannot act and defense reduced.",
},
```

#### 1.7 UI Definition (statuses.ts)
```typescript
// File: src/consts/statuses.ts
// Location: Inside STATUS_EFFECTS object (~line 45-155)

FREEZE: {
  name: "Freeze",
  type: "debuff",
  timing: "beforeAttack",
  duration: 2,
  effectFuncName: "applyFreeze",
  chance: 1,
  icon: "❄️",
  id: "FREEZE",
  notes: "Cannot act. Defense reduced by 5.",
},
```

#### 1.8 E2E Test Specification
```typescript
// File: tests/e2e/turn-system.spec.ts
// Location: New test suite

test.describe('Turn System - Status Effects - Freeze', () => {
  test('should apply freeze status and prevent actions', async ({ page }) => {
    // 1. Apply freeze to Goblin
    // 2. Verify freeze badge appears with duration 2
    // 3. Verify defense is reduced
    // 4. Try to attack with Goblin (should be prevented)
    // 5. Verify creature cannot act
  });

  test('should decrement freeze duration on turn end', async ({ page }) => {
    // 1. Apply freeze
    // 2. Verify duration 2
    // 3. End turn
    // 4. Verify duration 1
    // 5. End turn
    // 6. Verify freeze removed
  });

  test('should restore defense when freeze expires', async ({ page }) => {
    // 1. Get initial defense
    // 2. Apply freeze
    // 3. Verify defense reduced
    // 4. Wait for expiration
    // 5. Verify defense restored
  });
});
```

#### 1.9 Manual Test Checklist
```
[ ] Apply freeze to enemy creature
[ ] Verify ❄️ icon appears with duration 2
[ ] Verify defense stat decreases by 5
[ ] Try to use enemy's turn (should be blocked)
[ ] End turn twice
[ ] Verify freeze expires after 2 turns
[ ] Verify defense returns to normal
[ ] Verify console logs show correct behavior
```

---

## 🐌 Effect #2: SLOW

**Type**: Action Frequency Reduction  
**Duration**: 3 turns  
**Behavior**:
- Phase 1 (Application): Apply status, set skip counter
- Phase 2 (Tick): No tick effect (passive prevention)
- Creature skips every other turn
- Visual: 🐌 icon, slow motion animation

### Technical Specification

#### 2.1 Type Definition
```typescript
export type SlowEffectData = {
  skipFrequency: number  // Skip every N turns (2 = every other turn)
}
```

#### 2.2 Applicator Function
```typescript
const applySlowEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const { skipFrequency } = effect.data as SlowEffectData
  const creature = getCreatureFromContext(context, effect.targetId)

  const hasSlowStatus = creature.statuses.some(s => s.id === 'SLOW')

  if (hasSlowStatus) {
    console.log(`🐌 ${creature.name} remains slowed (passive effect)`)
    return {
      stateChanges: [],
      animations: []
    }
  } else {
    console.log(`🐌 Slowing ${creature.name} (skip every ${skipFrequency} turns for 3 turns)`)

    const statusChange: StateChange = {
      type: 'STATUS_APPLIED',
      creatureId: effect.targetId,
      timestamp: Date.now(),
      data: {
        statusId: 'SLOW',
        duration: 3,
        skipFrequency: skipFrequency,
        turnCounter: 0,  // Track turns to know when to skip
        source: 'slow'
      }
    }

    const animations: Animation[] = [
      { type: 'slow', targetId: effect.targetId, duration: 800 },
      { type: 'status-icon', targetId: effect.targetId, duration: 800, data: { status: 'SLOW' } }
    ]

    return {
      stateChanges: [statusChange],
      animations
    }
  }
}
```

#### 2.3 Factory & Registration
```typescript
export const buildSlowEffect = (
  targetId: number,
  skipFrequency: number = 2
): Effect => ({
  id: generateEffectId('slow'),
  type: 'SLOW',
  targetId,
  priority: 42,
  timestamp: Date.now(),
  data: { skipFrequency }
})

registerEffectApplicator('SLOW', applySlowEffect)
console.log('✅ SLOW applicator registered')
```

#### 2.4 Status Definitions
```typescript
// battleContext.ts
SLOW: {
  name: "Slow",
  type: "debuff",
  timing: "beforeAttack",
  duration: 3,
  effectFuncName: "applySlow",
  chance: 1,
  icon: "🐌",
  id: "SLOW",
  notes: "Skips turns periodically.",
},

// statuses.ts
SLOW: {
  name: "Slow",
  type: "debuff",
  timing: "beforeAttack",
  duration: 3,
  effectFuncName: "applySlow",
  chance: 1,
  icon: "🐌",
  id: "SLOW",
  notes: "Moves slowly, skips every other turn.",
},
```

---

## ⚔️ Effect #3: ATTACK_DEBUFF

**Type**: Stat Modification (Debuff)  
**Duration**: 3 turns  
**Behavior**:
- Phase 1 (Application): Apply status, reduce attack stat
- Phase 2 (Tick): No tick effect (passive stat mod)
- Reduces attack by specified amount
- Visual: ⚔️⬇️ icon

### Technical Specification

#### 3.1 Type Definition
```typescript
export type AttackDebuffEffectData = {
  attackReduction: number
}
```

#### 3.2 Applicator Function
```typescript
const applyAttackDebuffEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const { attackReduction } = effect.data as AttackDebuffEffectData
  const creature = getCreatureFromContext(context, effect.targetId)

  const hasDebuff = creature.statuses.some(s => s.id === 'ATTACK_DEBUFF')

  if (hasDebuff) {
    console.log(`⚔️⬇️ ${creature.name} attack remains reduced (passive effect)`)
    return {
      stateChanges: [],
      animations: []
    }
  } else {
    console.log(`⚔️⬇️ Weakening ${creature.name} (-${attackReduction} attack for 3 turns)`)

    const statChange: StateChange = {
      type: 'STAT_MODIFIED',
      creatureId: effect.targetId,
      timestamp: Date.now(),
      data: {
        stat: 'attack',
        delta: -attackReduction,
        source: 'attack-debuff'
      }
    }

    const statusChange: StateChange = {
      type: 'STATUS_APPLIED',
      creatureId: effect.targetId,
      timestamp: Date.now(),
      data: {
        statusId: 'ATTACK_DEBUFF',
        duration: 3,
        attackReduction: attackReduction,
        source: 'attack-debuff'
      }
    }

    const animations: Animation[] = [
      { type: 'debuff', targetId: effect.targetId, duration: 600 },
      { type: 'status-icon', targetId: effect.targetId, duration: 800, data: { status: 'ATTACK_DEBUFF' } }
    ]

    return {
      stateChanges: [statChange, statusChange],
      animations
    }
  }
}
```

#### 3.3 Factory & Registration
```typescript
export const buildAttackDebuffEffect = (
  targetId: number,
  attackReduction: number = 10
): Effect => ({
  id: generateEffectId('attack-debuff'),
  type: 'ATTACK_DEBUFF',
  targetId,
  priority: 35,
  timestamp: Date.now(),
  data: { attackReduction }
})

registerEffectApplicator('ATTACK_DEBUFF', applyAttackDebuffEffect)
console.log('✅ ATTACK_DEBUFF applicator registered')
```

---

## ✨ Effect #4: CLEANSE

**Type**: Utility (Debuff Removal)  
**Duration**: Instant  
**Behavior**:
- Removes all debuffs from target
- No duration (instant effect)
- Visual: ✨ sparkle animation

### Technical Specification

#### 4.1 Type Definition
```typescript
export type CleanseEffectData = {
  targetType: 'debuffs' | 'all'  // What to remove
}
```

#### 4.2 Applicator Function
```typescript
const applyCleanseEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const { targetType } = effect.data as CleanseEffectData
  const creature = getCreatureFromContext(context, effect.targetId)

  // Find all debuffs to remove
  const debuffsToRemove = creature.statuses.filter(s => {
    const statusDef = getStatusEffectById(s.id as any)
    return statusDef && statusDef.type === 'debuff'
  })

  console.log(`✨ Cleansing ${creature.name}: removing ${debuffsToRemove.length} debuffs`)

  // Create STATUS_REMOVED changes for each debuff
  const stateChanges: StateChange[] = debuffsToRemove.map(status => ({
    type: 'STATUS_REMOVED',
    creatureId: effect.targetId,
    timestamp: Date.now(),
    data: {
      statusId: status.id,
      source: 'cleanse'
    }
  }))

  const animations: Animation[] = [
    { type: 'cleanse', targetId: effect.targetId, duration: 1000 },
    { type: 'sparkle', targetId: effect.targetId, duration: 1500 }
  ]

  return {
    stateChanges,
    animations
  }
}
```

#### 4.3 Factory & Registration
```typescript
export const buildCleanseEffect = (
  targetId: number,
  targetType: 'debuffs' | 'all' = 'debuffs'
): Effect => ({
  id: generateEffectId('cleanse'),
  type: 'CLEANSE',
  targetId,
  priority: 80,  // High priority - cleanse before damage
  timestamp: Date.now(),
  data: { targetType }
})

registerEffectApplicator('CLEANSE', applyCleanseEffect)
console.log('✅ CLEANSE applicator registered')
```

**Note**: CLEANSE is instant and doesn't appear in STATUS_EFFECTS since it's not a persistent status.

---

## 🤐 Effect #5: SILENCE

**Type**: Ability Prevention  
**Duration**: 2 turns  
**Behavior**:
- Phase 1 (Application): Apply status, set silence flag
- Phase 2 (Tick): No tick effect (passive prevention)
- Prevents use of special abilities (only basic attacks allowed)
- Visual: 🤐 icon

### Technical Specification

#### 5.1 Type Definition
```typescript
export type SilenceEffectData = {
  // No additional data needed - just a flag
}
```

#### 5.2 Applicator Function
```typescript
const applySilenceEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const creature = getCreatureFromContext(context, effect.targetId)

  const hasSilence = creature.statuses.some(s => s.id === 'SILENCE')

  if (hasSilence) {
    console.log(`🤐 ${creature.name} remains silenced (passive effect)`)
    return {
      stateChanges: [],
      animations: []
    }
  } else {
    console.log(`🤐 Silencing ${creature.name} (cannot use abilities for 2 turns)`)

    const statusChange: StateChange = {
      type: 'STATUS_APPLIED',
      creatureId: effect.targetId,
      timestamp: Date.now(),
      data: {
        statusId: 'SILENCE',
        duration: 2,
        preventsAbilities: true,  // Flag for ability system to check
        source: 'silence'
      }
    }

    const animations: Animation[] = [
      { type: 'silence', targetId: effect.targetId, duration: 800 },
      { type: 'status-icon', targetId: effect.targetId, duration: 800, data: { status: 'SILENCE' } }
    ]

    return {
      stateChanges: [statusChange],
      animations
    }
  }
}
```

#### 5.3 Factory & Registration
```typescript
export const buildSilenceEffect = (
  targetId: number
): Effect => ({
  id: generateEffectId('silence'),
  type: 'SILENCE',
  targetId,
  priority: 45,
  timestamp: Date.now(),
  data: {}
})

registerEffectApplicator('SILENCE', applySilenceEffect)
console.log('✅ SILENCE applicator registered')
```

#### 5.4 Status Definitions
```typescript
// battleContext.ts
SILENCE: {
  name: "Silence",
  type: "debuff",
  timing: "beforeAttack",
  duration: 2,
  effectFuncName: "applySilence",
  chance: 1,
  icon: "🤐",
  id: "SILENCE",
  notes: "Cannot use special abilities.",
},

// statuses.ts
SILENCE: {
  name: "Silence",
  type: "debuff",
  timing: "beforeAttack",
  duration: 2,
  effectFuncName: "applySilence",
  chance: 1,
  icon: "🤐",
  id: "SILENCE",
  notes: "Can only use basic attacks.",
},
```

---

## 🧪 Testing Strategy

### Phase 1: Unit Tests (Per Effect)
```typescript
// Verify applicator exists
// Verify factory creates correct effect
// Verify two-phase pattern works
// Verify default values
```

### Phase 2: Integration Tests
```typescript
// Verify processEndOfTurn handles effect
// Verify duration decrements
// Verify status removed at 0
// Verify doesn't affect other effects
```

### Phase 3: E2E Tests
```typescript
// Apply effect via UI
// Verify visual appearance
// Verify behavior (damage/prevention/etc)
// Verify expiration
// Verify multiple effects don't conflict
```

### Regression Testing
After each new effect, run ALL existing E2E tests:
```bash
npm run test:e2e -- --grep "Turn System"
```

Verify:
- ✅ BURN still works
- ✅ POISON still works
- ✅ BLEED still works
- ✅ REGENERATION still works
- ✅ SHIELD still works

---

## 📊 Implementation Order & Timeline

### Week 1: FREEZE (2-3 hours)
```
Day 1: Implementation (1.5h)
  - Type definition (5min)
  - Applicator function (30min)
  - Factory function (10min)
  - processEndOfTurn (10min)
  - Status definitions (10min)
  - Registration (5min)

Day 1: Testing (1h)
  - Manual testing (30min)
  - E2E test writing (30min)

Day 2: Review & Commit (30min)
  - Code review
  - Regression testing
  - Git commit
```

### Week 2: SLOW (2-3 hours)
Same process as FREEZE

### Week 3: ATTACK_DEBUFF (1.5-2 hours)
Same process, but simpler (no action prevention logic)

### Week 4: CLEANSE (2-3 hours)
More complex - removes other statuses

### Week 5: SILENCE (2-3 hours)
Requires ability system integration

---

## 🚨 Risk Mitigation

### Risk: New effect breaks existing effects
**Mitigation**: 
- Run full test suite after each implementation
- Each effect is isolated in its own applicator
- No shared state between effects

### Risk: Action prevention doesn't work
**Mitigation**:
- Start with console.log flags
- Add checks in turn system
- Test manually before E2E

### Risk: Stat modifications don't revert
**Mitigation**:
- Track original values
- Apply inverse change on STATUS_REMOVED
- Add cleanup verification

### Risk: Performance degradation
**Mitigation**:
- Profile before/after
- Keep applicators simple
- No nested loops

---

## ✅ Definition of Done (Per Effect)

- [ ] Type definition added
- [ ] Applicator function written and tested
- [ ] Factory function created
- [ ] Applicator registered
- [ ] processEndOfTurn handler added (if needed)
- [ ] Status definition in battleContext.ts
- [ ] UI definition in statuses.ts
- [ ] Manual testing completed
- [ ] E2E test written and passing
- [ ] Regression tests passing (all existing effects work)
- [ ] Console logs show correct behavior
- [ ] Git commit with clear message
- [ ] Documentation updated

---

## 📚 Reference Files

### Files to Modify (Per Effect)
1. `src/utils/effectPipeline/effects/statusEffects.ts` - Type + Applicator + Registration
2. `src/utils/effectPipeline/factories.ts` - Factory function
3. `src/utils/effectPipeline/hooks/useBattleEngine.ts` - processEndOfTurn (if ticks)
4. `src/utils/effectPipeline/battleContext.ts` - Status definition
5. `src/consts/statuses.ts` - UI definition
6. `tests/e2e/turn-system.spec.ts` - E2E tests

### Reference Implementations
- **DoT Pattern**: See BURN, POISON, BLEED
- **HoT Pattern**: See REGENERATION
- **Stat Mod Pattern**: See ATTACK_BUFF, DEFENSE_BUFF
- **Action Prevention**: See STUN
- **Passive Effect**: See SHIELD

---

## 🎯 Success Criteria

### Per Effect
- ✅ Applicator follows two-phase pattern
- ✅ Factory creates valid effect objects
- ✅ Status appears in UI with correct icon
- ✅ Duration decrements properly
- ✅ Effect expires and removes correctly
- ✅ No console errors
- ✅ E2E test passes
- ✅ Doesn't break existing effects

### Overall Project
- ✅ 5 new effects fully implemented
- ✅ All existing effects still work
- ✅ 20+ new E2E tests passing
- ✅ Code coverage maintained
- ✅ Performance unchanged
- ✅ Documentation complete

---

## 🔄 Iteration Process

For each effect:

1. **Plan** (30min)
   - Review this spec
   - Identify unique challenges
   - Sketch applicator logic

2. **Implement** (1-2h)
   - Follow 7-step checklist
   - Write defensive code (defaults)
   - Add console.log debugging

3. **Test Manually** (30min)
   - Apply effect in UI
   - Verify console logs
   - Test edge cases

4. **Write E2E Test** (30min)
   - Cover happy path
   - Test duration/expiration
   - Test visual appearance

5. **Regression Test** (15min)
   - Run full suite
   - Fix any breaks
   - Verify isolation

6. **Commit & Document** (15min)
   - Atomic git commit
   - Update this doc with ✅
   - Note any learnings

---

## 📝 Status Tracking

### FREEZE ❄️
- [x] Planning complete
- [x] Implementation complete
- [x] Type definition added
- [x] Applicator function created
- [x] Factory function created
- [x] Registered in effect system
- [x] Added to processEndOfTurn
- [x] Status definitions added (both files)
- [ ] Manual testing complete
- [ ] E2E tests complete
- [ ] Regression tests passing
- [ ] Committed to Git

### SLOW 🐌
- [ ] Planning complete
- [ ] Implementation complete
- [ ] Manual testing complete
- [ ] E2E tests complete
- [ ] Regression tests passing
- [ ] Committed to Git

### ATTACK_DEBUFF ⚔️⬇️
- [ ] Planning complete
- [ ] Implementation complete
- [ ] Manual testing complete
- [ ] E2E tests complete
- [ ] Regression tests passing
- [ ] Committed to Git

### CLEANSE ✨
- [ ] Planning complete
- [ ] Implementation complete
- [ ] Manual testing complete
- [ ] E2E tests complete
- [ ] Regression tests passing
- [ ] Committed to Git

### SILENCE 🤐
- [ ] Planning complete
- [ ] Implementation complete
- [ ] Manual testing complete
- [ ] E2E tests complete
- [ ] Regression tests passing
- [ ] Committed to Git

---

## 🎓 Lessons Learned

(Fill out as implementation progresses)

### What Went Well
- 

### Challenges Encountered
- 

### Code Patterns That Worked
- 

### Things to Improve
- 

---

## 📞 Next Steps

1. **Review this document** - Ensure all team members understand the plan
2. **Start with FREEZE** - It's the most complex, good learning case
3. **Follow the checklist** - Don't skip steps
4. **Commit atomically** - One effect per commit
5. **Test thoroughly** - Regression suite after each effect

**Ready to begin?** Start with FREEZE implementation using the spec above. ❄️
