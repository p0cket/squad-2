# Squad Battle Engine README

## Overview

The Squad Battle Engine is a turn-based combat system that handles creature battles with status effects, damage calculation, and turn management. This document provides a comprehensive guide to understanding the current implementation, data flow, and areas for improvement.

## Architecture Overview

### Core Components

1. **State Management** - React Context API with reducer pattern
2. **Attack Processing** - Multi-step attack execution pipeline
3. **Status Effect System** - Flexible system for buffs, debuffs, and DOTs
4. **Turn Management** - End-of-turn processing and game state updates
5. **Animation System** - Framer Motion based battle animations

### Data Flow

```
Player Action → Attack Execution → Damage Calculation → Status Application → Animation → State Update → End of Turn Processing
```

## Attack Flow Analysis

### Current Attack Pipeline (`performAttack.ts`)

The attack system follows this sequence:

1. **Initialization & Logging**
   - Create log entry for attack action
   - Retrieve animation controls for attacker and target

2. **Animation Planning** ⚠️ **ISSUE**
   - Code shows intention to queue animations but currently executes immediately
   - `addAnimToStack()` function exists but isn't functional
   - Direct animation execution with `performAttackAnimation()`

3. **Damage Calculation**
   - Calculate damage and status effects via `calculateDamageAndStatuses()`
   - Process immediate status effects with `findRelevantStatusesToGive()`

4. **Damage Application**
   - Show damage animation on target
   - Update target's health and status effects
   - Log state changes extensively

5. **Post-Attack Processing** ⚠️ **INCOMPLETE**
   - Find relevant procs with `newFindRelevantProcs()` but not fully implemented
   - No clear integration with global state updates

### Issues Identified in Attack Flow

#### 1. Animation Queue System (Incomplete)
```typescript
// Current code shows intention but incomplete implementation
const addAnimToStack = (attackerControls, targetControls, isPlayerAttack) => {
  const animPayload = createAnimPayload(attackerControls, targetControls, isPlayerAttack)
  // pushAnimToStack(animPayload) // This doesn't exist
}
```

**Problems:**
- Animation queueing system is planned but not implemented
- Animations execute immediately instead of being queued
- No way to handle multiple simultaneous effects

#### 2. State Update Inconsistency
```typescript
// Multiple dispatch calls throughout the process
dispatch({ type: "UPDATE_CREATURE", creature: updatedCreatureObj })
// But also direct state mutations in some places
```

**Problems:**
- Mixed patterns of state updates
- Some functions mutate objects directly
- Unclear when state is actually committed

#### 3. Status Effect Timing Issues
```typescript
// Status effects applied immediately during damage calculation
const objAfterImmediateStatuses = findRelevantStatusesToGive(attackPayload, "beforeAttack")
```

**Problems:**
- "beforeAttack" and "afterAttack" timing isn't consistently enforced
- Status effects may be applied out of order
- No clear phase management

### Status Effect System Analysis

#### Current Implementation (`statuses.ts`)

**Structure:**
```typescript
export const STATUS_EFFECTS: { [key: string]: StatusEffect } = {
  POISON: {
    name: "Poison",
    type: "debuff", 
    timing: "afterAttack",
    duration: 3,
    effectFuncName: "applyPoison",
    // ...
  }
}
```

**Issues:**
1. **Inconsistent Function Naming**: `effectFuncName` points to functions that may not exist
2. **Missing Effect Functions**: Not all status effects have corresponding apply functions
3. **State Management**: Status effects directly dispatch updates instead of returning new state
4. **Animation Integration**: Status effects trigger animations but not through centralized system

#### End of Turn Processing (`handleEndOfTurnEffects.ts`)

**Current Flow:**
1. Apply mods (stat modifications)
2. Apply status effects (DOTs, buffs, etc.)
3. Reduce duration counters
4. Filter out expired effects

**Issues:**
1. **Dual Systems**: Both `mods` and `statuses` exist with unclear distinction
2. **Direct Mutations**: Functions modify creature objects directly
3. **No Animation**: End-of-turn effects don't trigger visual feedback
4. **Timing Problems**: All effects processed simultaneously instead of sequentially

## Recommended Improvements

### 1. Implement Proper Animation Queue System

