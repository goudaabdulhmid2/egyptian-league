import { Router } from "express";

import {
  getAllTeams,
  getTeamById,
  createTeam,
  deleteTeamById,
  updateTeamByID,
} from "../controllers/teamConroller";

const router = Router();

router.route("/").get(getAllTeams).post(createTeam);
router
  .route("/:id")
  .get(getTeamById)
  .delete(deleteTeamById)
  .patch(updateTeamByID);

export default router;
