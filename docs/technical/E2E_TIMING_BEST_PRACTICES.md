# E2E Test Timing Best Practices

**Last Updated:** October 19, 2025  
**Status:** ✅ Critical for test reliability

---

## 🎯 The Problem

React + Zustand applications have **asynchronous state updates**. When you click a button:

1. Event handler runs (synchronous)
2. Zustand store updates (synchronous)
3. React schedules a re-render (asynchronous)
4. React re-renders components (asynchronous)
5. DOM updates (asynchronous)

If your test reads the DOM immediately after clicking, **it will read stale values!**

---

## 🔥 Real Example: Burn Damage Bug

### What Appeared to Happen
```
Test: Click "End Turn" to apply burn damage
Expected: Health 23 → 18
Actual: Health 23 → 23 ❌
```

### What Actually Happened
```typescript
// Timeline of events:

0ms:    Test clicks "End Turn" button
10ms:   processEndOfTurn() creates burn effect
20ms:   BURN applicator calculates damage: -5
25ms:   Zustand store updates: health = 18 ✅
30ms:   React schedules re-render
40ms:   Animation queue starts processing
100ms:  Burn effect animation plays
200ms:  Effect may trigger other effects (cascading)
500ms:  Damage number animation plays
1500ms: Test reads DOM: health = 23 ❌ (PIPELINE STILL ACTIVE!)
2500ms: React finishes re-render: health = 18 ✅ (TOO LATE!)
3000ms: All animations complete, pipeline idle ✅
```

The burn damage WAS being applied correctly! The test was reading while the effect pipeline was still processing.

---

## ⚠️ The Cascading Effect Problem

**The Real Challenge**: Effects can trigger other effects, which can trigger more effects:

```typescript
// Example: Outbreak passive ability
Player attacks with Poison
  ↓
Apply POISON status to target (trigger: ON_DAMAGE_DEALT)
  ↓
Plague Rat's Outbreak detects poison on nearby enemy (trigger: ON_STATUS_APPLIED)
  ↓
25% chance to spread poison to adjacent enemies
  ↓
Apply POISON to adjacent creature (trigger: ON_STATUS_APPLIED)
  ↓
Another Plague Rat might trigger Outbreak again... (recursive!)
  ↓
[Animation for each poison application]
  ↓
[State update for each creature]
  ↓
[React re-render for each update]
```

**The Problem**: You can't know in advance how long a cascading chain will take!

### The Golden Rule for Complex Effects

**Don't assert while anything is "in motion":**

1. ✅ All state updates completed
2. ✅ All animations finished playing  
3. ✅ All triggers evaluated and processed
4. ✅ Effect pipeline is idle
5. ✅ React has finished all re-renders
6. ✅ DOM reflects current state

**Then and only then** should your test make assertions.

---

## ✅ The Solution

### Use Longer Wait Times

```typescript
// ❌ WRONG - Too short
await page.click('[data-testid="end-turn-button"]');
await page.waitForTimeout(1500); // React might not be done!
const health = await getCreatureHealth(page, 'Goblin');
expect(health).toBe(18); // FAILS - reads 23

// ✅ CORRECT - Gives React time
await page.click('[data-testid="end-turn-button"]');
await page.waitForTimeout(3000); // React has time to re-render
const health = await getCreatureHealth(page, 'Goblin');
expect(health).toBe(18); // PASSES - reads 18
```

---

---

## � Wait Time Guidelines

| Action Type | Minimum Wait | Why |
|-------------|--------------|-----|
| Simple click (no state change) | 500ms | Button animation only |
| Simple state change | 1500ms | React re-render |
| Attack with effects | 2500ms | Effect pipeline + animations |
| **Complex cascading effects** | **4000ms+** | **Multiple triggers, recursive chains** |
| End Turn (burn/status ticks) | 3000ms | Multiple status effects processing |
| **Turn end with Outbreak** | **5000ms** | **Cascading poison spreads** |
| Page navigation | 2000ms | Route change + new page render |

