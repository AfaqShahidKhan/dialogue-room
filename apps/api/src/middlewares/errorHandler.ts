import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import mongoose from "mongoose";
import { isDev } from "../config/env";
import { AppError } from "../utils/appError";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ status: err.status, message: err.message });
    return;
  }

  if (err instanceof ZodError) {
    const message = err.issues
      .map((i) => (i.path.length ? `${i.path.join(".")}: ${i.message}` : i.message))
      .join("; ");
    res.status(400).json({ status: "fail", message });
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join("; ");
    res.status(400).json({ status: "fail", message });
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({ status: "fail", message: `Invalid ${err.path}: ${String(err.value)}` });
    return;
  }

  // Mongo duplicate key
  if (typeof err === "object" && err !== null && (err as { code?: number }).code === 11000) {
    res.status(409).json({ status: "fail", message: "A record with that value already exists" });
    return;
  }

  if (err instanceof Error && (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError")) {
    res.status(401).json({ status: "fail", message: "Invalid or expired session. Please log in again." });
    return;
  }

  console.error("💥 Unhandled error:", err);
  res.status(500).json({
    status: "error",
    message: isDev && err instanceof Error ? err.message : "Something went wrong",
    ...(isDev && err instanceof Error ? { stack: err.stack } : {}),
  });
};
