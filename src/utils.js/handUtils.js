export const initializeDeck = (attacks, setDeck, effects) => {
  const newDeck = Object.values(attacks).map((attack) => ({
    ...attack,
    id: Math.random().toString(36).substr(2, 9),
    icon: effects[attack.effects?.[0]]?.icon || "🔥", // Fetch icon from effects, default if missing
  }))
  setDeck(newDeck)
  drawNewHand(newDeck)
}

export const drawCard = (currentDeck, currentHand) => {
  // export const drawCard = (currentDeck = deck, currentHand = hand) => {
  if (currentDeck.length === 0) {
    console.log("No cards left in the deck!")
    return { newDeck: currentDeck, newHand: currentHand }
  }
  const newCard = currentDeck[0]
  const newDeck = currentDeck.slice(1)
  const newHand = [...currentHand, newCard]
  return { newDeck, newHand }
}

// export const drawCard = (currentDeck = deck
export const drawNewHand = (
  currentDeck,
  setDeck,
  setHand,
  setDiscardPile,
  discardPile,
  hand
) => {
  let newDeck = [...currentDeck]
  let newHand = []
  for (let i = 0; i < 5; i++) {
    if (newDeck.length > 0) {
      const result = drawCard(newDeck, newHand)
      newDeck = result.newDeck
      newHand = result.newHand
    }
  }
  setDeck(newDeck)
  setHand(newHand)
  setDiscardPile([...discardPile, ...hand])
}

export const runAttack = (
  attack,
  setHand,
  setDiscardPile,
  discardPile,
  hand
) => {
  console.log(`Used attack: ${attack.name}`)
  const newHand = hand.filter((card) => card.id !== attack.id)
  setHand(newHand)
  setDiscardPile([...discardPile, attack])
}

export const drawOneCard = (deck, setDeck, setHand) => {
  if (deck.length > 0) {
    const { newDeck, newHand } = drawCard()
    setDeck(newDeck)
    setHand(newHand)
  } else {
    console.log("No cards left in the deck!")
  }
}

export const shuffleDiscardIntoDeck = (
  setDeck,
  setDiscardPile,
  deck,
  discardPile
) => {
  const newDeck = [...deck, ...discardPile].sort(() => Math.random() - 0.5)
  setDeck(newDeck)
  setDiscardPile([])
}

// Trigger ChooseTargets modal by selecting an attack
export const handleSelectAttack = (attack, setSelectedAttack) => {
  setSelectedAttack(attack)
  console.log(`Attack selected: ${attack.name}`)
}

export const closeTargetModal = (setSelectedAttack) => setSelectedAttack(null)
