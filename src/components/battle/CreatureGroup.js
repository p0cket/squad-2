import React from "react"
import Creature from "../Creature"

const CreatureGroup = ({ creatures, isPlayer, setCreatureControls }) => {
    return (
      <div className="flex flex-row space-x-4">
        {creatures.map((creature) => (
          <Creature
            key={creature.name}
            name={creature.name}
            icon={creature.icon}
            health={creature.health}
            maxHealth={creature.maxHealth}
            isPlayer={isPlayer}
            setCreatureControls={(name, data) => setCreatureControls(name, data, isPlayer)}
            creatureObj={creature}
          />
        ))}
      </div>
    );
  };
  
export default CreatureGroup
