import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../../../shared/utils/apiResponse.js";
import { BrandProfileService } from "./brandProfile.service.js";
import { BrandIdParam, UserIdParam } from "../../../shared/utils/validator.js";
import { CreateBrandProfileDto } from "./brandProfile.dto.js";

const brandProfileService = new BrandProfileService();

export const BrandProfileController = {
  create: async (
    req: Request<unknown, unknown, CreateBrandProfileDto>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await brandProfileService.createBrandProfile(
        req.user!.id,
        req.body,
      );

      ApiResponse.created(res, result);
    } catch (error) {
      next(error);
    }
  },

  getById: async (
    req: Request<BrandIdParam>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await brandProfileService.getBrandProfileById(
        req.params.brandId,
      );

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  getByUserId: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await brandProfileService.getBrandProfileByUserId(
        req.user!.id,
      );

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  update: async (
    req: Request<BrandIdParam>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await brandProfileService.updateBrandProfile(
        req.params.brandId,
        req.body,
      );

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },
};