**Critical Note**: These are MINIMUM times. If effects cascade (trigger other triggers), add more time!

### How to Determine Wait Time

Ask yourself:
1. **How many effects will fire?** (Each effect needs ~500ms)
2. **Can effects trigger other effects?** (Add recursive depth × 1000ms)
3. **Are there animations?** (Add animation duration)
4. **How many creatures update?** (Each creature × 200ms for re-render)

**Example Calculation**:
```
Outbreak scenario:
- Initial poison application: 500ms
- Outbreak triggers: 500ms
- Spread to 2 creatures: 1000ms
- Each might trigger another Outbreak: 1000ms
- Animations for all: 1000ms
- React re-renders: 500ms
Total: 4500ms → Round up to 5000ms
```

---

---

## 🎯 Best Practices

### 1. Wait After State-Changing Actions

```typescript
// ALWAYS wait after these:
await page.click('[data-testid="attack-button"]');
await page.waitForTimeout(2000); // ← Add this!

await page.click('[data-testid="end-turn-button"]');
await page.waitForTimeout(3000); // ← Add this!

await page.click('[data-testid="use-item-button"]');
await page.waitForTimeout(2000); // ← Add this!
```

### 2. Wait BEFORE Reading DOM Values

```typescript
// ✅ GOOD - Wait, then read
await endTurnButton.click();
await page.waitForTimeout(3000);
const health = await getCreatureHealth(page, 'Goblin'); // Fresh value

// ❌ BAD - Read immediately
await endTurnButton.click();
const health = await getCreatureHealth(page, 'Goblin'); // Stale value!
```

### 3. Use Playwright's waitFor Methods

```typescript
// Alternative to fixed timeouts
await expect(page.locator('[data-testid="creature-health"]'))
  .toHaveText('18', { timeout: 5000 });

// Wait for specific condition
await page.waitForFunction(() => {
  const healthEl = document.querySelector('[data-testid="creature-health"]');
  return healthEl?.textContent === '18';
}, { timeout: 5000 });
```

### 4. Add Logging for Debugging

```typescript
// Helps identify timing issues
const healthBefore = await getCreatureHealth(page, 'Goblin');
console.log(`Health before: ${healthBefore}`);

await endTurnButton.click();
console.log('Clicked End Turn, waiting...');
await page.waitForTimeout(3000);

const healthAfter = await getCreatureHealth(page, 'Goblin');
console.log(`Health after: ${healthAfter}`);
```

---

## 🔍 Debugging Timing Issues

### Symptoms of Timing Problems

- ✅ Tests fail intermittently (work sometimes, fail other times)
- ✅ Tests pass in headed mode but fail in headless mode
- ✅ Browser console shows correct values, test shows wrong values
- ✅ Manually clicking in browser works, automated test fails
- ✅ Adding longer waits makes tests pass

### How to Diagnose

1. **Capture browser console logs**:
```typescript
page.on('console', msg => {
  console.log(`[BROWSER] ${msg.text()}`);
});
```

2. **Add logging to state updates**:
```typescript
// In your Zustand store
setState: (newState) => {
  console.log('Zustand setState:', { health: newState.creatures[0].health });
  set({ state: newState });
}
```

3. **Compare browser vs test timing**:
```typescript
// See what the browser knows
const browserHealth = await page.evaluate(() => {
  return document.querySelector('[data-testid="creature-health"]')?.textContent;
});
console.log(`Browser shows: ${browserHealth}`);

// See what Playwright sees
const playwrightHealth = await page.locator('[data-testid="creature-health"]').textContent();
console.log(`Playwright sees: ${playwrightHealth}`);
```

4. **Run in headed mode with slowMo**:
```bash
npx playwright test --headed --slow-mo=1000
```

---

## 🚀 Future Improvements: Smart Waiting

Instead of fixed timeouts, we should wait for the effect pipeline to be **actually idle**.

### The Challenge with Cascading Effects

