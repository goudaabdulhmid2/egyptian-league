import { Router } from "express";

import teamController from "../controllers/teamController";
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
  .get(validateQuery(queryStringSchema), teamController.getAll)
  .post(validateBody(createTeamSchema), teamController.createOne);

router
  .route("/:id")
  .get(validateParams(idSchema), teamController.getTeamWithPlayers)
  .delete(validateParams(idSchema), teamController.deleteOne)
  .patch(validateBody(updateTeamSchema), teamController.updateOne);

router.get("/:id/stats", validateParams(idSchema), teamController.getTeamStats);
router.get(
  "/:id/salary",
  validateParams(idSchema),
  teamController.getTeamSalary
);

export default router;
