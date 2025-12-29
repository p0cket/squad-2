import React, { useState } from 'react';
import { Modal, Button } from '@mui/material'; // Keeping Modal and Button for now
import { useStateContext } from '../../GameContext';

const modalClasses = "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80vh] bg-[#1e1e1e] border-2 border-[#333] shadow-2xl p-6 overflow-hidden flex flex-col rounded-xl text-[#f1f1f1] outline-none";

const Levels = () => {
  const { levels } = useStateContext(); // Access levels from global context
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0); // Track current level
  const [open, setOpen] = useState(false); // Control modal state

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleNextLevel = () => {
    if (currentLevelIndex < levels.length - 1) {
      setCurrentLevelIndex(currentLevelIndex + 1);
    }
  };

  const handlePreviousLevel = () => {
    if (currentLevelIndex > 0) {
      setCurrentLevelIndex(currentLevelIndex - 1);
    }
  };

  return (
    <div className="levels-container">
      <Button 
        variant="contained" 
        onClick={handleOpen} 
        className="bg-[#333] text-[#f1f1f1]"
        sx={{ backgroundColor: '#333', color: '#f1f1f1' }}
      >
        Open Levels Modal
      </Button>
      
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="levels-modal-title"
        aria-describedby="levels-modal-description"
      >
        <div className={modalClasses}>
          {levels.length > 0 ? (
            <>
              <h2 id="levels-modal-title" className="text-3xl font-bold mb-4 drop-shadow-md">
                Level {levels[currentLevelIndex].levelNumber}
              </h2>

              {/* Compact content container */}
              <div className="flex-1 overflow-y-auto">
                {/* Opponent Creatures */}
                <div className="opponent-creatures mb-2">
                  <div className="w-full mb-2">
                    <h3 className="text-xl font-bold text-[#ffd700] drop-shadow-sm">
                      Opponent Creatures: {levels[currentLevelIndex].opponentCreatures.length}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {levels[currentLevelIndex].opponentCreatures.map((creature, idx) => (
                      <div key={idx} className="col-span-1">
                        <p className="mb-1 text-sm">
                          <strong>Name:</strong> {creature.name}
                        </p>
                        <p className="mb-1 text-sm">
                          <strong>Health:</strong> {creature.health}
                        </p>
                        <p className="mb-1 text-sm">
                          <strong>Attack:</strong> {creature.attack}
                        </p>
                        <p className="mb-1 text-sm">
                          <strong>Defence:</strong> {creature.defense}
                        </p>

                        {/* Display creature's mods */}
                        <p className="mb-1 text-sm">
                          <strong>Mods:</strong>
                        </p>
                        <ul className="ml-4 list-disc text-sm">
                          {creature.mods.map((mod, modIdx) => (
                            <li key={modIdx} style={{ marginBottom: '4px' }}>
                              {mod.name} ({mod.type}: {mod.effect || mod.description}, Duration: {mod.duration || 'Permanent'})
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Opponent Runes */}
                <div className="opponent-runes mb-2 mt-4">
                  <div className="w-full mb-2">
                    <h3 className="text-xl font-bold text-[#ffd700] drop-shadow-sm">
                      Opponent Runes:
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {levels[currentLevelIndex].opponentRunes.map((rune, runeIdx) => (
                      <div key={runeIdx} className="col-span-1">
                        <p className="text-sm">
                          <strong>{rune.name}</strong> - {rune.effect}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Level Effects */}
                <div className="level-effects mb-2 mt-4">
                  <div className="w-full mb-2">
                    <h3 className="text-xl font-bold text-[#ffd700] drop-shadow-sm">
                      Level Effects:
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {levels[currentLevelIndex].levelEffects.map((effect, effectIdx) => (
                      <div key={effectIdx} className="col-span-1">
                        <p className="text-sm">
                          <strong>{effect.name}</strong> - {effect.effect}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-4">
                <Button
                  variant="outlined"
                  onClick={handlePreviousLevel}
                  disabled={currentLevelIndex === 0}
                  className="text-[#f1f1f1] border-[#f1f1f1] hover:bg-[#333]"
                  sx={{ color: '#f1f1f1', borderColor: '#f1f1f1', '&:hover': { backgroundColor: '#333' } }}
                >
                  Previous
                </Button>

                <Button
                  variant="outlined"
                  onClick={handleNextLevel}
                  disabled={currentLevelIndex === levels.length - 1}
                  className="text-[#f1f1f1] border-[#f1f1f1] hover:bg-[#333]"
                  sx={{ color: '#f1f1f1', borderColor: '#f1f1f1', '&:hover': { backgroundColor: '#333' } }}
                >
                  Next
                </Button>
              </div>
            </>
          ) : (
            <p className="text-center text-[#f1f1f1]">No levels generated.</p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Levels;
