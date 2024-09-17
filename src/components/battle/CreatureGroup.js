import React from "react";
import Creature from "./Creature";

const CreatureGroup = ({ creatures, isPlayer, setCreatureControls }) => {
  return (
    <div className="flex flex-row space-x-4">
      {creatures.map((creature) => (
        <Creature
          key={creature.name}
          name={creature.name}
          health={creature.health}
          maxHealth={creature.maxHealth}
          position={{ x: 0 }}
          isPlayer={isPlayer}
          setCreatureControls={setCreatureControls}
        />
      ))}
    </div>
  );
};

export default CreatureGroup;
