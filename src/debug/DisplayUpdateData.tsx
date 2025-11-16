import React, { useState } from "react"

const DisplayUpdateData: React.FC<{ obj: any }> = ({ obj }) => {
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

  const toggleSection = (section: keyof typeof sectionsExpanded) => {
    setSectionsExpanded((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const renderSection = (
    title: string,
    data: any[],
    sectionKey: keyof typeof sectionsExpanded
  ) => (
    <div className="mb-2">
      <h4
        className="font-semibold cursor-pointer"
        onClick={() => toggleSection(sectionKey)}
      >
        {title} {sectionsExpanded[sectionKey] ? "▲" : "▼"}
      </h4>
      {sectionsExpanded[sectionKey] && (
        <div>
          {data.map((item, index) => (
            <div key={index} className="bg-green-700 p-2 rounded mb-1">
              {/* <div key={index} className="bg-gray-700 p-2 rounded mb-1"> */}
              {Object.entries(item).map(([key, value]) => (
                <div key={key}>
                  <span className="text-gray-400">{key}:</span> {String(value)}
                  {/* <span className="text-gray-400">{key}:</span> {String(value)} */}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )

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
          {obj.startingAttacks &&
            renderSection(
              "Starting Attacks",
              obj.startingAttacks,
              "startingAttacks"
            )}
          {obj.possibleAttacks &&
            renderSection(
              "Possible Attacks",
              obj.possibleAttacks,
              "possibleAttacks"
            )}
          {obj.statuses && renderSection("Statuses", obj.statuses, "statuses")}
          {obj.mods && renderSection("Modifiers", obj.mods, "mods")}
        </div>
      )}
    </div>
  )
}

export default DisplayUpdateData
