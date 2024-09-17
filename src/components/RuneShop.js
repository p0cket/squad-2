// RuneShop.js
import React from "react"
import { useDispatchContext, useStateContext } from "../GameContext"
import RuneCard from "./RuneCard"

function RuneShop() {
  const state = useStateContext()
  const dispatch = useDispatchContext()

  return (
    <div className="bg-gray-400 p-4 rounded-lg">
      <h2 className="text-2xl font-bold mb-1">Rune Shop: ${state.gold}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.availableRunes.map((rune) => (
          <RuneCard
            key={rune.id}
            rune={rune}
            onAction={() => dispatch({ type: "BUY_RUNE", rune })}
            actionLabel="Buy"
            isShop={true}
            disabled={state.gold < rune.cost}
          />
        ))}
      </div>
    </div>
  )
}

export default RuneShop
