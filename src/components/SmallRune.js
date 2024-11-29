import React from "react";

function SmallRune({ rune, onAction, actionLabel, isShop, isConcise }) {
  return (
    <div className="relative group bg-gray-700 p-4 rounded-lg shadow-lg border border-gray-600">
      <div className="flex flex-row items-center justify-between">
        <span className="text-sm font-bold">{rune.name}</span>
        <span className="text-xl mt-1">{rune.icon || "🔮"}</span>
      </div>
      <div className="flex flex-row text-xs mt-1">
        {rune.statEffect.stat.toUpperCase()} +{rune.statEffect.value}{" "}
        <div className="flex justify-center mx-1">
          <button
            onClick={onAction}
            className="bg-red-500 text-whit px-2 rounded-full hover:bg-red-600 transition-colors duration-200"
          >
            sell
          </button>
        </div>
      </div>
      {/* A nice square version, but still too big */}
      {/* Concise view */}
      {/* <div className={`${isConcise ? "block" : "hidden"} `}>
        <div className="flex flex-col items-center justify-between">
          <span className="text-lg font-bold">{rune.name}</span>
          <div className="text-3xl mt-2">{rune.icon || "🔮"}</div>
        </div>
        <div className="text-sm mt-2">
          {rune.statEffect.stat.toUpperCase()} +{rune.statEffect.value}
        </div>
      </div> */}
      {/* Detailed view on hover - fix */}
      {/* <div
        className={`${
          isConcise ? "hidden" : "block"
        } absolute inset-0 bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col justify-between`}
      >
        <div>
          <div className="flex flex-col items-center mb-4">
            <div className="text-4xl mb-2">{rune.icon || "🔮"}</div>
            <h3 className="text-xl font-bold text-white">{rune.name}</h3>
            <p className="text-sm text-gray-300 italic">{rune.type}</p>
          </div>
          <p className="text-sm text-gray-300 mb-4 text-center">{rune.effect}</p>
        </div>
        <div className="flex justify-center">
          <button
            onClick={onAction}
            className="bg-red-500 text-white py-2 px-4 rounded-full hover:bg-red-600 transition-colors duration-200"
          >
            {actionLabel}
          </button>
        </div>
      </div> */}
    </div>
  );
}

export default SmallRune;
