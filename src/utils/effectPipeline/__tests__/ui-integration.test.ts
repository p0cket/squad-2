// Integration test to verify UI updates work correctly
import { renderHook, act } from '@testing-library/react'
import { useBattleEngine } from '../hooks/useBattleEngine'
import { BattleState } from '../types'

const mockBattleState: BattleState = {
  playerCreatures: [
    {
      ID: 1,
      name: "Dragon",
      icon: "🐉",
      template: "dragon",
      health: 100,
      maxHealth: 100,
      attack: 25,
      trueDamage: 0,
      defense: 15,
      mods: [],
      startingAttacks: [],
      possibleAttacks: [],
      statuses: [],
      owner: "player"
    }
  ],
  computerCreatures: [
    {
      ID: 2,
      name: "Goblin",
      icon: "👺",
      template: "goblin",
      health: 60,
      maxHealth: 60,
      attack: 15,
      trueDamage: 0,
      defense: 8,
      mods: [],
      startingAttacks: [],
      possibleAttacks: [],
      statuses: [],
      owner: "computer"
    }
  ],
  mp: 0,
  turn: 0,
  battleStatus: null
}

describe('UI Integration - Health Updates', () => {
  test('attack effect should update battleState visible to React', async () => {
    const { result } = renderHook(() => useBattleEngine(mockBattleState))

    // Initial state check
    expect(result.current.battleState.computerCreatures[0].health).toBe(60)

    // Perform attack (Dragon attacks Goblin)
    await act(async () => {
      const attack = {
        name: "Fire Breath",
        damage: 20,
        template: "fire",
        attackType: "magical",
        effects: [],
        chanceToLand: 1,
        trueDamage: 0,
        icon: "🔥",
        notes: "Deals fire damage",
        cooldown: 0
      }
      await result.current.performAttack(1, 2, attack)
    })

    // Check if UI state was updated
    const goblinHealth = result.current.battleState.computerCreatures[0].health
    console.log(`🧪 Test Result: Goblin health after attack: ${goblinHealth}/60`)

    // The attack should deal damage (25 attack + 20 damage - 8 defense = 37 damage)
    // So health should go from 60 to 23
    expect(goblinHealth).toBeLessThan(60)
    expect(goblinHealth).toBe(23) // 60 - 37 = 23

    console.log('✅ SUCCESS: Attack effect properly updated React battleState!')
  })

  test('heal effect should update battleState visible to React', async () => {
    const { result } = renderHook(() => useBattleEngine(mockBattleState))

    // Damage the dragon first
    await act(async () => {
      const attack = {
        name: "Bite",
        damage: 30,
        template: "physical",
        attackType: "physical",
        effects: [],
        chanceToLand: 1,
        trueDamage: 0,
        icon: "🦷",
        notes: "Basic attack",
        cooldown: 0
      }
      await result.current.performAttack(2, 1, attack) // Goblin attacks Dragon
    })

    const dragonHealthAfterDamage = result.current.battleState.playerCreatures[0].health
    console.log(`🧪 Dragon health after damage: ${dragonHealthAfterDamage}/100`)

    // Now heal the dragon
    await act(async () => {
      await result.current.performHealing(1, 1, 25) // Dragon heals itself
    })

    const dragonHealthAfterHeal = result.current.battleState.playerCreatures[0].health
    console.log(`🧪 Dragon health after heal: ${dragonHealthAfterHeal}/100`)

    // Health should have increased
    expect(dragonHealthAfterHeal).toBeGreaterThan(dragonHealthAfterDamage)

    console.log('✅ SUCCESS: Heal effect properly updated React battleState!')
  })
})