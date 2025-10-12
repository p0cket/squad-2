# E2E Testing with Playwright

## 📋 Overview

We've set up **Playwright** for automated end-to-end testing of the battle system. This allows us to test the turn system, status effects, and UI interactions automatically without manual clicking.

## Running Tests

### Quick Start

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI (interactive mode)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run tests and show report
npm run test:e2e:report
```

## ⚠️ CRITICAL: Timing Considerations

**React + Zustand + Effect Pipeline = Asynchronous Updates**

When you click a button in tests, multiple things happen asynchronously:
1. Zustand store updates (synchronous ✅)
2. Effect pipeline processes effects (asynchronous ⏱️)
3. Effects can trigger other effects - cascading! (asynchronous ⏱️)
4. Animations play (asynchronous ⏱️)
5. React schedules re-render (asynchronous ⏱️)
6. React commits to DOM (asynchronous ⏱️)

**The Problem**: If your test reads the DOM too early, it will see stale values!

### Wait Time Guidelines

```typescript
// After clicking buttons, wait before asserting:
await page.click('[data-testid="attack-button"]');
await page.waitForTimeout(2000); // Simple attack

await page.click('[data-testid="end-turn-button"]');
await page.waitForTimeout(3000); // Turn end with status ticks

await page.click('[data-testid="outbreak-attack"]');
await page.waitForTimeout(5000); // Cascading effects (Outbreak spreads)
```

### Why This Matters

```typescript
// ❌ BAD - Reads stale value
await endTurnButton.click();
const health = await getCreatureHealth(page, 'Goblin'); 
// Sees: 23 (old value, React hasn't re-rendered yet!)

// ✅ GOOD - Waits for pipeline + React
await endTurnButton.click();
await page.waitForTimeout(3000);
const health = await getCreatureHealth(page, 'Goblin');
// Sees: 18 (correct value after burn damage!)
```

**Rule of Thumb**: Don't assert while the pipeline is "in motion". Wait for:
- All effects to process
- All cascading triggers to complete  
- All animations to finish
- React to finish re-rendering

### For Complex Cascading Effects

Effects like **Outbreak** can trigger recursively:
```
Apply Poison → Outbreak triggers → Spread to adjacent → Another Outbreak triggers → ...
```

For these scenarios, use **5000ms or more** to ensure the entire cascade completes.

**See also**: 
- `E2E_TIMING_BEST_PRACTICES.md` - Detailed timing guide
- `E2E_CASCADING_EFFECTS.md` - Cascading effects specific guide

---

## 📝 Test Coverage

### Turn System Tests (`turn-system.spec.ts`)

✅ **Status Effect Application**
- Applies burn status via Fireball attack
- Verifies burn badge appears with duration

✅ **Status Ticking**
- Burns tick on turn end
- Damage is applied correctly

✅ **Duration Countdown**
- Duration decrements each turn
- Verifies accurate countdown

✅ **Status Expiration**
- Status removes when duration reaches 0
- Badge disappears from UI

✅ **Turn Counter**
- Turn number increments
- Turn owner switches (player ↔ computer)

✅ **Multiple Status Effects**
- Multiple statuses can coexist
- All tick correctly

## 🏗️ Test Structure

```
tests/
└── e2e/
    └── turn-system.spec.ts    # Turn system E2E tests
```

## 🎯 Test IDs Required

To make tests work, we need to add `data-testid` attributes to components:

### Required Test IDs:

1. **Creature Cards**: `data-testid="creature-card"`
2. **Status Badges**: `data-testid="status-badge"`
3. **Creature Health**: `data-testid="creature-health"`
4. **Turn Counter**: `data-testid="turn-counter"`
5. **Turn Owner**: `data-testid="turn-owner"`
6. **End Turn Button**: Already has text "End Turn"

## 📊 Helper Functions

The test suite includes helper functions:

- `applyBurnToHarper()` - Automates burn application
- `getCreatureHealth()` - Extracts current health value
- `extractDuration()` - Parses duration from badge
- `extractTurnNumber()` - Parses turn from counter

## 🔍 Debugging Tests

### Take Screenshots
```bash
npx playwright test --screenshot=on
```

### Record Video
```bash
npx playwright test --video=on
```

### Debug Single Test
```bash
npx playwright test --debug turn-system.spec.ts
```

### Trace Viewer
```bash
npx playwright test --trace on
npx playwright show-trace trace.zip
```

## 🎭 Browser Support

Currently configured for:
- ✅ Chromium (Chrome/Edge)

Can be extended to:
- Firefox
- WebKit (Safari)

## 📈 CI/CD Integration

Tests can be run in CI pipelines:

```yaml
# .github/workflows/test.yml
- name: Run Playwright tests
  run: npx playwright test
```

## 🐛 Troubleshooting

### Tests Can't Find Elements
- Ensure `data-testid` attributes are added to components
- Check that app is running on `http://localhost:3000`

### Tests Timeout
- Increase timeout in `playwright.config.ts`
- Check if app loads correctly

### Flaky Tests
- Add more `waitForTimeout()` calls
- Use `waitForSelector()` instead of fixed timeouts

## 📚 Next Steps

1. Add test IDs to components
2. Run tests to verify everything works
3. Add more test scenarios:
   - Multiple creatures with statuses
   - Death from status effects
   - Passive ability triggers (Outbreak)
   - Victory/defeat conditions

## 🔗 Resources

- [Playwright Docs](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Selectors Guide](https://playwright.dev/docs/selectors)
