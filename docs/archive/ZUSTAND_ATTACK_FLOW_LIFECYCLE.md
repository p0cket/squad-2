# Zustand Attack Flow - Complete Lifecycle Documentation (Serializable Effects)

This document traces the complete lifecycle of what happens when you click the "Attack" button in the Zustand-powered Effect Pipeline System with **serializable effects**, including inline state changes and detailed comments at each step.

**Last Updated**: October 2025 - After serializable effects refactoring

---

## Files Involved in the Attack Flow

The attack flow touches these core files:

### 1. **UI Layer**
- `src/utils/effectPipeline/integration/BattleEngineExample.tsx` - React component with Attack button and UI

### 2. **React Integration**
- `src/utils/effectPipeline/hooks/useBattleEngine.ts` - Main React hook that connects UI to the pipeline

### 3. **Core Pipeline Engine**
- `src/utils/effectPipeline/effectPipelineEngine.ts` - Orchestrates effect chains and queuing
- `src/utils/effectPipeline/effectPipeline.ts` - Effect queue management (priority queue)
- `src/utils/effectPipeline/effectApplicatorRegistry.ts` - **NEW**: Registry that maps effect types to applicators

### 4. **Effect Definitions (Serializable)**
- `src/utils/effectPipeline/effects/combatEffects.ts` - Attack effect factory (`createAttackEffect`) - **UPDATED**
  - Returns pure data objects (no methods)
  - Contains applicator functions registered with registry

### 5. **State Management**
- `src/utils/effectPipeline/zustandAdapter.ts` - Zustand store wrapper and state change application
- `src/utils/effectPipeline/battleContext.ts` - BattleContext interface and subscriber notifications

### 6. **Animation System**
- `src/utils/effectPipeline/animationEngine.ts` - Handles sequential and parallel animation execution

### 7. **Type Definitions**
- `src/utils/effectPipeline/types.ts` - **UPDATED**: TypeScript types for Effect (now serializable), StateChange, BattleState, etc.

### Flow Path Summary
```
User Click (BattleEngineExample)
    ↓
performAttack (useBattleEngine)
    ↓
createAttackEffect (combatEffects) → Returns serializable Effect object
    ↓
processEffectChain (effectPipelineEngine)
    ↓
applyEffect (effectApplicatorRegistry) → Looks up 'ATTACK' applicator
    ↓
applyAttackEffect (combatEffects) → Pure function returns {stateChanges, animations}
    ↓
applyChangesToContext (zustandAdapter)
    ↓
executeAnimationsSequentially (animationEngine)
    ↓
notifySubscribers (zustandAdapter)
    ↓
React re-render (useBattleEngine subscription callback)
```

---

## Key Architectural Change: Serializable Effects

### Before (Method-based, Not Serializable)
```typescript
const effect = {
  id: 'attack',
  targetId: 2,
  animations: [],
  apply: async (context) => {  // ❌ Method
    // Logic embedded here
    effect.animations = [...]   // ❌ Mutates animations
    return [stateChange]
  }
}
```

### After (Serializable, Decoupled)
```typescript
// Effect = Pure Data (Can JSON.stringify!)
const effect = {
  id: 'attack',
  type: 'ATTACK',              // ✅ Registry key
  targetId: 2,
  priority: 50,
  data: {                      // ✅ Serializable payload
    attackerId: 1,
    attack: { name: "Fire Breath", damage: 20, ... }
  }
}

// Applicator = Separate Pure Function
registerEffectApplicator('ATTACK', async (effect, context) => {
  // Calculate damage
  return {
    stateChanges: [...],       // ✅ Return, don't mutate
    animations: [...]          // ✅ Return, don't mutate
  }
})
```

---

## Step 1: User Clicks Attack Button

**File**: `src/utils/effectPipeline/integration/BattleEngineExample.tsx:253`

```tsx
<button
  onClick={handleAttackTest}
  disabled={isProcessingEffects || playerCreatures.length === 0 || computerCreatures.length === 0}
  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
>
  ⚔️ Attack
</button>
```

