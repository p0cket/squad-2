import React, { useState } from 'react'

interface Reward {
  id: string
  type: 'attack' | 'rune' | 'item'
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'legendary'
}

interface RewardsScreenProps {
  onSelect: (reward: Reward) => void
}

export const RewardsScreen: React.FC<RewardsScreenProps> = ({ onSelect }) => {
  const [selectedReward, setSelectedReward] = useState<string | null>(null)

  const rewards: Reward[] = [
    {
      id: 'inferno-blast',
      type: 'attack',
      name: 'Inferno Blast',
      description: 'Deals 50 damage and applies Burn for 3 turns.',
      icon: '🔥',
      rarity: 'rare'
    },
    {
      id: 'vampiric-touch',
      type: 'rune',
      name: 'Vampiric Touch',
      description: 'Heal for 20% of damage dealt.',
      icon: '🩸',
      rarity: 'legendary'
    },
    {
      id: 'revive-potion',
      type: 'item',
      name: 'Revive Potion',
      description: 'Resurrects a fallen creature with 50% HP.',
      icon: '🧪',
      rarity: 'common'
    }
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-amber-500 to-yellow-600 border-amber-400 text-amber-100'
      case 'rare': return 'from-purple-500 to-indigo-600 border-purple-400 text-purple-100'
      default: return 'from-blue-500 to-cyan-600 border-blue-400 text-blue-100'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[60] animate-fadeIn">
      <div className="max-w-5xl w-full p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-300 mb-4 animate-pulse">
            Victory Rewards!
          </h2>
          <p className="text-xl text-slate-300">Choose your prize, champion.</p>
        </div>

        {/* Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {rewards.map((reward, index) => (
            <div
              key={reward.id}
              onClick={() => setSelectedReward(reward.id)}
              className={`
                relative group cursor-pointer transform transition-all duration-500 hover:-translate-y-4
                ${selectedReward === reward.id ? 'scale-105 ring-4 ring-white/50' : 'hover:scale-105'}
              `}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Card Background */}
              <div className={`
                absolute inset-0 bg-gradient-to-br ${getRarityColor(reward.rarity)} opacity-20 rounded-2xl blur-xl group-hover:opacity-40 transition-opacity
              `}></div>

              {/* Card Content */}
              <div className={`
                relative h-full bg-slate-900/80 border-2 rounded-2xl p-6 flex flex-col items-center text-center backdrop-blur-sm transition-colors
                ${selectedReward === reward.id ? 'border-white' : 'border-slate-700 group-hover:border-slate-500'}
              `}>
                {/* Icon */}
                <div className={`
                  w-24 h-24 rounded-full flex items-center justify-center text-6xl mb-6 shadow-lg bg-gradient-to-br ${getRarityColor(reward.rarity)}
                `}>
                  {reward.icon}
                </div>

                {/* Type Badge */}
                <span className={`
                  px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 bg-slate-800 border border-slate-600
                  ${reward.rarity === 'legendary' ? 'text-amber-400' : reward.rarity === 'rare' ? 'text-purple-300' : 'text-slate-300'}
                `}>
                  {reward.type}
                </span>

                {/* Name */}
                <h3 className="text-2xl font-bold text-white mb-2">{reward.name}</h3>

                {/* Description */}
                <p className="text-slate-400 mb-8 flex-grow">{reward.description}</p>

                {/* Select Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelect(reward)
                  }}
                  className={`
                    px-8 py-3 rounded-xl font-bold text-lg transition-all w-full
                    ${selectedReward === reward.id 
                      ? 'bg-white text-slate-900 shadow-[0_0_20px_rgba(255,255,255,0.5)]' 
                      : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'}
                  `}
                >
                  {selectedReward === reward.id ? 'Confirm Selection' : 'Select'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
