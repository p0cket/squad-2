// Confetti.js
import React, { useRef } from "react";
import { motion } from "framer-motion";

const confettiVariants = {
  initial: { y: -100, opacity: 1 },
  animate: (i) => ({
    y: [0, 800],
    x: [0, -200 + Math.random() * 400],
    rotate: Math.random() * 360,
    opacity: [1, 1, 0],
    transition: {
      delay: i * 0.05,
      duration: 3,
      ease: "easeOut",
      repeat: Infinity,
    },
  }),
};

const Confetti = React.memo(() => {
  const confettiPieces = useRef(
    Array.from({ length: 100 }).map(() => ({
      key: Math.random(),
      color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      left: Math.random() * window.innerWidth,
    }))
  );

  return (
    <>
      {confettiPieces.current.map((piece, i) => (
        <motion.div
          key={`confetti-${piece.key}`}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: piece.color,
            top: -50,
            left: piece.left,
          }}
          variants={confettiVariants}
          initial="initial"
          animate="animate"
          custom={i}
        />
      ))}
    </>
  );
});

export default Confetti;
