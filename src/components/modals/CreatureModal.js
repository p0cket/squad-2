// replaceCreatureModal.js
import React from "react"
import { Modal, Box, Typography, Card, CardContent } from "@mui/material"

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  maxWidth: 500,
  width: "90%",
  bgcolor: "#1a1a1a", // Dark background
  // color: '#e0e0e0',   // Light text
  boxShadow: 24,
  p: 4,
  borderRadius: "10px",
}

const replaceCreatureModal = ({ open, handleClose, creature, creatureData }) => {
  if (!creature) return null

  // Define properties to exclude or handle specially
  const excludedProperties = ["image", "name", "maxHealth"] // Add any properties you don't want to display
  const creatureProperties = Object.keys(creature).filter(
    (prop) => !excludedProperties.includes(prop)
  )

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="creature-modal-title"
      aria-describedby="creature-modal-description"
    >
      <Box sx={style}>
        <Card sx={{ bgcolor: "transparent", boxShadow: "none" }}>
          <CardContent>
            <Typography id="creature-modal-title" variant="h4" component="h2">
              {creature.name}
            </Typography>

            {/* Loop through the creature's properties */}
            <Typography id="creature-modal-description" sx={{ mt: 2 }}>
              {/* Display Health separately to include maxHealth */}
              <div className="text-white">
                <strong>Health:</strong> {creature.health} /{" "}
                {creature.maxHealth}
              </div>

              {/* Loop through other properties */}
              {creatureProperties.map((prop) => {
                // Format the property name (capitalize first letter)
                const formattedPropName =
                  prop.charAt(0).toUpperCase() + prop.slice(1)

                // Get the property value
                const value = creature[prop]

                // Check if the value is an object or array
                if (typeof value === "object" && value !== null) {
                  return (
                    <div key={prop}>
                      <strong className="text-white">
                        {formattedPropName}:
                      </strong>
                      <pre style={{ margin: 0 }} className="text-white">
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    </div>
                  )
                }

                // Display scalar values
                return (
                  <div key={prop} className='text-white'>
                    <strong >{formattedPropName}:</strong> {value}
                  </div>
                )
              })}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Modal>
  )
}

export default replaceCreatureModal
