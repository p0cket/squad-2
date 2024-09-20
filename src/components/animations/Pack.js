import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const Pack = ({ variation, onApplyAura }) => {
  const [isOpened, setIsOpened] = useState(false)
  const [showCards, setShowCards] = useState(false)

  const handleClick = () => {
    setIsOpened(true)
    setTimeout(() => setShowCards(true), 1000)
  }

  const getPackAnimation = () => {
    switch (variation) {
      case 1:
        return {
          initial: { scale: 1, rotateY: 0 },
          animate: { scale: [1, 2.5, 0], rotateY: [0, 180, 720] },
          transition: { duration: 1.5, ease: "easeInOut" },
        }
      case 2:
        return {
          initial: { scale: 1, y: 0 },
          animate: { scale: [1, 1.5, 0.5, 0], y: [0, -100, 100, -200] },
          transition: { duration: 1.5, ease: "backInOut" },
        }
      case 3:
        return {
          initial: { scale: 1, opacity: 1 },
          animate: { scale: [1, 2, 0.5, 3, 0], opacity: [1, 0.8, 1, 0.5, 0] },
          transition: { duration: 2, ease: "easeInOut" },
        }
      default:
        console.error("dafault case: Invalid pack variation value")
        return {
          initial: { scale: 1, opacity: 1 },
          animate: { scale: [1, 2, 0.5, 3, 0], opacity: [1, 0.8, 1, 0.5, 0] },
          transition: { duration: 2, ease: "easeInOut" },
        }
    }
  }

  const getCardAnimation = (index) => {
    return {
      initial: { scale: 0, opacity: 0, rotate: 90 },
      animate: { scale: 1, opacity: 1, rotate: 0 },
      transition: { delay: index * 0.2, duration: 0.5, ease: "backOut" },
    }
  }

  return (
    <div className="relative  from-indigo-600 to-pink-500 flex items-center justify-center ">
      {/* <div className="relative w-full h-screen bg-gradient-to-br from-indigo-600 to-pink-500 flex items-center justify-center overflow-hidden"> */}
      <AnimatePresence>
        {!isOpened && (
          <motion.div
            className="cursor-pointer"
            whileHover={{ scale: [1.5, 0.7, 1.5] }}
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            onClick={handleClick}
          >
             <p className="text-8xl font-bold text-white">🎁</p> {/* Replacing Shield with a gift emoji */}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpened && (
          <>
            <motion.div {...getPackAnimation()} className="absolute">
            <p className="text-8xl font-bold text-white">🎁</p> 
            </motion.div>

            {showCards && (
              <div className="flex justify-center space-x-4">
                {[...Array(5)].map((_, index) => (
                  <motion.div
                    key={index}
                    className="w-20 h-32 bg-white rounded-lg shadow-lg"
                    {...getCardAnimation(index)}
                    onClick={() => onApplyAura("Aura of Fire")}
                  >
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold">
                      🔥 {/* Aura icon */}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Pack
