import type { Request, Response } from "express";
import { dashboardService } from "./dashboard.service.js";

export const dashboardController = {
  async getOverview(req: Request, res: Response) {
    const data = await dashboardService.getOverview(req.user!.id, req.user!.role);
    res.status(200).json({ data });
  },
};
