//partyUtils instead?

import { Creature } from "../../consts/types"
import { Dispatch } from "react"

type Side = "playerCreatures" | "computerCreatures"

export const moveDeadCreaturesToBack = (
  creatures: Creature[],
  side: Side,
  dispatch: Dispatch<{
    type: string
    payload: { side: Side; creatureId: number | undefined }
  }>
) => {
  creatures.forEach((creature: Creature) => {
    if (creature.health <= 0) {
      dispatch({
        type: "MOVE_CREATURE_TO_BACK",
        payload: { side, creatureId: creature.ID },
      })
    }
  })
}
