// CreatureStats.js
import React from "react"
import { useStateContext } from "../GameContext"
import { applyRuneEffects } from "../utils.js/runeUtils"
import { CREATURES } from "../consts/creatures"

function CreatureStats() {
  const state = useStateContext()

  return (
    <div className="bg-gray-800 p-4 rounded-lg mt-8">
      <h2 className="text-2xl font-bold mb-4">Creature Stats</h2>
      <div className="grid grid-cols-2 gap-4">
        {state.playerCreatures.map((creature, index) => {
          // Get the base creature data using the template
          const baseCreature = CREATURES[creature.template]

          // Apply rune effects to the base creature to get current stats
          const enhancedStats = applyRuneEffects(baseCreature, state.runes)

          return (
            <div key={index}>
              <h3 className="text-xl font-bold">{`${creature.name} ${creature.icon}`}</h3>
              {Object.entries(enhancedStats).map(([stat, value]) => {
                const baseValue = baseCreature[stat] || 0 // Use the base creature stat
                const runeContribution = value - baseValue
                return (
                  <p key={stat} className="text-white">
                    <span className="text-blue-400">{`${stat}: ${value}`}</span>{" "}
                    <span className="text-gray-400">
                      {runeContribution > 0 ? (
                        <span>
                          <span className="text-yellow-400">{baseValue}</span> +{" "}
                          <span className="text-green-400">
                            {runeContribution}
                          </span>
                        </span>
                      ) : (
                        ""
                      )}
                    </span>
                  </p>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CreatureStats
