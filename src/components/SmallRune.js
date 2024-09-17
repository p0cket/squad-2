import React from "react"

function SmallRune({ rune, onAction, actionLabel, isShop, isConcise }) {
  return (
    <div className="relative group bg-gray-700 p-4 rounded-lg">
      {/* Concise view */}
      <div className={`${isConcise ? "block" : "hidden"} group-hover:hidden`}>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">{rune.name}</span>
          {<span>{rune.icon}</span> || <span>[icon]</span>}{" "}
          {/* Example icon, replace with actual icon */}
        </div>
        {/* <div className="text-sm">{rune.effect}</div> */}
        <div className="text-sm">
          {rune.statEffect.stat} {rune.statEffect.value}
        </div>
      </div>

      {/* Detailed view on hover */}
      <div
        className={`${
          isConcise ? "hidden" : "block"
        } group-hover:block absolute inset-0 bg-gray-700 p-4 rounded-lg`}
      >
        <h3 className="text-lg font-bold mb-2">{rune.name}</h3>
        {/* <p className="text-sm mb-4">{rune.description}</p> */}
        <div className="text-sm mb-4">{rune.effect}</div>
        <button
          onClick={onAction}
          className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  )
}

export default SmallRune
