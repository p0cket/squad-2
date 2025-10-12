# Trigger Scope Patterns Guide

**Last Updated:** October 19, 2025  
**Status:** ✅ Complete reference for passive ability scopes

---

## 🎯 What are Trigger Scopes?

**Trigger scopes** define which creatures a passive ability evaluates for/affects:

- **SELF**: Only the creature with the passive
- **LOCAL**: Evaluates for the creature with the passive, may affect others
- **TEAM**: All creatures on the same team
- **GLOBAL**: All creatures on the battlefield
- **ENEMY_TEAM**: All enemies

**Why it matters**: Wrong scope = wrong behavior (global when you want local, team-wide when you want self-only)

---

## 📋 Scope Patterns Reference

### 1. SELF Scope - "Self-Buffs"

**When to use**: Passive only affects the creature that has it

**Examples**:
- "Gain 5 armor when attacking"
- "Heal 10 HP at the start of your turn"
- "Deal bonus damage when below 50% health"

**Code Pattern**:
```typescript
{
  id: 'berserker_rage',
  name: 'Berserker Rage',
  description: 'Deal 50% more damage when below 50% health',
  trigger: 'ON_ATTACK',
  scope: 'SELF',
  effect: {
    type: 'MODIFY_DAMAGE',
    condition: (creature) => creature.health < creature.maxHealth * 0.5,
    multiplier: 1.5
  }
}
```

