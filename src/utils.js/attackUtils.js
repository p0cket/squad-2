import {
  moveAttacker,
  returnAttacker,
  shakeTarget,
} from "../components/animations/attackAnimations"
import { STATUS_EFFECTS } from "../consts/effects"
import { getAliveCreatures, processEndOfTurn } from "./battleUtils"
import { checkIfPartyDead } from "./turnUtils"

export const calcDamage = (attacker, target, attack) => {
  console.group(
    "calcDamage: attacker, target, attack",
    attacker,
    target,
    attack
  )

  if (!attacker || !target) {
    console.error("Undefined attacker or target in calcDamage")
    console.groupEnd()
    return 0
  }

  const attackDmg = attacker.attack || 0
  const defense = target.defense || 0
  const trueDamage = attacker.trueDamage || 0

  // Calculate base damage. attack.damage
  let baseDamage = attackDmg - defense
  if (baseDamage < 0) baseDamage = 0

  console.log("Base Damage:", baseDamage)

  // Add true damage
  const totalDamage = baseDamage + trueDamage
  console.log(
    `(Attack ${attackDmg} - Defense ${defense}) + TrueDamage: ${trueDamage} = ${totalDamage}`
  )
  // Add some randomness
  // const randomFactor = 1; // Random factor between 0.9 and 1.1
  // const randomFactor = Math.random() * 0.2 + 0.9; // Random factor between 0.9 and 1.1
  // const damage = totalDamage * randomFactor;
  const damage = totalDamage
  console.log("Total Damage after Random Factor:", damage)
  console.groupEnd()

  return Math.floor(damage)
}

// Main performAttack function
export const performAttack = async (
  attacker,
  target,
  isPlayerAttack,
  playerCreatureControlsRef,
  enemyCreatureControlsRef,
  attack
) => {
  console.group("performAttack")
  console.log(
    "Performing attack from:",
    attacker,
    "to:",
    target,
    "attack is:",
    attack
  )

  const attackerID = attacker.ID
  const targetID = target.ID

  // Retrieve the correct controls
  const controlsRef = isPlayerAttack
    ? playerCreatureControlsRef
    : enemyCreatureControlsRef
  const opponentControlsRef = isPlayerAttack
    ? enemyCreatureControlsRef
    : playerCreatureControlsRef

  const attackerControls = controlsRef.current[attackerID]?.controls
  const targetControls = opponentControlsRef.current[targetID]?.controls
  const targetShowDamage = opponentControlsRef.current[targetID]?.showDamage

  if (!attackerControls || !targetControls) {
    console.warn(
      `Animation controls not found for attacker ID: ${attackerID} or target ID: ${targetID}, skipping attack animation.`
    )
    console.groupEnd()
    return 0 // Return to avoid NaN errors later
  }

  const direction = isPlayerAttack ? -1 : 1
  const distance = 150

  // Execute animations in sequence
  await moveAttacker(attackerControls, direction, distance)
  await shakeTarget(targetControls)
  await returnAttacker(attackerControls)

  // Calculate damage
  console.group("Damage Calculation & Show Damage")

  // apply immediate effects
  // applyImmediateEffects(attacker, target, attack)
  const damage = calcDamage(attacker, target)
  // apply effects
  // applyEffects(attacker, target, attack)
  if (typeof damage !== "number" || isNaN(damage)) {
    console.error("Calculated damage is not a valid number:", damage)
    console.groupEnd()
    return 0 // Ensure we return a valid number
  }

  const damagedHP = target.health - damage
  console.log("Target's health after damage:", damagedHP)
  console.groupEnd()

  // Show damage on target
  if (targetShowDamage) {
    try {
      console.log("Showing damage on target:", targetID)
      targetShowDamage(damage);
      console.groupEnd()
    } catch (error) {
      console.error("Error showing damage on target:", error)
    }
  }

  console.groupEnd()
  return damage // Return valid number
}

