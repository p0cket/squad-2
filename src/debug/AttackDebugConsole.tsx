import React, { useState, useMemo, useEffect } from "react"
import { useStateContext } from "../GameContext"

// Simplified icons to ensure it runs
const Icons = {
  Info: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  ChevronRight: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  ),
  Minimize2: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 14h6v6" />
      <path d="M20 10h-6V4" />
      <path d="M14 10l7-7" />
      <path d="M3 21l7-7" />
    </svg>
  ),
  Maximize2: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  ),
}

const POSITIONS = [
  "bottom-right",
  "bottom-left",
  "top-right",
  "top-left",
  "center",
]

const SIZES = ["normal", "compact", "expanded"]

// interface DebugConsoleProps {
//   attackLog?: {
//     attacker?: { name?: string; icon?: string }
//     target?: { name?: string; icon?: string }
//     attack?: { name?: string; attackType?: string }
//     isPlayerAttack?: boolean
//     baseDamage?: number
//     totalDamage?: number
//   }
// }
interface Creature {
  name: string
  icon: string
  template: string
  health: number
  maxHealth: number
  attack: number
  trueDamage: number
  defense: number
  owner: string
  [key: string]: any
}

interface StatusEffect {
  name: string
  type: string
  timing: string
  duration: number
  effectFuncName: string
  chance: number
  icon: string
  id: string
  notes: string
  [key: string]: any
}

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
          <span className="text-2xl mr-2">{`${obj.icon}`}</span>
          <h3 className="font-bold text-xl">{obj.name}</h3>
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
                        {mod.value}
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

