import { Router } from "express";
import { dashboardController } from "./dashboard.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { asyncHandler } from "../../lib/async-handler.js";

export const dashboardRouter = Router();

dashboardRouter.get("/overview", authenticate, asyncHandler(dashboardController.getOverview));
