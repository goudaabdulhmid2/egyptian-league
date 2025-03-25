import { Router } from "express";

import {
  getAllTeams,
  getTeamById,
  newTeam,
  deleteTeamById,
  updateTeamByID,
} from "../controllers/teamConroller";

const router = Router();

router.route("/").get(getAllTeams).post(newTeam);
router
  .route("/:id")
  .get(getTeamById)
  .delete(deleteTeamById)
  .patch(updateTeamByID);

export default router;
