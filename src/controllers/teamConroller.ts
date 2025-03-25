import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";

import ApiError from "../utils/apiError";
import * as teamModel from "../models/teamModel";
import { Team, TeamUpdateInput, TeamCreateInput } from "../types/teamTypes";

export const getAllTeams = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const teams: Team[] = await teamModel.findAllTeams();

    res.status(200).json({
      status: "success",
      length: teams.length,
      data: {
        teams,
      },
    });
  }
);

export const getTeamById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const team: Team | null = await teamModel.findTeamById(req.params.id);

    if (!team) return next(new ApiError("Team not found.", 404, "fail"));

    res.status(200).json({
      status: "success",
      data: {
        team,
      },
    });
  }
);

export const updateTeamByID = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const data: TeamUpdateInput = req.body;

    const team: Team | null = await teamModel.updateTeam(req.params.id, data);
    if (!team) return next(new ApiError("Team not found.", 404, "fail"));

    res.status(200).json({
      status: "success",
      data: {
        team,
      },
    });
  }
);

export const deleteTeamById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const team: Team | null = await teamModel.deleteTeam(req.params.id);

    if (!team) return next(new ApiError("Team not found.", 404, "fail"));

    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);

export const createTeam = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const data: TeamCreateInput = req.body;

    const newTeam: Team = await teamModel.createTeam(data);

    res.status(201).json({
      status: "success",
      data: {
        newTeam,
      },
    });
  }
);
