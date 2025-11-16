import React, { useState } from "react";
import { Creature } from "../consts/types/types";


const DisplayCreatureObj: React.FC<{ obj: Creature; num: number }> = ({
  obj,
  num,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev)
  }

  const [sectionsExpanded, setSectionsExpanded] = useState({
    startingAttacks: false,
    possibleAttacks: false,
    statuses: false,
    mods: false,
  })

  const toggleSection = (section: string) => {
    setSectionsExpanded((prev) => ({
      ...prev,
      // @ts-ignore
      [section]: !prev[section],
    }))
  }

  return (
    <div className="p-1 bg-gray-800 rounded-lg mb-1 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center ">
          <span className="text-l mr-1">{`${obj.icon}`}</span>
          <h3 className="font-bold text-l">{obj.name}</h3>
        </div>
        <button
          onClick={toggleExpanded}
          className="text-gray-400 hover:text-white"
        >
          {isExpanded ? "▲" : "▼"}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-1 text-sm">
        <div>
          <span className="text-gray-400">Template:</span> {obj.template}
        </div>
        <div>
          <span className="text-gray-400">Health:</span> {obj.health} /{" "}
          {obj.maxHealth}
        </div>
        <div>
          <span className="text-gray-400">Attack:</span> {obj.attack}
        </div>
        <div>
          <span className="text-gray-400">True Damage:</span> {obj.trueDamage}
        </div>
        <div>
          <span className="text-gray-400">Defense:</span> {obj.defense}
        </div>
        <div>
          <span className="text-gray-400">Owner:</span> {obj.owner}
        </div>
      </div>
      {isExpanded && (
        <div className="mt-2 text-sm">
          {obj.startingAttacks && obj.startingAttacks.length > 0 && (
            <div className="mb-2">
              <h4
                className="font-semibold cursor-pointer"
                onClick={() => toggleSection("startingAttacks")}
              >
                Starting Attacks {sectionsExpanded.startingAttacks ? "▲" : "▼"}
              </h4>
              {sectionsExpanded.startingAttacks && (
                <div>
                  {/* @ts-ignore */}
                  {obj.startingAttacks.map((attack, index) => (
                    <div key={index} className="bg-gray-700 rounded mb-1">
                      <div>
                        <span className="text-gray-400">Name:</span>{" "}
                        {attack.name}
                      </div>
                      <div>
                        <span className="text-gray-400">Type:</span>{" "}
                        {attack.attackType}
                      </div>
                      <div>
                        <span className="text-gray-400">Damage:</span>{" "}
                        {attack.damage}
                      </div>
                      <div>
                        <span className="text-gray-400">True Damage:</span>{" "}
                        {attack.trueDamage}
                      </div>
                      <div>
                        <span className="text-gray-400">Effects:</span>{" "}
                        {attack.effects.join(", ")}
                      </div>
                      <div>
                        <span className="text-gray-400">Chance to Land:</span>{" "}
                        {attack.chanceToLand}
                      </div>
                      <div>
                        <span className="text-gray-400">Cooldown:</span>{" "}
                        {attack.cooldown}
                      </div>
                      <div>
                        <span className="text-gray-400">Notes:</span>{" "}
                        {attack.notes}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {obj.possibleAttacks && obj.possibleAttacks.length > 0 && (
            <div className="mb-2">
              <h4
                className="font-semibold cursor-pointer"
                onClick={() => toggleSection("possibleAttacks")}
              >
                Possible Attacks {sectionsExpanded.possibleAttacks ? "▲" : "▼"}
              </h4>
              {sectionsExpanded.possibleAttacks && (
                <div>
                  {/* @ts-ignore */}
                  {obj.possibleAttacks.map((attack, index) => (
                    <div key={index} className="bg-gray-700 p-2 rounded mb-1">
                      <div>
                        <span className="text-gray-400">Name:</span>{" "}
                        {attack.name}
                      </div>
                      <div>
                        <span className="text-gray-400">Type:</span>{" "}
                        {attack.attackType}
                      </div>
                      <div>
                        <span className="text-gray-400">Damage:</span>{" "}
                        {attack.damage}
                      </div>
                      <div>
                        <span className="text-gray-400">True Damage:</span>{" "}
                        {attack.trueDamage}
                      </div>
                      <div>
                        <span className="text-gray-400">Effects:</span>{" "}
                        {attack.effects.join(", ")}
                      </div>
                      <div>
                        <span className="text-gray-400">Chance to Land:</span>{" "}
                        {attack.chanceToLand}
                      </div>
                      <div>
                        <span className="text-gray-400">Cooldown:</span>{" "}
                        {attack.cooldown}
                      </div>
                      <div>
                        <span className="text-gray-400">Notes:</span>{" "}
                        {attack.notes}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {obj.statuses && obj.statuses.length > 0 && (
            <div className="mb-2">
              <h4
                className="font-semibold cursor-pointer"
                onClick={() => toggleSection("statuses")}
              >
                Statuses {sectionsExpanded.statuses ? "▲" : "▼"}
              </h4>
              {sectionsExpanded.statuses && (
                <div>
                  {/* @ts-ignore */}
                  {obj.statuses.map((status, index) => (
                    <div key={index} className="bg-gray-700 p-2 rounded mb-1">
                      <div>
                        <span className="text-gray-400">Name:</span>{" "}
                        {status.name}
                      </div>
                      <div>
                        <span className="text-gray-400">Type:</span>{" "}
                        {status.type}
                      </div>
                      <div>
                        <span className="text-gray-400">Duration:</span>{" "}
                        {status.duration}
                      </div>
                      <div>
                        <span className="text-gray-400">Notes:</span>{" "}
                        {status.notes}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {obj.mods && obj.mods.length > 0 && (
            <div className="mb-2">
              <h4
                className="font-semibold cursor-pointer"
                onClick={() => toggleSection("mods")}
              >
                Modifiers {sectionsExpanded.mods ? "▲" : "▼"}
              </h4>
              {sectionsExpanded.mods && (
                <div>
                  {/* @ts-ignore */}
                  {obj.mods.map((mod, index) => (
                    <div key={index} className="bg-gray-700 p-2 rounded mb-1">
                      <div>
                        <span className="text-gray-400">Name:</span> {mod.name}
                      </div>
                      <div>
                        <span className="text-gray-400">Value:</span>{" "}
                        {/* {mod.value} */}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DisplayCreatureObj
