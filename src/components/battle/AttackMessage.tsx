import React, { useEffect, useState } from 'react'

interface AttackMessageProps {
  attackerName: string
  attackName: string
  isItem?: boolean
}

/**
 * Shows a brief message when an attack or item is used
 */
export const AttackMessage: React.FC<AttackMessageProps> = ({ attackerName, attackName, isItem = false }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show immediately
    setIsVisible(true)

    // Hide after 2 seconds
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [attackerName, attackName])

  if (!isVisible) return null

  return (
    <div className="fixed top-32 left-0 right-0 flex justify-center z-50 pointer-events-none animate-fadeIn">
      <div className={`
        px-8 py-3 rounded-full border-2 shadow-lg backdrop-blur-md transform transition-all duration-300
        ${isItem 
          ? 'bg-purple-900/80 border-purple-400 shadow-purple-500/30' 
          : 'bg-slate-900/80 border-slate-400 shadow-slate-500/30'}
      `}>
        <div className="text-center flex items-center gap-3">
          <span className="text-2xl">{isItem ? '🎒' : '⚔️'}</span>
          <span className="text-xl font-bold text-white">
            <span className={isItem ? 'text-purple-300' : 'text-blue-300'}>{attackerName}</span>
            <span className="mx-2 text-slate-400">used</span>
            <span className={isItem ? 'text-yellow-300' : 'text-red-300'}>{attackName}</span>
            !
          </span>
        </div>
      </div>
    </div>
  )
}
