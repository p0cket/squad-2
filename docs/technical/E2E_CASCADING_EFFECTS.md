# E2E Testing: Cascading Effects & Pipeline Timing

**Last Updated:** October 19, 2025  
**Status:** ⚠️ Critical for complex effect testing

---

## 🎯 The Core Problem

**Tests fail when they read the DOM while effects are still cascading.**

### What is a Cascading Effect?

An effect that triggers another effect, which may trigger another effect:

```typescript
// Simple effect - predictable timing
Attack deals damage → DONE (1 effect)

// Cascading effect - unpredictable timing  
Attack deals damage 
  → applies POISON
    → Plague Rat's Outbreak triggers (ON_STATUS_APPLIED)
      → 25% chance to spread to adjacent enemies
        → applies POISON to enemy A
          → Another Plague Rat might trigger Outbreak
            → spreads to enemy B
              → ... (recursive)
```

**The problem**: You can't know in advance:
- How many effects will fire
- How deep the recursion will go
- How long animations will take
- When React will finish re-rendering

---

## ⚠️ Common Failure Scenarios

### Scenario 1: Outbreak Chain
```typescript
test('poison spreads via Outbreak', async ({ page }) => {
  await attackButton.click();
  await page.waitForTimeout(3000); // ← Might be too short!
  
  const poisonCount = await page.locator('[data-status="POISON"]').count();
  expect(poisonCount).toBe(3); // ❌ Sees 1 - still spreading!
});
```

**Why it fails**: Outbreak triggers recursively, 3000ms isn't enough for the full chain.

### Scenario 2: Multi-Turn Status Effects
```typescript
test('burn ticks for 3 turns', async ({ page }) => {
  // Apply burn with 3 duration
  await fireballButton.click();
  await page.waitForTimeout(2000);
  
  // Turn 1
  await endTurnButton.click();
  await page.waitForTimeout(3000); // ← Burn ticks
  
  // Turn 2  
  await endTurnButton.click();
  await page.waitForTimeout(3000); // ← Burn ticks again
  
  // Turn 3
  await endTurnButton.click();
  await page.waitForTimeout(3000); // ← Burn ticks + expires
  
  const burnBadge = await page.locator('[data-status="BURN"]');
  await expect(burnBadge).toHaveCount(0); // ❌ Still visible!
});
```

**Why it fails**: Multiple effects processing, animations queuing, React batching updates.

### Scenario 3: Chain Reactions
```typescript
test('damage triggers passive which triggers effect', async ({ page }) => {
  // Creature has "Retaliate" passive: ON_DAMAGE_TAKEN → deal damage back
  await attackButton.click();
  await page.waitForTimeout(2000);
  
  const playerHealth = await getCreatureHealth(page, 'Dragon');
  expect(playerHealth).toBe(17); // ❌ Still 20 - Retaliate hasn't processed!
});
```

**Why it fails**: Chain: Attack → Damage → ON_DAMAGE_TAKEN trigger → Retaliate → Damage back → React update

---

## ✅ Current Solution: Generous Fixed Timeouts

```typescript
// Wait Time Guidelines
const WAIT_TIMES = {
  SIMPLE_CLICK: 1000,      // Button animation only
  SIMPLE_ATTACK: 2000,     // Single effect, no triggers
  ATTACK_WITH_STATUS: 2500, // Apply status effect
  END_TURN: 3000,          // Status ticks (burn, poison, regen)
  CASCADING_EFFECT: 5000,  // Outbreak, chain reactions
  COMPLEX_MULTI_EFFECT: 7000 // Multiple cascading chains
};

// Example usage
test('outbreak spreads poison', async ({ page }) => {
  await attackButton.click();
  await page.waitForTimeout(WAIT_TIMES.CASCADING_EFFECT); // 5000ms
  
  // Now safe to assert
  const poisonCount = await page.locator('[data-status="POISON"]').count();
  expect(poisonCount).toBeGreaterThanOrEqual(2);
});
```

### How to Calculate Wait Time

**Formula**: Base time + (Effect count × 500ms) + (Recursion depth × 1000ms) + Buffer (1000ms)

**Examples**:

