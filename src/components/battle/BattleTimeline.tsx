// Battle Timeline Modal - Displays the event log of the battle
import React, { useState, useEffect } from 'react'
import { battleEventLogger, BattleEvent, BattleEventType } from '../../utils/effectPipeline/eventLogger'

interface BattleTimelineProps {
  isOpen: boolean
  onClose: () => void
}

export const BattleTimeline: React.FC<BattleTimelineProps> = ({ isOpen, onClose }) => {
  const [events, setEvents] = useState<BattleEvent[]>([])
  const [filter, setFilter] = useState<BattleEventType | 'all'>('all')
  const [autoScroll, setAutoScroll] = useState(true)
  const [devMode, setDevMode] = useState(false)

  // Update events periodically
  useEffect(() => {
    if (!isOpen) return

    const updateEvents = () => {
      setEvents(battleEventLogger.getEvents(devMode))
    }

    // Initial load
    updateEvents()

    // Poll for updates every 500ms while modal is open
    const interval = setInterval(updateEvents, 500)

    return () => clearInterval(interval)
  }, [isOpen, devMode])

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (autoScroll && isOpen) {
      const container = document.getElementById('timeline-container')
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    }
  }, [events, autoScroll, isOpen])

  if (!isOpen) return null

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => e.type === filter)

  const eventTypes: (BattleEventType | 'all')[] = ['all', 'attack', 'damage', 'heal', 'status', 'death', 'trigger', 'turn', 'info']
  if (devMode) {
    eventTypes.push('effect', 'debug')
  }
  
  const eventTypeCounts: Record<string, number> = {
    all: events.length,
  }
  events.forEach(e => {
    eventTypeCounts[e.type] = (eventTypeCounts[e.type] || 0) + 1
  })

  const handleClearLog = () => {
    battleEventLogger.clearEvents()
    setEvents([])
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#1a1a2e',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '900px',
          width: '90%',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          border: '2px solid #16213e',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>
            ⏱️ Battle Timeline
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Filters */}
        <div style={{ 
          marginBottom: '16px', 
          display: 'flex', 
          gap: '8px', 
          flexWrap: 'wrap',
          paddingBottom: '12px',
          borderBottom: '1px solid #16213e'
        }}>
          {eventTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: filter === type ? '#4a5568' : '#2d3748',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: filter === type ? 'bold' : 'normal',
                transition: 'all 0.2s',
              }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)} ({eventTypeCounts[type] || 0})
            </button>
          ))}
        </div>

        {/* Controls */}
        <div style={{ marginBottom: '12px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ color: '#fff', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
            />
            Auto-scroll
          </label>
          <label style={{ 
            color: devMode ? '#fbbf24' : '#a0aec0', 
            fontSize: '14px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            padding: '4px 8px',
            backgroundColor: devMode ? 'rgba(251, 191, 36, 0.2)' : 'transparent',
            borderRadius: '4px',
            transition: 'all 0.2s'
          }}>
            <input
              type="checkbox"
              checked={devMode}
              onChange={(e) => setDevMode(e.target.checked)}
            />
            🔧 Dev Details
          </label>
          <button
            onClick={handleClearLog}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#e53e3e',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            Clear Log
          </button>
          <div style={{ color: '#a0aec0', fontSize: '12px', marginLeft: 'auto' }}>
            {filteredEvents.length} events
          </div>
        </div>

        {/* Timeline */}
        <div
          id="timeline-container"
          style={{
            flex: 1,
            overflowY: 'auto',
            backgroundColor: '#0f0f23',
            borderRadius: '8px',
            padding: '12px',
          }}
        >
          {filteredEvents.length === 0 ? (
            <div style={{ color: '#a0aec0', textAlign: 'center', padding: '40px' }}>
              No events to display. Start a battle to see events!
            </div>
          ) : (
            filteredEvents.map((event, index) => (
              <div
                key={event.id}
                style={{
                  padding: '10px 12px',
                  marginBottom: '8px',
                  backgroundColor: getEventColor(event.type),
                  borderRadius: '6px',
                  borderLeft: `4px solid ${getEventBorderColor(event.type)}`,
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  opacity: event.isDevOnly ? 0.7 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>{event.icon || '•'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff', marginBottom: '4px' }}>
                      {event.message}
                    </div>
                    {/* Attack Breakdown Table */}
                    {event.type === 'attack' && event.details?.breakdown && (
                      <div style={{
                        marginTop: '8px',
                        padding: '8px',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}>
                        <div style={{ color: '#a0aec0', marginBottom: '6px', fontWeight: 'bold' }}>📊 Damage Breakdown:</div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <tbody>
                            <tr>
                              <td style={{ padding: '4px 8px', color: '#fff' }}>{event.details.breakdown.attackName}</td>
                              <td style={{ padding: '4px 8px', color: '#63b3ed', textAlign: 'right' }}>+{event.details.breakdown.baseDamage}</td>
                              <td style={{ padding: '4px 8px', color: '#a0aec0' }}>Base damage</td>
                            </tr>
                            <tr>
                              <td style={{ padding: '4px 8px', color: '#fff' }}>{event.details.breakdown.attackerName}'s ATK</td>
                              <td style={{ padding: '4px 8px', color: '#48bb78', textAlign: 'right' }}>+{event.details.breakdown.attackerAtk}</td>
                              <td style={{ padding: '4px 8px', color: '#a0aec0' }}>Bonus damage</td>
                            </tr>
                            <tr>
                              <td style={{ padding: '4px 8px', color: '#fff' }}>{event.details.breakdown.targetName}'s DEF</td>
                              <td style={{ padding: '4px 8px', color: '#fc8181', textAlign: 'right' }}>-{event.details.breakdown.targetDef}</td>
                              <td style={{ padding: '4px 8px', color: '#a0aec0' }}>Reduced</td>
                            </tr>
                            <tr style={{ borderTop: '1px solid #4a5568' }}>
                              <td style={{ padding: '6px 8px', color: '#fbbf24', fontWeight: 'bold' }}>Total</td>
                              <td style={{ padding: '6px 8px', color: '#fbbf24', fontWeight: 'bold', textAlign: 'right' }}>{event.details.breakdown.totalDamage}</td>
                              <td style={{ padding: '6px 8px', color: '#a0aec0' }}>Damage dealt</td>
                            </tr>
                          </tbody>
                        </table>
                        <div style={{ marginTop: '8px', color: '#fc8181', fontSize: '11px' }}>
                          💔 HP: {event.details.breakdown.targetOldHp} → {event.details.breakdown.targetNewHp}
                        </div>
                      </div>
                    )}
                    {/* Dev Message - shown when devMode is on (for non-attack events) */}
                    {devMode && event.devMessage && event.type !== 'attack' && (
                      <div style={{ 
                        color: '#fbbf24', 
                        fontSize: '11px', 
                        marginBottom: '4px',
                        padding: '6px 8px',
                        backgroundColor: 'rgba(251, 191, 36, 0.1)',
                        borderRadius: '4px',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace'
                      }}>
                        {event.devMessage}
                      </div>
                    )}
                    <div style={{ color: '#a0aec0', fontSize: '11px' }}>
                      {new Date(event.timestamp).toLocaleTimeString()} • #{index + 1}
                      {event.isDevOnly && <span style={{ color: '#fbbf24', marginLeft: '8px' }}>(dev)</span>}
                    </div>
                    {devMode && event.details && (
                      <details style={{ marginTop: '8px', color: '#cbd5e0' }}>
                        <summary style={{ cursor: 'pointer', fontSize: '11px' }}>
                          Show raw data
                        </summary>
                        <pre style={{ 
                          fontSize: '10px', 
                          marginTop: '4px', 
                          padding: '8px',
                          backgroundColor: 'rgba(0,0,0,0.3)',
                          borderRadius: '4px',
                          overflow: 'auto',
                          maxHeight: '150px'
                        }}>
                          {JSON.stringify(event.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function getEventColor(type: BattleEventType): string {
  switch (type) {
    case 'attack': return '#2d3748'
    case 'damage': return '#742a2a'
    case 'heal': return '#22543d'
    case 'status': return '#553c9a'
    case 'death': return '#1a202c'
    case 'effect': return '#2c5282'
    case 'trigger': return '#744210'
    case 'turn': return '#2d3748'
    case 'info': return '#1a365d'
    case 'debug': return '#1a202c'
    default: return '#2d3748'
  }
}

function getEventBorderColor(type: BattleEventType): string {
  switch (type) {
    case 'attack': return '#f56565'
    case 'damage': return '#fc8181'
    case 'heal': return '#48bb78'
    case 'status': return '#9f7aea'
    case 'death': return '#718096'
    case 'effect': return '#4299e1'
    case 'trigger': return '#f6ad55'
    case 'turn': return '#ed8936'
    case 'info': return '#63b3ed'
    case 'debug': return '#fbbf24'
    default: return '#4a5568'
  }
}
