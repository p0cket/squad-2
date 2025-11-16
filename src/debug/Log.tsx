import React from "react"
import { LogType } from "../consts/types/types"

interface LogProps {
  obj: LogType
  index: number
}
const Log: React.FC<LogProps> = ({ obj, index }) => {
  const { message, timestamp, source, details } = obj
  // console.log(index) // Use index to avoid unused variable error

  return (
    <div className="p-1 bg-gray-700 rounded-lg mb-1 shadow-md">
      <div className="flex justify-between items-stretch">
        <p className="text-sm text-white mr-1">{message}</p>{" "}
        {source && (
          <div className="text-xs text-gray-500">
            <p>src: {source}</p>
          </div>
        )}
      </div>
      <div className="flex justify-between items-stretch">
        {details && (
          <div className="text-xs text-gray-400">
            <span>{details}</span>
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

export default Log
