# New Status Effects - Batch 2 Implementation Plan

## Overview
Building on the successful implementation of FREEZE, SLOW, ATTACK_DEBUFF, CLEANSE, and SILENCE, this document outlines the next batch of strategic status effects.

## Selected Effects (Priority Order)

### 1. REFLECT 🪞
**Gameplay Impact**: High - Creates risk/reward for attacking tanky targets

**Mechanics**:
- Target reflects X% of damage back to attacker
- Duration: 3 turns
- Percentage: 50% reflection
- Works on ALL damage sources (attacks, DoTs, etc.)

**Implementation**:
```typescript
interface ReflectEffectData {
  percentage: number  // 0.5 = 50%
  duration: number
}
```

**Phase 1 (Application)**:
- Store reflection percentage on status
- Set preventsActions: false (creature can still act)

**Phase 2 (Tick/Processing)**:
- Hook into HEALTH_CHANGE trigger for damage dealt to reflected creature
- Calculate reflected damage: `originalDamage * percentage`
- Deal reflected damage back to attacker
- Show visual feedback (💫 or ⚡ animation)

**Edge Cases**:
- Reflected damage should NOT trigger another reflection (no infinite loops)
- Reflected damage counts as "true damage" (ignores defense)
- If attacker dies from reflection, original attack still goes through

---

### 2. VULNERABLE 🎯
**Gameplay Impact**: High - Enables burst damage strategies, focus fire synergy

**Mechanics**:
- Target takes X% increased damage from ALL sources
- Duration: 2-3 turns
- Multiplier: 1.5x (50% more damage)
- Multiplicative with other damage buffs

**Implementation**:
```typescript
interface VulnerableEffectData {
  damageMultiplier: number  // 1.5 = 50% more damage
  duration: number
}
```

**Phase 1 (Application)**:
- Store damage multiplier on status
- Type: 'debuff'
- Timing: 'passive'

**Phase 2 (Tick/Processing)**:
- Modify damage calculation in attack effect
- Check if target has VULNERABLE status
- Multiply final damage: `damage * multiplier`
- Works on: direct attacks, DoTs, reflected damage, AoE

**Visual**:
- Target glows with crosshair/target icon
- Damage numbers appear larger/different color

**Synergies**:
- VULNERABLE + ATTACK_BUFF = massive damage
- VULNERABLE + DoTs = accelerated chip damage
- VULNERABLE + AoE = team wipe potential

---

### 3. LEECH / VAMPIRIC 🩸
**Gameplay Impact**: Medium-High - Sustain mechanic for aggressive playstyles

**Mechanics**:
- Attacker heals for X% of damage dealt
- Duration: 3 turns
- Percentage: 30% lifesteal
- Works on ALL damage (attacks, DoTs if self-inflicted)

**Implementation**:
```typescript
interface LeechEffectData {
  lifestealPercentage: number  // 0.3 = 30%
  duration: number
}
```

**Phase 1 (Application)**:
- Store lifesteal percentage on status
- Type: 'buff'
- Applied to ATTACKER (not target)

**Phase 2 (Tick/Processing)**:
- Hook into damage dealt calculation
- After damage is dealt, heal attacker for percentage
- Cap healing at max HP
- Show green +HP numbers on attacker

**Edge Cases**:
- Overkill damage still counts (if enemy has 10 HP, 50 damage attack still heals for 15)
- Reflected damage does NOT trigger lifesteal (to prevent combos)
- AoE attacks heal for each target hit

---

### 4. EVASION / DODGE ✨
**Gameplay Impact**: High - RNG element, counterplay to damage

**Mechanics**:
- X% chance to completely avoid attacks
- Duration: 3 turns
- Chance: 40-50%
- Only works on direct attacks (not DoTs)

**Implementation**:
```typescript
interface EvasionEffectData {
  dodgeChance: number  // 0.4 = 40%
  duration: number
}
```

**Phase 1 (Application)**:
- Store dodge chance on status
- Type: 'buff'
- Timing: 'passive'

**Phase 2 (Tick/Processing)**:
- Check BEFORE damage calculation in attack effect
- Roll random number: `Math.random()`
- If roll < dodgeChance: attack misses completely
- Return early with "MISS" animation
- No damage, no status application, no on-hit effects

**Visual**:
- "MISS!" text animation
- Target shimmer/blur effect
- Attacker shows confusion icon

**Balance**:
- Does NOT work on: true damage, DoTs, AoE (too powerful)
- CAN be dispelled with CLEANSE
- Multiple evasion buffs do NOT stack (highest wins)

