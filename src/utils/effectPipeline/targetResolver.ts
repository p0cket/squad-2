/**
 * Universal Target Resolution System
 * 
 * This module provides a single, reusable way to resolve targets for ANY effect:
 * - Attacks (single target, AOE, splash)
 * - Status effects (self, attacker, all enemies)
 * - Passive abilities (trigger source, random ally, lowest HP)
 * - Potions/items (heal target, buff team)
 * 
 * Everything uses the same target selection logic to avoid code duplication.
 */

import { BattleContext, StateChange } from './types'
import { Creature } from '../../consts/types/types'
import { getCreatureFromContext } from './effectResolver'

// ============================================================================
// TARGET SELECTOR TYPE
// ============================================================================

export type TargetSelector = 
  // ===== SPECIFIC TARGETS =====
  | 'self'                    // The creature performing the action
  | 'trigger_source'          // The creature that caused the trigger (attacker, healer, etc.)
  | 'trigger_target'          // The creature affected by the trigger (damaged, healed, etc.)
  | 'manual'                  // Manually specified target ID (for attacks)
  
  // ===== SINGLE SELECTION (returns 1 creature) =====
  | 'random_ally'             // Random allied creature (including self)
  | 'random_other_ally'       // Random allied creature (excluding self)
  | 'random_enemy'            // Random enemy creature
  | 'lowest_hp_ally'          // Ally with lowest current HP
  | 'lowest_hp_enemy'         // Enemy with lowest current HP
  | 'highest_hp_ally'         // Ally with highest current HP
  | 'highest_hp_enemy'        // Enemy with highest current HP
  | 'lowest_hp_percent_ally'  // Ally with lowest HP percentage
  | 'lowest_hp_percent_enemy' // Enemy with lowest HP percentage
  | 'highest_atk_ally'        // Ally with highest attack stat
  | 'highest_atk_enemy'       // Enemy with highest attack stat
  | 'highest_def_ally'        // Ally with highest defense stat
  | 'highest_def_enemy'       // Enemy with highest defense stat
  
  // ===== MULTI-TARGET (returns multiple creatures) =====
  | 'all_allies'              // All allied creatures (including self)
  | 'all_other_allies'        // All allied creatures (excluding self)
  | 'all_enemies'             // All enemy creatures
  | 'all_creatures'           // All creatures in battle
  | 'adjacent_allies'         // Allies adjacent to this creature (positional)
  | 'adjacent_enemies'        // Enemies adjacent to this creature (positional)
  
  // ===== CONDITIONAL SELECTION (for advanced use) =====
  | ConditionalSelector

export type ConditionalSelector = {
  type: 'conditional'
  filter: (creature: Creature, context: BattleContext) => boolean
}

// ============================================================================
// TARGET RESOLUTION PARAMETERS
// ============================================================================

export type TargetResolutionParams = {
  selector: TargetSelector
  context: BattleContext
  sourceCreatureId?: number        // The creature performing the action
  manualTargetId?: number          // For 'manual' selector
  triggerChange?: StateChange      // For 'trigger_source'/'trigger_target' selectors
}

// ============================================================================
// MAIN TARGET RESOLVER
// ============================================================================

/**
 * Resolve a target selector to actual creature IDs
 * 
 * @returns Array of creature IDs (even for single-target selectors)
 */
