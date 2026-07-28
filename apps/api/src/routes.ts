import { Router } from "express";
import { getHealth } from "./modules/health.controller.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes.js";

export const router = Router();

router.get("/health", getHealth);
router.use("/auth", authRouter);
router.use("/dashboard", dashboardRouter);

// Phase 4+: router.use("/customers", customersRouter);
// Phase 5+: router.use("/leads", leadsRouter);
// Phase 6+: router.use("/deals", dealsRouter);
