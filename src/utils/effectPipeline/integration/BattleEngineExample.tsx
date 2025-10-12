// Example component showing how to use the Effect Pipeline System
import React from 'react'
import { useBattleEngine } from '../hooks/useBattleEngine'
import { BattleState } from '../types'
import { useDispatchContext } from '../../../GameContext'

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
    getDebugInfo
  } = useBattleEngine(exampleBattleState)

  const playerCreatures = getAliveCreatures('player')
  const computerCreatures = getAliveCreatures('computer')

  // Target selection state
  const [isSelectingTarget, setIsSelectingTarget] = React.useState(false)
  const [pendingAction, setPendingAction] = React.useState<'attack' | 'heal' | null>(null)

  const handleBurnTest = async () => {
    if (computerCreatures.length > 0) {
      await applyBurn(computerCreatures[0].ID, 10)
    }
  }

  const handlePoisonTest = async () => {
    if (computerCreatures.length > 0) {
      await applyPoison(computerCreatures[0].ID, 15)
    }
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

  // Handle clicking on a creature during target selection
  const handleCreatureClick = async (creatureId: number) => {
    if (!isSelectingTarget) return

    if (pendingAction === 'attack') {
      await executeAttack(creatureId)
    } else if (pendingAction === 'heal') {
      await executeHeal(creatureId)
    }
  }

  // Cancel target selection
  const cancelTargetSelection = () => {
    setIsSelectingTarget(false)
    setPendingAction(null)
  }

  const handlePassiveAbilityTest = async () => {
    // Attack a creature with passive abilities to trigger counter-attack
    if (playerCreatures.length > 0 && computerCreatures.length > 0) {
      // Find a creature with passive abilities
      const creatureWithPassive = computerCreatures.find(c => c.passiveAbilities && c.passiveAbilities.length > 0)
      
      if (creatureWithPassive) {
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
        await performAttack(playerCreatures[0].ID, creatureWithPassive.ID, attack)
      }
    }
  }

  const goBackToBattle = () => {
    dispatch({ type: "CHANGE_SCREEN", payload: { screen: "battle" } })
  }

  const debugInfo = getDebugInfo()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Target Selection Banner */}
      {isSelectingTarget && (
        <div className="mb-4 p-4 bg-blue-600 text-white rounded-lg shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-bold">
                {pendingAction === 'attack' ? '⚔️ Select a target to attack' : '💚 Select a target to heal'}
              </p>
              <p className="text-sm opacity-90">Click on any creature to target them</p>
            </div>
            <button
              onClick={cancelTargetSelection}
              className="px-4 py-2 bg-white text-blue-600 rounded hover:bg-gray-100 font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Effect Pipeline System Demo</h1>
        <button
          onClick={goBackToBattle}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          ← Back to Battle
        </button>
      </div>

      {/* Battle Status */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Battle Status</h2>
        {isBattleOver() ? (
          <div className="text-lg">
            Battle Over! Winner: <span className="font-bold">{getBattleWinner()}</span>
          </div>
        ) : (
          <div>Battle in progress...</div>
        )}
        {isProcessingEffects && (
          <div className="text-blue-600 font-semibold">⚡ Processing effects...</div>
        )}
      </div>

      {/* Creatures Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Player Creatures */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Player Creatures</h3>
          {battleState.playerCreatures.map(creature => (
            <div
              key={creature.ID}
              data-creature-id={creature.ID}
              onClick={() => handleCreatureClick(creature.ID)}
              className={`p-3 border rounded mb-2 transition-all ${
                creature.health <= 0 
                  ? 'opacity-50 bg-gray-200' 
                  : isSelectingTarget
                  ? 'bg-blue-50 border-blue-400 cursor-pointer hover:bg-blue-100 hover:shadow-lg'
                  : 'bg-white'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  {creature.icon} {creature.name}
                </span>
                <div className="text-sm">
                  <span className={creature.health <= 0 ? 'text-red-500' : 'text-green-600'}>
                    {creature.health}/{creature.maxHealth} HP
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                ATK: {creature.attack} | DEF: {creature.defense}
              </div>
              {creature.passiveAbilities && creature.passiveAbilities.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  {creature.passiveAbilities.map((ability) => (
                    <div key={ability.id} className="text-xs bg-yellow-100 rounded p-2 mb-1">
                      <div className="font-semibold text-yellow-900">
                        {ability.icon} {ability.name}
                      </div>
                      <div className="text-yellow-800">{ability.description}</div>
                    </div>
                  ))}
                </div>
              )}
              {creature.statuses.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {creature.statuses.map((status, idx) => (
                    <span
                      key={`${status.id}-${idx}`}
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        status.type === 'debuff'
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : status.type === 'buff'
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-gray-100 text-gray-800 border border-gray-300'
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
        <div className="p-4 bg-red-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Computer Creatures</h3>
          {battleState.computerCreatures.map(creature => (
            <div
              key={creature.ID}
              data-creature-id={creature.ID}
              onClick={() => handleCreatureClick(creature.ID)}
              className={`p-3 border rounded mb-2 transition-all ${
                creature.health <= 0 
                  ? 'opacity-50 bg-gray-200' 
                  : isSelectingTarget
                  ? 'bg-blue-50 border-blue-400 cursor-pointer hover:bg-blue-100 hover:shadow-lg'
                  : 'bg-white'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  {creature.icon} {creature.name}
                </span>
                <div className="text-sm">
                  <span className={creature.health <= 0 ? 'text-red-500' : 'text-green-600'}>
                    {creature.health}/{creature.maxHealth} HP
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                ATK: {creature.attack} | DEF: {creature.defense}
              </div>
              {creature.passiveAbilities && creature.passiveAbilities.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  {creature.passiveAbilities.map((ability) => (
                    <div key={ability.id} className="text-xs bg-yellow-100 rounded p-2 mb-1">
                      <div className="font-semibold text-yellow-900">
                        {ability.icon} {ability.name}
                      </div>
                      <div className="text-yellow-800">{ability.description}</div>
                    </div>
                  ))}
                </div>
              )}
              {creature.statuses.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {creature.statuses.map((status, idx) => (
                    <span
                      key={`${status.id}-${idx}`}
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        status.type === 'debuff'
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : status.type === 'buff'
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-gray-100 text-gray-800 border border-gray-300'
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

      {/* Action Buttons */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Test Actions</h3>
        <div className="mb-3 p-3 bg-blue-50 rounded text-sm">
          <p className="font-semibold mb-1">🌿 Passive Abilities Demo:</p>
          <p>Click "Test Passive Abilities" to attack a creature with counter-attack abilities!</p>
          <ul className="list-disc list-inside mt-1 text-xs space-y-1">
            <li><strong>Golem (Stone Thorns)</strong>: Always reflects 15 true damage back to attacker</li>
            <li><strong>Basilisk (Poison Skin)</strong>: 60% chance to poison the attacker for 8 damage</li>
          </ul>
          <p className="mt-2 text-xs text-gray-700">Watch your Dragon's HP - it will take counter-attack damage!</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleBurnTest}
            disabled={isProcessingEffects || computerCreatures.length === 0}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
          >
            🔥 Apply Burn
          </button>

          <button
            onClick={handlePoisonTest}
            disabled={isProcessingEffects || computerCreatures.length === 0}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            🧪 Apply Poison
          </button>

          <button
            onClick={handleAttackTest}
            disabled={isProcessingEffects || playerCreatures.length === 0 || isSelectingTarget}
            className={`px-4 py-2 text-white rounded disabled:opacity-50 ${
              isSelectingTarget && pendingAction === 'attack'
                ? 'bg-blue-600 ring-2 ring-blue-400'
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            ⚔️ {isSelectingTarget && pendingAction === 'attack' ? 'Selecting Target...' : 'Attack'}
          </button>

          <button
            onClick={handleHealTest}
            disabled={isProcessingEffects || playerCreatures.length === 0 || isSelectingTarget}
            className={`px-4 py-2 text-white rounded disabled:opacity-50 ${
              isSelectingTarget && pendingAction === 'heal'
                ? 'bg-blue-600 ring-2 ring-blue-400'
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            💚 {isSelectingTarget && pendingAction === 'heal' ? 'Selecting Target...' : 'Heal'}
          </button>

          <button
            onClick={handlePassiveAbilityTest}
            disabled={isProcessingEffects || playerCreatures.length === 0 || computerCreatures.length === 0}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            🌿 Test Passive Abilities (Counter-Attack)
          </button>

          <button
            onClick={() => resetBattle()}
            disabled={isProcessingEffects}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
          >
            🔄 Reset Battle
          </button>
        </div>
      </div>

      {/* Debug Info */}
      {debugInfo && (
        <div className="p-4 bg-yellow-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Debug Info</h3>
          <pre className="text-xs bg-white p-2 rounded overflow-auto">
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
    </div>
  )
}

export default BattleEngineExample