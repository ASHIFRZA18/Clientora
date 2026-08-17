import type { Response } from "express";

/**
 * A minimal in-process event bus that fans out notification events to any
 * SSE connections open for the target user. Single-process only — if this
 * API ever runs multiple instances behind a load balancer, swap this for
 * Redis pub/sub (or similar) without touching the call sites.
 */
class NotificationBus {
  private connections = new Map<string, Set<Response>>();

  subscribe(userId: string, res: Response) {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId)!.add(res);
  }

  unsubscribe(userId: string, res: Response) {
    this.connections.get(userId)?.delete(res);
    if (this.connections.get(userId)?.size === 0) {
      this.connections.delete(userId);
    }
  }

  publish(userId: string, event: unknown) {
    const sockets = this.connections.get(userId);
    if (!sockets) return;
    const payload = `data: ${JSON.stringify(event)}\n\n`;
    for (const res of sockets) {
      res.write(payload);
    }
  }

  connectionCount(userId: string) {
    return this.connections.get(userId)?.size ?? 0;
  }
}

export const notificationBus = new NotificationBus();