**State Before Click**:
```javascript
// battleState (in Zustand store):
{
  playerCreatures: [{ ID: 1, name: "Dragon", health: 100, maxHealth: 100, attack: 25, defense: 15, statuses: [] }],
  computerCreatures: [{ ID: 2, name: "Goblin", health: 60, maxHealth: 60, attack: 15, defense: 8, statuses: [] }],
  mp: 0,
  turn: 0,
  battleStatus: null
}

// isProcessingEffects: false
```

---

## Step 2: handleAttackTest Function Fired

**File**: `src/utils/effectPipeline/integration/BattleEngineExample.tsx:84`

```tsx
const handleAttackTest = async () => {
  if (playerCreatures.length > 0 && computerCreatures.length > 0) {
    const attack = {
      name: "Fire Breath",
      damage: 20,
      template: "fire",
      attackType: "magical",
      effects: [],
      chanceToLand: 1,
      trueDamage: 0,
      icon: "🔥",
      notes: "Deals fire damage",
      cooldown: 0
    }

    await performAttack(playerCreatures[0].ID, computerCreatures[0].ID, attack)
  }
}
```

---

## Step 3: performAttack Helper Function

**File**: `src/utils/effectPipeline/hooks/useBattleEngine.ts:178`

```tsx
const performAttack = useCallback(async (attackerId: number, targetId: number, attack: any) => {
  // attackerId = 1 (Dragon)
  // targetId = 2 (Goblin)
  // attack = { name: "Fire Breath", damage: 20, ... }

  // 🆕 Create a SERIALIZABLE Effect object
  const effect = createAttackEffect(attackerId, targetId, attack)

  // effect is now a PURE DATA object:
  // {
  //   id: 'attack',
  //   type: 'ATTACK',               // ← Used for registry lookup
  //   targetId: 2,
  //   priority: 50,
  //   data: {                       // ← All serializable
  //     attackerId: 1,
  //     attack: { name: "Fire Breath", damage: 20, ... }
  //   }
  // }

  // Can serialize/deserialize!
  // const json = JSON.stringify(effect) ← Works now!

  await applyEffect(effect)
}, [applyEffect])
```

**Key Change**: Effect is now pure data, no `apply()` method, no `animations` array. Everything is in the serializable `data` field.

---

## Step 4: createAttackEffect Factory (Serializable)

**File**: `src/utils/effectPipeline/effects/combatEffects.ts:434`

```tsx
/**
 * Creates a serializable attack effect (pure data)
 */
export const createAttackEffect = (
  attackerId: number,
  targetId: number,
  attack: Attack
): Effect => ({
  id: 'attack',
  type: 'ATTACK',        // ← Registry key for lookup
  targetId,
  priority: 50,
  data: {                // ← All effect-specific data (serializable)
    attackerId,
    attack
  }
})
```

**No `apply()` method!** The logic is separate in the applicator function.

---

## Step 5: applyEffect Function

**File**: `src/utils/effectPipeline/hooks/useBattleEngine.ts:118`

```tsx
const applyEffect = useCallback(async (effect: Effect) => {
  if (!contextRef.current) {
    console.error('❌ Battle context not initialized')
    return
  }

  // Disable UI buttons during effect chain
  setIsProcessingEffects(true)

  try {
    await processEffectChain(effect, contextRef.current)
  } catch (error) {
    console.error('💥 Error processing effect chain:', error)
    throw error
  } finally {
    setIsProcessingEffects(false)
  }
}, [])
```

**State Change**:
```javascript
// isProcessingEffects: false -> true
```

---

## Step 6: processEffectChain - Entry Point

**File**: `src/utils/effectPipeline/effectPipelineEngine.ts:22`

```tsx
export const processEffectChain = async (
  initialEffect: Effect,
  context: BattleContext
): Promise<void> => {
  console.group('🔄 Processing Effect Chain:', initialEffect.id)

  if (pipelineState.isProcessing) {
    pipelineState.effectQueue.push({ effect: initialEffect, context })
    console.groupEnd()
    return
  }

  pipelineState.isProcessing = true

  try {
    await executeEffectPipeline(initialEffect, context)

    while (pipelineState.effectQueue.length > 0) {
      const next = pipelineState.effectQueue.shift()!
      await executeEffectPipeline(next.effect, next.context)
    }
  } finally {
    pipelineState.isProcessing = false
    console.groupEnd()
  }
}
```

