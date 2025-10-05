# Effect Pipeline System - The Fun Guide! 🎮

> **Note:** This system doesn't use Zustand! It's a custom implementation inspired by similar patterns, but built from scratch for our game.

## What Is This Thing?

Imagine you're playing a turn-based RPG. You click "Attack" and this happens:

1. Dragon winds up for attack 🐉 *woosh*
2. Impact animation hits! 💥
3. Damage numbers fly up one by one:
   - "Fire Breath: 20"
   - "Attack Bonus: +25"
   - "Defense: -8"
   - "Total Damage: 37" (big and bold!)
4. Goblin's health bar drops 👺 ❤️ 60 → 23
5. Poison status appears on Goblin 🧪

All of that is orchestrated by the **Effect Pipeline System**. It's like a stage director for your battle animations and state changes!

---

## The Big Picture 🎬

Think of the Effect Pipeline as a **movie production**:

```
┌─────────────────────────────────────────────────────┐
│  🎬 EFFECT PIPELINE SYSTEM                          │
│                                                      │
│  ┌──────────────┐    ┌──────────────┐              │
│  │   SCRIPT     │───▶│   DIRECTOR   │              │
│  │ (Effects)    │    │  (Pipeline)  │              │
│  └──────────────┘    └──────────────┘              │
│         │                    │                       │
│         │                    ▼                       │
│         │            ┌──────────────┐               │
│         │            │  STAGE CREW  │               │
│         │            │ (Animations) │               │
│         │            └──────────────┘               │
│         │                    │                       │
│         └───────────────────▶▼                       │
│                      ┌──────────────┐               │
│                      │  THE RESULT  │               │
│                      │   (Context)  │               │
│                      └──────────────┘               │
│                              │                       │
│                              ▼                       │
│                      ┌──────────────┐               │
│                      │  AUDIENCE    │               │
│                      │   (React)    │               │
│                      └──────────────┘               │
└─────────────────────────────────────────────────────┘
```

---

## The Cast of Characters 🎭

### 1. **types.ts** - The Rulebook 📖

**What it does:** Defines all the data structures (TypeScript interfaces)

**Key Types:**
- `Effect` - A "thing that happens" (like an attack or poison application)
- `StateChange` - A record of what changed (health, status, stats)
- `BattleContext` - The entire game state at this moment
- `Animation` - Instructions for visual effects

**Example:**
```typescript
interface Effect {
  id: string              // "attack" or "poison"
  targetId: number        // Which creature (ID: 2 = Goblin)
  priority: number        // Lower goes first (0-100)
  animations: Animation[] // What to show on screen
  apply: (context) => Promise<StateChange[]> // What actually happens
}
```

**The Pattern:** Everything is **immutable**. We never change objects directly - we always return NEW objects with updates.

---

### 2. **battleContext.ts** - The Game State Manager 🎮

**What it does:** Holds the current game state and applies changes to it

**Key Functions:**

#### `createBattleContext(initialState)`
Creates a fresh context (like starting a new game)

```typescript
const context = {
  contextId: "abc123",           // Unique ID
  state: { /* battle state */ }, // Current game data
  stateHistory: [],              // Undo buffer
  subscribers: new Map()         // Who wants updates?
}
```

#### `applyChangesToContext(context, changes, options)`
The ONLY way to update state. Takes an array of changes and applies them immutably.

```typescript
// Example: Goblin takes 37 damage
applyChangesToContext(context, [{
  type: 'HEALTH_CHANGE',
  creatureId: 2,
  data: { delta: -37, newHealth: 23 }
}])
```

**The Pattern: State Subscription** 📡
- Components **subscribe** to state changes
- When state updates, subscribers get notified
- React re-renders automatically
- Think of it like YouTube notifications! 🔔

```typescript
subscribeToContext(context, 'all', (changes, newState) => {
  console.log("State changed!", newState)
  setBattleState(newState) // Update React
})
```

**NOT Zustand but similar:** Instead of Zustand's global store, we have a `BattleContext` object that gets passed around. Same subscription pattern though!

---

### 3. **combatEffects.ts** - The Attack Recipes 🍳

**What it does:** Contains functions that CREATE effects (like recipes for attacks)

**Example: Basic Attack**
```typescript
const effect = createAttackEffect(dragonID, goblinID, fireBreathAttack)

// This creates an Effect object that:
// 1. Calculates damage (base 20 + attack 25 - defense 8 = 37)
// 2. Creates damage breakdown animations
// 3. Returns health change when applied
```

**The Magic Part:**
```typescript
// The effect.apply function runs LATER, not immediately!
apply: async (context) => {
  // Look up creatures from current context
  const attacker = getCreatureFromContext(context, attackerId)
  const target = getCreatureFromContext(context, targetId)

  // Calculate damage
  const actualDamage = Math.max(1, baseDamage - defense)

  // Return what changed (NOT changing it directly!)
  return [{
    type: 'HEALTH_CHANGE',
    creatureId: targetId,
    data: { newHealth: target.health - actualDamage }
  }]
}
```

**The Pattern: Effect Factory** 🏭
- Functions that RETURN effects, not apply them
- All calculations happen lazily (when `apply()` is called)
- Allows the pipeline to control timing

---

### 4. **effectPipelineEngine.ts** - The Conductor 🎼

