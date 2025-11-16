# Modular Trigger System Design

**Goal**: Create an MTG-style cascading trigger system where ANY event can trigger ANY effect on ANY target with ANY condition.

---

## Current System Limitations

### Passive Ability Type (Rigid)
```typescript
type PassiveAbility = {
  trigger: 'on_damaged' | 'on_attack' | ...  // ❌ Fixed to SELF only
  effect: {
    targetType: 'attacker' | 'self' | 'all_enemies'  // ❌ Limited scope
  }
}
```

**Can't do:**
- ❌ "When ANY ally is damaged, heal them"
- ❌ "When ANY enemy is healed, steal half"
- ❌ "When ally dies, buff all allies"
- ❌ "When status applied to ally, cleanse it"

---

## Proposed Universal Trigger System

### New PassiveAbility Structure

```typescript
type UniversalPassiveAbility = {
  id: string
  name: string
  description: string
  
  // ============ TRIGGER DEFINITION ============
  trigger: {
    // What state change to watch
    event: StateChangeType  // 'HEALTH_CHANGE', 'STATUS_APPLIED', etc.
    
    // Who triggers this?
    scope: TriggerScope
    
    // Additional filtering
    condition?: (change: StateChange, context: BattleContext) => boolean
  }
  
  // ============ EFFECT DEFINITION ============
  effect: {
    // What to do
    type: EffectType  // 'heal', 'damage', 'status', 'buff', etc.
    
    // Who to target
    targetSelector: TargetSelector
    
    // How much / additional params
    value?: number
    statusId?: string
    duration?: number
    chance?: number
  }
  
  icon?: string
}
```

### Trigger Scopes

```typescript
type TriggerScope = 
  // SELF SCOPES - Only when this creature is affected
  | 'self'                    // When THIS creature experiences the event
  
  // TEAM SCOPES - When any ally experiences the event
  | 'any_ally'                // When any allied creature (including self)
  | 'other_ally'              // When any OTHER allied creature (not self)
  | 'all_allies'              // Fires once when ANY ally affected
  
  // ENEMY SCOPES - When any enemy experiences the event
  | 'any_enemy'               // When any enemy creature
  | 'all_enemies'             // Fires once when ANY enemy affected
  
  // GLOBAL SCOPES - When any creature experiences the event
  | 'any_creature'            // When literally any creature
  | 'all_creatures'           // Fires once for any creature
  
  // CONDITIONAL SCOPES - Special logic
  | 'conditional'             // Use condition function for complex logic
```

### Target Selectors

```typescript
type TargetSelector = 
  // SPECIFIC TARGETS
  | 'self'                    // The creature with this passive
  | 'trigger_source'          // The creature that caused the trigger
  | 'trigger_target'          // The creature affected by the trigger
  
  // SINGLE SELECTION
  | 'random_ally'             // Random allied creature
  | 'random_enemy'            // Random enemy creature
  | 'lowest_hp_ally'          // Ally with lowest HP
  | 'lowest_hp_enemy'         // Enemy with lowest HP
  | 'highest_atk_ally'        // Ally with highest ATK
  
  // MULTI-TARGET
  | 'all_allies'              // All allied creatures
  | 'all_enemies'             // All enemy creatures
  | 'all_creatures'           // All creatures in battle
  | 'adjacent_allies'         // Allies next to this creature (positional)
  
  // CONDITIONAL SELECTION
  | { type: 'conditional', filter: (creature: Creature) => boolean }
```

---

## Example Passive Abilities

### Example 1: Stone Thorns (Current System)
```typescript
{
  id: 'stone-thorns',
  name: 'Stone Thorns',
  trigger: {
    event: 'HEALTH_CHANGE',
    scope: 'self',
    condition: (change) => change.data.delta < 0  // Only damage
  },
  effect: {
    type: 'damage',
    targetSelector: 'trigger_source',  // Hit the attacker
    value: 15
  }
}
```

