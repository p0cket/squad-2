// Example component showing how to use the Effect Pipeline System
import React, { useState } from 'react'
import { useBattleEngine } from '../hooks/useBattleEngine'
import { BattleState } from '../types'
import { Creature } from '../../../consts/types/types'
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
import { BattleTimeline } from '../../../components/battle/BattleTimeline'
import { RewardsScreen } from '../../../components/battle/RewardsScreen'

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
    },
    {
      ID: 6,
      name: "Phoenix",
      icon: "🦅",
      template: "phoenix",
      health: 80,
      maxHealth: 80,
      attack: 20,
      trueDamage: 5,
      defense: 10,
      mods: [],
      startingAttacks: [],
      possibleAttacks: [],
      statuses: [],
      owner: "player"
    },
    {
      ID: 7,
      name: "Tortoise",
      icon: "🐢",
      template: "tortoise",
      health: 120,
      maxHealth: 120,
      attack: 10,
      trueDamage: 0,
      defense: 30,
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
    getDebugInfo,
    // Autopilot controls
    isAutopilotEnabled,
    setIsAutopilotEnabled,
    autopilotSpeed,
    setAutopilotSpeed,
    switchCreature
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

  // Creature detail modal state
  const [selectedCreatureInfo, setSelectedCreatureInfo] = useState<Creature | null>(null)
  
  // Switch animation state
  const [switchAnimation, setSwitchAnimation] = useState<'idle' | 'exiting' | 'entering'>('idle')
  const [switchingBenchIndex, setSwitchingBenchIndex] = useState<number | null>(null)
  
  // Inventory State
  const [inventory, setInventory] = useState([
    { id: 'instant-kill', name: 'Death Note', count: 10, icon: '☠️', description: 'Instantly kills the target' }
  ])
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  
  // Rewards State
  const [showRewards, setShowRewards] = useState(false)

  // Derived state
  // isProcessingEffects and isPlayerTurn are already destructured from useBattleEngine or derived above
  const [battleMenuState, setBattleMenuState] = useState<'main' | 'attack' | 'creatures' | 'items' | null>('main')
  const [selectedMenuOption, setSelectedMenuOption] = useState<number>(0)

  // Debug panel state
  const [showDebugPanel, setShowDebugPanel] = useState<boolean>(false)
  
  // Timeline modal state
  const [isTimelineOpen, setIsTimelineOpen] = useState<boolean>(false)

  // Attack shuffle state
  const [currentAttacks, setCurrentAttacks] = useState<any[]>([])
  const [isShuffling, setIsShuffling] = useState<boolean>(false)

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

  // Define all available attacks for shuffling
  const allAvailableAttacks = [
    { id: 'slash', name: 'Slash', icon: '⚔️', color: 'bg-red-500', description: 'Basic physical attack - 15 damage' },
    { id: 'heavy-strike', name: 'Heavy Strike', icon: '🔨', color: 'bg-red-600', description: 'Powerful strike - 25 damage, ignores 50% defense' },
    { id: 'true-strike', name: 'True Strike', icon: '⚡', color: 'bg-yellow-500', description: 'True damage - 20 damage, ignores ALL defense' },
    { id: 'pierce', name: 'Pierce', icon: '🗡️', color: 'bg-orange-600', description: 'Armor-piercing - 12 damage + 8 true damage' },
    { id: 'burn', name: 'Burn', icon: '🔥', color: 'bg-orange-500', description: 'Apply burn - 10 dmg/turn for 3 turns (30 total)' },
    { id: 'flameswipe', name: 'Flame Swipe', icon: '🔥💨', color: 'bg-orange-500', description: '15 damage + burn (5 dmg/turn for 3 turns)' },
    { id: 'poison', name: 'Poison', icon: '🧪', color: 'bg-purple-500', description: 'Apply poison - 15 dmg/turn for 3 turns (45 total)' },
    { id: 'toxic-bite', name: 'Toxic Bite', icon: '🦷☠️', color: 'bg-purple-600', description: '8 damage + poison (10 dmg/turn for 4 turns)' },
    { id: 'bleed', name: 'Bleed', icon: '🩸', color: 'bg-rose-600', description: '12 damage + bleeding (8 dmg/turn for 3 turns)' },
    { id: 'stun', name: 'Stun', icon: '💫', color: 'bg-cyan-500', description: '10 damage + stun (target cannot act for 1 turn)' },
    { id: 'freeze', name: 'Freeze', icon: '❄️', color: 'bg-blue-400', description: '5 damage + freeze (cannot act for 2 turns)' },
    { id: 'weaken', name: 'Weaken', icon: '⚔️↓', color: 'bg-amber-600', description: '8 damage + reduce target attack by 10 for 3 turns' },
    { id: 'shatter-armor', name: 'Shatter Armor', icon: '🛡️💥', color: 'bg-stone-600', description: '10 damage + reduce target defense by 8 for 3 turns' },
    { id: 'slow', name: 'Slow', icon: '🐌', color: 'bg-slate-500', description: 'Slow target - skips every 2nd turn for 4 turns' },
    { id: 'buff', name: 'Power Up', icon: '💪', color: 'bg-indigo-500', description: '12 damage + gain +5 attack for 3 turns (self)' },
    { id: 'shield', name: 'Shield', icon: '🛡️', color: 'bg-blue-500', description: 'Grant target +10 defense for 3 turns' }, 
    { id: 'heal', name: 'Heal', icon: '💚', color: 'bg-green-500', description: 'Restore 25 HP to target (capped at max health)' },
    { id: 'greater-heal', name: 'Greater Heal', icon: '💚✨', color: 'bg-green-600', description: 'Restore 50 HP to target (capped at max health)' },
    { id: 'lifedrain', name: 'Life Drain', icon: '🩸💚', color: 'bg-fuchsia-600', description: '18 damage + heal self for 50% of damage dealt' },
    { id: 'execute', name: 'Execute', icon: '⚔️💀', color: 'bg-red-700', description: 'Deals 30 damage, double if target below 25% health' }
  ]

  // Shuffle attacks - pick 4 random
  const shuffleAttacks = () => {
    setIsShuffling(true)
    
    // Shuffle animation delay
    setTimeout(() => {
      const shuffled = [...allAvailableAttacks].sort(() => Math.random() - 0.5)
      const selected = shuffled.slice(0, 4)
      setCurrentAttacks(selected)
      setIsShuffling(false)
    }, 300)
  }

  // Initialize attacks on mount
  React.useEffect(() => {
    shuffleAttacks()
  }, [])


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
  }

  // Handle clicking on a creature during target selection
  const handleCreatureClick = async (creatureId: number) => {
    // Handle Instant Kill Item
    if (selectedItem === 'instant-kill') {
      console.log(`☠️ Using Death Note on creature ${creatureId}`)
      
      // Get the active player creature as the "attacker"
      const activeCreature = battleState.playerCreatures[0]
      if (!activeCreature) {
        console.error('No active creature to use item from')
        return
      }
      
      // Create a custom "Instant Death" attack payload
      const deathAttack = {
        id: 'death-note',
        name: 'Death Note',
        damage: 9999,
        type: 'true' as const,
        targetType: 'single' as const,
        accuracy: 100,
        cooldown: 0,
        cost: 0,
        description: 'The end is nigh.',
        visualEffect: 'darkness'
      }
      
      // Execute the attack with active creature as attacker
      await performAttack(activeCreature.ID, creatureId, deathAttack)
      
      // Decrement inventory
      setInventory(prev => prev.map(item => 
        item.id === 'instant-kill' ? { ...item, count: item.count - 1 } : item
      ))
      
      // Reset state
      setSelectedItem(null)
      setIsSelectingTarget(false)
      setBattleMenuState('main')
      return
    }
    
    // Handle regular attacks
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

  // Handler for Item Selection
  const handleItemSelect = (itemId: string) => {
    setSelectedItem(itemId)
    if (itemId === 'instant-kill') {
      setIsSelectingTarget(true)
      setPendingAction(null) // Clear any pending attack
      setBattleMenuState('main')
    }
  }




  const debugInfo = getDebugInfo()

  // Get turn state from battleState (no longer local state)
  const isPlayerTurn = battleState.currentTurnOwner === 'player'

  const handleEndTurn = async () => {
    await endTurn()
  }

  const handleSwitch = async (index: number, consumeTurn: boolean) => {
    // 1. Exit animation
    setSwitchingBenchIndex(index)
    setSwitchAnimation('exiting')
    await new Promise(resolve => setTimeout(resolve, 500))

    // 2. Perform switch
    await switchCreature('player', index)
    setSwitchingBenchIndex(null)
    
    // 3. Enter animation (Start state)
    setSwitchAnimation('entering')
    // Short delay to allow render of start state
    await new Promise(resolve => setTimeout(resolve, 50))
    
    // 4. Reset animation (Trigger entry transition)
    setSwitchAnimation('idle')
    setBattleMenuState('main')
    // Wait for entry animation to complete
    await new Promise(resolve => setTimeout(resolve, 500))

    // 5. End turn if requested
    if (consumeTurn) {
      await endTurn()
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Victory/Defeat Screen Overlay */}
      {(battleState.battleStatus === 'victory' || battleState.battleStatus === 'defeat') && (
        <BattleResultScreen
          result={battleState.battleStatus}
          onRestart={() => {
            console.log('🔄 Restarting battle...')
            resetBattle()
          }}
          onNextLevel={battleState.battleStatus === 'victory' ? () => {
            setShowRewards(true)
          } : undefined}
        />
      )}

      {/* Turn Transition Animation */}
      <TurnTransition 
        turnOwner={battleState.currentTurnOwner} 
        turnNumber={battleState.turn} 
      />



      {/* Fresh Header Bar */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="bg-slate-900/90 backdrop-blur-md border border-purple-500/30 rounded-lg p-3 flex items-center justify-between shadow-lg">
          {/* Title */}
          <div className="font-bold text-purple-200 tracking-wide">
            BATTLE SYSTEM DEMO
          </div>

          {/* Status & Controls */}
          <div className="flex items-center gap-4">
            {/* Turn Info */}
            <div className="flex items-center gap-3 text-sm font-medium text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-md border border-slate-700/50">
              <span>Turn <span className="text-white font-bold">{battleState.turn}</span></span>
              <span className="text-slate-600">•</span>
              <span className={`uppercase font-bold ${battleState.currentTurnOwner === 'player' ? 'text-green-400' : 'text-red-400'}`}>
                {battleState.currentTurnOwner} Phase
              </span>
            </div>

            {/* End Turn Button */}
            <button
              onClick={handleEndTurn}
              disabled={!isPlayerTurn || isProcessingEffects}
              className={`
                px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all
                ${!isPlayerTurn || isProcessingEffects
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-red-600 hover:bg-red-500 text-white border border-red-500 hover:border-red-400 shadow-lg shadow-red-900/20'
                }
              `}
            >
              End Turn
            </button>

            {/* Auto Battle Button */}
            <button
              onClick={() => setIsAutopilotEnabled(!isAutopilotEnabled)}
              disabled={isProcessingEffects || (isBattleOver() ? true : false)}
              className={`
                px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all
                ${isAutopilotEnabled
                  ? 'bg-green-600 hover:bg-green-500 text-white border border-green-500 shadow-lg shadow-green-900/30 animate-pulse'
                  : 'bg-purple-600 hover:bg-purple-500 text-white border border-purple-500 hover:border-purple-400 shadow-lg shadow-purple-900/20'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              data-testid="autopilot-toggle"
            >
              🤖 {isAutopilotEnabled ? 'AUTO: ON' : 'AUTO'}
            </button>

            {/* Speed Selector (shown when autopilot is on) */}
            {isAutopilotEnabled && (
              <select
                value={autopilotSpeed}
                onChange={(e) => setAutopilotSpeed(Number(e.target.value))}
                className="px-2 py-1 rounded-md text-xs bg-slate-800 text-white border border-green-500/50 cursor-pointer"
              >
                <option value={0}>⚡ Instant</option>
                <option value={500}>🏃 Fast</option>
                <option value={1000}>🚶 Normal</option>
                <option value={2000}>🐌 Slow</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Creatures Display - Active + Team Layout */}
      <div className="mb-4 space-y-4 max-w-2xl mx-auto">
        {/* Enemy Section (Top) */}
        <div className="relative">
          {/* Enemy Team Background Boxes */}
          <div className="flex gap-2 mb-2 justify-center">
            {battleState.computerCreatures.map((creature, idx) => {
              const isActive = idx === 0;
              const hpPercent = (creature.health / creature.maxHealth) * 100;
              
              return (
                <div
                  key={creature.ID}
                  data-creature-id={creature.ID}
                  data-testid="team-box"
                  onClick={() => {
                    if (!isSelectingTarget) {
                      setSelectedCreatureInfo(creature);
                    } else {
                      handleCreatureClick(creature.ID);
                    }
                  }}
                  className={`${isActive ? 'hidden' : ''} relative p-2 rounded-lg border-2 transition-all cursor-pointer ${
                    creature.health <= 0
                      ? 'opacity-40 bg-slate-900/30 border-slate-700'
                      : isSelectingTarget
                      ? 'bg-red-900/40 border-red-400 hover:scale-105'
                      : 'bg-slate-900/60 border-red-500/50 hover:border-red-400'
                  }`}
                  style={{ width: '80px' }}
                >
                  <div className="text-2xl text-center mb-1">{creature.icon}</div>
                  <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${hpPercent > 50 ? 'bg-green-500' : hpPercent > 25 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.max(0, hpPercent)}%` }}
                    />
                  </div>
                  <div className="text-[8px] text-center text-slate-400 mt-0.5">{creature.health}/{creature.maxHealth}</div>
                  {/* Summary row for passives/statuses */}
                  <div className="flex flex-wrap justify-center gap-0.5 mt-1">
                    {creature.passiveAbilities?.map((p) => (
                      <span key={p.id} className="text-[10px]" title={p.name}>{p.icon}</span>
                    ))}
                    {creature.statuses?.map((s, idx) => (
                      <span key={`${s.id}-${idx}`} className="text-[10px]" title={`${s.name} (${s.duration})`}>{s.icon}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Enemy Creature */}
          {battleState.computerCreatures[0] && (() => {
            const creature = battleState.computerCreatures[0];
            const hpPercent = (creature.health / creature.maxHealth) * 100;
            const getHPColor = () => {
              if (hpPercent > 66) return 'from-green-500 to-emerald-600';
              if (hpPercent > 33) return 'from-amber-500 to-orange-600';
              return 'from-red-500 to-rose-600';
            };

            return (
              <div
                data-testid="creature-card"
                data-creature-name={creature.name}
                data-creature-id={creature.ID}
                onClick={() => {
                  if (!isSelectingTarget) {
                    setSelectedCreatureInfo(creature);
                  } else {
                    handleCreatureClick(creature.ID);
                  }
                }}
                className={`relative p-4 rounded-xl transition-all duration-300 mx-auto max-w-md border-4 ${
                  creature.health <= 0
                    ? 'opacity-50 bg-slate-900/50 border-slate-700'
                    : isSelectingTarget
                    ? 'bg-gradient-to-br from-red-900/70 via-red-800/50 to-red-900/70 border-red-400 cursor-pointer hover:scale-[1.03] shadow-2xl shadow-red-500/40'
                    : 'bg-gradient-to-br from-slate-900/90 via-purple-900/30 to-slate-900/90 border-red-500/60 hover:border-red-400 cursor-pointer shadow-xl'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-5xl">{creature.icon}</span>
                    <div>
                      <div className="font-bold text-lg text-red-300 uppercase tracking-wide">{creature.name}</div>
                      <div className="flex gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded text-xs bg-red-500/30 border border-red-500/50 text-red-200 font-bold">
                          ⚔️ {creature.attack}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs bg-blue-500/30 border border-blue-500/50 text-blue-200 font-bold">
                          🛡️ {creature.defense}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-400">Enemy</div>
                </div>

                {/* Passive Abilities - Own Line */}
                {creature.passiveAbilities && creature.passiveAbilities.length > 0 && (
                  <div className="mb-2">
                    {creature.passiveAbilities.map((ability) => (
                      <div 
                        key={ability.id}
                        onClick={(e) => { e.stopPropagation(); handlePassiveClick(ability, e); }}
                        className="text-xs bg-yellow-600/20 border border-yellow-500/40 rounded px-2 py-1 cursor-pointer hover:bg-yellow-600/30 transition-all inline-flex items-center gap-1 mr-1"
                      >
                        <span className="text-sm">{ability.icon}</span>
                        <span className="text-yellow-200 font-semibold">{ability.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* HP Bar */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-300 uppercase">HP</span>
                    <span className={`text-sm font-bold ${creature.health <= 0 ? 'text-red-400' : hpPercent > 66 ? 'text-green-400' : hpPercent > 33 ? 'text-amber-400' : 'text-red-400'}`}>
                      {creature.health} / {creature.maxHealth}
                    </span>
                  </div>
                  <div className="h-4 bg-slate-800 rounded-lg overflow-hidden border-2 border-slate-700 shadow-inner">
                    <div 
                      className={`h-full bg-gradient-to-r ${getHPColor()} transition-all duration-500 shadow-lg relative`}
                      style={{ width: `${Math.max(0, hpPercent)}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20"></div>
                    </div>
                  </div>
                </div>

                {/* Status Effects */}
                {creature.statuses.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {creature.statuses.map((status, idx) => (
                      <span
                        key={`${status.id}-${idx}`}
                        onClick={(e) => { e.stopPropagation(); handleStatusClick(status, e); }}
                        className={`px-2 py-1 rounded text-xs font-bold cursor-pointer ${
                          status.type === 'debuff' ? 'bg-red-500/30 border border-red-400/50 text-red-200' :
                          status.type === 'buff' ? 'bg-green-500/30 border border-green-400/50 text-green-200' :
                          'bg-slate-500/30 border border-slate-400/50 text-slate-200'
                        }`}
                      >
                        {status.icon} ({status.duration})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Player Section (Bottom) */}
        <div className="relative">
          {/* Active Player Creature */}
          {battleState.playerCreatures[0] && (() => {
            const creature = battleState.playerCreatures[0];
            const hpPercent = (creature.health / creature.maxHealth) * 100;
            const getHPColor = () => {
              if (hpPercent > 66) return 'from-green-500 to-emerald-600';
              if (hpPercent > 33) return 'from-amber-500 to-orange-600';
              return 'from-red-500 to-rose-600';
            };

            return (
              <div
                data-testid="creature-card"
                data-creature-name={creature.name}
                data-creature-id={creature.ID}
                onClick={() => {
                  if (!isSelectingTarget) {
                    setSelectedCreatureInfo(creature);
                  } else {
                    handleCreatureClick(creature.ID);
                  }
                }}
                className={`relative p-4 rounded-xl transition-all duration-500 ease-out mx-auto max-w-md border-4 transform origin-bottom ${
                  creature.health <= 0
                    ? 'opacity-50 bg-slate-900/50 border-slate-700'
                    : isSelectingTarget
                    ? 'bg-gradient-to-br from-blue-900/70 via-blue-800/50 to-blue-900/70 border-blue-400 cursor-pointer hover:scale-[1.03] shadow-2xl shadow-blue-500/40'
                    : 'bg-gradient-to-br from-slate-900/90 via-purple-900/30 to-slate-900/90 border-blue-500/60 hover:border-blue-400 cursor-pointer shadow-xl'
                }
                ${switchAnimation === 'exiting' ? 'scale-75 opacity-0 translate-y-20' : ''}
                ${switchAnimation === 'entering' ? 'scale-75 opacity-0 translate-y-20' : ''}
                ${switchAnimation === 'idle' ? 'scale-100 opacity-100 translate-y-0' : ''}
                `}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-5xl">{creature.icon}</span>
                    <div>
                      <div className="font-bold text-lg text-blue-300 uppercase tracking-wide">{creature.name}</div>
                      <div className="flex gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded text-xs bg-red-500/30 border border-red-500/50 text-red-200 font-bold">
                          ⚔️ {creature.attack}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs bg-blue-500/30 border border-blue-500/50 text-blue-200 font-bold">
                          🛡️ {creature.defense}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-400">Yours</div>
                </div>

                {/* Passive Abilities - Own Line */}
                {creature.passiveAbilities && creature.passiveAbilities.length > 0 && (
                  <div className="mb-2">
                    {creature.passiveAbilities.map((ability) => (
                      <div 
                        key={ability.id}
                        onClick={(e) => { e.stopPropagation(); handlePassiveClick(ability, e); }}
                        className="text-xs bg-yellow-600/20 border border-yellow-500/40 rounded px-2 py-1 cursor-pointer hover:bg-yellow-600/30 transition-all inline-flex items-center gap-1 mr-1"
                      >
                        <span className="text-sm">{ability.icon}</span>
                        <span className="text-yellow-200 font-semibold">{ability.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* HP Bar */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-300 uppercase">HP</span>
                    <span className={`text-sm font-bold ${creature.health <= 0 ? 'text-red-400' : hpPercent > 66 ? 'text-green-400' : hpPercent > 33 ? 'text-amber-400' : 'text-red-400'}`}>
                      {creature.health} / {creature.maxHealth}
                    </span>
                  </div>
                  <div className="h-4 bg-slate-800 rounded-lg overflow-hidden border-2 border-slate-700 shadow-inner">
                    <div 
                      className={`h-full bg-gradient-to-r ${getHPColor()} transition-all duration-500 shadow-lg relative`}
                      style={{ width: `${Math.max(0, hpPercent)}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20"></div>
                    </div>
                  </div>
                </div>

                {/* Status Effects */}
                {creature.statuses.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {creature.statuses.map((status, idx) => (
                      <span
                        key={`${status.id}-${idx}`}
                        onClick={(e) => { e.stopPropagation(); handleStatusClick(status, e); }}
                        className={`px-2 py-1 rounded text-xs font-bold cursor-pointer ${
                          status.type === 'debuff' ? 'bg-red-500/30 border border-red-400/50 text-red-200' :
                          status.type === 'buff' ? 'bg-green-500/30 border border-green-400/50 text-green-200' :
                          'bg-slate-500/30 border border-slate-400/50 text-slate-200'
                        }`}
                      >
                        {status.icon} ({status.duration})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Player Team Background Boxes */}
          <div className="flex gap-2 mt-2 justify-center">
            {battleState.playerCreatures.map((creature, idx) => {
              const isActive = idx === 0;
              const hpPercent = (creature.health / creature.maxHealth) * 100;
              
              return (
                <div
                  key={creature.ID}
                  data-creature-id={creature.ID}
                  data-testid="team-box"
                  onClick={() => {
                    if (!isSelectingTarget) {
                      setSelectedCreatureInfo(creature);
                    } else {
                      handleCreatureClick(creature.ID);
                    }
                  }}
                  className={`${isActive ? 'hidden' : ''} relative p-2 rounded-lg border-2 transition-all duration-500 cursor-pointer ${
                    creature.health <= 0
                      ? 'opacity-40 bg-slate-900/30 border-slate-700'
                      : isSelectingTarget
                      ? 'bg-blue-900/40 border-blue-400 hover:scale-105'
                      : 'bg-slate-900/60 border-blue-500/50 hover:border-blue-400'
                  }
                  ${switchingBenchIndex === idx && switchAnimation === 'exiting'
                    ? 'scale-125 -translate-y-20 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)] z-20 bg-blue-900/80 opacity-0'
                    : ''}
                  `}
                  style={{ width: '80px' }}
                >
                  <div className="text-2xl text-center mb-1">{creature.icon}</div>
                  <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${hpPercent > 50 ? 'bg-green-500' : hpPercent > 25 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.max(0, hpPercent)}%` }}
                    />
                  </div>
                  <div className="text-[8px] text-center text-slate-400 mt-0.5">{creature.health}/{creature.maxHealth}</div>
                  {/* Summary row for passives/statuses */}
                  <div className="flex flex-wrap justify-center gap-0.5 mt-1">
                    {creature.passiveAbilities?.map((p) => (
                      <span key={p.id} className="text-[10px]" title={p.name}>{p.icon}</span>
                    ))}
                    {creature.statuses?.map((s, idx) => (
                      <span key={`${s.id}-${idx}`} className="text-[10px]" title={`${s.name} (${s.duration})`}>{s.icon}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Battle Menu - Integrated Below Player */}
      {battleMenuState && (
        <div className="mb-4 max-w-2xl mx-auto" style={{ minHeight: '400px' }}>
          {/* Targeting State - Show Attack Details */}
          {isSelectingTarget && pendingAction && (
            <div className="bg-slate-900 border-4 border-purple-500/60 rounded-xl overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-purple-900/80 to-purple-800/80 px-4 py-2 border-b-2 border-purple-500/60">
                <div className="text-sm font-bold text-purple-200 uppercase">Select Target</div>
              </div>
              <div className="p-4">
                {(() => {
                  const selectedAttack = allAvailableAttacks.find(a => a.id === pendingAction)
                  if (!selectedAttack) return null
                  
                  return (
                    <div>
                      {/* Attack Info Card */}
                      <div className={`${selectedAttack.color} rounded-lg p-4 mb-4`}>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-5xl">{selectedAttack.icon}</span>
                          <div>
                            <div className="text-xl font-bold text-white uppercase">{selectedAttack.name}</div>
                            <div className="text-sm text-white/80">{selectedAttack.description}</div>
                          </div>
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-3 mb-4">
                        <div className="text-sm text-blue-200">
                          👆 <span className="font-bold">Click a target</span> to use this attack
                        </div>
                      </div>

                      {/* Cancel Button */}
                      <button
                        onClick={() => {
                          setIsSelectingTarget(false)
                          setPendingAction(null)
                          setBattleMenuState('attack')
                        }}
                        className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-all border-2 border-slate-500"
                      >
                        ✕ Cancel
                      </button>
                    </div>
                  )
                })()}
              </div>
            </div>
          )}

          {battleMenuState === 'main' && !isSelectingTarget && (
            <div className="bg-slate-900 border-4 border-purple-500/60 rounded-xl overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-900/80 to-purple-800/80 px-4 py-2 border-b-2 border-purple-500/60">
                <div className="text-sm font-bold text-purple-200 uppercase">
                  What will {battleState.playerCreatures[0]?.name || 'you'} do?
                </div>
              </div>

              {/* Menu Grid - 2x2 */}
              <div className="grid grid-cols-2 gap-0">
                {/* ATTACK */}
                <button
                  onClick={() => setBattleMenuState('attack')}
                  onMouseEnter={() => setSelectedMenuOption(0)}
                  className={`relative px-6 py-12 text-left font-bold uppercase border-r-2 border-b-2 border-purple-500/40 transition-all ${
                    selectedMenuOption === 0
                      ? 'bg-purple-700/40 text-purple-100'
                      : 'bg-slate-800/60 text-purple-300 hover:bg-purple-800/30'
                  }`}
                >
                  {selectedMenuOption === 0 && <span className="absolute left-2 text-purple-300">►</span>}
                  <span className="ml-6">Attack</span>
                </button>

                {/* CREATURES */}
                <button
                  onClick={() => setBattleMenuState('creatures')}
                  onMouseEnter={() => setSelectedMenuOption(1)}
                  className={`relative px-6 py-12 text-left font-bold uppercase border-b-2 border-purple-500/40 transition-all ${
                    selectedMenuOption === 1
                      ? 'bg-purple-700/40 text-purple-100'
                      : 'bg-slate-800/60 text-purple-300 hover:bg-purple-800/30'
                  }`}
                >
                  {selectedMenuOption === 1 && <span className="absolute left-2 text-purple-300">►</span>}
                  <span className="ml-6">Creatures</span>
                </button>

                {/* USE ITEM */}
                <button
                  onClick={() => setBattleMenuState('items')}
                  onMouseEnter={() => setSelectedMenuOption(2)}
                  className={`relative px-6 py-12 text-left font-bold uppercase border-r-2 border-purple-500/40 transition-all ${
                    selectedMenuOption === 2
                      ? 'bg-purple-700/40 text-purple-100'
                      : 'bg-slate-800/60 text-purple-300 hover:bg-purple-800/30'
                  }`}
                >
                  {selectedMenuOption === 2 && <span className="absolute left-2 text-purple-300">►</span>}
                  <span className="ml-6">Use Item</span>
                </button>

                {/* FLEE */}
                <button
                  onClick={() => alert('Flee functionality coming soon!')}
                  onMouseEnter={() => setSelectedMenuOption(3)}
                  className={`relative px-6 py-12 text-left font-bold uppercase transition-all ${
                    selectedMenuOption === 3
                      ? 'bg-purple-700/40 text-purple-100'
                      : 'bg-slate-800/60 text-purple-300 hover:bg-purple-800/30'
                  }`}
                >
                  {selectedMenuOption === 3 && <span className="absolute left-2 text-purple-300">►</span>}
                  <span className="ml-6">Flee</span>
                </button>
              </div>
            </div>
          )}

          {/* Attack Submenu */}
          {battleMenuState === 'attack' && (
            <div className="bg-slate-900 border-4 border-purple-500/60 rounded-xl overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-purple-900/80 to-purple-800/80 px-4 py-2 border-b-2 border-purple-500/60 flex items-center justify-between">
                <div className="text-sm font-bold text-purple-200 uppercase">Choose Attack</div>
                <button
                  onClick={() => setBattleMenuState('main')}
                  className="text-purple-300 hover:text-purple-100 font-bold"
                >
                  ✕ Back
                </button>
              </div>
              <div className="p-4">
                {/* Shuffle Button */}
                <button
                  onClick={shuffleAttacks}
                  disabled={isShuffling}
                  className="w-full mb-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span className={`text-lg ${isShuffling ? 'animate-spin' : ''}`}>🎲</span>
                  <span>{isShuffling ? 'Shuffling...' : 'Shuffle Attacks'}</span>
                </button>

                {/* 4 Attack Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {currentAttacks.map((attack, idx) => (
                    <button
                      key={`${attack.id}-${idx}`}
                      onClick={() => {
                        handleAttackSelect(attack.id)
                        setBattleMenuState('main')
                      }}
                      className={`
                        relative p-4 rounded-lg text-white font-bold transition-all duration-300
                        ${attack.color} hover:scale-105 hover:shadow-xl
                        animate-slide-in
                      `}
                      style={{
                        animationDelay: `${idx * 75}ms`
                      }}
                    >
                      <div className="text-4xl mb-2">{attack.icon}</div>
                      <div className="text-sm">{attack.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Creatures Submenu */}
          {battleMenuState === 'creatures' && (
            <div className="bg-slate-900 border-4 border-purple-500/60 rounded-xl overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-purple-900/80 to-purple-800/80 px-4 py-2 border-b-2 border-purple-500/60 flex items-center justify-between">
                <div className="text-sm font-bold text-purple-200 uppercase">Your Team</div>
                <button
                  onClick={() => setBattleMenuState('main')}
                  className="text-purple-300 hover:text-purple-100 font-bold"
                >
                  ✕ Back
                </button>
              </div>
              <div className="p-3 space-y-2">
                {battleState.playerCreatures.map((creature, index) => {
                  const isActive = index === 0
                  const isAlive = creature.health > 0
                  const hpPercent = (creature.health / creature.maxHealth) * 100
                  
                  return (
                    <div 
                      key={creature.ID}
                      className={`
                        flex items-center p-3 rounded-lg border-2 transition-all duration-500
                        ${isActive 
                          ? 'bg-blue-900/40 border-blue-500/50' 
                          : 'bg-slate-800/60 border-slate-700'}
                        ${switchingBenchIndex === index && switchAnimation === 'exiting'
                          ? 'scale-110 -translate-y-10 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)] z-20 bg-blue-900/60 opacity-0'
                          : ''}
                      `}
                    >
                      <div className="text-3xl mr-4">{creature.icon}</div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className={`font-bold ${isActive ? 'text-blue-300' : 'text-slate-200'}`}>
                            {creature.name}
                          </span>
                          {isActive && (
                            <span className="text-[10px] uppercase font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded">
                              Active
                            </span>
                          )}
                        </div>
                        <div className={`
                  relative z-10 transition-all duration-500 ease-out transform origin-bottom
                  ${switchAnimation === 'exiting' ? 'scale-75 opacity-0 translate-y-20' : ''}
                  ${switchAnimation === 'entering' ? 'scale-75 opacity-0 translate-y-20' : ''}
                  ${switchAnimation === 'idle' ? 'scale-100 opacity-100 translate-y-0' : ''}
                `}>
                  <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${isAlive ? 'bg-green-500' : 'bg-red-900'}`}
                              style={{ width: `${hpPercent}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">
                            {creature.health}/{creature.maxHealth}
                          </span>
                        </div>
                      </div>
                      </div>



                      {!isActive && (
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => isAlive && handleSwitch(index, false)}
                            disabled={!isAlive || switchAnimation !== 'idle'}
                            className={`
                              px-3 py-1.5 rounded text-xs font-bold transition-all
                              ${isAlive && switchAnimation === 'idle'
                                ? 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-500'
                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'}
                            `}
                          >
                            Free Switch
                          </button>
                          <button
                            onClick={() => isAlive && handleSwitch(index, true)}
                            disabled={!isAlive || switchAnimation !== 'idle'}
                            className={`
                              px-3 py-1.5 rounded text-xs font-bold transition-all
                              ${isAlive && switchAnimation === 'idle'
                                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20'
                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'}
                            `}
                          >
                            Switch (End Turn)
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Items Submenu */}
          {battleMenuState === 'items' && (
            <div className="bg-slate-900 border-4 border-purple-500/60 rounded-xl overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-purple-900/80 to-purple-800/80 px-4 py-2 border-b-2 border-purple-500/60 flex items-center justify-between">
                <div className="text-sm font-bold text-purple-200 uppercase">Items</div>
                <button
                  onClick={() => setBattleMenuState('main')}
                  className="text-purple-300 hover:text-purple-100 font-bold"
                >
                  ✕ Back
                </button>
              </div>
              <div className="p-3">
                <div className="grid grid-cols-1 gap-2">
                  {inventory.map(item => (
                    <button
                      key={item.id}
                      onClick={() => item.count > 0 && handleItemSelect(item.id)}
                      disabled={item.count === 0}
                      className={`
                        flex items-center justify-between p-3 rounded-lg border-2 transition-all text-left
                        ${selectedItem === item.id 
                          ? 'bg-purple-900/60 border-purple-400 shadow-lg shadow-purple-500/20' 
                          : 'bg-slate-800/60 border-slate-700 hover:border-purple-500/50 hover:bg-slate-800/80'}
                        ${item.count === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <div className="font-bold text-purple-200">{item.name}</div>
                          <div className="text-xs text-slate-400">{item.description}</div>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-purple-300 bg-purple-900/40 px-2 py-1 rounded">
                        x{item.count}
                      </div>
                    </button>
                  ))}
                  {inventory.length === 0 && (
                    <div className="text-sm text-purple-300 text-center py-4">
                      No items available
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rewards Screen Overlay */}
      {showRewards && (
        <RewardsScreen
          onSelect={(reward) => {
            console.log('🎁 Reward selected:', reward)
            setShowRewards(false)
            alert(`You selected: ${reward.name}!`)
            // Here you would typically add the reward to the player's state
            resetBattle()
          }}
        />
      )}

      {/* Debug Panel Toggle & Timeline Button */}
      <div className="mb-4 flex justify-center gap-3">
        <button
          onClick={() => setIsTimelineOpen(true)}
          className="px-4 py-2 bg-blue-600 text-blue-100 rounded-lg hover:bg-blue-500 border border-blue-400 transition-all flex items-center gap-2"
          data-testid="timeline-button"
        >
          ⏱️ Battle Log
        </button>
        <button
          onClick={() => setShowDebugPanel(!showDebugPanel)}
          className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 border border-slate-500 transition-all"
        >
          🔧 {showDebugPanel ? 'Hide' : 'Show'} Developer Tools
        </button>
      </div>

      {/* Debug Panel - Collapsible */}
      {showDebugPanel && (
        <div className="mb-6 p-4 bg-slate-800/60 backdrop-blur-sm border-2 border-amber-500/40 rounded-lg">
          <h2 className="text-xl font-semibold mb-3 text-amber-300 flex items-center gap-2">
            <span>🔧</span> Developer Tools
          </h2>
          <p className="text-sm text-amber-200/80 mb-4">
            These controls are for testing and development only
          </p>
        
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

        {/* Debug Info */}
        {debugInfo && (
          <div className="mt-4 p-4 bg-slate-800/60 backdrop-blur-sm border border-yellow-500/30 rounded-lg">
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

        @keyframes flip {
          0% {
            transform: rotateY(0deg) scale(1);
            opacity: 1;
          }
          50% {
            transform: rotateY(90deg) scale(0.8);
            opacity: 0.5;
          }
          100% {
            transform: rotateY(0deg) scale(1);
            opacity: 1;
          }
        }

        @keyframes slideIn {
          0% {
            transform: translateY(20px) scale(0.8);
            opacity: 0;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        .shake-animation {
          animation: shake 0.3s ease-in-out;
        }

        .burn-effect {
          animation: burn 0.5s ease-in-out;
        }

        .animate-flip {
          animation: flip 0.6s ease-in-out;
        }

        .animate-slide-in {
          animation: slideIn 0.4s ease-out forwards;
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

      {/* Creature Detail Modal */}
      {selectedCreatureInfo && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCreatureInfo(null)}
        >
          <div 
            className="bg-slate-900 border-4 border-purple-500/50 rounded-xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-6xl">{selectedCreatureInfo.icon}</span>
                <div>
                  <div className="font-bold text-2xl text-purple-200 uppercase">{selectedCreatureInfo.name}</div>
                  <div className="text-sm text-slate-400">{selectedCreatureInfo.owner === 'player' ? 'Your Creature' : 'Enemy Creature'}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCreatureInfo(null)}
                className="text-slate-400 hover:text-white text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-800 border border-red-500/50 rounded-lg p-3 text-center">
                <div className="text-xs text-slate-400 uppercase">Attack</div>
                <div className="text-2xl font-bold text-red-400">⚔️ {selectedCreatureInfo.attack}</div>
              </div>
              <div className="bg-slate-800 border border-blue-500/50 rounded-lg p-3 text-center">
                <div className="text-xs text-slate-400 uppercase">Defense</div>
                <div className="text-2xl font-bold text-blue-400">🛡️ {selectedCreatureInfo.defense}</div>
              </div>
              <div className="bg-slate-800 border border-green-500/50 rounded-lg p-3 text-center">
                <div className="text-xs text-slate-400 uppercase">HP</div>
                <div className="text-2xl font-bold text-green-400">{selectedCreatureInfo.health}/{selectedCreatureInfo.maxHealth}</div>
              </div>
            </div>

            {/* Passive Abilities */}
            {selectedCreatureInfo.passiveAbilities && selectedCreatureInfo.passiveAbilities.length > 0 && (
              <div className="mb-4">
                <div className="text-sm font-bold text-yellow-300 uppercase mb-2">⚡ Passive Abilities</div>
                {selectedCreatureInfo.passiveAbilities.map((ability: any) => (
                  <div 
                    key={ability.id}
                    className="bg-yellow-600/20 border border-yellow-500/40 rounded-lg p-3 mb-2"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{ability.icon}</span>
                      <span className="font-bold text-yellow-200">{ability.name}</span>
                    </div>
                    <div className="text-sm text-yellow-100/80">{ability.description}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Status Effects */}
            {selectedCreatureInfo.statuses && selectedCreatureInfo.statuses.length > 0 && (
              <div>
                <div className="text-sm font-bold text-purple-300 uppercase mb-2">✨ Status Effects</div>
                <div className="flex flex-wrap gap-2">
                  {selectedCreatureInfo.statuses.map((status: any, idx: number) => (
                    <div
                      key={`${status.id}-${idx}`}
                      className={`px-3 py-2 rounded-lg border-2 text-sm font-bold ${
                        status.type === 'debuff' ? 'bg-red-500/30 border-red-400/50 text-red-200' :
                        status.type === 'buff' ? 'bg-green-500/30 border-green-400/50 text-green-200' :
                        'bg-slate-500/30 border-slate-400/50 text-slate-200'
                      }`}
                    >
                      {status.icon} {status.name} ({status.duration})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Battle Timeline Modal */}
      <BattleTimeline
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
      />
    </div>
  )
}

export default BattleEngineExample