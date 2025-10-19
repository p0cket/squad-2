// Example component showing how to use the Effect Pipeline System
import React, { useState } from 'react'
import { useBattleEngine } from '../hooks/useBattleEngine'
import { BattleState } from '../types'
import { useDispatchContext } from '../../../GameContext'
import { InfoModal } from '../../../components/battle/InfoModal'
import {
  createStunAttack,
  createWeakeningAttack,
  createCleanseAttack,
  createBuffingAttack
} from '../effects/attackFactories'

// Example initial battle state
const exampleBattleState: BattleState = {
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
    },
    {
      ID: 3,
      name: "Rocky (Golem)",
      icon: "🟠",
      template: "golem",
      health: 80,
      maxHealth: 80,
      attack: 10,
      trueDamage: 5,
      defense: 25,
      mods: [],
      startingAttacks: [],
      possibleAttacks: [],
      statuses: [],
      owner: "computer",
      passiveAbilities: [{
        id: 'stone-thorns',
        name: 'Stone Thorns',
        description: 'When damaged, deals 15 true damage back to attacker',
        trigger: 'on_damaged',
        effect: {
          type: 'damage',
          targetType: 'attacker',
          value: 15,
          chance: 1.0
        },
        icon: '🪨'
      }]
    },
    {
      ID: 4,
      name: "Slither (Basilisk)",
      icon: "🐍",
      template: "basilisk",
      health: 70,
      maxHealth: 70,
      attack: 20,
      trueDamage: 10,
      defense: 10,
      mods: [],
      startingAttacks: [],
      possibleAttacks: [],
      statuses: [],
      owner: "computer",
      passiveAbilities: [{
        id: 'poison-skin',
        name: 'Poison Skin',
        description: 'When damaged, 60% chance to poison attacker',
        trigger: 'on_damaged',
        effect: {
          type: 'poison',
          targetType: 'attacker',
          value: 8,
          chance: 0.6
        },
        icon: '🧪'
      }]
    },
    {
      ID: 5,
      name: "Plague Rat",
      icon: "🐀",
      template: "rat",
      health: 50,
      maxHealth: 50,
      attack: 12,
      trueDamage: 0,
      defense: 5,
      mods: [],
      startingAttacks: [],
      possibleAttacks: [],
      statuses: [],
      owner: "computer",
      passiveAbilities: [{
        id: 'outbreak',
        name: 'Outbreak',
        description: 'When burn is applied, 25% chance to spread to an ally (3 dmg)',
        trigger: 'on_status_applied',
        effect: {
          type: 'spread_burn',
          targetType: 'all_allies',
          statusId: 'BURN',
          chance: 0.25,
          value: 3
        },
        icon: '🦠'
      }]
    }
  ],
  mp: 0,
  turn: 0,
  battleStatus: null
}

/**
 * Example component demonstrating the Effect Pipeline System
 */
