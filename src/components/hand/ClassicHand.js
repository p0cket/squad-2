import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { attacks, effects } from "../../consts/attacks";
import ChooseTargets from "../battle/ChooseTargets";

// Define color classes for each attack type
const typeColors = {
  Physical: "bg-gray-500 text-gray-100",
  Elemental: "bg-red-500 text-red-100",
  Support: "bg-green-500 text-green-100",
  Ranged: "bg-blue-500 text-blue-100",
  Aura: "bg-yellow-500 text-yellow-100",
  Environmental: "bg-emerald-500 text-emerald-100",
  Special: "bg-purple-500 text-purple-100",
  Combo: "bg-orange-500 text-orange-100",
  Stealth: "bg-indigo-500 text-indigo-100",
};

const AttackItem = ({ attack, onUse, showUseButton = true, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="w-full"
    onClick={onClick}
  >
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden relative cursor-pointer p-2 flex flex-col space-y-2">
      <div className="flex items-center space-x-3">
        {/* Attack Icon */}
        <motion.div
          className="text-2xl"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.3 }}
        >
          {attack?.icon}
        </motion.div>

        {/* Attack Details */}
        <div className="flex flex-col flex-grow">
          <h3 className="text-sm font-bold text-gray-200">{attack.name}</h3>
          <div className="flex items-center justify-between">
            {/* Type with Color */}
            <span
              className={`${
                typeColors[attack.attackType]
              } px-1 py-0.5 text-xs rounded`}
            >
              {attack.attackType}
            </span>

            {/* Additional Info (Effects, Damage) */}
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span>
                Effects:{" "}
                {attack?.effects
                  ?.map((effect) => effects?.[effect]?.name)
                  .join(", ")}
              </span>
              <span>DMG: {attack?.damage}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cost and Use Button */}
      <div className="flex justify-between items-center mt-1">
        <div className="text-xs font-semibold text-yellow-400">
          Chance: {attack?.chanceToLand * 100}%
        </div>
        {showUseButton && (
          <button
            onClick={() => onUse(attack)}
            className="bg-blue-600 hover:bg-blue-500 text-white py-1 px-2 rounded text-sm"
          >
            Use Attack
          </button>
        )}
      </div>
    </div>
  </motion.div>
);

const CardsModal = ({ title, cards, onClose }) => (
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
              <AttackItem
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

const ClassicHand = ({ playerCreatureControlsRef, enemyCreatureControlsRef }) => {
  const [deck, setDeck] = useState([]);
  const [hand, setHand] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);
  const [selectedAttack, setSelectedAttack] = useState(null);

  const [showDeckModal, setShowDeckModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  useEffect(() => {
    initializeDeck();
  }, []);

  const initializeDeck = () => {
    const newDeck = Object.values(attacks).map((attack) => ({
      ...attack,
      id: Math.random().toString(36).substr(2, 9),
      icon: effects[attack.effects?.[0]]?.icon || "🔥", // Fetch icon from effects, default if missing
    }));
    setDeck(newDeck);
    drawNewHand(newDeck);
  };

  const drawCard = (currentDeck = deck, currentHand = hand) => {
    if (currentDeck.length === 0) {
      console.log("No cards left in the deck!");
      return { newDeck: currentDeck, newHand: currentHand };
    }
    const newCard = currentDeck[0];
    const newDeck = currentDeck.slice(1);
    const newHand = [...currentHand, newCard];
    return { newDeck, newHand };
  };

  const drawNewHand = (currentDeck = deck) => {
    let newDeck = [...currentDeck];
    let newHand = [];
    for (let i = 0; i < 5; i++) {
      if (newDeck.length > 0) {
        const result = drawCard(newDeck, newHand);
        newDeck = result.newDeck;
        newHand = result.newHand;
      }
    }
    setDeck(newDeck);
    setHand(newHand);
    setDiscardPile([...discardPile, ...hand]);
  };

  const useAttack = (attack) => {
    console.log(`Used attack: ${attack.name}`);
    const newHand = hand.filter((card) => card.id !== attack.id);
    setHand(newHand);
    setDiscardPile([...discardPile, attack]);
  };

  const drawOneCard = () => {
    if (deck.length > 0) {
      const { newDeck, newHand } = drawCard();
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
    console.log(`Attack selected: ${attack.name}`);
  };

  const closeTargetModal = () => setSelectedAttack(null);

  return (
    <div className="container mx-auto px-1 py-1 bg-gray-900 text-gray-200">
      <h1 className="text-2xl font-bold text-yellow-500 mb-1">
        Attack Selector
      </h1>

      <div className="flex justify-between mb-1">
        <div
          className="text-blue-400 cursor-pointer"
          onClick={() => setShowDeckModal(true)}
        >
          Deck: {deck.length} 🎴
        </div>
        <div
          className="text-red-400 cursor-pointer"
          onClick={() => setShowDiscardModal(true)}
        >
          Discard: {discardPile.length} 🗑️
        </div>
      </div>

      <div className="flex space-x-2 mb-1">
        <button
          onClick={drawOneCard}
          className="bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded"
        >
          Draw Card
        </button>
        <button
          onClick={() => drawNewHand()}
          className="bg-yellow-600 hover:bg-yellow-500 text-white py-2 px-4 rounded"
        >
          Draw New Hand
        </button>
        <button
          onClick={shuffleDiscardIntoDeck}
          className="bg-purple-600 hover:bg-purple-500 text-white py-2 px-4 rounded"
        >
          Shuffle Discard into Deck
        </button>
      </div>

      <motion.div
        className="grid sm:grid-cols-3 gap-2"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
      >
        <AnimatePresence>
          {hand.map((attack) => (
            <motion.div
              key={attack.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.3 }}
            >
              <AttackItem
                attack={attack}
                onUse={useAttack}
                onClick={() => handleSelectAttack(attack)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Modals */}
      {showDeckModal && (
        <CardsModal
          title="Deck"
          cards={deck}
          onClose={() => setShowDeckModal(false)}
        />
      )}

      {showDiscardModal && (
        <CardsModal
          title="Discard Pile"
          cards={discardPile}
          onClose={() => setShowDiscardModal(false)}
        />
      )}

      {/* ChooseTargets Modal */}
      {selectedAttack && (
        <ChooseTargets
          attack={selectedAttack}
          onClose={closeTargetModal}
          playerCreatureControlsRef={playerCreatureControlsRef}
          enemyCreatureControlsRef={enemyCreatureControlsRef}
        />
      )}
    </div>
  );
};

export default ClassicHand;
