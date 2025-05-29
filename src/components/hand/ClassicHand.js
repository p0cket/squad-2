import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { attacks } from "../../consts/attacks";
import AttackCard from "./AttackCard";
import CardModal from "./CardModal";
import ChooseTargetsModal from "../modals/chooseTargets/ChooseTargetsModal";
import { STATUS_EFFECTS } from "../../consts/statuses";

const ClassicHand = ({
  playerCreatureControlsRef,
  enemyCreatureControlsRef,
}) => {
  const [deck, setDeck] = useState([]);
  const [hand, setHand] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);
  const [selectedAttack, setSelectedAttack] = useState(null);

  const [showDeckModal, setShowDeckModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showChooseTargetsModal, setShowChooseTargetsModal] = useState(false);
  const toggleChooseTargetsModal = () =>
    setShowChooseTargetsModal(!showChooseTargetsModal);

  // State to track if component has been initialized
  const [isInitialized, setIsInitialized] = useState(false);

  const drawCard = useCallback((currentDeck, currentHand) => {
    if (currentDeck.length === 0) {
      console.log("No cards left in the deck!");
      return { newDeck: currentDeck, newHand: currentHand };
    }
    const newCard = currentDeck[0];
    const newDeck = currentDeck.slice(1);
    const newHand = [...currentHand, newCard];
    return { newDeck, newHand };
  }, []);

  const drawNewHand = useCallback((currentDeck, shouldDiscardCurrentHand = false) => {
    let newDeck = [...currentDeck];
    let newHand = [];
    
    // Only add current hand to discard if we're replacing an existing hand
    if (shouldDiscardCurrentHand) {
      setHand((currentHand) => {
        setDiscardPile((prev) => [...prev, ...currentHand]);
        return currentHand;
      });
    }
    
    for (let i = 0; i < 4; i++) {
      if (newDeck.length > 0) {
        const result = drawCard(newDeck, newHand);
        newDeck = result.newDeck;
        newHand = result.newHand;
      }
    }
    setDeck(newDeck);
    setHand(newHand);
  }, [drawCard]);

  const initializeDeck = useCallback(() => {
    const newDeck = Object.values(attacks).map((attack) => ({
      ...attack,
      id: Math.random().toString(36).substr(2, 9),
      icon: STATUS_EFFECTS[attack.effects?.[0]]?.icon || "🔥", // Fetch icon from effects, default if missing
    }));
    
    // Draw initial hand directly without using drawCard to avoid circular dependencies
    let newHand = [];
    let currentDeck = [...newDeck];
    for (let i = 0; i < 4; i++) {
      if (currentDeck.length > 0) {
        const newCard = currentDeck[0];
        currentDeck = currentDeck.slice(1);
        newHand = [...newHand, newCard];
      }
    }
    
    setDeck(currentDeck);
    setHand(newHand);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    // Only initialize once when component mounts
    if (!isInitialized) {
      initializeDeck();
    }
  }, [isInitialized, initializeDeck]);

  const drawOneCard = () => {
    if (deck.length > 0) {
      const { newDeck, newHand } = drawCard(deck, hand);
      setDeck(newDeck);
      setHand(newHand);
    } else {
      console.log("No cards left in the deck!");
    }
  };

  const shuffleDiscardIntoDeck = () => {
    const newDeck = [...deck, ...discardPile].sort(() => Math.random() - 0.5);
    setDeck(newDeck);
    setDiscardPile([]);
  };

  // Trigger ChooseTargets modal by selecting an attack
  const handleSelectAttack = (attack) => {
    setSelectedAttack(attack);
    toggleChooseTargetsModal();
    console.log(`Attack selected: ${attack.name}`);
  };

  const closeTargetModal = () => setSelectedAttack(null);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 via-gray-800 to-transparent backdrop-blur-sm border-t border-gray-700 z-50">
      {/* Header with deck info and controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/90 border-b border-gray-600">
        {/* Deck Stats */}
        <div className="flex items-center space-x-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2 cursor-pointer bg-blue-600/20 hover:bg-blue-600/30 px-3 py-1 rounded-lg border border-blue-500/30"
            onClick={() => setShowDeckModal(true)}
          >
            <span className="text-2xl">🎴</span>
            <div className="text-sm">
              <div className="text-blue-300 font-semibold">{deck.length}</div>
              <div className="text-xs text-gray-400">Deck</div>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2 cursor-pointer bg-red-600/20 hover:bg-red-600/30 px-3 py-1 rounded-lg border border-red-500/30"
            onClick={() => setShowDiscardModal(true)}
          >
            <span className="text-2xl">🗑️</span>
            <div className="text-sm">
              <div className="text-red-300 font-semibold">{discardPile.length}</div>
              <div className="text-xs text-gray-400">Discard</div>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={drawOneCard}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg text-sm font-medium shadow-lg border border-emerald-500/50"
          >
            Draw
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => drawNewHand(deck, true)}
            className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded-lg text-sm font-medium shadow-lg border border-amber-500/50"
          >
            New Hand
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={shuffleDiscardIntoDeck}
            className="bg-violet-600 hover:bg-violet-500 text-white px-3 py-1 rounded-lg text-sm font-medium shadow-lg border border-violet-500/50"
          >
            Shuffle
          </motion.button>
        </div>
      </div>

      {/* Hand Cards Container */}
      <div className="px-4 py-3">
        <motion.div
          className="flex justify-center gap-3 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
        >
          <AnimatePresence mode="sync">
            {hand.map((attack, index) => (
              <motion.div
                key={attack.id}
                initial={{ opacity: 0, y: 50, rotateY: -15 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  rotateY: 0,
                  x: index * -5, // Slight fan effect
                  zIndex: hand.length - index
                }}
                exit={{ 
                  opacity: 0, 
                  y: -50, 
                  scale: 0.8,
                  rotateY: 15 
                }}
                transition={{ 
                  duration: 0.4,
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -10, 
                  scale: 1.05,
                  zIndex: 100,
                  rotateY: 0,
                  x: 0,
                  transition: { duration: 0.2 }
                }}
                className="relative"
                style={{ 
                  perspective: "1000px",
                  transformStyle: "preserve-3d"
                }}
              >
                <AttackCard
                  attack={attack}
                  onClick={() => handleSelectAttack(attack)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Empty hand placeholder */}
          {hand.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center w-64 h-32 border-2 border-dashed border-gray-600 rounded-lg text-gray-500"
            >
              <div className="text-center">
                <div className="text-2xl mb-1">🃏</div>
                <div className="text-sm">No cards in hand</div>
                <div className="text-xs text-gray-600">Draw some cards!</div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      {showDeckModal && (
        <CardModal
          title="Deck"
          cards={deck}
          onClose={() => setShowDeckModal(false)}
        />
      )}
      {showDiscardModal && (
        <CardModal
          title="Discard Pile"
          cards={discardPile}
          onClose={() => setShowDiscardModal(false)}
        />
      )}
      {/* ChooseTargets Modal */}
      {selectedAttack && (
        <ChooseTargetsModal
          attack={selectedAttack}
          onClose={closeTargetModal}
          playerCreatureControlsRef={playerCreatureControlsRef}
          enemyCreatureControlsRef={enemyCreatureControlsRef}
          showChooseTargetsModal={showChooseTargetsModal}
          toggleChooseTargetsModal={toggleChooseTargetsModal}
        />
      )}
    </div>
  );
};

export default ClassicHand;
