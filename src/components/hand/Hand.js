import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import HandControls from './HandControls';
import HandContainer from './HandContainer';
import CardModal from './CardModal';
// import HandContainer from './HandContainer';
// import CardModal from './CardModal';

const Hand = () => {
  const [handSize, setHandSize] = useState(5);
  const [dealtCards, setDealtCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
    
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cardData = [
    { id: 1, name: 'Fire Dragon', description: 'A powerful dragon with fiery breath.', attack: 8, defense: 6, icon: 'Zap', color: 'bg-red-500' },
    { id: 2, name: 'Ice Mage', description: 'A skilled mage specializing in frost spells.', attack: 6, defense: 4, icon: 'User', color: 'bg-blue-500' },
    { id: 3, name: 'Stone Golem', description: 'A sturdy defender made of solid rock.', attack: 4, defense: 10, icon: 'Mountain', color: 'bg-gray-500' },
    { id: 4, name: 'Elven Archer', description: 'A precise archer with deadly aim.', attack: 7, defense: 3, icon: 'Target', color: 'bg-green-500' },
    { id: 5, name: 'Shadow Assassin', description: 'A stealthy killer striking from the shadows.', attack: 9, defense: 2, icon: 'User', color: 'bg-purple-500' },
  ];

  const dealCards = () => {
    const newHand = [];
    for (let i = 0; i < handSize; i++) {
      newHand.push(cardData[Math.floor(Math.random() * cardData.length)]);
    }
    setDealtCards(newHand);
  };

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  return (
    <div className="w-full flex flex-col justify-center">
      <HandControls handSize={handSize} setHandSize={setHandSize} dealCards={dealCards} />
      <HandContainer
        containerRef={containerRef}
        dealtCards={dealtCards}
        handleCardClick={handleCardClick}
        containerWidth={containerWidth}
        handSize={handSize}
      />
      <AnimatePresence>
        {selectedCard && (
          <CardModal selectedCard={selectedCard} setSelectedCard={setSelectedCard} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Hand;