const DisplayStatusEffectObj: React.FC<{ obj: StatusEffect; num: number }> = ({
  obj,
  num,
}) => {
  return (
    <div className="p-1 bg-gray-800 rounded-lg mb-1 shadow-lg">
      <div className="flex items-center">
        <span className="text-2xl mr-2">{`${obj.icon}`}</span>
        <h3 className="font-bold text-xl">{obj.name}</h3>
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
// @ts-ignore
const AttackDebugConsole = ({
  // const AttackDebugConsole: React.FC<DebugConsoleProps> = ({
  // attackLog = {},
  debugObj,
}: { debugObj: any }) => {
  const {steps} = debugObj
  console.log(`debugObj`, debugObj)

  const [currentStep, setCurrentStep] = useState(0)
  const [position, setPosition] = useState("bottom-right")
  const [size, setSize] = useState("normal")
  const [isMinimized, setIsMinimized] = useState(false)
  useEffect(() => {
    // @ts-ignore
    const handleKeyDown = (event) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.shiftKey &&
        event.key === "A"
      ) {
        event.preventDefault()
        setIsMinimized((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])
  const positionClasses: { [key: string]: string } = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    center: "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
  }

  const sizeClasses: { [key: string]: string } = {
    normal: "w-96 max-h-[500px]",
    compact: "w-64 max-h-[300px]",
    expanded: "w-[500px] max-h-[700px]",
  }

  const myObj = [
    {
      title: "1. Attack Initialization",
      objs: [
        {
          name: "Poison",
          type: "debuff",
          timing: "afterAttack",
          duration: 3,
          effectFuncName: "applyPoison",
          chance: 1,
          icon: "🧪",
          id: `POISON`,
          notes: "Deals damage over time.",
        },
        {
          name: "Draco",
          icon: "🐉",
          template: "dragon",
          health: 250,
          maxHealth: 250,
          attack: 20,
          trueDamage: 90,
          defense: 5,
          mods: [],
          statuses: [],
          startingAttacks: [
            {
              template: "fireball",
              name: "Fireball",
              attackType: "Elemental",
              effects: ["BURN"],
              chanceToLand: 0.9,
              damage: 20,
              trueDamage: 5,
              icon: "fireball_icon",
              notes: "Deals fire damage with a chance to burn the target.",
              cooldown: 3,
            },
            {
              template: "rend",
              name: "Rend",
              attackType: "Physical",
              effects: ["POISON"],
              chanceToLand: 0.85,
              damage: 8,
              trueDamage: 2,
              icon: "axe_icon",
              notes: "Attack that causes bleeding over time.",
              cooldown: 3,
            },
          ],
          possibleAttacks: [
            {
              template: "battle_cry",
              name: "Battle Cry",
              attackType: "Support",
              effects: ["BUFF"],
              chanceToLand: 1,
              damage: 0,
              trueDamage: 0,
              icon: "strength_icon",
              notes: "Boosts allies' attack power.",
              cooldown: 4,
            },
            {
              template: "ultimate_blast",
              name: "Ultimate Blast",
              attackType: "Special",
              effects: [],
              chanceToLand: 0.7,
              damage: 40,
              trueDamage: 5,
              icon: "blast_icon",
              notes: "A powerful attack with high damage.",
              cooldown: 6,
            },
            {
              template: "inspire",
              name: "Inspire",
              attackType: "Auras",
              effects: [],
              chanceToLand: 1,
              damage: 0,
              trueDamage: 0,
              icon: "inspire_icon",
              notes: "Boosts allies' morale.",
              cooldown: 5,
            },
          ],
          ID: 0,
          owner: "player",
        },
      ],
      details: {
        // Attacker: attackLog.attacker?.name ?? "N/A",
        // Target: attackLog.target?.name ?? "N/A",
        // "Is Player Attack": attackLog.isPlayerAttack ?? "N/A",
      },
    },
    {
      title: "2. Attack Details",
      objs: [
        {
          name: "Draco",
          icon: "🐉",
          template: "dragon",
          health: 250,
          maxHealth: 250,
          attack: 20,
          trueDamage: 90,
          defense: 5,
          mods: [],
          statuses: [],
          startingAttacks: [
            {
              template: "fireball",
              name: "Fireball",
              attackType: "Elemental",
              effects: ["BURN"],
              chanceToLand: 0.9,
              damage: 20,
              trueDamage: 5,
              icon: "fireball_icon",
              notes: "Deals fire damage with a chance to burn the target.",
              cooldown: 3,
            },
            {
              template: "rend",
              name: "Rend",
              attackType: "Physical",
              effects: ["POISON"],
              chanceToLand: 0.85,
              damage: 8,
              trueDamage: 2,
              icon: "axe_icon",
              notes: "Attack that causes bleeding over time.",
              cooldown: 3,
            },
          ],
          possibleAttacks: [
            {
              template: "battle_cry",
              name: "Battle Cry",
              attackType: "Support",
              effects: ["BUFF"],
              chanceToLand: 1,
              damage: 0,
              trueDamage: 0,
              icon: "strength_icon",
              notes: "Boosts allies' attack power.",
              cooldown: 4,
            },
            {
              template: "ultimate_blast",
              name: "Ultimate Blast",
              attackType: "Special",
              effects: [],
              chanceToLand: 0.7,
              damage: 40,
              trueDamage: 5,
              icon: "blast_icon",
              notes: "A powerful attack with high damage.",
              cooldown: 6,
            },
            {
              template: "inspire",
              name: "Inspire",
              attackType: "Auras",
              effects: [],
              chanceToLand: 1,
              damage: 0,
              trueDamage: 0,
              icon: "inspire_icon",
              notes: "Boosts allies' morale.",
              cooldown: 5,
            },
          ],
          ID: 0,
          owner: "player",
        },
      ],
      details: {
        // "Attack Name": attackLog.attack?.name ?? "N/A",
        // "Attack Type": attackLog.attack?.attackType ?? "N/A",
      },
    },
    {
      title: "3. Damage Calculation",
      objs: [],
      details: {
        // "Base Damage": attackLog.baseDamage ?? "N/A",
        // "Total Damage": attackLog.totalDamage ?? "N/A",
      },
    },
  ]
  // const steps = useMemo(
  //   () => [
  //     {
  //       title: "1. Attack Initialization",
  //       objs: [
  //         {
  //           name: "Poison",
  //           type: "debuff",
  //           timing: "afterAttack",
  //           duration: 3,
  //           effectFuncName: "applyPoison",
  //           chance: 1,
  //           icon: "🧪",
  //           id: `POISON`,
  //           notes: "Deals damage over time.",
  //         },
  //         {
  //           name: "Draco",
  //           icon: "🐉",
  //           template: "dragon",
  //           health: 250,
  //           maxHealth: 250,
  //           attack: 20,
  //           trueDamage: 90,
  //           defense: 5,
  //           mods: [],
  //           statuses: [],
  //           startingAttacks: [
  //             {
  //               template: "fireball",
  //               name: "Fireball",
  //               attackType: "Elemental",
  //               effects: ["BURN"],
  //               chanceToLand: 0.9,
  //               damage: 20,
  //               trueDamage: 5,
  //               icon: "fireball_icon",
  //               notes: "Deals fire damage with a chance to burn the target.",
  //               cooldown: 3,
  //             },
  //             {
  //               template: "rend",
  //               name: "Rend",
  //               attackType: "Physical",
  //               effects: ["POISON"],
  //               chanceToLand: 0.85,
  //               damage: 8,
  //               trueDamage: 2,
  //               icon: "axe_icon",
  //               notes: "Attack that causes bleeding over time.",
  //               cooldown: 3,
  //             },
  //           ],
  //           possibleAttacks: [
  //             {
  //               template: "battle_cry",
  //               name: "Battle Cry",
  //               attackType: "Support",
  //               effects: ["BUFF"],
  //               chanceToLand: 1,
  //               damage: 0,
  //               trueDamage: 0,
  //               icon: "strength_icon",
  //               notes: "Boosts allies' attack power.",
  //               cooldown: 4,
  //             },
  //             {
  //               template: "ultimate_blast",
  //               name: "Ultimate Blast",
  //               attackType: "Special",
  //               effects: [],
  //               chanceToLand: 0.7,
  //               damage: 40,
  //               trueDamage: 5,
  //               icon: "blast_icon",
  //               notes: "A powerful attack with high damage.",
  //               cooldown: 6,
  //             },
  //             {
  //               template: "inspire",
  //               name: "Inspire",
  //               attackType: "Auras",
  //               effects: [],
  //               chanceToLand: 1,
  //               damage: 0,
  //               trueDamage: 0,
  //               icon: "inspire_icon",
  //               notes: "Boosts allies' morale.",
  //               cooldown: 5,
  //             },
  //           ],
  //           ID: 0,
  //           owner: "player",
  //         },
  //       ],
  //       details: {
  //         // Attacker: attackLog.attacker?.name ?? "N/A",
  //         // Target: attackLog.target?.name ?? "N/A",
  //         // "Is Player Attack": attackLog.isPlayerAttack ?? "N/A",
  //       },
  //     },
  //     {
  //       title: "2. Attack Details",
  //       objs: [
  //         {
  //           name: "Draco",
  //           icon: "🐉",
  //           template: "dragon",
  //           health: 250,
  //           maxHealth: 250,
  //           attack: 20,
  //           trueDamage: 90,
  //           defense: 5,
  //           mods: [],
  //           statuses: [],
  //           startingAttacks: [
  //             {
  //               template: "fireball",
  //               name: "Fireball",
  //               attackType: "Elemental",
  //               effects: ["BURN"],
  //               chanceToLand: 0.9,
  //               damage: 20,
  //               trueDamage: 5,
  //               icon: "fireball_icon",
  //               notes: "Deals fire damage with a chance to burn the target.",
  //               cooldown: 3,
  //             },
  //             {
  //               template: "rend",
  //               name: "Rend",
  //               attackType: "Physical",
  //               effects: ["POISON"],
  //               chanceToLand: 0.85,
  //               damage: 8,
  //               trueDamage: 2,
  //               icon: "axe_icon",
  //               notes: "Attack that causes bleeding over time.",
  //               cooldown: 3,
  //             },
  //           ],
  //           possibleAttacks: [
  //             {
  //               template: "battle_cry",
  //               name: "Battle Cry",
  //               attackType: "Support",
  //               effects: ["BUFF"],
  //               chanceToLand: 1,
  //               damage: 0,
  //               trueDamage: 0,
  //               icon: "strength_icon",
  //               notes: "Boosts allies' attack power.",
  //               cooldown: 4,
  //             },
  //             {
  //               template: "ultimate_blast",
  //               name: "Ultimate Blast",
  //               attackType: "Special",
  //               effects: [],
  //               chanceToLand: 0.7,
  //               damage: 40,
  //               trueDamage: 5,
  //               icon: "blast_icon",
  //               notes: "A powerful attack with high damage.",
  //               cooldown: 6,
  //             },
  //             {
  //               template: "inspire",
  //               name: "Inspire",
  //               attackType: "Auras",
  //               effects: [],
  //               chanceToLand: 1,
  //               damage: 0,
  //               trueDamage: 0,
  //               icon: "inspire_icon",
  //               notes: "Boosts allies' morale.",
  //               cooldown: 5,
  //             },
  //           ],
  //           ID: 0,
  //           owner: "player",
  //         },
  //       ],
  //       details: {
  //         // "Attack Name": attackLog.attack?.name ?? "N/A",
  //         // "Attack Type": attackLog.attack?.attackType ?? "N/A",
  //       },
  //     },
  //     {
  //       title: "3. Damage Calculation",
  //       objs: [],
  //       details: {
  //         // "Base Damage": attackLog.baseDamage ?? "N/A",
  //         // "Total Damage": attackLog.totalDamage ?? "N/A",
  //       },
  //     },
  //   ],
  //   // [attackLog]
  //   [debugObj]
  // )

  const nextStep = () => {
    setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev))
  }

  const prevStep = () => {
    setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev))
  }

  const cyclePosition = () => {
    const currentIndex = POSITIONS.indexOf(position)
    setPosition(POSITIONS[(currentIndex + 1) % POSITIONS.length])
  }

  const cycleSize = () => {
    const currentIndex = SIZES.indexOf(size)
    setSize(SIZES[(currentIndex + 1) % SIZES.length])
  }

  const currentStepData = steps[currentStep]

  if (isMinimized) {
    return (
      <div
        className={`fixed ${positionClasses[position]} bg-gray-800 text-white p-2 rounded-lg shadow-lg z-50 cursor-pointer`}
        onClick={() => setIsMinimized(false)}
      >
        <Icons.Maximize2 />
      </div>
    )
  }

  return (
    <div
      className={`fixed ${positionClasses[position]} ${sizeClasses[size]} bg-gray-800 text-white p-2 rounded-lg shadow-lg overflow-y-auto z-50`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <span className="mr-2">
            <Icons.Info />
          </span>{" "}
          Debug Console
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={cyclePosition}
            className="hover:bg-gray-700 p-1 rounded"
            title="Change Position"
          >
            📍
          </button>
          <button
            onClick={cycleSize}
            className="hover:bg-gray-700 p-1 rounded"
            title="Change Size"
          >
            📏
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="hover:bg-gray-700 p-1 rounded"
            title="Minimize"
          >
            <Icons.Minimize2 />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">{currentStepData.title}</h3>
        <div className="bg-gray-700 p-3 rounded">
          {Object.entries(currentStepData.objs).map(([key, value]) => {
            const checkDisplayType = (value: any) => {
              if (value.startingAttacks) {
                return "Creature"
              }
              if (value.effectFuncName) {
                return "StatusEffect"
              }
            }
            const displayType = checkDisplayType(value)

            return (
              <div key={key} className="mb-1">
                {/* <span className="font-medium text-gray-300">{key}: </span> */}
                {displayType === "Creature" && (
                  //@ts-ignore
                  <DisplayCreatureObj obj={value} num={key} />
                )}
                {displayType === "StatusEffect" && (
                  //@ts-ignore
                  <DisplayStatusEffectObj obj={value} num={key} />
                )}
                {/* <span>{value}</span> */}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="bg-gray-600 p-2 rounded disabled:opacity-50"
        >
          <Icons.ChevronLeft />
        </button>
        <div className="text-sm text-gray-400">
          Step {currentStep + 1} of {steps.length}
        </div>
        <button
          onClick={nextStep}
          disabled={currentStep === steps.length - 1}
          className="bg-gray-600 p-2 rounded disabled:opacity-50"
        >
          <Icons.ChevronRight />
        </button>
      </div>
    </div>
  )
}

export default AttackDebugConsole
// Define a type for debug steps that can hold different data types
// interface DebugStep<T = any> {
//   title: string
//   data: T
//   type: "Creature" | "Attack" | "Generic"
// }

// // Create steps with different object types
// const debugSteps: DebugStep[] = [
//   {
//     title: "1. Attack Initialization",
//     data: attackerObject, // Replace with your attacker object
//     type: "Creature",
//   },
//   {
//     title: "2. Attack Details",
//     data: attackObject, // Replace with your attack object
//     type: "Attack",
//   },
//   {
//     title: "3. Damage Calculation",
//     data: {
//       baseDamage: baseDamageValue,
//       totalDamage: totalDamageValue,
//     },
//     type: "Generic",
//   },
// ]

// // Function to render step details based on type
// const renderStepDetails = (step: DebugStep) => {
//   switch (step.type) {
//     case "Creature":
//       const creature = step.data as Creature
//       return (
//         <div>
//           <div>Name: {creature.name}</div>
//           <div>Health: {creature.health}</div>
//           <div>Attack: {creature.attack}</div>
//           {/* Add other creature properties as needed */}
//         </div>
//       )
//     case "Attack":
//       const attack = step.data as Attack
//       return (
//         <div>
//           <div>Name: {attack.name}</div>
//           <div>Type: {attack.attackType}</div>
//           <div>Damage: {attack.damage}</div>
//           {/* Add other attack properties as needed */}
//         </div>
//       )
//     default:
//       return (
//         <div>
//           {Object.entries(step.data).map(([key, value]) => (
//             <div key={key}>
//               {key}: {value}
//             </div>
//           ))}
//         </div>
//       )
//   }
// }

// // Update the current step data and rendering
// const [currentStepIndex, setCurrentStepIndex] = useState(0)
// const currentStepData = debugSteps[currentStepIndex]

// // Replace the details rendering with this
// <div className="mb-4">
//   <h3 className="text-lg font-semibold mb-2">{currentStepData.title}</h3>
//   <div className="bg-gray-700 p-3 rounded">
//     {renderStepDetails(currentStepData)}
//   </div>
// </div>

// // Update navigation functions
// const nextStep = () => {
//   setCurrentStepIndex((prev) =>
//     prev < debugSteps.length - 1 ? prev + 1 : prev
//   )
// }

// const prevStep = () => {
//   setCurrentStepIndex((prev) => (prev > 0 ? prev - 1 : prev))
// }
