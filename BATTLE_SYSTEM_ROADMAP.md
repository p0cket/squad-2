# Battle System Roadmap
## Playground → Production: Phased Development Plan

> **Philosophy**: Each phase ends with a **playable build** that can be tested and enjoyed. We build incrementally, testing as we go, and always have something that works.

---

## 🎯 Current Status: Phase 1 Complete
- ✅ Effect Pipeline System working
- ✅ Zustand state management integrated
- ✅ Basic attacks with target selection
- ✅ Status effects (Burn, Poison) functional
- ✅ Passive abilities (Stone Thorns, Poison Skin, Outbreak)
- ✅ Dark theme UI with navigation

---

## 📋 PHASE 1: Foundation & Core Systems
**Goal**: Get the basic battle engine working with essential mechanics
**Status**: ✅ COMPLETE

### Milestones:
- [x] Effect pipeline architecture
- [x] Zustand adapter for state management
- [x] Basic attack system with target selection
- [x] Status effects (Burn, Poison)
- [x] Passive abilities (counter-attack, on-damaged)
- [x] Animation system integration
- [x] UI with dark theme navigation

### Playable Build 1.0:
- **What you can do:**
  - Attack enemies with target selection
  - Apply burn/poison/kindle
  - Test passive abilities (Stone Thorns, Poison Skin, Outbreak)
  - See animations and damage numbers
  - Reset and replay battles

### Known Gaps:
- [ ] Status effects don't tick on turn end (burn/poison should damage each turn)
- [ ] No turn-based system yet
- [ ] No attack variety (all attacks are basic damage)
- [ ] No victory/defeat conditions
- [ ] Outbreak should only trigger on Plague Rat

---

## 📋 PHASE 2: Status Effects & Turn System
**Goal**: Make status effects work properly with a turn-based system
**Status**: 🔄 IN PROGRESS

### Current Tasks:
- [x] Fix Outbreak to be LOCAL scope (only Plague Rat)
- [x] Create Kindle action (manual burn spread)
- [ ] Implement turn-end status tick system
- [ ] Add turn counter and turn progression
- [ ] Status duration countdown
- [ ] Visual indicators for status effects

### Next Milestones:
- [ ] Turn-based combat loop
  - [ ] Player turn → Enemy turn → Repeat
  - [ ] Status effects tick at turn end
  - [ ] Status durations count down
  - [ ] Turn counter display in UI

- [ ] Status Effect Improvements
  - [ ] Burn: 5-10 dmg per turn, 3 turns
  - [ ] Poison: 3-8 dmg per turn, 4 turns
  - [ ] Regeneration: +5-10 HP per turn, 3 turns
  - [ ] Status effect stacking rules (stack duration vs damage)

- [ ] Victory/Defeat System
  - [ ] Detect when all player creatures dead
  - [ ] Detect when all enemy creatures dead
  - [ ] Victory/defeat screen
  - [ ] Restart battle option

### Playable Build 2.0:
- **What you can do:**
  - Everything from Build 1.0, plus:
  - Take turns (player → enemy → player)
  - Watch status effects tick each turn
  - See burn/poison damage over time
  - Status effects expire after duration
  - Win/lose conditions work
  - Track turn count

---

## 📋 PHASE 3: Attack Variety & Effects
**Goal**: Rich attack system with interesting effects
**Status**: ⏳ NOT STARTED

### Milestones:
- [ ] Attack Types System
  - [ ] Physical attacks (use ATK vs DEF)
  - [ ] Magical attacks (ignore defense?)
  - [ ] True damage attacks (ignore everything)
  - [ ] Hybrid attacks (physical + magical)

- [ ] Multi-Target Attacks
  - [ ] AoE attacks (hit all enemies)
  - [ ] Cleave attacks (hit 2-3 targets)
  - [ ] Random target attacks (bouncing)
  - [ ] Self-damage attacks (recoil)

- [ ] Status-Inflicting Attacks
  - [ ] Fire Breath → 100% burn
  - [ ] Poison Bite → 60% poison
  - [ ] Frost Bolt → 40% slow/freeze
  - [ ] Thunder Strike → 30% stun

- [ ] Combo Attacks
  - [ ] Attacks that trigger on status presence
  - [ ] Bonus damage to burned enemies
  - [ ] Bonus damage to poisoned enemies
  - [ ] Chain effects (burn → explosion)

### Playable Build 3.0:
- **What you can do:**
  - Everything from Build 2.0, plus:
  - Use different attack types
  - Hit multiple targets
  - Apply status effects reliably
  - Build attack combos
  - Strategic target selection matters

---

## 📋 PHASE 4: Passive Abilities & Triggers
**Goal**: Rich passive ability system with trigger patterns
**Status**: ⏳ NOT STARTED

### Milestones:
- [ ] Trigger Scope System
  - [ ] LOCAL: Only affects creature with passive
  - [ ] TEAM: Affects all allies
  - [ ] GLOBAL: Affects all creatures
  - [ ] ENEMY_TEAM: Affects all enemies

