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
