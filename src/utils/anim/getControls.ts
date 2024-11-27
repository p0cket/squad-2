import { RefObject } from "react"
import { Creature } from "../../consts/types"
import { ControlRef } from '../../hooks/useCreatureControls'


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

  console.log(
    `%c[getControls] Attacker ID: ${attacker.ID}, Target ID: ${
      target.ID
    }, isPlayerAttack: ${isPlayerAttack}, controlsRef: ${
      controlsRef === playerCreatureControlsRef
        ? "playerCreatureControlsRef"
        : "enemyCreatureControlsRef"
    }`,
    "color: yellow; background-color: black;"
  )
  console.log(
    `%c[getControls] playerCreatureControlsRef.current: %o`,
    "color: yellow; background-color: black;",
    playerCreatureControlsRef.current
  )
  console.log(
    `%c[getControls] enemyCreatureControlsRef.current: %o`,
    "color: yellow; background-color: black;",
    enemyCreatureControlsRef.current
  )

  const attackerControls =
    controlsRef.current?.[attacker.ID]?.controls

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

  console.log(
    `%c[getControls] attackerControls: %o`,
    "color: yellow; background-color: black;",
    attackerControls
  )
  console.log(
    `%c[getControls] targetControls: %o`,
    "color: yellow; background-color: black;",
    targetControls
  )
  console.log(
    `%c[getControls] targetShowDamage: %o`,
    "color: yellow; background-color: black;",
    targetShowDamage
  )

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

function getCreatureControlsById(
  ID: number,
  playerCreatureControlsRef: RefObject<ControlRef>,
  enemyCreatureControlsRef: RefObject<ControlRef>
) {
  console.log(
    `%c[getCreatureControlsById] Searching for ID: ${ID}`,
    "color: yellow; background-color: black;"
  )
  console.log(
    `%c[getCreatureControlsById] playerCreatureControlsRef.current: %o`,
    "color: yellow; background-color: black;",
    playerCreatureControlsRef.current
  )
  console.log(
    `%c[getCreatureControlsById] enemyCreatureControlsRef.current: %o`,
    "color: yellow; background-color: black;",
    enemyCreatureControlsRef.current
  )

  const playerControl = playerCreatureControlsRef.current?.[ID]
  const enemyControl = enemyCreatureControlsRef.current?.[ID]

  console.log(
    `%c[getCreatureControlsById] playerControl for ID ${ID}: %o`,
    "color: yellow; background-color: black;",
    playerControl
  )
  console.log(
    `%c[getCreatureControlsById] enemyControl for ID ${ID}: %o`,
    "color: yellow; background-color: black;",
    enemyControl
  )

  if (playerControl) {
    console.log(
      `%c[getCreatureControlsById] Found in playerCreatureControlsRef for ID: ${ID}`,
      "color: yellow; background-color: black;"
    )
    return playerControl
  } else if (enemyControl) {
    console.log(
      `%c[getCreatureControlsById] Found in enemyCreatureControlsRef for ID: ${ID}`,
      "color: yellow; background-color: black;"
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
