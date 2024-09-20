import { useRef, useCallback } from "react";

export const useCreatureControls = () => {
  const creatureControlsRef = useRef({});

  const setCreatureControls = useCallback((name, data) => {
    creatureControlsRef.current[name] = data;
  }, []);

  return { creatureControlsRef, setCreatureControls };
};
