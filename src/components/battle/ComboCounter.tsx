import React, { useEffect, useState } from 'react'
import { useBattleEngine } from '../../utils/effectPipeline/hooks/useBattleEngine'

export const ComboCounter: React.FC<{ currentCombo?: number }> = ({ currentCombo = 0 }) => {
  const [combo, setCombo] = useState(0)
  const [visible, setVisible] = useState(false)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    if (currentCombo > 1) {
      setCombo(currentCombo)
      setVisible(true)
      setScale(1.5) // Pop effect
      
      // Reset scale after pop
      const timer = setTimeout(() => setScale(1), 200)
      return () => clearTimeout(timer)
    } else if (currentCombo === 0) {
      // Fade out when combo resets
      const timer = setTimeout(() => setVisible(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [currentCombo])

  if (!visible) return null

  return (
    <div style={{
      position: 'absolute',
      top: '20%',
      right: '10%',
      transform: `scale(${scale})`,
      transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      zIndex: 1000,
      pointerEvents: 'none'
    }}>
      <div style={{
        fontFamily: 'Impact, sans-serif',
        fontSize: '48px',
        color: '#ffcc00',
        textShadow: '3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
        fontStyle: 'italic',
        textAlign: 'center'
      }}>
        COMBO
      </div>
      <div style={{
        fontFamily: 'Impact, sans-serif',
        fontSize: '64px',
        color: '#fff',
        textShadow: '3px 3px 0 #ff0000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
        textAlign: 'center',
        marginTop: '-10px'
      }}>
        x{combo}!
      </div>
    </div>
  )
}
