# 🎮 Game Improvements Checklist

> **Priority Guide**: 🔥 Critical | ⭐ High Impact | 💡 Nice to Have | 🎨 Polish

---

## 🎯 Core Gameplay Improvements

### Turn System & Combat Flow
- [ ] 🔥 **Fix status effects not ticking at turn end**
  - Burn/poison should damage each turn automatically
  - Status durations should count down
  - Add visual feedback for status ticks
  
- [ ] 🔥 **Enemy AI takes turns automatically**
  - Computer creatures attack on their turn
  - Use autopilot AI for enemy turn logic
  - Add turn delay/animation for readability

- [ ] ⭐ **Turn counter and phase indicators**
  - Visual turn number (already in header)
  - Clear "Your Turn" / "Enemy Turn" transitions
  - Turn history/timeline improvements

- [ ] ⭐ **Action economy system**
  - One action per creature per turn
  - Can't attack multiple times
  - Clear "action used" indicator

### Victory & Progression
- [ ] 🔥 **Victory/Defeat conditions work properly**
  - Battle ends when all player creatures dead
  - Battle ends when all enemy creatures dead
  - Victory screen shows rewards
  - Defeat screen offers retry

- [ ] ⭐ **Rewards system**
  - Gold/XP after winning battles
  - Random item drops
  - Unlock new creatures
  - Progression tracking

- [ ] 💡 **Multiple battle levels/encounters**
  - Level 1, 2, 3... with increasing difficulty
  - Boss battles with unique mechanics
  - Campaign/story mode structure

---

## ⚔️ Combat & Attacks

### Attack Variety
- [ ] ⭐ **More attack types beyond basic damage**
  - Multi-target AoE attacks (hit all enemies)
  - Healing abilities
  - Buff/debuff focused attacks
  - Self-damage/recoil attacks (high risk/reward)

- [ ] ⭐ **Attack animations & feedback**
  - Damage numbers fly up from targets
  - Screen shake on heavy hits
  - Color flash on hit (red for damage, green for heal)
  - Sound effects for different attack types

- [ ] 💡 **Attack cooldowns**
  - Powerful attacks need 2-3 turns to recharge
  - Visual cooldown counter (⏰ 2 turns)
  - Strategic decision making

- [ ] 💡 **Combo system**
  - Bonus damage when using same element twice
  - Chain attacks (fire → explosion)
  - Visual combo counter