**Implementation**:
```typescript
registerTrigger({
  type: 'ON_ATTACK',
  scope: 'SELF',
  condition: (context, attacker) => {
    // SELF: Check if attacker has the passive
    return attacker.passiveAbilities?.some(a => a.id === 'berserker_rage') &&
           attacker.health < attacker.maxHealth * 0.5;
  },
  handler: (context, attacker, target) => {
    console.log(`💢 ${attacker.name}'s Berserker Rage activates!`);
    return [{
      type: 'MODIFY_DAMAGE',
      targetId: attacker.id,
      multiplier: 1.5
    }];
  }
});
```

**Key characteristic**: Trigger condition checks `attacker`/`creature` directly, effects target the same creature.

---

### 2. LOCAL Scope - "Conditional Spread"

**When to use**: Passive triggers FOR a specific creature, but MAY affect others

**Examples**:
- "Outbreak: When poisoned, 25% chance to spread poison to adjacent enemies"
- "Martyr: When killed, grant +5 attack to all allies"
- "Vengeance: When damaged, mark the attacker"

**Code Pattern**:
```typescript
{
  id: 'outbreak',
  name: 'Outbreak',
  description: '25% chance to spread poison to adjacent enemies when poisoned',
  trigger: 'ON_STATUS_APPLIED',
  scope: 'LOCAL', // Only triggers for THIS creature
  probability: 0.25,
  effect: {
    type: 'APPLY_STATUS',
    status: 'POISON',
    target: 'ADJACENT_ENEMIES'
  }
}
```

**Implementation**:
```typescript
registerTrigger({
  type: 'ON_STATUS_APPLIED',
  scope: 'LOCAL',
  condition: (context, data) => {
    const { creatureId, status } = data;
    const creature = context.getCreature(creatureId);
    
    // LOCAL: Only trigger if THIS creature has Outbreak
    const hasOutbreak = creature.passiveAbilities?.some(a => a.id === 'outbreak');
    if (!hasOutbreak) return false;
    
    // Only on poison application
    if (status !== 'POISON') return false;
    
    // Probability check
    return Math.random() < 0.25;
  },
  handler: (context, data) => {
    const { creatureId } = data;
    const creature = context.getCreature(creatureId);
    
    // Find adjacent enemies
    const adjacentEnemies = context.getAdjacentCreatures(creatureId)
      .filter(c => c.team !== creature.team);
    
    if (adjacentEnemies.length === 0) return [];
    
    // Spread to random adjacent enemy
    const target = adjacentEnemies[Math.floor(Math.random() * adjacentEnemies.length)];
    
    console.log(`🦠 Outbreak! ${creature.name} spreads poison to ${target.name}`);
    
    return [{
      type: 'APPLY_STATUS',
      targetId: target.id,
      status: 'POISON',
      duration: 3,
      value: 5
    }];
  }
});
```

**Key characteristic**: Condition checks `creatureId === specificCreature`, handler affects OTHER creatures.

**⚠️ Cascading Warning**: LOCAL scopes can cascade if the affected creature ALSO has the passive!

---

### 3. TEAM Scope - "Team-Wide Buffs"

**When to use**: Passive affects all creatures on the same team

**Examples**:
- "Leadership: All allies deal +5 damage"
- "Rallying Cry: When attacking, all allies gain +2 defense"
- "Pack Tactics: Allies adjacent to this creature gain +3 attack"

**Code Pattern**:
```typescript
{
  id: 'leadership',
  name: 'Leadership',
  description: 'All allies deal +5 damage',
  trigger: 'PASSIVE', // Always active
  scope: 'TEAM',
  effect: {
    type: 'MODIFY_STATS',
    stat: 'attack',
    value: 5,
    target: 'ALL_ALLIES'
  }
}
```

**Implementation**:
```typescript
registerTrigger({
  type: 'ON_ATTACK',
  scope: 'TEAM',
  condition: (context, attacker) => {
    // TEAM: Check if ANY ally has leadership
    const allies = context.getCreatures().filter(c => c.team === attacker.team);
    return allies.some(ally => 
      ally.passiveAbilities?.some(a => a.id === 'leadership')
    );
  },
  handler: (context, attacker) => {
    // Find the leader
    const allies = context.getCreatures().filter(c => c.team === attacker.team);
    const leader = allies.find(ally => 
      ally.passiveAbilities?.some(a => a.id === 'leadership')
    );
    
    if (!leader) return [];
    
    console.log(`👑 ${leader.name}'s Leadership inspires ${attacker.name}!`);
    
    return [{
      type: 'MODIFY_DAMAGE',
      targetId: attacker.id,
      bonus: 5
    }];
  }
});
```

**Key characteristic**: Condition checks `team`, handler affects multiple creatures on same team.

**Performance note**: TEAM scope evaluates on EVERY team member's action - optimize condition checks!

---

### 4. GLOBAL Scope - "Battlefield Effects"

**When to use**: Passive affects ALL creatures regardless of team

**Examples**:
- "Time Warp: All creatures move twice as fast"
- "Corruption: All creatures take 2 damage at turn end"
- "Inspiration: When any creature heals, all creatures gain +1 HP"

**Code Pattern**:
```typescript
{
  id: 'corruption',
  name: 'Corruption',
  description: 'All creatures take 2 damage at the end of each turn',
  trigger: 'ON_TURN_END',
  scope: 'GLOBAL',
  effect: {
    type: 'DAMAGE',
    value: 2,
    target: 'ALL_CREATURES'
  }
}
```

**Implementation**:
```typescript
registerTrigger({
  type: 'ON_TURN_END',
  scope: 'GLOBAL',
  condition: (context) => {
    // GLOBAL: Check if ANY creature has corruption
    return context.getCreatures().some(c => 
      c.passiveAbilities?.some(a => a.id === 'corruption')
    );
  },
  handler: (context) => {
    const corruptor = context.getCreatures().find(c => 
      c.passiveAbilities?.some(a => a.id === 'corruption')
    );
    
    if (!corruptor) return [];
    
    console.log(`☠️ ${corruptor.name}'s Corruption damages all creatures!`);
    
    // Apply to ALL creatures (including the corruptor!)
    return context.getCreatures().map(creature => ({
      type: 'HEALTH_CHANGE',
      targetId: creature.id,
      delta: -2,
      source: 'corruption'
    }));
  }
});
```

**Key characteristic**: No team filtering, affects EVERYTHING.

**⚠️ Performance Warning**: GLOBAL scopes are expensive - they evaluate/affect many creatures!

---

### 5. ENEMY_TEAM Scope - "AoE Attacks"

**When to use**: Passive affects all enemies

**Examples**:
- "Chain Lightning: Attacks hit all enemies for 50% damage"
- "Intimidate: When entering battle, reduce all enemy attack by 3"
- "Plague Aura: At turn start, all enemies take 3 poison damage"

**Code Pattern**:
```typescript
{
  id: 'chain_lightning',
  name: 'Chain Lightning',
  description: 'Attacks hit all enemies for 50% damage',
  trigger: 'ON_ATTACK',
  scope: 'ENEMY_TEAM',
  effect: {
    type: 'DAMAGE',
    multiplier: 0.5,
    target: 'ALL_ENEMIES'
  }
}
```

**Implementation**:
```typescript
registerTrigger({
  type: 'ON_ATTACK',
  scope: 'ENEMY_TEAM',
  condition: (context, attacker, target) => {
    // Check if attacker has chain lightning
    return attacker.passiveAbilities?.some(a => a.id === 'chain_lightning');
  },
  handler: (context, attacker, target, damage) => {
    const enemies = context.getCreatures()
      .filter(c => c.team !== attacker.team && c.id !== target.id);
    
    if (enemies.length === 0) return [];
    
    console.log(`⚡ ${attacker.name}'s Chain Lightning hits ${enemies.length} enemies!`);
    
    // Deal 50% damage to all OTHER enemies
    return enemies.map(enemy => ({
      type: 'HEALTH_CHANGE',
      targetId: enemy.id,
      delta: Math.floor(-damage * 0.5),
      source: 'chain_lightning'
    }));
  }
});
```

**Key characteristic**: Filters by `team !== attacker.team`, affects all enemies.

---

## 🎓 Choosing the Right Scope

### Decision Tree

```
Does the passive only affect the creature that has it?
├─ YES → SELF
└─ NO → Does it affect teammates?
    ├─ YES → Does it affect enemies too?
    │   ├─ YES → GLOBAL
    │   └─ NO → TEAM
    └─ NO → Does it only affect specific creatures conditionally?
        ├─ YES → LOCAL
        └─ NO → ENEMY_TEAM
