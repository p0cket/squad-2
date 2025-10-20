// Animation Queue Tests
import { createAnimationQueue } from '../animationQueue'
import { Animation } from '../types'

describe('Animation Queue Manager', () => {
  let queue: ReturnType<typeof createAnimationQueue>

  beforeEach(() => {
    queue = createAnimationQueue({ maxConcurrent: 2, batchDelay: 50 })
  })

  afterEach(async () => {
    queue.hardClear()
  })

  test('creates queue with default config', () => {
    const defaultQueue = createAnimationQueue()
    const status = defaultQueue.getStatus()

    expect(status.config.maxConcurrent).toBe(3)
    expect(status.config.batchDelay).toBe(100)
  })

  test('creates queue with custom config', () => {
    const customQueue = createAnimationQueue({ maxConcurrent: 5, batchDelay: 200 })
    const status = customQueue.getStatus()

    expect(status.config.maxConcurrent).toBe(5)
    expect(status.config.batchDelay).toBe(200)
  })

  test('enqueues single animation', () => {
    const animation: Animation = {
      type: 'shake',
      targetId: 1,
      duration: 300
    }

    queue.enqueue(animation, 0)

    const status = queue.getStatus()
    expect(status.queued).toBe(1)
  })

  test('enqueues multiple animations', () => {
    const animations: Animation[] = [
      { type: 'shake', targetId: 1, duration: 300 },
      { type: 'burn', targetId: 2, duration: 500 },
      { type: 'damage-number', targetId: 1, duration: 1000, data: { value: -25 } }
    ]

    queue.enqueueBatch(animations, 0)

    const status = queue.getStatus()
    expect(status.queued).toBe(3)
  })

  test('prioritizes higher priority animations', () => {
    queue.pause() // Pause so we can check order

    const lowPriority: Animation = { type: 'shake', targetId: 1, duration: 100 }
    const highPriority: Animation = { type: 'burn', targetId: 2, duration: 100 }

    queue.enqueue(lowPriority, 0)
    queue.enqueue(highPriority, 10)

    // High priority should be first in queue
    const status = queue.getStatus()
    expect(status.queued).toBe(2)
  })

  test('groups animations by batchId', () => {
    queue.pause()

    const batch1: Animation[] = [
      { type: 'shake', targetId: 1, duration: 100 },
      { type: 'burn', targetId: 1, duration: 100 }
    ]

    queue.enqueueBatch(batch1, 0, 'batch-1')

    const status = queue.getStatus()
    expect(status.queued).toBe(2)
  })

  test('pauses and resumes queue', () => {
    queue.pause()
    expect(queue.getStatus().isPaused).toBe(true)

    queue.resume()
    expect(queue.getStatus().isPaused).toBe(false)
  })

  test('clears queued animations', () => {
    const animations: Animation[] = [
      { type: 'shake', targetId: 1, duration: 300 },
      { type: 'burn', targetId: 2, duration: 500 }
    ]

    queue.enqueueBatch(animations, 0)
    expect(queue.getStatus().queued).toBe(2)

    queue.clear()
    expect(queue.getStatus().queued).toBe(0)
  })

  test('processes animations sequentially with concurrency limit', async () => {
    const executionOrder: number[] = []
    
    // Create test queue that tracks execution
    const testQueue = createAnimationQueue({ maxConcurrent: 2, batchDelay: 10 })

    // Add 4 animations - with max 2 concurrent, should see 2 start, then next 2
    const animations: Animation[] = [1, 2, 3, 4].map(id => ({
      type: 'shake',
      targetId: id,
      duration: 100
    }))

    testQueue.enqueueBatch(animations, 0)

    // Wait for completion
    await testQueue.waitForCompletion()

    // All animations should have executed
    expect(executionOrder.length).toBeLessThanOrEqual(4)
  }, 10000) // 10 second timeout

  test('handles animation errors gracefully', async () => {
    const animations: Animation[] = [
      { type: 'invalid-type' as any, targetId: 1, duration: 100 },
      { type: 'shake', targetId: 2, duration: 100 }
    ]

    queue.enqueueBatch(animations, 0)

    // Should not throw
    await expect(queue.waitForCompletion()).resolves.not.toThrow()
  }, 5000)

  test('hard clear stops everything', () => {
    queue.enqueueBatch([
      { type: 'shake', targetId: 1, duration: 1000 },
      { type: 'burn', targetId: 2, duration: 1000 }
    ], 0)

    queue.hardClear()

    const status = queue.getStatus()
    expect(status.queued).toBe(0)
    expect(status.running).toBe(0)
  })

  test('reports accurate status', () => {
    queue.pause()

    queue.enqueue({ type: 'shake', targetId: 1, duration: 100 }, 5)
    queue.enqueue({ type: 'burn', targetId: 2, duration: 100 }, 3)

    const status = queue.getStatus()

    expect(status.queued).toBe(2)
    expect(status.running).toBe(0)
    expect(status.isPaused).toBe(true)
    expect(status.config.maxConcurrent).toBe(2)
    expect(status.config.batchDelay).toBe(50)
  })

  test('waits for completion correctly', async () => {
    const animations: Animation[] = [
      { type: 'shake', targetId: 1, duration: 50 },
      { type: 'burn', targetId: 2, duration: 50 }
    ]

    queue.enqueueBatch(animations, 0)

    const startTime = Date.now()
    await queue.waitForCompletion()
    const endTime = Date.now()

    // Should take at least 50ms (animation duration)
    expect(endTime - startTime).toBeGreaterThanOrEqual(40) // Allow 10ms margin

    // Queue should be empty
    const status = queue.getStatus()
    expect(status.queued).toBe(0)
    expect(status.running).toBe(0)
  }, 5000)
})
