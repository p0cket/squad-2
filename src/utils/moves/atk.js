// import { performAttackAnimation } from "../anim/performAttackAnimation"

// export const addMoveToQue = (attackPayload) => {
//   const {
//     attacker,
//     target,
//     isPlayerAttack,
//     playerCreatureControlsRef,
//     enemyCreatureControlsRef,
//     attack,
//     dispatch,
//     playerCreatures,
//     computerCreatures,
//   } = attackPayload

//   const moveQue = [attackPayload]

//   runQue(moveQue, null)
// }

// const runQue = (moveQue, state) => {
//   console.log("Running move queue:", moveQue)
//   const currentMove = moveQue.shift()
//   if (!currentMove) {
//     console.log("No moves left in the queue.")
//     return
//   }
//   runMove(currentMove)
// }

// const runMove = (attackPayload) => {
//   const {
//     attacker,
//     target,
//     isPlayerAttack,
//     playerCreatureControlsRef,
//     enemyCreatureControlsRef,
//     attack,
//     dispatch,
//     playerCreatures,
//     computerCreatures,
//   } = attackPayload
//   const { attackerControls, targetControls, targetShowDamage } = getControls(
//     attacker,
//     target,
//     isPlayerAttack,
//     playerCreatureControlsRef,
//     enemyCreatureControlsRef
//   )

//   // run anim
//   // creature shakes
//   performAttackAnimation(attackerControls, targetControls, isPlayerAttack)
//     .then(() => {
//       console.log("Running move:", attackPayload)
//     })
//     .catch((error) => {
//       console.error("Error performing attack animation:", error)
//     })

//   // run target interception effects (anim, effects, dmg, wtvr)
//   // if (interceptionCondition){}

//   // ( prev calculateDamageAndStatuses )
//   // run dmg
//   // calculate damage
//   // run anim of dmg

//   // run status effects
//   // run anim of status effects
//   // apply status effects
// }