### Example 2: Team Healer (New Capability)
```typescript
{
  id: 'team-healer',
  name: 'Protective Aura',
  description: 'When any ally takes damage, heal them for 5',
  trigger: {
    event: 'HEALTH_CHANGE',
    scope: 'any_ally',  // ✅ Watches ALL allies!
    condition: (change) => change.data.delta < 0
  },
  effect: {
    type: 'heal',
    targetSelector: 'trigger_target',  // Heal the damaged ally
    value: 5,
    chance: 1.0
  }
}
```

### Example 3: Vampiric Presence (Steal Healing)
```typescript
{
  id: 'vampiric-presence',
  name: 'Vampiric Presence',
  description: 'When any enemy is healed, steal 50% of that healing',
  trigger: {
    event: 'HEALTH_CHANGE',
    scope: 'any_enemy',
    condition: (change) => change.data.delta > 0  // Only healing
  },
  effect: {
    type: 'heal',
    targetSelector: 'self',
    value: (triggerData) => Math.floor(triggerData.delta * 0.5),  // ✅ Dynamic value!
    chance: 1.0
  }
}
```

### Example 4: Rallying Cry (On Death, Buff Team)
```typescript
{
  id: 'rallying-cry',
  name: 'Rallying Cry',
  description: 'When an ally dies, all allies gain +10 ATK for 3 turns',
  trigger: {
    event: 'CREATURE_DIED',
    scope: 'other_ally',  // When OTHER allies die (not self)
  },
  effect: {
    type: 'buff_attack',
    targetSelector: 'all_allies',  // ✅ Multi-target!
    value: 10,
    duration: 3
  }
}
```

### Example 5: Plague Doctor (Status Cleanse)
```typescript
{
  id: 'plague-doctor',
  name: 'Plague Doctor',
  description: 'When a debuff is applied to any ally, 30% chance to cleanse it',
  trigger: {
    event: 'STATUS_APPLIED',
    scope: 'any_ally',
    condition: (change, context) => {
      const status = getStatusById(change.data.statusId)
      return status.type === 'debuff'  // ✅ Conditional logic!
    }
  },
  effect: {
    type: 'cleanse',
    targetSelector: 'trigger_target',
    chance: 0.3
  }
}
```

### Example 6: Chain Reaction (Conditional Multi-Target)
```typescript
{
  id: 'chain-reaction',
  name: 'Chain Reaction',
  description: 'When you damage a burning enemy, spread burn to adjacent enemies',
  trigger: {
    event: 'HEALTH_CHANGE',
    scope: 'conditional',
    condition: (change, context) => {
      // Only when SELF deals damage to a BURNING enemy
      if (change.data.sourceCreatureId !== this.ID) return false
      const target = getCreatureFromContext(context, change.creatureId)
      return target.statuses.some(s => s.id === 'BURN')
    }
  },
  effect: {
    type: 'burn',
    targetSelector: {
      type: 'conditional',
      filter: (creature, context) => {
        // Adjacent enemies to the burned target
        const targetPos = getCreaturePosition(change.creatureId)
        const creaturePos = getCreaturePosition(creature.ID)
        return Math.abs(targetPos - creaturePos) === 1
      }
    },
    value: 5,
    duration: 2
  }
}
```

---

## Implementation Strategy

### Phase 1: Extend Current System (Backward Compatible)

Add new trigger handlers without breaking existing passives:

```typescript
// In triggerSetup.ts
const setupUniversalPassiveTriggers = (): void => {
  // For each StateChange type
  ['HEALTH_CHANGE', 'STATUS_APPLIED', 'CREATURE_DIED', ...].forEach(eventType => {
    registerEffectTrigger(eventType, {
      condition: (change, context) => {
        // Scan ALL creatures for matching universal passives
        const allCreatures = [
          ...context.state.playerCreatures,
          ...context.state.computerCreatures
        ]
        
        return allCreatures.some(creature => 
          hasMatchingUniversalPassive(creature, eventType, change, context)
        )
      },
      createEffect: (change, context) => {
        // Find all matching passives and create effects
        const effects = []
        
        allCreatures.forEach(creature => {
          const passives = getMatchingPassives(creature, eventType, change, context)
          passives.forEach(passive => {
            const targets = resolveTargetSelector(passive.effect.targetSelector, change, context)
            targets.forEach(target => {
              effects.push(createEffectFromPassive(passive, target, change))
            })
          })
        })
        
        return effects
      }
    })
  })
}
```

