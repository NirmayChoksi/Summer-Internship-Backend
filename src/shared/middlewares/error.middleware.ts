import { ErrorRequestHandler } from "express";
import { AppError } from "../utils/appError.js";
import { logger } from "../utils/logger.js";

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });

    return;
  }

  if ((err as any).code === 11000) {
    res.status(409).json({
      success: false,
      error: "Duplicate field value",
    });

    return;
  }

  if (err.name === "ValidationError") {
    res.status(400).json({
      success: false,
      error: err.message,
    });

    return;
  }

  if (err.name === "JsonWebTokenError") {
    res.status(401).json({
      success: false,
      error: "Invalid token",
    });

    return;
  }

  if (err.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      error: "Token expired",
    });

    return;
  }

  logger.error("Unhandled error", err);

  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
};