---

## Step 7: executeEffectPipeline - Apply Effect via Registry

**File**: `src/utils/effectPipeline/effectPipelineEngine.ts:61`

```tsx
const executeEffectPipeline = async (
  effect: Effect,
  context: BattleContext
): Promise<void> => {
  const pipeline = createEffectPipeline()
  addEffectToPipeline(pipeline, effect)

  while (hasEffectsInPipeline(pipeline)) {
    const currentEffect = getNextEffect(pipeline)
    if (!currentEffect) break

    try {
      // 🆕 STEP 1: Apply the effect via registry lookup
      // No longer calling effect.apply()!
      const { stateChanges, animations } = await applyEffect(currentEffect, context)

      // ... continues to Step 8
    }
  }
}
```

**Key Change**: Instead of `effect.apply(context)`, we call `applyEffect(effect, context)` which looks up the applicator in the registry.

---

## Step 8: Registry Lookup - applyEffect

**File**: `src/utils/effectPipeline/effectApplicatorRegistry.ts:26`

```tsx
/**
 * Apply an effect by looking up its applicator in the registry
 */
export const applyEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  // effect.type = 'ATTACK'

  const applicator = EFFECT_APPLICATORS[effect.type]
  // applicator = applyAttackEffect (the pure function)

  if (!applicator) {
    throw new Error(`No applicator registered for effect type: ${effect.type}`)
  }

  // Call the applicator function
  return applicator(effect, context)
  // ... continues to Step 9
}
```

**Registry Map**:
```typescript
const EFFECT_APPLICATORS = {
  'ATTACK': applyAttackEffect,
  'HEAL': applyHealEffect,
  'POISON': applyPoisonEffect,
  // ...
}
```

---

## Step 9: applyAttackEffect Applicator (Pure Function)

**File**: `src/utils/effectPipeline/effects/combatEffects.ts:45`

```tsx
/**
 * Pure function that applies attack effect logic
 */
const applyAttackEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  // Extract data from effect
  const { attackerId, attack } = effect.data as AttackEffectData
  // attackerId = 1, attack = { name: "Fire Breath", damage: 20, ... }

  const attacker = getCreatureFromContext(context, attackerId)
  // attacker = { ID: 1, name: "Dragon", attack: 25, ... }

  const target = getCreatureFromContext(context, effect.targetId)
  // target = { ID: 2, name: "Goblin", health: 60, defense: 8, ... }

  // ============================================
  // DAMAGE CALCULATION
  // ============================================

  const baseAttackDamage = attack.damage
  // baseAttackDamage = 20

  const attackerBonus = attacker.attack
  // attackerBonus = 25

  const totalDamage = baseAttackDamage + attackerBonus
  // totalDamage = 45

  const defense = target.defense
  // defense = 8

  const actualDamage = Math.max(1, totalDamage - defense)
  // actualDamage = 37

  const newHealth = Math.max(0, target.health - actualDamage)
  // newHealth = 23

  console.log(`⚔️ Attack: ${attacker.name} attacks ${target.name} for ${actualDamage} damage (${target.health} → ${newHealth})`)

  // ============================================
  // BUILD DAMAGE BREAKDOWN
  // ============================================

  const damageBreakdown: Array<{ label: string; value: number }> = []

  if (baseAttackDamage > 0) {
    damageBreakdown.push({ label: `${attack.name}`, value: baseAttackDamage })
  }
  if (attackerBonus > 0) {
    damageBreakdown.push({ label: 'Attack Bonus', value: attackerBonus })
  }
  if (defense > 0) {
    damageBreakdown.push({ label: 'Defense', value: -defense })
  }
  damageBreakdown.push({ label: 'Total Damage', value: actualDamage })

  // ============================================
  // CREATE ANIMATIONS (returned, not mutated)
  // ============================================

  const animations: Animation[] = [
    { type: 'attack-windup', targetId: attackerId, duration: 600 },
    { type: 'impact', targetId: effect.targetId, duration: 300 },
    ...damageBreakdown.map((breakdown, index) => ({
      type: 'damage-number',
      targetId: effect.targetId,
      duration: 1500,
      data: {
        value: breakdown.value,
        label: breakdown.label,
        isTotal: breakdown.label === 'Total Damage',
        delay: index * 200
      }
    }))
  ]

  // ============================================
  // CREATE STATE CHANGE
  // ============================================

  const healthChange: HealthChange = {
    type: 'HEALTH_CHANGE',
    creatureId: effect.targetId,
    timestamp: Date.now(),
    data: {
      delta: -actualDamage,
      newHealth,
      source: `attack-${attack.name}`
    }
  }

  // ============================================
  // RETURN (don't mutate anything!)
  // ============================================

  return {
    stateChanges: [healthChange],
    animations
  }
}
```

