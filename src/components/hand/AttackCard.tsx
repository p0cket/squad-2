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
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="w-full"
    onClick={onClick}
  >
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden relative cursor-pointer p-2 flex flex-col space-y-2">
      <div className="flex items-center space-x-3">
        {/* Attack Icon */}
        <motion.div
          className="text-2xl"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.3 }}
        >
          {attack?.icon}
        </motion.div>

        {/* Attack Details */}
        <div className="flex flex-col flex-grow">
          <h3 className="text-sm font-bold text-gray-200">{attack.name}</h3>
          <div className="flex items-center justify-between">
            {/* Type with Color */}
            <span
              className={`${
                typeColors[attack.attackType]
              } px-1 py-0.5 text-xs rounded`}
            >
              {attack.attackType}
            </span>
            {/* Additional Info (Effects, Damage, Cooldown) */}
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span>
                Effects:{" "}
                {attack?.effects
                  ?.map((effect) => STATUS_EFFECTS?.[effect]?.name)
                  .join(", ")}
              </span>
              <span>DMG: {attack?.damage}</span>
              <span>CoolDown: {attack?.cooldown}s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cost and Use Button */}
      <div className="flex justify-between items-center mt-1">
        <div className="text-xs font-semibold text-yellow-400">
          Chance: {attack?.chanceToLand * 100}%
        </div>
        {showUseButton && (
          <button
            // onClick={() => onUse(attack)}
            className="bg-blue-600 hover:bg-blue-500 text-white py-1 px-2 rounded text-sm"
          >
            Use Attack
          </button>
        )}
      </div>
    </div>
  </motion.div>
);

export default AttackCard;