### Phase 2: Helper Functions

```typescript
// Check if trigger scope matches
const matchesTriggerScope = (
  scope: TriggerScope,
  change: StateChange,
  creature: Creature,
  context: BattleContext
): boolean => {
  switch (scope) {
    case 'self':
      return change.creatureId === creature.ID
    
    case 'any_ally':
      const targetCreature = getCreatureFromContext(context, change.creatureId)
      return targetCreature.owner === creature.owner
    
    case 'other_ally':
      const target = getCreatureFromContext(context, change.creatureId)
      return target.owner === creature.owner && target.ID !== creature.ID
    
    case 'any_enemy':
      const enemy = getCreatureFromContext(context, change.creatureId)
      return enemy.owner !== creature.owner
    
    // ... more scopes
  }
}

// Resolve target selector to actual creatures
const resolveTargetSelector = (
  selector: TargetSelector,
  change: StateChange,
  context: BattleContext,
  sourceCreature: Creature
): Creature[] => {
  switch (selector) {
    case 'self':
      return [sourceCreature]
    
    case 'trigger_source':
      if (change.data.sourceCreatureId) {
        return [getCreatureFromContext(context, change.data.sourceCreatureId)]
      }
      return []
    
    case 'trigger_target':
      return [getCreatureFromContext(context, change.creatureId)]
    
    case 'all_allies':
      return getAllies(sourceCreature, context)
    
    case 'random_ally':
      const allies = getAllies(sourceCreature, context)
      return [allies[Math.floor(Math.random() * allies.length)]]
    
    case 'lowest_hp_ally':
      const allAllies = getAllies(sourceCreature, context)
      return [allAllies.sort((a, b) => a.health - b.health)[0]]
    
    // ... more selectors
  }
}
```

---

## Migration Path

### Step 1: Keep Old System Working
```typescript
// Old passives still work
type LegacyPassiveAbility = { /* current structure */ }
type UniversalPassiveAbility = { /* new structure */ }

type PassiveAbility = LegacyPassiveAbility | UniversalPassiveAbility
```

### Step 2: Gradually Convert
```typescript
// Stone Thorns - Old way still works
{
  id: 'stone-thorns',
  trigger: 'on_damaged',  // Legacy
  effect: { ... }
}

// Stone Thorns - New way (same behavior)
{
  id: 'stone-thorns',
  trigger: {
    event: 'HEALTH_CHANGE',
    scope: 'self'
  },
  effect: { ... }
}
```

### Step 3: Add New Capabilities
```typescript
// Now we can do things we couldn't before!
{
  id: 'team-healer',
  trigger: {
    event: 'HEALTH_CHANGE',
    scope: 'any_ally'  // ✅ NEW!
  },
  effect: {
    targetSelector: 'trigger_target'  // ✅ NEW!
  }
}
```

---

## Benefits

✅ **Fully Modular** - Any trigger → Any effect → Any target  
✅ **MTG-Style** - Complex cascading interactions  
✅ **Backward Compatible** - Doesn't break existing code  
✅ **Extensible** - Easy to add new scopes/selectors  
✅ **Testable** - Each component can be tested independently  
✅ **Readable** - Passive definitions are self-documenting  

---

## Next Steps

1. ✅ **Document** - This file!
2. Create `universalTriggerTypes.ts` with new type definitions
3. Implement `resolveTargetSelector()` helper
4. Implement `matchesTriggerScope()` helper
5. Add `setupUniversalPassiveTriggers()` to triggerSetup
6. Test with simple universal passive
7. Gradually migrate existing passives
8. Add new complex passives to showcase system

---

**Status**: Design complete, ready for implementation
**Complexity**: Medium (backward compatible, incremental)
**Impact**: High (unlocks entire game design space)
