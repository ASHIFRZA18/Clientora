import type { Request, Response } from "express";
import { customersService } from "./customers.service.js";
import type { ListCustomersQuery } from "./customers.validation.js";

export const customersController = {
  async list(req: Request, res: Response) {
    const query = req.query as unknown as ListCustomersQuery;
    const result = await customersService.list(req.user!.id, req.user!.role, query);
    res.status(200).json({ data: result.items, meta: result.pagination });
  },

  async getById(req: Request, res: Response) {
    const customer = await customersService.getById(req.user!.id, req.user!.role, (req.params.id as string));
    res.status(200).json({ data: customer });
  },

  async create(req: Request, res: Response) {
    const customer = await customersService.create(req.user!.id, req.user!.role, req.body);
    res.status(201).json({ data: customer });
  },

  async update(req: Request, res: Response) {
    const customer = await customersService.update(req.user!.id, req.user!.role, (req.params.id as string), req.body);
    res.status(200).json({ data: customer });
  },

  async remove(req: Request, res: Response) {
    await customersService.remove(req.user!.id, req.user!.role, (req.params.id as string));
    res.status(204).send();
  },

  async listNotes(req: Request, res: Response) {
    const notes = await customersService.listNotes(req.user!.id, req.user!.role, (req.params.id as string));
    res.status(200).json({ data: notes });
  },

  async addNote(req: Request, res: Response) {
    const note = await customersService.addNote(req.user!.id, req.user!.role, (req.params.id as string), req.body.body);
    res.status(201).json({ data: note });
  },
};
