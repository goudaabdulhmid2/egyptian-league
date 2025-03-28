import { Router } from "express";

import {
  getAllTeams,
  getTeamById,
  createTeam,
  deleteTeamById,
  updateTeamByID,
} from "../controllers/teamConroller";
import { validate } from "../middleware/validate";
import { idSchema } from "../validators/commonValidator";
import {
  createTeamSchema,
  updateTeamSchema,
} from "../validators/teamValidator";

const router = Router();

router.route("/").get(getAllTeams).post(validate(createTeamSchema), createTeam);

router.use(validate(idSchema));
router
  .route("/:id")
  .get(getTeamById)
  .delete(deleteTeamById)
  .patch(validate(updateTeamSchema), updateTeamByID);

export default router;
