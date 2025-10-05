# Effect Pipeline System

A functional, reactive effect system that handles cascading battle effects with sequential animations.

## Overview

The Effect Pipeline System solves the problem of "effects that trigger effects" by providing:

- **Infinite Depth Handling**: Processes effect chains until no more effects are generated
- **Sequential Animations**: Ensures animations play in order and complete before the next effect
- **Loop Prevention**: Prevents infinite loops with effect ID tracking
- **Declarative Effects**: Easy-to-define, composable effects
- **React Integration**: Clean hooks interface for components

## Architecture

```
Effect Pipeline Engine (Core Orchestrator)
├── Effect Pipeline (Queue Management)
├── Effect Resolver (Trigger Detection)
├── Animation Engine (Sequential Animation)
├── Battle Context (State Management)
└── React Integration Hook
```

## Quick Start

### 1. Basic Usage

```typescript
import { useBattleEngine } from './utils/effectPipeline'

const BattleComponent = () => {
  const {
    battleState,
    applyBurn,
    performAttack,
    isProcessingEffects
  } = useBattleEngine(initialBattleState)

  const handleBurnAttack = async () => {
    // This will automatically handle:
    // 1. Apply burn effect
    // 2. Play burn animation
    // 3. Check for death
    // 4. Trigger cascading effects
    await applyBurn(targetCreatureId, 10)
  }

  return (
    <div>
      {/* Your battle UI */}
      {isProcessingEffects && <div>Processing effects...</div>}
    </div>
  )
}
```

### 2. Creating Custom Effects

```typescript
import { Effect, StateChange } from './utils/effectPipeline'

const createExplosionEffect = (targetId: number): Effect => ({
  id: 'explosion',
  targetId,
  priority: 50,
  animations: [
    { type: 'explosion', targetId, duration: 1000 },
    { type: 'damage-number', targetId, duration: 1200, data: { value: -25 } }
  ],
  apply: async (context) => {
    const creature = getCreatureFromContext(context, targetId)
    const damage = 25
    const newHealth = Math.max(0, creature.health - damage)

    return [{
      type: 'HEALTH_CHANGE' as const,
      creatureId: targetId,
      timestamp: Date.now(),
      data: {
        delta: -damage,
        newHealth,
        source: 'explosion'
      }
    }]
  }
})
```

### 3. Setting Up Custom Triggers

```typescript
import { registerEffectTrigger } from './utils/effectPipeline'

// Trigger explosion when creature dies
registerEffectTrigger('CREATURE_DIED', {
  condition: (change, context) => {
    const creature = getCreatureFromContext(context, change.creatureId)
    return creature.template === 'bomb' // Bomb creatures explode on death
  },
  createEffect: (change, context) => createExplosionEffect(change.creatureId),
  priority: 80
})
```

## API Reference

### useBattleEngine Hook

```typescript
const {
  // State
  battleState,
  isProcessingEffects,

  // Core function
  applyEffect,

  // Status effects
  applyBurn,
  applyPoison,
  applyRegeneration,
  applyAttackBuff,
  applyDefenseBuff,
  applyStun,

  // Combat actions
  performAttack,
  performTrueDamageAttack,
  performHealing,
  performLifeDrain,
  performAoeAttack,

  // Utilities
  getCreatureById,
  getAliveCreatures,
  isBattleOver,
  getBattleWinner,
  resetBattle
} = useBattleEngine(initialState)
```

### Effect Definition

```typescript
interface Effect {
  id: string
  targetId: number
  priority?: number
  animations: Animation[]
  apply: (context: BattleContext) => Promise<StateChange[]>
}
```

### Animation Definition

```typescript
interface Animation {
  type: string
  targetId: number
  duration: number
  data?: any
}
```

## Migration from useReducer

### Phase 1: Setup Alongside Existing System

```typescript
// Keep your existing useReducer
const state = useStateContext()
const dispatch = useDispatchContext()

// Add Effect Pipeline
const battleState = convertStateToBattleState(state)
const { applyEffect } = useBattleEngine(battleState)
```

### Phase 2: Migrate Effects One by One

```typescript
// Old way
dispatch({ type: 'UPDATE_CREATURE', creature: applyBurn(creature, status) })

// New way
await applyBurn(creature.ID, 5)
```

### Phase 3: Replace Attack System

```typescript
// Old way
await performAttack(attackPayload)

// New way
const effect = createAttackEffect(attackerId, targetId, attack)
await applyEffect(effect)
```

### Phase 4: Remove useReducer

Once all effects are migrated, remove the old GameContext and useReducer code.

## Available Effects

### Status Effects
- `applyBurn(targetId, damage)` - Damage over time with fire animation
- `applyPoison(targetId, damage)` - Damage over time with poison animation
- `applyRegeneration(targetId, healing)` - Healing over time
- `applyAttackBuff(targetId, bonus)` - Increases attack power
- `applyDefenseBuff(targetId, bonus)` - Increases defense
- `applyStun(targetId, duration)` - Prevents action

### Combat Effects
- `performAttack(attackerId, targetId, attack)` - Basic attack with damage calculation
- `performTrueDamageAttack(attackerId, targetId, damage)` - Ignores defense
- `performHealing(casterId, targetId, amount)` - Heals target
- `performLifeDrain(attackerId, targetId, amount)` - Damage + heal attacker
- `performAoeAttack(attackerId, targetIds[], damage)` - Multi-target attack

## Animation Types

The system supports these animation types:
- `shake` - Creature shake on damage
- `damage-number` - Floating damage/healing numbers
- `burn` - Fire effect animation
- `death-animation` - Death sequence
- `attack-windup` - Attack preparation
- `impact` - Hit effect
- `healing` - Healing glow
- `status-apply` - Status effect indicator

## Trigger Events

Effects can be triggered by these state changes:
- `HEALTH_CHANGE` - When creature health changes
- `STATUS_APPLIED` - When status effect is applied
- `STATUS_REMOVED` - When status effect expires
- `CREATURE_MOVED` - When creature position changes
- `CREATURE_DIED` - When creature health reaches 0
- `STAT_MODIFIED` - When creature stats change

## Example: Complex Effect Chain

```typescript
// This single call can trigger a complex chain:
await performAttack(dragonId, goblinId, fireBreathAttack)

// Automatically triggers:
// 1. Attack animation
// 2. Damage calculation and application
// 3. Burn status effect (if attack causes burn)
// 4. Death check (if health reaches 0)
// 5. Death animation and creature movement
// 6. Any death-rattle effects
// 7. Win condition checks
// All with proper animations and state management!
```

## Best Practices

1. **Effect Priority**: Higher priority effects (like death) run first
2. **Animation Duration**: Match animation durations to actual visual effects
3. **Loop Prevention**: Use unique effect IDs and the system handles loop prevention
4. **State Immutability**: All state changes are handled immutably by the system
5. **Error Handling**: Effects that fail don't break the entire chain

## Debugging

Use the debug utilities:

```typescript
const debugInfo = getDebugInfo()
console.log('Battle state:', debugInfo.battleState)
console.log('Processing effects:', debugInfo.isProcessingEffects)
```

## Performance

The system is optimized for performance:
- Effects only process when needed
- Animations are batched and sequential
- State changes are minimized and batched
- Memory usage is controlled with history limits

This system transforms your battle engine from a complex dispatch-based system into a clean, functional, reactive pipeline that handles any depth of effect cascading with proper animation sequencing.