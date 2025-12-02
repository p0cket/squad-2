// Event Logger - Tracks battle events in human-readable format
import { StateChange, HealthChange, StatusChange, Effect } from './types'

export type BattleEventType = 'attack' | 'damage' | 'heal' | 'status' | 'death' | 'effect' | 'turn' | 'trigger' | 'info' | 'debug'

export type BattleEvent = {
  id: string
  timestamp: number
  type: BattleEventType
  message: string          // Player-facing message
  devMessage?: string      // Developer-level detail (shown in dev mode)
  details?: any            // Raw data for inspection
  icon?: string
  isDevOnly?: boolean      // If true, only show when dev mode is on
}

// Attack context for rich logging
export type AttackContext = {
  attackerName: string
  targetName: string
  attackName: string
  baseDamage: number
  attackerAtk: number
  targetDef: number
  totalDamage: number
  targetOldHp: number
  targetNewHp: number
}

class EventLogger {
  private events: BattleEvent[] = []
  private eventIdCounter = 0

  /**
   * Log a complete attack with full context (player-friendly)
   */
  logAttack(context: AttackContext): void {
    const { attackerName, targetName, attackName, baseDamage, attackerAtk, targetDef, totalDamage, targetOldHp, targetNewHp } = context
    
    // Build breakdown as structured data for table rendering
    const breakdown = {
      attackName,
      baseDamage,
      attackerName,
      attackerAtk,
      targetName,
      targetDef,
      totalDamage,
      targetOldHp,
      targetNewHp
    }
    
    this.addEvent({
      id: `event-${this.eventIdCounter++}`,
      timestamp: Date.now(),
      type: 'attack',
      icon: '⚔️',
      message: `${attackerName} used ${attackName} on ${targetName} for ${totalDamage} damage!`,
      devMessage: `HP: ${targetOldHp} → ${targetNewHp}`,
      details: { breakdown, raw: context }
    })
  }

  /**
   * Log a triggered effect (like burn tick, passive ability, etc)
   */
  logTrigger(triggerName: string, targetName: string, effectDescription: string, devDetails?: string): void {
    this.addEvent({
      id: `event-${this.eventIdCounter++}`,
      timestamp: Date.now(),
      type: 'trigger',
      icon: '🔥',
      message: `${triggerName} triggered on ${targetName}: ${effectDescription}`,
      devMessage: devDetails,
      isDevOnly: false
    })
  }

  /**
   * Log status effect application
   */
  logStatusApplied(targetName: string, statusName: string, duration?: number, source?: string): void {
    const durationText = duration ? ` (${duration} turns)` : ''
    this.addEvent({
      id: `event-${this.eventIdCounter++}`,
      timestamp: Date.now(),
      type: 'status',
      icon: '✨',
      message: `${statusName} applied to ${targetName}${durationText}`,
      devMessage: source ? `Source: ${source}` : undefined
    })
  }

  /**
   * Log status effect removal
   */
  logStatusRemoved(targetName: string, statusName: string, reason?: string): void {
    this.addEvent({
      id: `event-${this.eventIdCounter++}`,
      timestamp: Date.now(),
      type: 'status',
      icon: '🔚',
      message: `${statusName} wore off from ${targetName}`,
      devMessage: reason
    })
  }

  /**
   * Log status tick damage/heal (like burn, poison, regen)
   */
  logStatusTick(targetName: string, statusName: string, value: number, isHeal: boolean = false): void {
    const icon = isHeal ? '💚' : '🔥'
    const action = isHeal ? 'healed' : 'took'
    const suffix = isHeal ? 'HP' : 'damage'
    
    this.addEvent({
      id: `event-${this.eventIdCounter++}`,
      timestamp: Date.now(),
      type: isHeal ? 'heal' : 'damage',
      icon,
      message: `${targetName} ${action} ${Math.abs(value)} ${suffix} from ${statusName}`
    })
  }

  /**
   * Log creature death
   */
  logDeath(creatureName: string, killerName?: string): void {
    this.addEvent({
      id: `event-${this.eventIdCounter++}`,
      timestamp: Date.now(),
      type: 'death',
      icon: '💀',
      message: killerName 
        ? `${creatureName} was defeated by ${killerName}!`
        : `${creatureName} was defeated!`
    })
  }

  /**
   * Log turn change
   */
  logTurnStart(turnNumber: number, owner: 'player' | 'computer'): void {
    const ownerDisplay = owner === 'player' ? 'Your' : "Enemy's"
    this.addEvent({
      id: `event-${this.eventIdCounter++}`,
      timestamp: Date.now(),
      type: 'turn',
      icon: '🔄',
      message: `Turn ${turnNumber} - ${ownerDisplay} turn`
    })
  }

  /**
   * Log heal
   */
  logHeal(targetName: string, amount: number, source: string): void {
    this.addEvent({
      id: `event-${this.eventIdCounter++}`,
      timestamp: Date.now(),
      type: 'heal',
      icon: '💚',
      message: `${targetName} healed ${amount} HP from ${source}`
    })
  }

