import { Router } from "express";
import { validate } from "../../../shared/middlewares/validate.middleware.js";
import {
  profileIdParamSchema,
  userIdParamSchema,
} from "../../../shared/utils/validator.js";
import { BrandProfileController } from "./brandProfile.controller.js";
import {
  createBrandProfileDto,
  updateBrandProfileDto,
} from "./brandProfile.dto.js";

export const BrandProfileRouter = Router();

BrandProfileRouter.post(
  "/:userId",
  validate({ params: userIdParamSchema, body: createBrandProfileDto }),
  BrandProfileController.create,
);

BrandProfileRouter.get(
  "/:profileId",
  validate({ params: profileIdParamSchema }),
  BrandProfileController.getById,
);

BrandProfileRouter.get(
  "/user/:userId",
  validate({ params: userIdParamSchema }),
  BrandProfileController.getByUserId,
);

BrandProfileRouter.patch(
  "/:profileId",
  validate({
    params: profileIdParamSchema,
    body: updateBrandProfileDto,
  }),
  BrandProfileController.update,
);
