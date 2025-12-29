# 🎮 Practical Implementation Plan
## Making Squad Playable & Fun - Focus on Core Loop

> **Date:** December 29, 2024  
> **Branch:** `checkpoint-phase2-progress` (checkpoint saved)  
> **Status:** 112 tests passing, Phase 2 foundation complete

---

## 🎯 Vision: Minimum Playable Game (MPG)

**Goal:** Create a simple, fun, complete game loop that people can play RIGHT NOW.

**Core Loop:**
1. Player starts battle with 1-3 creatures
2. Take turns attacking enemies
3. Status effects tick and deal damage
4. Battle ends when one side is defeated
5. Show victory/defeat screen
6. Play again or quit

**Timeline:** 2-3 focused sessions (~6-8 hours)

---

## 🚀 Implementation Phases

### **PHASE A: Single Battle Core Loop** ⏰ 2-3 hours
**Goal:** Make ONE battle work perfectly from start to finish

#### A1: Victory/Defeat System (30 min)
- [ ] Detect when all player creatures are dead → show defeat screen
- [ ] Detect when all enemy creatures are dead → show victory screen
- [ ] Add "Play Again" button that resets the battle
- [ ] Add "Quit" button that returns to menu

**Files to modify:**
- `src/utils/effectPipeline/hooks/useBattleEngine.ts` - Add win/loss detection
- `src/utils/effectPipeline/integration/BattleEngineExample.tsx` - Add victory/defeat UI

#### A2: Status Effect Ticking (45 min)
- [ ] Burn deals damage at end of turn (5-10 dmg)
- [ ] Poison deals damage at end of turn (3-8 dmg)
- [ ] Status durations count down each turn
- [ ] Visual feedback when status ticks
- [ ] Remove status when duration reaches 0

**Files to modify:**
- `src/utils/effectPipeline/effects/statusEffects.ts` - Add tick logic
- `src/utils/effectPipeline/hooks/useBattleEngine.ts` - Call tick at turn end

#### A3: Turn System Polish (45 min)
- [ ] Clear "Your Turn" indicator
- [ ] Clear "Enemy Turn" indicator
- [ ] Turn transitions smooth (500ms fade)
- [ ] Computer takes turn automatically after 1 second delay
- [ ] Can't attack during enemy turn (disable buttons)

**Files to modify:**
- `src/utils/effectPipeline/integration/BattleEngineExample.tsx` - UI polish
- `src/utils/effectPipeline/ai/autopilotAI.ts` - Ensure proper delays

#### A4: Attack Confirmation & Feedback (30 min)
- [ ] Attack button shows which creature will attack
- [ ] Target selection clear and obvious
- [ ] Damage numbers appear on hit
- [ ] Health bars update smoothly
- [ ] Status icons appear when applied

**Already mostly done, just polish!**

---

### **PHASE B: Combat Variety & Strategy** ⏰ 2-3 hours
**Goal:** Make battles interesting with different attacks and tactical choices

#### B1: Attack Types (1 hour)
Create 3-4 different attack types per creature:

**Attack Categories:**
1. **Basic Attack** - Reliable damage
   - Example: "Slash" (30-40 dmg)
   
2. **Status Attack** - Lower damage, applies status
   - Example: "Kindle" (15-20 dmg + Burn 2 turns)
   - Example: "Poison Bite" (10-15 dmg + Poison 3 turns)
   
3. **Power Attack** - High damage, maybe self-damage
   - Example: "Reckless Strike" (50-70 dmg, -10 HP to self)
   
4. **Utility** - Buff/debuff/heal
   - Example: "Rally" (Heal 20 HP to self or ally)
   - Example: "Weaken" (Enemy deals -30% damage for 2 turns)

**Implementation:**
- [ ] Create attack data structure in `attackFactories.ts`
- [ ] Add attack selection UI (dropdown or buttons)
- [ ] Implement attack effects
- [ ] Test each attack type

#### B2: Simple AI Improvement (30 min)
- [ ] Enemy uses different attacks (not just basic)
- [ ] Enemy targets lowest HP creature
- [ ] Enemy uses heal when below 30% HP
- [ ] Random attack selection weighted by situation

**Files to modify:**
- `src/utils/effectPipeline/ai/autopilotAI.ts`

#### B3: More Status Effects (30 min)
Add just 2-3 more effects for variety:

- [ ] **Regen** - Heal 5-10 HP per turn (3 turns)
- [ ] **Weaken** - Deal 30% less damage (2 turns)
- [ ] **Stun** - Can't act for 1 turn

**Files to modify:**
- `src/utils/effectPipeline/effects/statusEffects.ts`
- Add visual indicators

#### B4: 3v3 Team Setup (45 min)
- [ ] Player starts with 3 creatures
- [ ] Enemy team has 3 creatures
- [ ] When creature dies, it's removed from battle
- [ ] Can't switch creatures (keep it simple for now)

---

### **PHASE C: Roguelike Progression Framework** ⏰ 2-3 hours
**Goal:** Create the run-based structure with level progression

