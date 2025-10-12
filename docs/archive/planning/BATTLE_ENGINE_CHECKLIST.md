# Battle Engine Implementation Checklist

## Overview

This checklist breaks down the battle engine fixes into small, testable builds. Each build should be functional and demonstrate progress toward the complete system.

## Current Progress Summary

### ✅ **Completed Items:**
- **CRITICAL FIX**: Missing `dispatch({ type: "UPDATE_CREATURE" })` call added to `performAttack.ts` ✅
- Creatures now properly lose health when attacked ✅
- TypeScript strict mode is enabled ✅
- `updateTargetState.ts` is already pure (returns new objects) ✅
- Prettier formatting is configured ✅
- Basic queue utilities exist in `queueUtils.ts` ✅
- `StatusEffect` interface exists with timing properties ✅
- ESLint warnings cleaned up in `performAttack.ts` ✅

### ⚠️ **Partially Completed:**
- **Build 1.1**: Queue utilities exist but need proper class structure
- **Build 1.2**: Core state function is pure, but status effects still have side effects
- **Build 1.3**: Status effects have timing but use strings instead of enums

### ❌ **Not Started:**
- Animation queue integration
- Unified effect system
- Battle controller
- Error handling
- Visual feedback components
- Performance optimization
- Comprehensive testing

### 🎯 **Recommended Next Step:**
**Build 1.0 COMPLETE** ✅ - Critical damage flow is now working!
Next: **Build 1.1** - Complete the Animation Queue Infrastructure by converting existing `queueUtils.ts` into a proper class-based system.

## Phase 1: Foundation Fixes (High Priority)

### Build 1.1: Animation Queue Infrastructure
**Goal**: Create basic animation queue system without breaking existing functionality

**Tasks:**
- [ ] Create `AnimationQueue.ts` class with basic queue operations
- [ ] Add queue to GameContext without using it yet
- [ ] Create unit tests for queue operations (add, process, clear)
- [ ] Add console logging to track queue operations

**Deliverable**: Animation queue exists and can be tested, but attacks still work as before

**Files to Create/Modify:**
- `src/utils/anim/AnimationQueue.ts` (new)
- `src/GameContext.tsx` (add queue to context)
- `src/utils/anim/__tests__/AnimationQueue.test.ts` (new)

**Test Criteria:**
- Existing attacks still work normally
- Queue can add/remove items
- Console shows queue operations

**Status**: ⚠️ **PARTIALLY COMPLETE** - Basic queue utilities exist in `queueUtils.ts` but need proper class structure

---

### Build 1.2: State Update Standardization
**Goal**: Remove direct mutations and standardize state updates

**Tasks:**
- [ ] Create `StateUpdateUtils.ts` with immutable update helpers
- [x] Refactor `updateTargetState.ts` to return new objects instead of mutating
- [ ] Refactor status effect functions to be pure (no side effects)
- [x] Add TypeScript strict mode checks for mutations

**Deliverable**: All state updates are immutable and predictable

**Files to Create/Modify:**
- `src/utils/state/StateUpdateUtils.ts` (new)
- `src/utils/party/updateTargetState.ts` (refactor) ✅ **COMPLETED**
- `src/consts/statuses.ts` (refactor functions)

**Test Criteria:**
- No direct object mutations in codebase
- State updates are predictable
- Battle still functions correctly

**Status**: ⚠️ **PARTIALLY COMPLETE** - `updateTargetState.ts` is pure, TypeScript strict mode enabled, but status effects still have side effects

---

### Build 1.3: Status Effect Phase System
**Goal**: Implement proper timing phases for status effects

**Tasks:**
- [ ] Create `EffectPhase.ts` enum with all timing phases
- [ ] Update `StatusEffect` interface to use enum instead of strings
- [ ] Create `processEffectsByPhase.ts` utility function
- [ ] Refactor existing status effects to use new system

**Deliverable**: Status effects have consistent timing and can be processed by phase

**Files to Create/Modify:**
- `src/consts/types/EffectPhase.ts` (new)
- `src/consts/types/types.ts` (update StatusEffect interface)
- `src/utils/effects/processEffectsByPhase.ts` (new)
- `src/consts/statuses.ts` (update to use new phases)

