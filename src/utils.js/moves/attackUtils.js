import { moveAttacker, returnAttacker, shakeTarget } from "../../components/animations/attackAnimations"
import { effectFunctions, STATUS_EFFECTS } from "../../consts/statuses"
// import { effectFunctions } from "../turnUtils"
import { newCalcDamage } from "./calcDamage"

// Utility to get effects based on timing
const getStatusesByPhase = (effects, timing) => {
  return effects.filter((effect) => {
    const effectDef = STATUS_EFFECTS[effect.id]
    return effectDef && effectDef.timing === timing
  })
}

// Apply effects based on timing
const applyStatuses = (attacker, target, attack, timing) => {
  let changes
  const relevantEffects = getStatusesByPhase(attack.effects, timing)
  relevantEffects.forEach((effect) => {
    const effectDef = STATUS_EFFECTS[effect.id]
    changes = applyEffect(attacker, target, effect, effectDef)
  })
  return changes
}

export const applyPhaseStatuses = (attacker, target, attack, timing) => {
  let changes
  if (attack.effects && attack.effects.length > 0) {
    changes = applyStatuses(attacker, target, attack, timing)
  }
  return { attacker, target, attack, changes }
} 




export const calcAttack = (attacker, target, attack) => {
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

export const calcStatuses = (attacker, target, attack) => {
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

export const applyEffect = (creature, effect) => {
  // Apply each mod's effect to the creature
  // Ensure the effect exists in STATUS_EFFECTS before applying it
  creature = effectFunctions[effect.applyEffect](creature, effect)
  return creature
}

export const applyStatus = (creature, effect) => {
  const newCreature = { ...creature }
  if (!newCreature.statuses) {
    newCreature.statuses = []
  }
  newCreature.statuses.push(effect)
  return newCreature
}

export const removeStatus = (creature, effectName) => {
  const newCreature = { ...creature }
  if (newCreature.statuses) {
    newCreature.statuses = newCreature.statuses.filter(
      (status) => status.name !== effectName
    )
  }
  return newCreature
}

export const clearStatuses = (creature) => {
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
export const getCreatureControlsById = (id, playerRef, enemyRef) => {
  return playerRef.current[id] || enemyRef.current[id] || null
}

export const updateCreatureInList = (creatures, updatedCreature) => {
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

const isCreatureOfThisSet = (creature, creatureSetArr) => {
  return creatureSetArr.some((set) => set.ID === creature.ID)
}

export const applyStatusEffects = (effect, creature) => {
  const newCreature = { ...creature }
  switch (effect) {
    case effect === `stun`:
      newCreature.effect = { name: "stun", duration: 2 }
      // if it is more complicated, just send it there.
      return { ...newCreature }

    default:
      console.log(`default applyStatusEffect hit,`, effect, newCreature)
  }
}

export const getControls = (
  attacker,
  target,
  isPlayerAttack,
  playerCreatureControlsRef,
  enemyCreatureControlsRef
) => {
  const controlsRef = isPlayerAttack
    ? playerCreatureControlsRef
    : enemyCreatureControlsRef;

  const attackerControls = controlsRef.current[attacker.ID]?.controls;
  const targetControls = getCreatureControlsById(
    target.ID,
    playerCreatureControlsRef,
    enemyCreatureControlsRef
  )?.controls;
  const targetShowDamage = getCreatureControlsById(
    target.ID,
    playerCreatureControlsRef,
    enemyCreatureControlsRef
  )?.showDamage;

  return { attackerControls, targetControls, targetShowDamage };
};

export const performAttackAnimation = async (attackerControls, targetControls, direction, distance) => {
  await moveAttacker(attackerControls, direction, distance);
  await shakeTarget(targetControls);
  await returnAttacker(attackerControls);
};

export const updateTargetState = (target, damage, statuses) => {
  return {
    ...target,
    health: Math.max(0, target.health - damage),
    statuses,
  };
};

export const showDamageOnTarget = (targetShowDamage, damage, targetID) => {
  if (targetShowDamage) {
    try {
      console.log("%cShowing damage on target:", "color: red;", targetID);
      targetShowDamage(damage);
    } catch (error) {
      console.error("%cError showing damage on target:", "color: red;", error);
    }
  }
};

export const calculateDamageAndStatuses = (attacker, target, attack) => {
  const objAfterImmediateStatuses = applyPhaseStatuses(
    attacker,
    target,
    attack,
    "beforeAttack"
  );

  const { statuses, damage } = calcAttack(
    objAfterImmediateStatuses.attacker,
    objAfterImmediateStatuses.target,
    objAfterImmediateStatuses.attack
  );

  return { statuses, damage };
};
