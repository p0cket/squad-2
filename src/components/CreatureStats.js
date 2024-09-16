// CreatureStats.js
import React from "react"
import { useStateContext } from "../GameContext"
import { applyRuneEffects } from "../utils.js/runeUtils"

function CreatureStats() {
  const state = useStateContext()
  // const currentStats = Object.fromEntries(
  //   Object.entries(state.baseStats).map(([stat, baseValue]) => {
  //     const value = baseValue + state.runes.reduce(
  //       (sum, rune) => (rune.statEffect.stat === stat ? sum + rune.statEffect.value : sum),
  //       0
  //     );
  //     return [stat, value];
  //   })
  // );

  const currentStats = state.playerCreatures.map((creature) =>
    applyRuneEffects(creature, state.runes)
  )

  return (
    <div className="bg-gray-800 p-4 rounded-lg mt-8">
            <h2 className="text-2xl font-bold mb-4">Creature Stats</h2>
      <div className="grid grid-cols-2 gap-4">
        {state.playerCreatures.map((creature, index) => (
          <div key={index}>
            <h3 className="text-xl font-bold">{creature.name}</h3>
            {Object.entries(currentStats[index]).map(([stat, value]) => {
              const baseValue = state.baseStats[stat] || 0
              const runeContribution = value - baseValue

              return (
                <p key={stat} className="text-white">
                  <span className="text-blue-400">{`${stat}: ${value}`}</span>{" "}
                  <span className="text-gray-400">
                    (
                    <span className="text-yellow-400">{baseValue}</span> +{" "}
                    <span className="text-green-400">
                      {runeContribution > 0
                        ? `${runeContribution} (from runes)`
                        : "no runes"}
                    </span>
                    )
                  </span>
                </p>
              )
            })}
          </div>
        ))}
      </div>
      {/* <h2 className="text-2xl font-bold mb-4">Creature Stats</h2>
      <div className="grid grid-cols-2 gap-4">
        {state.playerCreatures.map((creature, index) => (
          <div key={index}>
            <h3 className="text-xl font-bold">{creature.name}</h3>
            {Object.entries(currentStats[index]).map(([stat, value]) => (
              <p key={stat}>{`${stat}: ${value}`}</p>
            ))}
          </div>
        ))}
      </div> */}
      {/* <h2 className="text-2xl font-bold mb-4">Creature Stats</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          {Object.entries(state.baseStats).map(([stat, value]) => (
            <p key={stat}>{`${stat}: ${value}`}</p>
          ))}
        </div>
        <div>
          {Object.entries(currentStats).map(([stat, value]) => (
            <p key={stat}>{`${stat}: ${value} (${value > state.baseStats[stat] ? '+' : ''}${value - state.baseStats[stat]})`}</p>
          ))}
        </div>
      </div> */}
    </div>
  )
}

export default CreatureStats
