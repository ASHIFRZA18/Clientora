import type { Request, Response } from "express";
import { dealsService } from "./deals.service.js";

export const dealsController = {
  async board(req: Request, res: Response) {
    const board = await dealsService.board(req.user!.id, req.user!.role);
    res.status(200).json({ data: board });
  },

  async getById(req: Request, res: Response) {
    const deal = await dealsService.getById(req.user!.id, req.user!.role, req.params.id as string);
    res.status(200).json({ data: deal });
  },

  async create(req: Request, res: Response) {
    const deal = await dealsService.create(req.user!.id, req.user!.role, req.body);
    res.status(201).json({ data: deal });
  },

  async update(req: Request, res: Response) {
    const deal = await dealsService.update(req.user!.id, req.user!.role, req.params.id as string, req.body);
    res.status(200).json({ data: deal });
  },

  async move(req: Request, res: Response) {
    const deal = await dealsService.move(
      req.user!.id,
      req.user!.role,
      req.params.id as string,
      req.body.toStage,
      req.body.toIndex
    );
    res.status(200).json({ data: deal });
  },

  async remove(req: Request, res: Response) {
    await dealsService.remove(req.user!.id, req.user!.role, req.params.id as string);
    res.status(204).send();
  },
};
