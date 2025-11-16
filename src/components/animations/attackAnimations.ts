import { AnimationControls } from "framer-motion";

//Helper function to move the attacker towards the target
export const moveAttacker = async (attackerControls: AnimationControls, direction: number, distance: number) => {
  console.group("Animation Step: Attacker Moving");
  console.log(
    "Attacker moving towards target... Direction:",
    direction,
    "Distance:",
    distance
  );
  try {
    await attackerControls.start({
      y: direction * distance,
      transition: { duration: 0.3 },
    });
  } catch (error) {
    console.error("Error moving attacker:", error);
  }
  console.groupEnd();
};

// Helper function to shake the target
export const shakeTarget = async (targetControls: AnimationControls) => {
  console.group("Animation Step: Target Shake");
  console.log("Target shaking...");
  try {
    await targetControls.start({
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.3 },
    });
  } catch (error) {
    console.error("Error shaking target:", error);
  }
  console.groupEnd();
};

// Helper function to return the attacker to the original position
export const returnAttacker = async (attackerControls: AnimationControls) => {
  console.group("Animation Step: Attacker Returning");
  console.log("Attacker returning to original position...");
  try {
    await attackerControls.start({
      y: 0,
      transition: { duration: 0.3 },
    });
  } catch (error) {
    console.error("Error returning attacker to position:", error);
  }
  console.groupEnd();
};
