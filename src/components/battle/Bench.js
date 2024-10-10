// // Bench.js
// import React from "react"
// import Creature from "../Creature"

// const Bench = ({ creatures, isPlayer, setCreatureControls, onSwitch }) => {
//   return (
//     <div className="flex flex-row space-x-4">
//       {creatures.map((creature) => (
//         <Creature
//           key={creature.name}
//           name={creature.name}
//           icon={creature.icon}
//           health={creature.health}
//           maxHealth={creature.maxHealth}
//           isPlayer={isPlayer}
//           setCreatureControls={(name, data) => setCreatureControls(name, data, isPlayer)}
//           creatureObj={creature}
//           onClick={() => onSwitch(creature)} // Add an onClick handler to switch the creature
//         />
//       ))}
//     </div>
//   )
// }

// export default Bench
