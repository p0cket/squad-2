#!/usr/bin/env ts-node
/**
 * Battle Balance Simulator
 * 
 * Simulates many battles to collect statistics on:
 * - Average damage per turn
 * - Win rates for different team compositions
 * - Status effect impact
 * - Battle duration
 * 
 * Usage: npx ts-node scripts/balance-simulator.ts
 */

import { Creature, Attack } from '../src/consts/types/types'
import { BattleState, BattleContext } from '../src/utils/effectPipeline/types'
import { createBattleContext, applyChangesToContext } from '../src/utils/effectPipeline/battleContext'
import { createAttackEffect } from '../src/utils/effectPipeline/effects/combatEffects'
import { applyEffect } from '../src/utils/effectPipeline/effectApplicatorRegistry'

// Simulation configuration
const SIMULATION_COUNT = 100
const MAX_TURNS = 50

interface SimulationResult {
  playerWins: number
  computerWins: number
  draws: number
  avgTurnsToWin: number
  avgDamagePerTurn: number
  totalBattles: number
  statusEffectStats: {
    [key: string]: {
      applied: number
      damageDealt: number
    }
  }
}

// Sample creature templates
const createDragon = (id: number, owner: 'player' | 'computer'): Creature => ({
  ID: id,
  name: 'Dragon',
  icon: '🐉',
  template: 'dragon',
  health: 120,
  maxHealth: 120,
  attack: 25,
  trueDamage: 0,
  defense: 15,
  mods: [],
  startingAttacks: [],
  possibleAttacks: [],
  statuses: [],
  owner
})

const createGoblin = (id: number, owner: 'player' | 'computer'): Creature => ({
  ID: id,
  name: 'Goblin',
  icon: '👺',
  template: 'goblin',
  health: 60,
  maxHealth: 60,
  attack: 15,
  trueDamage: 0,
  defense: 8,
  mods: [],
  startingAttacks: [],
  possibleAttacks: [],
  statuses: [],
  owner
})

const createKnight = (id: number, owner: 'player' | 'computer'): Creature => ({
  ID: id,
  name: 'Knight',
  icon: '🛡️',
  template: 'knight',
  health: 100,
  maxHealth: 100,
  attack: 18,
  trueDamage: 0,
  defense: 20,
  mods: [],
  startingAttacks: [],
  possibleAttacks: [],
  statuses: [],
  owner
})

const createMage = (id: number, owner: 'player' | 'computer'): Creature => ({
  ID: id,
  name: 'Mage',
  icon: '🧙',
  template: 'mage',
  health: 70,
  maxHealth: 70,
  attack: 30,
  trueDamage: 0,
  defense: 5,
  mods: [],
  startingAttacks: [],
  possibleAttacks: [],
  statuses: [],
  owner
})

// Basic attack
const basicAttack: Attack = {
  template: 'basic',
  name: 'Basic Attack',
  attackType: 'physical',
  effects: [],
  chanceToLand: 100,
  damage: 10,
  trueDamage: 0,
  icon: '⚔️',
  notes: 'Standard attack',
  cooldown: 0
}

// Burn attack
const fireballAttack: Attack = {
  template: 'fireball',
  name: 'Fireball',
  attackType: 'magical',
  effects: ['BURN'],
  chanceToLand: 90,
  damage: 15,
  trueDamage: 0,
  icon: '🔥',
  notes: 'Fire attack with burn',
  cooldown: 2
}

/**
 * Simulate a single battle
 */