**Test Criteria:**
- All status effects have valid phases
- Effects can be filtered by phase
- Timing is consistent across all effects

**Status**: ⚠️ **PARTIALLY COMPLETE** - `StatusEffect` interface exists with timing property, but uses strings instead of enum

---

## Phase 2: Core Integration (Medium Priority)

### Build 2.1: Integrate Animation Queue into Attacks
**Goal**: Make attacks use animation queue for sequencing

**Tasks:**
- [ ] Modify `performAttack.ts` to queue animations instead of executing immediately
- [ ] Create animation factories for common animations (attack, damage, status)
- [ ] Update attack flow to process queue after all animations are added
- [ ] Add animation completion callbacks

**Deliverable**: Attacks use animation queue for proper sequencing

**Files to Create/Modify:**
- `src/utils/moves/performAttack.ts` (major refactor)
- `src/utils/anim/AnimationFactories.ts` (new)
- `src/utils/anim/performAttackAnimation.ts` (update to work with queue)

**Test Criteria:**
- Animations play in correct order
- No overlapping animations
- Attack completion is properly handled

---

### Build 2.2: Unified Effect System
**Goal**: Merge mods and statuses into single effect system

**Tasks:**
- [ ] Create new `Effect` interface that replaces both mods and statuses
- [ ] Create migration utility to convert existing mods/statuses to new format
- [ ] Update all creatures to use new effect system
- [ ] Remove old mods and statuses properties

**Deliverable**: Single effect system handles all creature modifications

**Files to Create/Modify:**
- `src/consts/types/Effect.ts` (new)
- `src/utils/effects/EffectMigration.ts` (new)
- `src/consts/creatures.ts` (update creature definitions)
- `src/consts/types/types.ts` (remove old Creature properties)

**Test Criteria:**
- All creature effects work with new system
- No references to old mods/statuses
- Effect application is consistent

---

### Build 2.3: End-of-Turn Refactor
**Goal**: Fix end-of-turn processing to use new systems

**Tasks:**
- [ ] Refactor `handleEndOfTurnEffects.ts` to use effect phases
- [ ] Add animations for end-of-turn effects
- [ ] Integrate with animation queue
- [ ] Add proper state batching for multiple effects

**Deliverable**: End-of-turn effects are properly animated and sequenced

**Files to Create/Modify:**
- `src/utils/turn/handleEndOfTurnEffects.ts` (major refactor)
- `src/utils/turn/processEndOfTurn.ts` (update to use queue)

**Test Criteria:**
- End-of-turn effects show visual feedback
- Effects process in correct order
- State updates are batched properly

---

## Phase 3: Advanced Features (Medium Priority)

### Build 3.1: Battle Controller
**Goal**: Create centralized battle management

**Tasks:**
- [ ] Create `BattleController.ts` class
- [ ] Move attack execution logic to controller
- [ ] Add battle state validation
- [ ] Implement action queuing system

**Deliverable**: Centralized battle logic with action queuing

**Files to Create/Modify:**
- `src/controllers/BattleController.ts` (new)
- `src/utils/moves/performAttack.ts` (move logic to controller)
- `src/GameContext.tsx` (integrate controller)

**Test Criteria:**
- All battle actions go through controller
- State validation prevents invalid actions
- Action queue works correctly

---

### Build 3.2: Error Handling & Recovery
**Goal**: Add comprehensive error handling

**Tasks:**
- [ ] Add try/catch blocks to all async operations
- [ ] Create error recovery strategies
- [ ] Add error logging and reporting
- [ ] Create fallback states for corrupted data

**Deliverable**: Battle system is resilient to errors

**Files to Create/Modify:**
- `src/utils/errors/BattleErrorHandler.ts` (new)
- `src/utils/errors/ErrorRecovery.ts` (new)
- All battle-related files (add error handling)

**Test Criteria:**
- Errors don't crash the battle
- User gets helpful error messages
- Battle state can be recovered

---

### Build 3.3: Visual Feedback System
**Goal**: Add visual indicators for all status effects

