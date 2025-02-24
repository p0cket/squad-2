import React from "react"
import { PushLogType } from "../consts/types/types"

interface LogProps {
  obj: PushLogType
  index: number
}
const PushLog: React.FC<LogProps> = ({ obj, index }) => {
//   const { message, timestamp, source, details } = obj
const { message, timestamp, source, action } = obj

  console.log(index) // Use index to avoid unused variable error

  return (
    <div className="p-1 bg-green-900 rounded-lg mb-1 shadow-md border-purple-800 border-x-2">
      <div className="flex justify-between items-stretch">
        <p className="text-sm text-white mr-1">{message}</p>{" "}
        {source && (
          <div className="text-xs text-green-500">
            <p>src: {source}</p>
          </div>
        )}
      </div>
      <div className="flex justify-between items-stretch">
        {action && (
          <div className="text-xs text-gray-400">
            <span>Payload: {JSON.stringify(action)}</span>
          </div>
        )}{" "}
      </div>
      <p className="text-xs  text-gray-500">
        {new Date(timestamp).toLocaleTimeString("en-US", { hour12: false })}.
        {new Date(timestamp).getMilliseconds()}
      </p>
    </div>
  )
}

export default PushLog
  // const newPushLogEntry: PushLogType = {
  //   message: `So: ${attacker?.name} on ${target?.name}`,
  //   timestamp: new Date().toISOString(),
  //   payload: `Does this look right in green?:`,
  //   source: "runTurn",
  // }

  // logStep(newPushLogEntry, dispatch)