```

### Examples by Intent

**"When I do X, I get Y"** → SELF
- Lifesteal, self-healing, armor gain, damage boost

**"When I do X, allies get Y"** → TEAM
- Buffs, healing auras, shared benefits

**"When X happens to me, affect others"** → LOCAL
- Outbreak (spread status), Martyr (death effect), Retaliate (counter-attack)

**"When I do X, enemies get Y"** → ENEMY_TEAM
- AoE attacks, debuffs, damage auras

**"When X happens, everyone gets Y"** → GLOBAL
- Battlefield effects, environmental hazards, game modifiers

---

## ⚡ Performance Considerations

### Scope Performance (Fast → Slow)

1. **SELF** - Fastest (checks 1 creature)
2. **LOCAL** - Fast (checks 1 creature, may affect 1-3)
3. **TEAM** - Medium (checks 3-5 creatures typically)
4. **ENEMY_TEAM** - Medium (checks 3-5 creatures typically)
5. **GLOBAL** - Slowest (checks ALL creatures)

### Optimization Tips

**For TEAM/GLOBAL scopes:**
```typescript
// ❌ BAD - Re-evaluates every time
condition: (context, attacker) => {
  return context.getCreatures().some(c => 
    c.passiveAbilities?.some(a => a.id === 'leadership')
  );
}

// ✅ GOOD - Cache the check
const hasLeadership = context.cache.hasLeadership ?? 
  context.getCreatures().some(c => 
    c.passiveAbilities?.some(a => a.id === 'leadership')
  );
context.cache.hasLeadership = hasLeadership;

condition: (context, attacker) => context.cache.hasLeadership;
```

**For LOCAL scopes with cascading:**
```typescript
// Prevent infinite loops
condition: (context, data) => {
  // Check processing stack
  if (context.processingStack?.includes('outbreak')) {
    return false; // Already processing, don't cascade
  }
  
  // Normal condition logic...
}
```

---

## 🐛 Common Mistakes

### Mistake 1: Using GLOBAL when you want LOCAL

```typescript
// ❌ BAD - Triggers for EVERY creature's poison
{
  trigger: 'ON_STATUS_APPLIED',
  scope: 'GLOBAL', // Wrong!
  condition: (context, data) => data.status === 'POISON'
}

