// ReplaceCreatureModal.js
import React from "react";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useStateContext } from "../../GameContext";
import { getAliveCreatures } from "../../utils.js/battleUtils";

const ReplaceCreatureModal = ({ open, onSelect }) => {
  const state = useStateContext();
  const availableCreatures = getAliveCreatures(state.playerCreatures);
  return (
    <Modal
      open={open}
      onClose={() => {}}
      aria-labelledby="select-active-creature"
      aria-describedby="select-active-creature-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography id="select-active-creature" variant="h6" component="h2">
          Choose a New Active Creature
        </Typography>
        <Typography id="select-active-creature-description" sx={{ mt: 2 }}>
          Select one of your available creatures to become the new active
          creature.
        </Typography>
        <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          {availableCreatures
            .filter((creature) => creature.health > 0) // Only show creatures that are alive
            .map((creature) => (
              <Button
                key={creature.name}
                variant="contained"
                onClick={() => onSelect(creature.ID)}
              >
                {creature.name} (Health: {creature.health}/{creature.maxHealth})
              </Button>
            ))}
        </Box>
      </Box>
    </Modal>
  );
};

export default ReplaceCreatureModal;