**What it does:** Orchestrates the entire show! This is the heart of the system.

**The Main Flow:**
```typescript
async function processEffectChain(effect, context) {
  // 1. Calculate what will happen
  const stateChanges = await effect.apply(context)

  // 2. Update internal state (but don't tell React yet!)
  applyChangesToContext(context, stateChanges, { deferNotification: true })

  // 3. Play animations (returns when damage numbers APPEAR)
  const finishAnimations = await executeAnimationsSequentially(effect.animations)

  // 4. NOW tell React (UI updates!)
  notifyContextSubscribers(context, stateChanges)

  // 5. Wait for animations to finish fading
  await finishAnimations()

  // 6. Check for cascade effects (like "on damage taken" triggers)
  const triggeredEffects = resolveTriggeredEffects(...)
  // Process triggered effects recursively...
}
```

**Why the weird order?** 🤔
- State updates BEFORE animations start (so animations have correct values)
- React updates AFTER animations appear (so UI changes when you can see why)
- Perfect timing = satisfying gameplay!

**The Pattern: Deferred Notification** ⏰
```typescript
// Step 1: Update state silently
applyChangesToContext(context, changes, { deferNotification: true })

// Step 2: Play animations
await showDamageNumbers()

// Step 3: Tell React NOW
notifyContextSubscribers(context, changes)
```

---

### 5. **animationEngine.ts** - The Visual Effects Artist 🎨

**What it does:** Handles all the pretty animations

**Key Innovation: Parallel vs Sequential**

```typescript
// OLD WAY (slow):
await animation1() // Wait 1500ms
await animation2() // Wait 1500ms
await animation3() // Wait 1500ms
// Total: 4500ms 😴

// NEW WAY (fast):
Promise.all([
  animation1(), // All start together
  animation2(), // but with delays
  animation3()  // 200ms apart
])
// Total: 600ms (last delay) + 1500ms = 2100ms 🚀
```

**How it works:**
1. Separate animations into two groups:
   - **Sequential** (attack windup → impact)
   - **Parallel** (all damage numbers with `delay` property)
2. Run sequential animations one-by-one
3. Start ALL parallel animations at once (they delay themselves internally)
4. Return after parallel animations APPEAR (not finish!)

**The Pattern: Animation Staggering** 🎬
```typescript
animations: [
  { type: 'damage-number', delay: 0,    duration: 1500 },  // Starts immediately
  { type: 'damage-number', delay: 200,  duration: 1500 },  // Waits 200ms
  { type: 'damage-number', delay: 400,  duration: 1500 },  // Waits 400ms
  { type: 'damage-number', delay: 600,  duration: 1500 }   // Waits 600ms
]
// All finish fading around the same time = smooth visual cascade!
```

---

### 6. **useBattleEngine.ts** - The React Bridge 🌉

**What it does:** Connects the Effect Pipeline to React components

**Key Hook:**
```typescript
const {
  battleState,      // Current state (for rendering)
  performAttack,    // Function to attack
  applyBurn,        // Function to apply burn
  // ... more functions
} = useBattleEngine(initialState)
```

**The Critical Pattern: Subscription Lifecycle** 🔄

```typescript
// WRONG (causes React Strict Mode bug):
useEffect(() => {
  if (!contextRef.current) {
    contextRef.current = createBattleContext(initialState)
    const unsubscribe = subscribeToContext(...)
    return unsubscribe // ❌ Inside if block!
  }
}, [])

// CORRECT (works with Strict Mode):
// 1. Create context OUTSIDE useEffect (in render)
if (!contextRef.current) {
  contextRef.current = createBattleContext(initialState)
}

// 2. Subscribe INSIDE useEffect (always runs)
useEffect(() => {
  const unsubscribe = subscribeToContext(...)
  return unsubscribe // ✅ Top level!
}, [])
```

**Why this matters:**
- React Strict Mode double-mounts components
- First mount: creates context + subscribes
- Cleanup: unsubscribes
- Second mount: context exists, but needs to re-subscribe!
- Our fix: Split creation from subscription

---

## The Complete Flow (With Emojis!) 🎮

```
USER CLICKS "ATTACK" BUTTON
         ↓
🏭 createAttackEffect() creates the effect object
         ↓
🎼 processEffectChain() takes over
         ↓
📝 effect.apply(context) calculates damage
         ↓
💾 applyChangesToContext() updates state SILENTLY
         ↓
🎨 executeAnimationsSequentially() plays:
   1. 🐉 Attack windup (600ms)
   2. 💥 Impact (300ms)
   3. 📊 Damage numbers appear in cascade (600ms)
         ↓
🔔 notifyContextSubscribers() tells React
         ↓
⚛️ React re-renders with new health (BOOM!)
         ↓
😴 Wait for damage numbers to fade out (another 900ms)
         ↓
✅ Done! Ready for next action
```

**Total time from click to visible result:** ~1.5 seconds
**Total time until ready for next action:** ~2.5 seconds

---

## Common Patterns & Why They're Cool 😎

### 1. **Immutability Everywhere**
```typescript
// ❌ BAD
creature.health -= 10

// ✅ GOOD
const updatedCreature = {
  ...creature,
  health: creature.health - 10
}
```
**Why:** Prevents bugs, makes time-travel debugging possible, React loves it!

