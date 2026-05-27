import { Router } from "express";
import { validate } from "../../../shared/middlewares/validate.middleware.js";
import {
  profileIdParamSchema,
  userIdParamSchema,
} from "../../../shared/utils/validator.js";
import { InfluencerProfileController } from "./influencerProfile.controller.js";
import {
  createInfluencerProfileDto,
  updateInfluencerProfileDto,
} from "./influencerProfile.dto.js";

export const InfluencerProfileRouter = Router();

InfluencerProfileRouter.post(
  "/:userId",
  validate({ params: userIdParamSchema, body: createInfluencerProfileDto }),
  InfluencerProfileController.create,
);

InfluencerProfileRouter.get(
  "/:profileId",
  validate({ params: profileIdParamSchema }),
  InfluencerProfileController.getById,
);

InfluencerProfileRouter.get(
  "/user/:userId",
  validate({ params: userIdParamSchema }),
  InfluencerProfileController.getByUserId,
);

InfluencerProfileRouter.patch(
  "/:profileId",
  validate({
    params: profileIdParamSchema,
    body: updateInfluencerProfileDto,
  }),
  InfluencerProfileController.update,
);
