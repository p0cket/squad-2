import { Creature } from "../../consts/types"

export const updateTargetState = (
  target: Creature,
  damage: number,
  statuses
) => {
  return {
    ...target,
    health: Math.max(0, target.health - damage),
    statuses,
  }
}