```typescript
interface AnimationQueueItem {
  type: 'ATTACK' | 'DAMAGE' | 'STATUS_EFFECT' | 'HEAL'
  controls: AnimationControls
  target?: Creature
  attacker?: Creature
  data?: any
}

class AnimationQueue {
  private queue: AnimationQueueItem[] = []
  
  add(item: AnimationQueueItem) {
    this.queue.push(item)
  }
  
  async processQueue() {
    for (const item of this.queue) {
      await this.executeAnimation(item)
    }
    this.queue = []
  }
}
```

### 2. Standardize State Management

```typescript
// Create immutable state updates
const updateCreatureState = (creature: Creature, updates: Partial<Creature>): Creature => {
  return { ...creature, ...updates }
}

// Batch state updates at end of attack
const batchUpdates = (updates: StateUpdate[]) => {
  updates.forEach(update => dispatch(update))
}
```

### 3. Fix Status Effect Timing

```typescript
enum EffectPhase {
  BEFORE_ATTACK = 'beforeAttack',
  ON_DAMAGE = 'onDamage', 
  AFTER_ATTACK = 'afterAttack',
  END_OF_TURN = 'endOfTurn',
  START_OF_TURN = 'startOfTurn'
}

const processEffectsByPhase = (creatures: Creature[], phase: EffectPhase) => {
  return creatures.map(creature => 
    creature.statuses
      .filter(status => status.timing === phase)
      .reduce((acc, status) => applyStatusEffect(acc, status), creature)
  )
}
```

### 4. Unify Status Effects and Mods

```typescript
interface Effect {
  id: string
  name: string
  type: 'buff' | 'debuff' | 'neutral'
  duration: number
  phase: EffectPhase
  applyEffect: (creature: Creature) => Creature
  onApply?: (creature: Creature) => AnimationQueueItem[]
  stackable: boolean
}
```

### 5. Create Centralized Battle Controller

```typescript
class BattleController {
  private animationQueue: AnimationQueue
  private state: BattleState
  
  async executeAttack(attackPayload: AttackPayload) {
    // 1. Add attack animation to queue
    this.animationQueue.add(createAttackAnimation(attackPayload))
    
    // 2. Calculate effects
    const effects = this.calculateAllEffects(attackPayload)
    
    // 3. Add effect animations to queue
    effects.animations.forEach(anim => this.animationQueue.add(anim))
    
    // 4. Process animation queue
    await this.animationQueue.processQueue()
    
    // 5. Apply all state changes at once
    this.applyStateChanges(effects.stateChanges)
  }
}
```

## Priority Fixes

### High Priority
1. **Fix Animation Queue**: Implement proper queueing system for sequential animations
2. **Standardize State Updates**: Remove direct mutations, use immutable updates
3. **Fix Status Effect Timing**: Ensure effects apply in correct order and phase

### Medium Priority  
4. **Unify Mods and Status**: Merge these into single effect system
5. **Add Visual Feedback**: Status effects need animations and UI indicators
6. **Improve Error Handling**: Add try/catch blocks and error recovery

### Low Priority
7. **Performance Optimization**: Batch DOM updates, optimize re-renders
8. **Code Organization**: Split large functions, improve modularity
9. **Documentation**: Add JSDoc comments and type documentation

## Testing Strategy

### Unit Tests Needed
- Damage calculation functions
- Status effect application
- State update reducers
- Animation queue management

### Integration Tests Needed  
- Full attack flow from start to finish
- End-of-turn processing
- Game over conditions
- Multi-effect scenarios

### Visual Tests Needed
- Animation timing and sequencing
- UI state consistency
- Performance with many effects

## Current State Assessment

### What Works Well ✅
- Basic attack mechanics function correctly
- Status effects can be applied and tracked
- Turn-based flow is established
- Logging system provides good debugging info

### What Needs Fixing ⚠️
- Animation system is incomplete and inconsistent
- State management has multiple patterns and direct mutations
- Status effect timing is not properly enforced
- Code has many incomplete features and TODO comments

### What's Missing ❌
- Centralized animation queue system
- Proper error handling and recovery
- Performance optimization for mobile
- Comprehensive test coverage

## Next Steps

1. **Implement Animation Queue** - Start with basic sequential animation processing
2. **Refactor State Management** - Remove direct mutations, standardize update patterns
3. **Fix Status Effect System** - Implement proper timing and phase management
4. **Add Tests** - Create unit tests for core battle mechanics
5. **Performance Audit** - Profile and optimize for mobile devices

This battle engine has a solid foundation but needs architectural improvements to handle complex interactions reliably and provide smooth user experience.
