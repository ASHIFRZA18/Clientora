import type { Request, Response } from "express";
import { notificationsService } from "./notifications.service.js";
import { notificationBus } from "../../lib/notification-bus.js";
import { verifyAccessToken } from "../../lib/jwt.js";
import type { ListNotificationsQuery } from "./notifications.validation.js";

export const notificationsController = {
  async list(req: Request, res: Response) {
    const { page, pageSize } = req.query as unknown as ListNotificationsQuery;
    const result = await notificationsService.list(req.user!.id, page, pageSize);
    res.status(200).json({ data: result.items, meta: { ...result.pagination, unreadCount: result.unreadCount } });
  },

  async unreadCount(req: Request, res: Response) {
    const count = await notificationsService.unreadCount(req.user!.id);
    res.status(200).json({ data: { count } });
  },

  async markRead(req: Request, res: Response) {
    const notification = await notificationsService.markRead(req.user!.id, req.params.id as string);
    res.status(200).json({ data: notification });
  },

  async markAllRead(req: Request, res: Response) {
    await notificationsService.markAllRead(req.user!.id);
    res.status(204).send();
  },

  /**
   * EventSource requests can't carry an Authorization header, so this route
   * accepts the access token as a query param instead and verifies it manually
   * rather than going through the standard `authenticate` middleware.
   */
  async stream(req: Request, res: Response) {
    const token = req.query.token as string | undefined;
    if (!token) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Missing access token" } });
      return;
    }

    let userId: string;
    try {
      userId = verifyAccessToken(token).sub;
    } catch {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Invalid or expired access token" } });
      return;
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    res.write(`data: ${JSON.stringify({ kind: "connected" })}\n\n`);

    notificationBus.subscribe(userId, res);

    // Keep intermediary proxies from timing out an idle connection.
    const heartbeat = setInterval(() => {
      res.write(": heartbeat\n\n");
    }, 25000);

    req.on("close", () => {
      clearInterval(heartbeat);
      notificationBus.unsubscribe(userId, res);
    });
  },
};
