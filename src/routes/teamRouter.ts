import { Router } from "express";

import {
  getAllTeams,
  getTeamById,
  createTeam,
  deleteTeamById,
  updateTeamById,
} from "../controllers/teamController";
import {
  validateBody,
  validateParams,
  validateQuery,
  validate,
} from "../middleware/validate";
import { idSchema, queryStringSchema } from "../validators/commonValidator";
import {
  createTeamSchema,
  updateTeamSchema,
} from "../validators/teamValidator";

const router = Router();

router
  .route("/")
  .get(validateQuery(queryStringSchema), getAllTeams)
  .post(validateBody(createTeamSchema), createTeam);

router
  .route("/:id")
  .get(validateParams(idSchema), getTeamById)
  .delete(validateParams(idSchema), deleteTeamById)
  .patch(validateBody(updateTeamSchema), updateTeamById);

export default router;
