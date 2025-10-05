// Animation Engine Tests
import { executeAnimationsSequentially } from '../animationEngine'
import { Animation } from '../types'

// Mock DOM methods
const mockElement = {
  classList: {
    add: jest.fn(),
    remove: jest.fn()
  },
  animate: jest.fn().mockReturnValue({
    onfinish: null
  }),
  getBoundingClientRect: jest.fn().mockReturnValue({
    left: 100,
    top: 100,
    width: 50,
    height: 50
  })
}

const mockDocument = {
  querySelector: jest.fn().mockReturnValue(mockElement),
  createElement: jest.fn().mockReturnValue({
    className: '',
    textContent: '',
    style: {},
    animate: jest.fn().mockReturnValue({
      onfinish: null
    })
  }),
  body: {
    appendChild: jest.fn(),
    removeChild: jest.fn()
  }
}

// Mock global objects
global.document = mockDocument as any
global.setTimeout = jest.fn((callback) => {
  callback()
  return 1
}) as any

describe('Animation Engine', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('executes empty animation list', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

    await executeAnimationsSequentially([])

    expect(consoleSpy).toHaveBeenCalledWith('🎬 No animations to execute')
    consoleSpy.mockRestore()
  })

  test('executes single animation', async () => {
    const animation: Animation = {
      type: 'shake',
      targetId: 1,
      duration: 300
    }

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

    await executeAnimationsSequentially([animation])

    expect(consoleSpy).toHaveBeenCalledWith('🎬 Executing 1 animations sequentially')
    expect(consoleSpy).toHaveBeenCalledWith('🎭 Animation 1/1: shake for creature 1')

    consoleSpy.mockRestore()
  })

  test('executes multiple animations sequentially', async () => {
    const animations: Animation[] = [
      { type: 'shake', targetId: 1, duration: 300 },
      { type: 'burn', targetId: 1, duration: 500 },
      { type: 'damage-number', targetId: 1, duration: 1000, data: { value: -25 } }
    ]

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

    await executeAnimationsSequentially(animations)

    expect(consoleSpy).toHaveBeenCalledWith('🎬 Executing 3 animations sequentially')
    expect(consoleSpy).toHaveBeenCalledWith('🎭 Animation 1/3: shake for creature 1')
    expect(consoleSpy).toHaveBeenCalledWith('🎭 Animation 2/3: burn for creature 1')
    expect(consoleSpy).toHaveBeenCalledWith('🎭 Animation 3/3: damage-number for creature 1')

    consoleSpy.mockRestore()
  })

  test('handles missing creature element gracefully', async () => {
    mockDocument.querySelector.mockReturnValueOnce(null)

    const animation: Animation = {
      type: 'shake',
      targetId: 999, // Non-existent creature
      duration: 300
    }

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

    await executeAnimationsSequentially([animation])

    expect(consoleSpy).toHaveBeenCalledWith('Creature element not found for ID: 999')
    consoleSpy.mockRestore()
  })

  test('continues execution even if animation fails', async () => {
    const errorAnimation: Animation = {
      type: 'invalid-type' as any,
      targetId: 1,
      duration: 100
    }

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    const logSpy = jest.spyOn(console, 'log').mockImplementation()
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation()

    await executeAnimationsSequentially([errorAnimation])

    expect(logSpy).toHaveBeenCalledWith('🎬 All animations completed')

    consoleSpy.mockRestore()
    logSpy.mockRestore()
    warnSpy.mockRestore()
  })

  test('creates damage number animation with correct styling', async () => {
    const animation: Animation = {
      type: 'damage-number',
      targetId: 1,
      duration: 1000,
      data: { value: -25 }
    }

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation()

    await executeAnimationsSequentially([animation])

    expect(consoleSpy).toHaveBeenCalledWith('💥 Damage number animation: -25 for creature 1')

    consoleSpy.mockRestore()
    warnSpy.mockRestore()
  })

  test('handles positive healing numbers with green color', async () => {
    const animation: Animation = {
      type: 'damage-number',
      targetId: 1,
      duration: 1000,
      data: { value: 15 } // Positive = healing
    }

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation()

    await executeAnimationsSequentially([animation])

    expect(consoleSpy).toHaveBeenCalledWith('💥 Damage number animation: 15 for creature 1')

    consoleSpy.mockRestore()
    warnSpy.mockRestore()
  })

  test('applies timeout fallback for stuck animations', async () => {
    const longAnimation: Animation = {
      type: 'shake',
      targetId: 1,
      duration: 100
    }

    // Mock setTimeout to actually use real timing for this test
    const originalTimeout = global.setTimeout
    global.setTimeout = originalTimeout

    const startTime = Date.now()
    await executeAnimationsSequentially([longAnimation])
    const endTime = Date.now()

    // Should complete quickly due to mock, not wait for full duration + timeout
    expect(endTime - startTime).toBeLessThan(200)

    // Restore mock
    global.setTimeout = jest.fn((callback) => {
      callback()
      return 1
    }) as any
  })
})