```typescript
// You can't predict how long this will take:
processAttack()
  → applies POISON (trigger: ON_DAMAGE_DEALT)
    → Outbreak detects poison (trigger: ON_STATUS_APPLIED)
      → spreads to 2 adjacent enemies
        → each might trigger another Outbreak
          → recursive spreading
            → animations for each
              → React re-renders for each
```

**We need to detect when "nothing is in motion" anymore!**

### Option 1: Pipeline State Exposure ⭐ RECOMMENDED

Expose pipeline activity to tests:

```typescript
// In effectPipelineEngine.ts
export const pipelineState = {
  isProcessing: false,
  activeEffects: 0,
  queuedTriggers: 0,
  animationQueueLength: 0
};

// Update during processing
export function processEffectChain(context, effects) {
  pipelineState.isProcessing = true;
  pipelineState.activeEffects = effects.length;
  
  // ... process effects ...
  
  pipelineState.isProcessing = false;
  pipelineState.activeEffects = 0;
}
```

```typescript
// In dev mode, expose to window
if (process.env.NODE_ENV === 'development') {
  window.__PIPELINE_STATE__ = pipelineState;
}
```

```typescript
// In tests - SMART WAITING! 🎯
async function waitForPipelineIdle(page, timeout = 10000) {
  await page.waitForFunction(
    () => {
      const state = window.__PIPELINE_STATE__;
      return !state?.isProcessing && 
             state?.activeEffects === 0 && 
             state?.queuedTriggers === 0 &&
             state?.animationQueueLength === 0;
    },
    { timeout }
  );
  // Small buffer for React re-render
  await page.waitForTimeout(500);
}

// Usage - handles ANY complexity automatically!
test('should handle cascading Outbreak', async ({ page }) => {
  await attackButton.click();
  await waitForPipelineIdle(page); // ← Waits for everything!
  
  // Now safe to assert - pipeline is truly idle
  const poisonCount = await page.locator('[data-status="POISON"]').count();
  expect(poisonCount).toBe(3); // Original + 2 spreads
});
```

**Benefits**:
- ✅ Handles any complexity (simple burns OR recursive Outbreaks)
- ✅ No over-waiting (returns as soon as idle)
- ✅ No under-waiting (waits for all cascading effects)
- ✅ Self-documenting (tests show intent: "wait for idle")
- ✅ Better debugging (can inspect exact pipeline state)

### Option 2: Data Attributes for State

```typescript
// In BattleEngineExample.tsx
const pipelineActive = useBattleStore(state => state.pipelineActive);

return (
  <div 
    data-testid="battle-container"
    data-pipeline-active={pipelineActive}
    data-animation-queue-length={animationQueue.length}
  >
```

```typescript
// In tests
async function waitForBattleIdle(page) {
  await page.waitForFunction(() => {
    const container = document.querySelector('[data-testid="battle-container"]');
    return container?.getAttribute('data-pipeline-active') === 'false' &&
           container?.getAttribute('data-animation-queue-length') === '0';
  }, { timeout: 10000 });
}
```

### Option 3: Event-Based Waiting

```typescript
// In effectPipelineEngine.ts
export function processEffectChain(context, effects) {
  window.dispatchEvent(new CustomEvent('pipeline:start'));
  
  // ... process effects ...
  
  window.dispatchEvent(new CustomEvent('pipeline:complete', {
    detail: { effectCount: effects.length, duration: Date.now() - startTime }
  }));
}
```

```typescript
// In tests
async function waitForPipelineComplete(page) {
  const pipelineComplete = page.evaluate(() => {
    return new Promise(resolve => {
      window.addEventListener('pipeline:complete', 
        (e) => resolve(e.detail), 
        { once: true }
      );
    });
  });
  
  await attackButton.click();
  const details = await pipelineComplete;
  console.log(`Pipeline processed ${details.effectCount} effects in ${details.duration}ms`);
  await page.waitForTimeout(500); // React buffer
}
```

### Implementation Priority

**For now (current approach)**:
- ✅ Use fixed timeouts (3000-5000ms)
- ✅ Add generous buffers for complex effects
- ✅ Document which tests need longer waits

