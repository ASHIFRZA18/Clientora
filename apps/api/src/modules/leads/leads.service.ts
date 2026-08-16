import type { Role } from "@prisma/client";
import { leadsRepository, type Scope } from "./leads.repository.js";
import { calculateLeadScore } from "../../lib/lead-scoring.js";
<<<<<<< HEAD
import { getAiLeadInsight } from "./lead-ai-scoring.js";
import { AiNotConfiguredError, AiRequestError } from "../../lib/anthropic-client.js";
=======
>>>>>>> fb8fa837090b401d0df8bd8364282176ff710672
import { ApiError } from "../../middleware/error-handler.js";
import { notificationsService } from "../notifications/notifications.service.js";
import type { ListLeadsQuery, CreateLeadInput, UpdateLeadInput } from "./leads.validation.js";

/** Sales Executives only ever see/touch leads assigned to them; Admins and Managers see everyone's. */
function scopeFor(userId: string, role: Role): Scope {
  return role === "SALES_EXECUTIVE" ? { assigneeId: userId } : {};
}

function canAssign(role: Role): boolean {
  return role === "ADMIN" || role === "SALES_MANAGER";
}

export const leadsService = {
  async list(userId: string, role: Role, query: ListLeadsQuery) {
    const scope = scopeFor(userId, role);
    const { items, total } = await leadsRepository.list(scope, query);
    return {
      items,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
      },
    };
  },

  async getById(userId: string, role: Role, id: string) {
    const scope = scopeFor(userId, role);
    const lead = await leadsRepository.findById(scope, id);
    if (!lead) throw new ApiError(404, "NOT_FOUND", "Lead not found");
    return lead;
  },

  async create(userId: string, role: Role, input: CreateLeadInput) {
    const allowFreeAssign = canAssign(role);
    const assignedTo = allowFreeAssign ? input.assignedTo || null : userId;

    const lead = await leadsRepository.create({ ...input, assignedTo: assignedTo ?? undefined });
    await leadsRepository.logActivity("lead.created", userId, lead.id, { customerId: lead.customerId });

    if (assignedTo && assignedTo !== userId) {
      await notificationsService.notify(assignedTo, "lead.assigned", "A new lead was assigned to you", {
        leadId: lead.id,
      });
    }

    return lead;
  },

  async update(userId: string, role: Role, id: string, input: UpdateLeadInput) {
    const scope = scopeFor(userId, role);
    const allowFreeAssign = canAssign(role);

    const patch = { ...input };
    if (!allowFreeAssign) {
      delete patch.assignedTo; // executives use the dedicated /assign endpoint to self-claim instead
    }

    const lead = await leadsRepository.update(scope, id, patch);
    if (!lead) throw new ApiError(404, "NOT_FOUND", "Lead not found");
    await leadsRepository.logActivity("lead.updated", userId, lead.id, { fields: Object.keys(patch) });
    return lead;
  },

  async assign(userId: string, role: Role, id: string, assignedTo: string | null) {
    const allowFreeAssign = canAssign(role);

    if (!allowFreeAssign) {
      // Executives may only claim an unassigned lead for themselves — not reassign anyone else's.
      if (assignedTo !== userId) {
        throw new ApiError(403, "FORBIDDEN", "You can only assign leads to yourself");
      }
      const existing = await leadsRepository.findById({}, id);
      if (!existing) throw new ApiError(404, "NOT_FOUND", "Lead not found");
      if (existing.assignedTo && existing.assignedTo !== userId) {
        throw new ApiError(403, "FORBIDDEN", "This lead is already assigned to someone else");
      }
    }

    const lead = await leadsRepository.update({}, id, { assignedTo });
    if (!lead) throw new ApiError(404, "NOT_FOUND", "Lead not found");
    await leadsRepository.logActivity("lead.assigned", userId, lead.id, { assignedTo });

    if (assignedTo && assignedTo !== userId) {
      await notificationsService.notify(assignedTo, "lead.assigned", "A lead was assigned to you", {
        leadId: lead.id,
      });
    }

    return lead;
  },

  async recalculateScore(userId: string, role: Role, id: string) {
    const scope = scopeFor(userId, role);
    const lead = await leadsRepository.findById(scope, id);
    if (!lead) throw new ApiError(404, "NOT_FOUND", "Lead not found");

    const score = calculateLeadScore({ source: lead.source, status: lead.status, createdAt: lead.createdAt });
    const updated = await leadsRepository.update(scope, id, { score });
    await leadsRepository.logActivity("lead.score_recalculated", userId, id, { score });
    return updated;
  },

  async remove(userId: string, role: Role, id: string) {
    const scope = scopeFor(userId, role);
    const lead = await leadsRepository.softDelete(scope, id);
    if (!lead) throw new ApiError(404, "NOT_FOUND", "Lead not found");
    await leadsRepository.logActivity("lead.deleted", userId, id);
  },
<<<<<<< HEAD

  async getAiInsight(userId: string, role: Role, id: string) {
    const scope = scopeFor(userId, role);
    const lead = await leadsRepository.findById(scope, id);
    if (!lead) throw new ApiError(404, "NOT_FOUND", "Lead not found");

    const dealValueTotal = lead.deals.reduce((sum: number, d: { value: unknown }) => sum + Number(d.value), 0);
    const noteCount = await leadsRepository.countCustomerNotes(lead.customerId);

    try {
      const insight = await getAiLeadInsight({
        source: lead.source,
        status: lead.status,
        ruleBasedScore: lead.score,
        createdAt: lead.createdAt,
        customerName: lead.customer.name,
        customerCompany: lead.customer.company,
        assigneeName: lead.assignee?.name ?? null,
        dealCount: lead.deals.length,
        dealValueTotal,
        noteCount,
      });

      const updated = await leadsRepository.saveAiInsight(id, insight);
      await leadsRepository.logActivity("lead.ai_scored", userId, id, { score: insight.score });
      return updated;
    } catch (err) {
      if (err instanceof AiNotConfiguredError) {
        throw new ApiError(
          503,
          "AI_NOT_CONFIGURED",
          "AI lead scoring isn't set up yet — add ANTHROPIC_API_KEY to the API's environment to enable it."
        );
      }
      if (err instanceof AiRequestError) {
        throw new ApiError(502, "AI_REQUEST_FAILED", err.message);
      }
      throw err;
    }
  },
=======
>>>>>>> fb8fa837090b401d0df8bd8364282176ff710672
};
