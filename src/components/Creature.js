// Creature.js
import React, { useEffect, useState } from "react"
import { motion, useAnimationControls } from "framer-motion"
import { creatures } from "../GameContext" // Import creatures data
import CreatureModal from "./modals/CreatureModal"

const Creature = ({
  name,
  health,
  position,
  isPlayer,
  setCreatureControls,
  maxHealth,
  creatureObj,
}) => {
  const controls = useAnimationControls()
  const [damageAmount, setDamageAmount] = useState(null)
  const [openModal, setOpenModal] = useState(false) // State to control modal
  const handleOpenModal = () => setOpenModal(true)
  const handleCloseModal = () => setOpenModal(false)

  // Register controls when the component mounts
  useEffect(() => {
    if (setCreatureControls) {
      setCreatureControls(name, {
        controls,
        showDamage: (damage) => {
          setDamageAmount(damage)
        },
      })
    }
  }, [name, controls, setCreatureControls])

  return (
    <>
      <motion.div
        className={`flex flex-col items-center ${
          health <= 0 ? "opacity-50" : ""
        }`}
        animate={controls}
        initial={position}
        style={{ position: "relative", cursor: "pointer" }} // Add cursor pointer
        onClick={handleOpenModal} // Open modal on click
      >
        <motion.div
          className={`text-6xl mb-2 ${health <= 0 ? "hidden" : ""}`}
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          {name}
        </motion.div>
        {health <= 0 && <div className="text-6xl mb-2">❌</div>}
        <div className="bg-gray-700 w-24 h-4 rounded-full overflow-hidden">
          <motion.div
            className="bg-green-500 h-full"
            initial={{ width: "100%" }}
            animate={{ width: `${(health / maxHealth) * 100}%` }}
          />
        </div>
        <div className="mt-1">
          {health} / {maxHealth}
        </div>
        {/* Damage Number */}
        {damageAmount !== null && (
          <motion.div
            key={damageAmount}
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
            onAnimationComplete={() => setDamageAmount(null)}
          >
            -{damageAmount}
          </motion.div>
        )}
      </motion.div>
      {/* {creatureObj?.statusEffects?.length > 0 && (
        <div className="status-effects">
          {creatureObj?.statusEffects?.map((effect, index) => (
            <span key={index} title={effect.name}>
              {effect.icon}
            </span>
          ))}
        </div>
      )} */}
      {/* Render the CreatureModal */}
      <CreatureModal
        open={openModal}
        handleClose={handleCloseModal}
        // creature={{ ...creatureData, health, maxHealth }}
        creature={{ ...creatureObj, health, maxHealth }}
      />
    </>
  )
}

export default Creature
