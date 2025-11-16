# Passive Abilities & Attack System - Todo List

## 🎯 HIGHEST PRIORITY: Attack System Foundation

### 1. Target Selection System ⚡ **START HERE**
- [ ] Implement target selection UI when creature clicks "Attack"
  - [ ] Show selectable targets based on attack's target type
  - [ ] Highlight valid targets
  - [ ] Handle single target selection
  - [ ] Handle multi-target selection (AoE attacks)
  - [ ] Add confirmation/cancel for target selection
  - [ ] Visual feedback for selected targets

### 2. Attack Flexibility & Effects System 🎲
- [ ] **Status Effect Application**
  - [ ] Add `appliesStatus` property to attack definitions
  - [ ] Support status application to target (poison, burn, freeze, etc.)
  - [ ] Support status application to self (berserk, focus, charge)
  - [ ] Support status application to allies
  - [ ] Handle status duration and stacking rules

- [ ] **Multi-Target Attacks**
  - [ ] Define target types: `single`, `all_enemies`, `all_allies`, `random_enemy`, `aoe_radius`
  - [ ] Implement AoE damage calculations
  - [ ] Add damage falloff for AoE (optional)
  - [ ] Support hybrid attacks (damage + effect to multiple targets)

- [ ] **Poison & DoT Effects**
  - [ ] Create poison status effect
  - [ ] Implement poison tick system (damage over time)
  - [ ] Add burn status effect
  - [ ] Add bleed status effect
  - [ ] Create generic DoT framework

- [ ] **Buff/Debuff Attacks**
  - [ ] Attacks that buff self (increase attack, defense, speed)
  - [ ] Attacks that debuff enemies (reduce stats)
  - [ ] Attacks that buff allies
  - [ ] Support multiple effects per attack

- [ ] **Passive-Creating Attacks** 🔮
  - [ ] Attacks that grant temporary passive abilities
  - [ ] Example: "Grant ally 'Reflect Damage' for 2 turns"
  - [ ] Example: "Gain 'Lifesteal' for 3 turns"
  - [ ] Define temporary passive structure and expiration

### 3. Attack Definition Schema Enhancement
```typescript
interface EnhancedAttack {
  id: string;
  name: string;
  damage: number;
  targetType: 'single' | 'all_enemies' | 'all_allies' | 'random' | 'aoe' | 'self';
  targetCount?: number; // For multi-target selection
  
  // New properties
  appliesStatus?: {
    statusId: string;
    target: 'target' | 'self' | 'all_enemies' | 'all_allies';
    duration?: number;
    chance?: number; // % chance to apply
  }[];
  
  grantsPassive?: {
    passiveId: string;
    target: 'target' | 'self' | 'all_enemies' | 'all_allies';
    duration: number; // Turns
  }[];
  
  effects?: {
    type: 'damage' | 'heal' | 'buff' | 'debuff';
    value: number;
    stat?: 'attack' | 'defense' | 'speed';
    target: 'target' | 'self' | 'all_enemies' | 'all_allies';
  }[];
}
```
- [ ] Implement this schema in attack definitions
- [ ] Update attack execution logic to handle new properties

---

## 🔥 HIGH PRIORITY: Passive Abilities Core

### 4. Test Current Passive Implementation
- [ ] Test on_damage_taken passive in demo
- [ ] Test on_attack_received passive
- [ ] Verify trigger conditions work correctly
- [ ] Test damage calculations
- [ ] Test targeting logic
- [ ] Document any bugs or edge cases

### 5. Expand Passive Trigger Types
- [ ] **on_attack** - When this creature attacks
  - [ ] Implement trigger logic
  - [ ] Add example: "Deal bonus damage on attack"
  
- [ ] **on_death** - When this creature dies
  - [ ] Implement trigger logic
  - [ ] Add example: "Explode for AoE damage on death"
  
- [ ] **on_heal** - When this creature is healed
  - [ ] Implement trigger logic
  - [ ] Add example: "Gain shield when healed"
  
- [ ] **start_of_turn** - Beginning of creature's turn
  - [ ] Implement trigger logic
  - [ ] Add example: "Regenerate HP each turn"
  
- [ ] **end_of_turn** - End of creature's turn
  - [ ] Implement trigger logic
  - [ ] Add example: "Lose HP each turn (curse effect)"
  
- [ ] **on_kill** - When this creature kills an enemy
  - [ ] Implement trigger logic
  - [ ] Add example: "Heal when killing enemy"
  
- [ ] **on_ally_death** - When an ally dies
  - [ ] Implement trigger logic
  - [ ] Add example: "Gain enrage when ally dies"

