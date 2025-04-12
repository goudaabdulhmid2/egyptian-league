import { Player, Team } from "@prisma/client";
import prisma from "../config/db";
import createBaseService from "./baseService";
import logger from "../utils/logger";
import ApiError from "../utils/apiError";
import { AppErrorCode } from "../types/errorTypes";

// Define types for Team with relations
const playerService = createBaseService<Player>(prisma.player, "player");

export default {
  ...playerService,
};
