# Zustand Attack Flow - Current Implementation

**Last Updated:** October 17, 2025  
**Status:** ✅ Production Ready with Turn System  
**Architecture:** Effect Pipeline with Zustand Adapter

---

## 🎯 Overview

This document describes the **current working attack flow** in the battle system, which uses:
- **Zustand** for state management (via adapter)
- **Effect Pipeline** for deterministic effect processing
- **Turn-Based Combat** with status effect ticking
- **Trigger System** for passive abilities (Outbreak, Stone Thorns, etc.)

---

## 📊 High-Level Flow

```
User Action (Attack Button)
    ↓
performAttack() in useBattleEngine
    ↓
Create Attack Effect
    ↓
processEffectChain()
    ↓
Effect Applicators (ATTACK → DAMAGE → STATUS_APPLIED → TRIGGERS)
    ↓
applyChangesToContext() [Zustand]
    ↓
UI Updates Automatically
    ↓
Turn End → processEndOfTurn() → Status Ticking
```

---

## 🔥 Detailed Attack Flow

### **Step 1: User Initiates Attack**

**Location:** `BattleEngineExample.tsx` (lines ~300-320)

```typescript
const handleAttack = (attackerId: number, targetId: number, attackTemplate: string) => {
  performAttack(attackerId, targetId, attackTemplate)
}
```

**What Happens:**
- User clicks attack button in UI
- Button passes `attackerId`, `targetId`, and `attackTemplate`
- Calls `performAttack()` from `useBattleEngine` hook

---

### **Step 2: Create Attack Effect**

**Location:** `useBattleEngine.ts` (lines ~220-230)

```typescript
const performAttack = useCallback(async (
  attackerId: number, 
  targetId: number, 
  attackTemplate: string
) => {
  const effect = createAttackEffect(attackerId, targetId, attackTemplate)
  await applyEffect(effect)
}, [applyEffect])
```

**What Happens:**
- `createAttackEffect()` builds an Effect object:
  ```typescript
  {
    id: 'attack-1234567890',
    type: 'ATTACK',
    attackerId: 1,
    targetId: 2,
    priority: 10,
    timestamp: Date.now(),
    data: { attackTemplate: 'fireball' }
  }
  ```
- Effect is passed to `applyEffect()`

---

### **Step 3: Process Effect Chain**

**Location:** `useBattleEngine.ts` → `effectPipelineEngine.ts`

```typescript
const applyEffect = useCallback(async (effect: Effect) => {
  setIsProcessingEffects(true)
  
  try {
    await processEffectChain(contextRef.current, effect)
  } catch (error) {
    console.error('Error processing effect:', error)
  } finally {
    setIsProcessingEffects(false)
  }
}, [])
```

**What Happens:**
- `processEffectChain()` is the **core orchestrator**
- Handles effect priority and sequencing
- Calls appropriate applicators
- Triggers secondary effects (passive abilities, status effects)

---

### **Step 4: Effect Applicators Execute**

**Location:** `effectApplicators.ts` and `effectTriggers.ts`

#### **4a. ATTACK Applicator**
```typescript
// Validates attack, calculates damage, creates DAMAGE effect
registerApplicator('ATTACK', async (context, effect) => {
  const attacker = getCreatureFromContext(context, effect.attackerId)
  const target = getCreatureFromContext(context, effect.targetId)
  
  // Calculate damage
  const baseDamage = calculateDamage(attacker, target, attack)
  
  // Create DAMAGE effect (goes into the pipeline)
  return [createDamageEffect(effect.targetId, baseDamage, effect.attackerId)]
})
```

#### **4b. DAMAGE Applicator**
```typescript
// Applies damage, creates state changes
registerApplicator('DAMAGE', async (context, effect) => {
  const creature = getCreatureFromContext(context, effect.targetId)
  const newHealth = Math.max(0, creature.health - effect.data.damage)
  
  const stateChanges: StateChange[] = [{
    type: 'HEALTH_CHANGE',
    creatureId: effect.targetId,
    timestamp: Date.now(),
    data: {
      delta: -effect.data.damage,
      newHealth,
      source: effect.data.source
    }
  }]
  
  // Apply changes to Zustand
  applyChangesToContext(context, stateChanges)
  
  // Check for death
  if (newHealth <= 0) {
    return [createDeathEffect(effect.targetId)]
  }
  
  return []
})
```

