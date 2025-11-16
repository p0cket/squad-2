export function pocketLog(variableName, variableValue, options = {}) {
    const { tags = [], condition = null, message = '' } = options;
  
    window.postMessage(
      {
        type: 'POCKET_LOG',
        variableName,
        variableValue,
        variableType: typeof variableValue,
        tags: Array.isArray(tags) ? tags : [tags],
        condition,
        message,
        timestamp: new Date().toISOString(),
      },
      '*'
    );
  }
  