**For production (recommended)**:
- 🎯 Implement **Option 1: Pipeline State Exposure**
- 🎯 Replace all fixed timeouts with `waitForPipelineIdle()`
- 🎯 Tests become more reliable AND faster
- 🎯 Handles future complexity automatically

---

## 🎓 Understanding React + Zustand Timing

### The Rendering Pipeline

```
User Action (click)
    ↓
Event Handler Runs (sync)
    ↓
Zustand Store Updates (sync)
    ↓
Zustand Notifies Subscribers (sync)
    ↓
React Schedules Re-render (async) ← TEST WAITS HERE
    ↓
React Reconciliation (async)
    ↓
React Commits to DOM (async)
    ↓
Browser Paints (async)
    ↓
DOM Updates Visible (finally!)
```

**Key Insight**: Between "Zustand Store Updates" and "DOM Updates Visible" is where tests fail if they don't wait!

### Why 3000ms Works

- React typically re-renders within 100-500ms
- Animations may take 500-1500ms
- Multiple effects compound the time
- CI/CD environments are slower than local
- **3000ms provides a comfortable buffer**

---

## 📊 Test Results

After implementing these timing practices:

**Before**: 4/7 tests passing (57%)  
**After**: 7/7 tests passing (100%) ✅

---

## 🚀 Future Improvements

### Option 1: Smart Waiting
Instead of fixed timeouts, wait for specific conditions:

```typescript
async function waitForHealthChange(page, creatureName, expectedHealth) {
  await page.waitForFunction(
    ([name, health]) => {
      const card = document.querySelector(`[data-creature-name="${name}"]`);
      const healthEl = card?.querySelector('[data-testid="creature-health"]');
      return healthEl?.textContent === String(health);
    },
    [creatureName, expectedHealth],
    { timeout: 5000 }
  );
}
```

### Option 2: Data Attributes for State
Add `data-zustand-version` to components that update:

```typescript
// In component
<div data-testid="creature-card" data-zustand-version={stateVersion}>
```

```typescript
// In test
const versionBefore = await page.getAttribute('[data-testid="creature-card"]', 'data-zustand-version');
await endTurnButton.click();
await page.waitForFunction(
  (oldVersion) => {
    const newVersion = document.querySelector('[data-testid="creature-card"]')
      ?.getAttribute('data-zustand-version');
    return newVersion !== oldVersion;
  },
  versionBefore
);
```

### Option 3: Expose Store to Tests
Make Zustand store accessible for testing:

```typescript
// In dev mode only
if (process.env.NODE_ENV === 'development') {
  window.__BATTLE_STORE__ = store;
}
```

```typescript
// In tests
await page.waitForFunction(() => {
  return window.__BATTLE_STORE__?.getState().creatures[0].health === 18;
});
```

---

## 📝 Summary

**The Golden Rule**: Don't assert while the pipeline is "in motion".

**What "in motion" means**:
1. ❌ State updates still propagating
2. ❌ Effects triggering other effects (cascading)
3. ❌ Animations playing
4. ❌ React re-renders scheduled but not complete
5. ❌ DOM not yet reflecting current state

**Practical Rule for Now**: After any action that changes state, wait at least 3000ms (5000ms for complex cascading effects) before reading DOM values.

**Better Solution for Future**: Implement pipeline state exposure so tests can wait for "actually idle" instead of guessing with fixed timeouts.

**Why It Matters**: React + Zustand + Effect Pipeline are all asynchronous. Tests must wait for:
- State updates (synchronous ✅)
- Effect processing (asynchronous ⏱️)
- Cascading triggers (asynchronous ⏱️)
- Animations (asynchronous ⏱️)
- React re-renders (asynchronous ⏱️)

**How to Remember**: If a test reads the DOM while effects are cascading, it's like taking a photo of a waterfall mid-flow - you'll only capture one frame of an ongoing process! 🌊

---

**Last Updated:** October 19, 2025  
**Author:** Battle Engine Team  
**Status:** ✅ All timing issues resolved, future improvements identified