#### **4c. STATUS_APPLIED Applicator**
```typescript
// Adds status effects (burn, poison, regen)
registerApplicator('STATUS_APPLIED', async (context, effect) => {
  const creature = getCreatureFromContext(context, effect.targetId)
  
  const stateChanges: StateChange[] = [{
    type: 'STATUS_APPLIED',
    creatureId: effect.targetId,
    timestamp: Date.now(),
    data: {
      statusId: effect.data.statusId,
      duration: effect.data.duration
    }
  }]
  
  applyChangesToContext(context, stateChanges)
  
  // Trigger passive abilities (Outbreak, etc.)
  return triggerPassiveAbilities(context, effect, 'status-applied')
})
```

---

### **Step 5: Passive Ability Triggers**

**Location:** `triggerSetup.ts` (lines 23-370)

#### **Example: Stone Thorns Passive**

```typescript
registerTrigger({
  id: 'stone-thorns',
  event: 'after-damage-taken',
  scope: 'LOCAL', // Only triggers on self
  condition: (context, event) => {
    const creature = getCreatureFromContext(context, event.targetId)
    return creature.passiveAbilities?.some(p => p.id === 'stone-thorns')
  },
  handler: (context, event) => {
    const passive = creature.passiveAbilities.find(p => p.id === 'stone-thorns')
    const reflectDamage = Math.floor(event.data.damage * passive.reflectPercent)
    
    // Create reflect damage effect
    return [createTrueDamageEffect(event.attackerId, reflectDamage)]
  }
})
```

#### **Example: Outbreak Passive (Fixed!)**

```typescript
registerTrigger({
  id: 'outbreak',
  event: 'status-applied',
  scope: 'LOCAL', // ✅ Only triggers on Plague Rat itself
  condition: (context, event) => {
    const burnedCreature = getCreatureFromContext(context, event.targetId)
    return event.data.statusId === 'BURN' && 
           burnedCreature.passiveAbilities?.some(p => p.id === 'outbreak')
  },
  handler: (context, event) => {
    const passive = burnedCreature.passiveAbilities.find(p => p.id === 'outbreak')
    const spreadChance = passive.spreadChance // 0.25 (25%)
    
    if (Math.random() < spreadChance) {
      // Spread burn to random enemy
      const enemies = getEnemyCreatures(context, event.targetId)
      const target = enemies[Math.floor(Math.random() * enemies.length)]
      
      return [createBurnEffect(target.ID, passive.spreadDuration)]
    }
    
    return []
  }
})
```

---

### **Step 6: State Updates via Zustand**

**Location:** `battleContext.ts` and `zustandAdapter.ts`

```typescript
export const applyChangesToContext = (
  context: BattleContext, 
  changes: StateChange[]
) => {
  // Zustand adapter applies changes to store
  const newState = applyStateChanges(context.state, changes)
  
  // Update Zustand store
  context.setState(newState)
  
  // Notify subscribers (React components re-render)
  context.notifySubscribers('all')
}
```

**What Happens:**
- State changes are applied immutably
- Zustand store updates
- React components subscribed to state auto-update
- UI shows new health, statuses, animations

---

## 🔄 Turn System Flow

### **Turn End Processing**

**Location:** `useBattleEngine.ts` (lines 145-217)

