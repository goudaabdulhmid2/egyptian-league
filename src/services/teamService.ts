import { Player, Team } from "@prisma/client";
import prisma from "../config/db";
import createBaseService from "./baseService";
import logger from "../utils/logger";
import ApiError from "../utils/apiError";
import { AppErrorCode } from "../types/errorTypes";
import playerService from "./playerService";

// Define types for Team with relations
interface TeamWithPlayers extends Team {
  players: Player[];
}

interface TeamStats {
  totalSalary: number;
  playerCount: number;
  averageSalary: number;
}

const teamService = createBaseService<Team>(prisma.team, "team");

export default {
  ...teamService,

  /**
   * Get a team with all its players
   * @param teamId The ID of the team to fetch
   * @returns Team with players array
   */

  async getTeamWithPlayers(teamId: string): Promise<TeamWithPlayers> {
    logger.info("Getting team with players", { teamId });
    const team = await teamService.getOne(teamId, { Player: true });
    return team as TeamWithPlayers;
  },

  /**
   * Calculate statistics for a team
   * @param teamId The ID of the team
   * @returns TeamStats object with calculated statistics
   */
  async calculateTeamStats(teamId: string): Promise<TeamStats> {
    logger.info("Calculating team statistics", { teamId });
    const team = await this.getTeamWithPlayers(teamId);
    const totalSalary = team.players.reduce(
      (sum, player) => sum + player.salary,
      0
    );
    const playerCount = team.players.length;

    return {
      totalSalary,
      playerCount,
      averageSalary: playerCount > 0 ? totalSalary / playerCount : 0,
    };
  },

  async calculateTeamSalary(teamId: string): Promise<number> {
    logger.info("Calculating team salary", { teamId });
    const stats = await this.calculateTeamStats(teamId);
    return stats.totalSalary;
  },

  // /**
  //  * Add a player to a team
  //  * @param teamId The team ID
  //  * @param playerId The player ID
  //  */
  // async addPlayerToTeam(teamId: string, playerId: string): Promise<Team> {
  //   logger.info("Adding player to team", { teamId, playerId });

  //   return await this.transaction(async (txService) => {
  //     // Validate team exist
  //     await txService.getOne(teamId);

  //     // Use transaction service for player operations
  //     const txPlayerService = createBaseService(
  //       txService.prisma.player,
  //       "player"
  //     );

  //     // Validate player exists and is not already on a team
  //     const player = await txPlayerService.getOne(playerId);
  //     if (player.teamId) {
  //       throw new ApiError(
  //         "Player is already on a team",
  //         400,
  //         "fail",
  //         true,
  //         AppErrorCode.INVALID_INPUT
  //       );
  //     }

  //     // Update player with team association
  //     await txPlayerService.updateOne(playerId, { teamId });

  //     // Return updated team with players
  //     return await txService.getOne(teamId, {
  //       players: true,
  //     });
  //   });
  // },
};
