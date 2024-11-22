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

//partyUtils instead?
export const moveDeadCreaturesToBack = (creatures, side, dispatch) => {
  creatures.forEach((creature) => {
    if (creature.health <= 0) {
      dispatch({
        type: "MOVE_CREATURE_TO_BACK",
        payload: { side, creatureId: creature.ID },
      })
    }
  })
}
