import { Router } from "express";
import rateLimit from "express-rate-limit";
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

// AI calls cost real money per request — cap it well below the general API limit.
const aiInsightLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: "RATE_LIMITED", message: "Too many AI analysis requests, please try again later" } },
});

leadsRouter.get("/", validateQuery(listLeadsQuerySchema), asyncHandler(leadsController.list));
leadsRouter.post("/", validate(createLeadSchema), asyncHandler(leadsController.create));
leadsRouter.get("/:id", asyncHandler(leadsController.getById));
leadsRouter.patch("/:id", validate(updateLeadSchema), asyncHandler(leadsController.update));
leadsRouter.delete("/:id", asyncHandler(leadsController.remove));

leadsRouter.patch("/:id/assign", validate(assignLeadSchema), asyncHandler(leadsController.assign));
leadsRouter.post("/:id/score/recalculate", asyncHandler(leadsController.recalculateScore));
leadsRouter.post("/:id/score/ai", aiInsightLimiter, asyncHandler(leadsController.getAiInsight));
