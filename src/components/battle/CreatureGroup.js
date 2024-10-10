import React from "react";
import Creature from "../Creature";

const CreatureGroup = ({ creatures, isPlayer, isFlipped, setCreatureControls }) => {
  // Splitting the creatures array into first and the rest
  const firstCreature = creatures[0];
  const restOfCreatures = creatures.slice(1);

  // Define classes for size differences and row flipping logic
  const secondRowClass = "flex flex-row space-x-4"; // Regular row style
  const firstRowCreatureSize = "scale-100"; // Full size for first creature
  const secondRowCreatureSize = "scale-50"; // Smaller size for second row creatures

  const renderFirstRow = () => (
    <div className="flex flex-row justify-center">
      {firstCreature && (
        <div className={firstRowCreatureSize}>
          <Creature
            key={firstCreature.name}
            name={firstCreature.name}
            icon={firstCreature.icon}
            health={firstCreature.health}
            maxHealth={firstCreature.maxHealth}
            isPlayer={isPlayer}
            setCreatureControls={(name, data) => setCreatureControls(name, data, isPlayer)}
            creatureObj={firstCreature}
          />
        </div>
      )}
    </div>
  );

  const renderSecondRow = () => (
    <div className={secondRowClass}>
      {restOfCreatures.map((creature) => (
        <div key={creature.name} className={secondRowCreatureSize}>
          <Creature
            name={creature.name}
            icon={creature.icon}
            health={creature.health}
            maxHealth={creature.maxHealth}
            isPlayer={isPlayer}
            setCreatureControls={(name, data) => setCreatureControls(name, data, isPlayer)}
            creatureObj={creature}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col space-y-4">
      {/* Conditionally render rows based on isFlipped */}
      {isFlipped ? (
        <>
          {renderSecondRow()}
          {renderFirstRow()}
        </>
      ) : (
        <>
          {renderFirstRow()}
          {renderSecondRow()}
        </>
      )}
    </div>
  );
};

export default CreatureGroup;
