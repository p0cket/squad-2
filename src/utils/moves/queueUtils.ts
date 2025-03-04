export const addToQueue = (queue: any[], operation: any) => {
  queue.push(operation)
}

export const executeQueue = (queue: any[]) => {
  while (queue.length > 0) {
    const operation = queue.shift()
    if (operation) {
      operation()
    }
  }
}
