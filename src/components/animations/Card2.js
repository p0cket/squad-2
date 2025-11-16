import { motion } from "framer-motion";

const Card2 = ({ card, index, onClick, x, initialX }) => {
  const Icon = card.icon;
  return (
    <motion.div
      initial={{ scale: 0.5, y: -300, x: initialX, rotateY: 180 }}
      animate={{
        scale: 1,
        y: 0,
        x: x,
        rotateY: 0,
        zIndex: index,
      }}
      exit={{ scale: 0.5, y: -300, rotateY: -180 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.05, zIndex: 100 }}
      onClick={() => onClick(card)}
      className={`absolute w-32 h-48 ${card.color} rounded-lg shadow-lg cursor-pointer overflow-hidden`}
    >
      <div className="w-full h-24 flex items-center justify-center">
        <Icon size={48} color="white" />
        <p>P</p>
      </div>
      <div className="p-2 bg-white">
        <h3 className="font-bold text-sm">{card.name}</h3>
        <p className="text-xs">
          ATK: {card.attack} | DEF: {card.defense}
        </p>
      </div>
    </motion.div>
  );
};

export default Card2;
