import { Creature, TeamsAliveStatus } from "../../consts/types/types"
import { getAliveCreatures } from "./handleConfirmedAttack"

export const checkTeamsAlive = (
  playerCreatures: Creature[],
  computerCreatures: Creature[]
): TeamsAliveStatus => {
  const alivePlayers = getAliveCreatures(playerCreatures)
  const aliveComputers = getAliveCreatures(computerCreatures)

  return {
    alivePlayerCreatures: alivePlayers,
    aliveComputerCreatures: aliveComputers,
    playerTeamAlive: alivePlayers.length > 0,
    compTeamAlive: aliveComputers.length > 0,
    bothTeamsAlive: alivePlayers.length > 0 && aliveComputers.length > 0,
  }
}