```typescript
const processEndOfTurn = useCallback(async () => {
  const ctx = contextRef.current
  
  // 1. Gather all creatures
  const allCreatures = [
    ...(ctx.state.playerCreatures || []),
    ...(ctx.state.computerCreatures || [])
  ]
  
  // 2. Build effects for each active status
  const effectsToApply: Effect[] = []
  
  for (const creature of allCreatures) {
    if (!creature || creature.health <= 0) continue
    
    for (const status of creature.statuses) {
      if (status.id === 'BURN') {
        effectsToApply.push(createBurnEffect(creature.ID, undefined))
      } else if (status.id === 'POISON') {
        effectsToApply.push(createPoisonEffect(creature.ID, undefined))
      } else if (status.id === 'REGENERATION') {
        effectsToApply.push(createRegenerationEffect(creature.ID, undefined))
      }
    }
  }
  
  // 3. Apply effects sequentially (deterministic order)
  for (const eff of effectsToApply) {
    try {
      await applyEffect(eff)
    } catch (err) {
      console.error('Error applying status tick effect', err)
    }
  }
  
  // 4. Decrement durations (batch update)
  const durationChanges: StateChange[] = []
  
  for (const creature of allCreatures) {
    if (!creature || creature.health <= 0) continue
    
    for (const status of creature.statuses) {
      const newDuration = (status.duration || 0) - 1
      
      if (newDuration <= 0) {
        durationChanges.push({
          type: 'STATUS_REMOVED',
          creatureId: creature.ID,
          timestamp: Date.now(),
          data: { statusId: status.id, reason: 'expired' }
        })
      } else {
        durationChanges.push({
          type: 'STATUS_APPLIED',
          creatureId: creature.ID,
          timestamp: Date.now(),
          data: { statusId: status.id, duration: newDuration, source: 'tick' }
        })
      }
    }
  }
  
  // 5. Apply all duration changes in one update
  if (durationChanges.length > 0) {
    try {
      applyChangesToContext(ctx, durationChanges)
    } catch (err) {
      console.error('Error applying duration changes', err)
    }
  }
}, [applyEffect])
```

**UI Integration:**

```typescript
// BattleEngineExample.tsx
const handleEndTurn = () => {
  processEndOfTurn()
  setTurnNumber(prev => prev + 1)
  setCurrentTurnOwner(prev => prev === 'player' ? 'computer' : 'player')
}

<button onClick={handleEndTurn}>
  End Turn
</button>
```

---

## 🎨 UI Update Flow

### **Automatic Re-rendering**

```typescript
// BattleEngineExample.tsx
const { battleState } = useBattleEngine(initialState)

// React automatically re-renders when battleState changes
return (
  <div>
    {battleState.playerCreatures.map(creature => (
      <Creature 
        key={creature.ID}
        health={creature.health} // ✅ Auto-updates
        statuses={creature.statuses} // ✅ Auto-updates
      />
    ))}
  </div>
)
```

### **Status Badge Display**

```typescript
// Shows current duration and allows clicking for details
{creature.statuses.map(status => (
  <div 
    key={status.id}
    onClick={(e) => {
      e.stopPropagation()
      handleStatusClick(status)
    }}
  >
    {status.icon} {status.duration}
  </div>
))}
```

---

## 🔍 Data Flow Diagram

```
┌──────────────────────────────────────────────────────────┐
│                     User Action                          │
│              (Click Attack Button)                       │
└─────────────────────┬────────────────────────────────────┘
                      │
                      ↓
┌──────────────────────────────────────────────────────────┐
│              useBattleEngine.performAttack()             │
│           Creates Effect: { type: 'ATTACK' }             │
└─────────────────────┬────────────────────────────────────┘
                      │
                      ↓
┌──────────────────────────────────────────────────────────┐
│            processEffectChain() [Engine]                 │
│        Orchestrates effect processing pipeline           │
└─────────────────────┬────────────────────────────────────┘
                      │
                      ↓
        ┌─────────────┴─────────────┐
        │                           │
        ↓                           ↓
┌──────────────────┐      ┌──────────────────┐
│ ATTACK Applicator│      │ Trigger Checks   │
│  - Validates     │      │  - Passive Abil. │
│  - Calculates    │      │  - Status Effects│
│  - Creates DAMAGE│      │  - React to Event│
└────────┬─────────┘      └─────────┬────────┘
         │                          │
         └────────┬─────────────────┘
                  │
                  ↓
┌──────────────────────────────────────────────────────────┐
│             DAMAGE Applicator                            │
│        - Reduces health                                  │
│        - Creates StateChange[]                           │
│        - Checks for death                                │
└─────────────────────┬────────────────────────────────────┘
                      │
                      ↓
┌──────────────────────────────────────────────────────────┐
│          applyChangesToContext() [Zustand]               │
│        - Applies state changes immutably                 │
│        - Updates Zustand store                           │
│        - Notifies subscribers                            │
└─────────────────────┬────────────────────────────────────┘
                      │
                      ↓
┌──────────────────────────────────────────────────────────┐
│              React Components Re-render                  │
│        - Health bars update                              │
│        - Status badges update                            │
│        - Animations trigger                              │
│        - Turn counter increments                         │
└──────────────────────────────────────────────────────────┘
```

