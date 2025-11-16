// Animation Queue System for Battle Engine
// Build 1.1: Animation Queue Infrastructure

import { AnimationControls } from "framer-motion"

export interface AnimationQueueItem {
  id: string
  type: 'ATTACK' | 'DAMAGE' | 'STATUS_EFFECT' | 'HEAL' | 'CUSTOM'
  controls?: {
    attacker?: AnimationControls | null
    target?: AnimationControls | null
  }
  animation: () => Promise<void>
  data?: any
  priority?: number // Lower numbers = higher priority
  delay?: number // Delay before starting this animation (ms)
}

export class AnimationQueue {
  private queue: AnimationQueueItem[] = []
  private isProcessing = false
  private currentAnimation: AnimationQueueItem | null = null

  constructor() {
    console.log("🎬 Animation Queue initialized")
  }

  /**
   * Add an animation to the queue
   */
  add(item: AnimationQueueItem): void {
    console.log(`🎬 Adding animation to queue: ${item.type} (ID: ${item.id})`)
    this.queue.push(item)
    this.sortQueue()
  }

  /**
   * Add multiple animations at once
   */
  addBatch(items: AnimationQueueItem[]): void {
    console.log(`🎬 Adding batch of ${items.length} animations to queue`)
    this.queue.push(...items)
    this.sortQueue()
  }

  /**
   * Process all animations in the queue sequentially
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing) {
      console.log("🎬 Queue already processing, skipping...")
      return
    }

    if (this.queue.length === 0) {
      console.log("🎬 Queue is empty, nothing to process")
      return
    }

    console.log(`🎬 Processing queue with ${this.queue.length} animations`)
    this.isProcessing = true

    try {
      while (this.queue.length > 0) {
        const item = this.queue.shift()!
        this.currentAnimation = item

        console.log(`🎬 Executing animation: ${item.type} (ID: ${item.id})`)

        // Apply delay if specified
        if (item.delay && item.delay > 0) {
          console.log(`🎬 Waiting ${item.delay}ms before animation...`)
          await this.wait(item.delay)
        }

        // Execute the animation
        await item.animation()
        console.log(`🎬 Completed animation: ${item.type} (ID: ${item.id})`)
      }
    } catch (error) {
      console.error("🎬 Error processing animation queue:", error)
      throw error
    } finally {
      this.isProcessing = false
      this.currentAnimation = null
      console.log("🎬 Queue processing complete")
    }
  }

  /**
   * Clear all pending animations
   */
  clear(): void {
    const count = this.queue.length
    this.queue = []
    console.log(`🎬 Cleared ${count} animations from queue`)
  }

  /**
   * Get current queue status
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
      currentAnimation: this.currentAnimation?.type || null,
      currentAnimationId: this.currentAnimation?.id || null
    }
  }

  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    return this.queue.length === 0
  }

  /**
   * Get queue length
   */
  length(): number {
    return this.queue.length
  }

  /**
   * Peek at next animation without removing it
   */
  peek(): AnimationQueueItem | null {
    return this.queue[0] || null
  }

  /**
   * Sort queue by priority (lower number = higher priority)
   */
  private sortQueue(): void {
    this.queue.sort((a, b) => {
      const priorityA = a.priority || 999
      const priorityB = b.priority || 999
      return priorityA - priorityB
    })
  }

  /**
   * Helper method to wait for a specified duration
   */
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Animation factory functions for common battle animations
export class AnimationFactory {
  private static nextId = 0

  static generateId(type: string): string {
    return `${type.toLowerCase()}_${++this.nextId}_${Date.now()}`
  }

  static createAttackAnimation(
    attackerControls: AnimationControls | null,
    targetControls: AnimationControls | null,
    isPlayerAttack: boolean,
    animationFunction: () => Promise<void>
  ): AnimationQueueItem {
    return {
      id: this.generateId('ATTACK'),
      type: 'ATTACK',
      controls: {
        attacker: attackerControls,
        target: targetControls
      },
      animation: animationFunction,
      data: { isPlayerAttack },
      priority: 1 // High priority
    }
  }

  static createDamageAnimation(
    targetControls: AnimationControls | null,
    damage: number,
    animationFunction: () => Promise<void>
  ): AnimationQueueItem {
    return {
      id: this.generateId('DAMAGE'),
      type: 'DAMAGE',
      controls: {
        target: targetControls
      },
      animation: animationFunction,
      data: { damage },
      priority: 2 // Medium priority
    }
  }

  static createStatusEffectAnimation(
    targetControls: AnimationControls | null,
    statusType: string,
    animationFunction: () => Promise<void>
  ): AnimationQueueItem {
    return {
      id: this.generateId('STATUS_EFFECT'),
      type: 'STATUS_EFFECT',
      controls: {
        target: targetControls
      },
      animation: animationFunction,
      data: { statusType },
      priority: 3 // Lower priority
    }
  }

  static createHealAnimation(
    targetControls: AnimationControls | null,
    healAmount: number,
    animationFunction: () => Promise<void>
  ): AnimationQueueItem {
    return {
      id: this.generateId('HEAL'),
      type: 'HEAL',
      controls: {
        target: targetControls
      },
      animation: animationFunction,
      data: { healAmount },
      priority: 2 // Medium priority
    }
  }

  static createCustomAnimation(
    animationFunction: () => Promise<void>,
    type: string = 'CUSTOM',
    priority: number = 5
  ): AnimationQueueItem {
    return {
      id: this.generateId(type),
      type: 'CUSTOM',
      animation: animationFunction,
      priority
    }
  }
}

// Export default instance for global use
export const globalAnimationQueue = new AnimationQueue()
