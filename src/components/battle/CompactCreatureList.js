const CompactCreatureList = ({
  creatures,
  onSelect,
  isPlayer,
  selectedTarget,
}) => {
  return (
    <div
      className={`flex flex-col space-y-2 ${
        isPlayer ? "items-start" : "items-end"
      }`}
    >
      {creatures.map((creature) => {
        return (
          <div
            key={creature.ID}
            className={`flex items-center space-x-2 cursor-pointer p-2 rounded-lg  hover:bg-gray-600`}
            style={{
              backgroundColor:
                selectedTarget?.ID === creature.ID
                  ? "rgba(0, 255, 0, 0.2)"
                  : "gray",
            }}
            onClick={() => onSelect(creature)}
          >
            <span className="text-xl">{creature.icon}</span>{" "}
            {/* Creature icon */}
            <div className="text-sm text-gray-200">
              <strong>{creature.name}</strong> {/* Creature name */}
              <div>
                HP: {creature.health}/{creature.maxHealth}
              </div>{" "}
              {/* Health info */}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CompactCreatureList;
