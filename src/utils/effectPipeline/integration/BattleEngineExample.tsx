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

  const handleAttackTest = async () => {
    if (playerCreatures.length > 0 && computerCreatures.length > 0) {
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
      await performAttack(playerCreatures[0].ID, computerCreatures[0].ID, attack)
    }
  }

  const handleHealTest = async () => {
    if (playerCreatures.length > 0) {
      await performHealing(playerCreatures[0].ID, playerCreatures[0].ID, 25)
    }
  }

  const goBackToBattle = () => {
    dispatch({ type: "CHANGE_SCREEN", payload: { screen: "battle" } })
  }

  const debugInfo = getDebugInfo()

  return (
    <div className="p-6 max-w-4xl mx-auto">
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
              className={`p-3 border rounded mb-2 ${creature.health <= 0 ? 'opacity-50 bg-gray-200' : 'bg-white'}`}
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
              className={`p-3 border rounded mb-2 ${creature.health <= 0 ? 'opacity-50 bg-gray-200' : 'bg-white'}`}
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
            disabled={isProcessingEffects || playerCreatures.length === 0 || computerCreatures.length === 0}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            ⚔️ Attack
          </button>

          <button
            onClick={handleHealTest}
            disabled={isProcessingEffects || playerCreatures.length === 0}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            💚 Heal
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