import React, { useState } from 'react';
import { Modal, Box, Button, Typography, Grid } from '@mui/material'; // Import MUI components
import { useStateContext } from '../../GameContext';

// Define styles for the modal in a dark theme
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  height: '80vh',
  bgcolor: '#1e1e1e',  // Dark background
  border: '2px solid #333',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.9)',
  color: '#f1f1f1',  // Light text color
  p: 3,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '12px',
};

const contentStyle = {
  flex: '1',
  overflowY: 'auto',
};

const buttonStyle = {
  color: '#f1f1f1',
  borderColor: '#f1f1f1',
  '&:hover': {
    backgroundColor: '#333',
  },
};

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
      <Button variant="contained" onClick={handleOpen} sx={{ backgroundColor: '#333', color: '#f1f1f1' }}>
        Open Levels Modal
      </Button>
      
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="levels-modal-title"
        aria-describedby="levels-modal-description"
      >
        <Box sx={modalStyle}>
          {levels.length > 0 ? (
            <>
              <Typography id="levels-modal-title" variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.6)' }}>
                Level {levels[currentLevelIndex].levelNumber}
              </Typography>

              {/* Compact content container */}
              <Box sx={contentStyle}>
                {/* Opponent Creatures */}
                <Grid container spacing={2} className="opponent-creatures mb-2">
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ color: '#ffd700', fontWeight: 'bold', textShadow: '1px 1px 3px rgba(0,0,0,0.6)' }}>
                      Opponent Creatures: {levels[currentLevelIndex].opponentCreatures.length}
                    </Typography>
                  </Grid>
                  {levels[currentLevelIndex].opponentCreatures.map((creature, idx) => (
                    <Grid item xs={6} key={idx}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Name:</strong> {creature.name}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Health:</strong> {creature.health}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Attack:</strong> {creature.attack}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Defence:</strong> {creature.defence}
                      </Typography>

                      {/* Display creature's mods */}
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Mods:</strong>
                      </Typography>
                      <ul className="ml-4">
                        {creature.mods.map((mod, modIdx) => (
                          <li key={modIdx} style={{ marginBottom: '4px' }}>
                            {mod.name} ({mod.type}: {mod.effect || mod.description}, Duration: {mod.duration || 'Permanent'})
                          </li>
                        ))}
                      </ul>
                    </Grid>
                  ))}
                </Grid>

                {/* Opponent Runes */}
                <Grid container spacing={2} className="opponent-runes mb-2">
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ color: '#ffd700', fontWeight: 'bold', textShadow: '1px 1px 3px rgba(0,0,0,0.6)' }}>
                      Opponent Runes:
                    </Typography>
                  </Grid>
                  {levels[currentLevelIndex].opponentRunes.map((rune, runeIdx) => (
                    <Grid item xs={6} key={runeIdx}>
                      <Typography variant="body2">
                        <strong>{rune.name}</strong> - {rune.effect}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>

                {/* Level Effects */}
                <Grid container spacing={2} className="level-effects mb-2">
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ color: '#ffd700', fontWeight: 'bold', textShadow: '1px 1px 3px rgba(0,0,0,0.6)' }}>
                      Level Effects:
                    </Typography>
                  </Grid>
                  {levels[currentLevelIndex].levelEffects.map((effect, effectIdx) => (
                    <Grid item xs={6} key={effectIdx}>
                      <Typography variant="body2">
                        <strong>{effect.name}</strong> - {effect.effect}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Navigation Buttons */}
              <Grid container justifyContent="space-between" mt={2}>
                <Button
                  variant="outlined"
                  onClick={handlePreviousLevel}
                  disabled={currentLevelIndex === 0}
                  sx={buttonStyle}
                >
                  Previous
                </Button>

                <Button
                  variant="outlined"
                  onClick={handleNextLevel}
                  disabled={currentLevelIndex === levels.length - 1}
                  sx={buttonStyle}
                >
                  Next
                </Button>
              </Grid>
            </>
          ) : (
            <Typography variant="body1" sx={{ color: '#f1f1f1', textAlign: 'center' }}>No levels generated.</Typography>
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default Levels;
