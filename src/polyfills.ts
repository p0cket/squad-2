// Polyfill for structuredClone (Node.js < 17 compatibility)
// This file should be imported early in the application

declare global {
  function structuredClone<T>(value: T): T;
}

if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = function <T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj.getTime()) as T
    if (obj instanceof Array) return obj.map(item => structuredClone(item)) as T
    if (typeof obj === 'object') {
      const clonedObj: any = {}
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = structuredClone((obj as any)[key])
        }
      }
      return clonedObj as T
    }
    return obj
  }
}

export {}