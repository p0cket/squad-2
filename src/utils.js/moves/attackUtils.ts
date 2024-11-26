import { effectFunctions, STATUS_EFFECTS } from "../../consts/statuses"
import { Attack, AttackPayload, Creature, StatusEffect } from "../../consts/types"
// import { effectFunctions } from "../turnUtils"
// import { newCalcDamage } from "./calcDamage"

// Utility to get effects based on timing
const getStatusesByPhase = (effects: StatusEffect[], timing: string) => {
  console.log(
    `#x 1b. effects`,
    effects,
    timing,
    STATUS_EFFECTS,
    STATUS_EFFECTS[effects[0].id]
  )
  console.log(
    `#x 1c. effectDef && effectDef.timing === timing`,
    STATUS_EFFECTS[effects[0].id],
    timing,
    STATUS_EFFECTS[effects[0].id].timing === timing
  )
  return effects.filter((effect) => {
    const effectDef = STATUS_EFFECTS[effect.id]
    return effectDef && effectDef.timing === timing
  })
}

// Apply effects based on timing // weak, etc.
const procStatuses = (
  attacker: Creature,
  target: Creature,
  attack: Attack,
  timing: string
) => {
  let changes = null
  const relevantEffects = getStatusesByPhase(attack.effects, timing)
  console.log(`#x 2. relevantEffects to be applied`, relevantEffects)
  relevantEffects.forEach((effect) => {
    const effectDef = STATUS_EFFECTS[effect.id]
    console.log(`#x 2. effectDef`, effectDef)
    changes = runEffect(attacker, target, effect, effectDef)
  })
  console.log(`#x 3. changes`, changes)
  return changes
}

export const findRelevantProcs = (
  // attacker,
  // target,
  // isPlayerAttack,
  // playerCreatureControlsRef,
  // enemyCreatureControlsRef,
  // attack,
  // dispatch,
  // playerCreatures,
  // computerCreatures,
  attackPayload: AttackPayload,
  timing: string
) => {
  console.log(`findRelevantProcs: attackPayload, timing`, attackPayload, timing)
  const {
    attacker,
    target,
    isPlayerAttack,
    playerCreatureControlsRef,
    enemyCreatureControlsRef,
    attack,
    dispatch,
    playerCreatures,
    computerCreatures,
  } = attackPayload
  let changes = null
  const hasEffects = attack.effects && attack.effects.length > 0
  console.log(
    `#x 0. hasEffects:${hasEffects} attacker, target, attack, timing`,
    attacker,
    target,
    attack,
    timing
  )
  if (hasEffects) {
    changes = procStatuses(attacker, target, attack, timing)
  }
  console.log(`#x 1. changes`, changes)
  return { attacker, target, attack, changes }
}

export const calcAttack = (
  attacker: Creature,
  target: Creature,
  attack: Attack
) => {
  let statuses
  let damage
  statuses = calcStatuses(attacker, target, attack)
  damage = newCalcDamage(attacker, target, attack)
  console.log(
    `calcAttack: attacker, target, attack, statuses, damage`,
    attacker,
    target,
    attack,
    statuses,
    damage
  )

  return { statuses, damage }
}

export const calcStatuses = (
  attacker: Creature,
  target: Creature,
  attack: Attack
) => {
  const { effects } = attack
  let statuses = []

  // Log the received parameters
  console.log(
    `calcStatuses: attacker, target, attack, effects`,
    attacker,
    target,
    attack,
    effects
  )

  if (effects) {
    // Normalize `effects` to an array for consistent processing
    const effectsArray = Array.isArray(effects) ? effects : [effects]

    console.group(
      `calcStatuses: Calculating statuses for attack: ${attack.name}`,
      target,
      effectsArray
    )

    effectsArray.forEach((effect) => {
      // Handle cases where `effect` might be malformed
      if (!effect || typeof effect !== "object") {
        console.warn(`Invalid effect encountered:`, effect)
        return
      }

      // Simulate a roll to determine if the effect lands
      const effectRoll = Math.random()
      // const didLand = effect.chance ? effectRoll <= effect.chance : false;
      const didLand = true

      console.log(
        `%cEffect (overridden to true) Roll: ${effectRoll}`,
        "color: blue; font-weight: bold;",
        `%cEffect Chance: ${effect.chance || 0}`,
        "color: gray; font-weight: normal;"
      )

      if (didLand) {
        statuses.push(effect) // Add the effect to the list of applied statuses
        console.log(
          `%cEffect ${effect.name} applied to ${target.name}`,
          "color: green; font-weight: bold;"
        )
      } else {
        console.log(
          `%cEffect ${effect.name} did not apply to ${target.name}`,
          "color: red; font-weight: bold;"
        )
      }
    })

    console.groupEnd()
  }

  return statuses
}

