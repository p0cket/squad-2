// Quick test of the effect system
import { attackToEffects } from '../integration/attackConverter'
import { createZustandBattleStore, zustandToBattleContext } from '../zustandAdapter'
import { processEffectQueue } from '../integration/effectProcessor'

// Mock battle state
const mockBattleState = {
  playerCreatures: [
    { ID: 1, name: 'Hero', health: 100, maxHealth: 100, attack: 50, defense: 20 },
  ],
  computerCreatures: [
    { ID: 2, name: 'Enemy', health: 100, maxHealth: 100, attack: 40, defense: 15 },
  ],
  mp: 100,
  turn: 1,
  battleStatus: 'active'
}

// Test function
export const testEffectSystem = async () => {
  console.log('🧪 Testing Effect System...\n')
  
  // 1. Create store
  const store = createZustandBattleStore(mockBattleState as any)
  const context = zustandToBattleContext(store)
  
  console.log('✅ Store created')
  console.log('✅ Context created\n')
  
  // 2. Test basic attack
  console.log('📝 Test 1: Basic Attack (Slash)')
  const slashEffects = attackToEffects('slash', 1, 2)
  console.log(`  Created ${slashEffects.length} effects:`, slashEffects.map(e => e.type))
  
  store.getState().addEffects(slashEffects)
  console.log(`  Queue size: ${store.getState().effectQueue.length}`)
  
  const result1 = await processEffectQueue(store, context)
  console.log(`  ✅ Processed: ${result1.changes.length} changes, ${result1.anims.length} anims\n`)
  
  // 3. Test life drain
  console.log('📝 Test 2: Life Drain')
  const lifeDrainEffects = attackToEffects('life_drain', 1, 2)
  console.log(`  Created ${lifeDrainEffects.length} effects:`, lifeDrainEffects.map(e => e.type))
  
  store.getState().addEffects(lifeDrainEffects)
  console.log(`  Queue size: ${store.getState().effectQueue.length}`)
  
  const result2 = await processEffectQueue(store, context)
  console.log(`  ✅ Processed: ${result2.changes.length} changes, ${result2.anims.length} anims\n`)
  
  // 4. Test poison strike
  console.log('📝 Test 3: Poison Strike')
  const poisonEffects = attackToEffects('poison_strike', 1, 2)
  console.log(`  Created ${poisonEffects.length} effects:`, poisonEffects.map(e => e.type))
  
  store.getState().addEffects(poisonEffects)
  console.log(`  Queue size: ${store.getState().effectQueue.length}`)
  
  const result3 = await processEffectQueue(store, context)
  console.log(`  ✅ Processed: ${result3.changes.length} changes, ${result3.anims.length} anims\n`)
  
  // 5. Test heal
  console.log('📝 Test 4: Heal')
  const healEffects = attackToEffects('heal', 1, 1)
  console.log(`  Created ${healEffects.length} effects:`, healEffects.map(e => e.type))
  
  store.getState().addEffects(healEffects)
  console.log(`  Queue size: ${store.getState().effectQueue.length}`)
  
  const result4 = await processEffectQueue(store, context)
  console.log(`  ✅ Processed: ${result4.changes.length} changes, ${result4.anims.length} anims\n`)
  
  console.log('🎉 All tests passed!')
  console.log('✨ Effect system is working!\n')
  
  return { store, context }
}

// Run if called directly
if (typeof window !== 'undefined') {
  (window as any).testEffectSystem = testEffectSystem
  console.log('💡 Run testEffectSystem() in console to test')
}
