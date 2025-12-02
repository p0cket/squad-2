// Simple AI functions for autopilot battles

import { Creature, Attack } from '../../../consts/types/types'

/**
 * Select the best target from a list of creatures
 * @param targets - List of potential targets
 * @param strategy - Strategy to use ('weakest', 'strongest', 'random')
 * @returns Selected target or null if no valid targets
 */
export const selectBestTarget = (
  targets: Creature[],
  strategy: 'weakest' | 'strongest' | 'random' = 'weakest'
): Creature | null => {
  if (!targets || targets.length === 0) {
    return null
  }

  switch (strategy) {
    case 'weakest':
      // Select creature with lowest HP
      return targets.reduce((weakest, current) => 
        current.health < weakest.health ? current : weakest
      )
    
    case 'strongest':
      // Select creature with highest HP
      return targets.reduce((strongest, current) => 
        current.health > strongest.health ? current : strongest
      )
    
    case 'random':
      // Select random target
      return targets[Math.floor(Math.random() * targets.length)]
    
    default:
      return targets[0]
  }
}

/**
 * Select an attack to use
 * @param attacker - The attacking creature
 * @param target - The target creature
 * @param strategy - Strategy to use ('basic', 'strongest', 'smart')
 * @returns Selected attack
 */
export const selectAttack = (
  attacker: Creature,
  target: Creature,
  strategy: 'basic' | 'strongest' | 'smart' = 'basic'
): Attack => {
  // For now, return a basic attack structure
  // This can be enhanced to select from attacker.startingAttacks if available
  
  if (attacker.startingAttacks && attacker.startingAttacks.length > 0) {
    return attacker.startingAttacks[0]
  }
  
  // Fallback: create a basic attack from creature stats
  return {
    template: 'basic',
    name: 'Basic Attack',
    attackType: 'Physical',
    effects: [],
    chanceToLand: 0.95,
    damage: attacker.attack || 10,
    trueDamage: attacker.trueDamage || 0,
    icon: 'sword_icon',
    notes: 'Basic attack',
    cooldown: 1
  }
}
