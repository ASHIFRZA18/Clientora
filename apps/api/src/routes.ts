import { Router } from "express";
import { getHealth } from "./modules/health.controller.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes.js";
import { customersRouter } from "./modules/customers/customers.routes.js";
import { leadsRouter } from "./modules/leads/leads.routes.js";
import { dealsRouter } from "./modules/deals/deals.routes.js";
import { reportsRouter } from "./modules/reports/reports.routes.js";
import { notificationsRouter } from "./modules/notifications/notifications.routes.js";

export const router = Router();

router.get("/health", getHealth);
router.use("/auth", authRouter);
router.use("/dashboard", dashboardRouter);
router.use("/customers", customersRouter);
router.use("/leads", leadsRouter);
router.use("/deals", dealsRouter);
router.use("/reports", reportsRouter);
router.use("/notifications", notificationsRouter);
