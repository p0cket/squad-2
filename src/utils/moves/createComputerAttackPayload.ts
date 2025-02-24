import { attacks } from "../../consts/attacks"
import { AttackPayload, Creature } from "../../consts/types/types"

export const createComputerAttackPayload = (
  aliveComputerCreatures: Creature[],
  alivePlayerCreatures: Creature[],
  state: any,
  playerCreatureControlsRef: any,
  enemyCreatureControlsRef: any,
  dispatch: any
): AttackPayload => {
  const computerAttacker = aliveComputerCreatures[0]
  const computersTarget = alivePlayerCreatures[0]

  return {
    attacker: computerAttacker,
    target: computersTarget,
    playerCreatures: state.playerCreatures,
    computerCreatures: state.computerCreatures,
    isPlayerAttack: false,
    playerCreatureControlsRef,
    enemyCreatureControlsRef,
    attack: attacks.fireball, // TODO: Implement attack selection logic
    dispatch,
  }
}
