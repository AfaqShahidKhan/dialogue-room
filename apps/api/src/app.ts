import path from "node:path";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env, isTest } from "./config/env";
import { apiRouter } from "./routes";
import { errorHandler } from "./middlewares/errorHandler";
import { AppError } from "./utils/appError";

export function createApp(): express.Express {
  const app = express();

  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE"],
    }),
  );
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(cookieParser());
  app.use(express.json({ limit: "1mb" }));

  app.use(
    "/uploads",
    express.static(path.resolve(process.cwd(), "uploads"), {
      maxAge: "7d",
      immutable: true,
    }),
  );

  if (!isTest) {
    app.use(
      "/api",
      rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }),
    );
    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 10,
      standardHeaders: true,
      legacyHeaders: false,
      message: { status: "fail", message: "Too many attempts, please try again later" },
    });
    app.use("/api/v1/auth/login", authLimiter);
    app.use("/api/v1/auth/signup", authLimiter);
    app.use("/api/v1/auth/forgot-password", authLimiter);
  }

  app.get("/health", (_req, res) => {
    res.json({ status: "success", uptime: process.uptime() });
  });

  app.use("/api/v1", apiRouter);

  app.all("/{*splat}", (req, _res, next) => {
    next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server`, 404));
  });

  app.use(errorHandler);
  return app;
}
