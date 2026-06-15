import { Router } from "express";
import { authorizeRoles } from "../../shared/middlewares/rbac.middleware.js";
import { UserRole } from "../user/user.model.js";
import { CatalogueRouter } from "./catalogue/catalogue.routes.js";
import { PostRouter } from "./post/post.routes.js";
import { InfluencerProfileRouter } from "./profile/influencerProfile.routes.js";

export const InfluencerRouter = Router();

InfluencerRouter.use(authorizeRoles(UserRole.Influencer));

InfluencerRouter.use("/catalogue", CatalogueRouter);

InfluencerRouter.use("/post", PostRouter);

InfluencerRouter.use("/profile", InfluencerProfileRouter);