#### D1: Level Progression System (1 hour)
- [ ] **Level Data Structure**
  - Level number (1, 2, 3...)
  - Enemy team composition (harder enemies in later levels)
  - Difficulty scaling (enemies get +10% HP/damage per level)
  
- [ ] **Win → Next Level Flow**
  - Victory screen shows "Level X Complete!"
  - "Continue" button loads next level
  - Track current level in game state
  - Generate new enemy team for next level
  
- [ ] **Basic Level Selection Screen**
  - Show available levels (1-9 initially)
  - Show which levels you've beaten
  - Click to start a level

**Files to create/modify:**
- `src/utils/levelSystem/levelData.ts` - Level definitions
- `src/utils/levelSystem/levelGenerator.ts` - Generate enemy teams
- `src/components/screens/LevelSelect.tsx` - Level selection UI

#### C2: Three Acts Structure (45 min)
- [ ] **Act 1: Levels 1-3** (Tutorial difficulty)
  - Basic enemies
  - Single element types
  - Lower HP/damage
  
- [ ] **Act 2: Levels 4-6** (Medium difficulty)
  - Mixed enemy teams
  - More status effects
  - Higher HP/damage
  
- [ ] **Act 3: Levels 7-9** (Hard difficulty)
  - Elite enemies with passives
  - Complex team compositions
  - Highest HP/damage

- [ ] **Act Transition Screens**
  - "Act 2: The Depths" with dramatic text
  - Visual theme changes per act

#### C3: Boss Battle (45 min)
- [ ] **Boss Creature Definition**
  - Level 10: Final Boss
  - Unique boss with 2-3x HP
  - Special attacks and passives
  - Multi-phase fight (gets stronger at 50% HP)
  
- [ ] **Boss Battle UI**
  - Boss health bar at top
  - Boss name and title
  - Victory triggers "You Win!" end screen

#### C4: Run State Management (30 min)
- [ ] **Track Run Progress**
  - Current level
  - Player's creatures (persist between battles)
  - Creatures keep HP between battles (no auto-heal)
  - Run ends on defeat
  
- [ ] **Defeat → Run Over**
  - Show "Run Failed - Reached Level X"
  - "Try Again" starts fresh run at Level 1
  - Player creatures reset to full HP

**Implementation Notes:**
```typescript
// Level system structure
interface GameRun {
  currentLevel: number;
  playerTeam: Creature[];
  levelsCompleted: number[];
  runActive: boolean;
}

interface LevelData {
  levelNumber: number;
  act: 1 | 2 | 3;
  enemyTeam: Creature[];
  isBoss: boolean;
}
```

---

### **PHASE D: Polish & Feel** ⏰ 1-2 hours
**Goal:** Make it feel GOOD to play

#### C1: Visual Juice (45 min)
- [ ] Screen shake on hit (subtle)
- [ ] Damage numbers fly up and fade
- [ ] Hit flash (red for damage, green for heal)
- [ ] Status effect particles (🔥 for burn, 🧪 for poison)
- [ ] Victory celebration animation
- [ ] Defeat "sad" animation

**Use CSS animations - keep it simple!**

#### D2: Sound Effects (30 min)
*Optional - can skip if short on time*

- [ ] Hit sound (punch/slash)
- [ ] Status apply sound (woosh)
- [ ] Victory music
- [ ] Defeat music

**Use free assets from freesound.org**

#### D3: UI/UX Polish (30 min)
- [ ] Health bars show current/max (45/100)
- [ ] Status tooltips on hover
- [ ] Attack descriptions on hover
- [ ] Button states (disabled, hover, active)
- [ ] Loading states

---

### **PHASE E: Meta Progression (Later - Post-MVP)** ⏰ 3-4 hours
**Goal:** Add persistent upgrades and microprogression

*This comes AFTER the core roguelike loop is working!*

#### E1: Between-Battle Upgrades (During Run)
- [ ] **Rewards After Each Victory**
  - Choose 1 of 3 random upgrades
  - Examples: "+10 Max HP", "Fire attacks +20% damage", "Start with Regen"
  - Upgrades last for the current run only
  
- [ ] **Healing Options**
  - "Rest" - Heal 50% HP to all creatures
  - "Rare Heal" - Full heal but skip upgrade

#### E2: Persistent Progression (Between Runs)
- [ ] **Unlock System**
  - Earn "Essence" from completed runs
  - Unlock new creatures
  - Unlock new attacks
  
- [ ] **Meta Upgrades**
  - Spend Essence on permanent upgrades
  - "+5% starting HP for all runs"
  - "Start with +10 Essence"
  - Incremental power that makes runs easier over time

#### E3: Daily Challenges & Modifiers
- [ ] Seed-based runs
- [ ] Challenge modifiers (+enemy HP, -healing, etc.)
- [ ] LeadViable Product (MVP) - Playable Roguelike:**
- ✅ Single battle works perfectly (Phase A)
- ✅ Multiple attack types create strategic depth (Phase B)
- ✅ 10 levels across 3 acts (Phase C)
- ✅ Final boss battle (Phase C)
- ✅ Run-based structure (win → progress, lose → restart) (Phase C)
- ✅ Basic polish and feel (Phase D)

