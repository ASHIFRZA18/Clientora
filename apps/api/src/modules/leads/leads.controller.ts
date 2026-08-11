import type { Request, Response } from "express";
import { leadsService } from "./leads.service.js";
import type { ListLeadsQuery } from "./leads.validation.js";

export const leadsController = {
  async list(req: Request, res: Response) {
    const query = req.query as unknown as ListLeadsQuery;
    const result = await leadsService.list(req.user!.id, req.user!.role, query);
    res.status(200).json({ data: result.items, meta: result.pagination });
  },

  async getById(req: Request, res: Response) {
    const lead = await leadsService.getById(req.user!.id, req.user!.role, req.params.id as string);
    res.status(200).json({ data: lead });
  },

  async create(req: Request, res: Response) {
    const lead = await leadsService.create(req.user!.id, req.user!.role, req.body);
    res.status(201).json({ data: lead });
  },

  async update(req: Request, res: Response) {
    const lead = await leadsService.update(req.user!.id, req.user!.role, req.params.id as string, req.body);
    res.status(200).json({ data: lead });
  },

  async assign(req: Request, res: Response) {
    const lead = await leadsService.assign(
      req.user!.id,
      req.user!.role,
      req.params.id as string,
      req.body.assignedTo
    );
    res.status(200).json({ data: lead });
  },

  async recalculateScore(req: Request, res: Response) {
    const lead = await leadsService.recalculateScore(req.user!.id, req.user!.role, req.params.id as string);
    res.status(200).json({ data: lead });
  },

  async remove(req: Request, res: Response) {
    await leadsService.remove(req.user!.id, req.user!.role, req.params.id as string);
    res.status(204).send();
  },
};
