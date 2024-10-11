let creatureIdCounter = 0

export const generateUniqueId = () => {
  return creatureIdCounter++
}

export const creatureUniqueCreature = (creatureTemplate) => {
  return {
    ...creatureTemplate,
    ID: generateUniqueId(),
  }
}

// We pass in an array of creature templates like [CREATURES.dragon, CREATURES.unicorn]
export const createUniqueParty = (creatureTemplates) => {
  return creatureTemplates.map((template) => {
    return creatureUniqueCreature(template)
  })
}
