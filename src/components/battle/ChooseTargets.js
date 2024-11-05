import React, { useState } from "react";
import { useDispatchContext, useStateContext } from "../../GameContext";
import CompactCreatureList from "./CompactCreatureList";
import { performAttack } from "../../utils.js/attackUtils";

export default function ChooseTargets({
  attack,
  onClose,
  playerCreatureControlsRef,
  enemyCreatureControlsRef,
}) {
  const state = useStateContext();
  const dispatch = useDispatchContext();
  const { computerCreatures, playerCreatures } = state;

  // Determine the attacker based on attack.attackerId or default to the first creature
  const attacker = attack?.attackerId
    ? playerCreatures.find((creature) => creature.ID === attack.attackerId)
    : playerCreatures[0];

  const [selectedTarget, setSelectedTarget] = useState(null);

  // Handler for selecting a creature as the target
  const handleSelectTarget = (creature) => {
    setSelectedTarget(creature);
    console.log(`Target selected: ${creature.name} with ID: ${creature.ID}`);
  };

  const handleConfirmTarget = () => {
    const isPlayerAttack = playerCreatures.some(
      (creature) => creature.ID === attacker.ID
    );

    console.log(
      `Target confirmed: ${selectedTarget.name}, ID: ${selectedTarget.ID}. Performing Atk:  attacker,
      selectedTarget,
      isPlayerAttack,
      playerCreatureControlsRef,
      enemyCreatureControlsRef,
      attack`,
      attacker,
      selectedTarget,
      isPlayerAttack,
      playerCreatureControlsRef,
      enemyCreatureControlsRef,
      attack
    );
  };
  // Confirm selection and dispatch action
  //   const handleConfirmTarget = async () => {
  //     if (selectedTarget) {
  //       // Determine if it's a player or enemy attack based on the attacker
  //       const isPlayerAttack = playerCreatures.some(creature => creature.ID === attacker.ID);

  //       // Perform the attack with necessary parameters
  //       const damage = await performAttack(
  //         attacker,
  //         selectedTarget,
  //         isPlayerAttack,
  //         playerCreatureControlsRef,
  //         enemyCreatureControlsRef,
  //         attack
  //       );

  //       console.log(`Attack performed with ${damage} damage dealt.`);

  //       // Update game state, possibly dispatching an action
  //       dispatch({
  //         type: 'APPLY_DAMAGE',
  //         payload: { targetId: selectedTarget.ID, damage }
  //       });

  //       setSelectedTarget(null); // Reset selection after confirmation
  //       onClose(); // Close the modal
  //     } else {
  //       console.log("No target selected");
  //     }
  //   };

  return (
    <div className="container mx-auto p-4 bg-gray-900 text-gray-200">
      <h2 className="text-2xl font-bold text-yellow-500 mb-4">Choose Target</h2>

      {/* Display Attacker Info */}
      <div className="text-center mb-4">
        <div className="text-green-400">
          Attacker: <strong>{attacker.name}</strong> (ID: {attacker.ID})
        </div>
      </div>

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
        <button
          onClick={handleConfirmTarget}
          className="bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded"
        >
          Confirm Target
        </button>
      </div>
    </div>
  );
}
