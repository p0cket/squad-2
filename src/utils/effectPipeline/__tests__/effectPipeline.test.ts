// Effect Pipeline Core Tests
import {
  createEffectPipeline,
  addEffectToPipeline,
  getNextEffect,
  markEffectProcessed
} from '../effectPipeline'
import { Effect } from '../types'

describe('Effect Pipeline Core', () => {
  const mockEffect: Effect = {
    id: 'test-effect',
    targetId: 1,
    priority: 50,
    animations: [],
    apply: async () => []
  }

  test('creates empty pipeline', () => {
    const pipeline = createEffectPipeline()
    expect(pipeline.queue).toHaveLength(0)
    expect(pipeline.processed.size).toBe(0)
  })

  test('adds effects to pipeline with priority ordering', () => {
    const pipeline = createEffectPipeline()

    const lowPriority: Effect = { ...mockEffect, id: 'low', priority: 10 }
    const highPriority: Effect = { ...mockEffect, id: 'high', priority: 90 }
    const medPriority: Effect = { ...mockEffect, id: 'med', priority: 50 }

    addEffectToPipeline(pipeline, lowPriority)
    addEffectToPipeline(pipeline, highPriority)
    addEffectToPipeline(pipeline, medPriority)

    expect(pipeline.queue).toHaveLength(3)
    expect(pipeline.queue[0].id).toBe('high') // Highest priority first
    expect(pipeline.queue[1].id).toBe('med')
    expect(pipeline.queue[2].id).toBe('low')
  })

  test('prevents duplicate effects (loop prevention)', () => {
    const pipeline = createEffectPipeline()

    addEffectToPipeline(pipeline, mockEffect)
    markEffectProcessed(pipeline, mockEffect) // Mark as processed
    addEffectToPipeline(pipeline, mockEffect) // Should be prevented

    expect(pipeline.queue).toHaveLength(1) // Should only have one
  })

  test('gets next effect from queue', () => {
    const pipeline = createEffectPipeline()
    addEffectToPipeline(pipeline, mockEffect)

    const nextEffect = getNextEffect(pipeline)
    expect(nextEffect).toBe(mockEffect)
    expect(pipeline.queue).toHaveLength(0) // Should be removed from queue
  })

  test('marks effects as processed', () => {
    const pipeline = createEffectPipeline()

    markEffectProcessed(pipeline, mockEffect)

    expect(pipeline.processed.has('test-effect-1')).toBe(true)

    // Should prevent re-adding processed effects
    addEffectToPipeline(pipeline, mockEffect)
    expect(pipeline.queue).toHaveLength(0)
  })

  test('handles empty queue gracefully', () => {
    const pipeline = createEffectPipeline()

    const nextEffect = getNextEffect(pipeline)
    expect(nextEffect).toBeNull()
  })
})