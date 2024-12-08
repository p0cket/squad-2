import { RefObject } from "react"
import { Creature } from "../../consts/types"
import { ControlRef } from "../../hooks/useCreatureControls"

export const getControls = (
  attacker: Creature,
  target: Creature,
  isPlayerAttack: boolean,
  playerCreatureControlsRef: RefObject<ControlRef>,
  enemyCreatureControlsRef: RefObject<ControlRef>
) => {
  const controlsRef = isPlayerAttack
    ? playerCreatureControlsRef
    : enemyCreatureControlsRef

  console.groupCollapsed(
    `%c[getControls] Attacker ID: ${attacker.ID}, Target ID: ${
      target.ID
    }, isPlayerAttack: ${isPlayerAttack}, controlsRef: ${
      controlsRef === playerCreatureControlsRef
        ? "playerCreatureControlsRef"
        : "enemyCreatureControlsRef"
    }`,
    "color: yellow; background-color: black;"
  )

  const attackerControls = controlsRef.current?.[attacker.ID]?.controls

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
  console.groupEnd()
  if (!attackerControls || !targetControls) {
    console.warn(
      `%c⚠️ Animation controls not found for attacker ID: ${attacker.ID} or target ID: ${target.ID}, skipping attack animation.`,
      "color: orange; font-weight: bold;"
    )
    return {
      attackerControls: null,
      targetControls: null,
      targetShowDamage: null,
    }
  }

  return { attackerControls, targetControls, targetShowDamage }
}

export function getCreatureControlsById(
  ID: number,
  playerCreatureControlsRef: RefObject<ControlRef>,
  enemyCreatureControlsRef: RefObject<ControlRef>
) {
  const playerControl = playerCreatureControlsRef.current?.[ID]
  const enemyControl = enemyCreatureControlsRef.current?.[ID]

  if (playerControl) {
    console.log(
      `%c[getCreatureControlsById] playerControl ${playerControl} Found in playerCreatureControlsRef for ID: ${ID}`,
      "color: yellow; background-color: black;",
      playerControl
    )
    return playerControl
  } else if (enemyControl) {
    console.log(
      `%c[getCreatureControlsById] enemyControl ${enemyControl} Found in enemyCreatureControlsRef for ID: ${ID}`,
      "color: yellow; background-color: black;",
      enemyControl
    )
    return enemyControl
  } else {
    console.warn(
      `%c[getCreatureControlsById] ID: ${ID} not found in any controls references.`,
      "color: yellow; background-color: black;"
    )
    return null
  }
}
