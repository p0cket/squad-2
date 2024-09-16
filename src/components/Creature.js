// Creature.js
import React, { useEffect } from 'react';
import { motion, useAnimationControls } from 'framer-motion';

const Creature = ({ name, health, position, isPlayer, setCreatureControls, maxHealth }) => {
  const controls = useAnimationControls();

  // Register controls when the component mounts
  useEffect(() => {
    if (setCreatureControls) {
      setCreatureControls(name, controls);
    }
  }, [name, controls, setCreatureControls]);

  return (
    <motion.div
      className={`flex flex-col items-center ${health <= 0 ? 'opacity-50' : ''}`}
      animate={controls}
      initial={position}
    >
      <motion.div
        className={`text-6xl mb-2 ${health <= 0 ? 'hidden' : ''}`}
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        {name}
      </motion.div>
      {health <= 0 && <div className="text-6xl mb-2">❌</div>}
      <div className="bg-gray-700 w-24 h-4 rounded-full overflow-hidden">
        <motion.div
          className="bg-green-500 h-full"
          initial={{ width: '100%' }}
          animate={{ width: `${(health / maxHealth) * 100}%` }}
        />
      </div>
      <div className="mt-1">
        {health} / {maxHealth}
      </div>
    </motion.div>
  );
};

export default Creature;
