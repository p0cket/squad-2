import React, { useState } from "react";
import { useDispatchContext, useStateContext } from "../../../GameContext";
import CompactCreatureList from "../../battle/CompactCreatureList";
import { Box, Modal } from "@mui/material";
import { modalStyle } from "../../../consts/consts";
import AttackDetails from "../../battle/AttackDetails";
import { runTurn } from "../../../utils/moves/runTurn";

export default function ChooseTargetsModal({
  attack,
  onClose,
  playerCreatureControlsRef,
  enemyCreatureControlsRef,
  showChooseTargetsModal,
  toggleChooseTargetsModal,
}) {
  const state = useStateContext();
  const dispatch = useDispatchContext();
  const { computerCreatures, playerCreatures } = state;
  const [selectedTarget, setSelectedTarget] = useState(null);

  // Find attacker based on attack.attackerId or default to the first player creature
  const attacker = attack?.attackerId
    ? playerCreatures.find((creature) => creature.ID === attack.attackerId)
    : playerCreatures[0];

  const handleSelectTarget = (creature) => {
    setSelectedTarget(creature);
    console.log(
      `Target selected: ${creature?.name} (ID: ${creature?.ID})`,
      creature
    );
  };

  // send that attack over to the handleAttack function
  const handleConfirmTarget = () => {
    if (!selectedTarget || !attacker) {
      console.error("Attacker or target is missing.");
      return;
    }
    // Determine if the attack is from the player
    const isPlayerAttack = playerCreatures.some(
      (creature) => creature.ID === attacker.ID
    );
    const target =
      playerCreatures.find((creature) => creature.ID === selectedTarget.ID) ||
      computerCreatures.find((creature) => creature.ID === selectedTarget.ID);
    if (!target) {
      console.error("Target could not be found in state.");
      return;
    }
    const attackPayload = {
      attacker,
      target,
      isPlayerAttack,
      playerCreatureControlsRef,
      enemyCreatureControlsRef,
      attack,
      dispatch,
      playerCreatures,
      computerCreatures,
    };
    console.log("Executing attack with payload:", attackPayload);
    toggleChooseTargetsModal();
    runTurn(state, attackPayload);
  };

  return (
    <Modal
      open={showChooseTargetsModal}
      onClose={toggleChooseTargetsModal}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box sx={modalStyle}>
        <div className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 border-2 border-gray-600 rounded-xl overflow-hidden shadow-2xl text-white max-h-[90vh] overflow-y-auto">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-gray-700 to-gray-600 p-4 border-b border-gray-500 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-2xl mr-3">🎯</div>
                <div>
                  <h2 className="text-xl font-bold text-white">Choose Target</h2>
                  <p className="text-sm text-gray-300">
                    <span className="text-green-400 font-medium">{attacker?.name || "Unknown"}</span>
                    {" "}will use{" "}
                    <span className="text-yellow-400 font-medium">{attack?.name}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={toggleChooseTargetsModal}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-600 rounded-lg"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Attack Details Section */}
          <div className="p-4 border-b border-gray-600">
            <AttackDetails attack={attack} />
          </div>

          {/* Target Selection Section */}
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Player Creatures */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                  <h3 className="text-lg font-semibold text-blue-400">Your Creatures</h3>
                  <span className="ml-2 text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded-full">
                    {playerCreatures.length}
                  </span>
                </div>
                <div className="bg-blue-600/10 rounded-lg border border-blue-500/30 p-3">
                  <CompactCreatureList
                    creatures={playerCreatures}
                    onSelect={handleSelectTarget}
                    isPlayer={true}
                    selectedTarget={selectedTarget}
                  />
                </div>
              </div>

              {/* Computer Creatures */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                  <h3 className="text-lg font-semibold text-red-400">Opponent Creatures</h3>
                  <span className="ml-2 text-xs bg-red-600/20 text-red-300 px-2 py-1 rounded-full">
                    {computerCreatures.length}
                  </span>
                </div>
                <div className="bg-red-600/10 rounded-lg border border-red-500/30 p-3">
                  <CompactCreatureList
                    creatures={computerCreatures}
                    onSelect={handleSelectTarget}
                    isPlayer={false}
                    selectedTarget={selectedTarget}
                  />
                </div>
              </div>
            </div>

            {/* Selection Status and Confirm Section */}
            <div className="mt-6 bg-gray-700/50 rounded-lg border border-gray-600/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {selectedTarget ? (
                    <>
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                      <div>
                        <p className="text-green-400 font-medium">Target Selected</p>
                        <p className="text-sm text-gray-300">
                          <strong>{selectedTarget.name}</strong>
                          <span className="ml-2 text-xs bg-gray-600 px-2 py-1 rounded">
                            ID: {selectedTarget.ID}
                          </span>
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-gray-400">No Target Selected</p>
                        <p className="text-xs text-gray-500">Choose a creature to target</p>
                      </div>
                    </>
                  )}
                </div>
                
                <button
                  onClick={handleConfirmTarget}
                  disabled={!selectedTarget}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    selectedTarget 
                      ? "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-lg hover:shadow-green-500/25 transform hover:scale-105"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {selectedTarget ? "🎯 Execute Attack" : "Select Target"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Box>
    </Modal>
  );
}