**Key Differences**:
- ✅ Pure function (no side effects)
- ✅ Returns both `stateChanges` and `animations`
- ✅ No mutation of effect object
- ✅ Testable in isolation
- ✅ Effect data comes from `effect.data`, not closure

---

## Step 10: Back to Pipeline - Apply State Changes

**File**: `src/utils/effectPipeline/effectPipelineEngine.ts:86` (continuing from Step 7)

```tsx
try {
  // 1. Apply the effect and get BOTH state changes AND animations
  const { stateChanges, animations } = await applyEffect(currentEffect, context)
  // stateChanges = [{ type: 'HEALTH_CHANGE', creatureId: 2, data: { delta: -37, newHealth: 23 } }]
  // animations = [{ type: 'attack-windup', ... }, { type: 'impact', ... }, ...]

  // 2. Apply state changes to context (but defer UI notification)
  if (stateChanges.length > 0) {
    applyChangesToContext(context, stateChanges, { deferNotification: true })
  }

  // 3. Execute animations (returns after damage numbers appear, not after they fade)
  let finishAnimations: (() => Promise<void>) | null = null
  if (animations.length > 0) {
    finishAnimations = await executeAnimationsSequentially(animations)
  }

  // 4. Now notify UI subscribers AFTER damage numbers have appeared
  if (stateChanges.length > 0) {
    notifyContextSubscribers(context, stateChanges)
  }

  // 5. Wait for animations to fully finish (fade out) before continuing
  if (finishAnimations) {
    await finishAnimations()
  }

  // 6. Check for triggered effects
  const triggeredEffects = resolveTriggeredEffects(stateChanges, context)
  // ... continues to process triggered effects
}
```

**Key Change**: We get `animations` from the applicator return value, not from mutating `effect.animations`.

---

## Step 11: Apply State Changes to Zustand

**File**: `src/utils/effectPipeline/zustandAdapter.ts:151`

```tsx
export const applyChangesToZustandContext = (
  store: ReturnType<typeof createZustandBattleStore>,
  changes: StateChange[],
  options: { notify?: boolean; deferNotification?: boolean } = {}
): void => {
  const { notify = true, deferNotification = false } = options

  if (changes.length === 0) return

  const { pushHistory, setState, notifySubscribers } = store.getState()

  // Save current state to history
  pushHistory()

  // Apply changes
  let currentState = store.getState().state
  changes.forEach(change => {
    currentState = applyStateChange(currentState, change)
  })

  // Update Zustand store
  setState(currentState)
  // Goblin health: 60 -> 23

  // Defer notification
  if (notify && !deferNotification) {
    notifySubscribers(changes)
  }
}
```

**State Change**:
```javascript
// Zustand store.state:
{
  playerCreatures: [{ ID: 1, health: 100, ... }],
  computerCreatures: [{ ID: 2, health: 23, ... }],  // 60 -> 23
  mp: 0,
  turn: 0,
  battleStatus: null
}

// React: NO RE-RENDER YET (notification deferred)
```

---

## Step 12: Execute Animations

**File**: `src/utils/effectPipeline/animationEngine.ts:14`

