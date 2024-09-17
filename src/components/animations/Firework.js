// Firework.js
import React from "react";
import { motion } from "framer-motion";

const Firework = React.memo(({ burst }) => {
  return (
    <motion.div
      className="absolute"
      style={{
        top: burst.top,
        left: burst.left,
      }}
      initial={{ scale: 0, opacity: 1 }}
      animate={{
        scale: [0, 1, 1.5],
        opacity: [1, 1, 0],
        transition: {
          duration: 1.5,
          ease: "easeOut",
        },
      }}
    >
      {/* Firework particles */}
      {Array.from({ length: 20 }).map((_, j) => (
        <motion.div
          key={`particle-${burst.id}-${j}`}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
          }}
          animate={{
            x: [
              0,
              Math.cos((j / 20) * Math.PI * 2) * 100,
              Math.cos((j / 20) * Math.PI * 2) * 150,
            ],
            y: [
              0,
              Math.sin((j / 20) * Math.PI * 2) * 100,
              Math.sin((j / 20) * Math.PI * 2) * 150,
            ],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 1.5,
            ease: "easeOut",
          }}
        />
      ))}
    </motion.div>
  );
});

export default Firework;
