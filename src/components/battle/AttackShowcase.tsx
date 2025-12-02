/**
 * Attack Showcase Component
 * Displays a comprehensive set of attack buttons with tooltips
 * for testing and demonstrating the battle system's capabilities
 */

import React from 'react'
import { Creature } from '../../consts/types/types'

interface Attack {
  id: string
  name: string
  icon: string
  damage?: number
  description: string
  category: 'damage' | 'status' | 'buff' | 'debuff' | 'heal' | 'special'
  color: string
  hoverColor: string
  testId?: string
}

interface AttackShowcaseProps {
  onAttackSelect: (attackId: string) => void
  isSelectingTarget: boolean
  selectedAction: string | null
  isDisabled: boolean
  attacker?: Creature  // Optional: for calculating actual damage
  target?: Creature    // Optional: for calculating damage vs specific target
}

export const AttackShowcase: React.FC<AttackShowcaseProps> = ({
  onAttackSelect,
  isSelectingTarget,
  selectedAction,
  isDisabled,
  attacker,
  target
}) => {
  
  // Helper to calculate actual damage if attacker is provided
  const calculateDamage = (baseDamage: number): { total: number; breakdown: string } => {
    if (!attacker) {
      return { total: baseDamage, breakdown: '' }
    }
    
    const attackBonus = attacker.attack
    const totalBeforeDef = baseDamage + attackBonus
    
    if (target) {
      const defense = target.defense
      const actualDamage = Math.max(1, totalBeforeDef - defense)
      const breakdown = `${baseDamage} + ${attackBonus} ATK - ${defense} DEF = ${actualDamage}`
      return { total: actualDamage, breakdown }
    }
    
    const breakdown = `${baseDamage} + ${attackBonus} ATK`
    return { total: totalBeforeDef, breakdown }
  }

  const attacks: Attack[] = [
    // Direct Damage Attacks
    {
      id: 'slash',
      name: 'Slash',
      icon: '⚔️',
      damage: 15,
      description: 'Basic physical attack - 15 damage',
      category: 'damage',
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600',
      testId: 'btn-slash'
    },
    {
      id: 'heavy-strike',
      name: 'Heavy Strike',
      icon: '🔨',
      damage: 25,
      description: 'Powerful strike - 25 damage, ignores 50% defense',
      category: 'damage',
      color: 'bg-red-600',
      hoverColor: 'hover:bg-red-700'
    },
    {
      id: 'true-strike',
      name: 'True Strike',
      icon: '⚡',
      damage: 20,
      description: 'True damage - 20 damage, ignores ALL defense',
      category: 'damage',
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600'
    },
    {
      id: 'pierce',
      name: 'Pierce',
      icon: '🗡️',
      damage: 12,
      description: 'Armor-piercing attack - 12 damage + 8 true damage',
      category: 'damage',
      color: 'bg-orange-600',
      hoverColor: 'hover:bg-orange-700'
    },

    // Status Effect Attacks (DoT)
    {
      id: 'burn',
      name: 'Burn',
      icon: '🔥',
      damage: 0,
      description: 'Apply burn status - 10 dmg/turn for 3 turns (30 total)',
      category: 'status',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      testId: 'btn-burn'
    },
    {
      id: 'flameswipe',
      name: 'Flame Swipe',
      icon: '🔥💨',
      damage: 15,
      description: '15 damage + burn (5 dmg/turn for 3 turns)',
      category: 'status',
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      testId: 'btn-flameswipe'
    },
    {
      id: 'inferno',
      name: 'Inferno',
      icon: '🔥🔥',
      damage: 10,
      description: '10 damage + intense burn (15 dmg/turn for 4 turns)',
      category: 'status',
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600'
    },
    {
      id: 'poison',
      name: 'Poison',
      icon: '🧪',
      damage: 0,
      description: 'Apply poison - 15 dmg/turn for 3 turns (45 total)',
      category: 'status',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      testId: 'btn-poison'
    },
    {
      id: 'toxic-bite',
      name: 'Toxic Bite',
      icon: '🦷☠️',
      damage: 8,
      description: '8 damage + poison (10 dmg/turn for 4 turns)',
      category: 'status',
      color: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700'
    },
    {
      id: 'bleed',
      name: 'Bleed',
      icon: '🩸',
      damage: 12,
      description: '12 damage + bleeding (8 dmg/turn for 3 turns)',
      category: 'status',
      color: 'bg-rose-600',
      hoverColor: 'hover:bg-rose-700'
    },

    // Control/Debuff Attacks
    {
      id: 'stun',
      name: 'Stun',
      icon: '💫',
      damage: 10,
      description: '10 damage + stun (target cannot act for 1 turn)',
      category: 'debuff',
      color: 'bg-cyan-500',
      hoverColor: 'hover:bg-cyan-600',
      testId: 'btn-stun'
    },
    {
      id: 'freeze',
      name: 'Freeze',
      icon: '❄️',
      damage: 5,
      description: '5 damage + freeze (-5 defense, cannot act for 2 turns)',
      category: 'debuff',
      color: 'bg-blue-400',
      hoverColor: 'hover:bg-blue-500',
      testId: 'btn-freeze'
    },
    {
      id: 'weaken',
      name: 'Weaken',
      icon: '⚔️↓',
      damage: 8,
      description: '8 damage + reduce target attack by 10 for 3 turns',
      category: 'debuff',
      color: 'bg-amber-600',
      hoverColor: 'hover:bg-amber-700',
      testId: 'btn-weaken'
    },
    {
      id: 'shatter-armor',
      name: 'Shatter Armor',
      icon: '🛡️💥',
      damage: 10,
      description: '10 damage + reduce target defense by 8 for 3 turns',
      category: 'debuff',
      color: 'bg-stone-600',
      hoverColor: 'hover:bg-stone-700'
    },
    {
      id: 'slow',
      name: 'Slow',
      icon: '🐌',
      damage: 0,
      description: 'Slow target - skips every 2nd turn for 4 turns',
      category: 'debuff',
      color: 'bg-slate-500',
      hoverColor: 'hover:bg-slate-600',
      testId: 'btn-slow'
    },
    {
      id: 'silence',
      name: 'Silence',
      icon: '🤐',
      damage: 0,
      description: 'Prevent target from using special abilities for 2 turns',
      category: 'debuff',
      color: 'bg-violet-600',
      hoverColor: 'hover:bg-violet-700',
      testId: 'btn-silence'
    },

    // Buff Attacks
    {
      id: 'buff',
      name: 'Power Up',
      icon: '💪',
      damage: 12,
      description: '12 damage + gain +5 attack for 3 turns (self)',
      category: 'buff',
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600',
      testId: 'btn-buff'
    },
    {
      id: 'fortify',
      name: 'Fortify',
      icon: '🛡️',
      damage: 0,
      description: 'Grant target +10 defense for 3 turns',
      category: 'buff',
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700'
    },
    {
      id: 'haste',
      name: 'Haste',
      icon: '⚡💨',
      damage: 0,
      description: 'Increase target speed by 100% for 2 turns (acts first)',
      category: 'buff',
      color: 'bg-yellow-400',
      hoverColor: 'hover:bg-yellow-500'
    },
    {
      id: 'regeneration',
      name: 'Regeneration',
      icon: '💚',
      damage: 0,
      description: 'Grant target healing (10 HP/turn for 4 turns)',
      category: 'buff',
      color: 'bg-emerald-500',
      hoverColor: 'hover:bg-emerald-600'
    },
    {
      id: 'shield',
      name: 'Shield',
      icon: '🛡️',
      damage: 0,
      description: 'Grant target a protective barrier (20 shield for 3 turns)',
      category: 'buff',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      id: 'cleanse',
      name: 'Cleanse',
      icon: '✨',
      damage: 0,
      description: 'Remove all debuffs from target ally',
      category: 'buff',
      color: 'bg-pink-400',
      hoverColor: 'hover:bg-pink-500',
      testId: 'btn-cleanse'
    },

    // Healing
    {
      id: 'heal',
      name: 'Heal',
      icon: '💚',
      damage: 0,
      description: 'Restore 25 HP to target (capped at max health)',
      category: 'heal',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      testId: 'btn-heal'
    },
    {
      id: 'greater-heal',
      name: 'Greater Heal',
      icon: '💚✨',
      damage: 0,
      description: 'Restore 50 HP to target (capped at max health)',
      category: 'heal',
      color: 'bg-green-600',
      hoverColor: 'hover:bg-green-700'
    },
    {
      id: 'cleanse',
      name: 'Cleanse',
      icon: '✨',
      damage: 0,
      description: 'Remove ALL debuffs from target',
      category: 'heal',
      color: 'bg-cyan-400',
      hoverColor: 'hover:bg-cyan-500',
      testId: 'btn-cleanse'
    },

    // Special/Hybrid Attacks
    {
      id: 'lifedrain',
      name: 'Life Drain',
      icon: '🩸💚',
      damage: 18,
      description: '18 damage + heal self for 50% of damage dealt',
      category: 'special',
      color: 'bg-fuchsia-600',
      hoverColor: 'hover:bg-fuchsia-700'
    },
    {
      id: 'execute',
      name: 'Execute',
      icon: '⚔️💀',
      damage: 30,
      description: 'Deals double damage if target below 25% health',
      category: 'special',
      color: 'bg-red-700',
      hoverColor: 'hover:bg-red-800'
    },
    {
      id: 'kindle',
      name: 'Kindle',
      icon: '🔥✨',
      damage: 10,
      description: '10 burn + spread to 1 ally (5 dmg/turn for 2 turns)',
      category: 'special',
      color: 'bg-gradient-to-r from-orange-600 to-red-600',
      hoverColor: 'hover:from-orange-700 hover:to-red-700'
    },
    {
      id: 'chain-lightning',
      name: 'Chain Lightning',
      icon: '⚡🔗',
      damage: 15,
      description: '15 damage, then bounces to 2 random enemies (8 dmg each)',
      category: 'special',
      color: 'bg-gradient-to-r from-blue-500 to-purple-600',
      hoverColor: 'hover:from-blue-600 hover:to-purple-700'
    },
    {
      id: 'meteor',
      name: 'Meteor',
      icon: '☄️',
      damage: 30,
      description: '30 damage to target + 10 splash damage to all others',
      category: 'special',
      color: 'bg-gradient-to-r from-orange-500 to-red-600',
      hoverColor: 'hover:from-orange-600 hover:to-red-700'
    },
    {
      id: 'sacrifice',
      name: 'Sacrifice',
      icon: '💔💥',
      damage: 50,
      description: 'Deal 50 damage but lose 25% of your own health',
      category: 'special',
      color: 'bg-gradient-to-r from-red-600 to-black',
      hoverColor: 'hover:from-red-700 hover:to-gray-900'
    }
  ]

  const renderAttackButton = (attack: Attack) => (
    <div key={attack.id} className="relative group">
      <button
        onClick={() => onAttackSelect(attack.id)}
        disabled={isDisabled}
        data-testid={attack.testId}
        className={`
          px-3 py-2 text-white rounded text-sm font-medium
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
          ${isSelectingTarget && selectedAction === attack.id
            ? 'bg-blue-600 ring-2 ring-blue-400 scale-105'
            : `${attack.color} ${attack.hoverColor}`
          }
          hover:scale-105 hover:shadow-lg
        `}
      >
        <span className="flex items-center gap-1">
          <span>{attack.icon}</span>
          <span className="hidden sm:inline">{attack.name}</span>
        </span>
      </button>
      
      {/* Tooltip - shows on hover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50 pointer-events-none">
        <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl border border-gray-700 whitespace-nowrap">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{attack.icon}</span>
            <span className="font-bold text-sm">{attack.name}</span>
          </div>
          <div className="text-gray-300 text-left">
            {attack.description}
          </div>
          {attack.damage !== undefined && attack.damage > 0 && (() => {
            const { total, breakdown } = calculateDamage(attack.damage)
            return (
              <div className="text-red-400 font-semibold mt-1">
                💥 {total} damage
                {breakdown && (
                  <div className="text-gray-400 text-xs font-normal mt-0.5">
                    ({breakdown})
                  </div>
                )}
              </div>
            )
          })()}
        </div>
        {/* Arrow pointing down */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
          <div className="border-8 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </div>
  )

  // Add Batch 2 attacks to the attacks array for consistent rendering
  const batch2Attacks: Attack[] = [
    {
      id: 'vulnerable',
      name: 'Expose Weakness',
      icon: '🎯',
      damage: 12,
      description: '12 damage + VULNERABLE (target takes 50% more damage for 3 turns)',
      category: 'debuff',
      color: 'bg-red-600',
      hoverColor: 'hover:bg-red-700',
      testId: 'btn-vulnerable'
    },
    {
      id: 'thorns',
      name: 'Thorn Shield',
      icon: '🌵',
      damage: 8,
      description: '8 damage + THORNS (reflects 10 damage to attackers for 3 turns)',
      category: 'buff',
      color: 'bg-green-600',
      hoverColor: 'hover:bg-green-700',
      testId: 'btn-thorns'
    },
    {
      id: 'leech',
      name: 'Vampiric Strike',
      icon: '🩸',
      damage: 18,
      description: '18 damage + LEECH (heals for 30% of damage dealt for 3 turns)',
      category: 'special',
      color: 'bg-rose-600',
      hoverColor: 'hover:bg-rose-700',
      testId: 'btn-leech'
    },
    {
      id: 'evasion',
      name: 'Blur',
      icon: '✨',
      damage: 5,
      description: '5 damage + EVASION (40% dodge chance for 3 turns)',
      category: 'buff',
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600',
      testId: 'btn-evasion'
    },
    {
      id: 'reflect',
      name: 'Mirror Image',
      icon: '🪞',
      damage: 6,
      description: '6 damage + REFLECT (returns 50% damage to attackers for 3 turns)',
      category: 'special',
      color: 'bg-cyan-500',
      hoverColor: 'hover:bg-cyan-600',
      testId: 'btn-reflect'
    }
  ]

  // Update categories to include Batch 2 attacks
  const allAttacks = [...attacks, ...batch2Attacks]
  const allCategories = {
    damage: allAttacks.filter(a => a.category === 'damage'),
    status: allAttacks.filter(a => a.category === 'status'),
    debuff: allAttacks.filter(a => a.category === 'debuff'),
    buff: allAttacks.filter(a => a.category === 'buff'),
    heal: allAttacks.filter(a => a.category === 'heal'),
    special: allAttacks.filter(a => a.category === 'special')
  }

  return (
    <div className="space-y-2">
      {/* MAIN ATTACK ARSENAL - More Compact */}
      <div className="border border-green-500/30 rounded-lg p-2 bg-green-900/10">
        <h2 className="text-xs font-bold text-green-400 mb-2">✅ Attack Arsenal</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <div>
            <h3 className="text-xs font-semibold text-purple-300 mb-1">💥 Damage</h3>
            <div className="flex flex-wrap gap-1">
              {allCategories.damage.map(renderAttackButton)}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-purple-300 mb-1">🔥 DoT</h3>
            <div className="flex flex-wrap gap-1">
              {allCategories.status.map(renderAttackButton)}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-purple-300 mb-1">⬇️ Debuff</h3>
            <div className="flex flex-wrap gap-1">
              {allCategories.debuff.map(renderAttackButton)}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-purple-300 mb-1">⬆️ Buff</h3>
            <div className="flex flex-wrap gap-1">
              {allCategories.buff.map(renderAttackButton)}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-purple-300 mb-1">💚 Heal</h3>
            <div className="flex flex-wrap gap-1">
              {allCategories.heal.map(renderAttackButton)}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-purple-300 mb-1">✨ Special</h3>
            <div className="flex flex-wrap gap-1">
              {allCategories.special.map(renderAttackButton)}
            </div>
          </div>
        </div>
      </div>

      {/* PLANNED - With Labels */}
      <div className="border border-blue-500/30 rounded-lg p-2 bg-blue-900/10">
        <h2 className="text-xs font-bold text-blue-400 mb-1.5">📋 Upcoming Attacks</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-1.5 text-xs">
          <div className="bg-gray-800/30 p-1.5 rounded text-center">
            <div className="text-gray-400">⚡💨</div>
            <div className="text-gray-500 text-[10px] mt-0.5">Haste</div>
          </div>
          <div className="bg-gray-800/30 p-1.5 rounded text-center">
            <div className="text-gray-400">💀</div>
            <div className="text-gray-500 text-[10px] mt-0.5">Death</div>
          </div>
          <div className="bg-gray-800/30 p-1.5 rounded text-center">
            <div className="text-gray-400">🗡️✨</div>
            <div className="text-gray-500 text-[10px] mt-0.5">Enchant</div>
          </div>
          <div className="bg-gray-800/30 p-1.5 rounded text-center">
            <div className="text-gray-400">😡</div>
            <div className="text-gray-500 text-[10px] mt-0.5">Enrage</div>
          </div>
          <div className="bg-gray-800/30 p-1.5 rounded text-center">
            <div className="text-gray-400">📈</div>
            <div className="text-gray-500 text-[10px] mt-0.5">Grow</div>
          </div>
          <div className="bg-gray-800/30 p-1.5 rounded text-center">
            <div className="text-gray-400">🎭</div>
            <div className="text-gray-500 text-[10px] mt-0.5">Taunt</div>
          </div>
          <div className="bg-gray-800/30 p-1.5 rounded text-center">
            <div className="text-gray-400">🔮</div>
            <div className="text-gray-500 text-[10px] mt-0.5">Curse</div>
          </div>
          <div className="bg-gray-800/30 p-1.5 rounded text-center">
            <div className="text-gray-400">🎯</div>
            <div className="text-gray-500 text-[10px] mt-0.5">Mark</div>
          </div>
        </div>
      </div>
    </div>
  )
}
