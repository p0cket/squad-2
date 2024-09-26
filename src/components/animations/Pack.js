import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "./Card";
// import Card from './Card'; // Import the Card component

const Pack = ({ variation, onApplyAura }) => {
  const [isOpened, setIsOpened] = useState(false);
  const [showCards, setShowCards] = useState(false);

  const handleClick = () => {
    setIsOpened(true);
    setTimeout(() => setShowCards(true), 1000);
  };

  const getPackAnimation = () => {
    switch (variation) {
      case 1:
        return {
          initial: { scale: 1, rotateY: 0 },
          animate: { scale: [1, 2.5, 0], rotateY: [0, 180, 720] },
          transition: { duration: 1.5, ease: "easeInOut" },
        };
      case 2:
        return {
          initial: { scale: 1, y: 0 },
          animate: { scale: [1, 1.5, 0.5, 0], y: [0, -100, 100, -200] },
          transition: { duration: 1.5, ease: "backInOut" },
        };
      case 3:
        return {
          initial: { scale: 1, opacity: 1 },
          animate: { scale: [1, 2, 0.5, 3, 0], opacity: [1, 0.8, 1, 0.5, 0] },
          transition: { duration: 2, ease: "easeInOut" },
        };
      default:
        return {
          initial: { scale: 1, opacity: 1 },
          animate: { scale: [1, 2, 0.5, 3, 0], opacity: [1, 0.8, 1, 0.5, 0] },
          transition: { duration: 2, ease: "easeInOut" },
        };
    }
  };

  const getCardAnimation = (index) => {
    return {
      initial: { scale: 0, opacity: 0, rotate: 90 },
      animate: { scale: 1, opacity: 1, rotate: 0 },
      transition: { delay: index * 0.2, duration: 0.5, ease: "backOut" },
    };
  };

  // Mock card data for demonstration
  const cardDataList = [
    { name: 'Epic Dragon', description: 'A powerful dragon with fiery breath.', rarity: 'epic', image: `https://picsum.photos/seed/picsum/200/300` },
    { name: 'Mystic Phoenix', description: 'A mythical phoenix reborn from its ashes.', rarity: 'rare', image: `https://picsum.photos/seed/pheonix/200/300` },
    { name: 'Golden Knight', description: 'A valiant knight clad in shining armor.', rarity: 'common', image: 'https://picsum.photos/seed/knight/200/300' },
    { name: 'Shadow Assassin', description: 'A deadly assassin who strikes from the shadows.', rarity: 'rare', image: 'https://picsum.photos/seed/assassin/200/300' },
    { name: 'Forest Spirit', description: 'A gentle spirit protecting the ancient woods.', rarity: 'common', image: 'https://picsum.photos/200/300' }
  ];

  return (
    <div className="relative flex items-center justify-center ">
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
                {cardDataList.map((cardData, index) => (
                  <motion.div key={index} {...getCardAnimation(index)}>
                    <Card cardData={cardData} />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Pack;

// import React, { useState } from "react"
// import { motion, AnimatePresence } from "framer-motion"

// const Pack = ({ variation, onApplyAura }) => {
//   const [isOpened, setIsOpened] = useState(false)
//   const [showCards, setShowCards] = useState(false)

//   const handleClick = () => {
//     setIsOpened(true)
//     setTimeout(() => setShowCards(true), 1000)
//   }

//   const getPackAnimation = () => {
//     switch (variation) {
//       case 1:
//         return {
//           initial: { scale: 1, rotateY: 0 },
//           animate: { scale: [1, 2.5, 0], rotateY: [0, 180, 720] },
//           transition: { duration: 1.5, ease: "easeInOut" },
//         }
//       case 2:
//         return {
//           initial: { scale: 1, y: 0 },
//           animate: { scale: [1, 1.5, 0.5, 0], y: [0, -100, 100, -200] },
//           transition: { duration: 1.5, ease: "backInOut" },
//         }
//       case 3:
//         return {
//           initial: { scale: 1, opacity: 1 },
//           animate: { scale: [1, 2, 0.5, 3, 0], opacity: [1, 0.8, 1, 0.5, 0] },
//           transition: { duration: 2, ease: "easeInOut" },
//         }
//       default:
//         console.error("dafault case: Invalid pack variation value")
//         return {
//           initial: { scale: 1, opacity: 1 },
//           animate: { scale: [1, 2, 0.5, 3, 0], opacity: [1, 0.8, 1, 0.5, 0] },
//           transition: { duration: 2, ease: "easeInOut" },
//         }
//     }
//   }

//   const getCardAnimation = (index) => {
//     return {
//       initial: { scale: 0, opacity: 0, rotate: 90 },
//       animate: { scale: 1, opacity: 1, rotate: 0 },
//       transition: { delay: index * 0.2, duration: 0.5, ease: "backOut" },
//     }
//   }

//   return (
//     <div className="relative  from-indigo-600 to-pink-500 flex items-center justify-center ">
//       {/* <div className="relative w-full h-screen bg-gradient-to-br from-indigo-600 to-pink-500 flex items-center justify-center overflow-hidden"> */}
//       <AnimatePresence>
//         {!isOpened && (
//           <motion.div
//             className="cursor-pointer"
//             whileHover={{ scale: [1.5, 0.7, 1.5] }}
//             animate={{ rotate: [0, 5, -5, 0] }}
//             transition={{ repeat: Infinity, duration: 2 }}
//             onClick={handleClick}
//           >
//              <p className="text-8xl font-bold text-white">🎁</p> {/* Replacing Shield with a gift emoji */}
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <AnimatePresence>
//         {isOpened && (
//           <>
//             <motion.div {...getPackAnimation()} className="absolute">
//             <p className="text-8xl font-bold text-white">🎁</p> 
//             </motion.div>

//             {showCards && (
//               <div className="flex justify-center space-x-4">
//                 {[...Array(5)].map((_, index) => (
//                   <motion.div
//                     key={index}
//                     className="w-20 h-32 bg-white rounded-lg shadow-lg"
//                     {...getCardAnimation(index)}
//                     onClick={() => onApplyAura("Aura of Fire")}
//                   >
//                     <div className="w-full h-full flex items-center justify-center text-2xl font-bold">
//                       🔥 {/* Aura icon */}
//                     </div>
//                   </motion.div>
//                 ))}
//               </div>
//             )}
//           </>
//         )}
//       </AnimatePresence>
//     </div>
//   )
// }

// export default Pack
