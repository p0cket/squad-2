// Quick test component to verify effect system works
import React, { useState } from 'react'
import { useBattleEngine } from '../utils/effectPipeline/hooks/useBattleEngine'
import { Creature } from '../consts/types/types'

const TestEffectSystem: React.FC = () => {
  const mockCreatures: Creature[] = [
    {
      ID: 1,
      name: 'Hero',
      icon: '🛡️',
      template: 'hero',
      health: 100,
      maxHealth: 100,
      attack: 50,
      trueDamage: 0,
      defense: 20,
      mods: [],
      startingAttacks: [],
      possibleAttacks: [],
      statuses: [],
      owner: 'player'
    },
    {
      ID: 2,
      name: 'Enemy',
      icon: '👹',
      template: 'enemy',
      health: 100,
      maxHealth: 100,
      attack: 40,
      trueDamage: 0,
      defense: 15,
      mods: [],
      startingAttacks: [],
      possibleAttacks: [],
      statuses: [],
      owner: 'computer'
    }
  ]

  const initialState = {
    playerCreatures: [mockCreatures[0]],
    computerCreatures: [mockCreatures[1]],
    mp: 100,
    turn: 1,
    battleStatus: null
  }

  const { battleState, performAttack } = useBattleEngine(initialState)
  const [log, setLog] = useState<string[]>([])

  const addLog = (message: string) => {
    console.log(`#CHECK ${message}`)
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const testAttack = async (attackType: string) => {
    console.log(`#CHECK ========== Testing ${attackType} ==========`)
    addLog(`Testing ${attackType}...`)
    try {
      await performAttack(1, 2, { template: attackType, id: attackType })
      addLog(`✅ ${attackType} executed successfully!`)
      console.log(`#CHECK ✅ ${attackType} completed successfully`)
    } catch (error) {
      addLog(`❌ ${attackType} failed: ${error}`)
      console.error(`#CHECK ❌ ${attackType} failed:`, error)
    }
  }

  const hero = battleState.playerCreatures[0]
  const enemy = battleState.computerCreatures[0]

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🧪 Effect System Test</h1>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ border: '2px solid blue', padding: '10px', borderRadius: '8px' }}>
          <h3>Hero (Player)</h3>
          <div>HP: {hero?.health}/{hero?.maxHealth}</div>
          <div>ATK: {hero?.attack}</div>
          <div>DEF: {hero?.defense}</div>
        </div>
        
        <div style={{ border: '2px solid red', padding: '10px', borderRadius: '8px' }}>
          <h3>Enemy (Computer)</h3>
          <div>HP: {enemy?.health}/{enemy?.maxHealth}</div>
          <div>ATK: {enemy?.attack}</div>
          <div>DEF: {enemy?.defense}</div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Test Attacks:</h3>
        <button onClick={() => testAttack('slash')} style={{ margin: '5px' }}>
          ⚔️ Slash (Basic)
        </button>
        <button onClick={() => testAttack('life_drain')} style={{ margin: '5px' }}>
          🩸 Life Drain
        </button>
        <button onClick={() => testAttack('poison_strike')} style={{ margin: '5px' }}>
          ☠️ Poison Strike
        </button>
        <button onClick={() => testAttack('fireball')} style={{ margin: '5px' }}>
          🔥 Fireball
        </button>
        <button onClick={() => testAttack('heal')} style={{ margin: '5px' }}>
          💚 Heal
        </button>
      </div>

      <div style={{ 
        border: '1px solid #ccc', 
        padding: '10px', 
        maxHeight: '300px', 
        overflow: 'auto',
        backgroundColor: '#f5f5f5'
      }}>
        <h3>Log:</h3>
        {log.map((entry, i) => (
          <div key={i} style={{ fontSize: '12px', marginBottom: '4px' }}>
            {entry}
          </div>
        ))}
        {log.length === 0 && <div style={{ color: '#999' }}>No actions yet. Click an attack button!</div>}
      </div>

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
        <strong>Instructions:</strong>
        <ol>
          <li>Click any attack button above</li>
          <li>Watch the HP values update</li>
          <li>Check the console for detailed logs</li>
          <li>Check the log area for execution messages</li>
        </ol>
      </div>
    </div>
  )
}

export default TestEffectSystem
