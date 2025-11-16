import {
  moveAttacker,
  returnAttacker,
  shakeTarget,
} from "../../components/animations/attackAnimations"
import { AnimationControls } from "framer-motion"

export const performAttackAnimation = async (
  attackerControls: AnimationControls | null,
  targetControls: AnimationControls | null,
  isPlayerAttack: boolean
) => {
  if (!attackerControls || !targetControls) {
    console.error("Animation controls are not available")
    return
  }
  const direction = isPlayerAttack ? -1 : 1
  const distance = 150
  console.groupCollapsed("Animation Step: Perform Attack")
  // await Promise.all([
  //     moveAttacker(attackerControls, direction, distance),
  //     shakeTarget(targetControls),
  //     // returnAttacker(attackerControls)
  // ])

  await moveAttacker(attackerControls, direction, distance)
  await shakeTarget(targetControls)
  await returnAttacker(attackerControls)
  console.groupEnd()
}
