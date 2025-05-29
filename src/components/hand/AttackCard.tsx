import React from "react";
import { motion } from "framer-motion";
import { STATUS_EFFECTS } from "../../consts/statuses";
import { Attack } from "../../consts/types/types";

// Define color classes for each attack type

export type TypeColor = { [key: string]: string };

const typeColors: TypeColor = {
  Physical: "bg-gray-500 text-gray-100",
  Elemental: "bg-red-500 text-red-100",
  Support: "bg-green-500 text-green-100",
  Ranged: "bg-blue-500 text-blue-100",
  Aura: "bg-yellow-500 text-yellow-100",
  Environmental: "bg-emerald-500 text-emerald-100",
  Special: "bg-purple-500 text-purple-100",
  Combo: "bg-orange-500 text-orange-100",
  Stealth: "bg-indigo-500 text-indigo-100",
};

interface AttackCardProps {
  attack: Attack;
  onUse: () => void;
  showUseButton?: boolean;
  onClick: () => void;
}

const AttackCard: React.FC<AttackCardProps> = ({
  attack,
  onUse,
  showUseButton = true,
  onClick,
}) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -5 }}
    whileTap={{ scale: 0.98 }}
    className="w-48 h-72 cursor-pointer group"
    onClick={onClick}
  >
    <div className="relative w-full h-full bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 border-2 border-gray-600 rounded-xl overflow-hidden shadow-2xl group-hover:border-blue-400 transition-all duration-300">
      {/* Card Header */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-gray-700 to-gray-600 p-1.5 border-b border-gray-500">
        <div className="flex items-center justify-between">
          {/* Attack Template/ID */}
          <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md">
            {attack?.template?.substring(0, 2).toUpperCase() || "??"}
          </div>
          {/* Attack Type Badge */}
          <span
            className={`${
              typeColors[attack.attackType]
            } px-2 py-0.5 text-xs rounded-full font-semibold shadow-sm`}
          >
            {attack.attackType}
          </span>
        </div>
      </div>

      {/* Card Art/Icon Area */}
      <div className="absolute top-10 left-0 right-0 h-16 bg-gradient-to-b from-gray-600 to-gray-700 flex items-center justify-center border-b border-gray-500">
        <motion.div
          className="text-4xl drop-shadow-lg"
          whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          {attack?.icon}
        </motion.div>
      </div>

      {/* Card Name */}
      <div className="absolute top-27 left-0 right-0 px-3 py-0.5">
        <h3 className="text-base font-bold text-center text-white truncate">
          {attack.name}
        </h3>
      </div>

      {/* Card Stats */}
      <div className="absolute top-28 left-0 right-0 px-3 space-y-1">
        {/* Damage */}
        <div className="flex items-center justify-between bg-red-600/20 rounded-lg px-2 py-0.5 border border-red-500/30">
          <span className="text-red-300 text-xs">⚔️ Damage</span>
          <span className="text-red-100 font-bold">{attack?.damage || 0}</span>
        </div>
        
        {/* Hit Chance */}
        <div className="flex items-center justify-between bg-green-600/20 rounded-lg px-2 py-0.5 border border-green-500/30">
          <span className="text-green-300 text-xs">🎯 Chance</span>
          <span className="text-green-100 font-bold">{Math.round((attack?.chanceToLand || 0) * 100)}%</span>
        </div>
        
        {/* Cooldown */}
        <div className="flex items-center justify-between bg-purple-600/20 rounded-lg px-2 py-0.5 border border-purple-500/30">
          <span className="text-purple-300 text-xs">⏱️ Cooldown</span>
          <span className="text-purple-100 font-bold">{attack?.cooldown || 0}s</span>
        </div>
      </div>

      {/* Effects */}
      {attack?.effects && attack.effects.length > 0 && (
        <div className="absolute bottom-3 left-0 right-0 px-3">
          <div className="bg-yellow-600/20 rounded-lg px-2 py-0.5 border border-yellow-500/30">
            <div className="flex flex-col">
              <span className="text-yellow-300 text-xs">✨ Effects</span>
              <span className="text-yellow-100 text-xs max-w-full overflow-hidden text-ellipsis">
                {attack.effects
                  .map((effect) => STATUS_EFFECTS?.[effect]?.name)
                  .filter(Boolean)
                  .join(", ") || "None"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Card Glow Effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:via-blue-500/5 group-hover:to-blue-500/10 transition-all duration-300 pointer-events-none" />
      
      {/* Card Border Highlight */}
      <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-blue-400/50 transition-all duration-300 pointer-events-none" />
    </div>
  </motion.div>
);

export default AttackCard;
