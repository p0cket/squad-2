import { useRef, useCallback } from "react";
import { Creature } from "../consts/types";
import { AnimationControls } from "framer-motion";

export type ControlDetails = {
  controls: AnimationControls,
  showDamage: (damage: number | null) => void,
  creature: Creature
};

export type ControlRef = {
  [key: string]: ControlDetails
}

// Custom hook for managing player and enemy creature controls
export const useCreatureControls = () => {
  // Separate refs for player and enemy creatures
  const playerCreatureControlsRef = useRef<ControlRef>({});
  const enemyCreatureControlsRef = useRef<ControlRef>({});

  // Function to set creature controls, distinguishing between player and enemy
  const setCreatureControls = useCallback((ID: string, data: ControlDetails, isPlayer: boolean) => {
    if (isPlayer) {
      playerCreatureControlsRef.current[ID] = data;
    } else {
      enemyCreatureControlsRef.current[ID] = data;
    }
  }, []);

  // console.log(`useCreatureControls`, playerCreatureControlsRef.current, enemyCreatureControlsRef.current);
  return { playerCreatureControlsRef, enemyCreatureControlsRef, setCreatureControls };
};


// useEffect(() => {
//   if (setCreatureControls) {
//     setCreatureControls(
//       ID,
//       {
//         controls,
//         showDamage: (damage) => {
//           setDamageAmount(damage);
//         },
//         creature: creatureObj,
//       },
//       isPlayer // Pass the isPlayer flag here
//     );
//   }
// }, [ID, controls, setCreatureControls, creatureObj, isPlayer]);
