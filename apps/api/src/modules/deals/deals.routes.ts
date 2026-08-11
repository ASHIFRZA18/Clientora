import { Router } from "express";
import { dealsController } from "./deals.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../lib/async-handler.js";
import { createDealSchema, updateDealSchema, moveDealSchema } from "./deals.validation.js";

export const dealsRouter = Router();

dealsRouter.use(authenticate);

dealsRouter.get("/board", asyncHandler(dealsController.board));
dealsRouter.post("/", validate(createDealSchema), asyncHandler(dealsController.create));
dealsRouter.get("/:id", asyncHandler(dealsController.getById));
dealsRouter.patch("/:id", validate(updateDealSchema), asyncHandler(dealsController.update));
dealsRouter.patch("/:id/move", validate(moveDealSchema), asyncHandler(dealsController.move));
dealsRouter.delete("/:id", asyncHandler(dealsController.remove));
