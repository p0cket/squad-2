import React, { useState } from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';

// Modal styling
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
};

// Default emoji for card placeholder
const emojiPlaceholder = '🃏'; // Default card emoji (could be based on rarity or type)

// Card component
const Card = ({ cardData }) => {
  const [open, setOpen] = useState(false);

  // Handle modal open and close
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Define animation variants for card rarity
  const getAnimation = (rarity) => {
    switch (rarity) {
      case 'common':
        return {
          hover: { scale: 1.05, rotate: [0, 2, -2, 0], transition: { duration: 0.3 } },
          tap: { scale: 0.95 },
        };
      case 'rare':
        return {
          hover: { scale: 1.1, rotate: [0, 4, -4, 0], transition: { duration: 0.4 } },
          tap: { scale: 0.9 },
        };
      case 'epic':
        return {
          hover: { scale: 1.15, rotate: [0, 6, -6, 0], transition: { duration: 0.5 } },
          tap: { scale: 0.85 },
        };
      default:
        return {
          hover: { scale: 1.05, rotate: [0, 2, -2, 0], transition: { duration: 0.3 } },
          tap: { scale: 0.95 },
        };
    }
  };

  const { name, description, image, rarity } = cardData;

  return (
    <>
      {/* Card with Framer Motion */}
      <motion.div
        className={`card ${rarity}`}
        style={{
          width: '200px',
          height: '300px',
          backgroundSize: 'cover',
          borderRadius: '10px',
          boxShadow: '0 5px 10px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: image ? `url(${image})` : 'none',
          backgroundColor: image ? 'transparent' : '#f0f0f0', // Light background if no image
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: image ? 'transparent' : '#333', // Ensure emoji or text is visible if no image
        }}
        variants={getAnimation(rarity)} // Apply rarity-based animation
        whileHover="hover"
        whileTap="tap"
        onClick={handleOpen} // Open modal on click
      >
        {/* Show emoji if no image is available */}
        {!image && (
          <Typography variant="h1" component="div" sx={{ fontSize: '4rem' }}>
            {emojiPlaceholder}
          </Typography>
        )}

        {/* Overlay for card details */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            background: 'rgba(0, 0, 0, 0.6)',
            color: 'white',
            padding: '10px',
            textAlign: 'center',
            fontSize: '0.9rem',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {name}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Rarity: {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            {description.length > 50 ? `${description.slice(0, 50)}...` : description}
          </Typography>
        </div>
      </motion.div>

      {/* Modal for card details */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <motion.div
            style={{
              width: '150px',
              height: '250px',
              backgroundImage: image ? `url(${image})` : 'none',
              backgroundSize: 'cover',
              borderRadius: '10px',
              boxShadow: '0 5px 10px rgba(0,0,0,0.3)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: image ? 'transparent' : '#f0f0f0',
            }}
          >
            {/* Show emoji in modal if no image */}
            {!image && (
              <Typography variant="h1" component="div" sx={{ fontSize: '4rem' }}>
                {emojiPlaceholder}
              </Typography>
            )}
          </motion.div>
          <Box ml={2}>
            <Typography variant="h5">{name}</Typography>
            <Typography variant="body1">{description}</Typography>
            <Typography variant="subtitle1">Rarity: {rarity.charAt(0).toUpperCase() + rarity.slice(1)}</Typography>
            <Button onClick={handleClose} variant="contained" color="primary" sx={{ mt: 2 }}>
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default Card;