- [ ] On-Damaged Triggers
  - [x] Stone Thorns (reflect damage)
  - [x] Poison Skin (apply poison)
  - [ ] Retaliation (counter-attack)
  - [ ] Berserker (gain ATK when damaged)
  - [ ] Last Stand (power up at low HP)

- [ ] On-Attack Triggers
  - [ ] Lifesteal (heal on hit)
  - [ ] Vampiric (drain HP)
  - [ ] Execute (bonus damage to low HP)
  - [ ] Rampage (attack again on kill)

- [ ] On-Status Triggers
  - [x] Outbreak (spread burn - LOCAL)
  - [ ] Contagion (spread poison - LOCAL)
  - [ ] Immunity (remove status on self)
  - [ ] Cleanse (remove status from ally)

- [ ] Aura Passives (TEAM scope)
  - [ ] Battle Cry (+10% ATK to allies)
  - [ ] Guardian (+5 DEF to allies)
  - [ ] Regeneration Aura (+5 HP/turn to allies)
  - [ ] Weakness Aura (-10% ATK to enemies)

### Playable Build 4.0:
- **What you can do:**
  - Everything from Build 3.0, plus:
  - Build teams with passive synergies
  - Trigger chains of abilities
  - Auras affecting entire teams
  - Strategic positioning matters
  - Counter-play with immunity/cleanse

---

## 📋 PHASE 5: Items, Runes & Equipment
**Goal**: Items modify creatures and attacks
**Status**: ⏳ NOT STARTED

### Milestones:
- [ ] Item System Foundation
  - [ ] Equip items on creatures
  - [ ] Items grant passive abilities
  - [ ] Items modify stats (ATK/DEF/HP)
  - [ ] Item rarity system

- [ ] Rune System
  - [ ] Runes modify attacks
  - [ ] Fire Rune: +burn chance
  - [ ] Poison Rune: +poison chance
  - [ ] Crit Rune: +crit chance/damage
  - [ ] Combo system (rune sets)

- [ ] Equipment Slots
  - [ ] Weapon (attack modification)
  - [ ] Armor (defense/HP)
  - [ ] Accessory (passive abilities)
  - [ ] Unique items with special effects

### Playable Build 5.0:
- **What you can do:**
  - Everything from Build 4.0, plus:
  - Equip items on creatures
  - Customize attack runes
  - Build item synergies
  - Collect rare items
  - Experiment with equipment loadouts

---

## 📋 PHASE 6: Enemy AI & PvE Content
**Goal**: Smart enemies and battle scenarios
**Status**: ⏳ NOT STARTED

### Milestones:
- [ ] Enemy AI System
  - [ ] Basic AI (random attacks)
  - [ ] Smart AI (target weakest/strongest)
  - [ ] Healer AI (heal allies when low)
  - [ ] Status AI (prioritize status removal)

- [ ] Enemy Types
  - [ ] Tanks (high HP/DEF, low ATK)
  - [ ] Damage Dealers (high ATK, low DEF)
  - [ ] Supports (healers, buffers)
  - [ ] Hybrids (balanced stats)

- [ ] Battle Scenarios
  - [ ] Boss battles (1v1 powerful enemy)
  - [ ] Horde battles (3v6+ weak enemies)
  - [ ] Gauntlet (sequential battles)
  - [ ] Survival (endless waves)

### Playable Build 6.0:
- **What you can do:**
  - Everything from Build 5.0, plus:
  - Fight smart AI enemies
  - Different battle types
  - Boss encounters
  - Progression system
  - Unlockable creatures/items

---

## 📋 PHASE 7: Balance & Polish
**Goal**: Make it feel great to play
**Status**: ⏳ NOT STARTED

### Milestones:
- [ ] Balance Pass
  - [ ] Normalize damage ranges
  - [ ] Status effect values
  - [ ] Passive ability power levels
  - [ ] Item power curve

- [ ] UI/UX Polish
  - [ ] Better animations
  - [ ] Sound effects
  - [ ] Visual feedback improvements
  - [ ] Tooltips and help system
  - [ ] Battle log/history

- [ ] Quality of Life
  - [ ] Save/load system
  - [ ] Battle speed controls
  - [ ] Auto-battle option
  - [ ] Undo/redo for testing
  - [ ] Battle replay

### Playable Build 7.0:
- **What you can do:**
  - Everything from Build 6.0, plus:
  - Smooth, polished experience
  - Satisfying feedback on every action
  - Clear information displays
  - Easy to learn, hard to master

---

## 📋 PHASE 8: Advanced Features
**Goal**: Deep strategic systems
**Status**: ⏳ NOT STARTED

### Potential Features:
- [ ] Weather/Terrain Effects
  - [ ] Rain (boost water, weaken fire)
  - [ ] Sandstorm (reduce accuracy)
  - [ ] Fog (hide information)

- [ ] Positioning System
  - [ ] Front/back row mechanics
  - [ ] Melee vs ranged attacks
  - [ ] Area control abilities

