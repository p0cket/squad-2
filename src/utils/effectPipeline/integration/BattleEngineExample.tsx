// Example component showing how to use the Effect Pipeline System
import React, { useState } from 'react'
import { useBattleEngine } from '../hooks/useBattleEngine'
import { BattleState } from '../types'
import { useDispatchContext } from '../../../GameContext'
import { InfoModal } from '../../../components/battle/InfoModal'
import { AttackShowcase } from '../../../components/battle/AttackShowcase'
import {
  createStunAttack,
  createFreezeAttack,
  createSlowAttack,
  createSilenceAttack,
  createWeakeningAttack,
  createBurnAttack,
  createBuffingAttack,
  createCleanseAttack,
  // Batch 2 attack factories
  createVulnerableAttack,
  createThornsAttack,
  createLeechAttack,
  createEvasionAttack,
  createReflectAttack
} from '../effects/attackFactories'
import { BattleResultScreen } from '../../../components/battle/BattleResultScreen'
import { TurnTransition } from '../../../components/battle/TurnTransition'

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
  turn: 1,
  currentTurnOwner: 'player',
  battleStatus: 'in-progress'
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
    applyRegeneration,
    applyShield,
    performAttack,
    performHeal,
    getAliveCreatures,
    isBattleOver,
    getBattleWinner,
    resetBattle,
    endTurn,
    getDebugInfo
  } = useBattleEngine(exampleBattleState)

  const playerCreatures = getAliveCreatures('player')
  // const computerCreatures = getAliveCreatures('computer') // Not currently used

  // Target selection state
  const [isSelectingTarget, setIsSelectingTarget] = React.useState(false)
  const [pendingAction, setPendingAction] = React.useState<string | null>(null)

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
      await performHeal(playerCreatures[0].ID, targetId, 25)
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

  // Execute bleed on selected target
  const executeBleedAttack = async (targetId: number) => {
    if (playerCreatures.length > 0) {
      const attack = {
        ID: 'bleed-attack',
        name: "Bleed",
        template: 'bleed',
        attackType: 'physical',
        damage: 12,
        effects: ['bleed'], // This will apply the BLEED status
        chanceToLand: 1,
        trueDamage: 0,
        icon: "🩸",
        notes: "Physical attack dealing 12 damage and causing bleeding (7 dmg/turn for 3 turns)",
        cooldown: 0
      }
      await performAttack(playerCreatures[0].ID, targetId, attack)
      setIsSelectingTarget(false)
      setPendingAction(null)
    }
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

  const executeFlameSwipeAttack = async (targetId: number) => {
    if (playerCreatures.length > 0) {
      const attack = createBurnAttack("Flame Swipe", 15)
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

  // Execute new status effect attacks
  const executeFreezeAttack = async (targetId: number) => {
    if (playerCreatures.length > 0) {
      const attack = createFreezeAttack("Ice Blast", 5)
      await performAttack(playerCreatures[0].ID, targetId, attack)
      setIsSelectingTarget(false)
      setPendingAction(null)
    }
  }

  const executeSlowAttack = async (targetId: number) => {
    if (playerCreatures.length > 0) {
      const attack = createSlowAttack("Time Warp", 0)
      await performAttack(playerCreatures[0].ID, targetId, attack)
      setIsSelectingTarget(false)
      setPendingAction(null)
    }
  }

  const executeSilenceAttack = async (targetId: number) => {
    if (playerCreatures.length > 0) {
      const attack = createSilenceAttack("Mute", 0)
      await performAttack(playerCreatures[0].ID, targetId, attack)
      setIsSelectingTarget(false)
      setPendingAction(null)
    }
  }

  // Execute Batch 2 status effect attacks
  const executeVulnerableAttack = async (targetId: number) => {
    if (playerCreatures.length > 0) {
      const attack = createVulnerableAttack("Expose Weakness", 12)
      await performAttack(playerCreatures[0].ID, targetId, attack)
      setIsSelectingTarget(false)
      setPendingAction(null)
    }
  }

  const executeThornsAttack = async (targetId: number) => {
    if (playerCreatures.length > 0) {
      const attack = createThornsAttack("Thorn Shield", 8)
      await performAttack(playerCreatures[0].ID, targetId, attack)
      setIsSelectingTarget(false)
      setPendingAction(null)
    }
  }

  const executeLeechAttack = async (targetId: number) => {
    if (playerCreatures.length > 0) {
      const attack = createLeechAttack("Vampiric Strike", 18)
      await performAttack(playerCreatures[0].ID, targetId, attack)
      setIsSelectingTarget(false)
      setPendingAction(null)
    }
  }

  const executeEvasionAttack = async (targetId: number) => {
    if (playerCreatures.length > 0) {
      const attack = createEvasionAttack("Blur", 5)
      await performAttack(playerCreatures[0].ID, targetId, attack)
      setIsSelectingTarget(false)
      setPendingAction(null)
    }
  }

  const executeReflectAttack = async (targetId: number) => {
    if (playerCreatures.length > 0) {
      const attack = createReflectAttack("Mirror Image", 6)
      await performAttack(playerCreatures[0].ID, targetId, attack)
      setIsSelectingTarget(false)
      setPendingAction(null)
    }
  }

  // Execute cleanse (remove all debuffs from target)
  const executeCleanse = async (targetId: number) => {
    if (playerCreatures.length > 0) {
      const attack = createCleanseAttack("Cleanse", 0, "✨", 4)
      await performAttack(playerCreatures[0].ID, targetId, attack)
      setIsSelectingTarget(false)
      setPendingAction(null)
    }
  }  // Handle clicking on a creature during target selection
  const handleCreatureClick = async (creatureId: number) => {
    if (!isSelectingTarget || !pendingAction) return

    console.log(`🎯 Executing attack: ${pendingAction} on creature ${creatureId}`)

    // Handle implemented attacks
    switch (pendingAction) {
      case 'attack':
      case 'slash':
        await executeAttack(creatureId)
        break
      case 'heal':
      case 'greater-heal':
        await executeHeal(creatureId)
        break
      case 'burn':
        await executeBurn(creatureId)
        break
      case 'kindle':
        await executeKindle(creatureId)
        break
      case 'poison':
      case 'toxic-bite':
        await executePoison(creatureId)
        break
      case 'bleed':
      case 'lacerate':
        await executeBleedAttack(creatureId)
        break
      case 'passive-test':
        await executePassiveTest(creatureId)
        break
      case 'stun':
        await executeStunAttack(creatureId)
        break
      case 'freeze':
        await executeFreezeAttack(creatureId)
        break
      case 'slow':
        await executeSlowAttack(creatureId)
        break
      case 'silence':
        await executeSilenceAttack(creatureId)
        break
      case 'weaken':
      case 'shatter-armor':
        await executeWeakenAttack(creatureId)
        break
      case 'flameswipe':
      case 'inferno':
        await executeFlameSwipeAttack(creatureId)
        break
      case 'buff':
      case 'fortify':
      case 'haste':
        await executeBuffAttack(creatureId)
        break
      case 'regeneration':
        await applyRegeneration(creatureId, 10)
        setIsSelectingTarget(false)
        setPendingAction(null)
        break
      case 'shield':
        await applyShield(creatureId, 20)
        setIsSelectingTarget(false)
        setPendingAction(null)
        break
      case 'cleanse':
        await executeCleanse(creatureId)
        break
      
      // Batch 2 effects
      case 'vulnerable':
      case 'expose-weakness':
        await executeVulnerableAttack(creatureId)
        break
      case 'thorns':
      case 'thorn-shield':
        await executeThornsAttack(creatureId)
        break
      case 'leech':
      case 'vampiric-strike':
        await executeLeechAttack(creatureId)
        break
      case 'evasion':
      case 'blur':
        await executeEvasionAttack(creatureId)
        break
      case 'reflect':
      case 'mirror-image':
        await executeReflectAttack(creatureId)
        break
      
      // Placeholder for unimplemented attacks
      default:
        console.log(`⚠️ Attack "${pendingAction}" not yet implemented`)
        // Still clear the selection so UI doesn't get stuck
        setIsSelectingTarget(false)
        setPendingAction(null)
        break
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

  // Handler for AttackShowcase component
  const handleAttackSelect = (attackId: string) => {
    setIsSelectingTarget(true)
    setPendingAction(attackId)
  }

  const goBackToBattle = () => {
    dispatch({ type: "CHANGE_SCREEN", payload: { screen: "battle" } })
  }

  const debugInfo = getDebugInfo()

  // Get turn state from battleState (no longer local state)
  const isPlayerTurn = battleState.currentTurnOwner === 'player'

  const handleEndTurn = async () => {
    await endTurn()
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Victory/Defeat Screen Overlay */}
      {battleState.battleStatus && battleState.battleStatus !== 'in-progress' && (
        <BattleResultScreen
          result={battleState.battleStatus}
          onRestart={() => {
            console.log('🔄 Restarting battle...')
            resetBattle()
          }}
          onNextLevel={battleState.battleStatus === 'victory' ? () => {
            console.log('➡️ Next level! (Not implemented yet)')
            // TODO: Implement level progression
            alert('Next level feature coming soon!')
          } : undefined}
        />
      )}

      {/* Turn Transition Animation */}
      <TurnTransition 
        turnOwner={battleState.currentTurnOwner} 
        turnNumber={battleState.turn} 
      />

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
                {pendingAction === 'flameswipe' && '🔥 Select a target for flame swipe (15 dmg + burn)'}
                {pendingAction === 'buff' && '💪 Select a target for power strike (12 dmg + gain attack buff)'}
                {pendingAction === 'regeneration' && '💚 Select a target to grant regeneration (10 HP/turn for 3 turns)'}
                {pendingAction === 'shield' && '🛡️ Select a target to grant shield (20 shield for 3 turns)'}
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
            <div className="text-sm text-slate-300" data-testid="turn-counter">Turn: <span className="font-semibold text-purple-100">{battleState.turn}</span></div>
            <div className="text-sm text-slate-300" data-testid="turn-owner">Owner: <span className="font-semibold text-purple-100">{battleState.currentTurnOwner || 'none'}</span></div>
            <button
              onClick={handleEndTurn}
              disabled={!isPlayerTurn || isProcessingEffects}
              className={`ml-4 px-3 py-1 rounded ${
                !isPlayerTurn || isProcessingEffects
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
              } text-white`}
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

      {/* Creatures Display - Vertical Layout */}
      <div className="mb-4 space-y-3">
        {/* Computer Creatures (Top) */}
        <div className="p-3 bg-slate-800/60 backdrop-blur-sm border border-red-500/30 rounded-lg">
          <h3 className="text-sm font-semibold mb-2 text-red-300 flex items-center gap-1.5">
            <span className="text-base">🤖</span> Enemy Creatures
          </h3>
          {battleState.computerCreatures.map(creature => {
            const hpPercent = (creature.health / creature.maxHealth) * 100;
            const getHPColor = () => {
              if (hpPercent > 66) return 'from-green-500 to-emerald-600';
              if (hpPercent > 33) return 'from-amber-500 to-orange-600';
              return 'from-red-500 to-rose-600';
            };
            
            return (
              <div
                key={creature.ID}
                data-testid="creature-card"
                data-creature-name={creature.name}
                data-creature-id={creature.ID}
                onClick={() => handleCreatureClick(creature.ID)}
                className={`relative p-2.5 rounded-lg mb-2 transition-all duration-300 ${
                  creature.health <= 0 
                    ? 'opacity-50 bg-slate-900/50 border border-slate-700' 
                    : isSelectingTarget
                    ? 'bg-gradient-to-br from-red-900/60 via-red-800/40 to-red-900/60 border-2 border-red-400 cursor-pointer hover:scale-[1.02] hover:shadow-xl hover:shadow-red-500/30 transform'
                    : 'bg-gradient-to-br from-slate-900/90 via-purple-900/20 to-slate-900/90 border border-slate-600/50 hover:border-red-500/50'
                }`}
              >
                {/* Header - Horizontal Layout */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl">{creature.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-purple-100 truncate">{creature.name}</div>
                    <div className="flex gap-1.5 mt-0.5">
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 border border-red-500/40 text-red-200 font-semibold">
                        ⚔️{creature.attack}
                      </span>
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 border border-blue-500/40 text-blue-200 font-semibold">
                        🛡️{creature.defense}
                      </span>
                    </div>
                  </div>
                  {/* HP inline */}
                  <div className="text-right">
                    <div className={`text-xs font-bold ${creature.health <= 0 ? 'text-red-400' : hpPercent > 66 ? 'text-green-400' : hpPercent > 33 ? 'text-amber-400' : 'text-red-400'}`} data-testid="creature-health">
                      {creature.health}/{creature.maxHealth}
                    </div>
                    <div className="w-16 h-1.5 bg-slate-700/50 rounded-full overflow-hidden border border-slate-600/50 mt-0.5">
                      <div 
                        className={`h-full bg-gradient-to-r ${getHPColor()} transition-all duration-500`}
                        style={{ width: `${Math.max(0, hpPercent)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Passive Abilities - Compact */}
                {creature.passiveAbilities && creature.passiveAbilities.length > 0 && (
                  <div className="mb-1.5">
                    {creature.passiveAbilities.map((ability) => (
                      <div 
                        key={ability.id} 
                        onClick={(e) => handlePassiveClick(ability, e)}
                        className="text-[10px] bg-gradient-to-r from-yellow-500/15 to-amber-500/15 hover:from-yellow-500/25 hover:to-amber-500/25 border border-yellow-500/40 rounded px-2 py-1 mb-1 cursor-pointer transition-all group"
                      >
                        <div className="font-semibold text-yellow-200 group-hover:text-yellow-100 flex items-center gap-1">
                          <span className="text-xs">{ability.icon}</span>
                          <span className="truncate flex-1">{ability.name}</span>
                          <span className="text-yellow-400/70">ⓘ</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Status Effects - Inline */}
                {creature.statuses.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {creature.statuses.map((status, idx) => (
                      <span
                        key={`${status.id}-${idx}`}
                        data-testid="status-badge"
                        data-status-id={status.id}
                        onClick={(e) => handleStatusClick(status, e)}
                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition-all hover:scale-105 ${
                          status.type === 'debuff'
                            ? 'bg-red-500/30 text-red-200 border border-red-400/50'
                            : status.type === 'buff'
                            ? 'bg-green-500/30 text-green-200 border border-green-400/50'
                            : 'bg-slate-500/30 text-slate-200 border border-slate-400/50'
                        }`}
                      >
                        <span className="text-xs">{status.icon}</span>
                        <span className="opacity-70">({status.duration})</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Player Creatures (Bottom) */}
        <div className="p-3 bg-slate-800/60 backdrop-blur-sm border border-blue-500/30 rounded-lg">
          <h3 className="text-sm font-semibold mb-2 text-blue-300 flex items-center gap-1.5">
            <span className="text-base">👤</span> Your Creatures
          </h3>
          {battleState.playerCreatures.map(creature => {
            const hpPercent = (creature.health / creature.maxHealth) * 100;
            const getHPColor = () => {
              if (hpPercent > 66) return 'from-green-500 to-emerald-600';
              if (hpPercent > 33) return 'from-amber-500 to-orange-600';
              return 'from-red-500 to-rose-600';
            };
            
            return (
              <div
                key={creature.ID}
                data-testid="creature-card"
                data-creature-name={creature.name}
                data-creature-id={creature.ID}
                onClick={() => handleCreatureClick(creature.ID)}
                className={`relative p-2.5 rounded-lg mb-2 transition-all duration-300 ${
                  creature.health <= 0 
                    ? 'opacity-50 bg-slate-900/50 border border-slate-700' 
                    : isSelectingTarget
                    ? 'bg-gradient-to-br from-blue-900/60 via-blue-800/40 to-blue-900/60 border-2 border-blue-400 cursor-pointer hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/30 transform'
                    : 'bg-gradient-to-br from-slate-900/90 via-purple-900/20 to-slate-900/90 border border-slate-600/50 hover:border-blue-500/50'
                }`}
              >
                {/* Header - Horizontal Layout */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl">{creature.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-purple-100 truncate">{creature.name}</div>
                    <div className="flex gap-1.5 mt-0.5">
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 border border-red-500/40 text-red-200 font-semibold">
                        ⚔️{creature.attack}
                      </span>
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 border border-blue-500/40 text-blue-200 font-semibold">
                        🛡️{creature.defense}
                      </span>
                    </div>
                  </div>
                  {/* HP inline */}
                  <div className="text-right">
                    <div className={`text-xs font-bold ${creature.health <= 0 ? 'text-red-400' : hpPercent > 66 ? 'text-green-400' : hpPercent > 33 ? 'text-amber-400' : 'text-red-400'}`} data-testid="creature-health">
                      {creature.health}/{creature.maxHealth}
                    </div>
                    <div className="w-16 h-1.5 bg-slate-700/50 rounded-full overflow-hidden border border-slate-600/50 mt-0.5">
                      <div 
                        className={`h-full bg-gradient-to-r ${getHPColor()} transition-all duration-500`}
                        style={{ width: `${Math.max(0, hpPercent)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Passive Abilities - Compact */}
                {creature.passiveAbilities && creature.passiveAbilities.length > 0 && (
                  <div className="mb-1.5">
                    {creature.passiveAbilities.map((ability) => (
                      <div 
                        key={ability.id} 
                        onClick={(e) => handlePassiveClick(ability, e)}
                        className="text-[10px] bg-gradient-to-r from-yellow-500/15 to-amber-500/15 hover:from-yellow-500/25 hover:to-amber-500/25 border border-yellow-500/40 rounded px-2 py-1 mb-1 cursor-pointer transition-all group"
                      >
                        <div className="font-semibold text-yellow-200 group-hover:text-yellow-100 flex items-center gap-1">
                          <span className="text-xs">{ability.icon}</span>
                          <span className="truncate flex-1">{ability.name}</span>
                          <span className="text-yellow-400/70">ⓘ</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Status Effects - Inline */}
                {creature.statuses.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {creature.statuses.map((status, idx) => (
                      <span
                        key={`${status.id}-${idx}`}
                        data-testid="status-badge"
                        data-status-id={status.id}
                        onClick={(e) => handleStatusClick(status, e)}
                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition-all hover:scale-105 ${
                          status.type === 'debuff'
                            ? 'bg-red-500/30 text-red-200 border border-red-400/50'
                            : status.type === 'buff'
                            ? 'bg-green-500/30 text-green-200 border border-green-400/50'
                            : 'bg-slate-500/30 text-slate-200 border border-slate-400/50'
                        }`}
                      >
                        <span className="text-xs">{status.icon}</span>
                        <span className="opacity-70">({status.duration})</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Attack Showcase */}
      <div className="mb-6 p-4 bg-slate-800/60 backdrop-blur-sm border border-purple-500/30 rounded-lg">
        <h2 className="text-xl font-semibold mb-3 text-purple-200">Attack Showcase</h2>
        <p className="text-sm text-purple-300 mb-4">Hover over buttons to see attack details • Click to select target</p>
        
        <AttackShowcase
          onAttackSelect={handleAttackSelect}
          isSelectingTarget={isSelectingTarget}
          selectedAction={pendingAction}
          isDisabled={isProcessingEffects || playerCreatures.length === 0 || isSelectingTarget}
          attacker={playerCreatures[0]}
        />

        <div className="flex gap-2 mt-4 pt-4 border-t border-purple-500/30">
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