import React, { useEffect, useState, FC } from "react";
import { motion, useAnimationControls } from "framer-motion";
import CreatureModal from "./modals/CreatureModal";
import { useDispatchContext } from "../GameContext";
import ReplaceCreatureModal from "./modals/ReplaceCreatureModal";
import { Creature as CreatureType } from "../consts/types/types";
import { ControlDetails } from "../hooks/useCreatureControls";

type CreatureProps = {
  position: unknown,
  isPlayer: boolean,
  setCreatureControls: (controls: ControlDetails) => void,
  creatureObj: CreatureType,
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
  const handleSelectNewActive = (newActiveCreatureID) => {
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
  // Register controls when the component mounts
  // useEffect(() => {
  //   if (setCreatureControls) {
  //     // console.log(
  //     //   `Setting creature controls for ID: ${ID}, Damage amount before reset:`,
  //     //   damageAmount
  //     // );
  //     setCreatureControls(ID, {
  //       controls,
  //       showDamage: (damage) => {
  //         console.log("showDamage received damage:", damage);
  //         // do we reset this by putting a
  //         // timer and setDamageAmount in 1 second to null?
  //         setDamageAmount(damage);
  //       },
  //       creature: creatureObj, // Ensure full creature object is passed
  //     });
  //   }
  // }, [ID, controls, setCreatureControls, creatureObj]);
  // In Creature component
  useEffect(() => {
    if (setCreatureControls) {
      setCreatureControls(
        ID,
        {
          controls,
          showDamage: (damage) => {
            setDamageAmount(damage);
          },
          creature: creatureObj,
        },
        isPlayer // Pass the isPlayer flag here
      );
    }
  }, [ID, controls, setCreatureControls, creatureObj, isPlayer]);

  return (
    <>
      <ReplaceCreatureModal
        open={selectNewActive}
        onSelect={handleSelectNewActive}
        // availableCreatures={getAliveCreatures(state.playerCreatures)}
      />
      <motion.div
        // called.
        // state health setHealth
        // useEffect( q.HealthChange(healthAmount, setHealth, health), [health])
        // in there: setHealth(health + healthAmount)
        // change health func.
        className={`flex flex-col items-center ${
          health <= 0 ? "opacity-50" : ""
        }`}
        animate={controls}
        initial={position}
        style={{ position: "relative", cursor: "pointer" }}
      >
        {/* Creature Icon */}
        <motion.div
          className={`text-6xl mb-2 ${health <= 0 ? "hidden" : ""}`}
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          onClick={handleOpenModal} // Open modal on click
        >
          {icon}
        </motion.div>
        {/* Show creature as defeated */}
        {health <= 0 && <div className="text-6xl mb-2">❌</div>}

        {/* Health Bar */}
        <div className="bg-gray-700 w-24 h-4 rounded-full overflow-hidden">
          <motion.div
            className="bg-green-500 h-full"
            initial={{ width: "100%" }} // Start with full health
            animate={{ width: `${(health / maxHealth) * 100}%` }} // Animate health bar reduction
          />
        </div>
        <div className="mt-1">
          {health} / {maxHealth}{" "}
          <span>
            {statuses?.map((status) => (
              <span
                key={status.id}
                className="relative group"
                style={{ cursor: "pointer" }}
              >
                {status.icon}
                <span className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-1">
                  {status.description}
                </span>
              </span>
            ))}
          </span>
        </div>

        {/* Damage Animation */}
        {damageAmount !== null && (
          <motion.div
            key={damageAmount} // Ensure key changes to trigger animation
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -50 }}
            transition={{ duration: 3 }}
            style={{
              position: "absolute",
              top: "-20px",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "1.5rem",
              color: "red",
            }}
            onAnimationComplete={() => setDamageAmount(null)} // Reset damage amount after animation
          >
            -{damageAmount}
          </motion.div>
        )}
      </motion.div>
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
