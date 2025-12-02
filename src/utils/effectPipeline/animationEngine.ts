// Sequential Animation Engine - Handles async animation sequencing
import { Animation } from './types'

/**
 * Executes animations, grouping delayed animations to run in parallel
 * while keeping non-delayed animations sequential
 *
 * Returns a callback that resolves once all animations are actually complete
 * (useful for cleanup, but UI updates don't need to wait)
 */
export const executeAnimationsSequentially = async (
  animations: Animation[]
): Promise<() => Promise<void>> => {
  if (animations.length === 0) {
    return async () => {}
  }

  // Group animations: separate delayed from sequential
  const sequentialAnimations: Animation[] = []
  const delayedAnimations: Animation[] = []

  for (const animation of animations) {
    // Animations with a delay property (even 0) should run in parallel
    if (animation.data?.delay !== undefined) {
      delayedAnimations.push(animation)
    } else {
      sequentialAnimations.push(animation)
    }
  }

  // Execute sequential animations first (windup, impact, etc.)
  for (const animation of sequentialAnimations) {
    try {
      await executeAnimation(animation)
    } catch (error) {
      console.error(`💥 Sequential animation failed:`, error)
    }
  }

  // Start all delayed animations in parallel (damage numbers)
  const delayedAnimationPromises: Promise<void>[] = []
  if (delayedAnimations.length > 0) {
    for (const animation of delayedAnimations) {
      delayedAnimationPromises.push(
        executeAnimation(animation).catch(error => {
          console.error(`💥 Delayed animation failed:`, error)
        })
      )
    }

    // Wait only for them to *appear* (max delay time), not to finish
    const maxDelay = Math.max(...delayedAnimations.map(a => a.data?.delay || 0))
    await new Promise(resolve => setTimeout(resolve, maxDelay + 100)) // +100ms buffer
  }

  // Return a function that waits for all animations to fully complete
  return async () => {
    if (delayedAnimationPromises.length > 0) {
      await Promise.all(delayedAnimationPromises)
    }
  }
}

/**
 * Executes a single animation and returns a promise that resolves when done
 */
const executeAnimation = (animation: Animation): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const animationInstance = createAnimationInstance(animation)

      if (!animationInstance) {
        console.warn('⚠️ No animation instance created for:', animation.type)
        resolve()
        return
      }

      // Set up completion callback
      animationInstance.onComplete = () => {
        // Animation completed
        resolve()
      }

      // Set up error callback
      animationInstance.onError = (error: any) => {
        console.error(`💥 Animation ${animation.type} error:`, error)
        reject(error)
      }

      // Start the animation
      animationInstance.play()

      // Fallback timeout to prevent hanging
      // Account for delay in animation data
      const delay = animation.data?.delay || 0
      const totalTime = animation.duration + delay + 1000 // Add delay + 1 second buffer
      setTimeout(() => {
        console.warn(`⏰ Animation ${animation.type} timed out, resolving anyway`)
        resolve()
      }, totalTime)

    } catch (error) {
      console.error(`💥 Failed to create animation ${animation.type}:`, error)
      reject(error)
    }
  })
}

/**
 * Creates an animation instance based on animation type
 * This integrates with your existing animation system
 */
const createAnimationInstance = (animation: Animation): AnimationInstance | null => {
  switch (animation.type) {
    case 'shake':
      return createShakeAnimation(animation)

    case 'damage-number':
      return createDamageNumberAnimation(animation)

    case 'burn':
      return createBurnAnimation(animation)

    case 'death-animation':
      return createDeathAnimation(animation)

    case 'attack-windup':
      return createAttackWindupAnimation(animation)

    case 'impact':
      return createImpactAnimation(animation)

    case 'healing':
      return createHealingAnimation(animation)

    case 'status-apply':
      return createStatusApplyAnimation(animation)

    default:
      console.warn(`⚠️ Unknown animation type: ${animation.type}`)
      return createDefaultAnimation(animation)
  }
}

// Animation instance interface
interface AnimationInstance {
  play: () => void
  onComplete?: () => void
  onError?: (error: any) => void
}

/**
 * Creates a shake animation for creature damage
 */