```typescript
// Simple burn tick
// 1 effect, no recursion, 1 animation
// = 2000 + (1 × 500) + (0 × 1000) + 1000 = 3500ms → Round to 3000ms

// Outbreak with 2 spreads
// 1 initial poison + 2 Outbreak triggers + 2 poison applications
// = 2000 + (5 × 500) + (1 × 1000) + 1000 = 6500ms → Round to 7000ms

// Multi-status turn end (burn + poison + regen)
// 3 effects, no recursion
// = 2000 + (3 × 500) + (0 × 1000) + 1000 = 4500ms → Round to 5000ms
```

---

## 🚀 Future Solution: Pipeline State Detection

Instead of guessing with fixed timeouts, **wait for the pipeline to be actually idle**.

### Implementation Plan

```typescript
// 1. Add pipeline state tracking to effectPipelineEngine.ts
export const pipelineState = {
  isProcessing: false,
  activeEffects: 0,
  queuedTriggers: 0,
  animationQueueLength: 0,
  cascadeDepth: 0
};

// 2. Update state during processing
export function processEffectChain(context, effects, depth = 0) {
  pipelineState.isProcessing = true;
  pipelineState.activeEffects = effects.length;
  pipelineState.cascadeDepth = depth;
  
  // Process effects...
  
  // Check for triggered effects
  const triggeredEffects = evaluateTriggeredPassives(context);
  if (triggeredEffects.length > 0) {
    pipelineState.queuedTriggers = triggeredEffects.length;
    processEffectChain(context, triggeredEffects, depth + 1); // Recursive
  }
  
  pipelineState.isProcessing = false;
  pipelineState.activeEffects = 0;
  pipelineState.queuedTriggers = 0;
  pipelineState.cascadeDepth = 0;
}

// 3. Expose to window in dev mode
if (process.env.NODE_ENV === 'development') {
  window.__PIPELINE_STATE__ = pipelineState;
}
```

### Test Helper

```typescript
// tests/helpers/waitForIdle.ts
export async function waitForPipelineIdle(page, options = {}) {
  const { timeout = 10000, maxCascadeDepth = 10 } = options;
  
  // Wait for pipeline to be completely idle
  await page.waitForFunction(
    () => {
      const state = window.__PIPELINE_STATE__;
      if (!state) return true; // Pipeline not instrumented, assume idle
      
      return !state.isProcessing && 
             state.activeEffects === 0 && 
             state.queuedTriggers === 0 &&
             state.animationQueueLength === 0 &&
             state.cascadeDepth === 0;
    },
    { timeout }
  );
  
  // Small buffer for React re-render
  await page.waitForTimeout(500);
}

export async function waitForCascadeComplete(page, options = {}) {
  const { timeout = 15000, verbose = false } = options;
  
  let iterations = 0;
  const maxIterations = 50;
  
  while (iterations < maxIterations) {
    const state = await page.evaluate(() => window.__PIPELINE_STATE__);
    
    if (verbose) {
      console.log(`[Cascade Check ${iterations}]`, state);
    }
    
    if (!state?.isProcessing && 
        state?.cascadeDepth === 0 && 
        state?.queuedTriggers === 0) {
      break; // Pipeline idle!
    }
    
    await page.waitForTimeout(100);
    iterations++;
  }
  
  if (iterations >= maxIterations) {
    throw new Error(`Pipeline still active after ${maxIterations * 100}ms`);
  }
  
  // React buffer
  await page.waitForTimeout(500);
}
```

### Usage in Tests

```typescript
import { waitForPipelineIdle, waitForCascadeComplete } from './helpers/waitForIdle';

test('outbreak spreads poison - smart waiting', async ({ page }) => {
  await attackButton.click();
  
  // ✅ Automatically waits for ANY complexity!
  await waitForPipelineIdle(page);
  
  // Now safe to assert - pipeline is TRULY idle
  const poisonCount = await page.locator('[data-status="POISON"]').count();
  expect(poisonCount).toBeGreaterThanOrEqual(2);
});

test('complex chain reaction - verbose debugging', async ({ page }) => {
  await attackButton.click();
  
  // ✅ Shows cascade depth and active effects as they process
  await waitForCascadeComplete(page, { verbose: true });
  
  // Logs:
  // [Cascade Check 0] {isProcessing: true, cascadeDepth: 0, activeEffects: 1}
  // [Cascade Check 1] {isProcessing: true, cascadeDepth: 1, activeEffects: 2}
  // [Cascade Check 2] {isProcessing: true, cascadeDepth: 2, activeEffects: 1}
  // [Cascade Check 3] {isProcessing: false, cascadeDepth: 0, activeEffects: 0}
  
  const finalHealth = await getCreatureHealth(page, 'Goblin');
  expect(finalHealth).toBe(5);
});
```

