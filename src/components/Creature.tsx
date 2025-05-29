// @ts-nocheck
import React, { useEffect, useState, FC } from "react";
import { useAnimationControls } from "framer-motion";
import CreatureModal from "./modals/CreatureModal";
import { useDispatchContext } from "../GameContext";
import ReplaceCreatureModal from "./modals/ReplaceCreatureModal";
import { Creature as CreatureType } from "../consts/types/types";
import { ControlDetails } from "../hooks/useCreatureControls";

type CreatureProps = {
  position: unknown;
  isPlayer: boolean;
  setCreatureControls: (controls: ControlDetails) => void;
  creatureObj: CreatureType;
};

const Creature: FC<CreatureProps> = ({
  position,
  isPlayer,
  setCreatureControls,
  creatureObj,
}) => {
  const { ID, icon, health, maxHealth, statuses } = creatureObj;
  const dispatch = useDispatchContext();
  const controls = useAnimationControls();
  const [damageAmount, setDamageAmount] = useState(null);
  const [openModal, setOpenModal] = useState(false); // State to control modal

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const [selectNewActive, setSelectNewActive] = useState(false);
  // Function to handle new active creature selection
  const handleSelectNewActive = (
    newActiveCreatureID,
    dispatch,
    setSelectNewActive
  ) => {
    setSelectNewActive(false);
    dispatch({
      type: "SWAP_CREATURE_POSITION",
      payload: {
        side: "playerCreatures",
        newActiveCreatureID,
      },
    });
  };

  useEffect(() => {
    if (isPlayer && health <= 0 && position === 0) {
      setSelectNewActive(true); // Trigger modal if the active creature is dead
    }
  }, [health, isPlayer, position]);
  // Register controls when the component mounts ?? There was code here
  useEffect(() => {
    if (setCreatureControls) {
      setCreatureControls(
        ID,
        {
          controls,
          showDamage: (damage: number) => {
            setDamageAmount(damage);
          },
          creature: creatureObj,
        },
        isPlayer
      );
    }
  }, [ID, controls, setCreatureControls, creatureObj, isPlayer]);

  return (
    <>
      <ReplaceCreatureModal
        open={selectNewActive}
        // onSelect pass in the newActiveCreatID and dispatch and setSelectNewActive
        // onSelect={() handleSelectNewActive(newActiveCreatureID, dispatch, setSelectNewActive)}
        // prev was:
        // onSelect={handleSelectNewActive}
        //--
        // availableCreatures={getAliveCreatures(state.playerCreatures)}
      />
      <div
        className={`relative p-3 border border-gray-600 rounded-lg shadow-lg transition-all duration-300 ${
          health <= 0 ? "opacity-50" : "hover:border-gray-500 hover:shadow-xl hover:shadow-blue-500/20 hover:scale-105"
        }`}
        style={{ 
          cursor: "pointer", 
          minWidth: "100px",
          background: health > 0 
            ? "linear-gradient(135deg, #374151 0%, #1f2937 50%, #111827 100%)"
            : "linear-gradient(135deg, #4b5563 0%, #374151 50%, #1f2937 100%)"
        }}
        onClick={handleOpenModal}
        title={`Click to view ${creatureObj.name} details`}
      >
        {/* Creature Icon */}
        <div className="flex flex-col items-center">
          <div
            className={`text-5xl mb-2 transition-transform duration-200 ${health <= 0 ? "hidden" : ""}`}
            style={{
              animation: health > 0 ? "float 3s ease-in-out infinite" : "none",
              animationDelay: health > 0 ? `${(ID % 5) * 0.5}s` : "0s"
            }}
          >
            {icon}
          </div>
          
          {/* Show creature as defeated */}
          {health <= 0 && (
            <div className="text-5xl mb-2">
              💀
            </div>
          )}

          {/* Health Bar Container */}
          <div className="w-full mb-2">
            <div className="bg-gray-700 w-full h-2 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  health <= 0 ? "bg-red-500" : ""
                }`}
                style={{ 
                  width: `${Math.max(0, (health / maxHealth) * 100)}%`,
                  background: health > 0 
                    ? "linear-gradient(90deg, #10b981 0%, #34d399 100%)"
                    : "#ef4444"
                }}
              />
            </div>
          </div>

          {/* Health Text */}
          <div className="text-center text-sm text-white mb-1">
            {health} / {maxHealth}
          </div>

          {/* Status Effects */}
          {statuses && statuses.length > 0 && (
            <div className="flex justify-center space-x-1">
              {statuses.map((status) => (
                <span
                  key={status.id}
                  className="text-xs bg-gray-700 rounded px-1"
                  title={status.description}
                >
                  {status.icon}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Simple Damage Animation */}
        {damageAmount !== null && (
          <div
            className="absolute top-0 left-1/2 transform -translate-x-1/2 text-red-500 font-bold text-lg pointer-events-none"
            style={{ 
              animation: "fadeOut 1s ease-out forwards"
            }}
            onAnimationEnd={() => setDamageAmount(null)}
          >
            -{damageAmount}
          </div>
        )}
      </div>
      {/* Render the CreatureModal */}
      <CreatureModal
        open={openModal}
        handleClose={handleCloseModal}
        creature={{ ...creatureObj, health, maxHealth }} // Pass health and maxHealth
      />
    </>
  );
};

export default Creature;