---

### 5. THORNS / SPIKES 🌵
**Gameplay Impact**: Medium - Simpler than REFLECT, good for tanks

**Mechanics**:
- Deal flat damage to attackers
- Duration: 3 turns
- Damage: 10 per hit
- Simpler than REFLECT (flat amount, not percentage)

**Implementation**:
```typescript
interface ThornsEffectData {
  damageAmount: number  // Flat damage returned
  duration: number
}
```

**Phase 1 (Application)**:
- Store damage amount on status
- Type: 'buff'
- Applied to defender

**Phase 2 (Tick/Processing)**:
- Hook into damage received
- After taking damage, deal flat damage back to attacker
- Works on ALL attacks (not DoTs)
- Show small damage number on attacker

**Differences from REFLECT**:
- THORNS: Flat damage (10), simple, consistent
- REFLECT: Percentage-based (50% of damage), scales with incoming damage

**Use Cases**:
- THORNS: Early game, predictable, tanks
- REFLECT: Late game, scales, burst protection

---

## Implementation Priority

### Phase 1: Foundation (Week 1)
1. ✅ Create effect data types
2. ✅ Write applicator functions (5 effects)
3. ✅ Register applicators
4. ✅ Add to combatEffects.ts attack processor
5. ✅ Create factory functions

### Phase 2: Integration (Week 1-2)
1. ✅ Add UI definitions to statuses.ts
2. ✅ Create test attacks in attackFactories.ts
3. ✅ Add execute functions to BattleEngineExample
4. ✅ Update AttackShowcase with new buttons
5. ⚠️ Add trigger hooks for REFLECT/THORNS (damage received)

### Phase 3: Testing (Week 2)
1. ⬜ E2E tests for each effect
2. ⬜ Test edge cases (stacking, interactions)
3. ⬜ Balance testing
4. ⬜ Performance testing

### Phase 4: Polish (Week 2-3)
1. ⬜ Visual effects/animations
2. ⬜ Sound effects
3. ⬜ Tooltips and descriptions
4. ⬜ Documentation

---

## Technical Considerations

### Trigger System Updates Needed

**For REFLECT and THORNS**:
- Need to hook into `HEALTH_CHANGE` for damage received
- Must distinguish between damage sources (attack vs DoT vs reflected)
- Add `sourceType` to HEALTH_CHANGE data:
  ```typescript
  {
    type: 'HEALTH_CHANGE',
    data: {
      sourceType: 'attack' | 'dot' | 'reflected' | 'thorns'
    }
  }
  ```

**For VULNERABLE**:
- Modify damage calculation in attack effect
- Check target statuses before finalizing damage
- Apply multiplier to total damage

**For LEECH**:
- Modify damage dealing code
- After damage applied, check attacker for LEECH status
- Trigger healing effect

**For EVASION**:
- Check BEFORE attack damage calculation
- Early return if attack dodged
- Skip all on-hit effects

