import { effectFunctions, STATUS_EFFECTS } from "../../consts/statuses"
import {
  Attack,
  AttackPayload,
  Creature,
  StatusEffect,
} from "../../consts/types"
import { newCalcDamage } from "./calcDamage"
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
  const allAttackEffects = attack.effects.map(
    (effect) => STATUS_EFFECTS[effect]
  )
  const relevantEffects = getStatusesByPhase(allAttackEffects, timing)
  console.log(`#x 2. relevantEffects to be applied`, relevantEffects)
  relevantEffects.forEach((effect) => {
    const effectDef = STATUS_EFFECTS[effect.id]
    console.log(`#x 2. effectDef`, effectDef)
    changes = runEffect(target, effect)
  })
  console.log(`#x 3. changes`, changes)
  return changes
}
// attacker,
// target,
// isPlayerAttack,
// playerCreatureControlsRef,
// enemyCreatureControlsRef,
// attack,
// dispatch,
// playerCreatures,
// computerCreatures,
const handleStatusEffect = (
  creature: Creature,
  status: StatusEffect,
  attackPayload: AttackPayload
): void => {
  console.log(`handleStatusEffect: lets run ${status.name} with ${status.effectFuncName}`)
  effectFunctions[status.effectFuncName](creature, status, attackPayload)
  // return newPayload
}

const updateCreatureArrWithProc = (
  creatures: Creature[],
  attackPayload: AttackPayload
): void => {
  console.log(
    `%cupdateCreatureArrWithProc`,
    "color: pink; background-color: darkgray; font-family: Arial, sans-serif;",
    creatures,
    attackPayload
  )
  creatures.forEach((creature) => {
    if (creature.statuses && creature.statuses.length > 0) {
      console.log(`${creature.name} has statuses. lets handleStatusEffect:`, creature.statuses)
      creature.statuses.forEach((status) => {
        handleStatusEffect(creature, status, attackPayload)
      })
    }
    return creature
  })
  // return newCreatures
}
const procBothParties = (attackPayload: AttackPayload) => {
  const { playerCreatures, computerCreatures } = attackPayload
  console.log(`procBothParties`)
  updateCreatureArrWithProc(playerCreatures, attackPayload)
  updateCreatureArrWithProc(computerCreatures, attackPayload)
  // const payloadAfterProc: AttackPayload = {
  //   ...attackPayload,
  //   playerCreatures: procdPlayerCreatures,
  //   computerCreatures: procdComputerCreatures,
  // }
  // return payloadAfterProc
}

export const newFindRelevantProcs = (
  attackPayload: AttackPayload,
  timing: string
): void => {
  console.group(
    `%cnewFindRelevantProcs: attackPayload, ?timing?`,
    "color: pink; background-color: white; font-family: Arial, sans-serif;",
    attackPayload,
    timing
  )
  procBothParties(attackPayload)
  console.groupEnd()
  // const procdPayload = procBothParties(attackPayload)
  // return procdPayload
}

// const logStatuses = (creatures: Creature[]) => {
//   creatures.forEach(creature => {
//     if (creature.statuses && creature.statuses.length > 0) {
//       console.log(`${creature.name} has statuses:`, creature.statuses);
//     }
//   });
// };
// logStatuses(playerCreatures);
// logStatuses(computerCreatures);

export const findRelevantProcs = (
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
  let statuses: StatusEffect[] = []

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
    // const effectsArray: string[] = Array.isArray(effects) ? effects : [effects]
    console.group(
      `calcStatuses: Calculating statuses for attack: ${attack.name}`,
      target,
      effects
    )
    // effect should be a an array of strings
    effects.forEach((effect) => {
      // Handle cases where `effect` might be malformed
      // if (!effect || typeof effect !== "object") {
      //   console.warn(`Invalid effect encountered:`, effect)
      //   return
      // }
      // Simulate a roll to determine if the effect lands
      const effectRoll = Math.random()
      // const didLand = effect.chance ? effectRoll <= effect.chance : false;
      const didLand = true
      console.log(
        `%cEffect (overridden to true) Roll: ${effectRoll}`,
        "color: blue; font-weight: bold;",
        `%cEffect Chance: ${STATUS_EFFECTS[effect].chance || 0}`,
        "color: gray; font-weight: normal;"
      )
      if (didLand) {
        statuses.push(STATUS_EFFECTS[effect]) // Add the effect to the list of applied statuses
        console.log(
          `%cEffect ${effect} applied to ${target.name}`,
          "color: green; font-weight: bold;"
        )
      } else {
        console.log(
          `%cEffect ${STATUS_EFFECTS[effect].name} did not apply to ${target.name}`,
          "color: red; font-weight: bold;"
        )
      }
    })

    console.groupEnd()
  }

  return statuses
}

export const runEffect = (creature: Creature, effect: StatusEffect) => {
  // Apply each mod's effect to the creature
  // Ensure the effect exists in STATUS_EFFECTS before applying it
  console.log(`#x 2. effectFunctions`, effectFunctions, effect, creature)
  if (effectFunctions[effect.effectFuncName]) {
    console.log(`#x 3. effectFunctions[${effect.effectFuncName}] found`)
    // creature = effectFunctions[effect.effectFuncName](creature, effect)
  } else {
    console.log(
      `#x 3. effectFunctions[${effect.effectFuncName}] not found`,
      effectFunctions,
      effect.effectFuncName
    )
  }
  return creature
}

export const applyStatus = (creature: Creature, effect: StatusEffect) => {
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
