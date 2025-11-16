# Serializable Effects Architecture

## Overview

Effects are now fully **serializable** and **decoupled** from their application logic. This means:

- ✅ Effects can be JSON.stringify/parsed
- ✅ Effect logic is testable in isolation
- ✅ Effects are pure data objects
- ✅ Easy to add new effect types

## Architecture

```typescript
// 1. Effect = Pure Data (Serializable)
type Effect = {
  id: string
  type: string        // Effect type for registry lookup
  targetId: number
  priority?: number
  data: any          // Serializable payload
}

// 2. Applicator = Pure Function
type EffectApplicator = (
  effect: Effect,
  context: BattleContext
) => Promise<{
  stateChanges: StateChange[]
  animations: Animation[]
}>

// 3. Registry = Type -> Applicator mapping
const REGISTRY: Record<string, EffectApplicator> = {
  'ATTACK': applyAttackEffect,
  'HEAL': applyHealEffect,
  // ...
}
```

## Example: Creating a New Effect Type

### Step 1: Define Effect Data Type

```typescript
// effects/myEffects.ts
export type PoisonEffectData = {
  casterId: number
  poisonDamage: number
  duration: number
}
```

### Step 2: Create Applicator Function

```typescript
import { registerEffectApplicator } from '../effectApplicatorRegistry'

const applyPoisonEffect = async (
  effect: Effect,
  context: BattleContext
): Promise<EffectApplicationResult> => {
  const { casterId, poisonDamage, duration } = effect.data as PoisonEffectData
  
  const caster = getCreatureFromContext(context, casterId)
  const target = getCreatureFromContext(context, effect.targetId)
  
  console.log(`☠️ Poison: ${caster.name} poisons ${target.name}`)
  
  return {
    stateChanges: [{
      type: 'STATUS_APPLIED',
      creatureId: effect.targetId,
      timestamp: Date.now(),
      data: {
        statusId: 'poison',
        duration,
        source: 'poison-spell'
      }
    }],
    animations: [
      { type: 'poison-cloud', targetId: effect.targetId, duration: 1000 }
    ]
  }
}

// Register the applicator
registerEffectApplicator('POISON', applyPoisonEffect)
```

### Step 3: Create Factory Function

```typescript
export const createPoisonEffect = (
  casterId: number,
  targetId: number,
  poisonDamage: number,
  duration: number
): Effect => ({
  id: 'poison',
  type: 'POISON',
  targetId,
  priority: 40,
  data: {
    casterId,
    poisonDamage,
    duration
  }
})
```

### Step 4: Use It!

```typescript
import { createPoisonEffect } from './effects/myEffects'
import { processEffectChain } from './effectPipelineEngine'

// Create a serializable effect
const poisonEffect = createPoisonEffect(
  attackerId: 1,
  targetId: 2,
  poisonDamage: 5,
  duration: 3
)

// Can serialize/deserialize!
const json = JSON.stringify(poisonEffect)
const restored = JSON.parse(json)

// Process it
await processEffectChain(poisonEffect, context)
```

## Benefits

### 1. Serializable
```typescript
// Save to database
const effectJson = JSON.stringify(effect)
await saveToDatabase(effectJson)

// Load from database
const loaded = JSON.parse(effectJson)
await processEffectChain(loaded, context)
```

### 2. Testable
```typescript
// Test applicator in isolation
const result = await applyPoisonEffect(mockEffect, mockContext)
expect(result.stateChanges).toHaveLength(1)
expect(result.animations).toHaveLength(1)
```

### 3. Type-Safe
```typescript
// Each effect type has its own data shape
type AttackEffectData = { attackerId: number; attack: Attack }
type HealEffectData = { casterId: number; healingAmount: number }
type PoisonEffectData = { casterId: number; poisonDamage: number; duration: number }
```

## Migration from Old Pattern

### Before (Method-based)
```typescript
const effect: Effect = {
  id: 'attack',
  targetId: 2,
  priority: 50,
  animations: [],
  apply: async (context) => {
    // Logic here
    const damage = calculateDamage()
    effect.animations = [...] // Mutate animations
    return [healthChange]
  }
}
```

### After (Serializable)
```typescript
const effect: Effect = {
  id: 'attack',
  type: 'ATTACK',
  targetId: 2,
  priority: 50,
  data: {
    attackerId: 1,
    attack: someAttack
  }
}

// Applicator is separate, registered once
registerEffectApplicator('ATTACK', async (effect, context) => {
  const damage = calculateDamage()
  return {
    stateChanges: [healthChange],
    animations: [...] // Return, don't mutate
  }
})
```

## Registry API

```typescript
// Register an applicator
registerEffectApplicator('MY_EFFECT', myApplicator)

// Apply an effect (looks up applicator automatically)
const result = await applyEffect(effect, context)

// Check if applicator exists
if (hasApplicator('MY_EFFECT')) { ... }

// Get all registered types
const types = getRegisteredEffectTypes()
```