  /**
   * Log a passive ability trigger
   */
  logPassive(creatureName: string, abilityName: string, effectDescription: string): void {
    this.addEvent({
      id: `event-${this.eventIdCounter++}`,
      timestamp: Date.now(),
      type: 'trigger',
      icon: '⚡',
      message: `${creatureName}'s ${abilityName}: ${effectDescription}`
    })
  }

  /**
   * Log info message (player-facing)
   */
  logInfo(message: string, icon: string = 'ℹ️'): void {
    this.addEvent({
      id: `event-${this.eventIdCounter++}`,
      timestamp: Date.now(),
      type: 'info',
      icon,
      message
    })
  }

  /**
   * Log debug message (dev-only)
   */
  logDebug(message: string, details?: any): void {
    this.addEvent({
      id: `event-${this.eventIdCounter++}`,
      timestamp: Date.now(),
      type: 'debug',
      icon: '🔧',
      message,
      details,
      isDevOnly: true
    })
  }

  /**
   * Log a state change as a battle event (fallback for unhandled changes)
   */
  logStateChange(change: StateChange, creatureName?: string): void {
    const event = this.stateChangeToEvent(change, creatureName)
    if (event) {
      this.addEvent(event)
    }
  }

  /**
   * Log multiple state changes
   */
  logStateChanges(changes: StateChange[], creatureNames?: Map<number, string>): void {
    changes.forEach(change => {
      const name = creatureNames?.get(change.creatureId)
      this.logStateChange(change, name)
    })
  }

  /**
   * Log an effect being processed (dev-only)
   */
  logEffect(effect: Effect): void {
    this.addEvent({
      id: `event-${this.eventIdCounter++}`,
      timestamp: effect.timestamp,
      type: 'effect',
      message: `Processing ${effect.type} effect`,
      devMessage: `Priority: ${effect.priority}`,
      details: effect,
      icon: '⚙️',
      isDevOnly: true
    })
  }

  /**
   * Log a custom message
   */
  logMessage(type: BattleEventType, message: string, icon?: string, details?: any): void {
    this.addEvent({
      id: `event-${this.eventIdCounter++}`,
      timestamp: Date.now(),
      type,
      message,
      details,
      icon
    })
  }

  /**
   * Get all logged events
   */
  getEvents(includeDevOnly: boolean = false): BattleEvent[] {
    if (includeDevOnly) {
      return [...this.events]
    }
    return this.events.filter(e => !e.isDevOnly)
  }

  /**
   * Clear all events
   */
  clearEvents(): void {
    this.events = []
    this.eventIdCounter = 0
  }

  /**
   * Get events filtered by type
   */
  getEventsByType(type: BattleEventType): BattleEvent[] {
    return this.events.filter(e => e.type === type)
  }

  private addEvent(event: BattleEvent): void {
    this.events.push(event)
    
    // Limit event history to prevent memory issues (keep last 200 events)
    if (this.events.length > 200) {
      this.events.shift()
    }
  }

  private stateChangeToEvent(change: StateChange, creatureName?: string): BattleEvent | null {
    const eventId = `event-${this.eventIdCounter++}`
    const timestamp = change.timestamp
    const displayName = creatureName || `Creature ${change.creatureId}`

    switch (change.type) {
      case 'HEALTH_CHANGE': {
        const healthChange = change as HealthChange
        const delta = healthChange.data.delta
        const isDamage = delta < 0
        
        return {
          id: eventId,
          timestamp,
          type: isDamage ? 'damage' : 'heal',
          message: isDamage
            ? `${displayName} took ${Math.abs(delta)} damage`
            : `${displayName} healed ${delta} HP`,
          devMessage: `Source: ${healthChange.data.source}`,
          details: healthChange.data,
          icon: isDamage ? '💥' : '💚'
        }
      }

      case 'STATUS_APPLIED': {
        const statusChange = change as StatusChange
        return {
          id: eventId,
          timestamp,
          type: 'status',
          message: `${statusChange.data.statusId} applied to ${displayName}`,
          details: statusChange.data,
          icon: '✨'
        }
      }

      case 'STATUS_REMOVED': {
        const statusChange = change as StatusChange
        return {
          id: eventId,
          timestamp,
          type: 'status',
          message: `${statusChange.data.statusId} wore off from ${displayName}`,
          details: statusChange.data,
          icon: '🔚'
        }
      }

      case 'CREATURE_DIED': {
        return {
          id: eventId,
          timestamp,
          type: 'death',
          message: `${displayName} was defeated!`,
          details: change.data,
          icon: '💀'
        }
      }

      case 'CREATURE_MOVED': {
        return {
          id: eventId,
          timestamp,
          type: 'info',
          message: `${displayName} position changed`,
          devMessage: `Reason: ${change.data.reason}`,
          details: change.data,
          icon: '🔄',
          isDevOnly: true
        }
      }

      case 'STAT_MODIFIED': {
        return {
          id: eventId,
          timestamp,
          type: 'info',
          message: `${displayName}'s ${change.data.statName} changed by ${change.data.value > 0 ? '+' : ''}${change.data.value}`,
          details: change.data,
          icon: '📊'
        }
      }

      default:
        return null
    }
  }
}

// Global singleton instance
export const battleEventLogger = new EventLogger()