---

## 🎮 Example Attack Scenarios

### **Scenario 1: Basic Attack (No Status)**

```
Draco attacks Harper with "Pierce"
    ↓
createAttackEffect(draco.ID, harper.ID, 'pierce')
    ↓
ATTACK Applicator: Calculate damage = 15
    ↓
createDamageEffect(harper.ID, 15)
    ↓
DAMAGE Applicator: harper.health = 200 - 15 = 185
    ↓
applyChangesToContext({ type: 'HEALTH_CHANGE', delta: -15 })
    ↓
UI updates: Harper's health bar shows 185/200
```

---

### **Scenario 2: Attack with Burn Status**

```
Draco attacks Goblin with "Fireball"
    ↓
createAttackEffect(draco.ID, goblin.ID, 'fireball')
    ↓
ATTACK Applicator: Damage = 20, 90% chance to burn
    ↓
createDamageEffect(goblin.ID, 20)
createStatusEffect(goblin.ID, 'BURN', duration: 3)
    ↓
DAMAGE Applicator: goblin.health = 100 - 20 = 80
STATUS_APPLIED Applicator: goblin.statuses.push({ id: 'BURN', duration: 3 })
    ↓
Check triggers: Is goblin Plague Rat with Outbreak? No
    ↓
applyChangesToContext([health change, status applied])
    ↓
UI updates: Goblin at 80HP with 🔥3 badge
```

---

### **Scenario 3: Burn Plague Rat (Outbreak Triggers)**

```
Draco attacks Plague Rat with "Fireball"
    ↓
createAttackEffect(draco.ID, plagueRat.ID, 'fireball')
    ↓
ATTACK & DAMAGE Applicators: Damage = 20
    ↓
STATUS_APPLIED: Apply BURN to Plague Rat
    ↓
Trigger Check: Plague Rat has 'outbreak' passive!
    ↓
Outbreak Handler: 25% chance to spread...
Math.random() = 0.15 (Success! < 0.25)
    ↓
createBurnEffect(randomEnemy.ID, duration: 2)
    ↓
Apply burn to another enemy creature
    ↓
UI updates: Plague Rat AND another enemy both burning
```

---

### **Scenario 4: Turn End - Status Ticking**

```
User clicks "End Turn"
    ↓
handleEndTurn() calls processEndOfTurn()
    ↓
Gather creatures: [Goblin(BURN:3), Harper(POISON:2), Draco(REGEN:1)]
    ↓
Create effects:
  - createBurnEffect(goblin.ID)
  - createPoisonEffect(harper.ID)
  - createRegenerationEffect(draco.ID)
    ↓
Apply sequentially:
  1. Goblin takes 5 burn damage → 80 - 5 = 75 HP
  2. Harper takes 10 poison damage → 185 - 10 = 175 HP
  3. Draco heals 10 HP → 240 + 10 = 250 HP
    ↓
Decrement durations:
  - Goblin BURN: 3 → 2
  - Harper POISON: 2 → 1
  - Draco REGEN: 1 → 0 (REMOVED)
    ↓
Batch apply duration changes (single context update)
    ↓
UI updates:
  - Goblin: 75HP, 🔥2
  - Harper: 175HP, 🧪1
  - Draco: 250HP, no status
  - Turn counter: 1 → 2
  - Owner: player → computer
```

---

## 🏗️ Architecture Principles

### **1. Effect Pipeline Pattern**
- **Separation of Concerns**: Effects describe WHAT to do, Applicators describe HOW
- **Composability**: Effects can spawn more effects (chaining)
- **Priority System**: Higher priority effects run first
- **Deterministic**: Sequential processing ensures predictable order

### **2. Trigger System**
- **Event-Driven**: Triggers react to events (damage-taken, status-applied)
- **Scope-Based**: LOCAL (self), TEAM (allies), GLOBAL (all), ENEMY_TEAM (enemies)
- **Conditional**: Triggers only fire when condition met
- **Chainable**: Triggers can create new effects

