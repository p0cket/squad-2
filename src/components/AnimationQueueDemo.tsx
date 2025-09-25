// Build 1.1: Animation Queue Test Component
// This component demonstrates the animation queue functionality

import React from 'react'
import { useAnimationQueue } from '../hooks/useAnimationQueue'

const AnimationQueueDemo: React.FC = () => {
  const {
    addCustomAnimation,
    processQueue,
    clearQueue,
    queueStatus,
  } = useAnimationQueue()

  const addTestAnimation = () => {
    const testAnimation = async () => {
      console.log('🎬 Test animation started')
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('🎬 Test animation completed')
    }

    addCustomAnimation(testAnimation, 'TEST', 1)
    console.log('🎬 Added test animation to queue')
  }

  const addMultipleAnimations = () => {
    const animations = [
      { name: 'First Animation', delay: 500 },
      { name: 'Second Animation', delay: 800 },
      { name: 'Third Animation', delay: 300 },
    ]

    animations.forEach((anim, index) => {
      const animation = async () => {
        console.log(`🎬 ${anim.name} started`)
        await new Promise(resolve => setTimeout(resolve, anim.delay))
        console.log(`🎬 ${anim.name} completed`)
      }

      addCustomAnimation(animation, `TEST_${index}`, index + 1)
    })

    console.log('🎬 Added multiple test animations to queue')
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg text-white">
      <h3 className="text-lg font-bold mb-4">🎬 Animation Queue Demo</h3>
      
      <div className="mb-4">
        <p><strong>Queue Length:</strong> {queueStatus.queueLength}</p>
        <p><strong>Processing:</strong> {queueStatus.isProcessing ? 'Yes' : 'No'}</p>
        <p><strong>Current Animation:</strong> {queueStatus.currentAnimation || 'None'}</p>
      </div>

      <div className="space-y-2">
        <button
          onClick={addTestAnimation}
          className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded mr-2"
        >
          Add Test Animation
        </button>
        
        <button
          onClick={addMultipleAnimations}
          className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded mr-2"
        >
          Add Multiple Animations
        </button>
        
        <button
          onClick={processQueue}
          className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded mr-2"
        >
          Process Queue
        </button>
        
        <button
          onClick={clearQueue}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
        >
          Clear Queue
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-300">
        <p>💡 Check the browser console to see animation queue logs</p>
        <p>💡 This demo shows Build 1.1 animation queue integration</p>
      </div>
    </div>
  )
}

export default AnimationQueueDemo
