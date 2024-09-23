import { useRef, useCallback } from "react";

// Custom hook for managing player and enemy creature controls
export const useCreatureControls = () => {
  // Separate refs for player and enemy creatures
  const playerCreatureControlsRef = useRef({});
  const enemyCreatureControlsRef = useRef({});

  // Function to set creature controls, distinguishing between player and enemy
  const setCreatureControls = useCallback((name, data, isPlayer) => {
    if (isPlayer) {
      playerCreatureControlsRef.current[name] = data;
    } else {
      enemyCreatureControlsRef.current[name] = data;
    }
  }, []);

  return { playerCreatureControlsRef, enemyCreatureControlsRef, setCreatureControls };
};
