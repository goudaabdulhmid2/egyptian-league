import { Player, Team } from "@prisma/client";
import prisma from "../config/db";
import createBaseService from "./baseService";

// Define types for Team with relations
interface TeamWithPlayers extends Team {
  players: Player[];
}

interface TeamStats {
  totalSalary: number;
  playerCount: number;
  averageSalary: number;
}

const teamService = createBaseService<Team>(prisma.team, prisma, "team");

export default {
  ...teamService,

  async getTeamWithPlayers(teamId: string): Promise<TeamWithPlayers> {
    const team = await teamService.getOne(teamId, { Player: true });
    return team as TeamWithPlayers;
  },

  async calculateTeamStats(teamId: string): Promise<TeamStats> {
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
    const stats = await this.calculateTeamStats(teamId);
    return stats.totalSalary;
  },
};
