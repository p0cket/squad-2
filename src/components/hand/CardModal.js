// CardModal Component
import React from "react";
import { motion } from "framer-motion";
import AttackCard from "./AttackCard";

// const CardModal = ({ selectedCard, setSelectedCard }) => (
//   <motion.div
//     initial={{ opacity: 0 }}
//     animate={{ opacity: 1 }}
//     exit={{ opacity: 0 }}
//     className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
//     onClick={() => setSelectedCard(null)}
//   >
//     <motion.div
//       initial={{ scale: 0.8, y: 50 }}
//       animate={{ scale: 1, y: 0 }}
//       exit={{ scale: 0.8, y: 50 }}
//       className={`${selectedCard.color} rounded-lg p-4 w-80`}
//       onClick={(e) => e.stopPropagation()}
//     >
//       <div className="w-full h-48 flex items-center justify-center mb-4">
//         <selectedCard.icon size={96} color="white" />
//       </div>
//       <div className="bg-white p-4 rounded">
//         <h2 className="text-xl font-bold mb-2">{selectedCard.name}</h2>
//         <p className="mb-2">{selectedCard.description}</p>
//         <p><strong>Attack:</strong> {selectedCard.attack}</p>
//         <p><strong>Defense:</strong> {selectedCard.defense}</p>
//         <button
//           onClick={() => setSelectedCard(null)}
//           className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
//         >
//           Close
//         </button>
//       </div>
//     </motion.div>
//   </motion.div>
// );
const CardModal = ({ title, cards, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-gray-800 p-4 rounded-lg w-3/4 max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <button onClick={onClose} className="text-white text-2xl">
          &times;
        </button>
      </div>
      <div className="space-y-2 overflow-y-auto max-h-96">
        {cards.length === 0 ? (
          <div className="text-gray-400">No cards</div>
        ) : (
          cards.map((card) => (
            <div key={card.id}>
              <AttackCard
                attack={card}
                onUse={() => console.log(`Used attack: ${card.name}`)}
                showUseButton={false}
              />
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

export default CardModal;