### 6. Create More Creatures with Passives
- [ ] **Phoenix** - Reincarnate on death (revive with 50% HP)
- [ ] **Vampire** - Lifesteal on attack (heal for % of damage dealt)
- [ ] **Paladin** - Heal allies at start of turn
- [ ] **Berserker** - Gain attack when damaged below 50% HP
- [ ] **Poison Spider** - Apply poison on attack
- [ ] **Ice Elemental** - Chance to freeze on attack
- [ ] **Necromancer** - Summon skeleton on enemy death
- [ ] **Tank Guardian** - Redirect damage from allies to self

---

## 🎨 MEDIUM PRIORITY: Advanced Features

### 7. Passive Ability Stacking
- [ ] Allow multiple passives on one creature
- [ ] Define stacking rules (do they stack additively? multiply? unique only?)
- [ ] Handle passive priority/execution order
- [ ] Test interactions between multiple passives

### 8. Conditional Triggers
- [ ] **Damage Threshold** - "Only trigger if damage > X"
- [ ] **HP Threshold** - "Only trigger when HP < X%"
- [ ] **Turn Count** - "Only trigger every N turns"
- [ ] **Chance-Based** - "X% chance to trigger"
- [ ] **Enemy Type** - "Only trigger against specific creature types"
- [ ] **Status-Based** - "Only trigger while poisoned/buffed/etc."

### 9. Advanced Target Types
- [ ] `all_enemies` - Hit all enemy creatures
- [ ] `all_allies` - Affect all friendly creatures
- [ ] `random_enemy` - Select random enemy
- [ ] `random_ally` - Select random ally
- [ ] `lowest_hp_enemy` - Target weakest enemy
- [ ] `highest_hp_enemy` - Target tankiest enemy
- [ ] `self_and_adjacent` - AoE around caster

---

## 🔗 MEDIUM PRIORITY: Integration & UI

### 10. Integrate into Main Battle System
- [ ] Move passive system from demo to core battle engine
- [ ] Hook into actual attack flow
- [ ] Connect with existing damage calculation
- [ ] Ensure compatibility with current battle state management
- [ ] Test in real battle scenarios

### 11. Visual Effects & Animations
- [ ] Create animation for passive trigger
- [ ] Visual indicator when passive activates
- [ ] Particle effects for different passive types
- [ ] Sound effects for passive triggers
- [ ] Screen shake/impact for major passives

### 12. Battle UI Enhancements
- [ ] Display passive abilities on creature cards
- [ ] Show passive icons/badges
- [ ] Tooltips explaining passive effects
- [ ] Combat log entries for passive activations
- [ ] Visual indicators for active/inactive passives

---

## 🧪 LOWER PRIORITY: Testing & Polish

### 13. Comprehensive Testing
- [ ] Unit tests for trigger system
- [ ] Unit tests for each passive type
- [ ] Integration tests for passive + attack interactions
- [ ] Test edge cases (creature dies during passive trigger, etc.)
- [ ] Performance testing with many passives

### 14. Documentation & Tooltips
- [ ] In-game tooltips for passive abilities
- [ ] Help text during battle
- [ ] Passive ability glossary
- [ ] Tutorial for passive system
- [ ] Developer documentation

### 15. Balance & Tuning
- [ ] Tune damage values for passive effects
- [ ] Adjust trigger chances
- [ ] Balance passive strength vs. base stats
- [ ] Test PvP balance
- [ ] Gather playtesting feedback

---

## 📊 Progress Tracking

**Phase 1: Attack System Foundation (Priority 1-3)**
- Status: Not Started
- Estimated Time: 1-2 weeks
- Blockers: None

**Phase 2: Passive Abilities Core (Priority 4-6)**
- Status: Partially Complete (on_damage_taken implemented)
- Estimated Time: 1 week
- Blockers: None

**Phase 3: Advanced Features (Priority 7-9)**
- Status: Not Started
- Estimated Time: 1-2 weeks
- Blockers: Need Phase 1 & 2 complete

**Phase 4: Integration & Polish (Priority 10-15)**
- Status: Not Started
- Estimated Time: 1-2 weeks
- Blockers: Need all previous phases

---

## 🎯 Recommended Next Steps

1. **START HERE:** Implement target selection UI (Priority #1)
2. **THEN:** Add status effect application to attacks (Priority #2)
3. **THEN:** Create enhanced attack schema and test multi-target attacks
4. **THEN:** Test current passive implementation thoroughly
5. **THEN:** Expand passive trigger types (on_attack, on_death, etc.)

This order ensures:
- Players can use the system immediately (target selection)
- Attacks become more interesting (status effects, multi-target)
- Passives have solid foundation before expansion
- Testing happens at each step to catch issues early
