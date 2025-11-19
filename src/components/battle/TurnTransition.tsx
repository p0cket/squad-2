import React, { useEffect, useState } from 'react'

interface TurnTransitionProps {
  turnOwner: 'player' | 'computer' | null
  turnNumber: number
}

/**
 * Animated overlay that shows when turn changes
 */
export const TurnTransition: React.FC<TurnTransitionProps> = ({ turnOwner, turnNumber }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [prevOwner, setPrevOwner] = useState(turnOwner)

  useEffect(() => {
    // Show transition when turn owner changes
    if (turnOwner !== prevOwner && turnOwner !== null) {
      setIsVisible(true)
      
      // Hide after 1.5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 1500)
      
      setPrevOwner(turnOwner)
      
      return () => clearTimeout(timer)
    }
  }, [turnOwner, prevOwner])

  if (!isVisible) return null

  const isPlayerTurn = turnOwner === 'player'

  return (
    <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
      <div className={`
        transform transition-all duration-500 ease-out
        ${isVisible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}
      `}>
        <div className={`
          px-12 py-8 rounded-2xl border-4 shadow-2xl backdrop-blur-sm
          ${isPlayerTurn 
            ? 'bg-blue-900/90 border-blue-400 shadow-blue-500/50' 
            : 'bg-red-900/90 border-red-400 shadow-red-500/50'}
        `}>
          <div className="text-center">
            {/* Icon */}
            <div className="text-7xl mb-4 animate-bounce">
              {isPlayerTurn ? '🛡️' : '⚔️'}
            </div>
            
            {/* Turn Info */}
            <h2 className={`text-5xl font-bold mb-2 ${
              isPlayerTurn ? 'text-blue-200' : 'text-red-200'
            }`}>
              {isPlayerTurn ? 'Your Turn' : 'Enemy Turn'}
            </h2>
            
            <p className="text-2xl text-gray-300">
              Turn {turnNumber}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
