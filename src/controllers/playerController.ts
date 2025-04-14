import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { Player } from "@prisma/client";

import createBaseController from "./baseController";
import playerService from "../services/playerService";
import { responseUtil } from "../utils/responseUtil";
import logger from "../utils/logger";

const playerController = createBaseController<Player>(playerService, "player");

export default {
  ...playerController,
};