### 2. **Effect Factory Pattern**
```typescript
// Returns an effect object, doesn't DO anything yet
const effect = createAttackEffect(attacker, target, attack)

// Later, the pipeline calls effect.apply(context)
```
**Why:** Separates "what should happen" from "when it happens"

### 3. **Deferred Notifications**
```typescript
// Update state
applyChangesToContext(context, changes, { deferNotification: true })

// Do stuff (animations, calculations, etc.)
await doStuff()

// NOW tell everyone
notifyContextSubscribers(context, changes)
```
**Why:** Perfect timing control - UI updates when it makes sense visually

### 4. **Subscription Pattern** (Zustand-ish)
```typescript
// Subscribe
const unsubscribe = subscribeToContext(context, 'all', callback)

// Later, unsubscribe
unsubscribe()
```
**Why:** Components only re-render when relevant state changes

### 5. **Cascading Effects**
```typescript
// Attack triggers...
const triggeredEffects = resolveTriggeredEffects(effect, stateChanges, context)

// ...which might trigger more effects!
triggeredEffects.forEach(e => addEffectToPipeline(pipeline, e))
```
**Why:** Complex interactions (like "when hit, apply thorn damage back to attacker")

---

## Testing It Out 🧪

Open the demo: `src/utils/effectPipeline/integration/BattleEngineExample.tsx`

**Try this sequence:**
1. Click "🔥 Apply Burn" - See burn badge appear with (3) duration
2. Click "🧪 Apply Poison" - See poison badge stack next to burn
3. Click "🔥 Apply Burn" again - Duration refreshes to (3)
4. Click "⚔️ Attack" - See cascading damage numbers!
5. Watch the health bar update AFTER numbers appear but WHILE they're still fading

---

## Troubleshooting 🔧

### "Status effects aren't showing up!"
- Check that the effect returns a `STATUS_APPLIED` state change
- Verify `getStatusEffectById()` in battleContext.ts has the status definition

### "Animations are super slow!"
- Check if animations have `delay` property (should be parallel)
- Look at `executeAnimationsSequentially()` - sequential vs parallel grouping

### "React isn't updating!"
- Check subscription is created in useEffect
- Verify `notifyContextSubscribers()` is being called
- Make sure context isn't being recreated on every render

### "Multiple creatures getting the same status!"
- Check `creatureId` is correct in the state change
- Verify `updateCreatureInArray()` finds the right creature by ID

---

## What's Next? 🚀

Now that you understand the system, you can:
1. **Add new attack types** - Create new effects in `combatEffects.ts`
2. **Add new statuses** - Add to `statusEffects.ts`
3. **Create chain reactions** - Set up triggers in `triggerSetup.ts`
4. **Improve animations** - Enhance `animationEngine.ts`
5. **Integrate with main game** - Connect to `performAttack.ts`

---

## The Bottom Line 🎯

**Effect Pipeline System = A stage play where:**
- Effects are the script 📜
- Pipeline is the director 🎬
- Animations are the actors 🎭
- Context is the stage 🎪
- React is the audience 👥

And just like a good play, everything happens in perfect sequence with perfect timing to create an engaging experience!

---

**Remember:** This isn't Zustand, but it uses similar patterns. The key difference is we pass the `context` object around explicitly instead of having a global store. Think of it as "Zustand lite" built specifically for battle mechanics! 💪

Happy coding! 🎮✨


---

# APPENDIX: Full Source Code


## File: types.ts

```typescript
// Core types for the Effect Pipeline System
import { Creature, AttackPayload } from "../../consts/types/types"

export type StateChangeType =
  | 'HEALTH_CHANGE'
  | 'STATUS_APPLIED'
  | 'STATUS_REMOVED'
  | 'CREATURE_MOVED'
  | 'CREATURE_DIED'
  | 'STAT_MODIFIED'

export type StateChange = {
  type: StateChangeType
  creatureId: number
  timestamp: number
  data: any
}

export type HealthChange = StateChange & {
  type: 'HEALTH_CHANGE'
  data: {
    delta: number
    newHealth: number
    source: string
  }
}

export type StatusChange = StateChange & {
  type: 'STATUS_APPLIED' | 'STATUS_REMOVED'
  data: {
    statusId: string
    duration?: number
    source: string
  }
}

export type CreatureMovement = StateChange & {
  type: 'CREATURE_MOVED'
  data: {
    fromPosition: number
    toPosition: number | 'back'
    reason: string
  }
}

export type Animation = {
  type: string
  targetId: number
  duration: number
  data?: any
}

export type Effect = {
  id: string
  targetId: number
  priority?: number
  animations: Animation[]
  apply: (context: BattleContext) => Promise<StateChange[]>
}

export type EffectNode = {
  effect: Effect
  priority: number
  id: string
}

export type EffectPipeline = {
  queue: Effect[]
  processed: Set<string>
}

export type EffectChain = {
  effect: Effect
  context: BattleContext
}

export type BattleState = {
  playerCreatures: Creature[]
  computerCreatures: Creature[]
  mp: number
  turn: number
  battleStatus: string | null
}

export type BattleContext = {
  contextId?: string // For debugging context instance issues
  state: BattleState
  stateHistory: BattleState[]
  subscribers: Map<string, Function[]>
}

export type TriggerRule = {
  condition: (change: StateChange, context: BattleContext) => boolean
  createEffect: (change: StateChange, context: BattleContext) => Effect
  priority?: number
}

export type EffectPipelineState = {
  isProcessing: boolean
  effectQueue: EffectChain[]
}```