```tsx
export const executeAnimationsSequentially = async (
  animations: Animation[]
): Promise<() => Promise<void>> => {
  // Group animations
  const sequentialAnimations: Animation[] = []
  const delayedAnimations: Animation[] = []

  for (const animation of animations) {
    if (animation.data?.delay !== undefined) {
      delayedAnimations.push(animation)
    } else {
      sequentialAnimations.push(animation)
    }
  }

  // Execute sequential animations (windup, impact)
  for (const animation of sequentialAnimations) {
    await executeAnimation(animation)
  }

  // Start delayed animations in parallel (damage numbers)
  const delayedAnimationPromises: Promise<void>[] = []

  if (delayedAnimations.length > 0) {
    for (const animation of delayedAnimations) {
      delayedAnimationPromises.push(executeAnimation(animation))
    }

    const maxDelay = Math.max(...delayedAnimations.map(a => a.data?.delay || 0))
    await new Promise(resolve => setTimeout(resolve, maxDelay + 100))
  }

  // Return cleanup function
  return async () => {
    if (delayedAnimationPromises.length > 0) {
      await Promise.all(delayedAnimationPromises)
    }
  }
}
```

**Timeline**:
```
0ms:     Attack-windup starts
600ms:   Impact starts
900ms:   Damage numbers start appearing (staggered)
1600ms:  executeAnimationsSequentially returns
```

---

## Step 13: Notify UI Subscribers (React Re-render)

**File**: `src/utils/effectPipeline/effectPipelineEngine.ts:95`

```tsx
// Now notify UI subscribers AFTER damage numbers have appeared
if (stateChanges.length > 0) {
  notifyContextSubscribers(context, stateChanges)
}
```

**File**: `src/utils/effectPipeline/zustandAdapter.ts:97`

```tsx
notifySubscribers: (changes: StateChange[]) => {
  const subscribers = get().subscribers

  // Notify 'all' subscribers (React component)
  const allSubs = subscribers.get('all') || []
  allSubs.forEach(callback => {
    callback(changes, get().state)
  })
}
```

**File**: `src/utils/effectPipeline/hooks/useBattleEngine.ts:75`

```tsx
subscribeToZustandContext(
  zustandStoreRef.current,
  'all',
  (changes: StateChange[], newState: BattleState) => {
    const updatedState = getZustandContextState(zustandStoreRef.current)

    // UPDATE REACT STATE - TRIGGERS RE-RENDER!
    setBattleState(updatedState)
  }
)
```

**State Change**:
```javascript
// React component state (battleState):
{
  computerCreatures: [{ ID: 2, health: 23, ... }]  // UI updates!
}
```

---

## Step 14: Wait for Animations to Finish

**File**: `src/utils/effectPipeline/effectPipelineEngine.ts:100`

```tsx
// Wait for animations to fully finish (fade out)
if (finishAnimations) {
  await finishAnimations()
}
```

**Timeline**:
```
1600ms:  React re-renders (health bar updates)
3100ms:  Damage numbers fade out
3100ms:  finishAnimations() resolves
```

---

## Step 15: Check for Triggered Effects

**File**: `src/utils/effectPipeline/effectPipelineEngine.ts:104`

```tsx
const triggeredEffects = resolveTriggeredEffects(stateChanges, context)

if (triggeredEffects.length > 0) {
  triggeredEffects.forEach(triggeredEffect => {
    addEffectToPipeline(pipeline, triggeredEffect)
  })
}
// No triggered effects (Goblin still alive at 23 HP)
```

---

## Step 16: Cleanup and Return

**File**: `src/utils/effectPipeline/effectPipelineEngine.ts:45`

```tsx
} finally {
  pipelineState.isProcessing = false
  console.groupEnd()
}
```

**File**: `src/utils/effectPipeline/hooks/useBattleEngine.ts:131`

```tsx
} finally {
  setIsProcessingEffects(false)
  // Attack button re-enabled
}
```

---

## Final State Summary

**Initial State**:
```javascript
{
  playerCreatures: [{ ID: 1, name: "Dragon", health: 100 }],
  computerCreatures: [{ ID: 2, name: "Goblin", health: 60 }],
  mp: 0,
  turn: 0
}
```

