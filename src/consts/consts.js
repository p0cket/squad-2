export const cardDataList = [
  { name: 'Epic Dragon', description: 'A powerful dragon with fiery breath.', rarity: 'epic', image: `https://picsum.photos/seed/picsum/200/300` },
  { name: 'Mystic Phoenix', description: 'A mythical phoenix reborn from its ashes.', rarity: 'rare', image: `https://picsum.photos/seed/pheonix/200/300` },
  { name: 'Golden Knight', description: 'A valiant knight clad in shining armor.', rarity: 'common', image: 'https://picsum.photos/seed/knight/200/300' },
  { name: 'Shadow Assassin', description: 'A deadly assassin who strikes from the shadows.', rarity: 'rare', image: 'https://picsum.photos/seed/assassin/200/300' },
  { name: 'Forest Spirit', description: 'A gentle spirit protecting the ancient woods.', rarity: 'common', image: 'https://picsum.photos/200/300' }
];

export const statDescriptions = {
  creature: {
    name: "🦄",
    template: "unicorn",
    health: "MAX_HP",
    maxHealth: "MAX_HP",
    attack: 20,
    trueDamage: 10,
    defence: 5,
    statusEffects: [],
  },
  runes: {
    id: 1,
    name: "Rune of Strength",
    type: "Common",
    effect: "Increases the Attack stat of all creatures by 10.",
    cost: 100,
    count: 0,
    statEffect: { stat: "attack", value: 10 },
    icon: "💪",
  },
}

export const theme = {
  dark: {
    primary: "#f5f5f5",
    secondary: "#f5f5f5",
    tertiary: "#f5f5f5",
  },
  light: {
    primary: "#f5f5f5",
    secondary: "#f5f5f5",
    tertiary: "#f5f5f5",
  },
}

export const objShapeExamples = {
  creature: {
    unicorn: {
      name: "🦄",
      template: "unicorn",
      health: 100,
      maxHealth: 100,
      attack: 20,
      trueDamage: 10,
      defence: 5,
      statusEffects: [],
    },
  },
  rune: {
    id: 1,
    name: "Rune of Strength",
    type: "Common",
    effect: "Increases the Attack stat of all creatures by 10.",
    cost: 100,
    count: 0,
    statEffect: { stat: "attack", value: 10 },
    icon: "💪",
  },
}


export const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 700,
  // bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};