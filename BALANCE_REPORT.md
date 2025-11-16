# Battle Balance Report

**Date**: October 20, 2025  
**Version**: Phase 1  
**Simulation Tool**: `scripts/balance-simulator.ts`

## Executive Summary

This document tracks balance testing, analysis, and adjustments for the battle system. The goal is to ensure fair, engaging combat with:
- No single creature archetype dominates
- Battles last 5-15 turns on average
- Status effects are impactful but not overwhelming
- Team composition matters

## Current Creature Stats

### Dragon (Tank/DPS Hybrid)
- **Health**: 120
- **Attack**: 25
- **Defense**: 15
- **Role**: High HP, balanced offense/defense

### Goblin (Fast Attacker)
- **Health**: 60
- **Attack**: 15
- **Defense**: 8
- **Role**: Low HP, moderate damage

### Knight (Pure Tank)
- **Health**: 100
- **Attack**: 18
- **Defense**: 20
- **Role**: High defense, moderate attack

### Mage (Glass Cannon)
- **Health**: 70
- **Attack**: 30
- **Defense**: 5
- **Role**: High damage, low defense

## Attack Values

### Basic Attack
- **Damage**: 10
- **Effects**: None
- **Cooldown**: 0

### Fireball (Burn Attack)
- **Damage**: 15
- **Effects**: BURN (5 dmg/turn for 3 turns = 15 total)
- **Total Potential**: 15 + 15 = 30 damage
- **Cooldown**: 2 turns

### Status Effect Defaults
- **BURN**: 5 dmg/turn, 3 turns duration
- **POISON**: 10 dmg/turn, 3 turns duration  
- **BLEED**: 7 dmg/turn, 3 turns duration
- **STUN**: No damage, 2 turns duration
- **WEAKEN**: -50% attack, 3 turns duration
- **STRENGTHEN**: +50% attack, 3 turns duration

## Simulation Results

### Test 1: Dragon vs Goblin (1v1)
**Expectation**: Dragon should win most battles due to higher stats across the board.

| Metric | Result | Status |
|--------|--------|--------|
| Player Wins (Dragon) | TBD | - |
| Computer Wins (Goblin) | TBD | - |
| Avg Turns to Win | TBD | - |
| Avg Damage/Turn | TBD | - |

**Analysis**: *Run `npx ts-node scripts/balance-simulator.ts` to populate*

**Recommendations**: 
- If Dragon wins >85%: Reduce Dragon attack by 3-5 or increase Goblin defense
- If Dragon wins <70%: Goblin may be overtuned

---

### Test 2: Knight vs Mage (1v1)
**Expectation**: Close matchup - Mage's high damage vs Knight's high defense. Should be ~50/50.

| Metric | Result | Status |
|--------|--------|--------|
| Player Wins (Knight) | TBD | - |
| Computer Wins (Mage) | TBD | - |
| Avg Turns to Win | TBD | - |
| Avg Damage/Turn | TBD | - |

**Analysis**: *Pending simulation*

**Recommendations**: 
- Target: 45-55% win rate for either side
- If Mage wins >60%: Reduce Mage attack by 2-3 or increase Knight defense
- If Knight wins >60%: Reduce Knight defense or increase Mage attack

---

### Test 3: Team Battle (Dragon+Goblin vs Knight+Mage)
**Expectation**: Balanced 2v2 should favor neither side significantly. Should last 8-12 turns.

| Metric | Result | Status |
|--------|--------|--------|
| Player Wins | TBD | - |
| Computer Wins | TBD | - |
| Avg Turns to Win | TBD | - |
| Avg Damage/Turn | TBD | - |

**Analysis**: *Pending simulation*

**Recommendations**: 
- Target: 40-60% win rate for either team
- Target turn count: 8-12 turns average
- If battles end too quickly (<6 turns): Reduce damage across the board by 10%
- If battles drag on (>15 turns): Increase damage or reduce defense values

---

## Status Effect Impact Analysis

### BURN Effect Balance
- **Current**: 5 dmg/turn for 3 turns = 15 total damage
- **Observations**: *Pending data*
- **Recommendations**: 
  - If burn accounts for >40% of total damage: Reduce to 4 dmg/turn or 2 turn duration
  - If burn is negligible (<15%): Increase to 6 dmg/turn

### POISON Effect Balance
- **Current**: 10 dmg/turn for 3 turns = 30 total damage
- **Observations**: *Pending data*
- **Concern**: May be too strong compared to BURN
- **Recommendations**: Consider reducing to 7-8 dmg/turn

---

## Damage Formula Verification

Current formula: `actualDamage = max(1, (attackDamage + attackerBonus) - targetDefense)`

### Test Cases
1. **Dragon attacks Goblin**:
   - Base: 10, Attacker bonus: 25, Defense: 8
   - Expected: max(1, (10 + 25) - 8) = 27
   - Actual: *TBD*

2. **Goblin attacks Knight**:
   - Base: 10, Attacker bonus: 15, Defense: 20
   - Expected: max(1, (10 + 15) - 20) = 5
   - Actual: *TBD*

3. **Mage attacks Dragon**:
   - Base: 10, Attacker bonus: 30, Defense: 15
   - Expected: max(1, (10 + 30) - 15) = 25
   - Actual: *TBD*

**Validation**: ✅ Minimum damage of 1 is enforced

---

## Adjustment History

### October 20, 2025 - Initial Balance Pass
- Created simulation framework
- Established baseline creature stats
- Set status effect durations

**Changes**: None yet (initial state)

---

### Pending Adjustments

*This section will be updated after running simulations*

**Priority Changes**:
1. [ ] Adjust Dragon/Goblin balance if needed
2. [ ] Fine-tune Mage damage vs Knight defense
3. [ ] Verify status effect impact
4. [ ] Test 3v3 team compositions

**Future Considerations**:
- Add more creature archetypes (Healer, Debuffer, Controller)
- Implement elemental weaknesses/resistances
- Add creature-specific passive abilities
- Consider scaling stats for late-game balance

---

## How to Run Balance Tests

```bash
# Run full simulation suite
npx ts-node scripts/balance-simulator.ts

# Quick test (fewer iterations)
# Edit SIMULATION_COUNT in script to reduce from 100 to 20

# Add new test scenarios
# Edit the main() function in balance-simulator.ts
```

---

## Notes

- All simulations use deterministic combat (no RNG in damage calculation)
- Attack selection is randomized (70% basic, 30% special attacks)
- Turn order: Player always goes first
- Max battle length: 50 turns (ends in draw)

---

## Action Items

- [ ] Run initial simulation suite and populate TBD values
- [ ] Analyze win rates and adjust creature stats
- [ ] Test status effect impact separately
- [ ] Create visualization of damage over time
- [ ] Document final balanced values in `consts/creatures.ts`
- [ ] Add unit tests for damage calculation edge cases

---

**Last Updated**: October 20, 2025  
**Next Review**: After simulation data collected
