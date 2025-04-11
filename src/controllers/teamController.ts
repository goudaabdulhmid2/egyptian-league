import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { ApiResult } from "../utils/apiFeatures";
import { Team } from "../types/teamTypes";
import teamService from "../services/teamService";
import { UpdateTeamInput, CreateTeamInput } from "../validators/teamValidator";

// Get all teams with pagination and filters
export const getAllTeams = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result: ApiResult<Team> = await teamService.getAll(req.query);

    res.status(200).json({
      status: "success",
      results: result.data.length,
      pagination: result.pagination,
      data: result.data,
    });
  }
);

// Get single team by ID with players
export const getTeamById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const team = await teamService.getTeamWithPlayers(req.params.id);

    res.status(200).json({
      status: "success",
      data: team,
    });
  }
);

// Update team by ID
export const updateTeamById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const data = req.body as UpdateTeamInput;
    const team = await teamService.updateOne(req.params.id, data);

    res.status(200).json({
      status: "success",
      data: team,
    });
  }
);

// Delete team by ID
export const deleteTeamById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    await teamService.deleteOne(req.params.id);
    res.status(204).send();
  }
);

// Create new team
export const createTeam = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const data = req.body as CreateTeamInput;
    const newTeam = await teamService.createOne(data);

    res.status(201).json({
      status: "success",
      data: newTeam,
    });
  }
);

// Get team statistics
export const getTeamStats = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const stats = await teamService.calculateTeamStats(req.params.id);

    res.status(200).json({
      status: "success",
      data: stats,
    });
  }
);