const createShakeAnimation = (animation: Animation): AnimationInstance => {
  const instance: AnimationInstance = {
    play: () => {
      // Shake animation

      // Find the creature element (prioritize active card)
      let creatureElement = document.querySelector(`[data-creature-id="${animation.targetId}"][data-testid="creature-card"]`)
      if (!creatureElement) {
        creatureElement = document.querySelector(`[data-creature-id="${animation.targetId}"]`)
      }

      if (creatureElement) {
        creatureElement.classList.add('shake-animation')

        setTimeout(() => {
          if (creatureElement) {
            creatureElement.classList.remove('shake-animation')
          }
          if (instance.onComplete) instance.onComplete()
        }, animation.duration)
      } else {
        console.warn(`Creature element not found for ID: ${animation.targetId}`)
        if (instance.onComplete) instance.onComplete()
      }
    }
  }
  return instance
}

/**
 * Creates a damage number animation
 */
const createDamageNumberAnimation = (animation: Animation): AnimationInstance => {
  let completed = false

  const instance: AnimationInstance = {
    play: () => {
      const damageValue = animation.data?.value || 0
      const label = animation.data?.label || ''
      const isTotal = animation.data?.isTotal || false
      const delay = animation.data?.delay || 0

      // Try to find the main creature card first (active creature)
      // This avoids selecting the hidden team box element which would cause position 0,0
      let creatureElement = document.querySelector(`[data-creature-id="${animation.targetId}"][data-testid="creature-card"]`)
      
      // Fallback to any element with the ID if specific card not found
      if (!creatureElement) {
        creatureElement = document.querySelector(`[data-creature-id="${animation.targetId}"]`)
      }

      if (creatureElement) {
        // Calculate position BEFORE the delay (so it's relative to current scroll position)
        const rect = creatureElement.getBoundingClientRect()
        
        // If rect is all zeros, it might be hidden or not rendered yet
        if (rect.width === 0 && rect.height === 0) {
           console.warn(`Creature element found but has 0 dimensions (hidden?): ${animation.targetId}`)
        }

        const scrollY = window.scrollY
        const scrollX = window.scrollX
        
        // Use delay before showing animation
        setTimeout(() => {
          const damageElement = document.createElement('div')
          damageElement.className = 'damage-number'

          // Format the display text
          let displayText = ''
          if (label) {
            const sign = damageValue >= 0 ? '+' : ''
            displayText = `${label}: ${sign}${damageValue}`
          } else {
            displayText = damageValue.toString()
          }

          damageElement.textContent = displayText
          damageElement.style.position = 'absolute'
          damageElement.style.fontWeight = isTotal ? 'bold' : '600'
          damageElement.style.fontSize = isTotal ? '32px' : '18px'
          damageElement.style.zIndex = '1000'
          damageElement.style.pointerEvents = 'none'
          damageElement.style.textShadow = '2px 2px 6px rgba(0,0,0,0.9)'
          damageElement.style.fontFamily = 'monospace'
          damageElement.style.letterSpacing = '0.5px'
          damageElement.style.padding = isTotal ? '4px 8px' : '2px 6px'
          damageElement.style.borderRadius = '4px'
          damageElement.style.backgroundColor = isTotal ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)'
          damageElement.style.border = isTotal ? '2px solid rgba(255,255,255,0.3)' : 'none'

          // Color based on value type
          if (isTotal) {
            damageElement.style.color = damageValue < 0 ? '#ff4444' : '#44ff44'
          } else if (damageValue < 0) {
            damageElement.style.color = '#ffbb33' // Orange for damage components (defense)
          } else {
            damageElement.style.color = '#88ff88' // Light green for bonuses
          }

          // Position relative to creature (using pre-calculated position + scroll offset)
          // Stack vertically based on delay to avoid overlap
          const verticalOffset = delay ? (delay / 200) * 25 : 0 // 25px per 200ms delay
          damageElement.style.left = `${rect.left + scrollX + rect.width / 2 - 50}px`
          damageElement.style.top = `${rect.top + scrollY - 20 - verticalOffset}px`

          document.body.appendChild(damageElement)

          // Animate upward and fade out
          damageElement.animate([
            { transform: 'translateY(0px)', opacity: 1 },
            { transform: 'translateY(-40px)', opacity: 0 }
          ], {
            duration: animation.duration,
            easing: 'ease-out'
          }).onfinish = () => {
            if (document.body.contains(damageElement)) {
              document.body.removeChild(damageElement)
            }
            if (!completed && instance.onComplete) {
              completed = true
              instance.onComplete()
            }
          }
        }, delay)
      } else {
        console.warn(`Creature element not found for damage number: ${animation.targetId}`)
        setTimeout(() => {
          if (!completed && instance.onComplete) {
            completed = true
            instance.onComplete()
          }
        }, delay)
      }
    }
  }
  return instance
}

