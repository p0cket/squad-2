// Build 1.1: Animation Queue Hook
// Custom hook for interacting with the animation queue

import { useStateContext, useDispatchContext } from "../GameContext"
import { AnimationQueueItem, AnimationFactory } from "../utils/anim/AnimationQueue"

export const useAnimationQueue = () => {
  const state = useStateContext()
  const dispatch = useDispatchContext()

  const addAnimation = (animation: AnimationQueueItem) => {
    dispatch({
      type: "ADD_ANIMATION",
      animation,
    })
  }

  const processQueue = () => {
    dispatch({
      type: "PROCESS_ANIMATION_QUEUE",
    })
  }

  const clearQueue = () => {
    dispatch({
      type: "CLEAR_ANIMATION_QUEUE",
    })
  }

  // Convenience methods using AnimationFactory
  const addAttackAnimation = (
    attackerControls: any,
    targetControls: any,
    isPlayerAttack: boolean,
    animationFunction: () => Promise<void>
  ) => {
    const animation = AnimationFactory.createAttackAnimation(
      attackerControls,
      targetControls,
      isPlayerAttack,
      animationFunction
    )
    addAnimation(animation)
  }

  const addDamageAnimation = (
    targetControls: any,
    damage: number,
    animationFunction: () => Promise<void>
  ) => {
    const animation = AnimationFactory.createDamageAnimation(
      targetControls,
      damage,
      animationFunction
    )
    addAnimation(animation)
  }

  const addStatusEffectAnimation = (
    targetControls: any,
    statusType: string,
    animationFunction: () => Promise<void>
  ) => {
    const animation = AnimationFactory.createStatusEffectAnimation(
      targetControls,
      statusType,
      animationFunction
    )
    addAnimation(animation)
  }

  const addCustomAnimation = (
    animationFunction: () => Promise<void>,
    type: string = 'CUSTOM',
    priority: number = 5
  ) => {
    const animation = AnimationFactory.createCustomAnimation(
      animationFunction,
      type,
      priority
    )
    addAnimation(animation)
  }

  return {
    // Direct queue operations
    addAnimation,
    processQueue,
    clearQueue,
    
    // Queue status
    queueStatus: state.animationQueue.getStatus(),
    
    // Convenience methods
    addAttackAnimation,
    addDamageAnimation,
    addStatusEffectAnimation,
    addCustomAnimation,
    
    // Factory access
    AnimationFactory,
  }
}