---

## 🎓 Understanding Cascade Depth

```typescript
// Depth 0: Initial action
processAttack(Poison Attack)

  // Depth 1: Direct trigger
  → Outbreak detects poison (ON_STATUS_APPLIED)
    → Spreads to Enemy A
    
      // Depth 2: Cascading trigger  
      → Another Outbreak detects poison on Enemy A
        → Spreads to Enemy B
        
          // Depth 3: Further cascade
          → Third Outbreak detects poison on Enemy B
            → Spreads to Enemy C
            
              // Depth 4: ...
              → And so on (with protection against infinite loops)
```

**Max safe depth**: 10 (hardcoded limit to prevent infinite loops)

**Typical depths**:
- Burn/Poison tick: Depth 0 (no cascade)
- Single Outbreak: Depth 1 (direct trigger)
- Chain Outbreaks: Depth 2-4 (cascading)
- Complex combos: Depth 5+ (multiple passives interacting)

---

## 📋 Testing Checklist

When writing tests for effects, ask:

- [ ] Does this effect trigger on damage? (Add +500ms per trigger)
- [ ] Can this effect cascade? (Add +1000ms per cascade level)
- [ ] Are there animations? (Add +500ms per animation)
- [ ] Do multiple creatures update? (Add +200ms per creature)
- [ ] Is this during turn end? (Multiple status effects = +2000ms)
- [ ] Could this create a chain reaction? (Use CASCADING_EFFECT timeout)

**If any box checked**: Use generous timeout or implement pipeline state detection.

---

## 🐛 Debugging Cascade Issues

### Symptom: Test sees partial results

```typescript
// Test expects 3 poisoned creatures, sees only 1
const poisonCount = await page.locator('[data-status="POISON"]').count();
expect(poisonCount).toBe(3); // ❌ Actual: 1
```

**Cause**: Outbreak still spreading, test read DOM mid-cascade.

**Fix**: Increase wait time or implement smart waiting.

### Symptom: Test hangs/times out

```typescript
// Test never completes
await waitForPipelineIdle(page); // ⏱️ Hangs forever
```

**Cause**: Pipeline stuck in infinite loop (Outbreak triggering itself).

**Fix**: Check for infinite loop protection in effect logic:

```typescript
// In outbreak applicator
if (context.processingStack?.includes('OUTBREAK')) {
  return []; // Prevent recursive Outbreak
}
```

### Symptom: Intermittent failures

```typescript
// Sometimes passes, sometimes fails
await page.waitForTimeout(3000);
const health = await getCreatureHealth(page, 'Goblin');
expect(health).toBe(15); // 🎲 50/50 success rate
```

**Cause**: Cascade timing varies (25% Outbreak chance = random cascade depth).

**Fix**: Use longer timeout or smart waiting:

```typescript
// Instead of fixed timeout
await waitForCascadeComplete(page);

// OR increase timeout to cover worst case
await page.waitForTimeout(7000); // Covers up to depth 5
```

---

## 📝 Summary

**The Problem**: Cascading effects make timing unpredictable.

**Current Solution**: Use generous fixed timeouts (5000-7000ms for cascades).

**Better Solution**: Implement pipeline state exposure to detect "actually idle".

**Key Insight**: Don't guess timing - wait for the pipeline to tell you it's done!

**Migration Path**:
1. ✅ Document which effects cascade (this file)
2. ✅ Use generous timeouts for now (5000ms+)
3. 🎯 Implement pipeline state tracking (future)
4. 🎯 Replace fixed timeouts with smart waiting (future)
5. 🎯 Tests become faster AND more reliable (future)

---

**Author:** Battle Engine Team  
**Status:** 📋 Planning document for future improvements  
**Related:** E2E_TIMING_BEST_PRACTICES.md, E2E_TESTING_GUIDE.md
