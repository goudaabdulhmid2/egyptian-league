import { Team } from "@prisma/client";
import prisma from "../config/db";
import createBaseService from "./baseService";

const teamService = createBaseService<Team>(prisma.team);

export default {
  ...teamService,
  // Example: Add a custom method for team-specific logic
  async calculateTeamSalary(teamId: string): Promise<number> {
    const team = await teamService.getOne(teamId, { players: true });
    if (!team) throw new Error("Team not found");
    return (team as Team & { players: { salary: number }[] }).players.reduce(
      (sum, player) => sum + player.salary,
      0
    );
  },
};
