import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, Zap, Heart, Skull, Gift, Feather, Flame, Droplet } from 'lucide-react';

const itemExamples = [
  { name: 'Creature Voucher', description: 'Summon a random creature', rarity: 'epic', icon: Gift, cost: 150 },
  { name: '35 Gems', description: 'Shiny currency', rarity: 'rare', icon: Coins, cost: 100 },
  { name: 'Health Boost', description: '+20 Max HP', rarity: 'common', icon: Heart, cost: 75 },
  { name: 'Lightning Strike', description: 'Deal 40 damage', rarity: 'rare', icon: Zap, cost: 120 },
  { name: 'Revive Potion', description: 'Cheat death once', rarity: 'epic', icon: Skull, cost: 200 },
  { name: 'Feather of Swiftness', description: '+2 Agility', rarity: 'common', icon: Feather, cost: 80 },
  { name: 'Flame Enchantment', description: 'Add fire damage', rarity: 'rare', icon: Flame, cost: 130 },
  { name: 'Water Walking', description: 'Walk on water', rarity: 'epic', icon: Droplet, cost: 180 },
];

const rarityColors = {
  common: 'bg-gray-600 text-gray-200',
  rare: 'bg-blue-600 text-blue-100',
  epic: 'bg-purple-600 text-purple-100'
};

const themes = {
  mystic: {
    bg: 'bg-indigo-900',
    card: 'bg-indigo-800 border-indigo-600',
    text: 'text-indigo-100',
    highlight: 'text-purple-300',
    button: 'bg-purple-600 hover:bg-purple-500 text-purple-100',
  },
  inferno: {
    bg: 'bg-red-900',
    card: 'bg-red-800 border-red-600',
    text: 'text-red-100',
    highlight: 'text-yellow-300',
    button: 'bg-yellow-600 hover:bg-yellow-500 text-yellow-100',
  },
  nature: {
    bg: 'bg-green-900',
    card: 'bg-green-800 border-green-600',
    text: 'text-green-100',
    highlight: 'text-emerald-300',
    button: 'bg-emerald-600 hover:bg-emerald-500 text-emerald-100',
  },
};

const ShopItem = ({ item, onPurchase, theme }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.05, rotate: isHovered ? [-1, 1, -1, 0] : 0 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="w-full"
    >
      <Card className={`${theme.card} overflow-hidden relative group`}>
        <CardContent className="p-4 flex flex-col items-center">
          <motion.div
            className="text-4xl mb-2"
            animate={{ rotate: isHovered ? 360 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <item.icon className={theme.highlight} />
          </motion.div>
          <h3 className={`text-lg font-bold ${theme.text} mb-1`}>{item.name}</h3>
          <p className={`text-xs ${theme.text} text-center mb-2 opacity-80`}>{item.description}</p>
          <Badge className={`${rarityColors[item.rarity]} px-2 py-1 text-xs`}>
            {item.rarity}
          </Badge>
          <motion.button 
            onClick={() => onPurchase(item)}
            className={`mt-2 px-3 py-1 ${theme.button} rounded-full text-sm transition-colors duration-200`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            Buy for {item.cost} 💰
          </motion.button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const FloatingParticle = ({ theme }) => {
  const randomPosition = () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
  });

  const [position, setPosition] = useState(randomPosition());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setPosition(randomPosition());
    }, 5000 + Math.random() * 5000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <motion.div
      className={`absolute w-2 h-2 rounded-full ${theme.highlight} opacity-50`}
      initial={position}
      animate={{
        x: position.x,
        y: position.y,
        opacity: [0.2, 0.5, 0.2],
      }}
      transition={{
        duration: 5,
        ease: "linear",
        opacity: {
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
        },
      }}
    />
  );
};

const Shop = () => {
  const [gold, setGold] = useState(500);
  const [currentTheme, setCurrentTheme] = useState('mystic');
  const theme = themes[currentTheme];

  const handlePurchase = (item) => {
    if (gold >= item.cost) {
      setGold(gold - item.cost);
      alert(`You purchased ${item.name}!`);
    } else {
      alert("Not enough gold!");
    }
  };

  return (
    <div className={`container mx-auto px-4 py-8 ${theme.bg} ${theme.text} min-h-screen relative overflow-hidden`}>
      {[...Array(20)].map((_, i) => (
        <FloatingParticle key={i} theme={theme} />
      ))}
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold ${theme.highlight}`}>Mystical Emporium</h1>
        <div className="flex items-center space-x-4">
          <div className={`text-xl font-semibold ${theme.highlight}`}>{gold} 💰</div>
          <select 
            value={currentTheme} 
            onChange={(e) => setCurrentTheme(e.target.value)}
            className={`${theme.button} rounded px-2 py-1`}
          >
            <option value="mystic">Mystic</option>
            <option value="inferno">Inferno</option>
            <option value="nature">Nature</option>
          </select>
        </div>
      </div>
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
      >
        <AnimatePresence>
          {itemExamples.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <ShopItem item={item} onPurchase={handlePurchase} theme={theme} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Shop;