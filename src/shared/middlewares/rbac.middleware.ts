import { RequestHandler } from "express";
import { ForbiddenError, UnauthorizedError } from "../utils/appError.js";
import { UserRole } from "../../modules/user/user.model.js";

export const authorizeRoles = (...allowedRoles: UserRole[]): RequestHandler => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          "You do not have permission to access this resource",
        ),
      );
    }

    next();
  };
};
