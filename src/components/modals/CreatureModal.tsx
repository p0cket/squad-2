// replaceCreatureModal.js
import React from "react"
import { Modal } from "@mui/material"
import { Creature } from "../../consts/types/types"

const modalClasses = "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[500px] w-[90%] bg-[#1a1a1a] shadow-2xl p-8 rounded-lg outline-none"

type ReplaceCreatureModalProps = {
  open: boolean;
  handleClose: () => void;
  creature: Creature;
}

const ReplaceCreatureModal: React.FC<ReplaceCreatureModalProps> = ({ open, handleClose, creature }) => {
  if (!creature) return null

  // Define properties to exclude or handle specially
  const excludedProperties: Array<keyof Creature> = ["name", "maxHealth"] // Add any properties you don't want to display
  const creatureProperties = Object.keys(creature).filter(
    (prop) => !excludedProperties.includes(prop as keyof Creature)
  ) as Array<keyof Creature>;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="creature-modal-title"
      aria-describedby="creature-modal-description"
    >
      <div className={modalClasses}>
        <div className="bg-transparent shadow-none">
          <div>
            <h2 id="creature-modal-title" className="text-3xl text-white font-normal">
              {creature.name}
            </h2>

            {/* Loop through the creature's properties */}
            <div id="creature-modal-description" className="mt-4">
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
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default ReplaceCreatureModal
