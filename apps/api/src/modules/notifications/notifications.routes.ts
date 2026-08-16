import { Router } from "express";
import { notificationsController } from "./notifications.controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { validateQuery } from "../../middleware/validate.js";
import { asyncHandler } from "../../lib/async-handler.js";
import { listNotificationsQuerySchema } from "./notifications.validation.js";

export const notificationsRouter = Router();

// No `authenticate` middleware here — the stream authenticates itself via ?token=,
// since EventSource cannot set an Authorization header.
notificationsRouter.get("/stream", asyncHandler(notificationsController.stream));

notificationsRouter.use(authenticate);
notificationsRouter.get("/", validateQuery(listNotificationsQuerySchema), asyncHandler(notificationsController.list));
notificationsRouter.get("/unread-count", asyncHandler(notificationsController.unreadCount));
notificationsRouter.patch("/:id/read", asyncHandler(notificationsController.markRead));
notificationsRouter.post("/read-all", asyncHandler(notificationsController.markAllRead));
