import { BaseCreature, Creature, Owner } from "../consts/types/types"

let creatureIdCounter = 0

export const generateUniqueId = () => {
  return creatureIdCounter++
}

export const creatureUniqueCreature = (creatureTemplate: BaseCreature, owner: Owner | null = null): Creature => {
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
