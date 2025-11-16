import { Attack, Creature } from "../../consts/types/types"

// export const calcDamage = (attacker: Creature, target: Creature, attack: Attack) => {
//   console.group(
//     "calcDamage: attacker, target, attack",
//     attacker,
//     target,
//     attack
//   )
//   if (!attacker || !target) {
//     console.error("Undefined attacker or target in calcDamage")
//     console.groupEnd()
//     return 0
//   }

//   const attackDmg = attacker.attack || 0
//   const defense = target.defense || 0
//   const trueDamage = attacker.trueDamage || 0

//   // Calculate base damage. attack.damage
//   let baseDamage = attackDmg - defense
//   if (baseDamage < 0) baseDamage = 0

//   console.log("Base Damage:", baseDamage)

//   // Add true damage
//   const totalDamage = baseDamage + trueDamage
//   console.log(
//     `(Attack ${attackDmg} - defense ${defense}) + TrueDamage: ${trueDamage} = ${totalDamage}`
//   )
//   // Add some randomness
//   // const randomFactor = 1; // Random factor between 0.9 and 1.1
//   // const randomFactor = Math.random() * 0.2 + 0.9; // Random factor between 0.9 and 1.1
//   // const damage = totalDamage * randomFactor;
//   const damage = totalDamage
//   console.log("Total Damage after Random Factor:", damage)
//   console.groupEnd()

//   return Math.floor(damage)
// }

export const newCalcDamage = (
  attacker: Creature,
  target: Creature,
  attack: Attack
) => {
  console.group(
    "newCalcDamage: attacker, target, attack",
    attacker,
    target,
    attack
  )
  if (!attacker || !target) {
    console.error("Undefined attacker or target in calcDamage")
    console.groupEnd()
    return 0
  }
  // for some reason was attacker, not attack
  const attackDmg = attack.damage
  const defense = target.defense 
  const trueDamage = attack.trueDamage 

  // Calculate base damage. attack.damage
  let baseDamage = attackDmg - defense
  if (baseDamage < 0) baseDamage = 0

  console.log("Base Damage:", baseDamage)

  // Add true damage
  const totalDamage = baseDamage + trueDamage
  console.log(
    `(Attack ${attackDmg} - defense ${defense}) + TrueDamage: ${trueDamage} = ${totalDamage}`
  )
  // Add some randomness // add some crit
  // const randomFactor = 1; // Random factor between 0.9 and 1.1
  // const randomFactor = Math.random() * 0.2 + 0.9; // Random factor between 0.9 and 1.1
  // const damage = totalDamage * randomFactor;
  // just adding bonus damage of 50
  const damage = totalDamage + 50
  console.log("Total Damage:", damage)
  console.groupEnd()
  return Math.floor(damage)
}
