import prisma from "../config/db";
import { Team, TeamUpdateInput, TeamCreateInput } from "../types/teamTypes";

export const findAllTeams = async (): Promise<Team[]> =>
  await prisma.team.findMany({ include: { Player: true } });

export const findTeamById = async (id: string): Promise<Team | null> =>
  await prisma.team.findUnique({
    where: {
      id,
    },
    include: {
      Player: true,
    },
  });

export const updateTeam = async (
  id: string,
  data: TeamUpdateInput
): Promise<Team | null> =>
  await prisma.team.update({
    where: {
      id,
    },
    data,
  });

export const deleteTeam = async (id: string): Promise<Team | null> =>
  await prisma.team.delete({
    where: {
      id,
    },
  });

export const createTeam = async (data: TeamCreateInput): Promise<Team> =>
  await prisma.team.create({
    data,
  });