**Final State**:
```javascript
{
  playerCreatures: [{ ID: 1, name: "Dragon", health: 100 }],
  computerCreatures: [{ ID: 2, name: "Goblin", health: 23 }],  // 60 -> 23
  mp: 0,
  turn: 0,
  stateHistory: [/* previous state with health: 60 */]
}
```

**What Changed**:
- Goblin's health: 60 → 23 (damage: 37 = 20 base + 25 attack - 8 defense)
- State history: Added previous state
- UI: Health bar updated, damage numbers appeared and faded

**Total Time**: ~3.1 seconds

---

## Key Architecture Benefits

### 🎯 Serializable Effects
```typescript
const effect = createAttackEffect(1, 2, attack)

// Can serialize!
const json = JSON.stringify(effect)
localStorage.setItem('savedEffect', json)

// Can deserialize!
const restored = JSON.parse(json)
await processEffectChain(restored, context)
```

### 🧪 Testable Applicators
```typescript
// Test applicator in isolation
const mockEffect = { type: 'ATTACK', data: { attackerId: 1, attack: {...} } }
const mockContext = { state: { ... } }

const result = await applyAttackEffect(mockEffect, mockContext)

expect(result.stateChanges).toHaveLength(1)
expect(result.animations).toHaveLength(6)
```

### 🔧 Easy to Extend
```typescript
// 1. Define data type
type PoisonEffectData = { casterId: number; damage: number }

// 2. Create applicator
const applyPoisonEffect = async (effect, context) => {
  // Calculate poison damage
  return { stateChanges, animations }
}

// 3. Register
registerEffectApplicator('POISON', applyPoisonEffect)

// 4. Create factory
export const createPoisonEffect = (casterId, targetId, damage) => ({
  id: 'poison',
  type: 'POISON',
  targetId,
  data: { casterId, damage }
})
```

### 🎨 Decoupled Logic
```typescript
// Effect creation (UI layer)
const effect = createAttackEffect(1, 2, attack)

// Effect application (engine layer)
const { stateChanges, animations } = await applyEffect(effect, context)

// Pure functions, easy to test, no side effects!
```

---

## Common Questions

**Q: How is this different from before?**
A: Effects are now pure data objects. Logic is in separate pure functions registered with the registry. No more `effect.apply()` methods or mutating `effect.animations`.

**Q: Can I save/load effects?**
A: Yes! `JSON.stringify(effect)` and `JSON.parse(json)` work perfectly now.

**Q: How do I add a new effect type?**
A: Create an applicator function, register it with `registerEffectApplicator()`, and create a factory function.

**Q: What about the old `effect.apply()` pattern?**
A: Completely removed. All effects now use the registry pattern.

**Q: Are animations still handled the same way?**
A: Yes, but now animations come from the applicator's return value, not from mutating the effect object.

**Q: Can I still trigger cascading effects?**
A: Yes! `resolveTriggeredEffects()` still works the same way, creating new serializable effects.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                 USER CLICKS ATTACK                       │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  createAttackEffect() - Factory Function                │
│  Returns: {                                             │
│    id: 'attack',                                        │
│    type: 'ATTACK',  ← Registry key                     │
│    targetId: 2,                                         │
│    data: { attackerId: 1, attack: {...} }  ← Serialize │
│  }                                                      │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  processEffectChain() - Pipeline Engine                │
│  - Queue effect in priority queue                       │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  applyEffect() - Registry Lookup                        │
│  EFFECT_APPLICATORS['ATTACK'] → applyAttackEffect      │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  applyAttackEffect() - Pure Function                    │
│  - Extract data from effect.data                        │
│  - Calculate damage (pure logic)                        │
│  - Return: { stateChanges: [...], animations: [...] }  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  applyChangesToZustandContext()                         │
│  - Update Zustand store immutably                       │
│  - Defer React notification                             │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  executeAnimationsSequentially()                        │
│  - Play windup, impact, damage numbers                  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  notifySubscribers() - Trigger React Re-render          │
│  - setBattleState() → UI updates                        │
└─────────────────────────────────────────────────────────┘
```

---

**End of Document** 🎉
