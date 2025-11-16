# Complete Attack Flow Lifecycle Documentation

**Last Updated**: October 24, 2025  
**Current Implementation**: Effect Pipeline System v2 with Zustand Adapter

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Summary](#architecture-summary)
3. [Complete Attack Lifecycle](#complete-attack-lifecycle)
4. [State Management Flow](#state-management-flow)
5. [Status Effects System](#status-effects-system)
6. [Cascading Effects & Triggers](#cascading-effects--triggers)
7. [Detailed Attack Examples](#detailed-attack-examples)
8. [Turn Processing](#turn-processing)
9. [Animation System Integration](#animation-system-integration)
10. [Debugging Guide](#debugging-guide)

---

## Overview

The attack system uses a **declarative effect pipeline** architecture that separates concerns into distinct layers:

- **Effect Objects**: Serializable data describing what should happen
- **Effect Applicators**: Pure functions that calculate state changes
- **Effect Pipeline Engine**: Orchestrates sequential processing and cascading
- **Zustand Adapter**: Bridges pipeline to React state management
- **Animation Engine**: Handles visual feedback independently

### Key Design Principles

1. **Immutability**: All state changes create new state objects
2. **Declarative Effects**: Effects are data, not imperative code
3. **Separation of Concerns**: State, animations, and logic are decoupled
4. **Sequential Processing**: Effects process one-at-a-time to prevent race conditions
5. **Trigger-Based Cascading**: Effects can trigger other effects through rules

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                     ATTACK INITIATION                        │
│   (useBattleEngine.performAttack or applyBurn, etc.)       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              CREATE EFFECT OBJECT                            │
│   { type: 'ATTACK', targetId: 2, data: {...} }             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│           PROCESS EFFECT CHAIN                               │
│   processEffectChain(effect, context)                       │
│   • Queue management                                         │
│   • Sequential processing                                    │
│   • Safety limits (max 50 steps)                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│         EXECUTE EFFECT PIPELINE                              │
│   executeEffectPipeline(effect, context)                    │
│   Loop:                                                      │
│   1. Get next effect from pipeline                          │
│   2. Apply effect (get state changes + animations)          │
│   3. Update context (deferred notification)                 │
│   4. Execute animations (show damage numbers)               │
│   5. Notify UI subscribers (trigger re-renders)             │
│   6. Wait for animations to finish                          │
│   7. Check for triggered effects                            │
│   8. Add triggered effects to pipeline                      │
│   Repeat until pipeline empty                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│            APPLY EFFECT (Applicator)                         │
│   applyEffect(effect, context)                              │
│   • Look up applicator by effect.type                       │
│   • Calculate state changes (damage, status, etc.)          │
│   • Generate animations                                      │
│   • Return { stateChanges, animations }                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│       APPLY STATE CHANGES TO CONTEXT                         │
│   applyChangesToContext(context, changes, {defer: true})    │
│   • Save history (for rollback)                             │
│   • Apply each change immutably                             │
│   • Update health, statuses, stats                          │
│   • DON'T notify subscribers yet (deferred)                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│       EXECUTE ANIMATIONS (Sequential)                        │
│   executeAnimationsSequentially(animations)                 │
│   • Play attack windup                                       │
│   • Show impact effect                                       │
│   • Display damage numbers (appear)                         │
│   • Return finishAnimations() callback                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│         NOTIFY UI SUBSCRIBERS                                │
│   notifyContextSubscribers(context, changes)                │
│   • Trigger React re-renders                                │
│   • Update creature cards with new health/statuses          │
│   • Show damage numbers on screen                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│       FINISH ANIMATIONS (Fade Out)                           │
│   await finishAnimations()                                   │
│   • Wait for damage numbers to fade                         │
│   • Complete visual feedback                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│      RESOLVE TRIGGERED EFFECTS                               │
│   resolveTriggeredEffects(effect, stateChanges, context)    │
│   • Check trigger rules                                      │
│   • Passive abilities (on_damaged, on_status_applied)       │
│   • Cascading effects (Outbreak spreads burn)               │
│   • Create new effects if conditions met                    │
│   • Add to pipeline and continue loop                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓ (if triggered effects exist)
                       │
           ┌───────────┴──────────┐
           │                      │
           ↓                      ↓
    Add to Pipeline         Continue Loop
    (back to step 1)        Until Empty
```

---

## Complete Attack Lifecycle

### Phase 1: Attack Initiation

**Entry Point**: User clicks attack button or performAttack is called

```typescript
// From useBattleEngine hook
const performAttack = useCallback(async (
  attackerId: number,
  targetId: number,
  attack: Attack
) => {
  // Create effect object
  const attackEffect = createAttackEffect(attackerId, targetId, attack)
  
  // Start the effect chain
  await processEffectChain(attackEffect, contextRef.current)
}, [])
```

**Effect Creation**:
```typescript
// Effect object structure
{
  id: 'attack-123456',
  type: 'ATTACK',
  targetId: 2,
  priority: 0,
  data: {
    attackerId: 1,
    attack: {
      name: "Flame Swipe",
      damage: 15,
      effects: ["BURN"],
      ...
    }
  }
}
```

### Phase 2: Pipeline Processing

**Step 1**: Check if pipeline is busy
- If busy → Queue the effect
- If free → Mark as processing and start

**Step 2**: Create effect pipeline
```typescript
const pipeline = createEffectPipeline()
// pipeline = { queue: [], processed: new Set() }

addEffectToPipeline(pipeline, effect)
// Adds effect with priority ordering
// Prevents duplicates via generateEffectId()
```

**Step 3**: Main processing loop (max 50 iterations)
```typescript
while (hasEffectsInPipeline(pipeline) && stepCount < maxSteps) {
  const currentEffect = getNextEffect(pipeline)
  // Process this effect...
}
```

### Phase 3: Effect Application

**Step 1**: Look up applicator
```typescript
const applicator = EFFECT_APPLICATORS[effect.type]
// e.g., 'ATTACK' → applyAttackEffect
//       'BURN' → applyBurnEffect
```

**Step 2**: Execute applicator (pure function)
```typescript
const { stateChanges, animations } = await applyEffect(effect, context)
```

**Example for ATTACK effect**:
```typescript
// Calculate damage
const baseAttackDamage = attack.damage // 15
const attackerBonus = attacker.attack // 25
const totalDamage = baseAttackDamage + attackerBonus // 40
const defense = target.defense // 8
const actualDamage = Math.max(1, totalDamage - defense) // 32
const newHealth = Math.max(0, target.health - actualDamage) // 28

// Create state change
const healthChange = {
  type: 'HEALTH_CHANGE',
  creatureId: targetId,
  timestamp: Date.now(),
  data: {
    delta: -32, // Health change (negative = damage)
    newHealth: 28,
    source: 'attack-Flame Swipe',
    sourceCreatureId: attackerId // For counter-attacks
  }
}

// Process attack effects (BURN, POISON, STUN, etc.)
if (attack.effects.includes('BURN')) {
  stateChanges.push({
    type: 'STATUS_APPLIED',
    creatureId: targetId,
    timestamp: Date.now(),
    data: {
      statusId: 'BURN',
      duration: 3,
      damagePerTurn: 5
    }
  })
}

// Create animations
const animations = [
  { type: 'attack-windup', targetId: attackerId, duration: 600 },
  { type: 'impact', targetId: targetId, duration: 300 },
  { 
    type: 'damage-number', 
    targetId: targetId, 
    duration: 1500,
    data: { value: -32, label: 'Total Damage', isTotal: true }
  }
]

return { stateChanges, animations }
```

### Phase 4: State Updates

**Step 1**: Apply state changes to context (DEFERRED notification)
```typescript
applyChangesToContext(context, stateChanges, { deferNotification: true })
```

**What happens**:
1. Save current state to history (for rollback)
2. For each state change, apply immutably:

```typescript
// HEALTH_CHANGE
const newState = {
  ...state,
  computerCreatures: updateCreatureInArray(
    state.computerCreatures, 
    targetId, 
    creature => ({
      ...creature,
      health: Math.max(0, Math.min(
        creature.maxHealth, 
        creature.health + delta // delta = -32
      ))
    })
  )
}

// STATUS_APPLIED
const newState = {
  ...state,
  computerCreatures: updateCreatureInArray(
    state.computerCreatures,
    targetId,
    creature => ({
      ...creature,
      statuses: [...creature.statuses, {
        id: 'BURN',
        name: 'Burn',
        type: 'debuff',
        duration: 3,
        icon: '🔥',
        ...
      }]
    })
  )
}
```

3. Assign new state to context
4. **DO NOT** notify subscribers yet (damage numbers need to appear first)

### Phase 5: Animation Execution

**Step 1**: Execute animations sequentially
```typescript
const finishAnimations = await executeAnimationsSequentially(animations)
```

**Timeline**:
- **0ms**: Attack windup starts (attacker animates)
- **600ms**: Impact effect plays (target shakes)
- **900ms**: Damage numbers appear on screen
- Returns `finishAnimations()` callback immediately (doesn't wait for fade)

### Phase 6: UI Notification

**Step 1**: Notify subscribers (trigger React re-renders)
```typescript
notifyContextSubscribers(context, stateChanges)
```

**What happens**:
- Zustand store triggers updates
- React components re-render
- Creature cards show new health values
- Status badges appear
- Damage numbers are now visible on screen

### Phase 7: Animation Completion

**Step 1**: Wait for animations to fully finish
```typescript
if (finishAnimations) {
  await finishAnimations()
}
```

**What happens**:
- Damage numbers fade out (1500ms total)
- All visual feedback completes
- Pipeline ready for next effect

### Phase 8: Trigger Resolution

**Step 1**: Check for triggered effects
```typescript
const triggeredEffects = resolveTriggeredEffects(
  currentEffect,
  stateChanges,
  context
)
```

**Trigger Types**:
1. **Passive Abilities** (on_damaged, on_status_applied)
2. **Cascading Effects** (Outbreak spreads burn)
3. **Counter-attacks** (Stone Thorns reflects damage)

**Example - Stone Thorns Passive**:
```typescript
// Trigger rule registered for 'HEALTH_CHANGE'
registerEffectTrigger('HEALTH_CHANGE', {
  priority: 100,
  condition: (change, context) => {
    // Only trigger if:
    // 1. Health decreased (damage taken)
    // 2. Creature has stone-thorns passive
    // 3. Attacker is known
    const creature = getCreatureFromContext(context, change.creatureId)
    const hasPassive = creature.passiveAbilities?.some(
      p => p.id === 'stone-thorns'
    )
    return change.data.delta < 0 && hasPassive && change.data.sourceCreatureId
  },
  createEffect: (change, context) => {
    const sourceId = change.data.sourceCreatureId
    return createTrueDamageEffect(sourceId, 15, {
      description: 'Stone Thorns reflects 15 damage',
      source: 'passive-stone-thorns'
    })
  }
})
```

**Step 2**: Add triggered effects to pipeline
```typescript
triggeredEffects.forEach(triggeredEffect => {
  addEffectToPipeline(pipeline, triggeredEffect)
})
```

**Step 3**: Continue loop
- Pipeline has new effects
- Loop continues until pipeline empty
- Each triggered effect processes through all phases

### Phase 9: Pipeline Completion

**When pipeline is empty**:
1. Mark processing as complete: `pipelineState.isProcessing = false`
2. Process any queued effects (if new attacks were initiated during processing)
3. Return control to caller

---

## State Management Flow

### Zustand Adapter Pattern

**Architecture**:
```typescript
Zustand Store ←→ BattleContext Interface ←→ Effect Pipeline
```

**Key Functions**:

1. **recordChangesZustand**: Apply changes, defer notification
2. **updateDisplayZustand**: Notify subscribers, trigger re-renders

**State Change Types**:

```typescript
type StateChange = 
  | HealthChange        // Delta-based health updates
  | StatusChange        // STATUS_APPLIED, STATUS_REMOVED
  | StatModification    // Buff/debuff to stats
  | CreatureMovement    // Position changes
  | CreatureDeath       // Death handling
```

**Health Change Example**:
```typescript
{
  type: 'HEALTH_CHANGE',
  creatureId: 2,
  timestamp: 1698156789000,
  data: {
    delta: -32,              // Change amount (negative = damage)
    newHealth: 28,           // Expected final health
    source: 'attack',        // What caused this change
    sourceCreatureId: 1      // Who caused it (for triggers)
  }
}
```

**Status Change Example**:
```typescript
{
  type: 'STATUS_APPLIED',
  creatureId: 2,
  timestamp: 1698156789000,
  data: {
    statusId: 'BURN',
    duration: 3,
    damagePerTurn: 5,
    source: 'attack'
  }
}
```

### Immutability Pattern

**All state updates create new objects**:

```typescript
// ❌ WRONG - Mutates state
creature.health -= 10
creature.statuses.push(burnStatus)

// ✅ CORRECT - Immutable update
const newState = {
  ...state,
  computerCreatures: state.computerCreatures.map(c =>
    c.ID === targetId
      ? { ...c, health: c.health - 10, statuses: [...c.statuses, burnStatus] }
      : c
  )
}
```

---

## Status Effects System

### Status Effect Lifecycle

```
Application → Active → Tick (End of Turn) → Duration Decrement → Expiry/Removal
```

### Status Effect Structure

```typescript
{
  id: 'BURN',                  // Unique identifier
  name: 'Burn',                // Display name
  type: 'debuff',              // 'buff' | 'debuff' | 'neutral'
  timing: 'afterAttack',       // When it ticks
  duration: 3,                 // Turns remaining
  effectFuncName: 'applyBurn', // Legacy reference
  chance: 1,                   // Application chance
  icon: '🔥',                  // Display icon
  notes: 'Deals fire damage over time.'
}
```

### Status Types

#### Damage Over Time (DoT)

**BURN**:
- Damage: 5 per turn
- Duration: 3 turns
- Timing: End of turn (afterAttack)
- Can spread via Outbreak passive

**POISON**:
- Damage: 10 per turn
- Duration: 3 turns
- Timing: End of turn (afterAttack)
- Higher damage than burn

**BLEED**:
- Damage: 7 per turn
- Duration: 3 turns
- Timing: End of turn (afterAttack)

#### Crowd Control

**STUN**:
- Effect: Cannot act
- Duration: 2 turns
- No damage
- Timing: Before attack

**FREEZE**:
- Effect: Cannot act
- Duration: 2 turns
- Similar to stun

#### Stat Modifications

**ATTACK_BUFF**:
- Effect: +5 attack
- Duration: 3 turns
- Type: buff

**ATTACK_DEBUFF** (Weaken):
- Effect: -5 attack
- Duration: 3 turns
- Type: debuff

**DEFENSE_BUFF**:
- Effect: +5 defense
- Duration: 3 turns
- Type: buff

**DEFENSE_DEBUFF**:
- Effect: -5 defense
- Duration: 3 turns
- Type: debuff

#### Healing Over Time (HoT)

**REGENERATION**:
- Healing: 8 per turn
- Duration: 3 turns
- Timing: End of turn (afterAttack)

### Status Application Rules

1. **New Status**: Add to creature.statuses array
2. **Existing Status**: Update duration (refresh/extend)
3. **Stacking**: Most statuses refresh duration, don't stack
4. **Removal**: Filter out from statuses array

---

## Cascading Effects & Triggers

### Trigger System Architecture

**Trigger Rules**: Registered globally, checked after each effect

```typescript
type TriggerRule = {
  priority: number // Higher = checked first
  condition: (change: StateChange, context: BattleContext) => boolean
  createEffect: (change: StateChange, context: BattleContext) => Effect | null
}
```

### Passive Abilities

**Stone Thorns** (Golem):
- **Trigger**: `on_damaged`
- **Condition**: When health decreases
- **Effect**: Deal 15 true damage to attacker
- **Chance**: 100%

```typescript
// How it works
registerEffectTrigger('HEALTH_CHANGE', {
  priority: 100,
  condition: (change, context) => {
    if (change.data.delta >= 0) return false // Not damage
    const creature = getCreatureFromContext(context, change.creatureId)
    const hasPassive = creature.passiveAbilities?.some(
      p => p.id === 'stone-thorns'
    )
    return hasPassive && !!change.data.sourceCreatureId
  },
  createEffect: (change, context) => {
    return createTrueDamageEffect(
      change.data.sourceCreatureId,
      15,
      { source: 'passive-stone-thorns' }
    )
  }
})
```

**Poison Skin** (Basilisk):
- **Trigger**: `on_damaged`
- **Condition**: When health decreases
- **Effect**: 60% chance to poison attacker (8 damage/turn)
- **Chance**: 60%

**Outbreak** (Plague Rat):
- **Trigger**: `on_status_applied`
- **Condition**: When BURN is applied to creature
- **Effect**: 25% chance to spread burn to random ally (3 damage/turn)
- **Chance**: 25%

```typescript
// Outbreak implementation
registerEffectTrigger('STATUS_APPLIED', {
  priority: 50,
  condition: (change, context) => {
    if (change.data.statusId !== 'BURN') return false
    const creature = getCreatureFromContext(context, change.creatureId)
    const hasPassive = creature.passiveAbilities?.some(
      p => p.id === 'outbreak'
    )
    return hasPassive && Math.random() < 0.25 // 25% chance
  },
  createEffect: (change, context) => {
    const creature = getCreatureFromContext(context, change.creatureId)
    const allies = getAliveCreaturesByOwner(context, creature.owner)
      .filter(c => c.ID !== creature.ID && !c.statuses.some(s => s.id === 'BURN'))
    
    if (allies.length === 0) return null
    
    const target = allies[Math.floor(Math.random() * allies.length)]
    return createBurnEffect(target.ID, 3) // Weaker spread
  }
})
```

### Cascading Example Flow

**Scenario**: Dragon attacks Plague Rat with Flame Swipe

```
1. Initial Effect: ATTACK (Dragon → Plague Rat)
   ├─ Damage: 32
   ├─ Apply BURN status (5 dmg/turn, 3 turns)
   └─ State changes: [HEALTH_CHANGE, STATUS_APPLIED(BURN)]

2. Trigger Check: STATUS_APPLIED(BURN)
   ├─ Outbreak passive condition met (25% chance)
   └─ Triggered Effect: BURN (Plague Rat's ally)

3. Cascade Effect: BURN (Goblin)
   ├─ Damage: 3 (weaker spread)
   ├─ Apply BURN status (3 dmg/turn, 3 turns)
   └─ State changes: [HEALTH_CHANGE, STATUS_APPLIED(BURN)]

4. Pipeline completes (no more triggers)
```

---

## Detailed Attack Examples

### Example 1: Simple Physical Attack (Slash)

**Attack Definition**:
```typescript
{
  name: "Slash",
  damage: 15,
  effects: [],
  attackType: "Physical",
  chanceToLand: 1.0
}
```

**Flow**:
```
1. User clicks Slash → performAttack(attackerId: 1, targetId: 2, attack)
2. Create ATTACK effect
3. Pipeline processes:
   ├─ Apply effect
   │  ├─ Calculate: 15 (base) + 25 (attacker) - 8 (defense) = 32 damage
   │  └─ Return: [HEALTH_CHANGE(-32)], [animations]
   ├─ Apply state: target.health = 60 - 32 = 28
   ├─ Execute animations: windup → impact → damage number
   ├─ Notify UI: re-render with health = 28
   ├─ Finish animations: damage number fades
   └─ Check triggers: none
4. Pipeline complete
```

**State Changes**:
```typescript
[
  {
    type: 'HEALTH_CHANGE',
    creatureId: 2,
    data: { delta: -32, newHealth: 28, source: 'attack-Slash' }
  }
]
```

### Example 2: DoT Attack (Flame Swipe with Burn)

**Attack Definition**:
```typescript
{
  name: "Flame Swipe",
  damage: 15,
  effects: ["BURN"],
  attackType: "Physical",
  chanceToLand: 1.0
}
```

**Flow**:
```
1. User clicks Flame Swipe → performAttack(1, 2, attack)
2. Create ATTACK effect
3. Pipeline processes:
   ├─ Apply effect
   │  ├─ Calculate damage: 15 + 25 - 8 = 32
   │  ├─ Process "BURN" effect
   │  └─ Return: [HEALTH_CHANGE(-32), STATUS_APPLIED(BURN)], [animations]
   ├─ Apply state: 
   │  ├─ target.health = 60 - 32 = 28
   │  └─ target.statuses += BURN (duration: 3, dmg: 5)
   ├─ Execute animations: windup → impact → damage → burn effect
   ├─ Notify UI: health + status badge visible
   ├─ Finish animations
   └─ Check triggers: none (BURN applied, not ticked yet)
4. Pipeline complete

Later, at end of turn:
5. processEndOfTurn() called
6. For each creature with BURN:
   ├─ Create BURN effect (tick)
   ├─ Pipeline processes:
   │  ├─ Apply burn damage: -5 health
   │  ├─ Decrement duration: 3 → 2
   │  └─ Animate burn tick
   └─ Repeat for duration
```

**Initial State Changes**:
```typescript
[
  {
    type: 'HEALTH_CHANGE',
    creatureId: 2,
    data: { delta: -32, newHealth: 28, source: 'attack-Flame Swipe' }
  },
  {
    type: 'STATUS_APPLIED',
    creatureId: 2,
    data: { statusId: 'BURN', duration: 3, damagePerTurn: 5 }
  }
]
```

**End of Turn State Changes** (per tick):
```typescript
[
  {
    type: 'HEALTH_CHANGE',
    creatureId: 2,
    data: { delta: -5, newHealth: 23, source: 'burn' }
  },
  {
    type: 'STATUS_DURATION_UPDATED',
    creatureId: 2,
    data: { statusId: 'BURN', duration: 2 }
  }
]
```

### Example 3: Cascading Effect (Attack with Outbreak Trigger)

**Scenario**: Dragon attacks Plague Rat (has Outbreak passive) with Flame Swipe

**Flow**:
```
1. performAttack(1, 5, FlameSwipe)
2. Create ATTACK effect
3. Pipeline processes ATTACK:
   ├─ Damage: 32
   ├─ Apply BURN to Plague Rat
   └─ State: [HEALTH_CHANGE(-32), STATUS_APPLIED(BURN)]

4. Trigger check on STATUS_APPLIED(BURN):
   ├─ Plague Rat has 'outbreak' passive
   ├─ 25% chance check: PASS (random)
   ├─ Find ally without BURN: Goblin
   └─ Create triggered effect: BURN(Goblin, 3)

5. Pipeline adds BURN effect to queue
6. Pipeline processes BURN(Goblin):
   ├─ Damage: 3
   ├─ Apply BURN status
   └─ State: [HEALTH_CHANGE(-3), STATUS_APPLIED(BURN)]

7. Trigger check: none
8. Pipeline complete
```

**Complete State Changes**:
```typescript
// Primary attack
[
  {
    type: 'HEALTH_CHANGE',
    creatureId: 5, // Plague Rat
    data: { delta: -32, newHealth: 18, source: 'attack-Flame Swipe' }
  },
  {
    type: 'STATUS_APPLIED',
    creatureId: 5,
    data: { statusId: 'BURN', duration: 3 }
  }
]

// Triggered cascade
[
  {
    type: 'HEALTH_CHANGE',
    creatureId: 2, // Goblin
    data: { delta: -3, newHealth: 57, source: 'burn-outbreak' }
  },
  {
    type: 'STATUS_APPLIED',
    creatureId: 2,
    data: { statusId: 'BURN', duration: 3 }
  }
]
```

### Example 4: Counter-Attack (Stone Thorns Passive)

**Scenario**: Dragon attacks Golem (has Stone Thorns passive)

**Flow**:
```
1. performAttack(1, 3, Slash)
2. Create ATTACK effect
3. Pipeline processes ATTACK:
   ├─ Damage to Golem: 15 + 25 - 25 (high defense) = 15
   └─ State: [HEALTH_CHANGE(-15, sourceCreatureId: 1)]

4. Trigger check on HEALTH_CHANGE:
   ├─ Golem has 'stone-thorns' passive
   ├─ Damage taken (delta < 0): YES
   ├─ Source creature ID present: YES (1 = Dragon)
   └─ Create triggered effect: TRUE_DAMAGE(Dragon, 15)

5. Pipeline adds TRUE_DAMAGE effect
6. Pipeline processes TRUE_DAMAGE(Dragon):
   ├─ Damage: 15 (ignores defense)
   └─ State: [HEALTH_CHANGE(-15)]

7. Trigger check: none (Dragon has no passive)
8. Pipeline complete
```

**Complete State Changes**:
```typescript
// Primary attack
[
  {
    type: 'HEALTH_CHANGE',
    creatureId: 3, // Golem
    data: { 
      delta: -15, 
      newHealth: 65, 
      source: 'attack-Slash',
      sourceCreatureId: 1 // Dragon
    }
  }
]

// Counter-attack
[
  {
    type: 'HEALTH_CHANGE',
    creatureId: 1, // Dragon
    data: { 
      delta: -15, 
      newHealth: 85, 
      source: 'passive-stone-thorns'
    }
  }
]
```

### Example 5: Cleanse Attack (Remove Debuffs)

**Attack Definition**:
```typescript
{
  name: "Cleanse",
  damage: 0,
  effects: ["CLEANSE"],
  attackType: "SupportHealing",
  chanceToLand: 1.0
}
```

**Scenario**: Goblin has BURN and WEAKEN, Dragon cleanses

**Flow**:
```
1. performAttack(1, 2, Cleanse)
2. Create ATTACK effect
3. Pipeline processes ATTACK:
   ├─ Damage: 0 (support attack)
   ├─ Process "CLEANSE" effect:
   │  ├─ Find all debuffs on target
   │  ├─ Goblin has: BURN, ATTACK_DEBUFF
   │  └─ Create STATUS_REMOVED for each
   └─ State: [STATUS_REMOVED(BURN), STATUS_REMOVED(ATTACK_DEBUFF)]

4. Apply state:
   ├─ Remove BURN from statuses
   └─ Remove ATTACK_DEBUFF from statuses

5. UI update: status badges disappear
6. Pipeline complete
```

**State Changes**:
```typescript
[
  {
    type: 'STATUS_REMOVED',
    creatureId: 2,
    data: { statusId: 'BURN', reason: 'cleansed' }
  },
  {
    type: 'STATUS_REMOVED',
    creatureId: 2,
    data: { statusId: 'ATTACK_DEBUFF', reason: 'cleansed' }
  }
]
```

### Example 6: Stun Attack (Crowd Control)

**Attack Definition**:
```typescript
{
  name: "Stunning Blow",
  damage: 10,
  effects: ["STUN"],
  attackType: "Physical",
  chanceToLand: 1.0
}
```

**Flow**:
```
1. performAttack(1, 2, StunningBlow)
2. Create ATTACK effect
3. Pipeline processes:
   ├─ Damage: 10 + 25 - 8 = 27
   ├─ Process "STUN" effect
   └─ State: [HEALTH_CHANGE(-27), STATUS_APPLIED(STUN, duration: 2)]

4. Apply state:
   ├─ target.health -= 27
   └─ target.statuses += STUN

5. Next turn:
   ├─ Goblin tries to act
   ├─ Check for STUN status
   ├─ Skip Goblin's turn
   └─ Decrement STUN duration: 2 → 1

6. Turn after:
   ├─ STUN duration: 1 → 0
   └─ Remove STUN status
```

---

## Turn Processing

### End of Turn Flow

**Entry Point**: User clicks "End Turn" button

```typescript
const processEndOfTurn = useCallback(async () => {
  console.group('🔄 Processing End of Turn')
  
  // 1. Collect all creatures with DoT/HoT statuses
  const allCreatures = [
    ...battleState.playerCreatures,
    ...battleState.computerCreatures
  ]
  
  const effectsToApply: Effect[] = []
  
  // 2. For each alive creature with statuses
  for (const creature of allCreatures) {
    if (creature.health <= 0) continue
    
    for (const status of creature.statuses) {
      // 3. Create tick effects for DoT/HoT
      if (status.id === 'BURN') {
        effectsToApply.push(createBurnEffect(creature.ID))
      } else if (status.id === 'POISON') {
        effectsToApply.push(createPoisonEffect(creature.ID))
      } else if (status.id === 'REGENERATION') {
        effectsToApply.push(createRegenerationEffect(creature.ID))
      }
    }
  }
  
  // 4. Process all tick effects sequentially
  for (const effect of effectsToApply) {
    await processEffectChain(effect, contextRef.current)
  }
  
  // 5. Decrement all status durations
  const decrementChanges: StateChange[] = []
  for (const creature of allCreatures) {
    for (const status of creature.statuses) {
      const newDuration = status.duration - 1
      if (newDuration <= 0) {
        // Remove expired status
        decrementChanges.push({
          type: 'STATUS_REMOVED',
          creatureId: creature.ID,
          timestamp: Date.now(),
          data: { statusId: status.id, reason: 'expired' }
        })
      } else {
        // Update duration
        decrementChanges.push({
          type: 'STATUS_DURATION_UPDATED',
          creatureId: creature.ID,
          timestamp: Date.now(),
          data: { statusId: status.id, duration: newDuration }
        })
      }
    }
  }
  
  // 6. Apply duration changes
  applyChangesToContext(contextRef.current, decrementChanges)
  
  console.groupEnd()
}, [battleState])
```

### Turn Timeline Example

**Turn 1**:
```
Start: Dragon (100 HP), Goblin (60 HP, no statuses)

Action: Dragon uses Flame Swipe on Goblin
  → Goblin: 60 → 28 HP, BURN(3) applied

End Turn:
  → Goblin BURN tick: 28 → 23 HP
  → BURN duration: 3 → 2
```

**Turn 2**:
```
Start: Dragon (100 HP), Goblin (23 HP, BURN(2))

Action: Goblin attacks Dragon
  → Dragon: 100 → 88 HP

End Turn:
  → Goblin BURN tick: 23 → 18 HP
  → BURN duration: 2 → 1
```

**Turn 3**:
```
Start: Dragon (88 HP), Goblin (18 HP, BURN(1))

Action: Dragon uses Cleanse on Goblin
  → Goblin: BURN removed

End Turn:
  → No status ticks (BURN was cleansed)
```

---

## Animation System Integration

### Animation Types

```typescript
type Animation = {
  type: 'attack-windup' | 'impact' | 'damage-number' | 'burn' | 
        'shake' | 'healing' | 'status-apply' | ...
  targetId: number
  duration: number
  data?: {
    value?: number
    label?: string
    isTotal?: boolean
    delay?: number
  }
}
```

### Animation Execution

**Sequential Processing**:
```typescript
const executeAnimationsSequentially = async (
  animations: Animation[]
): Promise<() => Promise<void>> => {
  
  // Play animations one-by-one
  for (const animation of animations) {
    await playAnimation(animation)
  }
  
  // Return finish callback (for fade-out)
  return async () => {
    await waitForAllAnimationsToComplete()
  }
}
```

**Timing Example**:
```
0ms:    Attack windup starts
600ms:  Impact effect
900ms:  Damage number appears (but doesn't wait for fade)
900ms:  RETURN finishAnimations callback
...
UI notification happens here (damage number visible)
...
2400ms: Damage number fades out (in background)
```

### Damage Number Display

**Breakdown Display**:
```
Flame Swipe: 15
Attack Bonus: +25
Defense: -8
─────────────
Total Damage: 32
```

**Implementation**:
```typescript
const damageBreakdown = [
  { label: 'Flame Swipe', value: 15 },
  { label: 'Attack Bonus', value: 25 },
  { label: 'Defense', value: -8 },
  { label: 'Total Damage', value: 32, isTotal: true }
]

// Each gets its own animation with delay
damageBreakdown.map((breakdown, index) => ({
  type: 'damage-number',
  targetId: targetId,
  duration: 1500,
  data: {
    value: breakdown.value,
    label: breakdown.label,
    isTotal: breakdown.label === 'Total Damage',
    delay: index * 200 // Stagger display
  }
}))
```

---

## Debugging Guide

### Console Logging Structure

**Effect Pipeline**:
```
🔄 Processing Effect Chain: attack-123456
  ⚙️ Executing Effect Pipeline for: attack-123456
    Pipeline step 1
      Processing effect: ATTACK
        ⚔️ Attack: Dragon attacks Goblin for 32 damage (60 → 28)
        📦 Effect ATTACK returned: {
          stateChangesCount: 2,
          stateChangeTypes: ['HEALTH_CHANGE', 'STATUS_APPLIED'],
          animationsCount: 4
        }
        🔧 Applying state changes to context...
        ✅ State changes applied to context
        📢 Notifying UI subscribers...
        ✅ Display updated
        Checking for triggered effects...
        No triggered effects
    Pipeline completed
```

### Debug Tools

**Get Pipeline State**:
```typescript
const debugInfo = getDebugInfo()
console.log('Pipeline:', debugInfo.pipeline)
// { isProcessing: false, queueLength: 0, processedCount: 5 }
```

**Get Trigger Rules**:
```typescript
const triggers = getTriggerDebugInfo()
console.log('Registered triggers:', triggers)
// { HEALTH_CHANGE: 2, STATUS_APPLIED: 1 }
```

**Check Creature State**:
```typescript
console.log('Creature:', {
  name: creature.name,
  health: creature.health,
  statuses: creature.statuses.map(s => `${s.id}(${s.duration})`),
  passiveAbilities: creature.passiveAbilities?.map(p => p.id)
})
```

### Common Issues

**Issue**: Health not updating
- Check: Are state changes being created?
- Check: Is `applyChangesToContext` being called?
- Check: Is Zustand store receiving updates?
- Fix: Ensure immutable updates, not mutations

**Issue**: Animations not playing
- Check: Are animations being returned from applicator?
- Check: Is `executeAnimationsSequentially` being called?
- Fix: Ensure animation objects have correct structure

**Issue**: Triggers not firing
- Check: Are trigger rules registered?
- Check: Does condition function return true?
- Check: Is `resolveTriggeredEffects` being called?
- Fix: Add console logs to condition function

**Issue**: Infinite loop
- Check: Are effects being marked as processed?
- Check: Is `generateEffectId` creating unique IDs?
- Fix: Ensure effects have unique IDs based on type + target

---

## Summary

The attack flow system is a robust, declarative pipeline that:

1. **Separates concerns**: State, logic, and animations are decoupled
2. **Handles cascading**: Triggers automatically process chains
3. **Prevents race conditions**: Sequential processing ensures order
4. **Maintains immutability**: All state updates are pure
5. **Provides debugging**: Comprehensive logging at each step

**Key Files**:
- `effectPipelineEngine.ts`: Main orchestrator
- `effectApplicatorRegistry.ts`: Effect → applicator mapping
- `combatEffects.ts`: Attack, damage, healing effects
- `statusEffects.ts`: DoT, HoT, buff/debuff effects
- `effectResolver.ts`: Trigger system
- `zustandAdapter.ts`: State management bridge
- `useBattleEngine.ts`: React integration hook

**Effect Types Implemented**:
- ATTACK (with effect processing)
- TRUE_DAMAGE
- HEAL
- BURN (DoT)
- POISON (DoT)
- REGENERATION (HoT)
- STUN (CC)
- BUFF/DEBUFF (stat mods)
- CLEANSE (remove debuffs)
- AOE_ATTACK (multi-target)

This system provides a solid foundation for complex battle mechanics, status effects, and cascading interactions while maintaining code clarity and testability.
