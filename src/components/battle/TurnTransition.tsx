import React, { useEffect, useState, useRef } from 'react'

interface TurnTransitionProps {
  turnOwner: 'player' | 'computer' | null
  turnNumber: number
}

/**
 * Animated overlay that shows when turn changes
 */
export const TurnTransition: React.FC<TurnTransitionProps> = ({ turnOwner, turnNumber }) => {
  const [isVisible, setIsVisible] = useState(false)
  const prevOwnerRef = useRef<'player' | 'computer' | null>(null)

  useEffect(() => {
    console.log('🔍 TurnTransition effect:', { turnOwner, prevOwner: prevOwnerRef.current, isVisible })
    
    // Show transition when turn owner changes (but not on initial mount)
    if (prevOwnerRef.current !== null && turnOwner !== prevOwnerRef.current && turnOwner !== null) {
      console.log('✅ Showing turn transition:', turnOwner)
      setIsVisible(true)
      
      // Hide after 1 second (faster)
      const timer = setTimeout(() => {
        console.log('⏰ Hiding turn transition')
        setIsVisible(false)
      }, 1000)
      
      // Update ref for next time
      prevOwnerRef.current = turnOwner
      
      return () => clearTimeout(timer)
    }
    
    // Update previous owner ref
    prevOwnerRef.current = turnOwner
  }, [turnOwner]) // Only depend on turnOwner, not prevOwner

  if (!isVisible) return null

  const isPlayerTurn = turnOwner === 'player'

  return (
    <div className="fixed top-24 left-0 right-0 flex justify-center z-40 pointer-events-none">
      <div className={`
        transform transition-all duration-300 ease-out
        ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'}
      `}>
        <div className={`
          px-8 py-4 rounded-xl border-2 shadow-lg backdrop-blur-sm
          ${isPlayerTurn 
            ? 'bg-blue-900/80 border-blue-400 shadow-blue-500/30' 
            : 'bg-red-900/80 border-red-400 shadow-red-500/30'}
        `}>
          <div className="text-center flex items-center gap-4">
            {/* Icon */}
            <div className="text-4xl animate-bounce">
              {isPlayerTurn ? '🛡️' : '⚔️'}
            </div>
            
            <div>
              {/* Turn Info */}
              <h2 className={`text-2xl font-bold ${
                isPlayerTurn ? 'text-blue-200' : 'text-red-200'
              }`}>
                {isPlayerTurn ? 'Your Turn' : 'Enemy Turn'}
              </h2>
              
              <p className="text-sm text-gray-300">
                Turn {turnNumber}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
