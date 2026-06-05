import { Router } from "express";
import { authorizeRoles } from "../../shared/middlewares/rbac.middleware.js";
import { UserRole } from "../user/user.model.js";
import { InfluencerProfileRouter } from "./profile/influencerProfile.routes.js";

export const InfluencerRouter = Router();

InfluencerRouter.use(authorizeRoles(UserRole.Influencer));

InfluencerRouter.use("/profile", InfluencerProfileRouter);
