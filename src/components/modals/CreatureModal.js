// CreatureModal.js - Simplified creature details modal
import React from "react";
import { Modal, Box } from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  maxWidth: 400,
  width: "90%",
  bgcolor: "transparent",
  boxShadow: "none",
  p: 0,
  outline: "none",
};

const CreatureModal = ({
  open,
  handleClose,
  creature,
}) => {
  if (!creature) return null;

  // Calculate health percentage for health bar
  const healthPercentage = Math.max(0, (creature.health / creature.maxHealth) * 100);
  const isAlive = creature.health > 0;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="creature-modal-title"
      aria-describedby="creature-modal-description"
    >
      <Box sx={style}>
        <div className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 border-2 border-gray-600 rounded-xl overflow-hidden shadow-2xl">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-gray-700 to-gray-600 p-4 border-b border-gray-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{creature.icon}</span>
                <div>
                  <h2 className="text-xl font-bold text-white">{creature.name}</h2>
                  <p className="text-sm text-gray-300 capitalize">
                    {creature.template} • {isAlive ? "Active" : "Defeated"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-600 rounded-lg"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 space-y-4">
            {/* Health Section */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <span className="text-red-400 font-medium">Health</span>
                <span className="text-white font-bold">
                  {creature.health} / {creature.maxHealth}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{ 
                    width: `${healthPercentage}%`,
                    background: isAlive 
                      ? "linear-gradient(90deg, #dc2626 0%, #ef4444 50%, #f87171 100%)"
                      : "#374151"
                  }}
                />
              </div>
            </div>

            {/* Combat Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-orange-600/20 rounded-lg p-3 border border-orange-500/30">
                <div className="text-orange-400 text-sm font-medium mb-1">Attack</div>
                <div className="text-white text-xl font-bold">{creature.attack || 0}</div>
              </div>
              <div className="bg-blue-600/20 rounded-lg p-3 border border-blue-500/30">
                <div className="text-blue-400 text-sm font-medium mb-1">Defense</div>
                <div className="text-white text-xl font-bold">{creature.defense || 0}</div>
              </div>
            </div>

            {/* Special Stats */}
            <div className="bg-purple-600/20 rounded-lg p-3 border border-purple-500/30">
              <div className="text-purple-400 text-sm font-medium mb-1">True Damage</div>
              <div className="text-white text-xl font-bold">{creature.trueDamage || 0}</div>
            </div>

            {/* Status Effects */}
            {creature.statuses && creature.statuses.length > 0 && (
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                <div className="text-yellow-400 font-medium mb-2">Status Effects</div>
                <div className="flex flex-wrap gap-2">
                  {creature.statuses.map((status, index) => (
                    <div
                      key={index}
                      className="bg-gray-700 px-3 py-1 rounded-full text-sm text-white flex items-center gap-1"
                      title={status.description}
                    >
                      <span>{status.icon}</span>
                      <span>{status.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleClose}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </Box>
    </Modal>
  );
};

export default CreatureModal;
