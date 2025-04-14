import { Router } from "express";
import {
  updatePlayerSchema,
  createPlayerSchema,
} from "../validators/playerValidator";
import { idSchema, queryStringSchema } from "../validators/commonValidator";
import playerController from "../controllers/playerController";
import {
  validateBody,
  validateParams,
  validateQuery,
  validate,
} from "../middleware/validate";

const router = Router();

router
  .route("/")
  .get(validateQuery(queryStringSchema), playerController.getAll)
  .post(validateBody(createPlayerSchema), playerController.createOne);

router
  .route("/:id")
  .get(validateParams(idSchema), playerController.getOne)
  .delete(validateParams(idSchema), playerController.deleteOne)
  .patch(
    validate({
      params: idSchema,
      body: updatePlayerSchema,
      validateOnly: ["params", "body"],
    }),
    playerController.updateOne
  );

export default router;