---

## File: battleContext.ts

```typescript
// Battle Context - Manages battle state and change tracking
import { BattleState, BattleContext, StateChange, HealthChange, StatusChange, CreatureMovement } from './types'
import { Creature } from '../../consts/types/types'

// Simple structuredClone polyfill for compatibility
const safeClone = <T>(obj: T): T => {
  if (typeof structuredClone !== 'undefined') {
    return structuredClone(obj)
  }
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Creates a new battle context with the given initial state
 */
export const createBattleContext = (initialState: BattleState): BattleContext => {
  const contextId = Math.random().toString(36).substr(2, 9)
  // Battle context created

  const context: BattleContext = {
    contextId,
    state: initialState,
    stateHistory: [],
    subscribers: new Map()
  }

  return context
}

/**
 * Applies state changes to the battle context immutably
 */
export const applyChangesToContext = (
  context: BattleContext,
  changes: StateChange[],
  options: { notify?: boolean; deferNotification?: boolean } = {}
): void => {
  const { notify = true, deferNotification = false } = options

  if (changes.length === 0) return

  // Save history for potential rollback
  context.stateHistory.push(safeClone(context.state))

  // Apply changes one by one
  changes.forEach(change => {
    context.state = applyStateChange(context.state, change)
  })

  // Notify subscribers unless deferred
  if (notify && !deferNotification) {
    notifySubscribers(context, changes)
  }

  // Limit history size to prevent memory issues
  if (context.stateHistory.length > 50) {
    context.stateHistory.shift()
  }
}

/**
 * Manually trigger subscriber notifications (for deferred updates)
 */
export const notifyContextSubscribers = (
  context: BattleContext,
  changes: StateChange[] = []
): void => {
  notifySubscribers(context, changes)
}

/**
 * Applies a single state change to the battle state
 */
const applyStateChange = (state: BattleState, change: StateChange): BattleState => {
  switch (change.type) {
    case 'HEALTH_CHANGE':
      return applyHealthChange(state, change as HealthChange)

    case 'STATUS_APPLIED':
    case 'STATUS_REMOVED':
      return applyStatusChange(state, change as StatusChange)

    case 'CREATURE_MOVED':
      return applyCreatureMovement(state, change as CreatureMovement)

    case 'CREATURE_DIED':
      return applyCreatureDeath(state, change)

    case 'STAT_MODIFIED':
      return applyStatModification(state, change)

    default:
      console.warn(`⚠️ Unknown state change type: ${change.type}`)
      return state
  }
}

/**
 * Applies health change to a creature
 */
const applyHealthChange = (state: BattleState, change: HealthChange): BattleState => {
  const { creatureId, data } = change

  return {
    ...state,
    playerCreatures: updateCreatureInArray(state.playerCreatures, creatureId, creature => ({
      ...creature,
      health: Math.max(0, Math.min(creature.maxHealth, data.newHealth))
    })),
    computerCreatures: updateCreatureInArray(state.computerCreatures, creatureId, creature => ({
      ...creature,
      health: Math.max(0, Math.min(creature.maxHealth, data.newHealth))
    }))
  }
}

/**
 * Applies status effect changes to a creature
 */
const applyStatusChange = (state: BattleState, change: StatusChange): BattleState => {
  const { creatureId, data, type } = change
  // Processing status change

  const updateStatuses = (creature: Creature): Creature => {
    if (type === 'STATUS_APPLIED') {
      // Add or update status
      const existingStatusIndex = creature.statuses.findIndex(s => s.id === data.statusId)

      if (existingStatusIndex >= 0) {
        // Update existing status duration
        const updatedStatuses = [...creature.statuses]
        updatedStatuses[existingStatusIndex] = {
          ...updatedStatuses[existingStatusIndex],
          duration: data.duration || updatedStatuses[existingStatusIndex].duration
        }
        return { ...creature, statuses: updatedStatuses }
      } else {
        // Add new status (you'll need to implement getStatusEffectById)
        const statusEffect = getStatusEffectById(data.statusId)
        if (statusEffect) {
          return {
            ...creature,
            statuses: [...creature.statuses, {
              ...statusEffect,
              duration: data.duration || statusEffect.duration
            }]
          }
        }
      }
    } else {
      // Remove status
      return {
        ...creature,
        statuses: creature.statuses.filter(s => s.id !== data.statusId)
      }
    }

    return creature
  }

  return {
    ...state,
    playerCreatures: updateCreatureInArray(state.playerCreatures, creatureId, updateStatuses),
    computerCreatures: updateCreatureInArray(state.computerCreatures, creatureId, updateStatuses)
  }
}

/**
 * Applies creature movement (like moving to back when dead)
 */
const applyCreatureMovement = (state: BattleState, change: CreatureMovement): BattleState => {
  const { creatureId, data } = change
  // Moving creature

  const moveCreatureInArray = (creatures: Creature[]): Creature[] => {
    const creatureIndex = creatures.findIndex(c => c.ID === creatureId)
    if (creatureIndex === -1) return creatures

    const newCreatures = [...creatures]
    const [creature] = newCreatures.splice(creatureIndex, 1)

    if (data.toPosition === 'back') {
      // Move to back of array
      newCreatures.push(creature)
    } else if (typeof data.toPosition === 'number') {
      // Move to specific position
      newCreatures.splice(data.toPosition, 0, creature)
    }

    return newCreatures
  }

  return {
    ...state,
    playerCreatures: moveCreatureInArray(state.playerCreatures),
    computerCreatures: moveCreatureInArray(state.computerCreatures)
  }
}

/**
 * Handles creature death logic
 */
const applyCreatureDeath = (state: BattleState, change: StateChange): BattleState => {
  const { creatureId } = change
  // Processing creature death

  // Move dead creature to back and update any death-related state
  return applyCreatureMovement(state, {
    ...change,
    type: 'CREATURE_MOVED',
    data: {
      fromPosition: 0, // Assume they were in front
      toPosition: 'back',
      reason: 'death'
    }
  } as CreatureMovement)
}

/**
 * Applies stat modifications to a creature
 */
const applyStatModification = (state: BattleState, change: StateChange): BattleState => {
  const { creatureId, data } = change
  // Applying stat modification

  return {
    ...state,
    playerCreatures: updateCreatureInArray(state.playerCreatures, creatureId, creature => ({
      ...creature,
      [data.statName]: creature[data.statName as keyof Creature] + data.value
    })),
    computerCreatures: updateCreatureInArray(state.computerCreatures, creatureId, creature => ({
      ...creature,
      [data.statName]: creature[data.statName as keyof Creature] + data.value
    }))
  }
}

/**
 * Helper function to update a creature in an array if it exists
 */
const updateCreatureInArray = (
  creatures: Creature[],
  creatureId: number,
  updateFn: (creature: Creature) => Creature
): Creature[] => {
  const creatureIndex = creatures.findIndex(c => c.ID === creatureId)
  if (creatureIndex === -1) return creatures

  const newCreatures = [...creatures]
  newCreatures[creatureIndex] = updateFn(newCreatures[creatureIndex])
  return newCreatures
}

/**
 * Subscribes to context changes
 */
export const subscribeToContext = (
  context: BattleContext,
  selector: string,
  callback: Function
): () => void => {
  if (!context.subscribers.has(selector)) {
    context.subscribers.set(selector, [])
  }

  const callbacks = context.subscribers.get(selector)!
  callbacks.push(callback)

  // Return unsubscribe function
  return () => {
    const index = callbacks.indexOf(callback)
    if (index > -1) {
      callbacks.splice(index, 1)
    }
  }
}

/**
 * Notifies subscribers of state changes
 */
const notifySubscribers = (context: BattleContext, changes: StateChange[]): void => {
  const changeTypes = [...new Set(changes.map(c => c.type))]

  changeTypes.forEach(changeType => {
    const subscribers = context.subscribers.get(changeType) || []
    const relevantChanges = changes.filter(c => c.type === changeType)

    subscribers.forEach(callback => {
      try {
        callback(relevantChanges, context.state)
      } catch (error) {
        console.error(`💥 Error in subscriber callback for ${changeType}:`, error)
      }
    })
  })

  // Also notify 'all' subscribers
  const allSubscribers = context.subscribers.get('all') || []
  allSubscribers.forEach(callback => {
    try {
      callback(changes, context.state)
    } catch (error) {
      console.error('💥 Error in general subscriber callback:', error)
    }
  })
}

/**
 * Gets the current state snapshot (for React integration)
 */
export const getContextState = (context: BattleContext): BattleState => {
  return safeClone(context.state)
}

/**
 * Rollback to previous state (useful for debugging/undo)
 */
export const rollbackContext = (context: BattleContext): boolean => {
  if (context.stateHistory.length === 0) {
    console.warn('⚠️ No history available for rollback')
    return false
  }

  const previousState = context.stateHistory.pop()!
  context.state = previousState
  // Rolled back to previous state
  return true
}

/**
 * Helper function to get status effect by ID (integrates with existing status system)
 */
const getStatusEffectById = (statusId: string) => {
  // Import the existing status effects from your system
  const STATUS_EFFECTS: { [key: string]: any } = {
    POISON: {
      name: "Poison",
      type: "debuff",
      timing: "afterAttack",
      duration: 3,
      effectFuncName: "applyPoison",
      chance: 1,
      icon: "🧪",
      id: "POISON",
      notes: "Deals damage over time.",
    },
    BUFF: {
      name: "Buff",
      type: "buff",
      timing: "beforeAttack",
      duration: 2,
      effectFuncName: "applyBuff",
      chance: 1,
      icon: "✨",
      id: "BUFF",
      notes: "Increases attack power.",
    },
    BURN: {
      name: "Burn",
      type: "debuff",
      timing: "afterAttack",
      duration: 3,
      effectFuncName: "applyBurn",
      chance: 1,
      icon: "🔥",
      id: "BURN",
      notes: "Deals fire damage over time.",
    },
    STUN: {
      name: "Stun",
      type: "debuff",
      timing: "beforeAttack",
      duration: 2,
      effectFuncName: "applyStun",
      chance: 1,
      icon: "⚡",
      id: "STUN",
      notes: "Prevents enemy from acting.",
    },
    REGENERATION: {
      name: "Regeneration",
      type: "buff",
      timing: "afterAttack",
      duration: 3,
      effectFuncName: "applyRegeneration",
      chance: 1,
      icon: "💚",
      id: "REGENERATION",
      notes: "Restores health over time.",
    },
    DEFENSE_BUFF: {
      name: "Defense Buff",
      type: "buff",
      timing: "beforeAttack",
      duration: 3,
      effectFuncName: "applyDefenseBuff",
      chance: 1,
      icon: "🛡️",
      id: "DEFENSE_BUFF",
      notes: "Increases defense.",
    }
  }

  return STATUS_EFFECTS[statusId] || null
}```

