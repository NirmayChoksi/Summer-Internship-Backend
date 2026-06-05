import { Router } from "express";
import { validate } from "../../../shared/middlewares/validate.middleware.js";
import { brandIdParamSchema } from "../../../shared/utils/validator.js";
import { BrandProfileController } from "./brandProfile.controller.js";
import {
  createBrandProfileDto,
  updateBrandProfileDto,
} from "./brandProfile.dto.js";

export const BrandProfileRouter = Router();

BrandProfileRouter.post(
  "/",
  validate({ body: createBrandProfileDto }),
  BrandProfileController.create,
);

BrandProfileRouter.get("/user", BrandProfileController.getByUserId);

BrandProfileRouter.get(
  "/:brandId",
  validate({ params: brandIdParamSchema }),
  BrandProfileController.getById,
);

BrandProfileRouter.patch(
  "/:brandId",
  validate({ params: brandIdParamSchema, body: updateBrandProfileDto }),
  BrandProfileController.update,
);
