import { moveAttacker, returnAttacker, shakeTarget } from "../../components/animations/attackAnimations"
import { AnimationControls } from "framer-motion";

export const performAttackAnimation = async (
    attackerControls: AnimationControls,
    targetControls: AnimationControls,
    isPlayerAttack: boolean
  ) => {
    const direction = isPlayerAttack ? -1 : 1
    const distance = 150
    console.groupCollapsed("Animation Step: Perform Attack")
    await moveAttacker(attackerControls, direction, distance)
    await shakeTarget(targetControls)
    await returnAttacker(attackerControls)
    console.groupEnd()
}