export const resolveTargets = (params: TargetResolutionParams): number[] => {
  const { selector, context, sourceCreatureId, manualTargetId, triggerChange } = params

  // Get source creature if provided
  const sourceCreature = sourceCreatureId 
    ? getCreatureFromContext(context, sourceCreatureId) 
    : null

  // Handle string selectors
  if (typeof selector === 'string') {
    switch (selector) {
      // ===== SPECIFIC TARGETS =====
      case 'self':
        if (!sourceCreature) {
          throw new Error('resolveTargets: "self" selector requires sourceCreatureId')
        }
        return [sourceCreature.ID]
      
      case 'trigger_source':
        if (!triggerChange?.data?.sourceCreatureId) {
          console.warn('resolveTargets: "trigger_source" requires triggerChange with sourceCreatureId')
          return []
        }
        return [triggerChange.data.sourceCreatureId]
      
      case 'trigger_target':
        if (!triggerChange?.creatureId) {
          console.warn('resolveTargets: "trigger_target" requires triggerChange with creatureId')
          return []
        }
        return [triggerChange.creatureId]
      
      case 'manual':
        if (manualTargetId === undefined) {
          throw new Error('resolveTargets: "manual" selector requires manualTargetId')
        }
        return [manualTargetId]
      
      // ===== SINGLE SELECTION =====
      case 'random_ally':
        return [selectRandomAlly(sourceCreature, context, true)]
      
      case 'random_other_ally':
        return [selectRandomAlly(sourceCreature, context, false)]
      
      case 'random_enemy':
        return [selectRandomEnemy(sourceCreature, context)]
      
      case 'lowest_hp_ally':
        return [selectLowestHpCreature(getAllies(sourceCreature, context, true))]
      
      case 'lowest_hp_enemy':
        return [selectLowestHpCreature(getEnemies(sourceCreature, context))]
      
      case 'highest_hp_ally':
        return [selectHighestHpCreature(getAllies(sourceCreature, context, true))]
      
      case 'highest_hp_enemy':
        return [selectHighestHpCreature(getEnemies(sourceCreature, context))]
      
      case 'lowest_hp_percent_ally':
        return [selectLowestHpPercentCreature(getAllies(sourceCreature, context, true))]
      
      case 'lowest_hp_percent_enemy':
        return [selectLowestHpPercentCreature(getEnemies(sourceCreature, context))]
      
      case 'highest_atk_ally':
        return [selectHighestStatCreature(getAllies(sourceCreature, context, true), 'attack')]
      
      case 'highest_atk_enemy':
        return [selectHighestStatCreature(getEnemies(sourceCreature, context), 'attack')]
      
      case 'highest_def_ally':
        return [selectHighestStatCreature(getAllies(sourceCreature, context, true), 'defense')]
      
      case 'highest_def_enemy':
        return [selectHighestStatCreature(getEnemies(sourceCreature, context), 'defense')]
      
      // ===== MULTI-TARGET =====
      case 'all_allies':
        return getAllies(sourceCreature, context, true).map(c => c.ID)
      
      case 'all_other_allies':
        return getAllies(sourceCreature, context, false).map(c => c.ID)
      
      case 'all_enemies':
        return getEnemies(sourceCreature, context).map(c => c.ID)
      
      case 'all_creatures':
        return getAllCreatures(context).map(c => c.ID)
      
      case 'adjacent_allies':
        return getAdjacentCreatures(sourceCreature, context, true).map(c => c.ID)
      
      case 'adjacent_enemies':
        return getAdjacentCreatures(sourceCreature, context, false).map(c => c.ID)
      
      default:
        throw new Error(`Unknown target selector: ${selector}`)
    }
  }

  // Handle conditional selector
  if (selector.type === 'conditional') {
    return getAllCreatures(context)
      .filter(c => selector.filter(c, context))
      .map(c => c.ID)
  }

  throw new Error(`Invalid target selector: ${JSON.stringify(selector)}`)
}

// ============================================================================
// HELPER FUNCTIONS - Get Creature Lists
// ============================================================================

const getAllies = (sourceCreature: Creature | null, context: BattleContext, includeSelf: boolean): Creature[] => {
  if (!sourceCreature) {
    throw new Error('getAllies requires sourceCreature')
  }
  
  const allies = sourceCreature.owner === 'player'
    ? context.state.playerCreatures
    : context.state.computerCreatures
  
  return includeSelf 
    ? allies.filter(c => c.health > 0)
    : allies.filter(c => c.health > 0 && c.ID !== sourceCreature.ID)
}

const getEnemies = (sourceCreature: Creature | null, context: BattleContext): Creature[] => {
  if (!sourceCreature) {
    throw new Error('getEnemies requires sourceCreature')
  }
  
  const enemies = sourceCreature.owner === 'player'
    ? context.state.computerCreatures
    : context.state.playerCreatures
  
  return enemies.filter(c => c.health > 0)
}

