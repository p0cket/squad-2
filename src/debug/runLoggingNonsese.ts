import { Creature, LogType } from "../consts/types/types"
import { logStep } from "./logUtils"

type LoggingProps = {
  teamsAliveStatus: {
    aliveComputerCreatures: Creature[]
    alivePlayerCreatures: Creature[]
  }
  attacker: Creature | null
  target: Creature | null
  dispatch: (action: any) => void
}

export const runLoggingNonsense = ({
  teamsAliveStatus,
  attacker,
  target,
  dispatch,
}: LoggingProps) => {
  dispatch({
    type: "ADD_OBJ_TO_DEBUG_STEP",
    payload: {
      stepIndex: 0,
      obj: teamsAliveStatus.aliveComputerCreatures,
    },
  })
  dispatch({
    type: "ADD_OBJ_TO_DEBUG_STEP",
    payload: {
      stepIndex: 0,
      obj: teamsAliveStatus.alivePlayerCreatures,
    },
  })

  const newLogEntry: LogType = {
    message: `So: ${attacker?.name} on ${target?.name}`,
    timestamp: new Date().toISOString(),
    details: `Does this look right?:`,
    source: "runTurn",
  }
  logStep(newLogEntry, dispatch)

  const logEntry: LogType = {
    message: `Attack by ${attacker?.name} on ${target?.name}`,
    timestamp: new Date().toISOString(),
    details: `Here we're expecting to see the attackPayload:`,
    source: "runTurn",
  }
  dispatch({
    type: "ADD_OBJ_TO_DEBUG_STEP",
    payload: {
      stepIndex: 0,
      obj: logEntry,
    },
  })
}