// ✅ GOOD - Only triggers for creatures with Outbreak
{
  trigger: 'ON_STATUS_APPLIED',
  scope: 'LOCAL', // Correct!
  condition: (context, data) => {
    const creature = context.getCreature(data.creatureId);
    return creature.passiveAbilities?.some(a => a.id === 'outbreak');
  }
}
```

### Mistake 2: Using SELF when you want TEAM

```typescript
// ❌ BAD - Only benefits the leader themselves
{
  id: 'leadership',
  scope: 'SELF', // Wrong!
  effect: { type: 'MODIFY_ATTACK', value: 5 }
}

// ✅ GOOD - Benefits all allies
{
  id: 'leadership',
  scope: 'TEAM', // Correct!
  effect: { type: 'MODIFY_ATTACK', value: 5, target: 'ALL_ALLIES' }
}
```

### Mistake 3: Not handling cascading in LOCAL

```typescript
// ❌ BAD - Infinite loop possible
registerTrigger({
  type: 'ON_STATUS_APPLIED',
  scope: 'LOCAL',
  handler: (context, data) => {
    // Spreads poison, which triggers Outbreak again → infinite loop!
    return [{ type: 'APPLY_STATUS', status: 'POISON', ... }];
  }
});

// ✅ GOOD - Prevents cascading
registerTrigger({
  type: 'ON_STATUS_APPLIED',
  scope: 'LOCAL',
  condition: (context, data) => {
    // Stop if already processing Outbreak
    if (context.processingStack?.includes('outbreak')) return false;
    // ... other conditions
  },
  handler: (context, data) => {
    // Mark as processing
    context.processingStack = [...(context.processingStack ?? []), 'outbreak'];
    // Spread poison
    return [{ type: 'APPLY_STATUS', status: 'POISON', ... }];
  }
});
```

---

## 📝 Testing Your Scope

### Unit Test Template

```typescript
describe('Passive: ${passiveName} (${SCOPE} scope)', () => {
  
  test('should only trigger for correct scope', () => {
    // For SELF: only creature with passive
    // For LOCAL: only when specific condition on that creature
    // For TEAM: all allies benefit
    // For ENEMY_TEAM: all enemies affected
    // For GLOBAL: all creatures involved
  });
  
  test('should not trigger for incorrect scope', () => {
    // Verify scope boundaries
  });
  
  test('should handle cascading (if LOCAL)', () => {
    // Verify cascade works but terminates
  });
});
```

### E2E Test Considerations

- **SELF**: Simple, 3000ms wait sufficient
- **LOCAL**: May cascade, use 5000ms+ wait
- **TEAM**: Multiple creatures update, 4000ms wait
- **ENEMY_TEAM**: Multiple creatures update, 4000ms wait
- **GLOBAL**: All creatures update, 5000ms+ wait

---

## 📚 Summary

| Scope | Evaluates For | Affects | Cascades? | Performance | Use Case |
|-------|---------------|---------|-----------|-------------|----------|
| **SELF** | Creature with passive | Same creature | No | Fast | Self-buffs |
| **LOCAL** | Creature with passive | Conditional targets | Yes | Fast | Spread effects |
| **TEAM** | Any team member | All allies | Rare | Medium | Team buffs |
| **ENEMY_TEAM** | Attacker | All enemies | No | Medium | AoE attacks |
| **GLOBAL** | Any creature | All creatures | Rare | Slow | Battlefield effects |

**Golden Rules:**
1. Start with the narrowest scope that works
2. LOCAL scopes need cascade protection
3. GLOBAL scopes need performance optimization
4. Test with multiple creatures to verify scope boundaries

---

**Author:** Battle Engine Team  
**Status:** ✅ Complete reference guide  
**Related:** `OUTBREAK_TEST_PLAN.md`, `E2E_CASCADING_EFFECTS.md`, `triggerSetup.ts`
