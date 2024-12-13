import { EnhancedDispatch, LogType } from "../consts/types/types"

export const createLogEntry = (
  message: string,
  details: string,
  source: string
): LogType => {
  return {
    message,
    timestamp: new Date().toISOString(),
    source,
    details,
  }
}

export const logStep = (
  logEntry: LogType,
  dispatch: EnhancedDispatch
) => {
  dispatch({
    type: "ADD_OBJ_TO_DEBUG_STEP",
    payload: {
      stepIndex: 0,
      obj: logEntry,
    },
  })
}
