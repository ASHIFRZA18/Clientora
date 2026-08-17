import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { router as v1Router } from "./routes.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";

export function createApp() {
  const app = express();

  // Railway, Render, Vercel, etc. all terminate TLS and proxy to this app over
  // plain HTTP — without this, Express can't tell the request was actually
  // HTTPS, which breaks secure cookies and misattributes rate-limit buckets.
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.WEB_ORIGIN ?? "http://localhost:5173",
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser());
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

  const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 });
  app.use(globalLimiter);

  app.use("/api/v1", v1Router);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
