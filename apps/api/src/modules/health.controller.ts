import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export async function getHealth(_req: Request, res: Response) {
  let database: "connected" | "disconnected" = "disconnected";

  try {
    await prisma.$queryRaw`SELECT 1`;
    database = "connected";
  } catch {
    database = "disconnected";
  }

  res.status(200).json({
    status: "ok",
    service: "crm-api",
    timestamp: new Date().toISOString(),
    database,
    uptime: process.uptime(),
  });
}
