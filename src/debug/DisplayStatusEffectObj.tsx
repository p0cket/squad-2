
import React from "react";
import { StatusEffect } from "../consts/types/types";
const DisplayStatusEffectObj: React.FC<{ obj: StatusEffect; num: number }> = ({
    obj,
    num,
  }) => {
    return (
      <div className="p-1 bg-gray-800 rounded-lg mb-1 shadow-lg">
        <div className="flex items-center">
          <span className="text-l mr-2">{`Status: ${obj.icon}`}</span>
          <h3 className="font-bold text-l">{obj.name}</h3>
        </div>
        <div className="grid grid-cols-2 gap-1 text-sm">
          <div>
            <span className="text-gray-400">Type:</span> {obj.type}
          </div>
          <div>
            <span className="text-gray-400">Timing:</span> {obj.timing}
          </div>
          <div>
            <span className="text-gray-400">Duration:</span> {obj.duration}
          </div>
          <div>
            <span className="text-gray-400">Effect Function:</span>{" "}
            {obj.effectFuncName}
          </div>
          <div>
            <span className="text-gray-400">Chance:</span> {obj.chance}
          </div>
          <div>
            <span className="text-gray-400">Notes:</span> {obj.notes}
          </div>
        </div>
      </div>
    )
  }

  export default DisplayStatusEffectObj