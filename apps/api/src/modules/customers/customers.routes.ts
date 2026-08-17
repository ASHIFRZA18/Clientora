import { Router } from "express";
import { customersController } from "./customers.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { validate, validateQuery } from "../../middleware/validate.js";
import { asyncHandler } from "../../lib/async-handler.js";
import {
  listCustomersQuerySchema,
  createCustomerSchema,
  updateCustomerSchema,
  createNoteSchema,
} from "./customers.validation.js";

export const customersRouter = Router();

customersRouter.use(authenticate);

customersRouter.get("/", validateQuery(listCustomersQuerySchema), asyncHandler(customersController.list));
customersRouter.post("/", validate(createCustomerSchema), asyncHandler(customersController.create));
customersRouter.get("/:id", asyncHandler(customersController.getById));
customersRouter.patch("/:id", validate(updateCustomerSchema), asyncHandler(customersController.update));
customersRouter.delete("/:id", asyncHandler(customersController.remove));

customersRouter.get("/:id/notes", asyncHandler(customersController.listNotes));
customersRouter.post("/:id/notes", validate(createNoteSchema), asyncHandler(customersController.addNote));
