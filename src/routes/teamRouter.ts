import { Router } from "express";

import {
  getAllTeams,
  getTeamById,
  createTeam,
  deleteTeamById,
  updateTeamById,
} from "../controllers/teamController";
import { validate } from "../middleware/validate";
import { idSchema, queryStringSchema } from "../validators/commonValidator";
import {
  createTeamSchema,
  updateTeamSchema,
} from "../validators/teamValidator";

const router = Router();

router
  .route("/")
  .get(validate(queryStringSchema), getAllTeams)
  .post(validate(createTeamSchema), createTeam);

router.use(validate(idSchema));
router
  .route("/:id")
  .get(getTeamById)
  .delete(deleteTeamById)
  .patch(validate(updateTeamSchema), updateTeamById);

export default router;
