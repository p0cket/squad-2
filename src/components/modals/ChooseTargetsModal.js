import React, { useState } from "react";
import { useDispatchContext, useStateContext } from "../../GameContext";
import CompactCreatureList from "../battle/CompactCreatureList";
import { Box, Modal } from "@mui/material";
import { modalStyle } from "../../consts/consts";
import AttackDetails from "../battle/AttackDetails";
import { handleTargetedAttack } from "../../utils/moves/handleConfirmedAttack";

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
      `Target selected: ${creature.name} (ID: ${creature.ID})`,
      creature
    );
  };

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
    handleTargetedAttack(state, attackPayload);
  };

  return (
    <Modal
      open={showChooseTargetsModal}
      onClose={toggleChooseTargetsModal}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box sx={modalStyle}>
        <div className="container mx-auto p-4 bg-gray-900 text-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-yellow-500">
              Choose Target for{" "}
              <span className="text-green-400">
                {attacker?.name || "Unknown"}
              </span>{" "}
              to use <span className="text-white">{attack?.name}</span>
            </h2>
          </div>
          <AttackDetails attack={attack} />
          <div className="flex justify-between mb-4">
            {/* Player Creatures */}
            <div className="w-1/2">
              <h3 className="text-lg font-semibold text-blue-400">
                Your Creatures
              </h3>
              <CompactCreatureList
                creatures={playerCreatures}
                onSelect={handleSelectTarget}
                isPlayer={true}
                selectedTarget={selectedTarget}
              />
            </div>

            {/* Computer Creatures */}
            <div className="w-1/2">
              <h3 className="text-lg font-semibold text-red-400">
                Opponent Creatures
              </h3>
              <CompactCreatureList
                creatures={computerCreatures}
                onSelect={handleSelectTarget}
                isPlayer={false}
                selectedTarget={selectedTarget}
              />
            </div>
          </div>

          {/* Display selected target info */}
          <div className="text-center">
            {selectedTarget ? (
              <div className="text-green-400 mb-4">
                Selected Target: <strong>{selectedTarget.name}</strong> (ID:{" "}
                {selectedTarget.ID})
              </div>
            ) : (
              <div className="text-gray-500 mb-4">No target selected</div>
            )}
            {selectedTarget && (
              <button
                onClick={handleConfirmTarget}
                className="bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded"
              >
                Confirm Target
              </button>
            )}
          </div>
        </div>
      </Box>
    </Modal>
  );
}
