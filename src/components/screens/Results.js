// Results.js
import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useDispatchContext } from "../../GameContext"
import Firework from "../animations/Firework"
import Confetti from "../animations/Confetti"
import Pack from "../animations/Pack"

const Results = ({ stats }) => {
  const dispatch = useDispatchContext()

  const handleNextBattle = () => {
    dispatch({ type: "CHANGE_SCREEN", payload: { screen: "battle" } })
  }

  const handleNewGame = () => {
    dispatch({ type: "RESET_GAME" })
  }

  // State to hold firework bursts
  const [fireworkBursts, setFireworkBursts] = useState([])

  useEffect(() => {
    let isMounted = true

    // Function to add a firework burst
    const addFireworkBurst = () => {
      if (isMounted) {
        setFireworkBursts((prevBursts) => [
          ...prevBursts,
          {
            id: Math.random(),
            top: Math.random() * window.innerHeight * 0.5,
            left: Math.random() * window.innerWidth,
          },
        ])

        // Schedule the next firework at a random interval
        const nextFireworkIn = Math.random() * 2000 + 500 // Between 0.5s and 2.5s
        setTimeout(addFireworkBurst, nextFireworkIn)
      }
    }

    // Start the first firework
    addFireworkBurst()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <motion.div
      className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-800 via-purple-900 to-black text-white p-4 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Firework Effect */}
      {fireworkBursts.map((burst) => (
        <Firework key={burst.id} burst={burst} />
      ))}

      {/* Confetti Effect */}
      <Confetti />

      <motion.h1
        className="text-6xl font-bold mb-8 text-yellow-400"
        initial={{ scale: 0.8, textShadow: "0px 0px 0px rgba(255,255,0,0)" }}
        animate={{
          scale: [1, 1.1, 1],
          textShadow: [
            "0px 0px 10px rgba(255,255,0,0.8)",
            "0px 0px 20px rgba(255,255,0,1)",
            "0px 0px 10px rgba(255,255,0,0.8)",
          ],
        }}
        transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
      >
        Victory!
      </motion.h1>

      <motion.p
        className="text-2xl mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        You have won the battle!
      </motion.p>
      {/* New Pack Component for Aura */}
      {/* <Pack variation={1} onApplyAura={handleApplyAura} /> */}
      <Pack variation={1} />
      <motion.div
        className="bg-gray-700 bg-opacity-50 p-6 rounded-lg mb-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="text-2xl mb-4 text-center">Battle Stats:</h2>
        <p className="text-xl">Enemies Defeated: {stats?.enemiesDefeated}</p>
        <p className="text-xl">Gold Earned: {stats?.goldEarned}</p>
        <p className="text-xl">Runes Collected: {stats?.runesCollected}</p>
      </motion.div>

      <motion.button
        onClick={handleNextBattle}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 mb-4"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        Next Battle
      </motion.button>

      <motion.button
        onClick={handleNewGame}
        className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        New Game
      </motion.button>
    </motion.div>
  )
}

export default Results

// import React, { useEffect, useState } from "react"
// import { motion } from "framer-motion"
// import { useDispatchContext, useStateContext } from "../../GameContext"
// import Firework from "../animations/Firework"
// import Confetti from "../animations/Confetti"
// import Pack from "../animations/Pack"
// // import PackVariation from "../components/PackVariation" // Import the new pack component

// const Results = ({ stats }) => {
//   const dispatch = useDispatchContext()
//   const state = useStateContext()

//   const handleNextBattle = () => {
//     dispatch({ type: "CHANGE_SCREEN", payload: { screen: "battle" } })
//   }

//   const handleNewGame = () => {
//     dispatch({ type: "RESET_GAME" })
//   }

//   // Function to handle applying the aura
//   const handleApplyAura = (auraName) => {
//     const creature = state.playerCreatures[0] // Select a creature to apply aura to (could be made dynamic)
//     dispatch({
//       type: "APPLY_AURA",
//       payload: {
//         creature,
//         aura: {
//           name: auraName,
//           effect: (attack) => Math.random() < 0.75, // 75% chance of applying status effect
//         },
//       },
//     })
//   }

//   return (
//     <motion.div
//       className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-800 via-purple-900 to-black text-white p-4 overflow-hidden"
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       transition={{ duration: 0.8, ease: "easeOut" }}
//     >
//       {/* Firework Effect */}
//       {fireworkBursts.map((burst) => (
//         <Firework key={burst.id} burst={burst} />
//       ))}

//       {/* Confetti Effect */}
//       <Confetti />

//       <motion.h1
//         className="text-6xl font-bold mb-8 text-yellow-400"
//         initial={{ scale: 0.8, textShadow: "0px 0px 0px rgba(255,255,0,0)" }}
//         animate={{
//           scale: [1, 1.1, 1],
//           textShadow: [
//             "0px 0px 10px rgba(255,255,0,0.8)",
//             "0px 0px 20px rgba(255,255,0,1)",
//             "0px 0px 10px rgba(255,255,0,0.8)",
//           ],
//         }}
//         transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
//       >
//         Victory!
//       </motion.h1>

//       <motion.p
//         className="text-2xl mb-4"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.5, duration: 0.5 }}
//       >
//         You have won the battle!
//       </motion.p>

//       {/* New Pack Component for Aura */}
//       <Pack variation={1} onApplyAura={handleApplyAura} />

//       <motion.div
//         className="bg-gray-700 bg-opacity-50 p-6 rounded-lg mb-6"
//         initial={{ opacity: 0, scale: 0.8 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ delay: 0.7, duration: 0.6, ease: "easeOut" }}
//       >
//         <h2 className="text-2xl mb-4 text-center">Battle Stats:</h2>
//         <p className="text-xl">Enemies Defeated: {stats?.enemiesDefeated}</p>
//         <p className="text-xl">Gold Earned: {stats?.goldEarned}</p>
//         <p className="text-xl">Runes Collected: {stats?.runesCollected}</p>
//       </motion.div>

//       <motion.button
//         onClick={handleNextBattle}
//         className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 mb-4"
//         whileHover={{ scale: 1.1 }}
//         whileTap={{ scale: 0.9 }}
//       >
//         Next Battle
//       </motion.button>

//       <motion.button
//         onClick={handleNewGame}
//         className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
//         whileHover={{ scale: 1.1 }}
//         whileTap={{ scale: 0.9 }}
//       >
//         New Game
//       </motion.button>
//     </motion.div>
//   )
// }

// export default Results
