import { Router } from "express";
import { leadsController } from "./leads.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { validate, validateQuery } from "../../middleware/validate.js";
import { asyncHandler } from "../../lib/async-handler.js";
import {
  listLeadsQuerySchema,
  createLeadSchema,
  updateLeadSchema,
  assignLeadSchema,
} from "./leads.validation.js";

export const leadsRouter = Router();

leadsRouter.use(authenticate);

leadsRouter.get("/", validateQuery(listLeadsQuerySchema), asyncHandler(leadsController.list));
leadsRouter.post("/", validate(createLeadSchema), asyncHandler(leadsController.create));
leadsRouter.get("/:id", asyncHandler(leadsController.getById));
leadsRouter.patch("/:id", validate(updateLeadSchema), asyncHandler(leadsController.update));
leadsRouter.delete("/:id", asyncHandler(leadsController.remove));

leadsRouter.patch("/:id/assign", validate(assignLeadSchema), asyncHandler(leadsController.assign));
leadsRouter.post("/:id/score/recalculate", asyncHandler(leadsController.recalculateScore));
