import { Creature, TeamsAliveStatus } from "../../consts/types/types"
import { checkGameOver } from "../turnUtils"
export enum GameOutcome {
  PLAYER_LOST = "PLAYER_LOST",
  COMPUTER_LOST = "COMPUTER_LOST",
  BOTH_LOST = "BOTH_LOST",
  ONGOING = "ONGOING"
}
const { PLAYER_LOST, COMPUTER_LOST, BOTH_LOST, ONGOING } = GameOutcome

export const checkAndHandleGameOver = (
  playerCreatures: Creature[],
  computerCreatures: Creature[],
  dispatch: React.Dispatch<any>
) => {
  const playerLost = checkGameOver(playerCreatures)
  const computerLost = checkGameOver(computerCreatures)

  if (computerLost) {
    dispatch({ type: "WIN_GAME" })
    console.log("Computer lost, game won!")
    setTimeout(() => dispatch({ type: "RESET_BATTLE" }), 100)
  } else if (playerLost) {
    dispatch({ type: "LOSE_GAME" })
    console.log("Player lost, game over!")
    setTimeout(() => dispatch({ type: "RESET_BATTLE" }), 100)
  }
}

export const checkGameEndConditionStatus = (
  teamsStatus: TeamsAliveStatus
): GameOutcome => {
  if (!teamsStatus.playerTeamAlive && !teamsStatus.compTeamAlive) {
    return BOTH_LOST
  } else if (!teamsStatus.compTeamAlive) {
    return COMPUTER_LOST
  } else if (!teamsStatus.playerTeamAlive) {
    return PLAYER_LOST
  }
  return ONGOING
}

export const handleGameEnd = (
  outcome: GameOutcome,
  dispatch: React.Dispatch<any>
) => {
  switch (outcome) {
    case COMPUTER_LOST:
      dispatch({ type: "END_BATTLE", payload: { outcome: COMPUTER_LOST } })
      // Later: Handle victory sequence, show win screen, update stats, etc
      break
    case PLAYER_LOST:
      dispatch({ type: "END_BATTLE", payload: { outcome: PLAYER_LOST } })
      // Later: Handle defeat sequence, show game over screen, etc
      break
    case BOTH_LOST:
      dispatch({ type: "END_BATTLE", payload: { outcome: BOTH_LOST } })
      // Later: Handle draw sequence, show draw screen, etc
      break
    case ONGOING:
      // Game continues, no action needed
      break
  }
}

export const handleCheckingIfBattleEnds = (
  teamsAliveStatus: TeamsAliveStatus,
  dispatch: React.Dispatch<any>
) => {
  const gameEndStatus = checkGameEndConditionStatus(teamsAliveStatus)
  handleGameEnd(gameEndStatus, dispatch)
}
