// Creature.js
import React, { useEffect, useState } from "react"
import { motion, useAnimationControls } from "framer-motion"

const Creature = ({
  name,
  health,
  position,
  isPlayer,
  setCreatureControls,
  maxHealth,
}) => {
  const controls = useAnimationControls()
  const [damageAmount, setDamageAmount] = useState(null)

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
    <motion.div
      className={`flex flex-col items-center ${
        health <= 0 ? "opacity-50" : ""
      }`}
      animate={controls}
      initial={position}
      style={{ position: "relative" }} // Add position relative for absolute positioning of damage
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
          key={damageAmount} // Add key to ensure a new element is created for each damage
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
  )
}

export default Creature
