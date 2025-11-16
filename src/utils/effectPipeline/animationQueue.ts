// Animation Queue Manager - Provides queue with concurrency control
import { Animation } from './types'

export interface AnimationQueueConfig {
  maxConcurrent: number // Max animations playing simultaneously
  batchDelay: number // Delay between batches (ms)
}

interface QueuedAnimation {
  animation: Animation
  priority: number // Higher = plays sooner
  batchId?: string // Group animations to play together
}

class AnimationQueueManager {
  private queue: QueuedAnimation[] = []
  private running: Set<Promise<void>> = new Set()
  private config: AnimationQueueConfig
  private isPaused: boolean = false

  constructor(config: Partial<AnimationQueueConfig> = {}) {
    this.config = {
      maxConcurrent: config.maxConcurrent || 3,
      batchDelay: config.batchDelay || 100
    }
  }

  /**
   * Add animation to queue
   */
  enqueue(animation: Animation, priority: number = 0, batchId?: string): void {
    this.queue.push({
      animation,
      priority,
      batchId
    })

    // Sort by priority (descending)
    this.queue.sort((a, b) => b.priority - a.priority)

    console.log(`📥 Queued ${animation.type} animation (priority: ${priority}, queue size: ${this.queue.length})`)

    // Auto-start processing if not already running
    if (!this.isPaused && this.running.size === 0) {
      this.processQueue()
    }
  }

  /**
   * Add multiple animations at once
   */
  enqueueBatch(animations: Animation[], priority: number = 0, batchId?: string): void {
    animations.forEach(anim => this.enqueue(anim, priority, batchId))
  }

  /**
   * Process queue with concurrency control
   */
  private async processQueue(): Promise<void> {
    while (this.queue.length > 0 && !this.isPaused) {
      // Wait if at max concurrency
      while (this.running.size >= this.config.maxConcurrent) {
        await Promise.race(Array.from(this.running))
      }

      // Get next animation
      const item = this.queue.shift()
      if (!item) break

      // Check if this is part of a batch
      const batchItems = item.batchId
        ? this.extractBatch(item.batchId)
        : [item]

      // Start batch (all items in parallel)
      for (const batchItem of batchItems) {
        const promise = this.executeAnimation(batchItem.animation)
        this.running.add(promise)

        promise.finally(() => {
          this.running.delete(promise)
        })
      }

      // Small delay between batches
      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.config.batchDelay))
      }
    }

    // Wait for all remaining to finish
    await Promise.all(Array.from(this.running))
    console.log('✅ Animation queue processing complete')
  }

  /**
   * Extract all animations with matching batchId
   */
  private extractBatch(batchId: string): QueuedAnimation[] {
    const batch: QueuedAnimation[] = []
    let i = 0

    while (i < this.queue.length) {
      if (this.queue[i].batchId === batchId) {
        batch.push(this.queue.splice(i, 1)[0])
      } else {
        i++
      }
    }

    return batch
  }

  /**
   * Execute a single animation
   * TODO: Import from animationEngine.ts when refactoring
   */
  private async executeAnimation(animation: Animation): Promise<void> {
    console.log(`🎬 Playing ${animation.type} for creature ${animation.targetId}`)

    return new Promise((resolve) => {
      try {
        // Placeholder - replace with actual animation execution
        // This will integrate with existing animationEngine.ts
        const duration = animation.duration || 500

        setTimeout(() => {
          console.log(`✅ ${animation.type} animation complete`)
          resolve()
        }, duration)

      } catch (error) {
        console.error(`💥 Animation failed:`, error)
        resolve() // Resolve anyway to keep queue moving
      }
    })
  }

  /**
   * Pause queue processing
   */
  pause(): void {
    this.isPaused = true
    console.log('⏸️ Animation queue paused')
  }

  /**
   * Resume queue processing
   */
  resume(): void {
    this.isPaused = false
    console.log('▶️ Animation queue resumed')
    if (this.queue.length > 0) {
      this.processQueue()
    }
  }

  /**
   * Clear all queued animations (but let running ones finish)
   */
  clear(): void {
    const cleared = this.queue.length
    this.queue = []
    console.log(`🗑️ Cleared ${cleared} queued animations`)
  }

  /**
   * Clear everything including running animations (hard stop)
   */
  hardClear(): void {
    this.queue = []
    this.running.clear()
    console.log('🛑 Hard cleared all animations')
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      queued: this.queue.length,
      running: this.running.size,
      isPaused: this.isPaused,
      config: this.config
    }
  }

  /**
   * Wait for all animations to complete (queue + running)
   */
  async waitForCompletion(): Promise<void> {
    // Wait for queue to be empty and all running to finish
    while (this.queue.length > 0 || this.running.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }
}

// Export singleton instance
export const animationQueue = new AnimationQueueManager()

// Export factory for custom instances
export const createAnimationQueue = (config?: Partial<AnimationQueueConfig>) => {
  return new AnimationQueueManager(config)
}
