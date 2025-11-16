import React, { useState } from 'react'
import BattleEngineExample from '../utils/effectPipeline/integration/BattleEngineExample'
// @ts-ignore - JavaScript file
import Battle from './Battle'
import AnimationQueueDemo from './AnimationQueueDemo'

type Page = 'zustand-battle' | 'legacy-battle' | 'animations'

const Navigation: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('zustand-battle')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="bg-slate-950/80 backdrop-blur-sm border-b border-purple-500/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">⚔️</span>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Squad Battle System
              </h1>
            </div>
            <div className="flex space-x-1">
              <NavButton
                active={currentPage === 'zustand-battle'}
                onClick={() => setCurrentPage('zustand-battle')}
                icon="🎮"
              >
                Zustand Battle
              </NavButton>
              <NavButton
                active={currentPage === 'legacy-battle'}
                onClick={() => setCurrentPage('legacy-battle')}
                icon="🏰"
              >
                Legacy Battle
              </NavButton>
              <NavButton
                active={currentPage === 'animations'}
                onClick={() => setCurrentPage('animations')}
                icon="✨"
              >
                Animations
              </NavButton>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative">
        {currentPage === 'zustand-battle' && <BattleEngineExample />}
        {currentPage === 'legacy-battle' && <Battle />}
        {currentPage === 'animations' && <AnimationQueueDemo />}
      </div>

      <div className="fixed inset-0 pointer-events-none opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(147 51 234) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>
    </div>
  )
}

interface NavButtonProps {
  active: boolean
  onClick: () => void
  icon: string
  children: React.ReactNode
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, children }) => {
  return (
    <button
      onClick={onClick}
      className={
        "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 " +
        (active
          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50"
          : "text-purple-300 hover:text-purple-100 hover:bg-purple-900/30")
      }
    >
      <span>{icon}</span>
      <span>{children}</span>
    </button>
  )
}

export default Navigation
