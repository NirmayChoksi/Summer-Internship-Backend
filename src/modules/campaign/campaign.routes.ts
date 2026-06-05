import { Router } from "express";
import { CampaignController } from "./campaign.controller.js";
import { validate } from "../../shared/middlewares/validate.middleware.js";
import {
  campaignQuerySchema,
  changeInfluencerStatusDto,
  createCampaignDto,
  updateCampaignDto,
} from "./campaign.dto.js";
import {
  brandIdParamSchema,
  campaignIdParamSchema,
  influencerIdParamSchema,
} from "../../shared/utils/validator.js";
import { authorizeRoles } from "../../shared/middlewares/rbac.middleware.js";
import { UserRole } from "../user/user.model.js";

export const CampaignRouter = Router();

CampaignRouter.post(
  "/",
  authorizeRoles(UserRole.Brand),
  validate({ body: createCampaignDto }),
  CampaignController.create,
);

CampaignRouter.get(
  "/",
  authorizeRoles(UserRole.Influencer),
  validate({ query: campaignQuerySchema }),
  CampaignController.get,
);

CampaignRouter.get(
  "/:campaignId",
  authorizeRoles(UserRole.Brand, UserRole.Influencer),
  validate({ params: campaignIdParamSchema }),
  CampaignController.getById,
);

CampaignRouter.get(
  "/brand/:brandId",
  authorizeRoles(UserRole.Brand),
  validate({ params: brandIdParamSchema }),
  CampaignController.getByBrandId,
);

CampaignRouter.get(
  "/influencer/:influencerId",
  authorizeRoles(UserRole.Influencer),
  validate({ params: influencerIdParamSchema }),
  CampaignController.getByInfluencerId,
);

CampaignRouter.post(
  "/:campaignId/applications",
  authorizeRoles(UserRole.Influencer),
  validate({ params: campaignIdParamSchema }),
  CampaignController.joinCampaign,
);

CampaignRouter.delete(
  "/:campaignId/applications",
  authorizeRoles(UserRole.Influencer),
  validate({ params: campaignIdParamSchema }),
  CampaignController.leaveCampaign,
);

CampaignRouter.patch(
  "/:campaignId/influencer/status",
  authorizeRoles(UserRole.Brand),
  validate({ params: campaignIdParamSchema, body: changeInfluencerStatusDto }),
  CampaignController.changeInfluencerStatus,
);

CampaignRouter.patch(
  "/:campaignId",
  authorizeRoles(UserRole.Brand),
  validate({ params: campaignIdParamSchema, body: updateCampaignDto }),
  CampaignController.update,
);

CampaignRouter.delete(
  "/:campaignId",
  authorizeRoles(UserRole.Brand),
  validate({ params: campaignIdParamSchema }),
  CampaignController.delete,
);
