import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Sample attacks data
const allAttacks = [
  { from: 'player', name: 'Firebolt', type: 'Fire', icon: '🔥', damage: 15, cost: 2 },
  { from: 'unicorn', name: 'Punch', type: 'Physical', icon: '👊', damage: 10, cost: 1 },
  { from: 'enemy', name: 'Lightning', type: 'Electric', icon: '⚡', damage: 20, cost: 3 },
  { from: 'enemy', name: 'Gust', type: 'Wind', icon: '💨', damage: 8, cost: 1 },
  { from: 'player', name: 'Block', type: 'Defense', icon: '🛡️', damage: 0, cost: 1 },
  { from: 'player', name: 'Slash', type: 'Physical', icon: '🗡️', damage: 12, cost: 2 },
  { from: 'player', name: 'Heal', type: 'Support', icon: '💚', damage: -10, cost: 2 },
  { from: 'enemy', name: 'Poison', type: 'Nature', icon: '☠️', damage: 5, cost: 1 },
  { from: 'enemy', name: 'Earthquake', type: 'Earth', icon: '🌋', damage: 18, cost: 3 },
  { from: 'enemy', name: 'Freeze', type: 'Ice', icon: '❄️', damage: 12, cost: 2 },
];

// Color classes for each attack type
const typeColors = {
  Fire: 'bg-red-500 text-red-100',
  Physical: 'bg-gray-500 text-gray-100',
  Electric: 'bg-yellow-500 text-yellow-100',
  Wind: 'bg-blue-500 text-blue-100',
  Defense: 'bg-green-500 text-green-100',
  Support: 'bg-pink-500 text-pink-100',
  Nature: 'bg-emerald-500 text-emerald-100',
  Earth: 'bg-amber-500 text-amber-100',
  Ice: 'bg-cyan-500 text-cyan-100',
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
          {attack.icon}
        </motion.div>

        {/* Attack Details - Horizontal Layout */}
        <div className="flex flex-col flex-grow">
          <h3 className="text-sm font-bold text-gray-200">{attack.name}</h3>
          <div className="flex items-center justify-between">
            {/* Type with Color */}
            <span className={`${typeColors[attack.type]} px-1 py-0.5 text-xs rounded`}>
              {attack.type}
            </span>

            {/* Additional Info (From and Damage) */}
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span>from: {attack.from}</span>
              <span>DMG: {attack.damage}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cost and Use Button */}
      <div className="flex justify-between items-center mt-1">
        <div className="text-xs font-semibold text-yellow-400">Cost: {attack.cost} ⚡</div>
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

// Modal Component
const CardsModal = ({ title, cards, onClose, onCardClick }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-gray-800 p-4 rounded-lg w-3/4 max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <button onClick={onClose} className="text-white text-2xl">&times;</button>
      </div>
      <div className="space-y-2 overflow-y-auto max-h-96">
        {cards.length === 0 ? (
          <div className="text-gray-400">No cards</div>
        ) : (
          cards.map(card => (
            <div key={card.id}>
              <AttackItem
                attack={card}
                onUse={() => {}}
                showUseButton={false}
                onClick={() => onCardClick(card)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

const ClassicHand = () => {
  const [deck, setDeck] = useState([]);
  const [hand, setHand] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);

  const [showDeckModal, setShowDeckModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showHandModal, setShowHandModal] = useState(false);

  useEffect(() => {
    initializeDeck();
  }, []);

  const initializeDeck = () => {
    const newDeck = [...Array(20)].map(() => ({
      ...allAttacks[Math.floor(Math.random() * allAttacks.length)],
      id: Math.random().toString(36).substr(2, 9)
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
    const newHand = hand.filter(card => card.id !== attack.id);
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

  const handleCardClick = (card) => {
    console.log(`Clicked on ${card.name}`);
    // Implement any additional functionality here
  };

  return (
    <div className="container mx-auto px-1 py-1 bg-gray-900 text-gray-200">
      <h1 className="text-2xl font-bold text-yellow-500 mb-1">Attack Selector</h1>

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

      <div
        onClick={() => setShowHandModal(true)}
        className="cursor-pointer"
      >
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
                <AttackItem attack={attack} onUse={useAttack} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Modals */}
      {showDeckModal && (
        <CardsModal
          title="Deck"
          cards={deck}
          onClose={() => setShowDeckModal(false)}
          onCardClick={handleCardClick}
        />
      )}

      {showDiscardModal && (
        <CardsModal
          title="Discard Pile"
          cards={discardPile}
          onClose={() => setShowDiscardModal(false)}
          onCardClick={handleCardClick}
        />
      )}

      {showHandModal && (
        <CardsModal
          title="Hand"
          cards={hand}
          onClose={() => setShowHandModal(false)}
          onCardClick={handleCardClick}
        />
      )}
    </div>
  );
};

export default ClassicHand;