---

## File: combatEffects.ts

```typescript
```

---

## File: effectPipelineEngine.ts

```typescript
// Core Effect Pipeline Engine - Main orchestrator for effect chains
import { Effect, BattleContext, EffectPipelineState } from './types'
import {
  createEffectPipeline,
  addEffectToPipeline,
  hasEffectsInPipeline,
  getNextEffect
} from './effectPipeline'
import { resolveTriggeredEffects } from './effectResolver'
import { executeAnimationsSequentially } from './animationEngine'
import { applyChangesToContext, notifyContextSubscribers } from './battleContext'

// Global pipeline state
const pipelineState: EffectPipelineState = {
  isProcessing: false,
  effectQueue: []
}

/**
 * Main entry point for processing effect chains
 * Handles queuing and sequential processing of effects
 */
export const processEffectChain = async (
  initialEffect: Effect,
  context: BattleContext
): Promise<void> => {
  console.group('🔄 Processing Effect Chain:', initialEffect.id)

  // If already processing, queue the effect
  if (pipelineState.isProcessing) {
    // Pipeline busy, queueing effect
    pipelineState.effectQueue.push({ effect: initialEffect, context })
    console.groupEnd()
    return
  }

  pipelineState.isProcessing = true

  try {
    await executeEffectPipeline(initialEffect, context)

    // Process any queued effects
    while (pipelineState.effectQueue.length > 0) {
      // Processing queued effects
      const next = pipelineState.effectQueue.shift()!
      await executeEffectPipeline(next.effect, next.context)
    }
  } catch (error) {
    console.error('💥 Error in effect pipeline:', error)
    throw error
  } finally {
    pipelineState.isProcessing = false
    console.groupEnd()
  }
}

/**
 * Executes a complete effect pipeline until no more effects are generated
 */
const executeEffectPipeline = async (
  effect: Effect,
  context: BattleContext
): Promise<void> => {
  console.group('⚙️ Executing Effect Pipeline for:', effect.id)

  const pipeline = createEffectPipeline()
  addEffectToPipeline(pipeline, effect)

  let stepCount = 0
  const maxSteps = 50 // Safety limit to prevent infinite loops

  while (hasEffectsInPipeline(pipeline) && stepCount < maxSteps) {
    stepCount++
    // Pipeline step

    const currentEffect = getNextEffect(pipeline)
    if (!currentEffect) {
      // No effect to process
      break
    }

    // Processing effect

    try {
      // 1. Apply the effect and get state changes
      const stateChanges = await currentEffect.apply(context)

      // 2. Apply state changes to context (but defer UI notification)
      if (stateChanges.length > 0) {
        applyChangesToContext(context, stateChanges, { deferNotification: true })
      }

      // 3. Execute animations (returns after damage numbers appear, not after they fade)
      let finishAnimations: (() => Promise<void>) | null = null
      if (currentEffect.animations.length > 0) {
        finishAnimations = await executeAnimationsSequentially(currentEffect.animations)
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
      // Checking for triggered effects
      const triggeredEffects = resolveTriggeredEffects(
        currentEffect,
        stateChanges,
        context
      )

      if (triggeredEffects.length > 0) {
        // Triggered effects found
        triggeredEffects.forEach(triggeredEffect => {
          addEffectToPipeline(pipeline, triggeredEffect)
        })
      } else {
        // No triggered effects
      }

    } catch (error) {
      console.error('💥 Error processing effect:', currentEffect.id, error)
      // Continue processing other effects
    }
  }

  if (stepCount >= maxSteps) {
    console.warn('⚠️ Pipeline stopped due to step limit. Possible infinite loop detected.')
  }

  // Pipeline completed
  console.groupEnd()
}

/**
 * Get current pipeline state (useful for debugging)
 */
export const getPipelineState = (): EffectPipelineState => ({
  ...pipelineState,
  effectQueue: [...pipelineState.effectQueue] // Return copy
})

/**
 * Reset pipeline state (useful for testing)
 */
export const resetPipelineState = (): void => {
  pipelineState.isProcessing = false
  pipelineState.effectQueue = []
}```

