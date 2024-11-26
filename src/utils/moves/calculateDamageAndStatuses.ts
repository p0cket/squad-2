import { AttackPayload } from "../../consts/types"
import { calcAttack, findRelevantProcs } from "./attackUtils"

export const calculateDamageAndStatuses = (
    attackPayload: AttackPayload
  ) => {
    console.log(`calculateDamageAndStatuses: attackPayload`, attackPayload)
    // findRelevantProcs
    const objAfterImmediateStatuses = findRelevantProcs(
      attackPayload,
      "beforeAttack"
    )
    console.log(
      `calculateDamageAndStatuses: objAfterImmediateStatuses`,
      objAfterImmediateStatuses
    )
  
    const { statuses, damage } = calcAttack(
      objAfterImmediateStatuses.attacker,
      objAfterImmediateStatuses.target,
      objAfterImmediateStatuses.attack
    )
  
    return { statuses, damage }
  }