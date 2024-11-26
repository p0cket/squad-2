import { AttackPayload } from "../../consts/types"
import { calcAttack, findRelevantProcs } from "./attackUtils"
// import { calcAttack, findRelevantProcs } from "./attackUtils"
// import { calcAttack, findRelevantProcs } from "./attackUtils"

export const calculateDamageAndStatuses = (
    // attacker,
    // target,
    // isPlayerAttack,
    // playerCreatureControlsRef,
    // enemyCreatureControlsRef,
    // attack,
    // dispatch,
    // playerCreatures,
    // computerCreatures
    attackPayload: AttackPayload
  ) => {
    console.log(`calculateDamageAndStatuses: attackPayload`, attackPayload)
    // const {
    //   attacker,
    //   target,
    //   isPlayerAttack,
    //   playerCreatureControlsRef,
    //   enemyCreatureControlsRef,
    //   attack,
    //   dispatch,
    //   playerCreatures,
    //   computerCreatures,
    // } = attackPayload
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