---

## File: animationEngine.ts

```typescript
// Sequential Animation Engine - Handles async animation sequencing
import { Animation } from './types'

/**
 * Executes animations, grouping delayed animations to run in parallel
 * while keeping non-delayed animations sequential
 *
 * Returns a callback that resolves once all animations are actually complete
 * (useful for cleanup, but UI updates don't need to wait)
 */
export const executeAnimationsSequentially = async (
  animations: Animation[]
): Promise<() => Promise<void>> => {
  if (animations.length === 0) {
    return async () => {}
  }

  // Group animations: separate delayed from sequential
  const sequentialAnimations: Animation[] = []
  const delayedAnimations: Animation[] = []

  for (const animation of animations) {
    // Animations with a delay property (even 0) should run in parallel
    if (animation.data?.delay !== undefined) {
      delayedAnimations.push(animation)
    } else {
      sequentialAnimations.push(animation)
    }
  }

  // Execute sequential animations first (windup, impact, etc.)
  for (const animation of sequentialAnimations) {
    try {
      await executeAnimation(animation)
    } catch (error) {
      console.error(`💥 Sequential animation failed:`, error)
    }
  }

  // Start all delayed animations in parallel (damage numbers)
  const delayedAnimationPromises: Promise<void>[] = []
  if (delayedAnimations.length > 0) {
    for (const animation of delayedAnimations) {
      delayedAnimationPromises.push(
        executeAnimation(animation).catch(error => {
          console.error(`💥 Delayed animation failed:`, error)
        })
      )
    }

    // Wait only for them to *appear* (max delay time), not to finish
    const maxDelay = Math.max(...delayedAnimations.map(a => a.data?.delay || 0))
    await new Promise(resolve => setTimeout(resolve, maxDelay + 100)) // +100ms buffer
  }

  // Return a function that waits for all animations to fully complete
  return async () => {
    if (delayedAnimationPromises.length > 0) {
      await Promise.all(delayedAnimationPromises)
    }
  }
}

/**
 * Executes a single animation and returns a promise that resolves when done
 */
const executeAnimation = (animation: Animation): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const animationInstance = createAnimationInstance(animation)

      if (!animationInstance) {
        console.warn('⚠️ No animation instance created for:', animation.type)
        resolve()
        return
      }

      // Set up completion callback
      animationInstance.onComplete = () => {
        // Animation completed
        resolve()
      }

      // Set up error callback
      animationInstance.onError = (error: any) => {
        console.error(`💥 Animation ${animation.type} error:`, error)
        reject(error)
      }

      // Start the animation
      animationInstance.play()

      // Fallback timeout to prevent hanging
      // Account for delay in animation data
      const delay = animation.data?.delay || 0
      const totalTime = animation.duration + delay + 1000 // Add delay + 1 second buffer
      setTimeout(() => {
        console.warn(`⏰ Animation ${animation.type} timed out, resolving anyway`)
        resolve()
      }, totalTime)

    } catch (error) {
      console.error(`💥 Failed to create animation ${animation.type}:`, error)
      reject(error)
    }
  })
}

/**
 * Creates an animation instance based on animation type
 * This integrates with your existing animation system
 */
const createAnimationInstance = (animation: Animation): AnimationInstance | null => {
  switch (animation.type) {
    case 'shake':
      return createShakeAnimation(animation)

    case 'damage-number':
      return createDamageNumberAnimation(animation)

    case 'burn':
      return createBurnAnimation(animation)

    case 'death-animation':
      return createDeathAnimation(animation)

    case 'attack-windup':
      return createAttackWindupAnimation(animation)

    case 'impact':
      return createImpactAnimation(animation)

    case 'healing':
      return createHealingAnimation(animation)

    case 'status-apply':
      return createStatusApplyAnimation(animation)

    default:
      console.warn(`⚠️ Unknown animation type: ${animation.type}`)
      return createDefaultAnimation(animation)
  }
}

// Animation instance interface
interface AnimationInstance {
  play: () => void
  onComplete?: () => void
  onError?: (error: any) => void
}

/**
 * Creates a shake animation for creature damage
 */
const createShakeAnimation = (animation: Animation): AnimationInstance => {
  const instance: AnimationInstance = {
    play: () => {
      // Shake animation

      // Find the creature element
      const creatureElement = document.querySelector(`[data-creature-id="${animation.targetId}"]`)

      if (creatureElement) {
        creatureElement.classList.add('shake-animation')

        setTimeout(() => {
          creatureElement.classList.remove('shake-animation')
          if (instance.onComplete) instance.onComplete()
        }, animation.duration)
      } else {
        console.warn(`Creature element not found for ID: ${animation.targetId}`)
        if (instance.onComplete) instance.onComplete()
      }
    }
  }
  return instance
}

/**
 * Creates a damage number animation
 */
const createDamageNumberAnimation = (animation: Animation): AnimationInstance => {
  let completed = false

  const instance: AnimationInstance = {
    play: () => {
      const damageValue = animation.data?.value || 0
      const label = animation.data?.label || ''
      const isTotal = animation.data?.isTotal || false
      const delay = animation.data?.delay || 0

      const creatureElement = document.querySelector(`[data-creature-id="${animation.targetId}"]`)

      if (creatureElement) {
        // Use delay before showing animation
        setTimeout(() => {
          const damageElement = document.createElement('div')
          damageElement.className = 'damage-number'

          // Format the display text
          let displayText = ''
          if (label) {
            const sign = damageValue >= 0 ? '+' : ''
            displayText = `${label}: ${sign}${damageValue}`
          } else {
            displayText = damageValue.toString()
          }

          damageElement.textContent = displayText
          damageElement.style.position = 'absolute'
          damageElement.style.fontWeight = isTotal ? 'bold' : 'normal'
          damageElement.style.fontSize = isTotal ? '28px' : '20px'
          damageElement.style.zIndex = '1000'
          damageElement.style.pointerEvents = 'none'
          damageElement.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)'

          // Color based on value type
          if (isTotal) {
            damageElement.style.color = damageValue < 0 ? '#ff3333' : '#33ff33'
          } else if (damageValue < 0) {
            damageElement.style.color = '#ffaa00' // Orange for damage components
          } else {
            damageElement.style.color = '#66ff66' // Light green for healing/bonuses
          }

          // Position relative to creature
          const rect = creatureElement.getBoundingClientRect()
          damageElement.style.left = `${rect.left + rect.width / 2 - 50}px`
          damageElement.style.top = `${rect.top - 20}px`

          document.body.appendChild(damageElement)

          // Animate upward and fade out
          damageElement.animate([
            { transform: 'translateY(0px)', opacity: 1 },
            { transform: 'translateY(-40px)', opacity: 0 }
          ], {
            duration: animation.duration,
            easing: 'ease-out'
          }).onfinish = () => {
            if (document.body.contains(damageElement)) {
              document.body.removeChild(damageElement)
            }
            if (!completed && instance.onComplete) {
              completed = true
              instance.onComplete()
            }
          }
        }, delay)
      } else {
        console.warn(`Creature element not found for damage number: ${animation.targetId}`)
        setTimeout(() => {
          if (!completed && instance.onComplete) {
            completed = true
            instance.onComplete()
          }
        }, delay)
      }
    }
  }
  return instance
}

/**
 * Creates a burn effect animation
 */
const createBurnAnimation = (animation: Animation): AnimationInstance => {
  const instance: AnimationInstance = {
    play: () => {
      // Burn animation

      const creatureElement = document.querySelector(`[data-creature-id="${animation.targetId}"]`)

      if (creatureElement) {
        creatureElement.classList.add('burn-effect')

        setTimeout(() => {
          creatureElement.classList.remove('burn-effect')
          if (instance.onComplete) instance.onComplete()
        }, animation.duration)
      } else {
        console.warn(`Creature element not found for burn effect: ${animation.targetId}`)
        if (instance.onComplete) instance.onComplete()
      }
    }
  }
  return instance
}

/**
 * Creates a death animation
 */
const createDeathAnimation = (animation: Animation): AnimationInstance => {
  const instance: AnimationInstance = {
    play: () => {
      // Death animation

      const creatureElement = document.querySelector(`[data-creature-id="${animation.targetId}"]`)

      if (creatureElement) {
        creatureElement.animate([
          { opacity: 1, transform: 'scale(1)' },
          { opacity: 0.3, transform: 'scale(0.8)' }
        ], {
          duration: animation.duration,
          fill: 'forwards'
        }).onfinish = () => {
          if (instance.onComplete) instance.onComplete()
        }
      } else {
        console.warn(`Creature element not found for death animation: ${animation.targetId}`)
        if (instance.onComplete) instance.onComplete()
      }
    }
  }
  return instance
}

/**
 * Creates an attack windup animation
 */
const createAttackWindupAnimation = (animation: Animation): AnimationInstance => {
  const instance: AnimationInstance = {
    play: () => {
      // Attack windup animation

      const creatureElement = document.querySelector(`[data-creature-id="${animation.targetId}"]`)

      if (creatureElement) {
        creatureElement.animate([
          { transform: 'scale(1)' },
          { transform: 'scale(1.1)' },
          { transform: 'scale(1)' }
        ], {
          duration: animation.duration
        }).onfinish = () => {
          if (instance.onComplete) instance.onComplete()
        }
      } else {
        if (instance.onComplete) instance.onComplete()
      }
    }
  }
  return instance
}

/**
 * Creates an impact animation
 */
const createImpactAnimation = (animation: Animation): AnimationInstance => {
  const instance: AnimationInstance = {
    play: () => {
      // Impact animation
      // Quick flash effect
      setTimeout(() => {
        if (instance.onComplete) instance.onComplete()
      }, animation.duration)
    }
  }
  return instance
}

/**
 * Creates a healing animation
 */
const createHealingAnimation = (animation: Animation): AnimationInstance => {
  const instance: AnimationInstance = {
    play: () => {
      // Healing animation
      // Green glow effect
      setTimeout(() => {
        if (instance.onComplete) instance.onComplete()
      }, animation.duration)
    }
  }
  return instance
}

/**
 * Creates a status apply animation
 */
const createStatusApplyAnimation = (animation: Animation): AnimationInstance => {
  const instance: AnimationInstance = {
    play: () => {
      // Status apply animation
      // Status indicator effect
      setTimeout(() => {
        if (instance.onComplete) instance.onComplete()
      }, animation.duration)
    }
  }
  return instance
}

/**
 * Creates a default fallback animation
 */
const createDefaultAnimation = (animation: Animation): AnimationInstance => {
  const instance: AnimationInstance = {
    play: () => {
      // Default animation
      setTimeout(() => {
        if (instance.onComplete) instance.onComplete()
      }, animation.duration || 500)
    }
  }
  return instance
}```

---

## File: useBattleEngine.ts

```typescript
```

---

