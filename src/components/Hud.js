// Hud.js
import React from 'react';
import { motion } from 'framer-motion';
import { useStateContext } from '../GameContext';

function Hud() {
  const state = useStateContext();
  const { mp, maxMp, mpPerTurn, gold, turn } = state;

  return (
    <div className="w-full flex items-center justify-between px-4 py-2 bg-gray-900 bg-opacity-75 text-white">
      {/* MP Bar */}
      <div className="flex items-center space-x-2">
        <div className="w-32 bg-gray-700 h-4 rounded-full overflow-hidden">
          <motion.div
            className="bg-blue-500 h-full"
            initial={{ width: '0%' }}
            animate={{ width: `${(mp / maxMp) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div>
          MP: {mp} / {maxMp} (+{mpPerTurn}/turn)
        </div>
      </div>

      {/* Gold Display */}
      <div className="flex items-center space-x-2">
        <div className="text-yellow-400 font-bold">Gold: {gold}</div>
      </div>

      {/* Turn Display */}
      <div className="flex items-center space-x-2">
        <div className="text-gray-300">Turn: {turn}</div>
      </div>
    </div>
  );
}

export default Hud;
