import { Router } from "express";
import { authorizeRoles } from "../../shared/middlewares/rbac.middleware.js";
import { UserRole } from "../user/user.model.js";
import { BrandProfileRouter } from "./profile/brandProfile.routes.js";

export const BrandRouter = Router();

BrandRouter.use(authorizeRoles(UserRole.Brand));

BrandRouter.use("/profile", BrandProfileRouter);
