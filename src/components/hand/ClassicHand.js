import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { attacks } from "../../consts/attacks";
import ChooseTargets from "../modals/ChooseTargetsModal";
import AttackCard from "./AttackCard";
import CardModal from "./CardModal";
import ChooseTargetsModal from "../modals/ChooseTargetsModal";
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
  const [showModal, setShowModal] = useState(false);
  const toggleModal = () => setShowModal(!showModal);

  useEffect(() => {
    initializeDeck();
  }, []);

  const initializeDeck = () => {
    const newDeck = Object.values(attacks).map((attack) => ({
      ...attack,
      id: Math.random().toString(36).substr(2, 9),
      icon: STATUS_EFFECTS[attack.effects?.[0]]?.icon || "🔥", // Fetch icon from effects, default if missing
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
    for (let i = 0; i < 4; i++) {
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

  const runAttack = (attack) => {
    //   const useAttack = (attack) => {
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
    toggleChooseTargetsModal();
    console.log(`Attack selected: ${attack.name}`);
  };

  const closeTargetModal = () => setSelectedAttack(null);

  return (
    <div className="container mx-auto px-1 py-1 bg-gray-900 text-gray-200">
      {/* <h1 className="text-2xl font-bold text-yellow-500 mb-1">
        Attack Selector
      </h1> */}
      {/* <div className="flex justify-between mb-1"> */}
      <div className="p-2">
        <span
          className="text-blue-400 cursor-pointer px-1"
          onClick={() => setShowDeckModal(true)}
        >
          Deck: {deck.length} 🎴
        </span>
        <span
          className="text-red-400 cursor-pointer px-1"
          onClick={() => setShowDiscardModal(true)}
        >
          Discard: {discardPile.length} 🗑️
        </span>
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
        className="grid sm:grid-cols-2 gap-2"
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
              <AttackCard
                attack={attack}
                // onUse={useAttack} //runAttack now
                onClick={() => handleSelectAttack(attack)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

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
