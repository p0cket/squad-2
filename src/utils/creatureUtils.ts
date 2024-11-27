import { BaseCreature } from "../consts/types"
import { Owner } from "../consts/creatures"

let creatureIdCounter = 0

export const generateUniqueId = () => {
  return creatureIdCounter++
}

export const creatureUniqueCreature = (creatureTemplate: BaseCreature, owner: Owner | null = null) => {
  return {
    ...creatureTemplate,
    ID: generateUniqueId(),
    owner: owner,
  }
}

// We pass in an array of creature templates like [CREATURES.dragon, CREATURES.unicorn]
export const createUniqueParty = (creatureTemplates: BaseCreature[], owner: Owner) => {
  return creatureTemplates.map((template) => {
    return creatureUniqueCreature(template, owner)
  })
}
