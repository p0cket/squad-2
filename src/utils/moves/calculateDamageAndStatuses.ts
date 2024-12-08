import { AttackPayload } from "../../consts/types"
import { calcAttack, findRelevantStatusesToGive } from "./attackUtils"

export const calculateDamageAndStatuses = (attackPayload: AttackPayload) => {
  console.log(`❶ calculateDamageAndStatuses: attackPayload`, attackPayload)
  // do statuses land to be added to the char?
  // findRelevantStatusesToGive statuses to apply
  const objAfterImmediateStatuses = findRelevantStatusesToGive(
    attackPayload,
    "beforeAttack"
  )

  const { statuses, damage } = calcAttack(
    objAfterImmediateStatuses.attacker,
    objAfterImmediateStatuses.target,
    objAfterImmediateStatuses.attack
  )
  console.log(
    `🔚 calculateDamageAndStatuses: objAfterImmediateStatuses, statuses, damage`,
    objAfterImmediateStatuses,
    statuses,
    damage
  )
  return { statuses, damage }
}