**Post-MVP Goals:**
- ⭐ Between-battle upgrades (Phase E)
- ⭐ Persistent meta progression (Phase E)
- ⭐ Multiple playable characters/teams
- ⭐ Daily challenges
- ⭐ Leaderboards

**Timeline:**
- **Phase A + B:** 4-6 hours → Playable single battle
- **Phase C:** 2-3 hours → Full roguelike structure
- **Phase D:** 1-2 hours → Polish
- **Total to MVP:** ~8-11 hours of focused workuild on existing effect pipeline
2. **No refactoring yet** - Just make it work, optimize later
3. **Test as you go** - Play the game after each feature
4. **Commit frequently** - Small, focused commits

### Code Organization
```First Sprint):
- [ ] Complete Phase A (Single Battle Core)
- [ ] Complete Phase B (Combat Variety)
- [ ] Have a fully working tactical battle

### Session 2 Goals (Roguelike Structure):
- [ ] Complete Phase C (Level Progression)
- [ ] 10 levels, 3 acts, boss fight
- [ ] Full run structure working

### Session 3 Goals (Polish & Release):
- [ ] Complete Phase D (Polish)
- [ ] Juice and feel
- [ ] Ready to share as "version 1.0"!

### Future Sessions (Post-Launch):
- [ ] Phase E (Meta Progression)
- [ ] Player feedback integration
- [ ] Content expansion Play the game!
- **Unit tests for new features** - Use existing test patterns
- **Linear progression first** - Levels 1-10, no branching paths
- **No complex systems yet** - Save items, equipment for Phase E
- **No unnecessary choices** - Each creature has 3-4 attacks max
- **Run-based, not grinding** - Complete runs or start over
## 📊 Success Metrics

**Minimum Playable Game achieved when:**
- ✅ Can start a battle
- ✅ Can attack enemies with different attacks
- ✅ Status effects tick and deal damage automatically
- ✅ Battle ends when one side is defeated
- ✅ Victory/defeat screen shows
- ✅ Can play again

**Stretch Goals:**
- ⭐ 3-4 different attacks per creature
- ⭐ 5+ status effects working
- ⭐ Enemy AI uses smart tactics
- ⭐ Visual effects make it feel good
- ⭐ Sound effects add atmosphere

---

## 🎯 Next Steps (Right Now!)

### Immediate Actions:
1. ✅ **Checkpoint saved** - `checkpoint-phase2-progress` branch
2. **Create new branch** - `feature/playable-core-loop`
3. **Start with Phase A** - Fix the core loop
4. **Test after each feature** - `npm start` and play!

### Session 1 Goals (Today):
- [ ] Complete Phase A (Core Loop)
- [ ] Have a battle that goes from start to finish
- [ ] Victory/defeat working

### Session 2 Goals (Next):
- [ ] Complete Phase B (Variety)
- [ ] Multiple attacks per creature
- [ ] Better AI

### Session 3 Goals (Polish):
- [ ] Complete Phase C (Polish)
- [ ] Juice and feel
- [ ] Ready to show friends!

---

## 💭 Design Principles

### Keep It Simple
- **No complex systems yet** - Save items, equipment, progression for later
- **No unnecessary choices** - Each creature has 3-4 attacks max
- **No grinding** - Just pure tactical combat
- **No meta-game** - Focus on single battles first

### Make It Fun
- **Fast paced** - Turns should be quick (1-2 seconds)
- **Clear feedback** - Always know what happened and why
- **Strategic depth** - Different attacks and status effects matter
- **Fair difficulty** - Challenging but winnable

### Build to Expand
- **Modular design** - Effect pipeline supports future features
- **Data-driven** - Easy to add new attacks/creatures/effects
- **Well-tested** - Foundation is solid for expansion
- **Documented** - Future-you will thank present-you

---

## 📝 Development Log

### December 29, 2024 - Checkpoint & Planning
- ✅ Saved checkpoint: `checkpoint-phase2-progress`
- ✅ Created this practical implementation plan
- ✅ All tests passing (112 passing)
- ✅ Ready to build playable core loop

**Current Features Working:**
- ✅ Effect pipeline system
- ✅ Basic attacks with target selection
- ✅ Status effects (Burn, Poison) can be applied
- ✅ Passive abilities (Stone Thorns, Poison Skin, Outbreak)
- ✅ Creature switching
- ✅ Turn transitions
- ✅ Autopilot AI for enemy turns

**What Needs Work:**
- ❌ Status effects don't tick automatically
- ❌ No victory/defeat detection
- ❌ Limited attack variety
- ❌ Enemy AI is basic
- ❌ Missing visual polish

---

## 🤝 Ready to Start?

**Recommended approach:**
1. Read through this plan
2. Create feature branch
3. Start with Phase A1 (Victory/Defeat)
4. Build incrementally
5. Test frequently
6. Commit often
7. Have fun! 🎮

**Remember:** The goal is a **playable game**, not a perfect game. We can polish and expand later!

---

*Let's make this game fun to play! 🚀*
