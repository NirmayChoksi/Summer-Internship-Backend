import { Router } from "express";
import { validate } from "../../../shared/middlewares/validate.middleware.js";
import { influencerIdParamSchema } from "../../../shared/utils/validator.js";
import { InfluencerProfileController } from "./influencerProfile.controller.js";
import {
  createInfluencerProfileDto,
  updateInfluencerProfileDto,
} from "./influencerProfile.dto.js";

export const InfluencerProfileRouter = Router();

InfluencerProfileRouter.post(
  "/",
  validate({ body: createInfluencerProfileDto }),
  InfluencerProfileController.create,
);

InfluencerProfileRouter.get("/user", InfluencerProfileController.getByUserId);

InfluencerProfileRouter.get(
  "/:influencerId",
  validate({ params: influencerIdParamSchema }),
  InfluencerProfileController.getById,
);

InfluencerProfileRouter.patch(
  "/refresh-instagram-followers",
  InfluencerProfileController.refreshInstagramFollowers,
);

InfluencerProfileRouter.patch(
  "/:influencerId",
  validate({
    params: influencerIdParamSchema,
    body: updateInfluencerProfileDto,
  }),
  InfluencerProfileController.update,
);
