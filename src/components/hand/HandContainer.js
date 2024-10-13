
// HandContainer Component
import React from 'react';
import { AnimatePresence } from 'framer-motion';
import Card2 from '../animations/Card2';

const HandContainer = ({ containerRef, dealtCards, handleCardClick, containerWidth, handSize }) => {
  const cardWidth = 128; // 8rem (w-32)
  const cardSpacing = 8; // 0.5rem (m-2)
  const totalCardWidth = cardWidth + cardSpacing * 2;
  const maxCards = Math.floor(containerWidth / totalCardWidth);
  const stackingOffset = maxCards < handSize ? (containerWidth - totalCardWidth) / (handSize - 1) : totalCardWidth;

  return (
    <div ref={containerRef} className="relative w-full max-w-4xl h-64 mb-8">
      <AnimatePresence>
        {dealtCards.map((card, index) => (
          <Card2
            key={`${card.id}-${index}`}
            card={card}
            index={index}
            onClick={handleCardClick}
            x={index * stackingOffset}
            initialX={containerWidth / 2 - cardWidth / 2}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default HandContainer;
