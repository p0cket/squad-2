import React, { useState } from "react";
import { useDispatchContext, useStateContext } from "../../GameContext";
import CompactCreatureList from "../battle/CompactCreatureList";
import { Box, Modal } from "@mui/material";
import { modalStyle } from "../../consts/consts";
import AttackDetails from "../battle/AttackDetails";
import { handleTargetedAttack } from "../../utils.js/moves/handleConfirmedAttack";

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

  console.log(`attack`, attack);

  // Determine the attacker based on attack.attackerId or default to the first creature
  const attacker = attack?.attackerId
    ? playerCreatures.find((creature) => creature.ID === attack.attackerId)
    : playerCreatures[0];

  // Handler for selecting a creature as the target
  const handleSelectTarget = (creature) => {
    setSelectedTarget(creature);
    console.log(
      `Target selected: ${creature.name} with ID: ${creature.ID}`,
      creature
    );
  };

  const handleConfirmTarget = () => {
    // Check if the attacker is a player creature.
    // Not sure if this is needed, but it's here for now.
    const isPlayerAttack = playerCreatures.some(
      (creature) => creature.ID === attacker.ID
    );

    toggleChooseTargetsModal();
    console.log(
      `Target confirmed: ${selectedTarget.name}, ID: ${selectedTarget.ID}. Performing Atk:  attacker,
      selectedTarget,
      isPlayerAttack,
      playerCreatureControlsRef,
      enemyCreatureControlsRef,
      attack`,
      attacker,
      selectedTarget, //target
      isPlayerAttack,
      playerCreatureControlsRef,
      enemyCreatureControlsRef,
      attack
    );

    // const attackPayload = {
    //   attacker,
    //   selectedTarget,
    //   isPlayerAttack,
    //   attack,
    // };
    /**
 * @typedef {Object} AttackPayload
 * @property {any} attacker - The attacker (replace 'any' with the actual type)
 * @property {any} target - The target (replace 'any' with the actual type)
 * @property {boolean} isPlayerAttack - Whether it is a player attack
 * @property {any} playerCreatureControlsRef - Player creature controls reference (replace 'any' with the actual type)
 * @property {any} enemyCreatureControlsRef - Enemy creature controls reference (replace 'any' with the actual type)
 * @property {any} attack - The attack (replace 'any' with the actual type)
 * @property {React.Dispatch<any>} dispatch - The dispatch function (replace 'any' with the actual action type)
 * @property {any[]} playerCreatures - The player creatures (replace 'any' with the actual creature type)
 * @property {any[]} computerCreatures - The computer creatures (replace 'any' with the actual creature type)
 */

/** @type {AttackPayload} */
    const attackPayload = {
      attacker,
      target: selectedTarget, //these should rly be indexes
      isPlayerAttack: false, //isPlayer: false -> so computer
      playerCreatureControlsRef,
      enemyCreatureControlsRef,
      attack, // attack. make a comp select a random attack they have
      dispatch,
      playerCreatures: state.playerCreatures,
      computerCreatures: state.computerCreatures,
    };

    handleTargetedAttack(
      state,
      attackPayload
    );
  };

  return (
    <Modal
      open={showChooseTargetsModal}
      onClose={toggleChooseTargetsModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={modalStyle}>
        <div className="container mx-auto p-4 bg-gray-900 text-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-yellow-500">
              Choose Target For{" "}
              <span className="text-green-400">
                <strong>{attacker.name}</strong>
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
                Confirm Target: Run Attack
              </button>
            )}
          </div>
        </div>
      </Box>
    </Modal>
  );
}