async function simulateBattle(
  playerTeam: Creature[],
  computerTeam: Creature[]
): Promise<{
  winner: 'player' | 'computer' | 'draw'
  turns: number
  totalDamage: number
  statusEffects: { [key: string]: number }
}> {
  const initialState: BattleState = {
    playerCreatures: playerTeam.map(c => ({ ...c })),
    computerCreatures: computerTeam.map(c => ({ ...c })),
    mp: 0,
    turn: 0,
    battleStatus: null
  }

  const context = createBattleContext(initialState)
  let turns = 0
  let totalDamage = 0
  const statusEffects: { [key: string]: number } = {}

  while (turns < MAX_TURNS) {
    turns++

    // Get alive creatures
    const alivePlayers = context.state.playerCreatures.filter(c => c.health > 0)
    const aliveComputers = context.state.computerCreatures.filter(c => c.health > 0)

    // Check win conditions
    if (alivePlayers.length === 0 && aliveComputers.length === 0) {
      return { winner: 'draw', turns, totalDamage, statusEffects }
    }
    if (alivePlayers.length === 0) {
      return { winner: 'computer', turns, totalDamage, statusEffects }
    }
    if (aliveComputers.length === 0) {
      return { winner: 'player', turns, totalDamage, statusEffects }
    }

    // Player turn - first alive player attacks first alive computer
    if (alivePlayers.length > 0 && aliveComputers.length > 0) {
      const attacker = alivePlayers[0]
      const target = aliveComputers[0]
      
      const attack = Math.random() > 0.3 ? basicAttack : fireballAttack
      const effect = createAttackEffect(attacker.ID, target.ID, attack)
      
      try {
        const result = await applyEffect(effect, context)
        
        // Track damage
        const healthChange = result.stateChanges.find(sc => sc.type === 'HEALTH_CHANGE')
        if (healthChange && healthChange.data.delta < 0) {
          totalDamage += Math.abs(healthChange.data.delta)
        }
        
        // Track status effects
        result.stateChanges
          .filter(sc => sc.type === 'STATUS_APPLIED')
          .forEach(sc => {
            const statusId = sc.data.statusId
            statusEffects[statusId] = (statusEffects[statusId] || 0) + 1
          })
        
        // Apply changes to context
        applyChangesToContext(context, result.stateChanges, { notify: false })
      } catch (error) {
        // Ignore errors in simulation
      }
    }

    // Computer turn - first alive computer attacks first alive player
    const updatedAlivePlayers = context.state.playerCreatures.filter(c => c.health > 0)
    const updatedAliveComputers = context.state.computerCreatures.filter(c => c.health > 0)
    
    if (updatedAliveComputers.length > 0 && updatedAlivePlayers.length > 0) {
      const attacker = updatedAliveComputers[0]
      const target = updatedAlivePlayers[0]
      
      const effect = createAttackEffect(attacker.ID, target.ID, basicAttack)
      
      try {
        const result = await applyEffect(effect, context)
        
        const healthChange = result.stateChanges.find(sc => sc.type === 'HEALTH_CHANGE')
        if (healthChange && healthChange.data.delta < 0) {
          totalDamage += Math.abs(healthChange.data.delta)
        }
        
        applyChangesToContext(context, result.stateChanges, { notify: false })
      } catch (error) {
        // Ignore errors
      }
    }
  }

  return { winner: 'draw', turns, totalDamage, statusEffects }
}

/**
 * Run multiple simulations
 */
async function runSimulations(
  playerTeam: Creature[],
  computerTeam: Creature[],
  count: number
): Promise<SimulationResult> {
  const results: SimulationResult = {
    playerWins: 0,
    computerWins: 0,
    draws: 0,
    avgTurnsToWin: 0,
    avgDamagePerTurn: 0,
    totalBattles: count,
    statusEffectStats: {}
  }

  let totalTurns = 0
  let totalDamage = 0

  for (let i = 0; i < count; i++) {
    const battle = await simulateBattle(
      playerTeam.map(c => ({ ...c })),
      computerTeam.map(c => ({ ...c }))
    )

    if (battle.winner === 'player') results.playerWins++
    else if (battle.winner === 'computer') results.computerWins++
    else results.draws++

    totalTurns += battle.turns
    totalDamage += battle.totalDamage

    // Aggregate status effects
    Object.entries(battle.statusEffects).forEach(([status, count]) => {
      if (!results.statusEffectStats[status]) {
        results.statusEffectStats[status] = { applied: 0, damageDealt: 0 }
      }
      results.statusEffectStats[status].applied += count
    })

    if ((i + 1) % 20 === 0) {
      console.log(`Progress: ${i + 1}/${count} battles completed`)
    }
  }

  results.avgTurnsToWin = totalTurns / count
  results.avgDamagePerTurn = totalDamage / totalTurns

  return results
}

