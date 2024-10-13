
// CardModal Component
import React from 'react';
import { motion } from 'framer-motion';

const CardModal = ({ selectedCard, setSelectedCard }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    onClick={() => setSelectedCard(null)}
  >
    <motion.div
      initial={{ scale: 0.8, y: 50 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.8, y: 50 }}
      className={`${selectedCard.color} rounded-lg p-4 w-80`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-full h-48 flex items-center justify-center mb-4">
        <selectedCard.icon size={96} color="white" />
      </div>
      <div className="bg-white p-4 rounded">
        <h2 className="text-xl font-bold mb-2">{selectedCard.name}</h2>
        <p className="mb-2">{selectedCard.description}</p>
        <p><strong>Attack:</strong> {selectedCard.attack}</p>
        <p><strong>Defense:</strong> {selectedCard.defense}</p>
        <button
          onClick={() => setSelectedCard(null)}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        >
          Close
        </button>
      </div>
    </motion.div>
  </motion.div>
);

export default CardModal;