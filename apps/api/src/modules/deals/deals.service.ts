import type { Role } from "@prisma/client";
import { dealsRepository, DEAL_STAGES, type Scope } from "./deals.repository.js";
import { ApiError } from "../../middleware/error-handler.js";
import type { CreateDealInput, UpdateDealInput, DealStage } from "./deals.validation.js";

function scopeFor(userId: string, role: Role): Scope {
  return role === "SALES_EXECUTIVE" ? { ownerId: userId } : {};
}

function canAssignFreely(role: Role): boolean {
  return role === "ADMIN" || role === "SALES_MANAGER";
}

export const dealsService = {
  async board(userId: string, role: Role) {
    const scope = scopeFor(userId, role);
    const columns = await dealsRepository.board(scope);
    return DEAL_STAGES.map((stage) => ({
      stage,
      deals: columns[stage],
      totalValue: columns[stage].reduce((sum: number, d: { value: unknown }) => sum + Number(d.value), 0),
    }));
  },

  async getById(userId: string, role: Role, id: string) {
    const scope = scopeFor(userId, role);
    const deal = await dealsRepository.findById(scope, id);
    if (!deal) throw new ApiError(404, "NOT_FOUND", "Deal not found");
    return deal;
  },

  async create(userId: string, role: Role, input: CreateDealInput) {
    const ownerId = input.ownerId && canAssignFreely(role) ? input.ownerId : userId;
    const deal = await dealsRepository.create({ ...input, ownerId });
    await dealsRepository.logActivity("deal.created", userId, deal.id, { title: deal.title, stage: deal.stage });
    return deal;
  },

  async update(userId: string, role: Role, id: string, input: UpdateDealInput) {
    const scope = scopeFor(userId, role);
    const patch = { ...input };
    if (!canAssignFreely(role)) delete patch.ownerId;

    const deal = await dealsRepository.update(scope, id, patch);
    if (!deal) throw new ApiError(404, "NOT_FOUND", "Deal not found");
    await dealsRepository.logActivity("deal.updated", userId, deal.id, { fields: Object.keys(patch) });
    return deal;
  },

  async move(userId: string, role: Role, id: string, toStage: DealStage, toIndex: number) {
    const scope = scopeFor(userId, role);
    const before = await dealsRepository.findById(scope, id);
    if (!before) throw new ApiError(404, "NOT_FOUND", "Deal not found");

    const deal = await dealsRepository.move(scope, id, toStage, toIndex);
    if (!deal) throw new ApiError(404, "NOT_FOUND", "Deal not found");

    if (before.stage !== toStage) {
      await dealsRepository.logActivity("deal.stage_changed", userId, id, {
        from: before.stage,
        to: toStage,
        ...(toStage === "WON" ? { won: true } : {}),
        ...(toStage === "LOST" ? { lost: true } : {}),
      });
    }
    return deal;
  },

  async remove(userId: string, role: Role, id: string) {
    const scope = scopeFor(userId, role);
    const deal = await dealsRepository.softDelete(scope, id);
    if (!deal) throw new ApiError(404, "NOT_FOUND", "Deal not found");
    await dealsRepository.logActivity("deal.deleted", userId, id);
  },
};
