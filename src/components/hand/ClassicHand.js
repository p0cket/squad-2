import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@mui/material";

const attackExamples = [
  { name: "Firebolt", type: "Fire", icon: "🔥", damage: 15, cost: 2 },
  { name: "Punch", type: "Physical", icon: "👊", damage: 10, cost: 1 },
  { name: "Lightning", type: "Electric", icon: "⚡", damage: 20, cost: 3 },
  { name: "Gust", type: "Wind", icon: "💨", damage: 8, cost: 1 },
  { name: "Block", type: "Defense", icon: "🛡️", damage: 0, cost: 1 },
  { name: "Slash", type: "Physical", icon: "🗡️", damage: 12, cost: 2 },
];

const typeColors = {
  Fire: "bg-red-500 text-red-100",
  Physical: "bg-gray-500 text-gray-100",
  Electric: "bg-yellow-500 text-yellow-100",
  Wind: "bg-blue-500 text-blue-100",
  Defense: "bg-green-500 text-green-100",
};

const AttackItem = ({ attack, onSelect }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="w-full"
    onClick={() => onSelect(attack)}
  >
    <div className="bg-gray-800 border border-gray-700 rounded-lg relative group cursor-pointer p-2 flex items-center space-x-2">
      <motion.div
        className="text-2xl"
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.3 }}
      >
        {attack.icon}
      </motion.div>
      <div className="flex-grow">
        <h3 className="text-sm font-bold text-gray-200">{attack.name}</h3>
        <div className="flex items-center justify-between">
          <span
            className={`${typeColors[attack.type]} px-1 py-0 text-xs rounded`}
          >
            {attack.type}
          </span>
          <span className="text-xs text-gray-400">DMG: {attack.damage}</span>
        </div>
      </div>
      <div className="text-xs font-semibold text-yellow-400">
        {attack.cost} ⚡
      </div>
    </div>
  </motion.div>
);

const ClassicHand = () => {
  const [selectedAttack, setSelectedAttack] = useState(null);

  const handleSelect = (attack) => {
    setSelectedAttack(attack);
    console.log(`Selected attack: ${attack.name}`);
  };

  return (
    <div className="container mx-auto px-2 py-2 bg-gray-900 text-gray-200 ">
      <h1 className="text-2xl font-bold text-yellow-500 mb-1">
        Select Your Attack
      </h1>
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 gap-2"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
      >
        {attackExamples.map((attack, index) => (
          <motion.div
            key={attack.name}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <AttackItem attack={attack} onSelect={handleSelect} />
          </motion.div>
        ))}
      </motion.div>
      {selectedAttack && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 p-2 bg-gray-800 rounded-lg"
        >
          <h2 className="text-lg font-semibold text-yellow-400">
            Selected Attack: {selectedAttack.name}
          </h2>
          <p className="text-sm text-gray-300">
            Typex: {selectedAttack.type} | Damage: {selectedAttack.damage} |
            Cost: {selectedAttack.cost} ⚡
          </p>
          <Button
            label="Attack"
            onClick={() => console.log("Attack button clicked")}
          >Attack</Button>
        </motion.div>
      )}
    </div>
  );
};

export default ClassicHand;
