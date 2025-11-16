# Zustand Adapter for Effect Pipeline System

## Overview

This adapter provides a **Zustand-backed implementation** of the `BattleContext` interface, allowing you to use Zustand's store management while preserving all existing Effect Pipeline behaviors.

## Why Two Implementations?

We maintain both native `BattleContext` and Zustand adapter implementations to:

1. **Enable gradual migration** - Test Zustand in isolation before full adoption
2. **Support different use cases** - Native for per-battle instances, Zustand for global state
3. **Preserve backwards compatibility** - Existing code continues to work unchanged
4. **Allow performance comparison** - Measure which approach is faster for your use case

## Architecture

```
┌─────────────────────────────────────────┐
│         useBattleEngine Hook            │
│                                         │
│  ┌────────────┐      ┌──────────────┐  │
│  │  Native    │  OR  │   Zustand    │  │
│  │  Context   │      │   Adapter    │  │
│  └────────────┘      └──────────────┘  │
│         │                    │          │
│         └────────┬───────────┘          │
│                  │                      │
│         BattleContext Interface         │
│      (history, subscribe, notify)       │
└─────────────────────────────────────────┘
                   │
                   ▼
        Effect Pipeline Engine
        (processEffectChain, etc.)
```

## Feature Parity

Both implementations support:

✅ **State Management**
- Immutable state updates
- State history tracking (up to 50 snapshots)
- Rollback capability

✅ **Subscription System**
- Subscribe to specific change types or 'all'
- Multiple subscribers per change type
- Unsubscribe functionality

✅ **Deferred Notifications**
- Apply changes without immediate notification
- Manually trigger notifications after animations
- Critical for animation/state synchronization

✅ **React Integration**
- Works with `useBattleEngine` hook
- Proper cleanup on unmount
- React Strict Mode compatible

## Files

```
src/utils/effectPipeline/
├── battleContext.ts           # Native implementation
├── zustandAdapter.ts          # Zustand implementation
├── hooks/
│   └── useBattleEngine.ts     # React hook with feature flag
└── __tests__/
    ├── battleContext.test.ts  # Native tests
    └── zustandAdapter.test.ts # Adapter tests
```

## Usage

### Switching Implementations

Edit `src/utils/effectPipeline/hooks/useBattleEngine.ts`:

```typescript
// Feature flag: Set to true to use Zustand adapter
const USE_ZUSTAND_ADAPTER = false // Change to true
```

### Creating a Store

```typescript
import { createZustandBattleStore } from './zustandAdapter'

const store = createZustandBattleStore(initialBattleState)
```

### Subscribing to Changes

```typescript
import { subscribeToZustandContext } from './zustandAdapter'

const unsubscribe = subscribeToZustandContext(
  store,
  'HEALTH_CHANGE', // or 'all' for all changes
  (changes, newState) => {
    console.log('Health changed:', changes)
  }
)
```

### Applying State Changes

```typescript
import { applyChangesToZustandContext } from './zustandAdapter'

const healthChange = {
  type: 'HEALTH_CHANGE',
  creatureId: 2,
  timestamp: Date.now(),
  data: { delta: -10, newHealth: 50, source: 'attack' }
}

// Immediate notification
applyChangesToZustandContext(store, [healthChange])

// Deferred notification (for animation sync)
applyChangesToZustandContext(store, [healthChange], { deferNotification: true })
// ... run animations ...
notifyZustandContextSubscribers(store, [healthChange])
```

### Getting State Snapshot

```typescript
import { getZustandContextState } from './zustandAdapter'

const currentState = getZustandContextState(store) // Returns cloned state
```

## Testing

Run Zustand adapter tests:

```bash
npm test -- zustandAdapter
```

Run all Effect Pipeline tests:

```bash
npm test -- effectPipeline
```

## Performance Comparison

| Feature | Native Context | Zustand Adapter |
|---------|---------------|-----------------|
| State Updates | Direct mutation of context object | Zustand store updates (slightly slower) |
| Subscriptions | Custom Map-based system | Zustand's optimized subscription |
| Memory | Minimal overhead | Zustand store overhead (~2KB) |
| Devtools | Manual logging | Zustand DevTools support |
| Bundle Size | No extra dependencies | +3KB gzipped (zustand) |

## Migration Guide

### Phase 1: Test with Feature Flag

1. Set `USE_ZUSTAND_ADAPTER = true` in `useBattleEngine.ts`
2. Run application and test all features
3. Check browser console for "🎯 Using Zustand adapter" message
4. Verify no regressions

### Phase 2: Update Tests

1. Ensure all tests pass with adapter enabled
2. Add adapter-specific tests if needed
3. Update integration tests

### Phase 3: Production Rollout

1. Enable adapter in production build
2. Monitor for issues
3. Keep native implementation as fallback

### Phase 4: Cleanup (Optional)

1. Remove native implementation once stable
2. Remove feature flag
3. Simplify codebase

## Troubleshooting

### "Subscription not working"

Check that you're using the correct subscribe function:
- `subscribeToZustandContext` for Zustand
- `subscribeToContext` for native

### "State not updating in UI"

Ensure you're using `getZustandContextState` to get cloned state, not direct access to `store.getState().state`.

### "History not working"

Verify that `applyChangesToZustandContext` is being called (which automatically adds to history), not direct state mutations.

## Advanced: Hybrid Approach

You can use both implementations simultaneously:

```typescript
// Create both contexts
const nativeContext = createBattleContext(initialState)
const zustandStore = createZustandBattleStore(initialState)
const zustandContext = zustandToBattleContext(zustandStore)

// Use native for main battle
processEffectChain(effect, nativeContext)

// Use Zustand for replay/history features
const replayState = getZustandContextState(zustandStore)
```

## Future Enhancements

- [ ] Middleware support (logging, persistence)
- [ ] Redux DevTools integration
- [ ] Time-travel debugging
- [ ] Store persistence to localStorage
- [ ] Multi-store support for parallel battles
- [ ] Selector-based subscriptions for performance

## References

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Effect Pipeline Guide](./EFFECT_PIPELINE_GUIDE.md)
- [Battle Context Documentation](./battleContext.ts)

## Questions?

See `EFFECT_PIPELINE_GUIDE.md` for general Effect Pipeline questions or check the test files for usage examples.
