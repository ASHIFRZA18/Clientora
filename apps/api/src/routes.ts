import { Router } from "express";
import { getHealth } from "./modules/health.controller.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes.js";
import { customersRouter } from "./modules/customers/customers.routes.js";
import { leadsRouter } from "./modules/leads/leads.routes.js";

export const router = Router();

router.get("/health", getHealth);
router.use("/auth", authRouter);
router.use("/dashboard", dashboardRouter);
router.use("/customers", customersRouter);
router.use("/leads", leadsRouter);

// Phase 6+: router.use("/deals", dealsRouter);