/**
 * Creates a burn effect animation
 */
const createBurnAnimation = (animation: Animation): AnimationInstance => {
  const instance: AnimationInstance = {
    play: () => {
      // Burn animation
      
      // Find the creature element (prioritize active card)
      let creatureElement = document.querySelector(`[data-creature-id="${animation.targetId}"][data-testid="creature-card"]`)
      if (!creatureElement) {
        creatureElement = document.querySelector(`[data-creature-id="${animation.targetId}"]`)
      }

      if (creatureElement) {
        creatureElement.classList.add('burn-effect')

        setTimeout(() => {
          if (creatureElement) {
            creatureElement.classList.remove('burn-effect')
          }
          if (instance.onComplete) instance.onComplete()
        }, animation.duration)
      } else {
        console.warn(`Creature element not found for burn effect: ${animation.targetId}`)
        if (instance.onComplete) instance.onComplete()
      }
    }
  }
  return instance
}

/**
 * Creates a death animation
 */
const createDeathAnimation = (animation: Animation): AnimationInstance => {
  const instance: AnimationInstance = {
    play: () => {
      // Death animation

      // Find the creature element (prioritize active card)
      let creatureElement = document.querySelector(`[data-creature-id="${animation.targetId}"][data-testid="creature-card"]`)
      if (!creatureElement) {
        creatureElement = document.querySelector(`[data-creature-id="${animation.targetId}"]`)
      }

      if (creatureElement) {
        creatureElement.animate([
          { opacity: 1, transform: 'scale(1)' },
          { opacity: 0.3, transform: 'scale(0.8)' }
        ], {
          duration: animation.duration,
          fill: 'forwards'
        }).onfinish = () => {
          if (instance.onComplete) instance.onComplete()
        }
      } else {
        console.warn(`Creature element not found for death animation: ${animation.targetId}`)
        if (instance.onComplete) instance.onComplete()
      }
    }
  }
  return instance
}

/**
 * Creates an attack windup animation
 */
const createAttackWindupAnimation = (animation: Animation): AnimationInstance => {
  const instance: AnimationInstance = {
    play: () => {
      // Attack windup animation

      // Find the creature element (prioritize active card)
      let creatureElement = document.querySelector(`[data-creature-id="${animation.targetId}"][data-testid="creature-card"]`)
      if (!creatureElement) {
        creatureElement = document.querySelector(`[data-creature-id="${animation.targetId}"]`)
      }

      if (creatureElement) {
        creatureElement.animate([
          { transform: 'scale(1)' },
          { transform: 'scale(1.1)' },
          { transform: 'scale(1)' }
        ], {
          duration: animation.duration
        }).onfinish = () => {
          if (instance.onComplete) instance.onComplete()
        }
      } else {
        if (instance.onComplete) instance.onComplete()
      }
    }
  }
  return instance
}

/**
 * Creates an impact animation
 */
const createImpactAnimation = (animation: Animation): AnimationInstance => {
  const instance: AnimationInstance = {
    play: () => {
      // Impact animation
      // Quick flash effect
      setTimeout(() => {
        if (instance.onComplete) instance.onComplete()
      }, animation.duration)
    }
  }
  return instance
}

/**
 * Creates a healing animation
 */
const createHealingAnimation = (animation: Animation): AnimationInstance => {
  const instance: AnimationInstance = {
    play: () => {
      // Healing animation
      // Green glow effect
      setTimeout(() => {
        if (instance.onComplete) instance.onComplete()
      }, animation.duration)
    }
  }
  return instance
}

/**
 * Creates a status apply animation
 */
const createStatusApplyAnimation = (animation: Animation): AnimationInstance => {
  const instance: AnimationInstance = {
    play: () => {
      // Status apply animation
      // Status indicator effect
      setTimeout(() => {
        if (instance.onComplete) instance.onComplete()
      }, animation.duration)
    }
  }
  return instance
}

/**
 * Creates a default fallback animation
 */
const createDefaultAnimation = (animation: Animation): AnimationInstance => {
  const instance: AnimationInstance = {
    play: () => {
      // Default animation
      setTimeout(() => {
        if (instance.onComplete) instance.onComplete()
      }, animation.duration || 500)
    }
  }
  return instance
}