# Battle System Explained

**Last Updated**: November 16, 2025  
**Status**: Core system functional, investigating double-trigger bug

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Effect Pipeline Flow](#effect-pipeline-flow)
4. [State Management](#state-management)
5. [Animation System](#animation-system)
6. [Trigger System](#trigger-system)
7. [Current Bug: Double Retaliation](#current-bug-double-retaliation)
8. [Attack Types](#attack-types)
9. [Status Effects](#status-effects)
10. [Passive Abilities](#passive-abilities)

---

## Overview

Squad's battle system is a **turn-based tactical combat engine** featuring:

- **Effect Pipeline Architecture**: All game actions (attacks, healing, status effects) flow through a unified pipeline
- **Reactive Trigger System**: Passive abilities automatically respond to state changes (damage taken, status applied, etc.)
- **Immutable State Updates**: State never mutates directly - all changes create new state objects
- **Animation Integration**: Actions pause the pipeline until animations complete for proper visual feedback
- **Zustand State Management**: React integration via Zustand for efficient re-renders

### Key Design Principles

1. **Everything is an Effect**: Attacks, healing, status application, passive triggers - all processed uniformly
2. **Cascading Effects**: Effects can trigger other effects (e.g., damage → passive ability → counter-attack)
3. **Async by Default**: All effects are async to accommodate animations and network calls (future)
4. **Type-Safe**: TypeScript throughout with strict typing
5. **Testable**: Pure functions with dependency injection for easy unit testing

---

## Architecture

### High-Level Component Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    BattleEngineExample.tsx                   │
│              (UI Component - User Interactions)              │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     useBattleEngine.ts                       │
│           (React Hook - Bridges UI to Engine)               │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 effectPipelineEngine.ts                      │
│              (Core - Processes Effect Chains)                │
└───────────┬───────────────┴────────────────┬────────────────┘
            │                                 │
            ↓                                 ↓
┌───────────────────────┐         ┌─────────────────────────┐
│   battleContext.ts    │         │  animationEngine.ts     │
│  (State Management)   │         │  (Visual Feedback)      │
└───────────────────────┘         └─────────────────────────┘
            │
            ↓
┌─────────────────────────────────────────────────────────────┐
│                      zustandAdapter.ts                       │
│              (React Integration via Zustand)                 │
└─────────────────────────────────────────────────────────────┘
```

### Core Files and Responsibilities

| File | Purpose | Key Functions |
|------|---------|---------------|
| `effectPipelineEngine.ts` | Orchestrates effect processing | `processEffectChain()`, `executeEffectPipeline()` |
| `battleContext.ts` | Manages battle state immutably | `applyChangesToContext()`, `createBattleContext()` |
| `effectApplicatorRegistry.ts` | Maps effect types to handlers | `registerEffectHandler()`, `applyEffect()` |
| `checkTriggers.ts` | Detects passive ability triggers | `checkTriggers()`, `registerTrigger()` |
| `animationEngine.ts` | Executes visual effects | `executeAnimationsSequentially()` |
| `zustandAdapter.ts` | React/Zustand integration | `createZustandBattleStore()` |

---

## Effect Pipeline Flow

### Complete Flow: User Click to UI Update

Let's trace what happens when a player clicks "Attack":

```
┌──────────────────────────────────────────────────────────────┐
│ Step 1: USER CLICKS ATTACK BUTTON                            │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────────┐
│ Step 2: UI Event Handler (BattleEngineExample.tsx)           │
│   - handleCreatureClick() called                             │
│   - Creates attack payload                                   │
│   - Calls executeAttack()                                    │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────────┐
│ Step 3: Battle Engine Hook (useBattleEngine.ts)              │
│   - executeAttack() receives payload                         │
│   - Creates ATTACK effect object                             │
│   - Calls processEffectChain()                               │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────────┐
│ Step 4: Effect Pipeline Engine                               │
│   - processEffectChain() entry point                         │
│   - Creates empty effect pipeline                            │
│   - Adds ATTACK effect to pipeline                           │
│   - Begins pipeline execution loop                           │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────────┐
│ Step 5: Effect Application (Loop Start)                      │
│   - getNextEffect() pulls ATTACK from pipeline               │
│   - applyEffect() routes to attack handler                   │
│   - Handler executes combat logic                            │
│   - Returns: { stateChanges: [...], animations: [...] }      │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────────┐
│ Step 6: State Updates (DEFERRED NOTIFICATION)                │
│   - applyChangesToContext() receives state changes           │
│   - Each change applied immutably:                           │
│     * HEALTH_CHANGE: target.health = 80 → 65                 │
│   - State updated but subscribers NOT notified yet           │
│   - Why defer? So animations can start before React rerenders│
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────────┐
│ Step 7: Animation Execution                                  │
│   - executeAnimationsSequentially() processes:               │
│     1. attack-windup (200ms)                                 │
│     2. impact (300ms)                                        │
│     3. damage-number (800ms fade-in)                         │
│   - Returns finishAnimations() callback                      │
│   - Pipeline waits for damage numbers to APPEAR (not fade)   │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────────┐
│ Step 8: Notify React (END OF DEFERRAL)                       │
│   - notifyContextSubscribers() now called                    │
│   - Zustand store updated                                    │
│   - React re-renders with new state                          │
│   - UI shows updated health bar                              │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────────┐
│ Step 9: Check for Triggered Effects                          │
│   - checkTriggers() analyzes state changes                   │
│   - Finds: HEALTH_CHANGE on creature #3 (Rocky)              │
│   - Checks registered triggers for HEALTH_CHANGE             │
│   - Rocky has "Stone Thorns" passive ability                 │
│   - Trigger condition met: creature took damage              │
│   - Creates TRUE_DAMAGE effect targeting attacker            │
│   - Adds to pipeline                                         │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────────┐
│ Step 10: Process Triggered Effect (LOOP CONTINUES)           │
│   - Pipeline still has effects (TRUE_DAMAGE)                 │
│   - Goes back to Step 5 with new effect                      │
│   - TRUE_DAMAGE handler executes                             │
│   - Dragon takes 15 counter damage                           │
│   - More animations play                                     │
│   - Check for more triggers... (could cascade further!)      │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ↓
┌──────────────────────────────────────────────────────────────┐
│ Step 11: Pipeline Complete                                   │
│   - No more effects in queue                                 │
│   - Pipeline loop exits                                      │
│   - All animations finished                                  │
│   - User can take next action                                │
└──────────────────────────────────────────────────────────────┘
```

### Pipeline Loop Details

The pipeline runs a **while loop** until the effect queue is empty:

```typescript
while (hasEffectsInPipeline(pipeline) && stepCount < maxSteps) {
  // 1. Get next effect
  const effect = getNextEffect(pipeline)
  
  // 2. Apply effect → get state changes + animations
  const { stateChanges, animations } = await applyEffect(effect, context)
  
  // 3. Apply state changes (deferred notification)
  applyChangesToContext(context, stateChanges, { deferNotification: true })
  
  // 4. Execute animations
  const finishAnimations = await executeAnimationsSequentially(animations)
  
  // 5. Notify React NOW (after damage numbers appear)
  notifyContextSubscribers(context, stateChanges)
  
  // 6. Wait for animations to fully finish
  await finishAnimations()
  
  // 7. Check for triggered effects
  const newEffects = checkTriggers(stateChanges, context)
  
  // 8. Add triggered effects to pipeline
  newEffects.forEach(e => addEffectToPipeline(pipeline, e))
  
  // Loop continues if more effects were added!
}
```

**Key Insight**: This is why one attack can cause multiple effects to cascade!

---

## State Management

### Immutable State Pattern

The battle system **never mutates state directly**. Every change creates a new state object.

```typescript
// ❌ WRONG - Direct mutation
creature.health -= 15

// ✅ CORRECT - Immutable update
const updatedCreature = {
  ...creature,
  health: creature.health - 15
}
```

### State Change Types

All state modifications flow through typed `StateChange` objects:

| Type | Description | Example Data |
|------|-------------|--------------|
| `HEALTH_CHANGE` | HP increase/decrease | `{ delta: -15, newHealth: 65, source: 'attack' }` |
| `STATUS_APPLIED` | Status effect added | `{ statusId: 'BURN', duration: 3 }` |
| `STATUS_REMOVED` | Status effect removed | `{ statusId: 'POISON', reason: 'expired' }` |
| `STAT_MODIFIED` | ATK/DEF/SPD changed | `{ stat: 'attack', delta: +5, duration: 3 }` |
| `CREATURE_DIED` | Creature reduced to 0 HP | `{ creatureId: 5, killer: 2 }` |

### BattleContext Structure

```typescript
type BattleContext = {
  contextId: string              // Unique ID for debugging
  state: BattleState             // Current state
  stateHistory: BattleState[]    // For rollback/undo
  subscribers: Map<string, Function[]>  // React update callbacks
}

type BattleState = {
  playerCreatures: Creature[]
  computerCreatures: Creature[]
  mp: number                     // Mana points
  turn: number
  battleStatus: string | null    // 'victory', 'defeat', null
}
```

### Zustand Integration

The system can run with or without Zustand:

```typescript
// Direct BattleContext (no React)
const context = createBattleContext(initialState)

// Zustand-wrapped (for React)
const store = createZustandBattleStore(initialState)
const context = zustandToBattleContext(store)
```

When Zustand is enabled (`USE_ZUSTAND_ADAPTER = true`):
- All state changes automatically trigger React re-renders
- Subscribers get notified via Zustand's built-in system
- State is accessible via `useStore()` hooks

---

## Animation System

### Animation Types

| Animation Type | Duration | Purpose |
|----------------|----------|---------|
| `attack-windup` | 200ms | Attacker prepares |
| `impact` | 300ms | Hit lands on target |
| `damage-number` | 800ms | Damage floats up, fades |
| `status-badge` | 500ms | Status icon appears |
| `death` | 1000ms | Creature defeated animation |

### Animation Queue Strategy

**Problem**: If React re-renders before animations start, the UI might show stale creature positions/states.

**Solution**: Deferred notification

```typescript
// 1. Update state BUT don't notify React yet
applyChangesToContext(context, changes, { deferNotification: true })

// 2. Start animations
const finish = await executeAnimationsSequentially(animations)

// 3. NOW notify React (damage numbers are visible)
notifyContextSubscribers(context, changes)

// 4. Wait for animations to fully fade out
await finish()

// 5. Safe to process next effect
```

This ensures:
- ✅ Animations start on correct creatures
- ✅ Damage numbers appear before health bars update
- ✅ Visual feedback is smooth and correct

### Animation Engine Implementation

```typescript
export const executeAnimationsSequentially = async (
  animations: Animation[]
): Promise<() => Promise<void>> => {
  let resolveFinish: () => void
  const finishPromise = new Promise<void>(resolve => {
    resolveFinish = resolve
  })

  // Execute animations in sequence
  for (const anim of animations) {
    await executeAnimation(anim)
  }

  // Return callback to wait for fade-out
  return async () => {
    await new Promise(r => setTimeout(r, 1200)) // Fade duration
    resolveFinish()
  }
}
```

**Two-phase approach**:
1. **Phase 1**: Animations appear (damage numbers visible) - pipeline continues
2. **Phase 2**: Animations fade out - pipeline waits before next effect

---

## Trigger System

### How Triggers Work

Triggers are **reactive rules** that create new effects in response to state changes.

```typescript
type TriggerRule = {
  // When should this trigger fire?
  condition: (change: StateChange, context: BattleContext) => boolean
  
  // What effect should it create?
  createEffect: (change: StateChange, context: BattleContext) => Effect
  
  // Priority for ordering
  priority?: number
}
```

### Trigger Registration

Triggers are registered at app initialization:

```typescript
// Example: Stone Thorns passive ability
registerTrigger('HEALTH_CHANGE', {
  condition: (change, context) => {
    const creature = findCreature(change.creatureId, context)
    return creature.hasPassive('stone-thorns') && change.data.delta < 0
  },
  createEffect: (change, context) => ({
    id: `stone-thorns-${Date.now()}`,
    type: 'TRUE_DAMAGE',
    targetId: change.data.sourceCreatureId,
    priority: 50,
    data: { damage: 15, source: 'Stone Thorns' }
  }),
  priority: 50
})
```

### Trigger Flow

```
Attack lands → HEALTH_CHANGE state change
                        ↓
           checkTriggers() scans all rules
                        ↓
        Stone Thorns condition evaluates
                        ↓
              Condition returns TRUE
                        ↓
          createEffect() generates TRUE_DAMAGE
                        ↓
        Effect added to pipeline queue
                        ↓
    Pipeline loop processes TRUE_DAMAGE next
```

### Cascading Triggers

Triggers can create effects that themselves trigger more effects:

```
Poison applied → STATUS_APPLIED
                      ↓
              Outbreak triggered
                      ↓
          Spread poison to ally
                      ↓
      Another STATUS_APPLIED
                      ↓
      Another Outbreak (if ally has it too!)
                      ↓
              Continue cascading...
```

**Safety**: Pipeline has a max step count (50) to prevent infinite loops.

---

## Current Bug: Double Retaliation

### The Problem

When Rocky (Golem) is attacked once, Stone Thorns triggers **twice**, dealing counter damage twice:

```
Dragon attacks Rocky (80 → 65)  ← One attack
  ↓
Stone Thorns: Rocky retaliates (100 → 85)  ← First counter
  ↓
Stone Thorns: Rocky retaliates (85 → 70)   ← Second counter ❌
```

### Log Analysis

From your console output:

```
1. combatEffects.ts:64 
   ⚔️ Attack: Dragon attacks Rocky (Golem) for 15 damage (80 → 65)
   
2. battleContext.ts:117 
   ❤️❤️❤️ applyHealthChange: {creatureId: 3, delta: -15, currentHealth: 80}
   
3. triggerSetup.ts:315 
   🌿 Rocky (Golem)'s Stone Thorns triggered!  ← FIRST TRIGGER
   
4. combatEffects.ts:301 
   💥 True Damage: Rocky deals 15 true damage to Dragon (100 → 85)
   
5. triggerSetup.ts:315 
   🌿 Rocky (Golem)'s Stone Thorns triggered!  ← SECOND TRIGGER ❌
   
6. combatEffects.ts:301 
   💥 True Damage: Rocky deals 15 true damage to Dragon (85 → 70)
```

### Step-by-Step Breakdown

Let me trace the exact sequence:

#### Step 1: Initial Attack Effect

```
Effect: ATTACK
  ↓
applyEffect() → combatEffects.ts attack handler
  ↓
Creates HEALTH_CHANGE: { creatureId: 3, delta: -15 }
  ↓
Returns: { stateChanges: [HEALTH_CHANGE], animations: [...] }
```

#### Step 2: State Updated

```
applyChangesToContext() processes HEALTH_CHANGE
  ↓
Rocky's health: 80 → 65 (immutable update)
  ↓
State change stored in array for trigger checking
```

#### Step 3: Check Triggers (FIRST CHECK)

```
checkTriggers([HEALTH_CHANGE], context)
  ↓
Finds trigger rule for HEALTH_CHANGE
  ↓
Condition: Rocky has Stone Thorns + delta < 0 ✅
  ↓
Creates Effect: TRUE_DAMAGE targeting Dragon
  ↓
Adds to pipeline queue
```

#### Step 4: Process First Counter

```
Pipeline processes TRUE_DAMAGE effect
  ↓
Dragon takes 15 damage (100 → 85)
  ↓
Creates HEALTH_CHANGE: { creatureId: 1, delta: -15 }
  ↓
Applies state change
```

#### Step 5: Check Triggers (SECOND CHECK) ⚠️

```
checkTriggers([HEALTH_CHANGE], context)
  ↓
This is checking DRAGON's health change, not Rocky's!
  ↓
Why does Stone Thorns trigger again? 🤔
```

### Hypothesis: The Bug Source

Looking at the logs, I see two `HEALTH_CHANGE` events being processed, but the **second trigger shouldn't fire**. Here are potential causes:

#### Theory 1: Duplicate State Changes

The initial attack might be creating **two** HEALTH_CHANGE state changes somehow:

```typescript
// Somewhere in combatEffects.ts attack handler
stateChanges.push({
  type: 'HEALTH_CHANGE',
  creatureId: targetId,
  delta: -15,
  // ...
})

// Is it being added twice? Or processed twice?
```

#### Theory 2: Trigger Condition Too Broad

The Stone Thorns trigger might not be checking if **Rocky** took damage, just if **any** HEALTH_CHANGE with negative delta occurred:

```typescript
// ❌ BAD - Triggers on ANY creature taking damage
condition: (change) => change.data.delta < 0

// ✅ GOOD - Only triggers when THIS creature takes damage
condition: (change, context) => {
  const creature = findCreature(change.creatureId)
  return creature.id === 3 && change.data.delta < 0
}
```

#### Theory 3: State Change Array Not Cleared

After checking triggers for the first HEALTH_CHANGE, the array might not be getting cleared:

```typescript
// First effect completes
const changes1 = [HEALTH_CHANGE on Rocky]
checkTriggers(changes1) // Creates TRUE_DAMAGE effect

// Second effect (TRUE_DAMAGE) completes
const changes2 = [HEALTH_CHANGE on Dragon]
checkTriggers(changes2) // Should NOT trigger Stone Thorns

// But what if changes2 still contains changes1?
const changes2 = [
  HEALTH_CHANGE on Rocky,  ← Still here from before!
  HEALTH_CHANGE on Dragon
]
```

### Investigation Steps

To fix this, we need to:

1. **Check trigger condition logic** - Is it filtering by the correct creatureId?
2. **Verify state change arrays** - Are they being properly scoped per effect?
3. **Add trigger deduplication** - Prevent same trigger from firing twice for same state change
4. **Add detailed logging** - Log which creature ID each trigger is checking

### Recommended Fix

Add a unique ID to state changes and track which have been processed:

```typescript
type StateChange = {
  id: string  // Add unique ID
  type: StateChangeType
  creatureId: number
  // ...
}

// In checkTriggers
const processedChanges = new Set<string>()

stateChanges.forEach(change => {
  if (processedChanges.has(change.id)) {
    console.log('⏭️ Skipping already processed change')
    return
  }
  
  processedChanges.add(change.id)
  // ... rest of trigger logic
})
```

---

## Attack Types

The battle system supports 32+ different attack types across 6 categories:

### 1. Direct Damage (4 types)

Pure damage with no additional effects.

- **Slash**: 15 damage, basic physical
- **Heavy Strike**: 25 damage, ignores 50% defense
- **True Strike**: 20 true damage, ignores ALL defense
- **Pierce**: 12 damage + 8 true damage (hybrid)

### 2. Status Effects - DoT (6 types)

Applies damage-over-time debuffs.

- **Burn**: 10 dmg/turn for 3 turns (30 total)
- **Flame Swipe**: 15 damage + burn (5/turn × 3)
- **Inferno**: 10 damage + intense burn (15/turn × 4)
- **Poison**: 15 dmg/turn for 3 turns (45 total)
- **Toxic Bite**: 8 damage + poison (10/turn × 4)
- **Bleed**: 12 damage + bleeding (8/turn × 3)

### 3. Control & Debuffs (6 types)

Reduce enemy effectiveness or prevent actions.

- **Stun**: 10 damage + cannot act for 1 turn
- **Freeze**: 5 damage + cannot act for 2 turns
- **Weaken**: 8 damage + reduce ATK by 5 for 3 turns
- **Shatter Armor**: 10 damage + reduce DEF by 8 for 3 turns
- **Slow**: Reduce speed by 50% for 3 turns
- **Silence**: Prevent abilities for 2 turns

### 4. Buffs & Support (4 types)

Enhance allies or self.

- **Power Up**: 12 damage + gain +5 ATK for 3 turns (self)
- **Fortify**: Grant target +10 DEF for 3 turns
- **Haste**: Increase speed by 100% for 2 turns
- **Regeneration**: Heal 10 HP/turn for 4 turns

### 5. Healing & Cleanse (3 types)

Restore health or remove debuffs.

- **Heal**: Restore 25 HP to target
- **Greater Heal**: Restore 50 HP to target
- **Cleanse**: Remove ALL debuffs from target

### 6. Special & Hybrid (9 types)

Complex mechanics and multi-target effects.

- **Life Drain**: 18 damage + heal self for 50% of damage dealt
- **Execute**: 30 damage (double if target below 25% HP)
- **Kindle**: 10 burn damage + spread to 1 ally
- **Chain Lightning**: 15 damage, bounces to 2 enemies (8 dmg each)
- **Meteor**: 30 damage to target + 10 splash to all others
- **Sacrifice**: Deal 50 damage but lose 25% of your own health

---

## Status Effects

### Active Status Effects

| Status | Type | Duration | Effect | Icon |
|--------|------|----------|--------|------|
| Burn | Debuff | 3 turns | 5-10 dmg/turn | 🔥 |
| Poison | Debuff | 3-4 turns | 10-15 dmg/turn | 🧪 |
| Bleed | Debuff | 3 turns | 8 dmg/turn | 🩸 |
| Stun | Control | 1-2 turns | Cannot act | 💫 |
| Freeze | Control | 2 turns | Cannot act | ❄️ |
| Weaken | Debuff | 3 turns | -5 ATK | ⚔️↓ |
| Armor Break | Debuff | 3 turns | -8 DEF | 🛡️💥 |
| Slow | Debuff | 3 turns | -50% SPD | 🐌 |
| Silence | Control | 2 turns | No abilities | 🔇 |
| Regen | Buff | 3-4 turns | +10 HP/turn | 💚 |
| Power Up | Buff | 3 turns | +5 ATK | 💪 |
| Fortify | Buff | 3 turns | +10 DEF | 🛡️ |
| Haste | Buff | 2 turns | +100% SPD | ⚡ |

### Status Ticking System

Status effects tick at the **end of each turn**:

```typescript
function endTurn() {
  // 1. Increment turn counter
  state.turn++
  
  // 2. Tick all status effects on all creatures
  allCreatures.forEach(creature => {
    creature.statuses.forEach(status => {
      // Apply status effect
      applyStatusDamage(creature, status)
      
      // Decrease duration
      status.duration--
      
      // Remove if expired
      if (status.duration <= 0) {
        removeStatus(creature, status)
      }
    })
  })
  
  // 3. Switch active player
  switchTurns()
}
```

---

## Passive Abilities

### Implemented Passives

#### Stone Thorns (Golem)
- **Trigger**: When damaged
- **Effect**: Deal 15 true damage back to attacker
- **Scope**: LOCAL (only this creature)
- **Priority**: 50

```typescript
{
  id: 'stone-thorns',
  name: 'Stone Thorns',
  description: 'When damaged, deals 15 true damage back to attacker',
  trigger: 'on_damaged',
  effect: {
    type: 'damage',
    targetType: 'attacker',
    value: 15,
    damageType: 'true'
  },
  icon: '🪨'
}
```

#### Poison Skin (Plague Rat - planned)
- **Trigger**: When damaged
- **Effect**: 75% chance to poison attacker
- **Scope**: LOCAL
- **Priority**: 50

#### Outbreak (Plague Rat)
- **Trigger**: When poison is applied to this creature
- **Effect**: Spread poison to 1 random ally
- **Scope**: LOCAL (only Plague Rat can trigger, despite spreading to team)
- **Priority**: 40
- **Note**: Should only trigger on Plague Rat, not all creatures

#### Flame Retribution (Phoenix)
- **Trigger**: When damaged
- **Effect**: 75% chance to burn attacker for 6 damage
- **Scope**: LOCAL
- **Priority**: 50

### Passive Ability Scopes

| Scope | Description | Example |
|-------|-------------|---------|
| LOCAL | Only affects creature with passive | Stone Thorns, Poison Skin |
| TEAM | Affects all allies | Battle Cry (+10% ATK aura) |
| GLOBAL | Affects all creatures in battle | Weather effects |
| ENEMY_TEAM | Affects all enemies | Intimidate (-5% ATK aura) |

### Planned Passives

- **Berserker**: Gain +5 ATK when damaged
- **Last Stand**: +50% ATK when below 25% HP
- **Lifesteal**: Heal for 30% of damage dealt
- **Immunity**: Immune to status effects
- **Cleanse**: Remove 1 debuff at end of turn
- **Battle Cry**: +10% ATK to all allies (TEAM scope)
- **Guardian**: +5 DEF to all allies (TEAM scope)

---

## Testing

### Unit Tests

```bash
npm test
```

Tests cover:
- Effect pipeline processing
- State change immutability
- Trigger system logic
- Animation sequencing
- Zustand integration

### E2E Tests (Playwright)

```bash
npm run test:e2e          # Run all E2E tests
npm run test:e2e:ui       # Interactive mode
npm run test:e2e:headed   # See browser
```

**Critical**: E2E tests must account for async pipeline + React render delays:

```typescript
// ❌ BAD - Reads stale value
await page.click('[data-testid="attack-button"]')
const health = await getCreatureHealth(page, 'Goblin')

// ✅ GOOD - Waits for pipeline + animations + React
await page.click('[data-testid="attack-button"]')
await page.waitForTimeout(2000)  // Let pipeline complete
const health = await getCreatureHealth(page, 'Goblin')
```

**Timing Guidelines**:
- Simple attack: 2000ms
- Status effect application: 2000ms
- Turn end with ticking: 3000ms
- Cascading effects (Outbreak): 5000ms+

See `docs/technical/E2E_TIMING_BEST_PRACTICES.md` for details.

---

## Future Enhancements

### Phase 2: Turn System (In Progress)
- [ ] Status effects tick on turn end
- [ ] Turn counter display
- [ ] Status duration countdown
- [ ] Victory/defeat conditions

### Phase 3: Attack Variety
- [ ] Multi-target attacks (AoE, cleave, chain)
- [ ] Attack types (physical vs magical)
- [ ] Combo attacks (bonus vs burning/poisoned)
- [ ] Self-damage attacks (recoil, sacrifice)

### Phase 4: Advanced Passives
- [ ] Aura passives (TEAM scope)
- [ ] Conditional passives (triggers at low HP, etc.)
- [ ] Passive stacking (multiple passives per creature)
- [ ] Passive cooldowns

### Phase 5: Items & Runes
- [ ] Equipment slots (weapon, armor, accessory)
- [ ] Runes modify attacks
- [ ] Set bonuses
- [ ] Item passives

---

## Debugging Tips

### Enable Verbose Logging

The system has extensive console logging with emoji tags:

- 🔄 State changes
- ⚙️ Effect processing
- 🔍 Trigger checks
- ⏰ Animation timing
- 🔧 Configuration
- ❤️ Health changes
- 🎯 Attack execution

### Common Issues

**Issue**: UI doesn't update after attack  
**Fix**: Check that Zustand adapter is enabled and `notifyContextSubscribers()` is being called

**Issue**: Animations play on wrong creature  
**Fix**: Ensure `deferNotification: true` is set when applying state changes

**Issue**: Infinite loop in pipeline  
**Fix**: Check trigger conditions - make sure they don't create circular effects

**Issue**: Status effects don't tick  
**Fix**: Implement turn-end processing (Phase 2 feature)

### Debug Checklist

1. ✅ Is Zustand adapter enabled? (`USE_ZUSTAND_ADAPTER = true`)
2. ✅ Are effect handlers registered? (Check `registerHandlers.ts`)
3. ✅ Are triggers set up? (Check `triggerSetup.ts` logs)
4. ✅ Is pipeline completing? (Check for "Pipeline completed" log)
5. ✅ Are animations resolving? (Check for timeout warnings)

---

## Conclusion

The Squad battle system is a sophisticated **event-driven architecture** that:

✅ Handles complex cascading effects  
✅ Maintains immutable state  
✅ Integrates animations seamlessly  
✅ Supports reactive passive abilities  
✅ Scales to 50+ attack types  
✅ Is fully type-safe with TypeScript  

**Current Focus**: Debugging the double-trigger bug in Stone Thorns passive, then completing Phase 2 (turn system with status ticking).

---

**Last Updated**: November 16, 2025  
**Author**: Squad Development Team  
**Version**: 0.1.0 (Phase 1 Complete)