const getAllCreatures = (context: BattleContext): Creature[] => {
  return [
    ...context.state.playerCreatures,
    ...context.state.computerCreatures
  ].filter(c => c.health > 0)
}

const getAdjacentCreatures = (sourceCreature: Creature | null, context: BattleContext, sameTeam: boolean): Creature[] => {
  if (!sourceCreature) {
    throw new Error('getAdjacentCreatures requires sourceCreature')
  }
  
  // Get the creature list (allies or enemies)
  const creatures = sameTeam
    ? getAllies(sourceCreature, context, false) // Don't include self for adjacent
    : getEnemies(sourceCreature, context)
  
  // Get source creature's position
  const allCreatures = sourceCreature.owner === 'player'
    ? context.state.playerCreatures
    : context.state.computerCreatures
  
  const sourceIndex = allCreatures.findIndex(c => c.ID === sourceCreature.ID)
  
  // Return creatures at sourceIndex ± 1
  return creatures.filter((c, idx) => {
    const creatureIndex = allCreatures.findIndex(creature => creature.ID === c.ID)
    return Math.abs(creatureIndex - sourceIndex) === 1
  })
}

// ============================================================================
// HELPER FUNCTIONS - Single Creature Selection
// ============================================================================

const selectRandomAlly = (sourceCreature: Creature | null, context: BattleContext, includeSelf: boolean): number => {
  const allies = getAllies(sourceCreature, context, includeSelf)
  if (allies.length === 0) {
    throw new Error('No allies available for random selection')
  }
  return allies[Math.floor(Math.random() * allies.length)].ID
}

const selectRandomEnemy = (sourceCreature: Creature | null, context: BattleContext): number => {
  const enemies = getEnemies(sourceCreature, context)
  if (enemies.length === 0) {
    throw new Error('No enemies available for random selection')
  }
  return enemies[Math.floor(Math.random() * enemies.length)].ID
}

const selectLowestHpCreature = (creatures: Creature[]): number => {
  if (creatures.length === 0) {
    throw new Error('No creatures available for lowest HP selection')
  }
  return creatures.reduce((lowest, current) => 
    current.health < lowest.health ? current : lowest
  ).ID
}

const selectHighestHpCreature = (creatures: Creature[]): number => {
  if (creatures.length === 0) {
    throw new Error('No creatures available for highest HP selection')
  }
  return creatures.reduce((highest, current) => 
    current.health > highest.health ? current : highest
  ).ID
}

const selectLowestHpPercentCreature = (creatures: Creature[]): number => {
  if (creatures.length === 0) {
    throw new Error('No creatures available for lowest HP% selection')
  }
  return creatures.reduce((lowest, current) => {
    const lowestPercent = lowest.health / lowest.maxHealth
    const currentPercent = current.health / current.maxHealth
    return currentPercent < lowestPercent ? current : lowest
  }).ID
}

const selectHighestStatCreature = (creatures: Creature[], stat: 'attack' | 'defense'): number => {
  if (creatures.length === 0) {
    throw new Error(`No creatures available for highest ${stat} selection`)
  }
  return creatures.reduce((highest, current) => 
    current[stat] > highest[stat] ? current : highest
  ).ID
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Resolve to a single target (throws if selector returns multiple)
 */
export const resolveSingleTarget = (params: TargetResolutionParams): number => {
  const targets = resolveTargets(params)
  if (targets.length === 0) {
    throw new Error(`Target selector "${params.selector}" returned no targets`)
  }
  if (targets.length > 1) {
    throw new Error(`Target selector "${params.selector}" returned multiple targets, expected single`)
  }
  return targets[0]
}

/**
 * Check if a selector returns multiple targets
 */
export const isMultiTargetSelector = (selector: TargetSelector): boolean => {
  if (typeof selector !== 'string') return true // Conditional could be multi
  
  const multiTargetSelectors: string[] = [
    'all_allies',
    'all_other_allies',
    'all_enemies',
    'all_creatures',
    'adjacent_allies',
    'adjacent_enemies'
  ]
  
  return multiTargetSelectors.includes(selector)
}