### Status Effects
- [ ] ⭐ **More status effect types**
  - ✅ Burn (implemented)
  - ✅ Poison (implemented)
  - [ ] Stun (can't act for X turns)
  - [ ] Freeze (slower + vulnerable)
  - [ ] Slow (-50% speed)
  - [ ] Silence (can't use abilities)
  - [ ] Weaken (-ATK)
  - [ ] Vulnerable (+damage taken)
  - [ ] Shield (absorb damage)
  - [ ] Regen (heal over time)

- [ ] ⭐ **Status effect stacking rules**
  - Can have multiple different statuses
  - Same status = refresh duration OR stack damage
  - Clear visual for stacked effects

- [ ] 💡 **Status immunity/resistance**
  - Fire creatures immune to burn
  - Ice creatures resist freeze
  - Cleanse abilities remove debuffs

---

## 🦎 Creatures & Team Building

### Creature Roster
- [ ] ⭐ **More creatures with unique abilities**
  - Currently: Dragon, Phoenix, Tortoise, Goblin, Snake, Rat
  - Add 10+ more creatures
  - Each with unique passive + attack set

- [ ] ⭐ **Creature types/elements**
  - Fire 🔥, Water 💧, Earth 🌍, Lightning ⚡, etc.
  - Type advantages/weaknesses (Pokémon-style)
  - Visual indicators for types

- [ ] 💡 **Creature leveling system**
  - Gain XP from battles
  - Level up increases stats
  - Learn new attacks at certain levels
  - Evolution at high levels

### Team Management
- [ ] ⭐ **Switching creatures mid-battle**
  - Already has animation system in place
  - Allow tactical switches
  - Costs your turn to switch

- [ ] 💡 **Pre-battle team selection**
  - Choose 3 creatures from roster
  - See enemy preview (?)
  - Strategic team composition

- [ ] 💡 **Passive ability synergies**
  - Team auras (affect all allies)
  - Combo passives (trigger together)
  - Build themed teams (all fire, all tanks, etc.)

---

## 🎨 UI/UX Polish

### Visual Improvements
- [ ] ⭐ **Better HP bar styling**
  - Color gradient based on % (green → yellow → red)
  - Smooth animation when taking damage
  - Show damage/heal as separate bar segment first

- [ ] ⭐ **Status effect icons on creatures**
  - Already showing in bench boxes ✅
  - Make icons bigger/more visible
  - Tooltip on hover with details

- [ ] 💡 **Attack preview before confirming**
  - Show expected damage range
  - Show hit chance %
  - Show status effect chances

- [ ] 🎨 **Particle effects**
  - Fire particles for burn
  - Poison bubbles
  - Healing sparkles
  - Critical hit stars

### Menu & Navigation
- [ ] ⭐ **Keyboard shortcuts**
  - 1-4 for attacks
  - Space to confirm
  - ESC to cancel
  - Tab to cycle targets

- [ ] 💡 **Battle speed controls**
  - Already has autopilot speed ✅
  - Add manual speed slider
  - Skip animations toggle

- [ ] 🎨 **Sound effects & music**
  - Background battle music
  - Attack SFX
  - Victory fanfare
  - Menu sounds

### Information Display
- [ ] ⭐ **Damage type indicators**
  - Physical (⚔️), Magical (✨), True (💀)
  - Color-coded damage numbers

- [ ] 💡 **Attack tooltips with full details**
  - Damage formula
  - Status effect %
  - Cooldown info
  - Target type (single, AoE, self)

- [ ] 💡 **Battle log improvements**
  - Currently uses BattleTimeline ✅
  - Add filter by event type
  - Export battle log
  - Replay feature

---

## 🧪 Systems & Features

### Items & Equipment
- [ ] ⭐ **Usable items in battle**
  - Potion (heal 50 HP)
  - Revive (bring back KO'd creature)
  - Status cure (remove debuff)
  - Buff items (temp +ATK)

- [ ] 💡 **Equipment system**
  - Weapon slot (+ATK or modify attacks)
  - Armor slot (+DEF or +HP)
  - Accessory (+passive ability)

- [ ] 💡 **Consumable vs permanent items**
  - Potions consumed on use
  - Equipment persists across battles
  - Inventory management

### AI & Difficulty
- [ ] ⭐ **Enemy AI improvements**
  - Already has autopilot AI ✅
  - Smart target selection (low HP priority)
  - Type advantage awareness
  - Status effect strategy

- [ ] 💡 **Difficulty levels**
  - Easy: Enemy stats -20%
  - Normal: Default
  - Hard: Enemy stats +30%
  - Expert: +50% + better AI

- [ ] 💡 **Boss AI patterns**
  - Special attack sequences
  - Phase changes at HP thresholds
  - Summon adds

### Progression & Meta
- [ ] ⭐ **Save/Load system**
  - Save roster, inventory, progress
  - LocalStorage for browser
  - Multiple save slots

- [ ] 💡 **Achievement system**
  - Win 10 battles
  - Defeat boss without losing creature
  - Use 100 fire attacks
  - Unlock rewards for achievements

- [ ] 💡 **Collection/Pokédex**
  - Track creatures encountered
  - Track creatures owned
  - Lore/description for each

---

## 🐛 Bug Fixes & Technical Debt

### Known Issues
- [ ] 🔥 **Unused variable warnings**
  - Clean up handleBurnTest, handleKindleTest, etc.
  - Remove or hook up test buttons

- [ ] 🔥 **React Hook dependency warnings**
  - Fix useEffect missing dependencies
  - Ensure no stale closures

- [ ] ⭐ **Target selection edge cases**
  - Can't target dead creatures
  - Can't target when no action selected
  - Clear selection after action

### Code Quality
- [ ] ⭐ **Extract large component into smaller ones**
  - BattleEngineExample is 1900 lines
  - Split into: BattleHeader, CreatureDisplay, BattleMenu, etc.

- [ ] 💡 **TypeScript strict mode**
  - Enable stricter type checking
  - Remove 'any' types
  - Add proper interfaces

- [ ] 💡 **Unit tests for battle logic**
  - Test damage calculations
  - Test status effect application
  - Test turn system

---

## 🎲 Advanced Features (Future)

### Multiplayer
- [ ] 💡 **Local 2-player mode**
  - Hot-seat: players take turns
  - Split teams before battle

- [ ] 💡 **Online battles**
  - Real-time PvP
  - Matchmaking
  - Leaderboard

### Customization
- [ ] 💡 **Custom creature creator**
  - Choose icon, name, stats
  - Build custom passive
  - Balance restrictions

- [ ] 💡 **Deck builder mode**
  - Build attack deck for each creature
  - Limited slots (4 attacks max)
  - Unlock more attacks

### Content
- [ ] 💡 **Story/campaign mode**
  - Linear progression
  - Dialogue/narrative
  - Unlockable creatures as story rewards

- [ ] 💡 **Endless/survival mode**
  - Fight waves of enemies
  - Increasing difficulty
  - High score tracking

- [ ] 💡 **Tournament mode**
  - Bracket-style 8 battles
  - Special rewards
  - AI opponents with themes

---

## 📊 Current Status Summary

### ✅ Already Implemented
- Effect pipeline system
- Zustand state management
- Target selection UI
- Passive abilities (Stone Thorns, Poison Skin, Outbreak)
- Status effects (Burn, Poison) - **not ticking yet**
- Autopilot/Auto-battle mode
- Battle timeline/event log
- Victory/defeat screens (partial)
- Creature switching animations
- Attack showcase
- Info modals
- Combo counter
- Rewards screen
- Turn transition animations

### 🔄 In Progress
- Turn-based system (needs status ticking)
- Enemy AI (autopilot exists, needs turn integration)

### ⏳ Not Started
- Most attack variety
- Items/equipment
- Creature progression
- Sound/music
- Advanced AI
- Multiplayer
- Campaign mode

---

## 🎯 Recommended Quick Wins (Start Here!)

These will make the game feel much more complete with relatively low effort:

1. **🔥 Fix status ticking** - Make burn/poison actually work each turn
2. **🔥 Enemy turns** - Make computer fight back automatically
3. **⭐ More attacks** - Add 5-10 different attacks with cool effects
4. **⭐ Sound effects** - Just a few key sounds (hit, victory, menu)
5. **⭐ Better HP animations** - Smooth damage feedback
6. **💡 Keyboard shortcuts** - Much better UX
7. **💡 3-5 more creatures** - Expand the roster
8. **💡 Simple item system** - Health potions at minimum

---

## 🏆 Pick Your Focus

**Want tactical depth?** → Status effects, attack variety, AI improvements  
**Want progression feel?** → Leveling, rewards, creature collection  
**Want polish?** → Animations, SFX, UI improvements, particles  
**Want content?** → More creatures, attacks, battles, campaign  

What sounds most fun to work on? 🎮
