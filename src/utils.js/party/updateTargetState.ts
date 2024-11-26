import { Creature, StatusEffect } from "../../consts/types"

export const updateTargetState = (
  target: Creature,
  damage: number,
  statuses: StatusEffect[]
) => {
  return {
    ...target,
    health: Math.max(0, target.health - damage),
    statuses,
  }
}
