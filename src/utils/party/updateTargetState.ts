import { Creature, StatusEffect } from "../../consts/types/types"

export const updateTargetState = (
  target: Creature,
  damage: number,
  statuses: StatusEffect[]
): Creature => {
  const updatedTarget = {
    ...target,
    health: Math.max(0, target.health - damage), // Ensure health doesn’t go below 0
    statuses: [
      ...(target.statuses?.filter(
        (status) => !statuses.some((newStatus) => newStatus.type === status.type)
      ) || []),
      ...statuses,
    ], // Replace existing statuses with new ones if they have the same type
  }
  console.log(
    `[updateTargetState]: updatedTarget,target,damage,statuses`,
    updatedTarget,
    target,
    damage,
    statuses
  )
  return updatedTarget
}

// export const updateTargetState = (
//   target: Creature,
//   damage: number,
//   statuses: StatusEffect[]
// ) => {
//   return {
//     ...target,
//     health: Math.max(0, target.health - damage),
//     statuses,
//   }
// }