- [ ] Resource Systems
  - [ ] Mana/Energy for abilities
  - [ ] Cooldowns on powerful attacks
  - [ ] Ultimate abilities (charge up)

- [ ] Team Building
  - [ ] Creature recruitment
  - [ ] Team composition rules
  - [ ] Synergy bonuses
  - [ ] Role requirements

---

## 🎮 Testing Checklist (Per Phase)

### Before Moving to Next Phase:
- [ ] All features work as intended
- [ ] No critical bugs
- [ ] Playable and fun at current scope
- [ ] Performance is acceptable
- [ ] Code is documented
- [ ] Tests written for core features

### Quality Gates:
- **Functionality**: Does it work?
- **Fun Factor**: Is it enjoyable?
- **Performance**: Is it smooth?
- **Clarity**: Is it understandable?
- **Stability**: Does it crash?

---

## 📝 Development Workflow

### For Each Feature:
1. **Design**: Write down what it should do
2. **Implement**: Code the feature
3. **Test**: Try to break it
4. **Polish**: Make it feel good
5. **Document**: Update this roadmap
6. **Commit**: Save your work

### Testing Protocol:
1. Test the feature in isolation
2. Test with other features
3. Test edge cases
4. Test with different team compositions
5. Get feedback from others

---

## 🚀 Quick Start: What to Work On Next

### Immediate Next Steps (Phase 2):
1. **Implement turn-end status tick**
   - Create `processEndOfTurn()` function
   - Trigger STATUS_TICK for each creature
   - Apply damage and count down durations

2. **Add turn counter UI**
   - Display current turn number
   - "End Turn" button
   - Turn indicator (Player/Enemy)

3. **Fix status duration countdown**
   - Duration decreases each turn
   - Status removed when duration = 0
   - Visual countdown in UI

4. **Test Outbreak with fixed scope**
   - Burn Plague Rat → should spread
   - Burn others → should not spread
   - Verify 25% chance works correctly

### Medium Term (Phase 2-3):
- Victory/defeat detection
- More attack variety
- Status effect balance
- AI for enemy turns

### Long Term (Phase 4+):
- Advanced passive abilities
- Item/rune system
- Enemy AI variations
- Battle scenarios

---

## 💡 Design Principles

### Keep It Simple:
- Start with the simplest version
- Add complexity gradually
- Test at each step

### Make It Fun:
- Every action should feel impactful
- Clear visual/audio feedback
- Satisfying animations

### Stay Flexible:
- Don't over-engineer
- Be ready to change course
- Learn from testing

### Document Everything:
- Update this roadmap regularly
- Keep notes on decisions
- Track what works and what doesn't

---

## 📊 Progress Tracking

### Phase 1: ████████████████████ 100% COMPLETE
### Phase 2: ████░░░░░░░░░░░░░░░░  20% IN PROGRESS
### Phase 3: ░░░░░░░░░░░░░░░░░░░░   0% NOT STARTED
### Phase 4: ░░░░░░░░░░░░░░░░░░░░   0% NOT STARTED
### Phase 5: ░░░░░░░░░░░░░░░░░░░░   0% NOT STARTED
### Phase 6: ░░░░░░░░░░░░░░░░░░░░   0% NOT STARTED
### Phase 7: ░░░░░░░░░░░░░░░░░░░░   0% NOT STARTED
### Phase 8: ░░░░░░░░░░░░░░░░░░░░   0% NOT STARTED

**Overall Progress**: 12.5% of all planned phases

---

## 🎯 Success Metrics

### Phase 2 Success = When:
- Status effects tick every turn
- Burn/poison/regen work correctly
- Turn counter advances properly
- Outbreak only triggers on Plague Rat
- Can win/lose battles
- Want to play again!

### Phase 3 Success = When:
- 10+ different attacks available
- Each attack feels unique
- Strategic choices matter
- Attack combos are possible

### Phase 4 Success = When:
- 20+ passive abilities
- Trigger patterns work reliably
- Team synergies exist
- Build variety is high

---

## 📚 Resources & References

### Key Files:
- `effectPipelineEngine.ts` - Main orchestrator
- `triggerSetup.ts` - Trigger registration
- `statusEffects.ts` - Status effect definitions
- `useBattleEngine.ts` - React integration
- `BattleEngineExample.tsx` - Test playground

### Documentation:
- `HYBRID_EFFECT_SYSTEM_REVIEW.md` - Architecture overview
- `HYBRID_EFFECT_SYSTEM_ATTACK_FLOW.md` - Detailed flow guide
- `ZUSTAND_ATTACK_FLOW.md` - Zustand integration

### Testing Ground:
- BattleEngineExample component
- 5 creatures with different abilities
- All test actions available

---

## 🔄 Update Log

### 2025-10-17:
- Created initial roadmap
- Defined 8 phases with milestones
- Established playable builds per phase
- Set Phase 2 as current focus
- Added testing checklist
- Documented design principles

---

**Remember**: This is a living document. Update it as you learn what works and what doesn't. Each phase should end with something playable and fun! 🎮
