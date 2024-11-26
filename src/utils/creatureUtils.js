let creatureIdCounter = 0

export const generateUniqueId = () => {
  return creatureIdCounter++
}

export const creatureUniqueCreature = (creatureTemplate, owner = null) => {
  return {
    ...creatureTemplate,
    ID: generateUniqueId(),
    owner: owner,
  }
}

// We pass in an array of creature templates like [CREATURES.dragon, CREATURES.unicorn]
export const createUniqueParty = (creatureTemplates, owner) => {
  return creatureTemplates.map((template) => {
    return creatureUniqueCreature(template, owner)
  })
}
