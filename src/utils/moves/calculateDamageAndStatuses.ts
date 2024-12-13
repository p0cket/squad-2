import { AttackPayload, LogType } from "../../consts/types/types"
import { logStep } from "../../debug/logUtils"
import { calcAttack, findRelevantStatusesToGive } from "./attackUtils"

export const calculateDamageAndStatuses = (attackPayload: AttackPayload) => {
  console.log(`❶ calculateDamageAndStatuses: attackPayload`, attackPayload)
  // do statuses land to be added to the char?
  // findRelevantStatusesToGive statuses to apply
  const newLogEntry: LogType = {
    message: `Calculating damage and statuses for attack`,
    timestamp: new Date().toISOString(),
    details: `#LFG`,
    source: "calculateDamageAndStatuses",
  }
  logStep(newLogEntry, attackPayload.dispatch)

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
