import { Router } from "express";
import type { Role } from "@prisma/client";
import { reportsController } from "./reports.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { requireRole } from "../../middleware/authorize.js";
import { validateQuery } from "../../middleware/validate.js";
import { asyncHandler } from "../../lib/async-handler.js";
import { reportQuerySchema } from "./reports.validation.js";

export const reportsRouter = Router();

reportsRouter.use(authenticate, requireRole(...(["ADMIN", "SALES_MANAGER"] as Role[])));

reportsRouter.get("/:type", validateQuery(reportQuerySchema), asyncHandler(reportsController.get));
