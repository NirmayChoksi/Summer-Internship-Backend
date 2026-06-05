import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { UserRole } from "../../modules/user/user.model.js";
import { UnauthorizedError } from "../utils/appError.js";

export const authMiddleware: RequestHandler = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new UnauthorizedError("No token provided"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email: string;
      role: UserRole;
    };

    req.user = payload;

    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired token"));
  }
};