export const handleAttack = async (
  state,
  dispatch,
  playerCreatureControlsRef,
  enemyCreatureControlsRef
) => {
  console.log(
    "Handling Attack... State at start:"
    // JSON.stringify(state, null, 2)
  )
  // just turns + 1
  dispatch({ type: "INCREMENT_TURN" })

  const alivePlayerCreatures = getAliveCreatures(state.playerCreatures)
  const aliveComputerCreatures = getAliveCreatures(state.computerCreatures)

  console.log(
    "Alive player creatures:",
    JSON.stringify(alivePlayerCreatures, null, 2)
  )
  console.log(
    "Alive computer creatures:",
    JSON.stringify(aliveComputerCreatures, null, 2)
  )

  // checking if both player is alive and comp too.
  const isPartyDead = checkIfPartyDead(aliveComputerCreatures)
  if (alivePlayerCreatures.length > 0 && aliveComputerCreatures.length > 0) {
    const playerAttacker = alivePlayerCreatures[0]
    const computerTarget = aliveComputerCreatures[0]
    console.log(
      "Player Attacking computer. Player, target:",
      JSON.stringify(playerAttacker, null, 2),
      JSON.stringify(computerTarget, null, 2)
    )
    let damage
    try {
      damage = await performAttack(
        playerAttacker,
        computerTarget,
        true,
        playerCreatureControlsRef,
        enemyCreatureControlsRef
      )
      console.log("Damage dealt by player:", damage)
    } catch (error) {
      console.error("Error in performAttack:", error)
      damage = 0 // Set damage to zero if there's an error to prevent NaN issues
    }

    // error handling
    if (isNaN(damage) || damage === undefined) {
      console.error(
        "Error: Damage is NaN or undefined. Player Attacker:",
        JSON.stringify(playerAttacker, null, 2),
        "Computer Target:",
        JSON.stringify(computerTarget, null, 2)
      )
      damage = 0 // Prevent health from being affected by invalid damage
    }

    //update computer with damage
    dispatch({
      type: "UPDATE_CREATURE",
      side: "computerCreatures",
      creature: {
        ...computerTarget,
        health: Math.max(0, computerTarget.health - damage),
      },
    })

    console.log(
      "Computer Target details after attack:",
      JSON.stringify(
        {
          ...computerTarget,
          health: Math.max(0, computerTarget.health - damage),
        },
        null,
        2
      )
    )
  }

  if (alivePlayerCreatures.length > 0 && aliveComputerCreatures.length > 0) {
    const computerAttacker = aliveComputerCreatures[0]
    const playerTarget = alivePlayerCreatures[0]

    console.log("Computer attacking player...")
    console.log(
      "Computer Attacker details:",
      JSON.stringify(computerAttacker, null, 2)
    )
    console.log(
      "Player Target details before attack:",
      JSON.stringify(playerTarget, null, 2)
    )

    let damage
    try {
      damage = await performAttack(
        computerAttacker,
        playerTarget,
        false,
        playerCreatureControlsRef,
        enemyCreatureControlsRef
      )
      console.log("Damage dealt by computer:", damage)
    } catch (error) {
      console.error("Error in performAttack:", error)
      damage = 0 // Set damage to zero if there's an error to prevent NaN issues
    }

    if (isNaN(damage) || damage === undefined) {
      console.error(
        "Error: Damage is NaN or undefined. Computer Attacker:",
        JSON.stringify(computerAttacker, null, 2),
        "Player Target:",
        JSON.stringify(playerTarget, null, 2)
      )
      damage = 0 // Prevent health from being affected by invalid damage
    }

    dispatch({
      type: "UPDATE_CREATURE",
      side: "playerCreatures",
      creature: {
        ...playerTarget,
        health: Math.max(0, playerTarget.health - damage),
      },
    })

    console.log(
      "Player Target details after attack:",
      JSON.stringify(
        {
          ...playerTarget,
          health: Math.max(0, playerTarget.health - damage),
        },
        null,
        2
      )
    )
  }

  if (aliveComputerCreatures.length === 0) {
    console.log("Player has won the battle. Dispatching WIN_GAME...")
    dispatch({ type: "WIN_GAME" })
  }

  const { playerLost, computerLost } = processEndOfTurn(state, dispatch)
  console.log(
    "End of turn processing results: Player Lost:",
    playerLost,
    "Computer Lost:",
    computerLost
  )

  if (!playerLost && !computerLost) {
    console.log("Preparing for next turn...")
    dispatch({ type: "PREPARE_NEXT_TURN" })
  }
}

const applyImmediateEffects = (attacker, target, attack, damage) => {
  // Apply immediate effects that modify damage (e.g., critical hits)
  if (attack.effects && attack.effects.length > 0) {
    attack.effects.forEach((effect) => {
      const effectDef = STATUS_EFFECTS[effect.id]
      if (effectDef && effectDef.durationRange === "Instant") {
        const effectRoll = Math.random()
        if (effectRoll <= effect.effectChance) {
          damage = effectDef.applyEffect(attacker, target, damage)
          console.log(`Effect ${effectDef.name} modified damage to ${damage}`)
        }
      }
    })
  }
}
const applyEffects = (attacker, target, attack) => {
  // Apply ongoing status effects
  if (attack.effects && attack.effects.length > 0) {
    attack.effects.forEach((effect) => {
      const effectDef = STATUS_EFFECTS[effect.id]
      if (effectDef && effectDef.durationRange !== "Instant") {
        const effectRoll = Math.random()
        if (effectRoll <= effect.effectChance) {
          // const duration = parseDurationRange(effectDef.durationRange)
          const mod = {
            ...effectDef,
            // duration,
          }
          target.mods.push(mod)
          console.log(`Applied effect ${effectDef.name} to ${target.name}`)
        } else {
          console.log(
            `Effect ${effectDef.name} did not apply to ${target.name}`
          )
        }
      }
    })
  }
}
