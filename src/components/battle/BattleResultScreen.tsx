import React from 'react'

interface BattleResultScreenProps {
  result: 'victory' | 'defeat'
  onRestart: () => void
  onNextLevel?: () => void
}

/**
 * Victory/Defeat screen overlay shown when battle ends
 */
export const BattleResultScreen: React.FC<BattleResultScreenProps> = ({
  result,
  onRestart,
  onNextLevel
}) => {
  const isVictory = result === 'victory'
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className={`p-8 rounded-lg border-2 max-w-md w-full shadow-2xl transform transition-all ${
        isVictory 
          ? 'bg-gradient-to-br from-yellow-900/90 to-green-900/90 border-yellow-500 shadow-yellow-500/50' 
          : 'bg-gradient-to-br from-red-900/90 to-gray-900/90 border-red-500 shadow-red-500/50'
      }`}>
        <div className="text-center">
          {/* Icon */}
          <div className="text-8xl mb-4 animate-bounce">
            {isVictory ? '🎉' : '💀'}
          </div>
          
          {/* Title */}
          <h2 className={`text-5xl font-bold mb-4 ${
            isVictory ? 'text-yellow-200' : 'text-red-200'
          }`}>
            {isVictory ? 'Victory!' : 'Defeat'}
          </h2>
          
          {/* Message */}
          <p className="text-lg text-gray-200 mb-8">
            {isVictory 
              ? 'You have defeated all enemies!' 
              : 'All your creatures have fallen...'}
          </p>
          
          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onRestart}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
            >
              🔄 Restart Battle
            </button>
            
            {isVictory && onNextLevel && (
              <button
                onClick={onNextLevel}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
              >
                ➡️ Next Level
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
