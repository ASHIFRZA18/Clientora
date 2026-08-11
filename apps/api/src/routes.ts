import { Router } from "express";
import { getHealth } from "./modules/health.controller.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes.js";
<<<<<<< HEAD
import { customersRouter } from "./modules/customers/customers.routes.js";
import { leadsRouter } from "./modules/leads/leads.routes.js";
=======
>>>>>>> 3584043af0c48b61060f01fbc6bdfa6d9fc4cb46

export const router = Router();

router.get("/health", getHealth);
router.use("/auth", authRouter);
router.use("/dashboard", dashboardRouter);
<<<<<<< HEAD
router.use("/customers", customersRouter);
router.use("/leads", leadsRouter);

=======

// Phase 4+: router.use("/customers", customersRouter);
// Phase 5+: router.use("/leads", leadsRouter);
>>>>>>> 3584043af0c48b61060f01fbc6bdfa6d9fc4cb46
// Phase 6+: router.use("/deals", dealsRouter);
