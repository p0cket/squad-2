# Burn Tick Damage - Debug Findings

**Date:** October 19, 2025  
**Issue:** Burn status applies correctly but doesn't deal damage on turn end  
**Test Status:** 4/7 passing, burn tick damage test failing

---

## 🔍 Investigation Summary

### What Works ✅
1. Burn status applies from attack (STATUS_APPLIED)
2. Burn duration decrements on turn end (3→2→1)
3. Burn badge displays correctly
4. Turn counter increments
5. Turn owner switches

### What Doesn't Work ❌
1. **Burn tick damage NOT being dealt** (health stays at 23 instead of decreasing to 18)
2. Burn doesn't expire/remove at duration 0

---

## 🧩 Code Flow Analysis

### Turn End Process (useBattleEngine.ts lines 145-217)

```typescript
processEndOfTurn():
1. Gather all creatures from context.state
2. For each creature with BURN status:
   - Create BURN effect: createBurnEffect(creature.ID, undefined)
3. Apply each effect: await applyEffect(eff)
   - This calls: processEffectChain(effect, contextRef.current)
4. Decrement durations (separate batch update)
```

### BURN Effect Creation (statusEffects.ts line 315)

```typescript
createBurnEffect(targetId, damage = 5) → {
  id: 'burn',
  type: 'BURN',  // ← Must match registered applicator
  targetId,
  priority: 10,
  data: { damage: 5 }
}
```

### BURN Applicator (statusEffects.ts lines 41-90)

```typescript
applyBurnEffect(effect, context):
1. Extract damage from effect.data (default 5)
2. Get creature from context
3. Calculate actualDamage (min of damage and creature.health)
4. Create HEALTH_CHANGE state change:
   {
     type: 'HEALTH_CHANGE',
     creatureId: effect.targetId,
     data: {
       delta: -actualDamage,
       newHealth: creature.health - actualDamage,
       source: 'burn'
     }
   }
5. Return { stateChanges: [healthChange], animations: [...] }
```

### Effect Pipeline (effectPipelineEngine.ts lines 24-130)

```typescript
processEffectChain(initialEffect, context):
1. Check if pipeline is busy (queue if so)
2. Execute effect pipeline:
   a. Get applicator for effect.type ('BURN')
   b. Call applicator → returns { stateChanges, animations }
   c. Apply state changes: applyChangesToContext(context, stateChanges, { deferNotification: true })
   d. Execute animations
   e. Notify UI subscribers AFTER animations appear
   f. Check for triggered effects
```

### Applicator Registration (statusEffects.ts lines 300-308)

```typescript
// Module execution (runs when file is imported)
registerEffectApplicator('BURN', applyBurnEffect)
registerEffectApplicator('POISON', applyPoisonEffect)
registerEffectApplicator('REGENERATION', applyRegenerationEffect)
```

---

## 🎯 Hypotheses Tested

### ❌ Hypothesis 1: BURN applicator not creating HEALTH_CHANGE
- **Status:** Debunked
- **Evidence:** Code review shows HEALTH_CHANGE is created correctly (line 63-71)

### ❌ Hypothesis 2: State changes not applied to Zustand
- **Status:** Debunked
- **Evidence:** `applyChangesToContext` DOES update `context.state` even with `deferNotification: true`

### ❌ Hypothesis 3: Duration changes overwriting health
- **Status:** Debunked
- **Evidence:** Duration changes only modify status.duration, not creature.health

### ❌ Hypothesis 4: Effect type mismatch
- **Status:** Debunked
- **Evidence:** `createBurnEffect` returns `type: 'BURN'`, applicator registered as `'BURN'`

### 🔄 Hypothesis 5: BURN applicator not being registered (TESTING)
- **Status:** TESTING
- **Evidence:** Added console.logs to registration code to verify
- **Next Step:** Check browser console for:
  - "🔧 Registering status effect applicators..."
  - "✅ BURN applicator registered"
  - "🚨🚨🚨 BURN APPLICATOR CALLED! 🚨🚨🚨" (when turn ends)

---

## 🔬 Diagnostic Logging Added

### statusEffects.ts

```typescript
// Line 302
console.log('🔧 Registering status effect applicators...')
registerEffectApplicator('BURN', applyBurnEffect)
console.log('✅ BURN applicator registered')

// Line 43 (in applyBurnEffect)
console.log('🚨🚨🚨 BURN APPLICATOR CALLED! 🚨🚨🚨')
console.group(`🔥 APPLY BURN EFFECT`)
console.log('Effect:', effect)
console.log('Effect type:', effect.type)
console.log('Effect data:', effect.data)
console.log(`🔥 BURN DAMAGE VALUE: ${damage}`)
console.log(`💥 Damage calculation: ${damage} → ${actualDamage}`)
console.log(`❤️ Health: ${creature.health} → ${newHealth}`)
console.log(`📉 Health delta: -${actualDamage}`)
console.log('📝 Creating HEALTH_CHANGE:', healthChange)
console.log('📤 Returning state changes:', [healthChange])
```

### turn-system.spec.ts

```typescript
// Added browser console capture
page.on('console', msg => {
  if (text.includes('BURN') || text.includes('🔥') || text.includes('HEALTH_CHANGE')) {
    console.log(`[BROWSER] ${text}`);
  }
});
```

---

## 🎲 Possible Root Causes

### Most Likely
1. **Applicator not registered** - Module execution not running registration code
2. **Effect not reaching applicator** - Pipeline routing issue
3. **Exception swallowed** - Try-catch in processEndOfTurn catching errors silently

### Less Likely
4. **Context stale** - `contextRef.current` not pointing to updated state
5. **Type string mismatch** - Whitespace or case sensitivity issue
6. **Applicator registry cleared** - Something resetting the registry

---

## 🔧 Next Steps

### Immediate Actions
1. **Open browser at http://localhost:3000**
2. **Check browser console for:**
   - Registration logs ("✅ BURN applicator registered")
   - Applicator call logs ("🚨🚨🚨 BURN APPLICATOR CALLED!")
   - Any error messages

### If Applicator IS Called
- Health change IS being created
- Issue is in Zustand adapter or state application
- Check `applyHealthChange` in zustandAdapter.ts

### If Applicator NOT Called
- Registration failed OR
- Effect not reaching applicator (routing issue)
- Check effectApplicatorRegistry.ts
- Verify applicator lookup logic

### If Registration Logs Missing
- Module not being executed
- Import statement not triggering registration
- Need to force import in index.ts or useBattleEngine.ts

---

## 📊 Test Results

```
✅ should apply burn status and show duration badge
✅ should decrement burn duration on turn end
❌ should tick burn damage on turn end (FAILING)
   Expected: health < 23
   Received: health = 23
   
❌ should remove burn when duration reaches 0 (FAILING)
✅ should increment turn counter on End Turn
✅ should switch turn owner on End Turn
❌ should handle burn status across multiple turns (FAILING)
```

**Pass Rate:** 4/7 (57%)

---

## 🚨 Critical Question

**Is the BURN applicator being called at all?**

Check browser console for:
```
🚨🚨🚨 BURN APPLICATOR CALLED! 🚨🚨🚨
```

- **If YES:** Issue is in state application or Zustand adapter
- **If NO:** Issue is in effect registration or pipeline routing

---

**Status:** Awaiting browser console inspection  
**Next Action:** Check console logs to determine if applicator is being called
