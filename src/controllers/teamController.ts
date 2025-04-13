import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";

import { Team } from "../types/teamTypes";
import teamService from "../services/teamService";
import createBaseController from "./baseController";
import { responseUtil } from "../utils/responseUtil";
import logger from "../utils/logger";

const baseTeamController = createBaseController<Team>(teamService, "team");

export default {
  ...baseTeamController,

  /**
   * Get team with all its players
   */
  getTeamWithPlayers: asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const id = req.params.id;
      logger.info("Controller: Getting team with players", { id });

      const team = await teamService.getTeamWithPlayers(id);

      responseUtil.sendSuccess(res, {
        team,
      });
    }
  ),

  /**
   * Get team statistics
   */

  getTeamStats: asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const id = req.params.id;
      logger.info("Controller: Getting team statistics", { id });

      const stats = await teamService.calculateTeamStats(id);
      responseUtil.sendSuccess(res, {
        teamStats: stats,
      });
    }
  ),

  /**
   * Get team total salary
   */
  getTeamSalary: asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      logger.info("Controller: Getting team salary", { id });

      const totalSalary = await teamService.calculateTeamSalary(id);

      responseUtil.sendSuccess(res, {
        totalSalary,
      });
    }
  ),
};