export const runEffect = (creature: Creature, effect) => {
  // Apply each mod's effect to the creature
  // Ensure the effect exists in STATUS_EFFECTS before applying it
  console.log(`#x 2. effectFunctions`, effectFunctions, effect, creature)
  if (effectFunctions[effect.applyEffect]) {
    creature = effectFunctions[effect.applyEffect](creature, effect)
  } else {
    console.log(
      `#x 3. effectFunctions[${effect.applyEffect}] not found`,
      effectFunctions,
      effect.applyEffect
    )
  }
  return creature
}

export const applyStatus = (creature: Creature, effect) => {
  const newCreature = { ...creature }
  if (!newCreature.statuses) {
    newCreature.statuses = []
  }
  newCreature.statuses.push(effect)
  return newCreature
}

export const removeStatus = (creature: Creature, effectName: string) => {
  const newCreature = { ...creature }
  if (newCreature.statuses) {
    newCreature.statuses = newCreature.statuses.filter(
      (status) => status.name !== effectName
    )
  }
  return newCreature
}

export const clearStatuses = (creature: Creature) => {
  const newCreature = { ...creature }
  newCreature.statuses = []
  return newCreature
}
// }

// export const applyEffects = (attacker, target, attack) => {
//   // Apply ongoing status effect
//   if (attack.effects && attack.effects.length > 0) {
//     attack.effects.forEach((effect) => {
//       const effectDef = STATUS_EFFECTS[effect.id]
//       if (effectDef && effectDef.durationRange !== "Instant") {
//         const effectRoll = Math.random()
//         if (effectRoll <= effect.effectChance) {
//           // const duration = parseDurationRange(effectDef.durationRange)
//           const mod = {
//             ...effectDef,
//             // duration,
//           }
//           target.mods.push(mod)
//           console.log(`Applied effect ${effectDef.name} to ${target.name}`)
//         } else {
//           console.log(
//             `Effect ${effectDef.name} did not apply to ${target.name}`
//           )
//         }
//       }
//     })
//   }
// }

export const updateCreatureInList = (
  creatures: Creature[],
  updatedCreature: Creature
) => {
  console.log("updateCreatureInList called with:", creatures, updatedCreature)

  if (!Array.isArray(creatures)) {
    console.error("`creatures` is not an array:", creatures)
    return []
  }
  const newCreatureArr = creatures.map((creature) => {
    console.log(
      "Comparing IDs:",
      creature.ID,
      "(",
      typeof creature.ID,
      ")",
      "with",
      updatedCreature.ID,
      "(",
      typeof updatedCreature.ID,
      ")"
    )
    if (creature.ID === updatedCreature.ID) {
      console.log("Updating creature with ID:", creature.ID)
      return { ...creature, ...updatedCreature }
    }
    return creature
  })
  return newCreatureArr
}

const isCreatureOfThisSet = (
  creature: Creature,
  creatureSetArr: Creature[]
) => {
  return creatureSetArr.some((set) => set.ID === creature.ID)
}

// export const applyStatusEffects = (effect, creature: Creature) => {
//   const newCreature = { ...creature }
//   switch (effect) {
//     case effect === `stun`:
//       newCreature.effect = { name: "stun", duration: 2 }
//       // if it is more complicated, just send it there.
//       return { ...newCreature }

//     default:
//       console.log(`default applyStatusEffect hit,`, effect, newCreature)
//   }
// }
