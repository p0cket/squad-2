import { RefObject } from "react"
import { Creature } from "../../consts/types"

export const getControls = (
  attacker: Creature,
  target: Creature,
  isPlayerAttack: boolean,
  playerCreatureControlsRef: React.RefObject<any>,
  enemyCreatureControlsRef: React.RefObject<any>
) => {
  const controlsRef = isPlayerAttack
    ? playerCreatureControlsRef
    : enemyCreatureControlsRef

  console.log(
    `getControls: attacker, target, isPlayerAttack, playerCreatureControlsRef, enemyCreatureControlsRef`,
    attacker,
    target,
    isPlayerAttack,
    playerCreatureControlsRef,
    enemyCreatureControlsRef
  )

  const attackerControls = controlsRef.current[attacker.ID]?.controls
  const targetControls = getCreatureControlsById(
    target.ID,
    playerCreatureControlsRef,
    enemyCreatureControlsRef
  )?.controls
  const targetShowDamage = getCreatureControlsById(
    target.ID,
    playerCreatureControlsRef,
    enemyCreatureControlsRef
  )?.showDamage

  if (!attackerControls || !targetControls) {
    console.warn(
      `%c⚠️ Animation controls not found for attacker ID: ${attacker.ID} or target ID: ${target.ID}, skipping attack animation.`,
      "color: orange; font-weight: bold;"
    )
    console.groupEnd()
    return {
      attackerControls: null,
      targetControls: null,
      targetShowDamage: null,
    }
  }

  return { attackerControls, targetControls, targetShowDamage }
}

function getCreatureControlsById(
  ID: number,
  playerCreatureControlsRef: RefObject<any>,
  enemyCreatureControlsRef: RefObject<any>
) {
  return (
    playerCreatureControlsRef.current[ID] ||
    enemyCreatureControlsRef.current[ID] ||
    null
  )
}
