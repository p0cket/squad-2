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
    attackPayload
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