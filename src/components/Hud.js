// Hud.js
import React from "react";
import { motion } from "framer-motion";
import { useStateContext } from "../GameContext";
import Levels from "./screens/Levels";
import ShopModal from "./Modal";
import Login from "./Login";

function Hud() {
  const state = useStateContext();
  const { mp, maxMp, mpPerTurn, gold, turn } = state;

  return (
    <div className="w-full bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 border-b border-gray-700 shadow-md">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left Section - MP Bar & Gold */}
        <div className="flex items-center space-x-6">
          {/* MP Bar */}
          <div className="flex items-center space-x-2">
            <div className="relative w-28 bg-gray-800 h-3 rounded-full overflow-hidden border border-gray-600">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                initial={{ width: "0%" }}
                animate={{ width: `${(mp / maxMp) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="text-blue-100 text-xs whitespace-nowrap">
              <span className="font-semibold">{mp}/{maxMp}</span>
              <span className="text-blue-300 ml-1">(+{mpPerTurn})</span>
            </div>
          </div>

          {/* Gold Display */}
          <div className="flex items-center space-x-2 bg-yellow-900/30 px-2 py-1 rounded border border-yellow-700/40">
            <div className="text-lg">💰</div>
            <div className="text-yellow-400 font-bold">{gold}</div>
          </div>
        </div>

        {/* Center Section - Game Navigation */}
        <div className="flex items-center space-x-3">
          <Levels numLevels={10} />
          <ShopModal />
          <div className="bg-gray-800/40 px-2 py-1 rounded border border-gray-700/40 text-gray-300 text-sm hover:bg-gray-700/30 transition-colors cursor-pointer">
            About
          </div>
        </div>

        {/* Right Section - Turn & Login */}
        <div className="flex items-center space-x-4">
          {/* Turn Display */}
          <div className="flex items-center space-x-2 bg-purple-900/30 px-2 py-1 rounded border border-purple-700/40">
            <div className="text-purple-200 text-sm">
              Turn: <span className="font-bold">{turn}</span>
            </div>
          </div>
          
          {/* Login Section */}
          <div>
            <Login />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hud;