**Tasks:**
- [ ] Create status effect UI components
- [ ] Add floating text animations
- [ ] Create effect stack display
- [ ] Add sound effects integration hooks

**Deliverable**: All effects have clear visual representation

**Files to Create/Modify:**
- `src/components/effects/StatusIndicator.tsx` (new)
- `src/components/effects/FloatingText.tsx` (new)
- `src/components/effects/EffectStack.tsx` (new)

**Test Criteria:**
- All status effects are visually represented
- Players can understand what effects are active
- Animations are smooth and informative

---

## Phase 4: Polish & Optimization (Low Priority)

### Build 4.1: Performance Optimization
**Goal**: Optimize for mobile performance

**Tasks:**
- [ ] Profile animation performance
- [ ] Implement object pooling for animations
- [ ] Optimize re-renders with React.memo
- [ ] Add performance monitoring

**Deliverable**: Battle system runs smoothly on mobile devices

**Test Criteria:**
- 60fps on mid-range mobile devices
- Memory usage is stable
- Battery usage is reasonable

---

### Build 4.2: Testing Suite
**Goal**: Comprehensive test coverage

**Tasks:**
- [ ] Unit tests for all battle utilities
- [ ] Integration tests for full battle flow
- [ ] Visual regression tests
- [ ] Performance benchmarks

**Deliverable**: Battle system has 90%+ test coverage

**Files to Create:**
- `src/utils/__tests__/` (various test files)
- `src/components/__tests__/` (component tests)
- `src/integration-tests/` (end-to-end tests)

**Test Criteria:**
- All critical paths are tested
- Tests run quickly and reliably
- Visual changes are caught automatically

---

## Implementation Order & Dependencies

### Week 1: Foundation
- Build 1.1 → Build 1.2 → Build 1.3

### Week 2: Integration  
- Build 2.1 (depends on 1.1, 1.3)
- Build 2.2 (depends on 1.2, 1.3)

### Week 3: Advanced Integration
- Build 2.3 (depends on 2.1, 2.2)
- Build 3.1 (depends on 2.1, 2.2, 2.3)

### Week 4: Polish
- Build 3.2 (depends on 3.1)
- Build 3.3 (depends on 2.3)

### Week 5: Optimization
- Build 4.1 (depends on all previous)
- Build 4.2 (depends on all previous)

## Success Metrics

### After Phase 1:
- [ ] No direct object mutations in codebase
- [ ] Animation queue system exists and works
- [ ] Status effects use consistent timing

### After Phase 2:
- [ ] Attacks are properly sequenced with animations
- [ ] Single effect system handles all modifications
- [ ] End-of-turn effects are visually clear

### After Phase 3:
- [ ] Battle controller manages all actions
- [ ] Error handling prevents crashes
- [ ] All effects have visual feedback

### After Phase 4:
- [ ] 60fps performance on mobile
- [ ] 90%+ test coverage
- [ ] Ready for production

## Quick Wins (Can be done in parallel)

### Immediate Improvements:
- [ ] Add JSDoc comments to all functions
- [ ] Fix TypeScript any types
- [ ] Remove console.log statements (replace with proper logging)
- [ ] Add loading states for animations
- [ ] Improve error messages for debugging

### Code Quality:
- [ ] Set up ESLint rules for mutations
- [x] Add Prettier formatting ✅ **COMPLETED** - `.prettierrc` exists
- [ ] Set up pre-commit hooks
- [ ] Add bundle size monitoring

**Status**: ⚠️ **PARTIALLY COMPLETE** - Prettier is configured

## Risk Mitigation

### High Risk Items:
1. **Animation Queue Integration** - Could break existing animations
   - Mitigation: Implement behind feature flag, gradual rollout

2. **State System Refactor** - Could introduce bugs
   - Mitigation: Extensive testing, incremental changes

3. **Effect System Unification** - Large breaking change
   - Mitigation: Migration utilities, backward compatibility

### Testing Strategy:
- Create test suite before making changes
- Use visual regression testing for animations
- Performance testing on actual mobile devices
- User testing at each major milestone

This checklist provides a clear path forward with measurable deliverables at each step. Each build can be tested independently and provides value even if later builds are delayed.
