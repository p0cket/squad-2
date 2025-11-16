import React, { useState, useMemo, useEffect } from "react"
import { useStateContext, useDispatchContext } from "../GameContext"
import DisplayCreatureObj from "./DisplayCreatureObj"
import DisplayStatusEffectObj from "./DisplayStatusEffectObj"
import { AnimatePresence, motion } from "framer-motion"
import { LogType, PushLogType } from "../consts/types/types"
import Log from "./Log"
import DisplayUpdateData from "./DisplayUpdateData"
import PushLog from "./PushLog"

const variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
}

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

type UpdateData = any

type PushLog = any

const AttackDebugConsole = ({
  // const AttackDebugConsole: React.FC<DebugConsoleProps> = ({
  debugObj,
}: {
  debugObj: any
}) => {
  const { steps } = debugObj
  const dispatch = useDispatchContext()
  console.log(`debugObj`, debugObj)

  const [currentStep, setCurrentStep] = useState(0)
  const [position, setPosition] = useState("bottom-right")
  const [size, setSize] = useState("expanded")
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
    expanded: "w-[500px] max-h-[98vh]",
    // expanded: "w-[500px] max-h-[950px]",
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

  const goToEffectPipelineDemo = () => {
    dispatch({ type: "CHANGE_SCREEN", payload: { screen: "effect-pipeline-demo" } })
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
      className={`fixed ${positionClasses[position]} ${sizeClasses[size]} bg-gray-800 text-white p-1 rounded-lg shadow-lg overflow-y-auto z-50 border border-gray-700`}
    >
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-xl font-bold flex items-center">Debug Stack</h2>
        <div className="flex space-x-2">
          <button
            onClick={goToEffectPipelineDemo}
            className="hover:bg-blue-600 bg-blue-500 px-2 py-1 rounded text-xs font-bold"
            title="Effect Pipeline Demo"
          >
            🧪 Pipeline
          </button>
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

      <div className="mb-2">
        <h3 className="text-lg font-semibold ">{currentStepData.title}</h3>
        <div className="bg-gray-700 p-1 rounded">
          <AnimatePresence>
            {currentStepData.objs.map(
              (
                obj: Creature | StatusEffect | LogType | UpdateData | PushLog,
                index: number
              ) => {
                const checkDisplayType = (
                  value:
                    | Creature
                    | StatusEffect
                    | LogType
                    | PushLogType
                    | UpdateData
                    | PushLog
                ) => {
                  console.log(`checkDisplayType Reached: value`, value)
                  if ((value as Creature).startingAttacks) {
                    return "Creature"
                  }
                  if ((value as StatusEffect).effectFuncName) {
                    return "StatusEffect"
                  }
                  // Add displayUpdateData here
                  if ((value as PushLogType).action) {
                    console.log(`PushLog reached`)
                    return "PushLog"
                  }
                  if ((value as LogType).source) {
                    console.log(`Log Reached: value`, value)
                    return "Log"
                  }
                  
                }
                const displayType = checkDisplayType(obj)

                return (
                  <motion.div
                    key={index}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={variants}
                    className="mb-1"
                  >
                    {displayType === "Creature" && (
                      //@ts-ignore
                      <DisplayCreatureObj obj={obj} num={index} />
                    )}
                    {displayType === "StatusEffect" && (
                      //@ts-ignore
                      <DisplayStatusEffectObj obj={obj} num={index} />
                    )}
                    {/* @ts-ignore */}
                    {displayType === "UpdateData" && (
                      //@ts-ignore
                      <DisplayUpdateData obj={obj} num={index} />
                    )}
                    {displayType === "Log" && (
                      //@ts-ignore
                      <Log obj={obj} num={index} />
                    )}
                    {/* @ts-ignore */}
                    {displayType === "PushLog" && (
                      //@ts-ignore
                      <PushLog obj={obj} num={index} />
                    )}
                  </motion.div>
                )
              }
            )}
          </AnimatePresence>
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