/**
 * Main simulation runner
 */
async function main() {
  console.log('🎮 Battle Balance Simulator')
  console.log('=' .repeat(50))
  console.log()

  // Test 1: Dragon vs Goblin
  console.log('Test 1: Dragon vs Goblin')
  console.log('-'.repeat(50))
  const test1 = await runSimulations(
    [createDragon(1, 'player')],
    [createGoblin(2, 'computer')],
    SIMULATION_COUNT
  )
  console.log(`Player Wins: ${test1.playerWins} (${(test1.playerWins / test1.totalBattles * 100).toFixed(1)}%)`)
  console.log(`Computer Wins: ${test1.computerWins} (${(test1.computerWins / test1.totalBattles * 100).toFixed(1)}%)`)
  console.log(`Draws: ${test1.draws}`)
  console.log(`Avg Turns: ${test1.avgTurnsToWin.toFixed(1)}`)
  console.log(`Avg Damage/Turn: ${test1.avgDamagePerTurn.toFixed(1)}`)
  console.log()

  // Test 2: Knight vs Mage
  console.log('Test 2: Knight vs Mage')
  console.log('-'.repeat(50))
  const test2 = await runSimulations(
    [createKnight(1, 'player')],
    [createMage(2, 'computer')],
    SIMULATION_COUNT
  )
  console.log(`Player Wins: ${test2.playerWins} (${(test2.playerWins / test2.totalBattles * 100).toFixed(1)}%)`)
  console.log(`Computer Wins: ${test2.computerWins} (${(test2.computerWins / test2.totalBattles * 100).toFixed(1)}%)`)
  console.log(`Draws: ${test2.draws}`)
  console.log(`Avg Turns: ${test2.avgTurnsToWin.toFixed(1)}`)
  console.log(`Avg Damage/Turn: ${test2.avgDamagePerTurn.toFixed(1)}`)
  console.log()

  // Test 3: Balanced 2v2
  console.log('Test 3: Balanced Team Battle (Dragon+Goblin vs Knight+Mage)')
  console.log('-'.repeat(50))
  const test3 = await runSimulations(
    [createDragon(1, 'player'), createGoblin(2, 'player')],
    [createKnight(3, 'computer'), createMage(4, 'computer')],
    SIMULATION_COUNT
  )
  console.log(`Player Wins: ${test3.playerWins} (${(test3.playerWins / test3.totalBattles * 100).toFixed(1)}%)`)
  console.log(`Computer Wins: ${test3.computerWins} (${(test3.computerWins / test3.totalBattles * 100).toFixed(1)}%)`)
  console.log(`Draws: ${test3.draws}`)
  console.log(`Avg Turns: ${test3.avgTurnsToWin.toFixed(1)}`)
  console.log(`Avg Damage/Turn: ${test3.avgDamagePerTurn.toFixed(1)}`)
  console.log()

  console.log('=' .repeat(50))
  console.log('✅ Simulation Complete!')
  console.log()
  console.log('Summary:')
  console.log(`- Dragon appears ${test1.playerWins > test1.computerWins ? 'too strong' : 'balanced'} vs Goblin`)
  console.log(`- Knight vs Mage: ${Math.abs(test2.playerWins - test2.computerWins) < 20 ? 'Well balanced' : 'Needs adjustment'}`)
  console.log(`- Team battles averaging ${test3.avgTurnsToWin.toFixed(1)} turns`)
  console.log()
  console.log('Recommendations:')
  if (test1.playerWins > 80) {
    console.log('- Reduce Dragon attack or increase Goblin defense')
  }
  if (test2.computerWins > 60) {
    console.log('- Reduce Mage damage or increase Knight attack')
  }
  console.log('- See detailed stats above for fine-tuning')
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error)
}

export { simulateBattle, runSimulations }