### **3. Zustand Integration**
- **Immutable Updates**: State changes never mutate directly
- **Subscription Model**: Components auto-update when state changes
- **Adapter Pattern**: BattleContext wraps Zustand for flexibility
- **Performance**: Batched updates reduce re-renders

### **4. Turn-Based Design**
- **Sequential Status Ticking**: Deterministic order for logs/animations
- **Batched Duration Updates**: Single context update for all durations
- **Clean Expiration**: Statuses automatically removed at duration 0
- **Turn Ownership**: Tracks whose turn it is (player/computer)

---

## 📁 Key Files

| File | Purpose | Lines |
|------|---------|-------|
| `useBattleEngine.ts` | React hook, main API | 431 |
| `effectPipelineEngine.ts` | Core orchestrator | ~200 |
| `effectApplicators.ts` | Effect handlers (ATTACK, DAMAGE, etc.) | ~500 |
| `triggerSetup.ts` | Passive ability triggers | 370 |
| `battleContext.ts` | State management core | ~150 |
| `zustandAdapter.ts` | Zustand integration | ~100 |
| `BattleEngineExample.tsx` | Demo UI component | 800+ |
| `statusEffects.ts` | Effect factory functions | ~300 |
| `combatEffects.ts` | Combat effect factories | ~250 |

---

## 🧪 Testing Checklist

### **Basic Attacks**
- [ ] Attack hits and deals damage
- [ ] Attack misses (based on chanceToLand)
- [ ] Attacker dies mid-attack (edge case)
- [ ] Target dies from damage

### **Status Effects**
- [ ] Burn applies and ticks each turn
- [ ] Poison applies and ticks each turn
- [ ] Regeneration applies and heals each turn
- [ ] Durations count down correctly
- [ ] Statuses expire at duration 0
- [ ] Multiple statuses on same creature

### **Passive Abilities**
- [ ] Stone Thorns reflects damage
- [ ] Kindle increases fire damage
- [ ] Outbreak spreads burn (25% chance, LOCAL scope)
- [ ] Poison Skin applies poison to attacker
- [ ] First Blood triggers on first hit

### **Turn System**
- [ ] Turn counter increments
- [ ] Turn owner switches (player ↔ computer)
- [ ] Status effects tick on turn end
- [ ] Creatures with multiple statuses process all
- [ ] Dead creatures skip processing

### **UI Updates**
- [ ] Health bars update instantly
- [ ] Status badges show correct duration
- [ ] Status badges clickable (shows InfoModal)
- [ ] Passive ability cards clickable (shows InfoModal)
- [ ] Turn counter displays correctly
- [ ] End Turn button works

---

## 🚀 Future Enhancements

### **Phase 3: Attack Variety** (Next)
- Multi-target attacks (AoE)
- Physical/Magical/True damage types
- Conditional attacks (low HP → extra damage)
- Attack combos and chains

### **Phase 4: Advanced Systems**
- AI opponent decision-making
- Attack cooldowns
- Mana/resource system
- Victory/defeat conditions

### **Phase 5: Polish**
- Animations and sound effects
- Advanced UI (drag-drop, tooltips)
- Tutorial system
- Balance testing

---

## 📝 Notes

- **Zustand Enabled**: `USE_ZUSTAND_ADAPTER = true` in `useBattleEngine.ts`
- **Outbreak Fixed**: Changed from GLOBAL to LOCAL scope (10/17/2025)
- **Turn System**: Added 10/17/2025 - fully functional
- **InfoModal**: Added 10/17/2025 - clickable status/passive info

---

## 🎓 Learning Resources

- **Effect Pipeline Pattern**: See `effectPipelineEngine.ts` comments
- **Zustand Docs**: https://github.com/pmndrs/zustand
- **Trigger System**: See `triggerSetup.ts` for examples
- **Turn System**: See `TURN_SYSTEM_IMPLEMENTATION.md`

---

**Document Version:** 1.0  
**Author:** Battle System Team  
**Last Tested:** October 17, 2025  
**Status:** ✅ All systems operational
