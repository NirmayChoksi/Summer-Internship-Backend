import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../../../shared/utils/apiResponse.js";
import { ProfileIdParams, UserIdParams } from "../../../shared/utils/validator.js";
import { BrandProfileService } from "./brandProfile.service.js";

const brandProfileService = new BrandProfileService();

export const BrandProfileController = {
  create: async (
    req: Request<UserIdParams>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await brandProfileService.createBrandProfile(
        req.params.userId,
        req.body,
      );

      ApiResponse.created(res, result);
    } catch (error) {
      next(error);
    }
  },

  getById: async (
    req: Request<ProfileIdParams>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await brandProfileService.getBrandProfileById(
        req.params.profileId,
      );

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  getByUserId: async (
    req: Request<UserIdParams>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result =
        await brandProfileService.getBrandProfileByUserId(
          req.params.userId,
        );

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  update: async (
    req: Request<ProfileIdParams>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await brandProfileService.updateBrandProfile(
        req.params.profileId,
        req.body,
      );

      ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },
};
