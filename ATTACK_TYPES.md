# Attack Types Showcase

This document describes all attack types available in the battle system showcase.

## Usage

The `AttackShowcase` component displays a comprehensive set of attack buttons organized by category. **Hover over any button** to see full attack details.

## Attack Categories

### 💥 Direct Damage (4 attacks)

Pure damage attacks with no additional effects.

| Attack | Icon | Damage | Description |
|--------|------|--------|-------------|
| **Slash** | ⚔️ | 15 | Basic physical attack |
| **Heavy Strike** | 🔨 | 25 | Powerful strike, ignores 50% defense |
| **True Strike** | ⚡ | 20 | True damage, ignores ALL defense |
| **Pierce** | 🗡️ | 12+8 | 12 damage + 8 true damage (armor-piercing) |

### 🔥 Status Effects (DoT) (6 attacks)

Attacks that apply damage-over-time status effects.

| Attack | Icon | Effect | Description |
|--------|------|--------|-------------|
| **Burn** | 🔥 | Burn | Apply burn: 10 dmg/turn for 3 turns (30 total) |
| **Flame Swipe** | 🔥💨 | 15 dmg + Burn | 15 damage + burn (5 dmg/turn for 3 turns) |
| **Inferno** | 🔥🔥 | 10 dmg + Intense Burn | 10 damage + intense burn (15 dmg/turn for 4 turns) |
| **Poison** | 🧪 | Poison | Apply poison: 15 dmg/turn for 3 turns (45 total) |
| **Toxic Bite** | 🦷☠️ | 8 dmg + Poison | 8 damage + poison (10 dmg/turn for 4 turns) |
| **Bleed** | 🩸 | 12 dmg + Bleed | 12 damage + bleeding (8 dmg/turn for 3 turns) |

### ⬇️ Debuffs & Control (6 attacks)

Attacks that reduce enemy effectiveness or prevent actions.

| Attack | Icon | Effect | Description |
|--------|------|--------|-------------|
| **Stun** | 💫 | 10 dmg + Stun | 10 damage + stun (target cannot act for 1 turn) |
| **Freeze** | ❄️ | 5 dmg + Freeze | 5 damage + freeze (target cannot act for 2 turns) |
| **Weaken** | ⚔️↓ | 8 dmg + ATK Down | 8 damage + reduce attack by 5 for 3 turns |
| **Shatter Armor** | 🛡️💥 | 10 dmg + DEF Down | 10 damage + reduce defense by 8 for 3 turns |
| **Slow** | 🐌 | Speed Down | Reduce target speed by 50% for 3 turns |
| **Silence** | 🔇 | Silence | Prevent target from using abilities for 2 turns |

### ⬆️ Buffs & Support (4 attacks)

Attacks or abilities that enhance allies.

| Attack | Icon | Effect | Description |
|--------|------|--------|-------------|
| **Power Up** | 💪 | 12 dmg + ATK Up | 12 damage + gain +5 attack for 3 turns (self) |
| **Fortify** | 🛡️ | DEF Up | Grant target +10 defense for 3 turns |
| **Haste** | ⚡💨 | Speed Up | Increase target speed by 100% for 2 turns |
| **Regeneration** | 💚 | Regen | Grant target healing (10 HP/turn for 4 turns) |

### 💚 Healing & Cleanse (3 attacks)

Attacks that restore health or remove debuffs.

| Attack | Icon | Effect | Description |
|--------|------|--------|-------------|
| **Heal** | 💚 | Heal | Restore 25 HP to target (capped at max) |
| **Greater Heal** | 💚✨ | Greater Heal | Restore 50 HP to target (capped at max) |
| **Cleanse** | ✨ | Cleanse | Remove ALL debuffs from target |

### ✨ Special & Hybrid (9 attacks)

Complex attacks with unique mechanics.

| Attack | Icon | Mechanic | Description |
|--------|------|----------|-------------|
| **Life Drain** | 🩸💚 | Drain | 18 damage + heal self for 50% of damage dealt |
| **Execute** | ⚔️💀 | Execute | 30 damage (double if target below 25% HP) |
| **Kindle** | 🔥✨ | Spread | 10 burn + spread to 1 ally (5 dmg/turn for 2 turns) |
| **Chain Lightning** | ⚡🔗 | Chain | 15 damage, bounces to 2 random enemies (8 dmg each) |
| **Meteor** | ☄️ | AoE | 30 damage to target + 10 splash to all others |
| **Sacrifice** | 💔💥 | Sacrifice | Deal 50 damage but lose 25% of your own health |

## Implementation Status

Currently implemented in `AttackShowcase` component:
- ✅ All 32 attack types defined
- ✅ Tooltips on hover
- ✅ Category organization
- ✅ Color coding
- ✅ E2E test attributes

To implement attack logic:
- Add handlers in `BattleEngineExample.tsx`
- Create attack factory functions in `attackFactories.ts`
- Add status effect applicators in `statusEffects.ts`

## Design Patterns

### Damage Types
- **Physical**: Affected by defense stat
- **True Damage**: Ignores all defense
- **Hybrid**: Mix of physical and true damage

### Status Effects
- **DoT (Damage over Time)**: Burn, Poison, Bleed
- **Control**: Stun, Freeze, Silence, Slow
- **Stat Modifiers**: Attack/Defense up/down

### Targeting
- **Single Target**: Most attacks
- **AoE (Area of Effect)**: Meteor, Chain Lightning
- **Spread**: Kindle (DoT spread to allies)

### Special Mechanics
- **Life Drain**: Damage + self-heal
- **Execute**: Conditional bonus damage
- **Sacrifice**: High damage with self-harm cost
- **Chain/Bounce**: Multi-target attacks

## Testing

Use these attacks in E2E tests:

```typescript
// Example E2E test
test('Heavy Strike: ignores 50% defense', async ({ page }) => {
  const heavyStrikeButton = page.locator('[data-testid="btn-heavystrike"]')
  await heavyStrikeButton.click()
  // ... test logic
})
```

## Future Enhancements

Potential additions:
- Combo attacks (requires specific status on target)
- Counter attacks (triggered by being hit)
- Charge attacks (build up power over turns)
- Transform attacks (change creature form)
- Summon attacks (create temporary allies)
- Reflect attacks (return damage to attacker)
