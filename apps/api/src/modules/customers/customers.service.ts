import type { Role } from "@prisma/client";
import { customersRepository, type Scope } from "./customers.repository.js";
import { ApiError } from "../../middleware/error-handler.js";
import type { ListCustomersQuery, CreateCustomerInput, UpdateCustomerInput } from "./customers.validation.js";

/** Sales Executives only ever see/touch their own customers; Admins and Managers see everyone's. */
function scopeFor(userId: string, role: Role): Scope {
  return role === "SALES_EXECUTIVE" ? { ownerId: userId } : {};
}

export const customersService = {
  async list(userId: string, role: Role, query: ListCustomersQuery) {
    const scope = scopeFor(userId, role);
    const { items, total } = await customersRepository.list(scope, query);
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
    const customer = await customersRepository.findById(scope, id);
    if (!customer) throw new ApiError(404, "NOT_FOUND", "Customer not found");
    return customer;
  },

  async create(userId: string, role: Role, input: CreateCustomerInput) {
    // Only Admin/Manager may assign a customer to someone else; everyone else owns what they create.
    const ownerId = input.ownerId && role !== "SALES_EXECUTIVE" ? input.ownerId : userId;
    const customer = await customersRepository.create({ ...input, ownerId });
    await customersRepository.logActivity("customer.created", userId, customer.id, { name: customer.name });
    return customer;
  },

  async update(userId: string, role: Role, id: string, input: UpdateCustomerInput) {
    const scope = scopeFor(userId, role);
    if (input.ownerId && role === "SALES_EXECUTIVE") {
      delete input.ownerId; // executives can't reassign ownership
    }
    const customer = await customersRepository.update(scope, id, input);
    if (!customer) throw new ApiError(404, "NOT_FOUND", "Customer not found");
    await customersRepository.logActivity("customer.updated", userId, customer.id, { fields: Object.keys(input) });
    return customer;
  },

  async remove(userId: string, role: Role, id: string) {
    const scope = scopeFor(userId, role);
    const customer = await customersRepository.softDelete(scope, id);
    if (!customer) throw new ApiError(404, "NOT_FOUND", "Customer not found");
    await customersRepository.logActivity("customer.deleted", userId, id);
  },

  async listNotes(userId: string, role: Role, customerId: string) {
    await this.getById(userId, role, customerId); // 404s / enforces scope
    return customersRepository.notesFor(customerId);
  },

  async addNote(userId: string, role: Role, customerId: string, body: string) {
    await this.getById(userId, role, customerId);
    const note = await customersRepository.addNote(customerId, userId, body);
    await customersRepository.logActivity("customer.note_added", userId, customerId);
    return note;
  },
};