export const BattleEngineExample: React.FC = () => {
  const dispatch = useDispatchContext()
  const {
    battleState,
    isProcessingEffects,
    applyBurn,
    applyPoison,
    performAttack,
    performHealing,
    getAliveCreatures,
    isBattleOver,
    getBattleWinner,
    resetBattle,
    processEndOfTurn,
    getDebugInfo
  } = useBattleEngine(exampleBattleState)

  const playerCreatures = getAliveCreatures('player')
  // const computerCreatures = getAliveCreatures('computer') // Not currently used

  // Target selection state
  const [isSelectingTarget, setIsSelectingTarget] = React.useState(false)
  const [pendingAction, setPendingAction] = React.useState<'attack' | 'heal' | 'burn' | 'poison' | 'kindle' | 'passive-test' | 'stun' | 'weaken' | 'cleanse' | 'buff' | null>(null)

  // Info modal state
  const [infoModal, setInfoModal] = useState<{
    isOpen: boolean;
    type: 'status' | 'passive' | null;
    data: any;
  }>({
    isOpen: false,
    type: null,
    data: null
  })

  // Handle clicking on status effect
  const handleStatusClick = (status: any, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent creature click
    setInfoModal({
      isOpen: true,
      type: 'status',
      data: status
    })
  }

  // Handle clicking on passive ability
  const handlePassiveClick = (passive: any, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent creature click
    setInfoModal({
      isOpen: true,
      type: 'passive',
      data: passive
    })
  }

  // Close modal
  const closeModal = () => {
    setInfoModal({
      isOpen: false,
      type: null,
      data: null
    })
  }

  // Start target selection for burn
  const handleBurnTest = () => {
    setIsSelectingTarget(true)
    setPendingAction('burn')
  }

  // Start target selection for kindle (burn with spread)
  const handleKindleTest = () => {
    setIsSelectingTarget(true)
    setPendingAction('kindle')
  }

  // Start target selection for poison
  const handlePoisonTest = () => {
    setIsSelectingTarget(true)
    setPendingAction('poison')
  }

  // Start target selection for attack
  const handleAttackTest = () => {
    setIsSelectingTarget(true)
    setPendingAction('attack')
  }

  // Execute attack on selected target
  const executeAttack = async (targetId: number) => {
    if (playerCreatures.length > 0) {
      const attack = {
        name: "Slash",
        damage: 15,
        template: "physical",
        attackType: "physical",
        effects: [], // No status effects - just damage
        chanceToLand: 1,
        trueDamage: 0,
        icon: "⚔️",
        notes: "Basic physical attack",
        cooldown: 0
      }
      await performAttack(playerCreatures[0].ID, targetId, attack)
      setIsSelectingTarget(false)
      setPendingAction(null)
    }
  }

  // Start target selection for heal
  const handleHealTest = () => {
    setIsSelectingTarget(true)
    setPendingAction('heal')
  }

  // Execute heal on selected target
  const executeHeal = async (targetId: number) => {
    if (playerCreatures.length > 0) {
      await performHealing(playerCreatures[0].ID, targetId, 25)
      setIsSelectingTarget(false)
      setPendingAction(null)
    }
  }

  // Execute burn on selected target
  const executeBurn = async (targetId: number) => {
    await applyBurn(targetId, 10)
    setIsSelectingTarget(false)
    setPendingAction(null)
  }

  // Execute kindle (burn with spread) on selected target
  const executeKindle = async (targetId: number) => {
    // Apply burn to the primary target
    await applyBurn(targetId, 10)
    
    // Find the target creature to get its team
    const targetCreature = battleState.playerCreatures.find(c => c.ID === targetId) || 
                           battleState.computerCreatures.find(c => c.ID === targetId)
    
    if (targetCreature) {
      const targetTeam = targetCreature.owner === 'player' 
        ? battleState.playerCreatures 
        : battleState.computerCreatures
      
      // Find allies of the target that don't have burn yet
      const potentialSpreadTargets = targetTeam.filter(c => 
        c.ID !== targetId && 
        c.health > 0 &&
        !c.statuses.some(s => s.id === 'BURN')
      )
      
      // Spread to one random ally with weaker burn
      if (potentialSpreadTargets.length > 0) {
        const spreadTarget = potentialSpreadTargets[Math.floor(Math.random() * potentialSpreadTargets.length)]
        console.log(`🔥 Kindle spreads from ${targetCreature.name} to ${spreadTarget.name}`)
        await applyBurn(spreadTarget.ID, 5) // Weaker spread (5 damage instead of 10)
      }
    }
    
    setIsSelectingTarget(false)
    setPendingAction(null)
  }

  // Execute poison on selected target
  const executePoison = async (targetId: number) => {
    await applyPoison(targetId, 15)
    setIsSelectingTarget(false)
    setPendingAction(null)
  }

  // Execute passive ability test on selected target
  const executePassiveTest = async (targetId: number) => {
    if (playerCreatures.length > 0) {
      const attack = {
        name: "Test Strike",
        damage: 15,
        template: "physical",
        attackType: "physical",
        effects: [],
        chanceToLand: 1,
        trueDamage: 0,
        icon: "⚔️",
        notes: "Test attack to trigger passive abilities",
        cooldown: 0
      }
      await performAttack(playerCreatures[0].ID, targetId, attack)
      setIsSelectingTarget(false)
      setPendingAction(null)
    }
  }

  // Execute new attack types
  const executeStunAttack = async (targetId: number) => {
    if (playerCreatures.length > 0) {
      const attack = createStunAttack("Stunning Blow", 10)
      await performAttack(playerCreatures[0].ID, targetId, attack)
      setIsSelectingTarget(false)
      setPendingAction(null)
    }
  }

  const executeWeakenAttack = async (targetId: number) => {
    if (playerCreatures.length > 0) {
      const attack = createWeakeningAttack("Sap Strength", 8)
      await performAttack(playerCreatures[0].ID, targetId, attack)
      setIsSelectingTarget(false)
      setPendingAction(null)
    }
  }

  const executeCleanseAttack = async (targetId: number) => {
    if (playerCreatures.length > 0) {
      const attack = createCleanseAttack("Purifying Strike", 5)
      await performAttack(playerCreatures[0].ID, targetId, attack)
      setIsSelectingTarget(false)
      setPendingAction(null)
    }
  }

  const executeBuffAttack = async (targetId: number) => {
    if (playerCreatures.length > 0) {
      const attack = createBuffingAttack("Power Strike", 12, ['strengthen'])
      await performAttack(playerCreatures[0].ID, targetId, attack)
      setIsSelectingTarget(false)
      setPendingAction(null)
    }
  }

  // Handle clicking on a creature during target selection
  const handleCreatureClick = async (creatureId: number) => {
    if (!isSelectingTarget) return

    if (pendingAction === 'attack') {
      await executeAttack(creatureId)
    } else if (pendingAction === 'heal') {
      await executeHeal(creatureId)
    } else if (pendingAction === 'burn') {
      await executeBurn(creatureId)
    } else if (pendingAction === 'kindle') {
      await executeKindle(creatureId)
    } else if (pendingAction === 'poison') {
      await executePoison(creatureId)
    } else if (pendingAction === 'passive-test') {
      await executePassiveTest(creatureId)
    } else if (pendingAction === 'stun') {
      await executeStunAttack(creatureId)
    } else if (pendingAction === 'weaken') {
      await executeWeakenAttack(creatureId)
    } else if (pendingAction === 'cleanse') {
      await executeCleanseAttack(creatureId)
    } else if (pendingAction === 'buff') {
      await executeBuffAttack(creatureId)
    }
  }

  // Cancel target selection
  const cancelTargetSelection = () => {
    setIsSelectingTarget(false)
    setPendingAction(null)
  }

  // Start target selection for passive ability test
  const handlePassiveAbilityTest = () => {
    setIsSelectingTarget(true)
    setPendingAction('passive-test')
  }

  const goBackToBattle = () => {
    dispatch({ type: "CHANGE_SCREEN", payload: { screen: "battle" } })
  }

  const debugInfo = getDebugInfo()

  // Turn state
  const [turnNumber, setTurnNumber] = React.useState(1)
  const [currentTurnOwner, setCurrentTurnOwner] = React.useState<'player' | 'computer'>('player')

  const handleEndTurn = async () => {
    // Process end of turn status ticks
    try {
      await processEndOfTurn()
    } catch (err) {
      console.error('Error during end of turn processing', err)
    }

    // Advance turn counter and flip owner
    setTurnNumber(t => t + 1)
    setCurrentTurnOwner(prev => prev === 'player' ? 'computer' : 'player')
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Target Selection Banner */}
      {isSelectingTarget && (
        <div className="mb-4 p-4 bg-blue-900/80 backdrop-blur-sm border border-blue-500/50 text-blue-100 rounded-lg shadow-lg shadow-blue-500/20">
          <div className="flex justify-between items-center">
          <div data-selecting-target={isSelectingTarget ? 'true' : 'false'} data-pending-action={pendingAction || ''}>
              <p className="text-lg font-bold">
                {pendingAction === 'attack' && '⚔️ Select a target to attack'}
                {pendingAction === 'heal' && '💚 Select a target to heal'}
                {pendingAction === 'burn' && '🔥 Select a target to burn'}
                {pendingAction === 'kindle' && '🔥✨ Select a target to kindle (spreads to allies)'}
                {pendingAction === 'poison' && '🧪 Select a target to poison'}
                {pendingAction === 'passive-test' && '🌿 Select a creature to attack (triggers passives)'}
                {pendingAction === 'stun' && '💫 Select a target to stun (10 dmg + 1 turn disable)'}
                {pendingAction === 'weaken' && '⚔️↓ Select a target to weaken (8 dmg + reduce attack)'}
                {pendingAction === 'cleanse' && '✨ Select a target to cleanse (5 dmg + remove debuffs)'}
                {pendingAction === 'buff' && '💪 Select a target for power strike (12 dmg + gain attack buff)'}
              </p>
              <p className="text-sm opacity-90">Click on any creature to target them</p>
            </div>
            <button
              onClick={cancelTargetSelection}
              className="px-4 py-2 bg-slate-100 text-blue-900 rounded hover:bg-white font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-purple-100">Effect Pipeline System Demo</h1>
        <button
          onClick={goBackToBattle}
          className="px-4 py-2 bg-slate-700 text-purple-200 rounded hover:bg-slate-600 border border-purple-500/30"
        >
          ← Back to Battle
        </button>
      </div>

      {/* Battle Status */}
      <div className="mb-6 p-4 bg-slate-800/80 backdrop-blur-sm border border-purple-500/30 rounded-lg">
        <h2 className="text-xl font-semibold mb-2 text-purple-200">Battle Status</h2>
        {isBattleOver() ? (
          <div className="text-lg text-purple-100">
            Battle Over! Winner: <span className="font-bold text-pink-400">{getBattleWinner()}</span>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="text-purple-200">Battle in progress...</div>
            <div className="text-sm text-slate-300" data-testid="turn-counter">Turn: <span className="font-semibold text-purple-100">{turnNumber}</span></div>
            <div className="text-sm text-slate-300" data-testid="turn-owner">Owner: <span className="font-semibold text-purple-100">{currentTurnOwner}</span></div>
            <button
              onClick={handleEndTurn}
              className="ml-4 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded"
              data-testid="end-turn-button"
            >
              End Turn
            </button>
          </div>
        )}
        {isProcessingEffects && (
          <div className="text-blue-400 font-semibold">⚡ Processing effects...</div>
        )}
      </div>

      {/* Creatures Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Player Creatures */}
        <div className="p-4 bg-slate-800/60 backdrop-blur-sm border border-blue-500/30 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-blue-300">Player Creatures</h3>
          {battleState.playerCreatures.map(creature => (
            <div
              key={creature.ID}
              data-testid="creature-card"
              data-creature-name={creature.name}
              data-creature-id={creature.ID}
              onClick={() => handleCreatureClick(creature.ID)}
              className={`p-3 border rounded mb-2 transition-all ${
                creature.health <= 0 
                  ? 'opacity-50 bg-slate-900/50 border-slate-600' 
                  : isSelectingTarget
                  ? 'bg-blue-900/40 border-blue-400 cursor-pointer hover:bg-blue-800/60 hover:shadow-lg hover:shadow-blue-500/20'
                  : 'bg-slate-900/70 border-slate-600'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-purple-100">
                  {creature.icon} {creature.name}
                </span>
                <div className="text-sm" data-testid="creature-health">
                  <span className={creature.health <= 0 ? 'text-red-400' : 'text-green-400'}>
                    {creature.health}/{creature.maxHealth} HP
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                ATK: {creature.attack} | DEF: {creature.defense}
              </div>
              {creature.passiveAbilities && creature.passiveAbilities.length > 0 && (
                <div className="mt-2 pt-2 border-t border-purple-500/20">
                  <div className="text-xs text-purple-300 mb-1 font-semibold">⚡ Passive Abilities:</div>
                  {creature.passiveAbilities.map((ability) => (
                    <div 
                      key={ability.id} 
                      onClick={(e) => handlePassiveClick(ability, e)}
                      className="text-xs bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 rounded p-2 mb-1 cursor-pointer transition-all hover:shadow-lg hover:shadow-yellow-500/20 group"
                    >
                      <div className="font-semibold text-yellow-200 group-hover:text-yellow-100">
                        {ability.icon} {ability.name}
                        <span className="ml-2 text-xs text-yellow-400/70 group-hover:text-yellow-300">ⓘ Click for details</span>
                      </div>
                      <div className="text-yellow-300/90 mt-1">{ability.description}</div>
                    </div>
                  ))}
                </div>
              )}
              {creature.statuses.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {creature.statuses.map((status, idx) => (
                    <span
                      key={`${status.id}-${idx}`}
                      data-testid="status-badge"
                      data-status-id={status.id}
                      onClick={(e) => handleStatusClick(status, e)}
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium cursor-pointer transition-all hover:shadow-lg group ${
                        status.type === 'debuff'
                          ? 'bg-red-500/30 text-red-200 border border-red-400/50 hover:bg-red-500/40 hover:shadow-red-500/30'
                          : status.type === 'buff'
                          ? 'bg-green-500/30 text-green-200 border border-green-400/50 hover:bg-green-500/40 hover:shadow-green-500/30'
                          : 'bg-slate-500/30 text-slate-200 border border-slate-400/50 hover:bg-slate-500/40 hover:shadow-slate-500/30'
                      }`}
                    >
                      {status.icon} {status.name} ({status.duration})
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Computer Creatures */}
        <div className="p-4 bg-slate-800/60 backdrop-blur-sm border border-red-500/30 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-red-300">Computer Creatures</h3>
          {battleState.computerCreatures.map(creature => (
            <div
              key={creature.ID}
              data-testid="creature-card"
              data-creature-name={creature.name}
              data-creature-id={creature.ID}
              onClick={() => handleCreatureClick(creature.ID)}
              className={`p-3 border rounded mb-2 transition-all ${
                creature.health <= 0 
                  ? 'opacity-50 bg-slate-900/50 border-slate-600' 
                  : isSelectingTarget
                  ? 'bg-red-900/40 border-red-400 cursor-pointer hover:bg-red-800/60 hover:shadow-lg hover:shadow-red-500/20'
                  : 'bg-slate-900/70 border-slate-600'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-purple-100">
                  {creature.icon} {creature.name}
                </span>
                <div className="text-sm" data-testid="creature-health">
                  <span className={creature.health <= 0 ? 'text-red-400' : 'text-green-400'}>
                    {creature.health}/{creature.maxHealth} HP
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                ATK: {creature.attack} | DEF: {creature.defense}
              </div>
              {creature.passiveAbilities && creature.passiveAbilities.length > 0 && (
                <div className="mt-2 pt-2 border-t border-purple-500/20">
                  <div className="text-xs text-purple-300 mb-1 font-semibold">⚡ Passive Abilities:</div>
                  {creature.passiveAbilities.map((ability) => (
                    <div 
                      key={ability.id} 
                      onClick={(e) => handlePassiveClick(ability, e)}
                      className="text-xs bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 rounded p-2 mb-1 cursor-pointer transition-all hover:shadow-lg hover:shadow-yellow-500/20 group"
                    >
                      <div className="font-semibold text-yellow-200 group-hover:text-yellow-100">
                        {ability.icon} {ability.name}
                        <span className="ml-2 text-xs text-yellow-400/70 group-hover:text-yellow-300">ⓘ Click for details</span>
                      </div>
                      <div className="text-yellow-300/90 mt-1">{ability.description}</div>
                    </div>
                  ))}
                </div>
              )}
              {creature.statuses.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {creature.statuses.map((status, idx) => (
                    <span
                      key={`${status.id}-${idx}`}
                      data-testid="status-badge"
                      data-status-id={status.id}
                      onClick={(e) => handleStatusClick(status, e)}
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium cursor-pointer transition-all hover:shadow-lg group ${
                        status.type === 'debuff'
                          ? 'bg-red-500/30 text-red-200 border border-red-400/50 hover:bg-red-500/40 hover:shadow-red-500/30'
                          : status.type === 'buff'
                          ? 'bg-green-500/30 text-green-200 border border-green-400/50 hover:bg-green-500/40 hover:shadow-green-500/30'
                          : 'bg-slate-500/30 text-slate-200 border border-slate-400/50 hover:bg-slate-500/40 hover:shadow-slate-500/30'
                      }`}
                    >
                      {status.icon} {status.name} ({status.duration})
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Test Actions */}
      <div className="mb-6 p-4 bg-slate-800/60 backdrop-blur-sm border border-purple-500/30 rounded-lg">
        <h2 className="text-xl font-semibold mb-3 text-purple-200">Test Actions</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleAttackTest}
            disabled={isProcessingEffects || playerCreatures.length === 0 || isSelectingTarget}
            title="Basic physical attack (15 damage, no status effects)"
            className={`px-4 py-2 text-white rounded disabled:opacity-50 ${
              isSelectingTarget && pendingAction === 'attack'
                ? 'bg-blue-600 ring-2 ring-blue-400'
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            ⚔️ {isSelectingTarget && pendingAction === 'attack' ? 'Selecting...' : 'Slash'}
          </button>

          <button
            onClick={handleBurnTest}
            disabled={isProcessingEffects || isSelectingTarget}
            title="Directly apply burn status (10 damage, 3 turns)"
            className={`px-4 py-2 text-white rounded disabled:opacity-50 ${
              isSelectingTarget && pendingAction === 'burn'
                ? 'bg-blue-600 ring-2 ring-blue-400'
                : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            🔥 {isSelectingTarget && pendingAction === 'burn' ? 'Selecting...' : 'Burn'}
          </button>

          <button
            onClick={handleKindleTest}
            disabled={isProcessingEffects || isSelectingTarget}
            title="Apply burn + spread to one ally (10 dmg primary, 5 dmg spread)"
            className={`px-4 py-2 text-white rounded disabled:opacity-50 ${
              isSelectingTarget && pendingAction === 'kindle'
                ? 'bg-blue-600 ring-2 ring-blue-400'
                : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700'
            }`}
          >
            🔥✨ {isSelectingTarget && pendingAction === 'kindle' ? 'Selecting...' : 'Kindle'}
          </button>

          <button
            onClick={handlePoisonTest}
            disabled={isProcessingEffects || isSelectingTarget}
            title="Directly apply poison status (15 damage, 3 turns)"
            className={`px-4 py-2 text-white rounded disabled:opacity-50 ${
              isSelectingTarget && pendingAction === 'poison'
                ? 'bg-blue-600 ring-2 ring-blue-400'
                : 'bg-purple-500 hover:bg-purple-600'
            }`}
          >
            🧪 {isSelectingTarget && pendingAction === 'poison' ? 'Selecting...' : 'Poison'}
          </button>

          <button
            onClick={handleHealTest}
            disabled={isProcessingEffects || playerCreatures.length === 0 || isSelectingTarget}
            title="Heal target for 25 HP (capped at max health)"
            className={`px-4 py-2 text-white rounded disabled:opacity-50 ${
              isSelectingTarget && pendingAction === 'heal'
                ? 'bg-blue-600 ring-2 ring-blue-400'
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            💚 {isSelectingTarget && pendingAction === 'heal' ? 'Selecting...' : 'Heal'}
          </button>

          <button
            onClick={handlePassiveAbilityTest}
            disabled={isProcessingEffects || playerCreatures.length === 0 || isSelectingTarget}
            title="Attack to trigger passive abilities: Golem (Stone Thorns: reflects 15 dmg), Basilisk (Poison Skin: 60% chance to poison)"
            className={`px-4 py-2 text-white rounded disabled:opacity-50 ${
              isSelectingTarget && pendingAction === 'passive-test'
                ? 'bg-blue-600 ring-2 ring-blue-400'
                : 'bg-yellow-500 hover:bg-yellow-600'
            }`}
          >
            🌿 {isSelectingTarget && pendingAction === 'passive-test' ? 'Selecting...' : 'Test Passives'}
          </button>

          {/* New Attack Type Buttons */}
          <button
            onClick={() => { setIsSelectingTarget(true); setPendingAction('stun'); }}
            data-testid="btn-stun"
            disabled={isProcessingEffects || playerCreatures.length === 0 || isSelectingTarget}
            title="Stunning Blow: 10 damage + stun (prevents action for 1 turn)"
            className={`px-4 py-2 text-white rounded disabled:opacity-50 ${
              isSelectingTarget && pendingAction === 'stun'
                ? 'bg-blue-600 ring-2 ring-blue-400'
                : 'bg-cyan-500 hover:bg-cyan-600'
            }`}
          >
            💫 {isSelectingTarget && pendingAction === 'stun' ? 'Selecting...' : 'Stun'}
          </button>


          <button
            onClick={() => { setIsSelectingTarget(true); setPendingAction('weaken'); }}
            data-testid="btn-weaken"
            disabled={isProcessingEffects || playerCreatures.length === 0 || isSelectingTarget}
            title="Sap Strength: 8 damage + reduce target attack by 5 for 3 turns"
            className={`px-4 py-2 text-white rounded disabled:opacity-50 ${
              isSelectingTarget && pendingAction === 'weaken'
                ? 'bg-blue-600 ring-2 ring-blue-400'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            ⚔️↓ {isSelectingTarget && pendingAction === 'weaken' ? 'Selecting...' : 'Weaken'}
          </button>

          <button
            onClick={() => { setIsSelectingTarget(true); setPendingAction('cleanse'); }}
            data-testid="btn-cleanse"
            disabled={isProcessingEffects || playerCreatures.length === 0 || isSelectingTarget}
            title="Purifying Strike: 5 damage + remove all debuffs from target"
            className={`px-4 py-2 text-white rounded disabled:opacity-50 ${
              isSelectingTarget && pendingAction === 'cleanse'
                ? 'bg-blue-600 ring-2 ring-blue-400'
                : 'bg-teal-500 hover:bg-teal-600'
            }`}
          >
            ✨ {isSelectingTarget && pendingAction === 'cleanse' ? 'Selecting...' : 'Cleanse'}
          </button>

          <button
            onClick={() => { setIsSelectingTarget(true); setPendingAction('buff'); }}
            data-testid="btn-buff"
            disabled={isProcessingEffects || playerCreatures.length === 0 || isSelectingTarget}
            title="Power Strike: 12 damage + gain +5 attack for 3 turns"
            className={`px-4 py-2 text-white rounded disabled:opacity-50 ${
              isSelectingTarget && pendingAction === 'buff'
                ? 'bg-blue-600 ring-2 ring-blue-400'
                : 'bg-indigo-500 hover:bg-indigo-600'
            }`}
          >
            💪 {isSelectingTarget && pendingAction === 'buff' ? 'Selecting...' : 'Power Up'}
          </button>

          <button
            onClick={() => resetBattle()}
            disabled={isProcessingEffects}
            className="px-4 py-2 bg-slate-600 text-purple-100 rounded hover:bg-slate-500 disabled:opacity-50 border border-purple-500/30"
          >
            🔄 Reset Battle
          </button>
        </div>
      </div>

      {/* Debug Info */}
      {debugInfo && (
        <div className="p-4 bg-slate-800/60 backdrop-blur-sm border border-yellow-500/30 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-yellow-300">Debug Info</h3>
          <pre className="text-xs bg-slate-900/70 text-purple-200 p-2 rounded overflow-auto border border-slate-700">
            {JSON.stringify({
              turn: debugInfo.battleState.turn,
              stateHistoryLength: debugInfo.stateHistoryLength,
              subscriberCount: debugInfo.subscriberCount,
              isProcessingEffects: debugInfo.isProcessingEffects
            }, null, 2)}
          </pre>
        </div>
      )}

      {/* CSS for animations */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        @keyframes burn {
          0%, 100% { background-color: transparent; }
          50% { background-color: rgba(255, 100, 0, 0.3); }
        }

        .shake-animation {
          animation: shake 0.3s ease-in-out;
        }

        .burn-effect {
          animation: burn 0.5s ease-in-out;
        }

        .damage-number {
          pointer-events: none;
          font-weight: bold;
          z-index: 1000;
        }
      `}</style>

      {/* Info Modal */}
      <InfoModal
        isOpen={infoModal.isOpen}
        onClose={closeModal}
        type={infoModal.type as 'status' | 'passive'}
        data={infoModal.data}
      />
    </div>
  )
}

export default BattleEngineExample