### Performance Optimizations
- Cache status lookups (don't search array every time)
- Batch damage calculations for AoE
- Debounce visual updates

### Balance Considerations
- REFLECT + VULNERABLE = attacker takes massive damage (might be too strong)
- EVASION + SHIELD = very tanky (might need cap)
- LEECH + ATTACK_BUFF = high sustain (balance around this)

---

## Testing Strategy

### Unit Tests
```typescript
// Example: REFLECT
test('REFLECT returns 50% damage to attacker', () => {
  // Setup: Apply REFLECT to defender
  // Action: Attacker deals 100 damage
  // Assert: Attacker takes 50 damage
  // Assert: Defender takes 100 damage (original amount)
})

test('REFLECT does not trigger on reflected damage', () => {
  // Setup: Both creatures have REFLECT
  // Action: A attacks B
  // Assert: No infinite loop
  // Assert: Only one reflection occurs
})
```

### Integration Tests
- Each effect with all other effects (combination testing)
- Multiple stacks of same effect
- Effect expiration timing
- Cleanse interaction

### E2E Tests
- User flow: Apply effect → See visual → Effect triggers → Effect expires
- Performance: 100 effects active simultaneously
- UI responsiveness with many effects

---

## UI/UX Design

### Status Badge Updates
```typescript
// New status definitions for consts/statuses.ts
{
  id: 'REFLECT',
  name: 'Reflecting',
  icon: '🪞',
  type: 'buff',
  color: 'text-cyan-400'
},
{
  id: 'VULNERABLE',
  name: 'Vulnerable',
  icon: '🎯',
  type: 'debuff',
  color: 'text-red-400'
},
{
  id: 'LEECH',
  name: 'Vampiric',
  icon: '🩸',
  type: 'buff',
  color: 'text-rose-400'
},
{
  id: 'EVASION',
  name: 'Evasive',
  icon: '✨',
  type: 'buff',
  color: 'text-yellow-300'
},
{
  id: 'THORNS',
  name: 'Thorns',
  icon: '🌵',
  type: 'buff',
  color: 'text-green-400'
}
```

### Attack Showcase Organization
**Implemented ✅**:
- Burn, Poison, Bleed
- Stun, Freeze, Slow, Silence, Weaken
- Shield, Regeneration, Cleanse
- All buff/debuff attacks

**In Progress ⚠️**:
- REFLECT, VULNERABLE, LEECH, EVASION, THORNS (need implementation)

**Planned 📋**:
- HASTE, MOMENTUM, PIERCING
- BERSERK, CURSE/DOOM
- CHARM/CONFUSION (if we add it)

---

## File Changes Required

### New/Modified Files

1. **src/utils/effectPipeline/effects/statusEffects.ts**
   - Add 5 new effect data types
   - Add 5 new applicator functions
   - Register 5 new applicators

2. **src/utils/effectPipeline/effects/combatEffects.ts**
   - Add REFLECT, VULNERABLE, LEECH, EVASION, THORNS to attack processor
   - Add damage modification logic for VULNERABLE
   - Add lifesteal logic for LEECH

3. **src/utils/effectPipeline/battleContext.ts**
   - Add new status definitions if needed
   - Update HEALTH_CHANGE to include sourceType

4. **src/consts/statuses.ts**
   - Add UI definitions for 5 new effects

5. **src/utils/effectPipeline/effects/attackFactories.ts**
   - Add createReflectAttack
   - Add createVulnerableAttack
   - Add createLeechAttack
   - Add createEvasionAttack
   - Add createThornsAttack

6. **src/utils/effectPipeline/integration/BattleEngineExample.tsx**
   - Add execute functions for 5 new attacks
   - Wire up switch cases

7. **src/components/battle/AttackShowcase.tsx**
   - Reorganize into sections: Implemented, In Progress, Planned
   - Add 5 new attack buttons in "In Progress" section

8. **tests/e2e/new-status-effects-batch-2.spec.ts** (NEW)
   - E2E tests for all 5 effects
   - Edge case testing
   - Interaction testing

9. **docs/NEW_EFFECTS_BATCH_2_USAGE.md** (NEW)
   - Usage examples
   - Code samples
   - Strategy guide

---

## Success Criteria

### Batch 2 Complete When:
- ✅ All 5 effects have working applicators
- ✅ All 5 effects have test attacks
- ✅ All 5 effects display in UI
- ✅ All 5 effects have E2E tests passing
- ✅ No performance degradation
- ✅ No breaking changes to existing effects
- ✅ Documentation complete

### Minimum Viable Implementation:
- Basic functionality working
- At least 80% test coverage
- No critical bugs
- Acceptable performance (<100ms per effect trigger)

---

## Risk Mitigation

### Potential Issues:
1. **Infinite loops** (REFLECT + REFLECT)
   - Solution: Add `sourceType` flag, prevent reflection of reflected damage

2. **Performance** (EVASION on every attack)
   - Solution: Early return, cache status checks

3. **Balance** (VULNERABLE + ATTACK_BUFF = too strong)
   - Solution: Playtesting, adjust multipliers

4. **Complexity** (Too many effects to track)
   - Solution: Better UI, effect grouping, visual clarity

### Rollback Plan:
- Each effect isolated, can disable individually
- Feature flags for each effect
- Tests prevent regressions

---

## Timeline

**Week 1** (Implementation):
- Days 1-2: REFLECT + THORNS (damage received hooks)
- Days 3-4: VULNERABLE (damage modifier)
- Day 5: LEECH (healing on hit)
- Days 6-7: EVASION (miss chance)

**Week 2** (Testing & Polish):
- Days 1-3: E2E tests, edge cases
- Days 4-5: Balance testing, adjustments
- Days 6-7: Visual polish, documentation

**Total**: ~2 weeks for full implementation

---

## Notes

- These effects add significant strategic depth without requiring new UI elements
- All effects reuse existing trigger system with minor extensions
- Code follows same pattern as Batch 1 (FREEZE, SLOW, etc.)
- Can implement incrementally - each effect independent

